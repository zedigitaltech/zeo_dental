/**
 * Read-only feeds for the Google Sheets sync (ops/sheets/zeo-web-sync.gs pulls them every 10 min).
 * Guarded by SHEETS_EXPORT_TOKEN, separate from the admin token. Only the whitelisted fields leave:
 * never description, notes, service, treatment_interest, has_xray (health-adjacent) or files.
 * travel_timeframe (when the patient wants to come) is not health data and is exported.
 */
import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import type { AppEnv } from '../env';
import { STATUSES } from '../lib/db';
import { checkSecret } from '../lib/auth';
import { bearer } from '../lib/http';

export const EXPORT_FIELDS = [
  'ref',
  'created_at',
  'updated_at',
  'name',
  'phone',
  'email',
  'preferred_date',
  'preferred_time',
  'confirmed_date',
  'confirmed_time',
  'status',
  'travel_timeframe',
] as const;

const SELECT = `substr(id, 1, 8) AS ref, id, created_at, updated_at, name, phone, email, preferred_date,
  preferred_time, confirmed_date, confirmed_time, status, travel_timeframe`;

/**
 * A time without a date is dropped: before 2026-10-13 the form sent its 'morning' default even
 * to visitors who never saw the field, so all such rows say 'morning' without the patient choosing.
 */
const pick = (r: Record<string, unknown>) =>
  Object.fromEntries(
    EXPORT_FIELDS.map(k => [k, k === 'preferred_time' && !r.preferred_date ? null : (r[k] ?? null)])
  ) as Record<(typeof EXPORT_FIELDS)[number], unknown>;

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;

/** Cursor = "<updated_at>|<id>" (opaque to the caller); a bare ISO timestamp is accepted too. */
export function parseCursor(
  since: string | undefined
): { ts: string; id: string } | null | 'invalid' {
  if (!since) return null;
  const [ts, id = ''] = since.split('|');
  if (!ISO.test(ts) || !/^[0-9a-fA-F-]{0,36}$/.test(id)) return 'invalid';
  return { ts, id };
}

/** Today's date in Tirana: the clinic's day, not UTC's. */
export const tiranaToday = (d = new Date()) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Tirane',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);

export const exportApi = new Hono<AppEnv>();

const requireExportToken: MiddlewareHandler<AppEnv> = async (c, next) => {
  const auth = await checkSecret(c.env, c.req.raw, 'SHEETS_EXPORT_TOKEN', bearer(c.req.raw));
  if (!auth.ok) {
    return c.json(
      { error: auth.status === 503 ? 'Export not configured' : auth.message },
      auth.status
    );
  }
  await next();
  c.res.headers.set('cache-control', 'no-store');
};
exportApi.use('/api/export/*', requireExportToken);

function statusFilter(q: string | undefined): string | null | 'invalid' {
  if (!q) return null;
  return (STATUSES as readonly string[]).includes(q) ? q : 'invalid';
}

/**
 * GET /api/export/leads?since=<cursor>&limit=<1..500>&status=<status>
 * Bookings changed after the cursor, oldest change first. The first (backfill) run passes
 * status=pending so only open requests reach the call list; soft-deleted rows never appear.
 */
exportApi.get('/api/export/leads', async c => {
  const cursor = parseCursor(c.req.query('since'));
  if (cursor === 'invalid') return c.json({ error: 'Invalid since cursor' }, 400);
  const status = statusFilter(c.req.query('status'));
  if (status === 'invalid') return c.json({ error: 'Invalid status' }, 400);
  const limit = Math.min(Math.max(parseInt(c.req.query('limit') ?? '200', 10) || 200, 1), 500);

  const where = ['deleted_at IS NULL'];
  const args: unknown[] = [];
  if (status) {
    where.push('status = ?');
    args.push(status);
  }
  if (cursor) {
    where.push('(updated_at > ? OR (updated_at = ? AND id > ?))');
    args.push(cursor.ts, cursor.ts, cursor.id);
  }

  const { results } = await c.env.DB.prepare(
    `SELECT ${SELECT} FROM bookings WHERE ${where.join(' AND ')} ORDER BY updated_at, id LIMIT ?`
  )
    .bind(...args, limit)
    .all<Record<string, unknown>>();

  const last = results.at(-1);
  const next_cursor = last ? `${last.updated_at}|${last.id}` : (c.req.query('since') ?? null);
  return c.json({ items: results.map(pick), next_cursor, has_more: results.length === limit });
});

/**
 * GET /api/export/appointments — everything the front desk should expect: pending or confirmed,
 * dated today (Tirana) or later by confirmed date else preferred date, then undated requests.
 */
exportApi.get('/api/export/appointments', async c => {
  const status = statusFilter(c.req.query('status'));
  if (status === 'invalid') return c.json({ error: 'Invalid status' }, 400);
  const statuses = status ? [status] : ['pending', 'confirmed'];
  const today = tiranaToday();
  const day = 'COALESCE(confirmed_date, preferred_date)';
  const { results } = await c.env.DB.prepare(
    `SELECT ${SELECT} FROM bookings
     WHERE deleted_at IS NULL AND status IN (${statuses.map(() => '?').join(',')})
       AND (${day} >= ? OR ${day} IS NULL)
     ORDER BY ${day} IS NULL, ${day}, confirmed_time, created_at
     LIMIT 1000`
  )
    .bind(...statuses, today)
    .all<Record<string, unknown>>();
  return c.json({ items: results.map(pick), today, timezone: 'Europe/Tirane' });
});
