/** Bindings, vars and secrets. Secrets are set with `wrangler secret put` (DEPLOY.md §2). */
export interface Env {
  DB: D1Database;
  UPLOADS: R2Bucket;
  /** Static assets (the Vite build). Tests inject a stub. */
  ASSETS?: Fetcher;
  /** Workers Rate Limiting bindings. Absent → D1 fallback (lib/ratelimit.ts). */
  CHAT_LIMITER?: RateLimit;
  BOOKING_LIMITER?: RateLimit;
  /** Workers AI (the chatbot). No key: billed in neurons, 10k/day free. */
  AI?: Ai;

  ZEO_ENV?: string;
  BASE_URL?: string;
  CORS_ORIGINS?: string;
  CHAT_DAILY_CAP?: string;
  CHAT_DAILY_PER_IP?: string;
  AI_MODEL?: string;

  RESEND_API_KEY?: string;
  MAIL_FROM?: string;
  MAIL_TO?: string;
  MAIL_TO_PARTNER?: string;
  ADMIN_TOKEN?: string;
  SHEETS_EXPORT_TOKEN?: string;
  RATE_LIMIT_SALT?: string;
  WHATSAPP_PHONE_NUMBER_ID?: string;
  WHATSAPP_ACCESS_TOKEN?: string;

  /** Deposit links (POK). Every deposit endpoint answers 503 until all POK_* and AGENT_TOKEN are set. */
  DEPOSIT_AMOUNT?: string;
  DEPOSIT_CURRENCY?: string;
  DEPOSIT_EXPIRES_MINUTES?: string;
  DEPOSIT_TERMS_URL?: string;
  POK_ENV?: string;
  POK_KEY_ID?: string;
  POK_KEY_SECRET?: string;
  POK_MERCHANT_ID?: string;
  AGENT_TOKEN?: string;
}

export type AppEnv = { Bindings: Env };
