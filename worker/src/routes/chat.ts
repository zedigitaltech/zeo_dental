import { Hono } from 'hono';
import {
  GEMINI_API_URL,
  SYSTEM_INSTRUCTION,
  calculateCost,
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

export const MAX_MESSAGE = 1000;
export const MAX_HISTORY_ITEMS = 20;
export const MAX_HISTORY_PART = 4000; // a model answer (≤2048 output tokens) can exceed 1000 chars
export const MAX_TOTAL_CHARS = 8000;

interface Turn {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

/**
 * Only {role: 'user'|'model', parts: [{text: string}]} turns, at most 20; user turns ≤1000 chars,
 * model turns ≤4000. Returns null when anything else is present (the request is refused).
 */
export function validateHistory(raw: unknown): Turn[] | null {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw) || raw.length > MAX_HISTORY_ITEMS) return null;
  const out: Turn[] = [];
  for (const t of raw) {
    if (!t || typeof t !== 'object') return null;
    const { role, parts } = t as Record<string, unknown>;
    if (role !== 'user' && role !== 'model') return null;
    if (!Array.isArray(parts) || parts.length === 0 || parts.length > 4) return null;
    const clean: Array<{ text: string }> = [];
    for (const p of parts) {
      if (!p || typeof p !== 'object' || Object.keys(p).length !== 1) return null;
      const text = (p as Record<string, unknown>).text;
      if (typeof text !== 'string') return null;
      if (text.length > (role === 'user' ? MAX_MESSAGE : MAX_HISTORY_PART)) return null;
      clean.push({ text });
    }
    out.push({ role, parts: clean });
  }
  return out;
}

const turnLength = (t: Turn) => t.parts.reduce((n, p) => n + p.text.length, 0);

/** Drop the oldest turns until history + message fit MAX_TOTAL_CHARS; start on a user turn. */
export function fitHistory(history: Turn[], messageLength: number): Turn[] {
  let h = history;
  let total = h.reduce((n, t) => n + turnLength(t), 0) + messageLength;
  while (h.length > 0 && (total > MAX_TOTAL_CHARS || h[0].role !== 'user')) {
    total -= turnLength(h[0]);
    h = h.slice(1);
  }
  return h;
}

export const chat = new Hono<AppEnv>();

const busy = { response: '', error: 'Too many requests. Please try again in a minute.' };

chat.post('/api/chat', async c => {
  const env = c.env;
  const ip = clientIp(c.req.raw);
  if (!(await allow(env, 'chat', ip))) return c.json(busy, 429);

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
  const language = typeof body.language === 'string' ? body.language : 'sq';
  const safeLang = VALID_LANGUAGES.includes(language) ? language : 'en';

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return c.json({ response: '', error: 'Message is required' }, 400);
  }
  if (message.length > MAX_MESSAGE) {
    return c.json(
      {
        response: '',
        error: `Message is too long. Please keep it under ${MAX_MESSAGE} characters.`,
      },
      400
    );
  }
  const validHistory = validateHistory(body.history);
  if (!validHistory) return c.json({ response: '', error: 'Invalid conversation history' }, 400);
  const history = fitHistory(validHistory, message.length);

  const cap = Number(env.CHAT_DAILY_CAP ?? '0');
  if (cap > 0 && (await usedToday(env.DB)) >= cap) {
    console.warn(`Chat global daily cap reached (${cap}); refusing chat until 00:00 UTC`);
    return c.json(
      {
        response: '',
        error: 'The assistant is busy today. Please contact us on WhatsApp: +355 68 400 4840.',
      },
      429
    );
  }
  if (!(await allow(env, 'chatday', ip))) {
    return c.json(
      {
        response: '',
        error: 'Daily message limit reached. Please contact us on WhatsApp: +355 68 400 4840.',
      },
      429
    );
  }

  try {
    const response = await fetchWithRetry(modelUrl(env), {
      method: 'POST',
      // The key goes in a header: URLs end up in logs.
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: `${SYSTEM_INSTRUCTION}\n\n${getLanguageInstruction(safeLang)}` }],
        },
        contents: [...history, { role: 'user', parts: [{ text: message }] }],
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
        502
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
    return c.json(
      { response: '', error: 'Failed to get response from AI. Please try again.' },
      502
    );
  }
});
