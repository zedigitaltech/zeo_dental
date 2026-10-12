import { env } from 'cloudflare:test';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ADMIN, call, futureDay, mockFetch, patchJson, postJson, seedBooking } from './helpers';

afterEach(() => vi.restoreAllMocks());

type Json = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
const today = () => new Date().toISOString().slice(0, 10);

describe('POST /api/receptionist/login', () => {
  it('returns the token on the right password (parity, flagged in the design)', async () => {
    const res = await postJson('/api/receptionist/login', { password: 'test-admin-token' });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      success: true,
      message: 'Login successful',
      token: 'test-admin-token',
    });
  });
  it('401 on a wrong password, 503 when unconfigured', async () => {
    expect((await postJson('/api/receptionist/login', { password: 'x' })).status).toBe(401);
    expect(
      (await postJson('/api/receptionist/login', {}, {}, { ADMIN_TOKEN: undefined })).status
    ).toBe(503);
  });
});

describe('auth on receptionist routes', () => {
  for (const p of [
    '/api/receptionist/stats',
    '/api/receptionist/chat-stats',
    '/api/receptionist/bookings',
  ]) {
    it(`${p}: 401 / 503`, async () => {
      expect(await (await call(p)).json()).toEqual({ success: false, error: 'Unauthorized' });
      expect((await call(p, { headers: ADMIN }, { ADMIN_TOKEN: undefined })).status).toBe(503);
    });
  }
});

describe('stats', () => {
  it('counts pending, today, week and confirmed today, ignoring soft-deleted rows', async () => {
    await seedBooking({ status: 'pending', preferred_date: today() });
    await seedBooking({
      status: 'confirmed',
      preferred_date: futureDay(3),
      confirmed_date: today(),
    });
    await seedBooking({
      status: 'pending',
      deleted_at: new Date().toISOString(),
      preferred_date: today(),
    });
    const s = (await (await call('/api/receptionist/stats', { headers: ADMIN })).json()) as Json;
    expect(s).toEqual({ pending_count: 1, today_count: 1, week_count: 2, confirmed_today: 1 });
  });

  it('chat-stats sums usage for today / 7 / 30 days / total', async () => {
    const now = new Date();
    const ago = (d: number) => new Date(now.getTime() - d * 86_400_000).toISOString();
    for (const [at, tokens, cost] of [
      [ago(0), 100, 0.01],
      [ago(3), 50, 0.02],
      [ago(20), 10, 0.5],
      [ago(90), 1, 1],
    ] as const) {
      await env.DB.prepare(
        'INSERT INTO chat_usage (input_tokens, output_tokens, total_tokens, estimated_cost, language, created_at) VALUES (1,1,?,?,?,?)'
      )
        .bind(tokens, cost, 'en', at)
        .run();
    }
    const s = (await (
      await call('/api/receptionist/chat-stats', { headers: ADMIN })
    ).json()) as Json;
    expect(s.today).toEqual({ tokens: 100, cost: 0.01, messages: 1 });
    expect(s.week).toEqual({ tokens: 150, cost: 0.03, messages: 2 });
    expect(s.month.messages).toBe(3);
    expect(s.total).toEqual({ tokens: 161, cost: 1.53, messages: 4 });
  });
});

describe('bookings list / get', () => {
  it('filters by status and search, pending first, counts', async () => {
    const a = await seedBooking({ status: 'confirmed', name: 'Zana Filtro' });
    const b = await seedBooking({ status: 'pending', name: 'Zana Altro' });
    await seedBooking({
      status: 'pending',
      name: 'Zana Cancellata',
      deleted_at: new Date().toISOString(),
    });
    const all = (await (
      await call('/api/receptionist/bookings?search=zana', { headers: ADMIN })
    ).json()) as Json;
    expect(all.success).toBe(true);
    expect(all.bookings.map((x: Json) => x.id)).toEqual([b, a]);
    expect(all.total).toBe(2);
    expect(all.pending_count).toBe(1);
    const conf = (await (
      await call('/api/receptionist/bookings?status=confirmed&search=Filtro', { headers: ADMIN })
    ).json()) as Json;
    expect(conf.bookings.map((x: Json) => x.id)).toEqual([a]);
  });

  it('date range, limit and offset', async () => {
    const d1 = futureDay(40),
      d2 = futureDay(41);
    await seedBooking({ preferred_date: d1, name: 'Range One' });
    await seedBooking({ preferred_date: d2, name: 'Range Two' });
    const r = (await (
      await call(`/api/receptionist/bookings?date_from=${d1}&date_to=${d2}&limit=1&offset=1`, {
        headers: ADMIN,
      })
    ).json()) as Json;
    expect(r.total).toBe(2);
    expect(r.bookings).toHaveLength(1);
  });

  it('get one; 404 for unknown and soft-deleted', async () => {
    const id = await seedBooking();
    const one = (await (
      await call(`/api/receptionist/bookings/${id}`, { headers: ADMIN })
    ).json()) as Json;
    expect(one.success).toBe(true);
    expect(one.booking.id).toBe(id);
    expect(
      (await call(`/api/receptionist/bookings/${crypto.randomUUID()}`, { headers: ADMIN })).status
    ).toBe(404);
    const gone = await seedBooking({ deleted_at: new Date().toISOString() });
    expect((await call(`/api/receptionist/bookings/${gone}`, { headers: ADMIN })).status).toBe(404);
  });
});

