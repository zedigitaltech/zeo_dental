import { env } from 'cloudflare:test';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { call, futureDay, mockFetch, pastDay, postJson, ADMIN, seedBooking } from './helpers';

const valid = () => ({
  name: 'Anna Prova',
  email: 'Anna.Prova@Example.invalid',
  phone: '+355 68 000 0000',
  service: 'Cosmetic Dentistry',
  date: futureDay(),
  time: 'Morning',
  description: '  needs a check  ',
  notes: 'Looking forward',
});

const resendOk = () => mockFetch(() => new Response(JSON.stringify({ id: 'x' }), { status: 200 }));

afterEach(() => vi.restoreAllMocks());

describe('POST /api/booking', () => {
  it('creates a booking: 201 with the Fastify response shape, stored normalised', async () => {
    const f = resendOk();
    const input = valid();
    const res = await postJson('/api/booking', input);
    expect(res.status).toBe(201);
    const body = (await res.json()) as {
      success: boolean;
      message: string;
      booking: Record<string, unknown>;
    };
    expect(body.success).toBe(true);
    expect(body.message).toBe('Booking request submitted successfully');
    expect(Object.keys(body.booking)).toEqual([
      'id',
      'name',
      'email',
      'service',
      'date',
      'time',
      'status',
    ]);
    expect(body.booking).toMatchObject({
      name: 'Anna Prova',
      email: 'anna.prova@example.invalid',
      date: input.date,
      time: 'morning',
      status: 'pending',
    });
    const row = await env.DB.prepare('SELECT * FROM bookings WHERE id = ?')
      .bind(body.booking.id)
      .first<Record<string, unknown>>();
    expect(row).toMatchObject({
      description: 'needs a check',
      phone: '+355 68 000 0000',
      deleted_at: null,
    });
    expect(String(row!.created_at)).toMatch(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/);
    // Clinic notification went out through waitUntil, to MAIL_TO only (no partner configured).
    expect(f).toHaveBeenCalledOnce();
    const [url, init] = f.mock.calls[0];
    expect(String(url)).toBe('https://api.resend.com/emails');
    const mail = JSON.parse(String((init as RequestInit).body));
    expect(mail.to).toEqual(['clinic@example.invalid']);
    expect(mail.subject).toBe('Kërkesë e Re: Anna Prova - Cosmetic Dentistry');
  });

  it('email-only booking works (was a 500 on Fly: phone was NOT NULL)', async () => {
    resendOk();
    const res = await postJson('/api/booking', {
      name: 'Solo Email',
      email: 'solo@example.invalid',
      service: 'X',
    });
    expect(res.status).toBe(201);
  });

  it('phone-only booking works, empty email string treated as missing', async () => {
    resendOk();
    const res = await postJson('/api/booking', {
      name: 'Solo Phone',
      email: '',
      phone: '+39 333 111 2222',
      service: 'X',
    });
    expect(res.status).toBe(201);
    expect(((await res.json()) as { booking: { email: unknown } }).booking.email).toBeNull();
  });

  it('no clinic email when RESEND_API_KEY is unset, booking still 201', async () => {
    const f = mockFetch(() => new Response('{}'));
    const res = await postJson('/api/booking', valid(), {}, { RESEND_API_KEY: undefined });
    expect(res.status).toBe(201);
    expect(f).not.toHaveBeenCalled();
  });

  it('adds MAIL_TO_PARTNER when set', async () => {
    const f = resendOk();
    await postJson('/api/booking', valid(), {}, { MAIL_TO_PARTNER: 'partner@example.invalid' });
    expect(JSON.parse(String((f.mock.calls[0][1] as RequestInit).body)).to).toEqual([
      'clinic@example.invalid',
      'partner@example.invalid',
    ]);
  });

  const bad: Array<[string, Record<string, unknown>, string]> = [
    ['honeypot', { honeypot: 'bot' }, 'Spam detected'],
    ['missing name', { name: '' }, 'Missing required fields'],
    ['missing service', { service: undefined }, 'Missing required fields'],
    ['neither phone nor email', { phone: '', email: '' }, 'Either phone or email is required'],
    ['bad email', { email: 'nope' }, 'Invalid email format'],
    ['bad phone', { phone: '12-34' }, 'Invalid phone number format'],
    ['past date', { date: pastDay() }, 'Date must be today or in the future'],
    ['garbage date', { date: 'soon' }, 'Date must be today or in the future'],
    ['bad slot', { time: 'night' }, 'Invalid time slot'],
  ];
  for (const [label, patch, error] of bad) {
    it(`400 on ${label}`, async () => {
      const res = await postJson('/api/booking', { ...valid(), ...patch });
      expect(res.status).toBe(400);
      expect(((await res.json()) as { error: string }).error).toBe(error);
    });
  }

  it('rate limit: the 11th booking in a minute from one address is 429 (D1 fallback)', async () => {
    resendOk();
    const statuses: number[] = [];
    for (let i = 0; i < 11; i++)
      statuses.push((await postJson('/api/booking', valid(), { ip: '203.0.113.77' })).status);
    expect(statuses.slice(0, 10).every(s => s === 201)).toBe(true);
    expect(statuses[10]).toBe(429);
    const slots = await env.DB.prepare('SELECT slot FROM rate_limits').all<{ slot: string }>();
    // A bucket and a slot number in a fixed ring: no address stored.
    expect(slots.results.every(r => /^booking:\d{1,4}$/.test(r.slot))).toBe(true);
    expect(JSON.stringify(slots.results)).not.toContain('203.0.113');
  });

  it('uses the Rate Limiting binding when it is bound', async () => {
    const limiter = { limit: vi.fn().mockResolvedValue({ success: false }) };
    const res = await postJson(
      '/api/booking',
      valid(),
      {},
      { BOOKING_LIMITER: limiter as unknown as RateLimit }
    );
    expect(res.status).toBe(429);
    expect(limiter.limit).toHaveBeenCalledOnce();
  });
});

describe('GET /api/bookings (admin)', () => {
  it('503 without ADMIN_TOKEN, 401 with a wrong token', async () => {
    expect((await call('/api/bookings', {}, { ADMIN_TOKEN: undefined })).status).toBe(503);
    expect(
      (await call('/api/bookings', { headers: { authorization: 'Bearer nope' } })).status
    ).toBe(401);
  });

  it('lists non-deleted bookings newest first with booleans as true/false', async () => {
    const keep = await seedBooking({ whatsapp_sent: 1 });
    const gone = await seedBooking({ deleted_at: new Date().toISOString() });
    const res = await call('/api/bookings', { headers: ADMIN });
    expect(res.status).toBe(200);
    const { bookings } = (await res.json()) as { bookings: Array<Record<string, unknown>> };
    const ids = bookings.map(b => b.id);
    expect(ids).toContain(keep);
    expect(ids).not.toContain(gone);
    const row = bookings.find(b => b.id === keep)!;
    expect(row.whatsapp_sent).toBe(true);
    expect(row.confirmation_email_sent).toBe(false);
    expect(row).not.toHaveProperty('deleted_at');
  });
});
