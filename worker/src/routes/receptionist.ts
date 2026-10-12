import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import type { AppEnv } from '../env';
import { BOOKING_SELECT, STATUSES, findBooking, nowIso, toBooking } from '../lib/db';
import type { BookingRow } from '../lib/db';
import { sendCancellationEmail, sendConfirmationEmail } from '../lib/email';
import { bearer, errMsg, readJson, safeEqual, str } from '../lib/http';
import { isIsoDate } from '../lib/validate';
import { sendWhatsAppCancellation, sendWhatsAppConfirmation } from '../lib/whatsapp';

export const receptionist = new Hono<AppEnv>();

const requireAdmin: MiddlewareHandler<AppEnv> = async (c, next) => {
  const token = c.env.ADMIN_TOKEN;
  if (!token) return c.json({ success: false, error: 'Admin access not configured' }, 503);
  const given = bearer(c.req.raw);
  if (!given || !safeEqual(given, token))
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  await next();
};

receptionist.post('/api/receptionist/login', async c => {
  const token = c.env.ADMIN_TOKEN;
  if (!token) return c.json({ success: false, message: 'Admin access not configured' }, 503);
  const password = str((await readJson(c.req.raw)).password);
  // Parity with Fly: the password IS the bearer token and is returned (flagged in the design, #11).
  if (password && safeEqual(password, token)) {
    return c.json({ success: true, message: 'Login successful', token });
  }
  return c.json({ success: false, message: 'Invalid password' }, 401);
});

receptionist.use('/api/receptionist/stats', requireAdmin);
receptionist.use('/api/receptionist/chat-stats', requireAdmin);
receptionist.use('/api/receptionist/bookings', requireAdmin);
receptionist.use('/api/receptionist/bookings/*', requireAdmin);

const count = async (db: D1Database, sql: string, ...args: unknown[]) =>
  (
    await db
      .prepare(sql)
      .bind(...args)
      .first<{ n: number }>()
  )?.n ?? 0;

receptionist.get('/api/receptionist/stats', async c => {
  try {
    const db = c.env.DB;
    const today = new Date().toISOString().split('T')[0];
    const weekFromNow = new Date(Date.now() + 7 * 86_400_000).toISOString().split('T')[0];
    const live = 'deleted_at IS NULL';
    const [pending, todayN, week, confirmedToday] = await Promise.all([
      count(db, `SELECT COUNT(*) AS n FROM bookings WHERE status = 'pending' AND ${live}`),
      count(db, `SELECT COUNT(*) AS n FROM bookings WHERE preferred_date = ? AND ${live}`, today),
      count(
        db,
        `SELECT COUNT(*) AS n FROM bookings WHERE preferred_date BETWEEN ? AND ? AND ${live}`,
        today,
        weekFromNow
      ),
      count(
        db,
        `SELECT COUNT(*) AS n FROM bookings WHERE confirmed_date = ? AND status = 'confirmed' AND ${live}`,
        today
      ),
    ]);
    return c.json({
      pending_count: pending,
      today_count: todayN,
      week_count: week,
      confirmed_today: confirmedToday,
    });
  } catch (err) {
    console.error(`Stats error: ${errMsg(err)}`);
    return c.json({ pending_count: 0, today_count: 0, week_count: 0, confirmed_today: 0 }, 500);
  }
});

const ZERO = { tokens: 0, cost: 0, messages: 0 };
/** DECIMAL(10,6) in Postgres summed exactly; round the float sum the same way. */
const round6 = (x: number) => Math.round(x * 1e6) / 1e6;

receptionist.get('/api/receptionist/chat-stats', async c => {
  const sum = async (where: string, ...args: unknown[]) => {
    const r = await c.env.DB.prepare(
      `SELECT COALESCE(SUM(total_tokens), 0) AS tokens, COALESCE(SUM(estimated_cost), 0) AS cost, COUNT(*) AS messages
       FROM chat_usage WHERE deleted_at IS NULL ${where}`
    )
      .bind(...args)
      .first<{ tokens: number; cost: number; messages: number }>();
    return {
      tokens: Number(r?.tokens ?? 0),
      cost: round6(Number(r?.cost ?? 0)),
      messages: Number(r?.messages ?? 0),
    };
  };
  const since = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();
  try {
    const [today, week, month, total] = await Promise.all([
      sum('AND substr(created_at, 1, 10) = ?', new Date().toISOString().slice(0, 10)),
      sum('AND created_at >= ?', since(7)),
      sum('AND created_at >= ?', since(30)),
      sum(''),
    ]);
    return c.json({ today, week, month, total });
  } catch (err) {
    console.error(`Chat stats error: ${errMsg(err)}`);
    return c.json({ today: ZERO, week: ZERO, month: ZERO, total: ZERO });
  }
});

