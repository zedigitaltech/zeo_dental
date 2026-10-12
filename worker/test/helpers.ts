import { createExecutionContext, env, waitOnExecutionContext } from 'cloudflare:test';
import { vi } from 'vitest';
import worker from '../src/index';
import type { Env } from '../src/env';
import template from './fixtures/index.html?raw';

export { template };
export const ADMIN = { authorization: 'Bearer test-admin-token-0123456789abcdef0123' };
export const EXPORT = { authorization: 'Bearer test-export-token-0123456789abcdef012' };

/** Static-assets stub: serves the fixture template for "/" and "/index.html", 404 otherwise. */
export const assetsStub = {
  fetch: async (input: RequestInfo | URL) => {
    const p = new URL(typeof input === 'string' || input instanceof URL ? input : input.url)
      .pathname;
    return p === '/' || p === '/index.html'
      ? new Response(template, { headers: { 'content-type': 'text/html' } })
      : new Response('not found', { status: 404 });
  },
} as unknown as Fetcher;

export function testEnv(over: Partial<Env> = {}): Env {
  return { ...(env as unknown as Env), ASSETS: assetsStub, ...over };
}

let ipCounter = 0;
/** A fresh visitor address per call unless one is given, so rate limits never leak across tests. */
export async function call(
  path: string,
  init: RequestInit & { cf?: Record<string, unknown>; ip?: string } = {},
  over: Partial<Env> = {}
): Promise<Response> {
  const headers = new Headers(init.headers);
  if (!headers.has('cf-connecting-ip'))
    headers.set('cf-connecting-ip', init.ip ?? `198.51.100.${++ipCounter % 250}`);
  const req = new Request(`https://zeodentalclinic.com${path}`, {
    ...init,
    headers,
    redirect: 'manual',
  } as RequestInit);
  const ctx = createExecutionContext();
  const res = await worker.fetch(req, testEnv(over), ctx);
  await waitOnExecutionContext(ctx);
  return res;
}

export const postJson = (
  path: string,
  body: unknown,
  extra: RequestInit & { ip?: string } = {},
  over: Partial<Env> = {}
) =>
  call(
    path,
    {
      ...extra,
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'content-type': 'application/json', ...(extra.headers ?? {}) },
    },
    over
  );

export const patchJson = (path: string, body: unknown, headers: Record<string, string> = ADMIN) =>
  call(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json', ...headers },
  });

export const futureDay = (days = 30) =>
  new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
export const pastDay = (days = 3) =>
  new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);

/** Every outbound fetch (Gemini, Resend, WhatsApp) goes through this spy. */
export function mockFetch(
  handler: (url: string, init?: RequestInit) => Response | Promise<Response>
) {
  return vi
    .spyOn(globalThis, 'fetch')
    .mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      return handler(url, init);
    });
}

let seq = 0;
/** Insert a synthetic booking directly (fake data only). */
export async function seedBooking(o: Record<string, unknown> = {}): Promise<string> {
  const id = (o.id as string) ?? crypto.randomUUID();
  const n = ++seq;
  const row = {
    id,
    name: `Prova ${n}`,
    email: `prova${n}@example.invalid`,
    phone: `+39 333 000 ${String(1000 + n).slice(-4)}`,
    service: 'General Consultation',
    preferred_date: null,
    preferred_time: null,
    status: 'pending',
    description: null,
    notes: null,
    confirmed_date: null,
    confirmed_time: null,
    created_at: new Date(Date.now() - (1000 - n) * 1000).toISOString(),
    deleted_at: null,
    ...o,
  } as Record<string, unknown>;
  row.updated_at = (o.updated_at as string) ?? row.created_at;
  const cols = Object.keys(row);
  await env.DB.prepare(
    `INSERT INTO bookings (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`
  )
    .bind(...cols.map(c => row[c] ?? null))
    .run();
  return id;
}

/** Serialised like a browser does it: multipart body with a Content-Length. */
export async function multipart(
  fd: FormData
): Promise<{ body: ArrayBuffer; headers: Record<string, string> }> {
  const r = new Response(fd);
  const body = await r.arrayBuffer();
  return {
    body,
    headers: {
      'content-type': r.headers.get('content-type')!,
      'content-length': String(body.byteLength),
    },
  };
}
