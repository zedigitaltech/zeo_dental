import { describe, expect, it } from 'vitest';
import { EXPORT, call, futureDay, pastDay, seedBooking } from './helpers';

type Json = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
const FIELDS = [
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
];

const get = async (path: string, headers: Record<string, string> = EXPORT) => {
  const res = await call(path, { headers });
  return { res, body: (await res.json()) as Json };
};

describe('export auth', () => {
  for (const p of ['/api/export/leads', '/api/export/appointments']) {
    it(`${p}: 503 unconfigured, 401 wrong token, admin token is not enough`, async () => {
      expect((await call(p, { headers: EXPORT }, { SHEETS_EXPORT_TOKEN: undefined })).status).toBe(
        503
      );
      expect((await call(p)).status).toBe(401);
      expect(
        (
          await call(p, {
            headers: { authorization: 'Bearer test-admin-token-0123456789abcdef0123' },
          })
        ).status
      ).toBe(401);
    });
  }
});

describe('GET /api/export/leads', () => {
  it('returns only the whitelisted fields, never description, notes, service or files', async () => {
    await seedBooking({
      description: 'SEGRETO-DESC',
      notes: 'SEGRETO-NOTE',
      service: 'SEGRETO-SVC',
    });
    const { res, body } = await get('/api/export/leads');
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('no-store');
    for (const item of body.items) expect(Object.keys(item)).toEqual(FIELDS);
    expect(JSON.stringify(body)).not.toMatch(/SEGRETO/);
    expect(body.items[0].ref).toHaveLength(8);
  });

  it("drops a time without a date (the old form's 'morning' default), keeps a dated one", async () => {
    const undated = await seedBooking({ preferred_time: 'morning' });
    const dated = await seedBooking({ preferred_date: '2026-11-20', preferred_time: 'afternoon' });
    const { body } = await get('/api/export/leads');
    const byRef = (id: string) => body.items.find((i: Json) => i.ref === id.slice(0, 8));
    expect(byRef(undated).preferred_time).toBeNull();
    expect(byRef(dated).preferred_time).toBe('afternoon');
  });

  it('pages with an (updated_at, id) cursor and picks up later updates', async () => {
    const t = (s: number) => new Date(Date.UTC(2026, 9, 1, 10, 0, s)).toISOString();
    const a = await seedBooking({ updated_at: t(1) });
    const b = await seedBooking({ updated_at: t(2) });
    const c = await seedBooking({ updated_at: t(2) });
    const p1 = await get('/api/export/leads?limit=2');
    expect(p1.body.items.map((x: Json) => x.ref)).toEqual([
      a.slice(0, 8),
      [b, c].sort()[0].slice(0, 8),
    ]);
    expect(p1.body.next_cursor).toBeTruthy();
    const p2 = await get(
      `/api/export/leads?limit=2&since=${encodeURIComponent(p1.body.next_cursor)}`
    );
    expect(p2.body.items.map((x: Json) => x.ref)).toEqual([[b, c].sort()[1].slice(0, 8)]);
    const p3 = await get(`/api/export/leads?since=${encodeURIComponent(p2.body.next_cursor)}`);
    expect(p3.body.items).toEqual([]);
    expect(p3.body.next_cursor).toBe(p2.body.next_cursor); // stays put when nothing is new
  });

  it('a plain ISO timestamp works as since', async () => {
    await seedBooking({ updated_at: '2026-01-01T00:00:00.000Z' });
    const id = await seedBooking({ updated_at: '2026-02-01T00:00:00.000Z' });
    const { body } = await get('/api/export/leads?since=2026-01-15T00:00:00.000Z');
    expect(body.items.map((x: Json) => x.ref)).toEqual([id.slice(0, 8)]);
  });

  it('backfill: status=pending returns only pending, non-deleted rows', async () => {
    const p = await seedBooking({ status: 'pending' });
    await seedBooking({ status: 'cancelled' });
    await seedBooking({ status: 'pending', deleted_at: new Date().toISOString() });
    const { body } = await get('/api/export/leads?status=pending');
    expect(body.items.map((x: Json) => x.ref)).toEqual([p.slice(0, 8)]);
    expect((await call('/api/export/leads?status=bogus', { headers: EXPORT })).status).toBe(400);
  });

  it('400 on a malformed cursor', async () => {
    expect((await call('/api/export/leads?since=yesterday', { headers: EXPORT })).status).toBe(400);
  });
});

describe('GET /api/export/appointments', () => {
  it('upcoming pending/confirmed bookings, by confirmed date else preferred date, then undated', async () => {
    const later = await seedBooking({ status: 'pending', preferred_date: futureDay(9) });
    const sooner = await seedBooking({
      status: 'confirmed',
      preferred_date: futureDay(20),
      confirmed_date: futureDay(2),
      confirmed_time: '10:00',
    });
    const undated = await seedBooking({ status: 'pending' });
    await seedBooking({ status: 'pending', preferred_date: pastDay(2) });
    await seedBooking({ status: 'cancelled', preferred_date: futureDay(4) });
    await seedBooking({
      status: 'pending',
      preferred_date: futureDay(4),
      deleted_at: new Date().toISOString(),
    });
    const { res, body } = await get('/api/export/appointments');
    expect(res.status).toBe(200);
    expect(body.items.map((x: Json) => x.ref)).toEqual(
      [sooner, later, undated].map(i => i.slice(0, 8))
    );
    for (const item of body.items) expect(Object.keys(item)).toEqual(FIELDS);
    expect(body.timezone).toBe('Europe/Tirane');
  });
});
