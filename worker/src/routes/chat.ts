import { Hono } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import {
  GEMINI_API_URL,
  SYSTEM_INSTRUCTION,
  calculateCost,
  getInitialGreeting,
  getLanguageInstruction,
} from '../../../server/src/utils/chatPrompt';
import type { GeminiResponse } from '../../../server/src/utils/chatPrompt';
import type { AppEnv, Env } from '../env';
import { clientIp, errMsg, readJson } from '../lib/http';
import { allow } from '../lib/ratelimit';

const VALID_LANGUAGES = ['sq', 'en', 'it', 'de', 'fr', 'tr', 'el', 'es'];

/** Same model as Fly unless GEMINI_MODEL is set (gemini-2.0-flash may be retired [verify]). */
const modelUrl = (env: Env) =>
  env.GEMINI_MODEL
    ? `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent`
    : GEMINI_API_URL;

/** Retry with exponential backoff on 5xx / network errors (1 s, 2 s), like the Fastify route. */
async function fetchWithRetry(url: string, init: RequestInit, maxRetries = 3): Promise<Response> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(url, init);
      if (res.ok || res.status < 500) return res;
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
    if (attempt < maxRetries - 1) await new Promise(r => setTimeout(r, 2 ** attempt * 1000));
  }
  throw lastError ?? new Error('Max retries exceeded');
}

async function usedToday(db: D1Database): Promise<number> {
  const row = await db
    .prepare(`SELECT COUNT(*) AS n FROM chat_usage WHERE created_at >= ? AND deleted_at IS NULL`)
    .bind(new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z')
    .first<{ n: number }>();
  return row?.n ?? 0;
}

export const chat = new Hono<AppEnv>();

chat.post('/api/chat', async c => {
  const env = c.env;
  if (!(await allow(env, 'chat', clientIp(c.req.raw)))) {
    return c.json({ response: '', error: 'Too many requests. Please try again in a minute.' }, 429);
  }

  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY not configured');
    return c.json(
      { response: '', error: 'Chat service is not configured. Please contact support.' },
      500
    );
  }

  const body = await readJson(c.req.raw);
  const message = body.message;
  const history = Array.isArray(body.history) ? body.history : [];
  const language = typeof body.language === 'string' ? body.language : 'sq';
  const safeLang = VALID_LANGUAGES.includes(language) ? language : 'en';

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return c.json({ response: '', error: 'Message is required' }, 400);
  }
  if (message.length > 5000) {
    return c.json(
      { response: '', error: 'Message is too long. Please keep it under 5000 characters.' },
      400
    );
  }

  const cap = Number(env.CHAT_DAILY_CAP ?? '0');
  if (cap > 0 && (await usedToday(env.DB)) >= cap) {
    console.warn('Chat daily cap reached');
    return c.json(
      {
        response: '',
        error: 'The assistant is busy today. Please contact us on WhatsApp: +355 68 400 4840.',
      },
      429
    );
  }

  const contents = [
    {
      role: 'user',
      parts: [{ text: `System: ${SYSTEM_INSTRUCTION}\n\n${getLanguageInstruction(safeLang)}` }],
    },
    { role: 'model', parts: [{ text: getInitialGreeting(safeLang) }] },
    ...history,
    { role: 'user', parts: [{ text: message }] },
  ];

  try {
    const response = await fetchWithRetry(`${modelUrl(env)}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: { temperature: 0.5, topK: 40, topP: 0.95, maxOutputTokens: 2048 },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      }),
    });

    if (!response.ok) {
      console.error(`Gemini API error: ${response.status}`);
      return c.json(
        { response: '', error: 'Failed to get response from AI. Please try again.' },
        response.status as ContentfulStatusCode
      );
    }

    const data = (await response.json()) as GeminiResponse;
    const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!aiResponse) {
      console.error('Empty response from Gemini API');
      return c.json(
        { response: '', error: 'Received empty response from AI. Please try again.' },
        500
      );
    }

    if (data.usageMetadata) {
      const {
        promptTokenCount = 0,
        candidatesTokenCount = 0,
        totalTokenCount = 0,
      } = data.usageMetadata;
      c.executionCtx.waitUntil(
        env.DB.prepare(
          `INSERT INTO chat_usage (input_tokens, output_tokens, total_tokens, estimated_cost, language) VALUES (?, ?, ?, ?, ?)`
        )
          .bind(
            promptTokenCount,
            candidatesTokenCount,
            totalTokenCount,
            calculateCost(promptTokenCount, candidatesTokenCount),
            language.slice(0, 5)
          )
          .run()
          .catch(err => console.error(`Failed to log chat usage: ${errMsg(err)}`))
      );
    }

    return c.json({ response: aiResponse });
  } catch (err) {
    console.error(`Chat error: ${errMsg(err)}`);
    return c.json({ response: '', error: 'An error occurred. Please try again later.' }, 500);
  }
});
