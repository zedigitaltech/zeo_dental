/**
 * Deposit payment links (POK) for the call centre and reception.
 *
 *   POST /api/agent/login                  AGENT_TOKEN as password (same lockout as reception)
 *   POST /api/agent/deposits               create (or reuse) a link; bearer AGENT_TOKEN or ADMIN_TOKEN
 *   GET  /api/agent/deposits               recent deposits, pending ones refreshed from POK (capped)
 *   POST /api/agent/deposits/:id/cancel    soft cancel (the POK order is left to expire)
 *   POST /api/pay/pok/webhook?d=&t=        public; the body is ignored, POK's GET decides
 *
 * Inert until configured: without POK_KEY_ID, POK_KEY_SECRET, POK_MERCHANT_ID, AGENT_TOKEN and a
 * valid DEPOSIT_AMOUNT every endpoint here answers 503. Money goes to the clinic's own POK merchant
 * account; this Worker never holds or moves money. Logs carry deposit ids only.
 */
import { Hono } from 'hono';
import type { Context, MiddlewareHandler } from 'hono';
import type { AppEnv, Env } from '../env';
import { checkAnySecret, checkSecret, type TokenName } from '../lib/auth';
import { findBooking, nowIso } from '../lib/db';
import { depositWhatsAppText, whatsappUrl, type EmailDeposit } from '../lib/depositEmails';
import { DEPOSIT_COPY } from '../lib/depositCopy';
import {
  sendClinicDepositNotification,
  sendDepositReceiptEmail,
  sendDepositRequestEmail,
} from '../lib/email';
import { isEmailLanguage, type EmailLanguage } from '../lib/emailLanguage';
import { bearer, clientIp, errMsg, readJson, safeEqual, str } from '../lib/http';
import {
  POK_CURRENCIES,
  PokError,
  createPokOrder,
  getPokOrder,
  isPaidOrder,
  pokConfigured,
} from '../lib/pok';
import { allow } from '../lib/ratelimit';
import { isValidEmail, isValidPhone } from '../lib/validate';

export const DEPOSIT_STATUSES = ['pending', 'paid', 'expired', 'cancelled', 'failed'] as const;
export type DepositStatus = (typeof DEPOSIT_STATUSES)[number];

/** Pending deposits refreshed from POK per list call (each is one POK request). */
export const MAX_REFRESH_PER_LIST = 5;
const DEFAULT_EXPIRES_MINUTES = 4320; // 72 h

/** Columns that may leave the Worker (never webhook_token). No health data exists in this table. */
const PUBLIC_COLUMNS = [
  'id',
  'booking_id',
  'name',
  'phone',
  'email',
  'language',
  'amount_cents',
  'currency',
  'provider',
  'provider_order_id',
  'confirm_url',
  'status',
  'created_by',
  'call_list_ref',
  'created_at',
  'updated_at',
  'paid_at',
  'expires_at',
] as const;
const SELECT = PUBLIC_COLUMNS.join(', ');

export interface DepositRow extends EmailDeposit {
  status: DepositStatus;
  provider: string;
  created_at: string;
  updated_at: string;
}

export interface DepositConfig {
  amountCents: number;
  currency: string;
  expiresMinutes: number;
  baseUrl: string;
}

/** "100" / "100.00" / "100.5" → cents; anything else (or ≤ 0) → null. */
export function parseAmountCents(v: string | undefined): number | null {
  if (!v || !/^\d{1,7}(\.\d{1,2})?$/.test(v.trim())) return null;
  const cents = Math.round(Number(v.trim()) * 100);
  return cents > 0 ? cents : null;
}

/** Null unless every POK secret, AGENT_TOKEN and a valid amount/currency are set. */
export function depositConfig(env: Env): DepositConfig | null {
  const amountCents = parseAmountCents(env.DEPOSIT_AMOUNT);
  const currency = (env.DEPOSIT_CURRENCY || 'EUR').toUpperCase();
  if (
    !pokConfigured(env) ||
    !env.AGENT_TOKEN ||
    amountCents === null ||
    !(POK_CURRENCIES as readonly string[]).includes(currency)
  ) {
    return null;
  }
  const minutes = parseInt(env.DEPOSIT_EXPIRES_MINUTES ?? '', 10);
  return {
    amountCents,
    currency,
    expiresMinutes: minutes > 0 && minutes <= 43_200 ? minutes : DEFAULT_EXPIRES_MINUTES,
    baseUrl: (env.BASE_URL || 'https://zeodentalclinic.com').replace(/\/+$/, ''),
  };
}

