import type { Env } from '../env';
import { clientIp, safeEqual } from './http';
import { hit, peek, ruleFor } from './ratelimit';

export const MIN_TOKEN_LENGTH = 32;

export type TokenName = 'ADMIN_TOKEN' | 'SHEETS_EXPORT_TOKEN';

export type AuthResult =
  | { ok: true }
  | { ok: false; status: 401 | 429 | 500 | 503; message: string };

/**
 * Shared check for every bearer route and the login:
 *  - token unset → 503; token shorter than 32 characters → 500 (logged, never echoed);
 *  - the address already has 10 failures in 15 minutes → 429, even with the right secret;
 *  - wrong secret → counted as a failure, 401.
 */
export async function checkSecret(
  env: Env,
  req: Request,
  name: TokenName,
  given: string | null
): Promise<AuthResult> {
  const token = env[name];
  if (!token) return { ok: false, status: 503, message: 'Admin access not configured' };
  if (token.length < MIN_TOKEN_LENGTH) {
    console.error(
      `${name} is shorter than ${MIN_TOKEN_LENGTH} characters; refusing to authenticate`
    );
    return { ok: false, status: 500, message: 'Server misconfigured' };
  }
  const ip = clientIp(req);
  if ((await peek(env, 'adminfail', ip)) >= ruleFor(env, 'adminfail').limit) {
    return { ok: false, status: 429, message: 'Too many failed attempts. Try again later.' };
  }
  if (given && safeEqual(given, token)) return { ok: true };
  await hit(env, 'adminfail', ip);
  return { ok: false, status: 401, message: 'Unauthorized' };
}
