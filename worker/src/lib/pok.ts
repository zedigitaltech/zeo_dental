/**
 * POK (pokpay.io) client for deposit links, written against the official generated PHP SDK
 * (github.com/pokpay-ltd/php-sdk, API version 1.0.0). Anything the SDK does not show is marked
 * [verify]. Every call has a timeout; no key, secret, token or response body is ever logged.
 *
 *   POST /auth/sdk/login                     {keyId, keySecret} -> data.accessToken
 *   POST /merchants/{merchantId}/sdk-orders  CreateSdkOrderPayload -> data.sdkOrder
 *   GET  /sdk-orders/{sdkOrderId}            -> data.sdkOrder (the only source of "paid")
 */
import type { Env } from '../env';

export const POK_BASE_URLS = {
  production: 'https://api.pokpay.io',
  staging: 'https://api-staging.pokpay.io',
} as const;

/** The SDK's demo: "currently, we support only ALL and EUR". */
export const POK_CURRENCIES = ['EUR', 'ALL'] as const;

const TIMEOUT_MS = 10_000;
/** Tokens are reused only briefly, per isolate; a 401 forces a fresh login. */
const TOKEN_TTL_MS = 5 * 60_000;

export class PokError extends Error {
  constructor(
    readonly op: string,
    readonly status: number
  ) {
    super(`POK ${op} failed (HTTP ${status})`);
    this.name = 'PokError';
  }
}

export function pokBaseUrl(env: Env): string {
  return env.POK_ENV === 'production' ? POK_BASE_URLS.production : POK_BASE_URLS.staging;
}

export const pokConfigured = (env: Env): boolean =>
  Boolean(env.POK_KEY_ID && env.POK_KEY_SECRET && env.POK_MERCHANT_ID);

let cached: { key: string; token: string; until: number } | null = null;

/** Tests only. */
export function resetPokTokenCache(): void {
  cached = null;
}