/** Last 9 digits of a phone (the call list's rule). */
export const phoneKey = (phone: string): string => `p${phone.replace(/\D/g, '').slice(-9)}`;

/** One key per contact for the open-link uniqueness: the phone if given, else the e-mail. */
export const contactKey = (phone: string | null, email: string | null): string =>
  phone ? phoneKey(phone) : `e${(email ?? '').trim().toLowerCase()}`;

/** Case-, accent-spacing- and whitespace-insensitive name comparison. */
export const sameName = (a: string, b: string): boolean => {
  const n = (s: string) => s.normalize('NFKC').toLocaleLowerCase('it').replace(/\s+/g, ' ').trim();
  return n(a) === n(b);
};

const NOT_CONFIGURED = { success: false, error: 'Deposits not configured' };

type DepEnv = AppEnv & { Variables: { authAs?: TokenName } };
type Ctx = Context<DepEnv>;

function toDeposit(r: Record<string, unknown>): DepositRow {
  const out: Record<string, unknown> = {};
  for (const c of PUBLIC_COLUMNS) out[c] = r[c] ?? null;
  return out as unknown as DepositRow;
}

async function findDeposit(db: D1Database, id: string): Promise<DepositRow | null> {
  const row = await db
    .prepare(`SELECT ${SELECT} FROM deposits WHERE id = ? AND deleted_at IS NULL`)
    .bind(id)
    .first<Record<string, unknown>>();
  return row ? toDeposit(row) : null;
}

const randomHex = (bytes: number): string =>
  [...crypto.getRandomValues(new Uint8Array(bytes))]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

/** What the agent UI needs for one deposit (link, WhatsApp link). */
function present(d: DepositRow) {
  const wa =
    d.confirm_url && d.phone ? whatsappUrl(d.phone, depositWhatsAppText(d, d.confirm_url)) : null;
  return { deposit: d, confirm_url: d.confirm_url, whatsapp_url: wa };
}

// ---------------------------------------------------------------------------------------------
// Payment state: only POK's GET /sdk-orders/{id} can move a deposit to "paid".

/**
 * Marks the deposit paid (from any other status: a patient may pay a cancelled link that POK still
 * accepted) and, exactly once per deposit, sends the clinic notification and the patient receipt.
 * The once-guard is the atomic UPDATE … WHERE notified_at IS NULL.
 */
async function markPaid(c: Ctx, d: DepositRow, inline: boolean): Promise<DepositRow> {
  const now = nowIso();
  const db = c.env.DB;
  const row = await db
    .prepare(
      `UPDATE deposits SET status = 'paid', paid_at = COALESCE(paid_at, ?), updated_at = ?
       WHERE id = ? AND deleted_at IS NULL RETURNING ${SELECT}`
    )
    .bind(now, now, d.id)
    .first<Record<string, unknown>>();
  const paid = row ? toDeposit(row) : d;
  const claim = await db
    .prepare(
      'UPDATE deposits SET notified_at = ? WHERE id = ? AND notified_at IS NULL RETURNING id'
    )
    .bind(now, d.id)
    .first<{ id: string }>();
  if (claim) {
    console.log(`Deposit ${d.id} paid (verified with POK)`);
    const jobs: Promise<unknown>[] = [sendClinicDepositNotification(c.env, paid)];
    if (paid.email) jobs.push(sendDepositReceiptEmail(c.env, paid));
    // Already inside waitUntil (webhook): await. In a request: do not delay the response.
    if (inline) await Promise.allSettled(jobs);
    else c.executionCtx.waitUntil(Promise.allSettled(jobs));
  }
  return paid;
}

/**
 * pending → expired / cancelled / failed, and nothing else: the UPDATE only matches a pending row,
 * so a deposit that became paid in the meantime is never overwritten ("paid" is sticky). Returns
 * the updated row, or null when the deposit was no longer pending.
 */
async function transition(
  db: D1Database,
  id: string,
  to: Exclude<DepositStatus, 'pending' | 'paid'>
): Promise<DepositRow | null> {
  const row = await db
    .prepare(
      `UPDATE deposits SET status = ?, updated_at = ?
       WHERE id = ? AND status = 'pending' AND deleted_at IS NULL RETURNING ${SELECT}`
    )
    .bind(to, nowIso(), id)
    .first<Record<string, unknown>>();
  return row ? toDeposit(row) : null;
}

