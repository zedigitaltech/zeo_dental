import { Hono } from 'hono';
import type { AppEnv } from '../env';
import { BOOKING_SELECT, findBooking, nowIso, toBooking } from '../lib/db';
import { sendClinicNotification } from '../lib/email';
import { bearer, clientIp, errMsg, readJson, safeEqual, str } from '../lib/http';
import { ALLOWED_TYPES, sniff } from '../lib/magic';
import { allow } from '../lib/ratelimit';
import { TIME_SLOTS, futureDate, isValidEmail, isValidPhone } from '../lib/validate';

const FILE_RETENTION_DAYS = 90; // informational only (owner decision 2026-10-12)
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 3;

const bad = (message: string, error = message) => ({ success: false, message, error });

export const booking = new Hono<AppEnv>();

booking.post('/api/booking', async c => {
  if (!(await allow(c.env, 'booking', clientIp(c.req.raw)))) {
    return c.json(
      bad('Too many requests. Please try again in a minute.', 'Too many requests'),
      429
    );
  }

  const b = await readJson(c.req.raw);
  const name = str(b.name);
  const email = str(b.email);
  const phone = str(b.phone);
  const service = str(b.service);
  const date = str(b.date);
  const time = str(b.time);
  const description = str(b.description);
  const notes = str(b.notes);
  const honeypot = str(b.honeypot);

  if (honeypot && honeypot.trim().length > 0)
    return c.json(bad('Invalid submission', 'Spam detected'), 400);
  if (!name || !service)
    return c.json(bad('Name and service are required', 'Missing required fields'), 400);
  if (!phone && !email) return c.json(bad('Either phone or email is required'), 400);
  if (email && !isValidEmail(email)) return c.json(bad('Invalid email format'), 400);
  if (phone && !isValidPhone(phone)) return c.json(bad('Invalid phone number format'), 400);

  let preferredDate: string | null = null;
  if (date) {
    preferredDate = futureDate(date);
    if (!preferredDate) return c.json(bad('Date must be today or in the future'), 400);
  }
  if (time && !TIME_SLOTS.includes(time.toLowerCase())) {
    return c.json(
      bad('Invalid time slot. Use: morning, afternoon, or evening', 'Invalid time slot'),
      400
    );
  }

  const row = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: email ? email.trim().toLowerCase() : null,
    phone: phone ? phone.trim() : null,
    service: service.trim(),
    preferred_date: preferredDate,
    preferred_time: time ? time.toLowerCase() : null,
    description: description?.trim() || null,
    notes: notes?.trim() || null,
    status: 'pending',
  };
  const now = nowIso();

  try {
    await c.env.DB.prepare(
      `INSERT INTO bookings (id, name, email, phone, service, preferred_date, preferred_time, description, notes, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        row.id,
        row.name,
        row.email,
        row.phone,
        row.service,
        row.preferred_date,
        row.preferred_time,
        row.description,
        row.notes,
        row.status,
        now,
        now
      )
      .run();
  } catch (err) {
    console.error(`Booking error: ${errMsg(err)}`);
    return c.json(bad('Failed to create booking. Please try again.', 'Database error'), 500);
  }

  console.log(`New booking created: ${row.id}`);
  c.executionCtx.waitUntil(sendClinicNotification(c.env, row).catch(() => false));

  return c.json(
    {
      success: true,
      message: 'Booking request submitted successfully',
      booking: {
        id: row.id,
        name: row.name,
        email: row.email,
        service: row.service,
        date: row.preferred_date,
        time: row.preferred_time,
        status: row.status,
      },
    },
    201
  );
});

booking.get('/api/bookings', async c => {
  const token = c.env.ADMIN_TOKEN;
  if (!token) return c.json({ error: 'Admin access not configured' }, 503);
  const given = bearer(c.req.raw);
  if (!given || !safeEqual(given, token)) return c.json({ error: 'Unauthorized' }, 401);
  try {
    console.log(
      `Admin bookings accessed (country ${(c.req.raw as { cf?: { country?: string } }).cf?.country ?? '?'})`
    );
    const { results } = await c.env.DB.prepare(
      `SELECT ${BOOKING_SELECT} FROM bookings WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 100`
    ).all<Record<string, unknown>>();
    return c.json({ bookings: results.map(toBooking) });
  } catch (err) {
    console.error(`Get bookings error: ${errMsg(err)}`);
    return c.json({ error: 'Failed to fetch bookings' }, 500);
  }
});

/**
 * Upload X-rays / photos for a booking (health data). Everything is validated — type by magic
 * bytes, size, count, consent — before a single byte is written to R2.
 */
booking.post('/api/booking/:bookingId/files', async c => {
  if (!(await allow(c.env, 'booking', clientIp(c.req.raw)))) {
    return c.json({ success: false, error: 'Too many requests' }, 429);
  }
  const bookingId = c.req.param('bookingId');
  if (!(await findBooking(c.env.DB, bookingId))) {
    return c.json({ success: false, error: 'Booking not found' }, 404);
  }

  const length = Number(c.req.header('content-length') ?? '0');
  if (length > MAX_FILES * MAX_FILE_SIZE + 1024 * 1024) {
    return c.json({ success: false, error: 'Upload too large' }, 413);
  }

  let form: FormData;
  try {
    form = await c.req.raw.formData();
  } catch {
    return c.json({ success: false, error: 'Invalid upload' }, 400);
  }

  const healthDataConsent = form.get('healthDataConsent') === 'true';
  const files: File[] = [];
  for (const [, value] of form.entries()) {
    if (typeof value !== 'string') files.push(value as unknown as File);
  }
  if (files.length > MAX_FILES) {
    return c.json({ success: false, error: `Too many files. Maximum: ${MAX_FILES}` }, 413);
  }

  const accepted: Array<{ file: File; bytes: Uint8Array; mime: string }> = [];
  for (const file of files) {
    if (!ALLOWED_TYPES[file.type]) {
      return c.json(
        {
          success: false,
          error: `File type not allowed: ${file.type}. Accepted: JPG, PNG, WebP, PDF`,
        },
        400
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return c.json(
        { success: false, error: `File too large: ${file.name}. Maximum size: 10MB` },
        400
      );
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (sniff(bytes) !== file.type) {
      return c.json(
        { success: false, error: `File content does not match its type: ${file.name}` },
        400
      );
    }
    accepted.push({ file, bytes, mime: file.type });
  }

  if (accepted.length === 0) return c.json({ success: false, error: 'No files uploaded' }, 400);
  if (!healthDataConsent) {
    return c.json(
      {
        success: false,
        error: 'Health data consent is required for uploading dental X-rays or photos',
      },
      400
    );
  }

  const expiresAt = new Date(Date.now() + FILE_RETENTION_DAYS * 86_400_000).toISOString();
  const saved: Array<{ name: string; size: number }> = [];
  const inserts: D1PreparedStatement[] = [];
  for (const { file, bytes, mime } of accepted) {
    const filename = `${crypto.randomUUID()}${ALLOWED_TYPES[mime]}`;
    const key = `bookings/${bookingId}/${filename}`;
    // No personal data in object metadata: only the content type.
    await c.env.UPLOADS.put(key, bytes, { httpMetadata: { contentType: mime } });
    inserts.push(
      c.env.DB.prepare(
        `INSERT INTO booking_files (booking_id, filename, original_name, mime_type, size_bytes, storage_path, health_data_consent, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(bookingId, filename, file.name || 'unknown', mime, bytes.length, key, 1, expiresAt)
    );
    saved.push({ name: file.name || 'unknown', size: bytes.length });
  }
  await c.env.DB.batch(inserts);

  console.log(`Uploaded ${saved.length} files for booking ${bookingId}`);
  return c.json(
    { success: true, message: `${saved.length} file(s) uploaded successfully`, files: saved },
    201
  );
});