receptionist.get('/api/receptionist/bookings', async c => {
  try {
    const q = c.req.query();
    const where = ['deleted_at IS NULL'];
    const params: unknown[] = [];
    if (q.status) {
      where.push('status = ?');
      params.push(q.status);
    }
    if (q.date_from) {
      where.push('preferred_date >= ?');
      params.push(q.date_from);
    }
    if (q.date_to) {
      where.push('preferred_date <= ?');
      params.push(q.date_to);
    }
    if (q.search) {
      // Postgres ILIKE → SQLite LIKE (case-insensitive for ASCII only).
      where.push('(name LIKE ? OR email LIKE ? OR phone LIKE ?)');
      const s = `%${q.search}%`;
      params.push(s, s, s);
    }
    const whereClause = `WHERE ${where.join(' AND ')}`;
    const limit = Math.min(Math.max(parseInt(q.limit ?? '50', 10) || 50, 1), 500);
    const offset = Math.max(parseInt(q.offset ?? '0', 10) || 0, 0);
    const db = c.env.DB;

    const total = await count(db, `SELECT COUNT(*) AS n FROM bookings ${whereClause}`, ...params);
    const pending_count = await count(
      db,
      `SELECT COUNT(*) AS n FROM bookings WHERE status = 'pending' AND deleted_at IS NULL`
    );
    const { results } = await db
      .prepare(
        `SELECT ${BOOKING_SELECT} FROM bookings ${whereClause}
         ORDER BY CASE WHEN status = 'pending' THEN 0 ELSE 1 END, created_at DESC
         LIMIT ? OFFSET ?`
      )
      .bind(...params, limit, offset)
      .all<Record<string, unknown>>();
    return c.json({ success: true, bookings: results.map(toBooking), total, pending_count });
  } catch (err) {
    console.error(`Bookings list error: ${errMsg(err)}`);
    return c.json({ success: false, bookings: [], total: 0, pending_count: 0 }, 500);
  }
});

receptionist.get('/api/receptionist/bookings/:id', async c => {
  try {
    const b = await findBooking(c.env.DB, c.req.param('id'));
    if (!b) return c.json({ success: false, error: 'Booking not found' }, 404);
    return c.json({ success: true, booking: b });
  } catch (err) {
    console.error(`Get booking error: ${errMsg(err)}`);
    return c.json({ success: false, error: 'Failed to fetch booking' }, 500);
  }
});

async function update(
  db: D1Database,
  id: string,
  set: string,
  ...args: unknown[]
): Promise<BookingRow | null> {
  const row = await db
    .prepare(
      `UPDATE bookings SET ${set}, updated_at = ? WHERE id = ? AND deleted_at IS NULL RETURNING ${BOOKING_SELECT}`
    )
    .bind(...args, nowIso(), id)
    .first<Record<string, unknown>>();
  return row ? toBooking(row) : null;
}

receptionist.patch('/api/receptionist/bookings/:id/confirm', async c => {
  const id = c.req.param('id');
  const body = await readJson(c.req.raw);
  const confirmedDate = body.confirmed_date;
  const confirmedTime = str(body.confirmed_time) ?? null;
  const notes = str(body.notes) ?? null;
  if (!isIsoDate(confirmedDate))
    return c.json({ success: false, error: 'Invalid confirmed_date (YYYY-MM-DD)' }, 400);
  try {
    const db = c.env.DB;
    const booking = await update(
      db,
      id,
      `status = 'confirmed', confirmed_date = ?, confirmed_time = ?, confirmed_at = ?, notes = COALESCE(?, notes)`,
      confirmedDate,
      confirmedTime,
      nowIso(),
      notes
    );
    if (!booking) return c.json({ success: false, error: 'Booking not found' }, 404);

    let whatsapp_sent = false;
    let email_sent = false;
    if (body.send_whatsapp && booking.phone) {
      whatsapp_sent = await sendWhatsAppConfirmation(c.env, booking);
      if (whatsapp_sent)
        await db
          .prepare('UPDATE bookings SET whatsapp_sent = 1, updated_at = ? WHERE id = ?')
          .bind(nowIso(), id)
          .run();
    }
    if (body.send_email && booking.email) {
      email_sent = await sendConfirmationEmail(c.env, booking);
      // Fastify flagged the email as sent whenever the send did not throw; flag only real sends.
      if (email_sent)
        await db
          .prepare('UPDATE bookings SET confirmation_email_sent = 1, updated_at = ? WHERE id = ?')
          .bind(nowIso(), id)
          .run();
    }
    console.log(`Booking ${id} confirmed. WhatsApp: ${whatsapp_sent}, Email: ${email_sent}`);
    return c.json({
      success: true,
      message: 'Booking confirmed',
      booking,
      whatsapp_sent,
      email_sent,
    });
  } catch (err) {
    console.error(`Confirm booking error: ${errMsg(err)}`);
    return c.json({ success: false, error: 'Failed to confirm booking' }, 500);
  }
});