/**
 * Ask POK about a deposit's order and apply the answer: paid (amount and currency must match ours),
 * else expired once POK's or our expiry has passed. On a POK error the row is left unchanged.
 */
async function refreshFromPok(c: Ctx, d: DepositRow, inline = false): Promise<DepositRow> {
  if (!d.provider_order_id || d.status === 'paid') return d;
  let order;
  try {
    order = await getPokOrder(c.env, d.provider_order_id);
  } catch (err) {
    console.error(`Deposit ${d.id} refresh: ${err instanceof PokError ? err.message : 'error'}`);
    return d;
  }
  if (isPaidOrder(order, d)) return markPaid(c, d, inline);
  if (order.capturedAmount > 0) {
    console.error(`Deposit ${d.id}: POK reports a capture that does not match; not marked paid`);
  }
  const expiry = order.expiresAt ?? d.expires_at;
  if (d.status === 'pending' && expiry && new Date(expiry).getTime() < Date.now()) {
    return (
      (await transition(c.env.DB, d.id, 'expired')) ?? (await findDeposit(c.env.DB, d.id)) ?? d
    );
  }
  return d;
}

// ---------------------------------------------------------------------------------------------

export const deposits = new Hono<DepEnv>();

const requireConfigured: MiddlewareHandler<DepEnv> = async (c, next) => {
  if (!depositConfig(c.env)) return c.json(NOT_CONFIGURED, 503);
  await next();
};

const requireAgent: MiddlewareHandler<DepEnv> = async (c, next) => {
  const names: TokenName[] = ['AGENT_TOKEN', 'ADMIN_TOKEN'];
  const auth = await checkAnySecret(c.env, c.req.raw, names, bearer(c.req.raw));
  if (!auth.ok) return c.json({ success: false, error: auth.message }, auth.status);
  c.set('authAs', auth.name);
  await next();
};

deposits.use('/api/agent/*', requireConfigured);
deposits.use('/api/pay/*', requireConfigured);
deposits.use('/api/agent/deposits', requireAgent);
deposits.use('/api/agent/deposits/*', requireAgent);

deposits.post('/api/agent/login', async c => {
  const password = str((await readJson(c.req.raw)).password) ?? null;
  const auth = await checkSecret(c.env, c.req.raw, 'AGENT_TOKEN', password);
  if (!auth.ok) {
    const message = auth.status === 401 ? 'Invalid password' : auth.message;
    return c.json({ success: false, message }, auth.status);
  }
  // Same model as the reception login: the password is the bearer token (kept in sessionStorage).
  return c.json({ success: true, token: c.env.AGENT_TOKEN });
});

const MAX = { name: 200, phone: 40, email: 254, call_list_ref: 100, created_by: 60 };
const bad = (c: Ctx, error: string) => c.json({ success: false, error }, 400);

