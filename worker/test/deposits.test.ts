import { env } from 'cloudflare:test';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Env } from '../src/env';
import { isPaidOrder, resetPokTokenCache, type PokOrder } from '../src/lib/pok';
import { depositConfig } from '../src/routes/deposits';
import { ADMIN, EXPORT, call, mockFetch, postJson, seedBooking } from './helpers';

type Json = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const AGENT_TOKEN = 'test-agent-token-0123456789abcdef0123';
const AGENT = { authorization: `Bearer ${AGENT_TOKEN}` };
const CFG: Partial<Env> = {
  POK_KEY_ID: 'test-key-id',
  POK_KEY_SECRET: 'test-key-secret',
  POK_MERCHANT_ID: 'merchant-1',
  AGENT_TOKEN,
  DEPOSIT_AMOUNT: '100.00',
  DEPOSIT_CURRENCY: 'EUR',
};
const POK = 'https://api-staging.pokpay.io';

interface Pok {
  calls: Array<{ url: string; init?: RequestInit }>;
  mails: Json[];
  order: Json;
  createStatus: number;
}

/** A fake POK (+ Resend). `order` is what GET /sdk-orders/{id} returns. */
function fakePok(): Pok {
  const state: Pok = {
    calls: [],
    mails: [],
    createStatus: 200,
    order: {
      id: 'ord-1',
      amount: 100,
      capturedAmount: 0,
      currencyCode: 'EUR',
      expiresAt: new Date(Date.now() + 72 * 3600_000).toISOString(),
      self: { confirmUrl: 'https://checkout.example.invalid/ord-1' },
    },
  };
  let n = 0;
  mockFetch((url, init) => {
    if (url.startsWith('https://api.resend.com')) {
      state.mails.push(JSON.parse(String(init?.body)));
      return Response.json({ id: 'mail' });
    }
    state.calls.push({ url, init });
    if (url === `${POK}/auth/sdk/login`) return Response.json({ data: { accessToken: 'tok-1' } });
    if (url === `${POK}/merchants/merchant-1/sdk-orders`) {
      if (state.createStatus !== 200) return new Response('{}', { status: state.createStatus });
      const id = `ord-${++n}`;
      state.order = {
        ...state.order,
        id,
        self: { confirmUrl: `https://checkout.example.invalid/${id}` },
      };
      return Response.json({ data: { sdkOrder: state.order } });
    }
    if (url.startsWith(`${POK}/sdk-orders/`))
      return Response.json({ data: { sdkOrder: state.order } });
    return new Response('unexpected', { status: 599 });
  });
  return state;
}

const create = (body: Json, headers: Record<string, string> = AGENT, ip?: string) =>
  postJson('/api/agent/deposits', body, { headers, ip }, CFG);

const webhook = (d: string, t: string) =>
  call(`/api/pay/pok/webhook?d=${d}&t=${t}`, { method: 'POST', body: '{"anything":1}' }, CFG);

const tokenOf = async (id: string) =>
  (await env.DB.prepare('SELECT webhook_token FROM deposits WHERE id = ?').bind(id).first<Json>())!
    .webhook_token as string;

beforeEach(() => resetPokTokenCache());
afterEach(() => vi.restoreAllMocks());

describe('inert until configured', () => {
  it('every deposit endpoint answers 503 without the POK secrets', async () => {
    const pok = fakePok();
    expect((await postJson('/api/agent/login', { password: AGENT_TOKEN })).status).toBe(503);
    expect((await postJson('/api/agent/deposits', { name: 'x' }, { headers: ADMIN })).status).toBe(
      503
    );
    expect((await call('/api/agent/deposits', { headers: ADMIN })).status).toBe(503);
    expect(
      (await call(`/api/pay/pok/webhook?d=${crypto.randomUUID()}&t=x`, { method: 'POST' })).status
    ).toBe(503);
    expect(pok.calls).toHaveLength(0);
  });

  it('503 when only AGENT_TOKEN or the amount is missing', async () => {
    fakePok();
    for (const over of [{ AGENT_TOKEN: undefined }, { DEPOSIT_AMOUNT: 'TBD' }]) {
      const res = await postJson(
        '/api/agent/deposits',
        { name: 'x' },
        { headers: ADMIN },
        {
          ...CFG,
          ...over,
        }
      );
      expect(res.status).toBe(503);
      expect(await res.json()).toEqual({ success: false, error: 'Deposits not configured' });
    }
  });
});

