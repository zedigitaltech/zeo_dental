import type { Env } from '../env';

/**
 * The exact security headers the Fastify app (helmet) sends on Fly, captured 2026-10-12
 * (test/fixtures/fly-headers.txt). Worker responses get them here; static assets get the same
 * set from public/_headers, because Cloudflare does not apply _headers to Worker responses.
 * test/headers.test.ts keeps all three in sync.
 */
export const CSP =
  "default-src 'self';" +
  "script-src 'self' https://static.elfsight.com https://elfsightcdn.com https://*.elfsightcdn.com;" +
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.elfsightcdn.com;" +
  "font-src 'self' https://fonts.gstatic.com data:;" +
  "img-src 'self' data: https://images.unsplash.com https://*.pexels.com https://i.pinimg.com https://img.youtube.com https://i.ytimg.com https://*.elfsightcdn.com;" +
  "media-src 'self' https://videos.pexels.com https://cdn.pixabay.com;" +
  "connect-src 'self' https://generativelanguage.googleapis.com https://*.elfsight.com https://*.elfsightcdn.com;" +
  "frame-src 'self' https://www.google.com https://www.youtube.com https://www.youtube-nocookie.com;" +
  "object-src 'none';" +
  'upgrade-insecure-requests;' +
  "base-uri 'self';" +
  "form-action 'self';" +
  "frame-ancestors 'self';" +
  "script-src-attr 'none'";

export const HARDENING: Readonly<Record<string, string>> = {
  'content-security-policy': CSP,
  'cross-origin-opener-policy': 'same-origin',
  'cross-origin-resource-policy': 'cross-origin',
  'origin-agent-cluster': '?1',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'strict-transport-security': 'max-age=15552000; includeSubDomains',
  'x-content-type-options': 'nosniff',
  'x-dns-prefetch-control': 'off',
  'x-download-options': 'noopen',
  'x-frame-options': 'SAMEORIGIN',
  'x-permitted-cross-domain-policies': 'none',
  'x-xss-protection': '0',
};

/** Copy HARDENING onto a response (re-wrapping it if its headers are immutable). */
export function harden(res: Response): Response {
  let out = res;
  try {
    for (const [k, v] of Object.entries(HARDENING)) out.headers.set(k, v);
  } catch {
    out = new Response(res.body, res);
    for (const [k, v] of Object.entries(HARDENING)) out.headers.set(k, v);
  }
  return out;
}

/** Same allow-list as the Fastify CORS plugin: production origins only; any origin outside production. */
export function corsHeaders(env: Env, origin: string | null): Record<string, string> {
  const headers: Record<string, string> = { vary: 'Origin' };
  if (!origin) return headers;
  const allowed =
    env.ZEO_ENV !== 'production' ||
    (env.CORS_ORIGINS ?? '')
      .split(',')
      .map(o => o.trim())
      .filter(Boolean)
      .includes(origin);
  if (allowed) headers['access-control-allow-origin'] = origin;
  return headers;
}

export const PREFLIGHT_HEADERS = {
  'access-control-allow-methods': 'GET,POST,PATCH,OPTIONS',
  'access-control-allow-headers': 'Content-Type, Authorization',
};

/** The visitor's address as Cloudflare sees it. Never logged. */
export function clientIp(req: Request): string {
  return req.headers.get('cf-connecting-ip') ?? '0.0.0.0';
}

/** Length-independent comparison for bearer tokens and the login password. */
export function safeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const x = enc.encode(a);
  const y = enc.encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

export function bearer(req: Request): string | null {
  const h = req.headers.get('authorization');
  return h && h.startsWith('Bearer ') ? h.slice(7) : null;
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json();
    return body && typeof body === 'object' && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

export const str = (v: unknown): string | undefined => (typeof v === 'string' ? v : undefined);

export const errMsg = (err: unknown): string => (err instanceof Error ? err.message : String(err));