async function request(
  op: string,
  url: string,
  init: RequestInit
): Promise<{ status: number; body: Record<string, unknown> | null }> {
  let res: Response;
  try {
    res = await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch {
    throw new PokError(op, 0); // network error or timeout
  }
  let body: Record<string, unknown> | null = null;
  try {
    const parsed: unknown = await res.json();
    if (parsed && typeof parsed === 'object') body = parsed as Record<string, unknown>;
  } catch {
    body = null;
  }
  return { status: res.status, body };
}

async function login(env: Env): Promise<string> {
  const key = `${pokBaseUrl(env)}|${env.POK_KEY_ID}`;
  if (cached && cached.key === key && cached.until > Date.now()) return cached.token;
  const { status, body } = await request('login', `${pokBaseUrl(env)}/auth/sdk/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ keyId: env.POK_KEY_ID, keySecret: env.POK_KEY_SECRET }),
  });
  const data = body?.data as Record<string, unknown> | undefined;
  const token = typeof data?.accessToken === 'string' ? data.accessToken : '';
  if (status !== 200 && status !== 201) throw new PokError('login', status);
  if (!token) throw new PokError('login', status);
  cached = { key, token, until: Date.now() + TOKEN_TTL_MS };
  return token;
}

/**
 * Authorized call. The SDK sends the raw access token as the Authorization header value, with no
 * "Bearer " prefix (Demo.php: setApiKey('Authorization', $token), no prefix set). [verify]
 */
async function authed(
  env: Env,
  op: string,
  path: string,
  init: RequestInit
): Promise<Record<string, unknown> | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const token = await login(env);
    const { status, body } = await request(op, `${pokBaseUrl(env)}${path}`, {
      ...init,
      headers: { ...(init.headers ?? {}), accept: 'application/json', authorization: token },
    });
    if (status === 401 && attempt === 0) {
      cached = null; // expired or revoked: log in again once
      continue;
    }
    if (status < 200 || status >= 300) throw new PokError(op, status);
    return body;
  }
  throw new PokError(op, 401);
}

export interface PokOrder {
  id: string;
  /** Major units (e.g. 100 = €100.00), as POK returns it. */
  amount: number;
  capturedAmount: number;
  /** Null when POK omits it: then the order is never treated as paid. */
  currencyCode: string | null;
  expiresAt: string | null;
  confirmUrl: string | null;
  merchantCustomReference: string | null;
}

const num = (v: unknown): number => {
  const n = typeof v === 'string' ? Number(v) : typeof v === 'number' ? v : NaN;
  return Number.isFinite(n) ? n : 0;
};

function toOrder(op: string, body: Record<string, unknown> | null): PokOrder {
  const data = body?.data as Record<string, unknown> | undefined;
  const o = data?.sdkOrder as Record<string, unknown> | undefined;
  if (!o || typeof o.id !== 'string' || !o.id) throw new PokError(op, 200);
  const self = o.self as Record<string, unknown> | undefined;
  return {
    id: o.id,
    amount: num(o.amount),
    capturedAmount: num(o.capturedAmount),
    currencyCode: typeof o.currencyCode === 'string' && o.currencyCode ? o.currencyCode : null,
    expiresAt: typeof o.expiresAt === 'string' ? o.expiresAt : null,
    confirmUrl: typeof self?.confirmUrl === 'string' ? self.confirmUrl : null,
    merchantCustomReference:
      typeof o.merchantCustomReference === 'string' ? o.merchantCustomReference : null,
  };
}

export interface CreateOrderInput {
  amountCents: number;
  currency: string;
  description: string;
  reference: string;
  webhookUrl: string;
  redirectUrl: string;
  failRedirectUrl: string;
  expiresAfterMinutes: number;
}

/** The exact CreateSdkOrderPayload we send (exported so tests can assert on it). */
export function createOrderPayload(input: CreateOrderInput): Record<string, unknown> {
  return {
    amount: (input.amountCents / 100).toFixed(2),
    currencyCode: input.currency,
    autoCapture: true,
    // The SDK demo sends an empty list and the amount ("if products array is empty this is required").
    products: [],
    webhookUrl: input.webhookUrl,
    redirectUrl: input.redirectUrl,
    failRedirectUrl: input.failRedirectUrl,
    merchantCustomReference: input.reference,
    description: input.description,
    expiresAfterMinutes: input.expiresAfterMinutes,
  };
}

export async function createPokOrder(env: Env, input: CreateOrderInput): Promise<PokOrder> {
  const body = await authed(
    env,
    'create order',
    `/merchants/${encodeURIComponent(env.POK_MERCHANT_ID ?? '')}/sdk-orders`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(createOrderPayload(input)),
    }
  );
  const order = toOrder('create order', body);
  if (!order.confirmUrl) throw new PokError('create order', 200);
  return order;
}

/** The SDK marks this call "No authorization required"; we send the token anyway. [verify] */
export async function getPokOrder(env: Env, orderId: string): Promise<PokOrder> {
  const body = await authed(env, 'get order', `/sdk-orders/${encodeURIComponent(orderId)}`, {
    method: 'GET',
  });
  return toOrder('get order', body);
}

/** What we expect a paid order to be: our deposit's own record. */
export interface ExpectedOrder {
  id: string;
  provider_order_id?: string | null;
  amount_cents: number;
  currency: string;
}

/**
 * Paid = POK's order is the one we created for this deposit (same order id; same reference when POK
 * echoes it), for exactly our amount and currency, with the full amount captured. SdkOrder has no
 * status field in the SDK, so capturedAmount >= amount is the rule. [verify]
 */
export function isPaidOrder(order: PokOrder, d: ExpectedOrder): boolean {
  if (!d.provider_order_id || order.id !== d.provider_order_id) return false;
  if (order.merchantCustomReference !== null && order.merchantCustomReference !== d.id)
    return false;
  if (!order.currencyCode || order.currencyCode.toUpperCase() !== d.currency.toUpperCase())
    return false;
  if (Math.round(order.amount * 100) !== d.amount_cents) return false;
  return Math.round(order.capturedAmount * 100) >= d.amount_cents;
}
