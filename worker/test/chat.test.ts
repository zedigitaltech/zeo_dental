import { env } from 'cloudflare:test';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mockFetch, postJson } from './helpers';

afterEach(() => vi.restoreAllMocks());

const gemini = (text = 'Hello from Gemini') =>
  mockFetch(
    () =>
      new Response(
        JSON.stringify({
          candidates: [{ content: { parts: [{ text }] } }],
          usageMetadata: {
            promptTokenCount: 1000,
            candidatesTokenCount: 200,
            totalTokenCount: 1200,
          },
        }),
        { status: 200 }
      )
  );

describe('POST /api/chat', () => {
  it('400 when message is missing or too long', async () => {
    expect((await postJson('/api/chat', {})).status).toBe(400);
    const long = await postJson('/api/chat', { message: 'x'.repeat(1001) });
    expect(long.status).toBe(400);
    expect(((await long.json()) as { error: string }).error).toBe(
      'Message is too long. Please keep it under 1000 characters.'
    );
  });

  it('500 when GEMINI_API_KEY is missing', async () => {
    const res = await postJson('/api/chat', { message: 'Hi' }, {}, { GEMINI_API_KEY: undefined });
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      response: '',
      error: 'Chat service is not configured. Please contact support.',
    });
  });

  it('proxies to Gemini with the shared prompt and logs usage via waitUntil', async () => {
    const f = gemini();
    const res = await postJson('/api/chat', { message: 'Hi', history: [], language: 'it' });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ response: 'Hello from Gemini' });
    const [url, init] = f.mock.calls[0];
    // Key in a header, never in the URL (URLs end up in logs).
    expect(String(url)).toBe(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
    );
    expect(new Headers((init as RequestInit).headers).get('x-goog-api-key')).toBe(
      'test-gemini-key'
    );
    const sent = JSON.parse(String((init as RequestInit).body));
    // The clinic prompt is a real system instruction, not a fake user turn.
    expect(sent.systemInstruction.parts[0].text).toContain('You are Sofia');
    expect(sent.systemInstruction.parts[0].text).toContain('Italian (Italiano)');
    expect(sent.contents).toEqual([{ role: 'user', parts: [{ text: 'Hi' }] }]);
    const row = await env.DB.prepare('SELECT * FROM chat_usage ORDER BY id DESC LIMIT 1').first<
      Record<string, unknown>
    >();
    expect(row).toMatchObject({
      input_tokens: 1000,
      output_tokens: 200,
      total_tokens: 1200,
      language: 'it',
    });
    expect(row!.estimated_cost).toBeCloseTo(0.000135, 9);
  });

  it('an unknown language falls back to English in the prompt', async () => {
    const f = gemini();
    await postJson('/api/chat', { message: 'Hi', language: 'xx' });
    expect(
      JSON.parse(String((f.mock.calls[0][1] as RequestInit).body)).systemInstruction.parts[0].text
    ).toContain('DEFAULT language is English');
  });

  it('maps an upstream Gemini error to 502 with the generic error', async () => {
    mockFetch(() => new Response('bad', { status: 429 }));
    const res = await postJson('/api/chat', { message: 'Hi' });
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({
      response: '',
      error: 'Failed to get response from AI. Please try again.',
    });
  });

  it('500 on an empty Gemini answer', async () => {
    mockFetch(() => new Response(JSON.stringify({ candidates: [] }), { status: 200 }));
    expect((await postJson('/api/chat', { message: 'Hi' })).status).toBe(500);
  });

  it('daily cap: refuses with 429 once chat_usage reaches CHAT_DAILY_CAP today', async () => {
    const f = gemini();
    await env.DB.prepare(
      'INSERT INTO chat_usage (input_tokens, output_tokens, total_tokens) VALUES (1,1,2), (1,1,2)'
    ).run();
    const res = await postJson('/api/chat', { message: 'Hi' }, {}, { CHAT_DAILY_CAP: '2' });
    expect(res.status).toBe(429);
    expect(f).not.toHaveBeenCalled();
  });

  it('rate limit: 16th message in a minute from one address is 429', async () => {
    gemini();
    const s: number[] = [];
    for (let i = 0; i < 16; i++)
      s.push((await postJson('/api/chat', { message: 'Hi' }, { ip: '203.0.113.9' })).status);
    expect(s.slice(0, 15).every(x => x === 200)).toBe(true);
    expect(s[15]).toBe(429);
  });
});