receptionist.patch('/api/receptionist/bookings/:id/cancel', async c => {
  const id = c.req.param('id');
  const body = await readJson(c.req.raw);
  try {
    const booking = await update(
      c.env.DB,
      id,
      `status = 'cancelled', cancellation_reason = ?`,
      str(body.reason) || null
    );
    if (!booking) return c.json({ success: false, error: 'Booking not found' }, 404);
    if (body.notify_patient) {
      if (booking.phone) await sendWhatsAppCancellation(c.env, booking);
      if (booking.email) await sendCancellationEmail(c.env, booking);
    }
    console.log(`Booking ${id} cancelled`);
    return c.json({ success: true, message: 'Booking cancelled', booking });
  } catch (err) {
    console.error(`Cancel booking error: ${errMsg(err)}`);
    return c.json({ success: false, error: 'Failed to cancel booking' }, 500);
  }
});

receptionist.patch('/api/receptionist/bookings/:id/status', async c => {
  const status = str((await readJson(c.req.raw)).status);
  if (!status || !(STATUSES as readonly string[]).includes(status)) {
    return c.json({ success: false, error: 'Invalid status' }, 400);
  }
  try {
    const booking = await update(c.env.DB, c.req.param('id'), 'status = ?', status);
    if (!booking) return c.json({ success: false, error: 'Booking not found' }, 404);
    return c.json({ success: true, message: 'Status updated', booking });
  } catch (err) {
    console.error(`Update status error: ${errMsg(err)}`);
    return c.json({ success: false, error: 'Failed to update status' }, 500);
  }
});

// --- New: admin access to uploaded files (none existed on Fly) ---

interface FileRow {
  id: number;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  storage_path: string;
  health_data_consent: number;
  expires_at: string;
  created_at: string;
}

receptionist.get('/api/receptionist/bookings/:id/files', async c => {
  const id = c.req.param('id');
  if (!(await findBooking(c.env.DB, id)))
    return c.json({ success: false, error: 'Booking not found' }, 404);
  const { results } = await c.env.DB.prepare(
    `SELECT id, original_name, mime_type, size_bytes, storage_path, health_data_consent, expires_at, created_at
     FROM booking_files WHERE booking_id = ? AND deleted_at IS NULL ORDER BY id`
  )
    .bind(id)
    .all<FileRow>();
  const files = await Promise.all(
    results.map(async f => ({
      id: f.id,
      original_name: f.original_name,
      mime_type: f.mime_type,
      size_bytes: f.size_bytes,
      health_data_consent: f.health_data_consent === 1,
      expires_at: f.expires_at,
      created_at: f.created_at,
      available: (await c.env.UPLOADS.head(f.storage_path)) !== null,
    }))
  );
  return c.json({ success: true, files }, 200, { 'cache-control': 'no-store' });
});

/** ASCII-only quoted name plus the RFC 5987 UTF-8 form, so no header injection is possible. */
function disposition(name: string): string {
  const ascii = name.replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '_');
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}

receptionist.get('/api/receptionist/bookings/:id/files/:fileId', async c => {
  const f = await c.env.DB.prepare(
    `SELECT id, original_name, mime_type, size_bytes, storage_path, health_data_consent, expires_at, created_at
     FROM booking_files WHERE id = ? AND booking_id = ? AND deleted_at IS NULL`
  )
    .bind(Number(c.req.param('fileId')) || -1, c.req.param('id'))
    .first<FileRow>();
  if (!f) return c.json({ success: false, error: 'File not found' }, 404);
  const obj = await c.env.UPLOADS.get(f.storage_path);
  if (!obj) return c.json({ success: false, error: 'File is no longer available' }, 410);
  // Buffered (≤10 MB per file): a streamed R2 body trips vitest-pool-workers isolated storage.
  return new Response(await obj.arrayBuffer(), {
    headers: {
      'content-type': f.mime_type,
      'content-length': String(obj.size),
      'content-disposition': disposition(f.original_name),
      'cache-control': 'no-store',
    },
  });
});