describe('agent auth', () => {
  it('login returns the token on the right password, 401 otherwise', async () => {
    const ok = await postJson('/api/agent/login', { password: AGENT_TOKEN }, {}, CFG);
    expect(await ok.json()).toEqual({ success: true, token: AGENT_TOKEN });
    expect((await postJson('/api/agent/login', { password: 'nope' }, {}, CFG)).status).toBe(401);
  });

  it('agent and admin tokens both work; admin deposits are labelled reception', async () => {
    fakePok();
    const a = (await (await create({ name: 'Uno', email: 'uno@example.invalid' })).json()) as Json;
    expect(a.deposit.created_by).toBe('agent');
    const b = (await (
      await create({ name: 'Due', email: 'due@example.invalid' }, ADMIN)
    ).json()) as Json;
    expect(b.deposit.created_by).toBe('reception');
    expect((await create({ name: 'x' }, { authorization: 'Bearer wrong' })).status).toBe(401);
    expect((await call('/api/agent/deposits', {}, CFG)).status).toBe(401);
  });

  it('locks the address out after 10 wrong tokens, even with the right one', async () => {
    fakePok();
    const ip = '203.0.113.77';
    for (let i = 0; i < 10; i++) {
      expect((await create({ name: 'x' }, { authorization: 'Bearer wrong' }, ip)).status).toBe(401);
    }
    expect((await create({ name: 'x', email: 'x@example.invalid' }, AGENT, ip)).status).toBe(429);
  });
});

