import type { Env } from '../env';

export type Bucket = 'chat' | 'booking';

/** Same budgets as Fastify: chat 15/min, booking + upload 10/min, per visitor address. */
export const LIMITS: Record<Bucket, number> = { chat: 15, booking: 10 };

async function sha256Hex(s: string): Promise<string> {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map(x => x.toString(16).padStart(2, '0')).join('');
}

/**
 * True when the request may proceed. Uses the Workers Rate Limiting binding when it is bound
 * (counts per Cloudflare location); otherwise a D1 counter per minute keyed by
 * sha256(salt · UTC day · bucket · ip), so the table holds no address and days cannot be joined.
 */
export async function allow(env: Env, bucket: Bucket, ip: string): Promise<boolean> {
  const binding = bucket === 'chat' ? env.CHAT_LIMITER : env.BOOKING_LIMITER;
  if (binding) {
    const { success } = await binding.limit({ key: `${bucket}:${ip}` });
    return success;
  }
  const day = new Date().toISOString().slice(0, 10);
  const key = await sha256Hex(`${env.RATE_LIMIT_SALT ?? ''}|${day}|${bucket}|${ip}`);
  const windowStart = Math.floor(Date.now() / 60_000);
  const row = await env.DB.prepare(
    `INSERT INTO rate_limits (key, window_start, count) VALUES (?, ?, 1)
     ON CONFLICT (key, window_start) DO UPDATE SET count = count + 1
     RETURNING count`
  )
    .bind(key, windowStart)
    .first<{ count: number }>();
  return (row?.count ?? 1) <= LIMITS[bucket];
}