deposits.post('/api/agent/deposits', async c => {
  const cfg = depositConfig(c.env)!;
  if (!(await allow(c.env, 'deposit', clientIp(c.req.raw)))) {
    return c.json({ success: false, error: 'Too many requests' }, 429);
  }
  const b = await readJson(c.req.raw);
  const name = str(b.name)?.trim() ?? '';
  const phone = str(b.phone)?.trim() || null;
  const email = str(b.email)?.trim().toLowerCase() || null;
  const languageIn = str(b.language)?.trim().toLowerCase();
  const bookingId = str(b.booking_id)?.trim() || null;
  const callListRef = str(b.call_list_ref)?.trim() || null;
  const createdByIn = str(b.created_by)?.trim() || null;
  const sendEmail = b.send_email !== false;
  const force = b.force === true;

  if (!name) return bad(c, 'Name is required');
  if (!phone && !email) return bad(c, 'Either phone or email is required');
  const lengths = { name, phone, email, call_list_ref: callListRef, created_by: createdByIn };
  for (const [k, max] of Object.entries(MAX)) {
    const v = lengths[k as keyof typeof lengths];
    if (v && v.length > max) return bad(c, `Field too long: ${k}`);
  }
  if (email && !isValidEmail(email)) return bad(c, 'Invalid email format');
  if (phone && !isValidPhone(phone)) return bad(c, 'Invalid phone number format');
  if (languageIn && !isEmailLanguage(languageIn)) return bad(c, 'Invalid language');
  const language: EmailLanguage = isEmailLanguage(languageIn) ? languageIn : 'it';
  if (bookingId && !(await findBooking(c.env.DB, bookingId))) return bad(c, 'Unknown booking_id');
  const authAs = c.get('authAs');
  const createdBy = createdByIn ?? (authAs === 'ADMIN_TOKEN' ? 'reception' : 'agent');

  const db = c.env.DB;
  const now = nowIso();

  const matchKey = contactKey(phone, email);
  const id = crypto.randomUUID();
  const webhookToken = randomHex(32);
  const fallbackExpiry = new Date(Date.now() + cfg.expiresMinutes * 60_000).toISOString();

  /** An open link already exists for this contact: reuse it, refuse it, or replace it (force). */
  const existingAnswer = async (open: DepositRow): Promise<Response | 'retry'> => {
    if (open.expires_at && open.expires_at <= nowIso()) {
      await transition(db, open.id, 'expired');
      return 'retry';
    }
    if (force) {
      // The old link is withdrawn; if the patient still pays it, POK's GET marks it paid anyway.
      await transition(db, open.id, 'cancelled');
      return 'retry';
    }
    if (sameName(open.name, name) && open.confirm_url) {
      return c.json({ success: true, reused: true, email_sent: false, ...present(open) });
    }
    if (sameName(open.name, name)) {
      return c.json({ success: false, error: 'A link for this contact is being created' }, 409);
    }
    return c.json(
      {
        success: false,
        reused: false,
        error: 'Open link for this contact under another name',
        conflict: { name: open.name, status: open.status, created_at: open.created_at },
      },
      409
    );
  };

  // Claim: the row is inserted as pending BEFORE POK is called. The partial unique index on
  // match_key (pending, not deleted) makes a second concurrent claim for the same contact fail.
  for (let attempt = 0; ; attempt++) {
    // Same contact by the other channel (e-mail of a phone row, or vice versa).
    const other = await db
      .prepare(
        `SELECT ${SELECT} FROM deposits
         WHERE deleted_at IS NULL AND status = 'pending' AND match_key <> ?
           AND ? IS NOT NULL AND email = ?
         ORDER BY created_at DESC LIMIT 1`
      )
      .bind(matchKey, email, email)
      .first<Record<string, unknown>>();
    let open: DepositRow | null = other ? toDeposit(other) : null;
    if (!open) {
      try {
        await db
          .prepare(
            `INSERT INTO deposits (id, booking_id, name, phone, email, language, amount_cents, currency, provider,
               webhook_token, status, match_key, created_by, call_list_ref, created_at, updated_at, expires_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pok', ?, 'pending', ?, ?, ?, ?, ?, ?)`
          )
          .bind(
            id,
            bookingId,
            name,
            phone,
            email,
            language,
            cfg.amountCents,
            cfg.currency,
            webhookToken,
            matchKey,
            createdBy,
            callListRef,
            now,
            now,
            fallbackExpiry
          )
          .run();
        break;
      } catch (err) {
        if (!/UNIQUE constraint failed/i.test(errMsg(err))) throw err;
        const row = await db
          .prepare(
            `SELECT ${SELECT} FROM deposits
             WHERE match_key = ? AND status = 'pending' AND deleted_at IS NULL LIMIT 1`
          )
          .bind(matchKey)
          .first<Record<string, unknown>>();
        open = row ? toDeposit(row) : null;
      }
    }
    if (attempt >= 2) {
      return c.json({ success: false, error: 'Busy, try again' }, 409);
    }
    if (!open) continue; // the conflicting row moved on between the INSERT and the SELECT
    const answer = await existingAnswer(open);
    if (answer !== 'retry') return answer;
  }

  let order;
  try {
    order = await createPokOrder(c.env, {
      amountCents: cfg.amountCents,
      currency: cfg.currency,
      description: DEPOSIT_COPY[language].description,
      reference: id,
      webhookUrl: `${cfg.baseUrl}/api/pay/pok/webhook?d=${id}&t=${webhookToken}`,
      redirectUrl: `${cfg.baseUrl}/${language}/pay/thanks`,
      failRedirectUrl: `${cfg.baseUrl}/${language}/pay/failed`,
      expiresAfterMinutes: cfg.expiresMinutes,
    });
  } catch (err) {
    console.error(`Deposit ${id}: ${err instanceof PokError ? err.message : errMsg(err)}`);
    await transition(db, id, 'failed');
    return c.json({ success: false, error: 'Payment provider error. Try again.' }, 502);
  }

  const row = await db
    .prepare(
      `UPDATE deposits SET provider_order_id = ?, confirm_url = ?, expires_at = ?, updated_at = ?
       WHERE id = ? RETURNING ${SELECT}`
    )
    .bind(order.id, order.confirmUrl, order.expiresAt || fallbackExpiry, nowIso(), id)
    .first<Record<string, unknown>>();
  const deposit = toDeposit(row ?? {});
  console.log(`Deposit ${id} created by ${createdBy === 'reception' ? 'reception' : 'agent'}`);

  let emailSent = false;
  if (email && sendEmail && deposit.confirm_url) {
    emailSent = await sendDepositRequestEmail(c.env, deposit, deposit.confirm_url);
  }
  return c.json({ success: true, reused: false, email_sent: emailSent, ...present(deposit) });
});

