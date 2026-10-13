import type { Env } from '../env';

export type Bucket = 'chat' | 'booking' | 'chatday' | 'adminfail' | 'deposit' | 'paywebhook';

interface Rule {
  limit: number;
  windowMs: number;
}

/**
 * chat 15/min and booking + upload 10/min per address (as on Fly); chatday = messages per address
 * per UTC day (CHAT_DAILY_PER_IP, default 40); adminfail = failed bearer/login attempts per address
 * per 15 minutes before the address is locked out; deposit = deposit links created per address per
 * minute (a call centre shares one address); paywebhook = calls to the POK webhook per address per minute.
 */
export function ruleFor(env: Env, bucket: Bucket): Rule {
  switch (bucket) {
    case 'chat':
      return { limit: 15, windowMs: 60_000 };
    case 'booking':
      return { limit: 10, windowMs: 60_000 };
    case 'chatday':
      return { limit: Number(env.CHAT_DAILY_PER_IP ?? '40') || 40, windowMs: 86_400_000 };
    case 'adminfail':
      return { limit: 10, windowMs: 15 * 60_000 };
    case 'deposit':
      return { limit: 20, windowMs: 60_000 };
    case 'paywebhook':
      return { limit: 60, windowMs: 60_000 };
  }
}

export const RING_SIZE = 4096;

async function sha256Hex(s: string): Promise<string> {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map(x => x.toString(16).padStart(2, '0')).join('');
}

/** '<bucket>:<0..4095>' — the address only enters a salted hash, reduced to 12 bits. */
export async function slotFor(env: Env, bucket: Bucket, ip: string): Promise<string> {
  const h = await sha256Hex(`${env.RATE_LIMIT_SALT ?? ''}|${ip}`);
  return `${bucket}:${parseInt(h.slice(0, 8), 16) % RING_SIZE}`;
}

const windowOf = (env: Env, bucket: Bucket, now: number) =>
  Math.floor(now / ruleFor(env, bucket).windowMs);

/** Count this request; returns the count in the current window. Stale windows restart at 1 in place. */
export async function hit(env: Env, bucket: Bucket, ip: string, now = Date.now()): Promise<number> {
  const row = await env.DB.prepare(
    `INSERT INTO rate_limits (slot, window_start, count) VALUES (?, ?, 1)
     ON CONFLICT (slot) DO UPDATE SET
       count = CASE WHEN rate_limits.window_start = excluded.window_start THEN rate_limits.count + 1 ELSE 1 END,
       window_start = excluded.window_start
     RETURNING count`
  )
    .bind(await slotFor(env, bucket, ip), windowOf(env, bucket, now))
    .first<{ count: number }>();
  return row?.count ?? 1;
}

/** Count in the current window without adding to it. */
export async function peek(
  env: Env,
  bucket: Bucket,
  ip: string,
  now = Date.now()
): Promise<number> {
  const row = await env.DB.prepare(
    'SELECT count FROM rate_limits WHERE slot = ? AND window_start = ?'
  )
    .bind(await slotFor(env, bucket, ip), windowOf(env, bucket, now))
    .first<{ count: number }>();
  return row?.count ?? 0;
}

/**
 * True when the request may proceed. chat/booking use the Workers Rate Limiting binding when it
 * is bound (counts per Cloudflare location); everything else, and the fallback, is the D1 ring.
 */
export async function allow(env: Env, bucket: Bucket, ip: string): Promise<boolean> {
  const binding =
    bucket === 'chat' ? env.CHAT_LIMITER : bucket === 'booking' ? env.BOOKING_LIMITER : undefined;
  if (binding) {
    const { success } = await binding.limit({ key: `${bucket}:${ip}` });
    return success;
  }
  return (await hit(env, bucket, ip)) <= ruleFor(env, bucket).limit;
}