describe('confirm / cancel / status', () => {
  it('confirm sets the fields, updated_at, sends the email and flags it', async () => {
    const f = mockFetch(() => new Response('{}', { status: 200 }));
    const id = await seedBooking({ updated_at: '2020-01-01T00:00:00.000Z' });
    const date = futureDay(5);
    const res = await patchJson(`/api/receptionist/bookings/${id}/confirm`, {
      confirmed_date: date,
      confirmed_time: '10:30',
      send_whatsapp: true,
      send_email: true,
      notes: 'bring x-ray',
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as Json;
    expect(body).toMatchObject({
      success: true,
      message: 'Booking confirmed',
      whatsapp_sent: false,
      email_sent: true,
    });
    expect(body.booking).toMatchObject({
      status: 'confirmed',
      confirmed_date: date,
      confirmed_time: '10:30',
      notes: 'bring x-ray',
    });
    expect(body.booking.updated_at > '2020-01-01').toBe(true);
    expect(body.booking.confirmed_at).toBeTruthy();
    const row = await env.DB.prepare(
      'SELECT confirmation_email_sent, whatsapp_sent FROM bookings WHERE id = ?'
    )
      .bind(id)
      .first<Json>();
    expect(row).toEqual({ confirmation_email_sent: 1, whatsapp_sent: 0 });
    // Only Resend was called: WhatsApp is off without its secrets.
    expect(f.mock.calls.map(c => String(c[0]))).toEqual(['https://api.resend.com/emails']);
  });

  it('confirm keeps notes when none are sent; 400 on a bad date; 404 unknown', async () => {
    const id = await seedBooking({ notes: 'keep me' });
    const ok = (await (
      await patchJson(`/api/receptionist/bookings/${id}/confirm`, {
        confirmed_date: futureDay(),
        confirmed_time: '09:00',
      })
    ).json()) as Json;
    expect(ok.booking.notes).toBe('keep me');
    expect(
      (
        await patchJson(`/api/receptionist/bookings/${id}/confirm`, {
          confirmed_date: 'tomorrow',
          confirmed_time: '09:00',
        })
      ).status
    ).toBe(400);
    expect(
      (
        await patchJson(`/api/receptionist/bookings/${crypto.randomUUID()}/confirm`, {
          confirmed_date: futureDay(),
          confirmed_time: '9',
        })
      ).status
    ).toBe(404);
  });

  it('confirm sends WhatsApp when configured', async () => {
    const f = mockFetch(() => new Response('{}', { status: 200 }));
    const id = await seedBooking();
    const res = await call(
      `/api/receptionist/bookings/${id}/confirm`,
      {
        method: 'PATCH',
        headers: { ...ADMIN, 'content-type': 'application/json' },
        body: JSON.stringify({
          confirmed_date: futureDay(),
          confirmed_time: '11:00',
          send_whatsapp: true,
          send_email: false,
        }),
      },
      { WHATSAPP_PHONE_NUMBER_ID: '123', WHATSAPP_ACCESS_TOKEN: 'tok' }
    );
    expect(((await res.json()) as Json).whatsapp_sent).toBe(true);
    expect(String(f.mock.calls[0][0])).toBe('https://graph.facebook.com/v18.0/123/messages');
  });

  it('cancel stores the reason and notifies by email when asked', async () => {
    const f = mockFetch(() => new Response('{}', { status: 200 }));
    const id = await seedBooking();
    const body = (await (
      await patchJson(`/api/receptionist/bookings/${id}/cancel`, {
        reason: 'ill',
        notify_patient: true,
      })
    ).json()) as Json;
    expect(body).toMatchObject({ success: true, message: 'Booking cancelled' });
    expect(body.booking).toMatchObject({ status: 'cancelled', cancellation_reason: 'ill' });
    expect(f).toHaveBeenCalledOnce();
  });

  it('status: valid values only', async () => {
    const id = await seedBooking();
    expect(
      (await patchJson(`/api/receptionist/bookings/${id}/status`, { status: 'archived' })).status
    ).toBe(400);
    const ok = (await (
      await patchJson(`/api/receptionist/bookings/${id}/status`, { status: 'no_show' })
    ).json()) as Json;
    expect(ok).toMatchObject({
      success: true,
      message: 'Status updated',
      booking: { status: 'no_show' },
    });
  });
});
