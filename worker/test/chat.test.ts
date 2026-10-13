import { env } from 'cloudflare:test';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_MODEL, MAX_OUTPUT_TOKENS } from '../src/routes/chat';
import { postJson } from './helpers';

afterEach(() => vi.restoreAllMocks());

/** A Workers AI binding stub that answers like an OpenAI-style chat completion. */
const aiStub = (text: string | null = 'Hello from Sofia') => {
  const run = vi.fn(async (_model: string, _input: unknown) => ({
    choices: [{ message: { content: text } }],
    usage: { prompt_tokens: 1000, completion_tokens: 200, total_tokens: 1200 },
  }));
  return { run, AI: { run } as unknown as Ai };
};
const failingAi = () =>
  ({
    run: vi.fn(async () => {
      throw new Error('3036: daily free allocation exceeded');
    }),
  }) as unknown as Ai;

describe('POST /api/chat', () => {
  it('400 when message is missing or too long', async () => {
    expect((await postJson('/api/chat', {})).status).toBe(400);
    const long = await postJson('/api/chat', { message: 'x'.repeat(1001) });
    expect(long.status).toBe(400);
    expect(((await long.json()) as { error: string }).error).toBe(
      'Message is too long. Please keep it under 1000 characters.'
    );
  });

  it('500 when the AI binding is missing', async () => {
    const res = await postJson('/api/chat', { message: 'Hi' }, {}, { AI: undefined });
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      response: '',
      error: 'Chat service is not configured. Please contact support.',
    });
  });

  it('runs the default model with the shared prompt and logs usage via waitUntil', async () => {
    const { run, AI } = aiStub();
    const history = [
      { role: 'user', parts: [{ text: 'Ciao' }] },
      { role: 'model', parts: [{ text: 'Ciao! Come posso aiutarti?' }] },
    ];
    const res = await postJson('/api/chat', { message: 'Hi', history, language: 'it' }, {}, { AI });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ response: 'Hello from Sofia' });
    const [model, input] = run.mock.calls[0] as unknown as [string, Record<string, unknown>];
    expect(model).toBe(DEFAULT_MODEL);
    expect(input.max_tokens).toBe(MAX_OUTPUT_TOKENS);
    const messages = input.messages as Array<{ role: string; content: string }>;
    // The clinic prompt is a real system message; Gemini's 'model' role becomes 'assistant'.
    expect(messages[0].role).toBe('system');
    expect(messages[0].content).toContain('You are Sofia');
    expect(messages[0].content).toContain('Italian (Italiano)');
    expect(messages.slice(1)).toEqual([
      { role: 'user', content: 'Ciao' },
      { role: 'assistant', content: 'Ciao! Come posso aiutarti?' },
      { role: 'user', content: 'Hi' },
    ]);
    const row = await env.DB.prepare('SELECT * FROM chat_usage ORDER BY id DESC LIMIT 1').first<
      Record<string, unknown>
    >();
    expect(row).toMatchObject({
      input_tokens: 1000,
      output_tokens: 200,
      total_tokens: 1200,
      language: 'it',
    });
    expect(row!.estimated_cost).toBeCloseTo(0.00016, 9);
  });

  it('AI_MODEL overrides the model', async () => {
    const { run, AI } = aiStub();
    await postJson(
      '/api/chat',
      { message: 'Hi' },
      {},
      { AI, AI_MODEL: '@cf/zai-org/glm-4.7-flash' }
    );
    expect(run.mock.calls[0]![0]).toBe('@cf/zai-org/glm-4.7-flash');
  });

  it('an unknown language falls back to English in the prompt', async () => {
    const { run, AI } = aiStub();
    await postJson('/api/chat', { message: 'Hi', language: 'xx' }, {}, { AI });
    const input = run.mock.calls[0][1] as unknown as { messages: Array<{ content: string }> };
    expect(input.messages[0].content).toContain('DEFAULT language is English');
  });

  it('maps a Workers AI error (e.g. free neurons used up) to 502 with the generic error', async () => {
    const res = await postJson('/api/chat', { message: 'Hi' }, {}, { AI: failingAi() });
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({
      response: '',
      error: 'Failed to get response from AI. Please try again.',
    });
  });

  it('500 on an empty answer', async () => {
    const { AI } = aiStub(null);
    expect((await postJson('/api/chat', { message: 'Hi' }, {}, { AI })).status).toBe(500);
  });

  it('daily cap: refuses with 429 once chat_usage reaches CHAT_DAILY_CAP today', async () => {
    const { run, AI } = aiStub();
    await env.DB.prepare(
      'INSERT INTO chat_usage (input_tokens, output_tokens, total_tokens) VALUES (1,1,2), (1,1,2)'
    ).run();
    const res = await postJson('/api/chat', { message: 'Hi' }, {}, { AI, CHAT_DAILY_CAP: '2' });
    expect(res.status).toBe(429);
    expect(run).not.toHaveBeenCalled();
  });

  it('rate limit: 16th message in a minute from one address is 429', async () => {
    const { AI } = aiStub();
    const s: number[] = [];
    for (let i = 0; i < 16; i++)
      s.push(
        (await postJson('/api/chat', { message: 'Hi' }, { ip: '203.0.113.9' }, { AI })).status
      );
    expect(s.slice(0, 15).every(x => x === 200)).toBe(true);
    expect(s[15]).toBe(429);
  });
});