deposits.get('/api/agent/deposits', async c => {
  const q = c.req.query();
  const where = ['deleted_at IS NULL'];
  const args: unknown[] = [];
  if (q.status) {
    if (!(DEPOSIT_STATUSES as readonly string[]).includes(q.status))
      return bad(c, 'Invalid status');
    where.push('status = ?');
    args.push(q.status);
  }
  if (q.booking_id) {
    where.push('booking_id = ?');
    args.push(q.booking_id);
  }
  const limit = Math.min(Math.max(parseInt(q.limit ?? '50', 10) || 50, 1), 200);
  const { results } = await c.env.DB.prepare(
    `SELECT ${SELECT} FROM deposits WHERE ${where.join(' AND ')} ORDER BY created_at DESC LIMIT ?`
  )
    .bind(...args, limit)
    .all<Record<string, unknown>>();
  let budget = MAX_REFRESH_PER_LIST;
  const out: DepositRow[] = [];
  for (const r of results) {
    let d = toDeposit(r);
    if (d.status === 'pending' && d.provider_order_id && budget > 0) {
      budget--;
      d = await refreshFromPok(c, d);
    }
    out.push(d);
  }
  return c.json({ success: true, deposits: out.map(d => ({ ...present(d) })) }, 200, {
    'cache-control': 'no-store',
  });
});

deposits.post('/api/agent/deposits/:id/cancel', async c => {
  const d = await findDeposit(c.env.DB, c.req.param('id'));
  if (!d) return c.json({ success: false, error: 'Deposit not found' }, 404);
  // Check POK first: never cancel a deposit the patient has already paid.
  const fresh = await refreshFromPok(c, d);
  if (fresh.status !== 'pending') {
    return c.json({ success: false, error: `Deposit is ${fresh.status}`, deposit: fresh }, 409);
  }
  const cancelled = await transition(c.env.DB, d.id, 'cancelled');
  if (!cancelled) {
    // Changed under us (e.g. paid between the POK check and this UPDATE): never overwrite it.
    const now = (await findDeposit(c.env.DB, d.id)) ?? fresh;
    return c.json({ success: false, error: `Deposit is ${now.status}`, deposit: now }, 409);
  }
  console.log(`Deposit ${d.id} cancelled`);
  return c.json({ success: true, deposit: cancelled });
});

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/**
 * POK's webhook. Its payload and signature are undocumented, so the body is never read: the
 * deposit id and the per-deposit token in the query string are only a hint to ask POK (GET order)
 * whether the order is paid. Known id + right token → 200 at once, the check runs in waitUntil.
 */
deposits.post('/api/pay/pok/webhook', async c => {
  if (!(await allow(c.env, 'paywebhook', clientIp(c.req.raw)))) {
    return c.json({ error: 'Too many requests' }, 429);
  }
  const id = c.req.query('d') ?? '';
  const token = c.req.query('t') ?? '';
  // Unknown id and wrong token answer the same 401: no oracle for which deposit ids exist.
  const row = UUID.test(id)
    ? await c.env.DB.prepare(
        `SELECT ${SELECT}, webhook_token FROM deposits WHERE id = ? AND deleted_at IS NULL`
      )
        .bind(id)
        .first<Record<string, unknown>>()
    : null;
  const expected = typeof row?.webhook_token === 'string' ? row.webhook_token : 'x'.repeat(64);
  if (!safeEqual(token, expected) || !row) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const d = toDeposit(row);
  if (d.status !== 'paid') {
    c.executionCtx.waitUntil(
      refreshFromPok(c, d, true).then(
        () => undefined,
        err => console.error(`Deposit ${d.id} webhook check: ${errMsg(err)}`)
      )
    );
  }
  return c.json({ received: true });
});
