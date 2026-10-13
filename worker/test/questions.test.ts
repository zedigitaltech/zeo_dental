import { env } from 'cloudflare:test';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  parseHasXray,
  parseTravelTimeframe,
  parseTreatmentInterest,
} from '../src/lib/bookingQuestions';
import { renderClinicNotification } from '../src/lib/emailTemplates';
import { ADMIN, EXPORT, call, mockFetch, postJson, seedBooking } from './helpers';

type Json = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
const resendOk = () => mockFetch(() => new Response(JSON.stringify({ id: 'x' }), { status: 200 }));

afterEach(() => vi.restoreAllMocks());

const valid = {
  name: 'Domanda Prova',
  email: 'domanda@example.invalid',
  phone: '+39 333 000 2222',
  service: 'X',
};

const stored = async (body: Json) => {
  resendOk();
  const res = await postJson('/api/booking', { ...valid, ...body });
  expect(res.status).toBe(201);
  const { booking } = (await res.json()) as Json;
  return (await env.DB.prepare(
    'SELECT treatment_interest, has_xray, travel_timeframe FROM bookings WHERE id = ?'
  )
    .bind(booking.id)
    .first<Json>())!;
};

describe('parsers', () => {
  it('accept only the known values', () => {
    expect(parseTreatmentInterest(' Implants ')).toBe('implants');
    expect(parseTreatmentInterest('crowns')).toBeNull();
    expect(parseTravelTimeframe('1_to_3_months')).toBe('1_to_3_months');
    expect(parseTravelTimeframe('soon')).toBeNull();
    expect(parseHasXray(true)).toBe(1);
    expect(parseHasXray(0)).toBe(0);
    expect(parseHasXray('yes')).toBeNull();
    expect(parseHasXray(2)).toBeNull();
  });
});

describe('POST /api/booking: Meta-form questions', () => {
  it('stores valid answers', async () => {
    expect(
      await stored({
        treatment_interest: 'veneers',
        has_xray: true,
        travel_timeframe: 'within_30_days',
      })
    ).toEqual({ treatment_interest: 'veneers', has_xray: 1, travel_timeframe: 'within_30_days' });
    expect(
      await stored({
        treatment_interest: 'unsure',
        has_xray: false,
        travel_timeframe: 'over_3_months',
      })
    ).toEqual({ treatment_interest: 'unsure', has_xray: 0, travel_timeframe: 'over_3_months' });
  });

  it('stores NULL for missing or invalid answers, booking still accepted', async () => {
    const none = { treatment_interest: null, has_xray: null, travel_timeframe: null };
    expect(await stored({})).toEqual(none);
    expect(
      await stored({
        treatment_interest: "implants'; DROP TABLE bookings;--",
        has_xray: 'yes',
        travel_timeframe: 42,
      })
    ).toEqual(none);
  });

  it('clinic notification shows the answers in Albanian', async () => {
    const f = resendOk();
    await postJson('/api/booking', {
      ...valid,
      treatment_interest: 'implants',
      has_xray: true,
      travel_timeframe: '1_to_3_months',
    });
    const mail = JSON.parse(String((f.mock.calls[0][1] as RequestInit).body)) as Json;
    expect(mail.text).toContain('Interesi për trajtim: Implante dentare');
    expect(mail.text).toContain('Ka foto / radiografi: Po');
    expect(mail.text).toContain('Kur dëshiron të vijë: Për 1 deri në 3 muaj');
    expect(mail.html).toContain('Implante dentare');
  });

  it('clinic notification omits the rows for an old booking without answers', () => {
    const mail = renderClinicNotification({ name: 'Vecchio', service: 'X' });
    expect(mail.text).not.toContain('Interesi për trajtim');
    expect(mail.text).not.toContain('radiografi');
    expect(renderClinicNotification({ name: 'N', service: 'X', has_xray: 0 }).text).toContain(
      'Ka foto / radiografi: Jo'
    );
  });
});

describe('dashboard and export', () => {
  it('receptionist API returns the answers (has_xray as a boolean)', async () => {
    const id = await seedBooking({
      treatment_interest: 'implants',
      has_xray: 1,
      travel_timeframe: 'within_30_days',
    });
    const r = (await (
      await call(`/api/receptionist/bookings/${id}`, { headers: ADMIN })
    ).json()) as Json;
    const b = r.booking ?? r;
    expect(b).toMatchObject({
      treatment_interest: 'implants',
      has_xray: true,
      travel_timeframe: 'within_30_days',
    });
  });

  it('export carries travel_timeframe but never treatment_interest or has_xray', async () => {
    await seedBooking({
      treatment_interest: 'veneers',
      has_xray: 1,
      travel_timeframe: '1_to_3_months',
    });
    for (const p of ['/api/export/leads', '/api/export/appointments']) {
      const res = await call(p, { headers: EXPORT });
      const raw = await res.text();
      expect(raw).not.toContain('treatment_interest');
      expect(raw).not.toContain('has_xray');
      expect(raw).not.toContain('veneers');
      const body = JSON.parse(raw) as Json;
      expect(body.items.some((i: Json) => i.travel_timeframe === '1_to_3_months')).toBe(true);
    }
  });
});
