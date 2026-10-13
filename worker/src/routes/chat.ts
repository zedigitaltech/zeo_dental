import { Hono } from 'hono';
import { SYSTEM_INSTRUCTION, getLanguageInstruction } from '../../../server/src/utils/chatPrompt';
import type { AppEnv } from '../env';
import { clientIp, errMsg, readJson } from '../lib/http';
import { allow } from '../lib/ratelimit';

const VALID_LANGUAGES = ['sq', 'en', 'it', 'de', 'fr', 'tr', 'el', 'es'];

/**
 * Workers AI, no API key: the free plan includes 10,000 neurons a day for the whole account.
 * Gemma 4 is on the free plan and costs 9,091 neurons per M input and 27,273 per M output tokens.
 * AI_MODEL overrides it.
 */
export const DEFAULT_MODEL = '@cf/google/gemma-4-26b-a4b-it';
const PRICE_IN = 0.1; // USD per M input tokens (Gemma 4 on Workers AI)
const PRICE_OUT = 0.3; // USD per M output tokens
export const MAX_OUTPUT_TOKENS = 700;

interface AiChatResult {
  choices?: Array<{
    message?: { content?: string | null; reasoning_content?: string | null };
    finish_reason?: string;
  }>;
  response?: string;
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
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

  if (!env.AI) {
    console.error('AI binding not configured');
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
    const messages = [
      {
        role: 'system',
        content: `${SYSTEM_INSTRUCTION}\n\n${getLanguageInstruction(safeLang)}`,
      },
      ...history.map(t => ({
        role: t.role === 'model' ? 'assistant' : 'user',
        content: t.parts.map(p => p.text).join('\n'),
      })),
      { role: 'user', content: message },
    ];
    const data = (await env.AI.run(
      (env.AI_MODEL || DEFAULT_MODEL) as Parameters<Ai['run']>[0],
      {
        messages,
        max_tokens: MAX_OUTPUT_TOKENS,
        temperature: 0.5,
        top_p: 0.95,
        // Gemma 4 thinks by default and spent all 700 tokens on it, answering nothing.
        chat_template_kwargs: { enable_thinking: false },
      } as never
    )) as AiChatResult;

    const aiResponse = (data?.choices?.[0]?.message?.content ?? data?.response ?? '').trim();
    if (!aiResponse) {
      const ch = data?.choices?.[0];
      // Shape only, never the text: why the answer came back empty.
      console.error(
        `Empty response from Workers AI: finish=${ch?.finish_reason} reasoning=${ch?.message?.reasoning_content?.length ?? 0} usage=${JSON.stringify(data?.usage ?? {})}`
      );
      return c.json(
        { response: '', error: 'Received empty response from AI. Please try again.' },
        500
      );
    }

    const input = data.usage?.prompt_tokens ?? 0;
    const output = data.usage?.completion_tokens ?? 0;
    c.executionCtx.waitUntil(
      env.DB.prepare(
        `INSERT INTO chat_usage (input_tokens, output_tokens, total_tokens, estimated_cost, language) VALUES (?, ?, ?, ?, ?)`
      )
        .bind(
          input,
          output,
          data.usage?.total_tokens ?? input + output,
          (input * PRICE_IN + output * PRICE_OUT) / 1_000_000,
          language.slice(0, 5)
        )
        .run()
        .catch(err => console.error(`Failed to log chat usage: ${errMsg(err)}`))
    );

    return c.json({ response: aiResponse });
  } catch (err) {
    console.error(`Chat error: ${errMsg(err)}`);
    return c.json(
      { response: '', error: 'Failed to get response from AI. Please try again.' },
      502
    );
  }
});
