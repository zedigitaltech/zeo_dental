/** Bindings, vars and secrets. Secrets are set with `wrangler secret put` (DEPLOY.md §2). */
export interface Env {
  DB: D1Database;
  UPLOADS: R2Bucket;
  /** Static assets (the Vite build). Tests inject a stub. */
  ASSETS?: Fetcher;
  /** Workers Rate Limiting bindings. Absent → D1 fallback (lib/ratelimit.ts). */
  CHAT_LIMITER?: RateLimit;
  BOOKING_LIMITER?: RateLimit;

  ZEO_ENV?: string;
  BASE_URL?: string;
  CORS_ORIGINS?: string;
  CHAT_DAILY_CAP?: string;
  CHAT_DAILY_PER_IP?: string;
  GEMINI_MODEL?: string;

  GEMINI_API_KEY?: string;
  RESEND_API_KEY?: string;
  MAIL_FROM?: string;
  MAIL_TO?: string;
  MAIL_TO_PARTNER?: string;
  ADMIN_TOKEN?: string;
  SHEETS_EXPORT_TOKEN?: string;
  RATE_LIMIT_SALT?: string;
  WHATSAPP_PHONE_NUMBER_ID?: string;
  WHATSAPP_ACCESS_TOKEN?: string;
}

export type AppEnv = { Bindings: Env };