describe('POST /api/agent/deposits', () => {
  it('creates the POK order with the right payload, stores the row, mails Italian, builds WhatsApp', async () => {
    const pok = fakePok();
    const res = await create({
      name: 'Mario Prova',
      phone: '+39 333 123 4567',
      email: 'Mario@Example.invalid',
      call_list_ref: 'riga 42',
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as Json;
    const id = body.deposit.id as string;

    const [login, order] = pok.calls;
    expect(JSON.parse(String(login.init?.body))).toEqual({
      keyId: 'test-key-id',
      keySecret: 'test-key-secret',
    });
    expect(order.url).toBe(`${POK}/merchants/merchant-1/sdk-orders`);
    expect(new Headers(order.init?.headers).get('authorization')).toBe('tok-1');
    const token = await tokenOf(id);
    expect(token).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.parse(String(order.init?.body))).toEqual({
      amount: '100.00',
      currencyCode: 'EUR',
      autoCapture: true,
      products: [],
      webhookUrl: `https://zeodentalclinic.com/api/pay/pok/webhook?d=${id}&t=${token}`,
      redirectUrl: 'https://zeodentalclinic.com/it/pay/thanks',
      failRedirectUrl: 'https://zeodentalclinic.com/it/pay/failed',
      merchantCustomReference: id,
      description: 'Acconto — Zeo Dental Clinic',
      expiresAfterMinutes: 4320,
    });

    expect(body.deposit).toMatchObject({
      status: 'pending',
      amount_cents: 10000,
      currency: 'EUR',
      language: 'it',
      email: 'mario@example.invalid',
      provider_order_id: 'ord-1',
      call_list_ref: 'riga 42',
    });
    expect(body.deposit).not.toHaveProperty('webhook_token');
    expect(JSON.stringify(body)).not.toContain(token);
    expect(body.confirm_url).toBe('https://checkout.example.invalid/ord-1');

    expect(body.email_sent).toBe(true);
    expect(pok.mails).toHaveLength(1);
    expect(pok.mails[0].to).toBe('mario@example.invalid');
    expect(pok.mails[0].subject).toBe('Link per il pagamento dell’acconto – Zeo Dental Clinic');
    expect(pok.mails[0].html).toContain('https://checkout.example.invalid/ord-1');
    expect(pok.mails[0].text).toContain('direttamente a Zeo Dental Clinic');
    for (const m of [pok.mails[0].html, pok.mails[0].text])
      expect(m).not.toMatch(/sconto|offerta|promozion|garanzi|rimborso/i);

    const wa = new URL(body.whatsapp_url);
    expect(wa.origin + wa.pathname).toBe('https://wa.me/393331234567');
    const text = wa.searchParams.get('text')!;
    expect(text).toMatch(
      /^Gentile Mario Prova, ecco il link per pagare l'acconto di 100,00\s€ a Zeo Dental Clinic\./
    );
    expect(text).toContain('https://checkout.example.invalid/ord-1');
  });

  it('send_email:false and phone-only deposits send no email', async () => {
    const pok = fakePok();
    const a = (await (
      await create({ name: 'A', email: 'a@example.invalid', send_email: false })
    ).json()) as Json;
    const b = (await (await create({ name: 'B', phone: '3331112222' })).json()) as Json;
    expect([a.email_sent, b.email_sent]).toEqual([false, false]);
    expect(pok.mails).toHaveLength(0);
    expect(b.whatsapp_url).toMatch(/^https:\/\/wa\.me\/393331112222\?text=/);
  });

  it('validates input', async () => {
    fakePok();
    expect((await create({ name: 'x' })).status).toBe(400);
    expect((await create({ phone: '+39 333 123 4567' })).status).toBe(400);
    expect((await create({ name: 'x', email: 'bad' })).status).toBe(400);
    expect((await create({ name: 'x', email: 'x@example.invalid', language: 'xx' })).status).toBe(
      400
    );
    expect(
      (await create({ name: 'x', email: 'x@example.invalid', booking_id: 'nope' })).status
    ).toBe(400);
  });

  it('reuses an open link for the same phone (any format) unless force is set', async () => {
    const pok = fakePok();
    const a = (await (await create({ name: 'A', phone: '+39 333 999 8888' })).json()) as Json;
    const b = (await (await create({ name: 'A', phone: '0039-333-9998888' })).json()) as Json;
    expect(b.reused).toBe(true);
    expect(b.deposit.id).toBe(a.deposit.id);
    const creates = () => pok.calls.filter(x => x.url.endsWith('/sdk-orders')).length;
    expect(creates()).toBe(1);
    const c = (await (
      await create({ name: 'A', phone: '3339998888', force: true })
    ).json()) as Json;
    expect(c.reused).toBe(false);
    expect(c.deposit.id).not.toBe(a.deposit.id);
    expect(creates()).toBe(2);
  });

  it('a POK error marks the row failed and answers 502', async () => {
    const pok = fakePok();
    pok.createStatus = 500;
    const res = await create({ name: 'F', email: 'f@example.invalid' });
    expect(res.status).toBe(502);
    const row = await env.DB.prepare(
      "SELECT status FROM deposits WHERE email = 'f@example.invalid'"
    ).first<Json>();
    expect(row!.status).toBe('failed');
  });

  it('links a website booking when booking_id is given', async () => {
    fakePok();
    const bookingId = await seedBooking();
    const res = (await (
      await create({ name: 'B', email: 'bk@example.invalid', booking_id: bookingId }, ADMIN)
    ).json()) as Json;
    expect(res.deposit.booking_id).toBe(bookingId);
    const list = (await (
      await call(`/api/agent/deposits?booking_id=${bookingId}`, { headers: ADMIN }, CFG)
    ).json()) as Json;
    expect(list.deposits.map((d: Json) => d.deposit.id)).toEqual([res.deposit.id]);
  });
});

describe('POST /api/pay/pok/webhook', () => {
  it('wrong token, unknown id and bad id all answer 401; POK is never asked', async () => {
    const pok = fakePok();
    const { deposit } = (await (
      await create({ name: 'W', email: 'w@example.invalid' })
    ).json()) as Json;
    const before = pok.calls.length;
    expect((await webhook(deposit.id, 'f'.repeat(64))).status).toBe(401);
    expect((await webhook(crypto.randomUUID(), 'f'.repeat(64))).status).toBe(401);
    expect((await webhook('not-a-uuid', 'x')).status).toBe(401);
    expect(pok.calls.length).toBe(before);
  });

  it('verifies with GET, marks paid once, sends clinic + receipt exactly once', async () => {
    const pok = fakePok();
    const { deposit } = (await (
      await create({ name: 'Paga', email: 'paga@example.invalid' })
    ).json()) as Json;
    const t = await tokenOf(deposit.id);
    pok.mails.length = 0;

    // Not paid yet: stays pending, nothing sent.
    expect((await webhook(deposit.id, t)).status).toBe(200);
    expect(pok.calls.at(-1)!.url).toBe(`${POK}/sdk-orders/ord-1`);
    expect(pok.mails).toHaveLength(0);

    pok.order = { ...pok.order, capturedAmount: 100 };
    expect(await (await webhook(deposit.id, t)).json()).toEqual({ received: true });
    const row = await env.DB.prepare(
      'SELECT status, paid_at, notified_at FROM deposits WHERE id = ?'
    )
      .bind(deposit.id)
      .first<Json>();
    expect(row!.status).toBe('paid');
    expect(row!.paid_at).toBeTruthy();
    const subjects = pok.mails.map(m => m.subject as string).sort();
    expect(subjects[0]).toBe('Acconto ricevuto – Zeo Dental Clinic');
    expect(subjects[1]).toMatch(/^Parapagim i paguar: Paga – .*100/);
    expect(pok.mails.find(m => m.subject.startsWith('Parapagim'))!.to).toEqual([
      'clinic@example.invalid',
    ]);

    await webhook(deposit.id, t);
    await call('/api/agent/deposits', { headers: AGENT }, CFG);
    expect(pok.mails).toHaveLength(2);
  });

  it('a capture with the wrong amount or currency is not paid', async () => {
    const pok = fakePok();
    for (const wrong of [
      { amount: 50, capturedAmount: 50 },
      { currencyCode: 'ALL', capturedAmount: 100 },
      { capturedAmount: 99.99 },
    ]) {
      const { deposit } = (await (
        await create({ name: 'M', email: 'm@example.invalid', force: true })
      ).json()) as Json;
      pok.order = { ...pok.order, ...wrong };
      await webhook(deposit.id, await tokenOf(deposit.id));
      const row = await env.DB.prepare('SELECT status FROM deposits WHERE id = ?')
        .bind(deposit.id)
        .first<Json>();
      expect(row!.status).toBe('pending');
      pok.order = { ...pok.order, amount: 100, currencyCode: 'EUR', capturedAmount: 0 };
    }
  });

  it('re-logs in once on a 401 from POK', async () => {
    const pok = fakePok();
    const { deposit } = (await (
      await create({ name: 'R', email: 'r@example.invalid' })
    ).json()) as Json;
    let first = true;
    vi.restoreAllMocks();
    mockFetch(url => {
      pok.calls.push({ url });
      if (url.endsWith('/auth/sdk/login')) return Response.json({ data: { accessToken: 'tok-2' } });
      if (first) {
        first = false;
        return new Response('{}', { status: 401 });
      }
      if (url.startsWith('https://api.resend.com')) return Response.json({});
      return Response.json({ data: { sdkOrder: { ...pok.order, capturedAmount: 100 } } });
    });
    await webhook(deposit.id, await tokenOf(deposit.id));
    const row = await env.DB.prepare('SELECT status FROM deposits WHERE id = ?')
      .bind(deposit.id)
      .first<Json>();
    expect(row!.status).toBe('paid');
  });
});

describe('list and cancel', () => {
  it('cancels a pending deposit, refuses a paid one (checked with POK first)', async () => {
    const pok = fakePok();
    const a = (await (await create({ name: 'C1', email: 'c1@example.invalid' })).json()) as Json;
    const res = await postJson(
      `/api/agent/deposits/${a.deposit.id}/cancel`,
      {},
      { headers: AGENT },
      CFG
    );
    expect(((await res.json()) as Json).deposit.status).toBe('cancelled');

    const b = (await (await create({ name: 'C2', email: 'c2@example.invalid' })).json()) as Json;
    pok.order = { ...pok.order, capturedAmount: 100 };
    const r2 = await postJson(
      `/api/agent/deposits/${b.deposit.id}/cancel`,
      {},
      { headers: AGENT },
      CFG
    );
    expect(r2.status).toBe(409);
    expect(((await r2.json()) as Json).deposit.status).toBe('paid');
  });

  it('the list refreshes pending deposits from POK, marking expired ones', async () => {
    const pok = fakePok();
    const a = (await (await create({ name: 'E', email: 'e@example.invalid' })).json()) as Json;
    pok.order = { ...pok.order, expiresAt: new Date(Date.now() - 60_000).toISOString() };
    const list = (await (
      await call('/api/agent/deposits', { headers: AGENT }, CFG)
    ).json()) as Json;
    const mine = list.deposits.find((d: Json) => d.deposit.id === a.deposit.id);
    expect(mine.deposit.status).toBe('expired');
    expect(JSON.stringify(list)).not.toContain('webhook_token');
  });
});

describe('GET /api/export/deposits', () => {
  it('returns only the whitelisted fields', async () => {
    const pok = fakePok();
    const { deposit } = (await (
      await create({ name: 'SEGRETO', phone: '+39 333 555 6666', call_list_ref: '17' })
    ).json()) as Json;
    pok.order = { ...pok.order, capturedAmount: 100 };
    await webhook(deposit.id, await tokenOf(deposit.id));
    const res = await call('/api/export/deposits?status=paid', { headers: EXPORT }, CFG);
    expect(res.status).toBe(200);
    const body = (await res.json()) as Json;
    const item = body.items.find((i: Json) => i.ref === deposit.id.slice(0, 8));
    expect(Object.keys(item)).toEqual([
      'ref',
      'phone',
      'email',
      'status',
      'amount',
      'currency',
      'paid_at',
      'call_list_ref',
      'updated_at',
    ]);
    expect(item).toMatchObject({
      status: 'paid',
      amount: '100.00',
      currency: 'EUR',
      call_list_ref: '17',
    });
    const s = JSON.stringify(body);
    expect(s).not.toMatch(/SEGRETO|checkout\.example|webhook/);
    expect((await call('/api/export/deposits', { headers: AGENT }, CFG)).status).toBe(401);
  });
});

describe('agent and pay pages', () => {
  it('are noindex; public pages are not', async () => {
    for (const p of ['/it/agent', '/en/pay/thanks', '/de/pay/failed', '/sq/receptionist']) {
      const res = await call(p);
      expect(res.status).toBe(200);
      expect(res.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    }
    expect((await call('/it/')).headers.get('x-robots-tag')).toBeNull();
    const sitemap = await (await call('/sitemap.xml')).text();
    expect(sitemap).not.toMatch(/agent|\/pay\//);
  });
});

describe('deposit emails', () => {
  it('render in all 8 languages, escape the name, carry the link and the terms rule', async () => {
    const { renderDepositRequestEmail, renderDepositReceiptEmail } =
      await import('../src/lib/depositEmails');
    const { SUPPORTED_EMAIL_LANGUAGES } = await import('../src/lib/emailLanguage');
    for (const language of SUPPORTED_EMAIL_LANGUAGES) {
      const d = {
        id: '12345678-aaaa-bbbb-cccc-1234567890ab',
        name: '<b>X</b>',
        language,
        amount_cents: 10000,
        currency: 'EUR',
        expires_at: '2026-10-16T12:00:00.000Z',
        paid_at: '2026-10-14T09:00:00.000Z',
      };
      const req = renderDepositRequestEmail(d, 'https://checkout.example.invalid/x?a=1&b=2');
      expect(req.html).toContain('&lt;b&gt;X&lt;/b&gt;');
      expect(req.html).not.toContain('<b>X</b>');
      expect(req.html).toContain('https://checkout.example.invalid/x?a=1&amp;b=2');
      expect(req.text).toContain('https://checkout.example.invalid/x?a=1&b=2');
      expect(req.text).toContain('Zeo Dental Clinic');
      expect(req.text).toContain('12345678');
      const withTerms = renderDepositRequestEmail(d, 'https://x.invalid', {
        termsUrl: 'https://zeodentalclinic.com/terms',
      });
      expect(withTerms.text).toContain('https://zeodentalclinic.com/terms');
      const rec = renderDepositReceiptEmail(d);
      expect(rec.html).toContain('&lt;b&gt;X&lt;/b&gt;');
      expect(rec.text).toContain('12345678');
    }
  });
});

describe('security review fixes', () => {
  const statusOf = async (id: string) =>
    (await env.DB.prepare('SELECT status FROM deposits WHERE id = ?').bind(id).first<Json>())!
      .status as string;
  const setPaid = (id: string) =>
    env.DB.prepare("UPDATE deposits SET status = 'paid' WHERE id = ?").bind(id).run();

  it('config: the owner amount (500.00) alone never switches deposits on', () => {
    const full = { ...CFG, DEPOSIT_AMOUNT: '500.00' } as Env;
    expect(depositConfig(full)).toMatchObject({ amountCents: 50000, currency: 'EUR' });
    for (const k of ['POK_KEY_ID', 'POK_KEY_SECRET', 'POK_MERCHANT_ID', 'AGENT_TOKEN'] as const) {
      expect(depositConfig({ ...full, [k]: undefined })).toBeNull();
    }
    expect(depositConfig({ DEPOSIT_AMOUNT: '500.00', DEPOSIT_CURRENCY: 'EUR' } as Env)).toBeNull();
  });

  it('M1: a cancel racing a payment never overwrites paid (409, stays paid)', async () => {
    const pok = fakePok();
    const { deposit } = (await (
      await create({ name: 'Race', email: 'race@example.invalid' })
    ).json()) as Json;
    vi.restoreAllMocks();
    mockFetch(async url => {
      if (url.includes('/auth/sdk/login')) return Response.json({ data: { accessToken: 't' } });
      await setPaid(deposit.id); // the patient pays while POK is being asked
      return Response.json({ data: { sdkOrder: pok.order } });
    });
    const res = await postJson(
      `/api/agent/deposits/${deposit.id}/cancel`,
      {},
      { headers: AGENT },
      CFG
    );
    expect(res.status).toBe(409);
    expect(await statusOf(deposit.id)).toBe('paid');
  });

  it('M1: expiry never overwrites paid', async () => {
    const pok = fakePok();
    const { deposit } = (await (
      await create({ name: 'Exp', email: 'exp@example.invalid' })
    ).json()) as Json;
    vi.restoreAllMocks();
    mockFetch(async url => {
      if (url.includes('/auth/sdk/login')) return Response.json({ data: { accessToken: 't' } });
      await setPaid(deposit.id);
      return Response.json({
        data: { sdkOrder: { ...pok.order, expiresAt: new Date(Date.now() - 1000).toISOString() } },
      });
    });
    await call('/api/agent/deposits', { headers: AGENT }, CFG);
    expect(await statusOf(deposit.id)).toBe('paid');
  });

  it('M2: a double click creates one POK order and one pending row', async () => {
    const pok = fakePok();
    const body = { name: 'Doppio', phone: '+39 333 777 6666' };
    const [a, b] = await Promise.all([create(body), create(body)]);
    expect([a.status, b.status]).toContain(200);
    for (const r of [a, b]) expect([200, 409]).toContain(r.status);
    expect(pok.calls.filter(x => x.url.endsWith('/sdk-orders')).length).toBe(1);
    const n = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM deposits WHERE match_key = 'p337776666' AND status = 'pending'"
    ).first<Json>();
    expect(n!.n).toBe(1);
  });

  it('M2: the database refuses a second pending row for the same contact', async () => {
    const ins = (id: string) =>
      env.DB.prepare(
        `INSERT INTO deposits (id, name, phone, amount_cents, currency, webhook_token, status, match_key)
         VALUES (?, 'X', '1', 1, 'EUR', 't', 'pending', 'p000000001')`
      )
        .bind(id)
        .run();
    await ins(crypto.randomUUID());
    await expect(ins(crypto.randomUUID())).rejects.toThrow(/UNIQUE/);
  });

  it('M3: same phone, another name → 409 conflict; force replaces the old link', async () => {
    const pok = fakePok();
    const a = (await (
      await create({ name: 'Anna Rossi', phone: '+39 333 444 5555' })
    ).json()) as Json;
    const same = (await (
      await create({ name: '  anna   ROSSI ', phone: '3334445555' })
    ).json()) as Json;
    expect(same.reused).toBe(true);
    const res = await create({ name: 'Luca Rossi', phone: '+39 333 444 5555' });
    expect(res.status).toBe(409);
    const body = (await res.json()) as Json;
    expect(body.reused).toBe(false);
    expect(body.conflict).toMatchObject({ name: 'Anna Rossi', status: 'pending' });
    expect(body).not.toHaveProperty('confirm_url');
    const forced = (await (
      await create({ name: 'Luca Rossi', phone: '+39 333 444 5555', force: true })
    ).json()) as Json;
    expect(forced.deposit.id).not.toBe(a.deposit.id);
    expect(await statusOf(a.deposit.id)).toBe('cancelled');
    expect(pok.calls.filter(x => x.url.endsWith('/sdk-orders')).length).toBe(2);
  });

  it('L5: isPaidOrder needs our order id, our reference and an explicit currency', () => {
    const d = { id: 'dep-1', provider_order_id: 'ord-9', amount_cents: 50000, currency: 'EUR' };
    const o: PokOrder = {
      id: 'ord-9',
      amount: 500,
      capturedAmount: 500,
      currencyCode: 'EUR',
      expiresAt: null,
      confirmUrl: null,
      merchantCustomReference: 'dep-1',
    };
    expect(isPaidOrder(o, d)).toBe(true);
    expect(isPaidOrder({ ...o, merchantCustomReference: null }, d)).toBe(true);
    expect(isPaidOrder({ ...o, id: 'ord-other' }, d)).toBe(false);
    expect(isPaidOrder({ ...o, merchantCustomReference: 'dep-2' }, d)).toBe(false);
    expect(isPaidOrder({ ...o, currencyCode: null }, d)).toBe(false);
    expect(isPaidOrder(o, { ...d, provider_order_id: null })).toBe(false);
  });

  it('L5: a POK order without currencyCode is not marked paid', async () => {
    const pok = fakePok();
    const { deposit } = (await (
      await create({ name: 'Cur', email: 'cur@example.invalid' })
    ).json()) as Json;
    pok.order = { ...pok.order, capturedAmount: 100, currencyCode: undefined };
    await webhook(deposit.id, await tokenOf(deposit.id));
    expect(await statusOf(deposit.id)).toBe('pending');
  });
});
