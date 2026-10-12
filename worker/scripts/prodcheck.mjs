#!/usr/bin/env node
/**
 * Delivery-chain smoke test against a deployed Worker (workers.dev before cutover, the domain after).
 *
 *   ADMIN_TOKEN=… SHEETS_EXPORT_TOKEN=… PRODCHECK_EMAIL=<a test inbox you can read> \
 *     node scripts/prodcheck.mjs --base https://zeo-dental.<account>.workers.dev
 *
 * Flags: --no-chat (skip the one real Gemini call), --no-cleanup (keep the test row visible),
 *        --local (cleanup against the local D1, for a run against `npm run dev`).
 *
 * What it proves, in order: static assets + _headers, the Worker's headers/CSP, language redirect,
 * SEO HTML, sitemap, 404s, a tagged test booking (clinic notification goes to MAIL_TO — set MAIL_TO
 * to a test inbox for the first run, or warn the clinic), a synthetic JPEG upload to R2 and its
 * admin download byte-for-byte, a confirmation e-mail to PRODCHECK_EMAIL (check that inbox), the
 * export feeds, and one chat answer from Gemini. Finally the test booking and its file row are
 * soft-deleted with `wrangler d1 execute` (deleted_at; the R2 object stays — nothing is deleted).
 * Exit code 1 if any check fails. Prints no secrets.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const flag = f => argv.includes(f);
const base = (argv[argv.indexOf('--base') + 1] || '').replace(/\/$/, '');
const { ADMIN_TOKEN, SHEETS_EXPORT_TOKEN, PRODCHECK_EMAIL } = process.env;
if (
  !argv.includes('--base') ||
  !base.startsWith('http') ||
  !ADMIN_TOKEN ||
  !SHEETS_EXPORT_TOKEN ||
  !PRODCHECK_EMAIL
) {
  console.error(
    'usage: ADMIN_TOKEN=… SHEETS_EXPORT_TOKEN=… PRODCHECK_EMAIL=… node scripts/prodcheck.mjs --base <url> [--no-chat] [--no-cleanup] [--local]'
  );
  process.exit(2);
}

let pass = 0;
let fail = 0;
const ok = (name, cond, detail = '') => {
  if (cond) {
    pass++;
    console.log(`  PASS  ${name}`);
  } else {
    fail++;
    console.log(`  FAIL  ${name} ${detail}`);
  }
};
const get = (p, init = {}) => fetch(base + p, { redirect: 'manual', ...init });
const admin = { authorization: `Bearer ${ADMIN_TOKEN}` };

const expected = Object.fromEntries(
  readFileSync(join(here, '..', 'test', 'fixtures', 'fly-headers.txt'), 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#'))
    .map(l => [l.slice(0, l.indexOf(':')).trim(), l.slice(l.indexOf(':') + 1).trim()])
);
const headersMatch = res =>
  Object.entries(expected)
    .filter(([k, v]) => res.headers.get(k) !== v)
    .map(([k]) => k);

console.log(`\nZeo Dental production check: ${base}\n`);

// --- site
const health = await get('/health');
ok('GET /health 200 ok', health.status === 200 && (await health.json()).status === 'ok');
const root = await get('/');
ok(
  'GET / redirects 302 to /{lang}/',
  root.status === 302 && /^\/(sq|en|it|de|fr|tr|el|es)\/$/.test(root.headers.get('location') ?? ''),
  root.headers.get('location') ?? ''
);
const en = await get('/en/');
const enHtml = await en.text();
ok(
  'GET /en/ 200 html with injected tags',
  en.status === 200 && enHtml.includes('<html lang="en"') && enHtml.includes('hreflang="x-default"')
);
ok('GET /en/ references built JS bundle', /src="\/assets\/index-[\w-]+\.js"/.test(enHtml));
ok('Worker headers = Fly headers', headersMatch(en).length === 0, headersMatch(en).join(','));
const sq = await (await get('/sq/treatments/crowns')).text();
ok('GET /sq/treatments/crowns is Albanian', sq.includes('<html lang="sq"'));
const robots = await get('/robots.txt');
ok(
  'static file served with _headers',
  robots.status === 200 && headersMatch(robots).length === 0,
  headersMatch(robots).join(',')
);
const bundle = enHtml.match(/src="(\/assets\/index-[\w-]+\.js)"/)?.[1];
if (bundle) {
  const js = await (await get(bundle)).text();
  ok('bundle does not contain a Google API key', !/AIza[0-9A-Za-z_-]{20,}/.test(js));
}
const sitemap = await get('/sitemap.xml');
const xml = await sitemap.text();
ok(
  'sitemap.xml has 120 urls',
  sitemap.status === 200 && (xml.match(/<url>/g) ?? []).length === 120
);
ok('missing asset is 404', (await get('/assets/definitely-missing.js')).status === 404);
const unpref = await get('/treatments');
ok(
  'unprefixed path redirects to /en',
  unpref.status === 302 && unpref.headers.get('location') === '/en/treatments'
);
ok('unknown API path is JSON 404', (await get('/api/nope')).status === 404);
const lang = await (await get('/api/detect-language')).json();
ok('detect-language answers', typeof lang.language === 'string');

// --- booking + upload + admin + email
const tag = `PRODCHECK ${new Date().toISOString()}`;
const created = await get('/api/booking', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    name: tag,
    email: PRODCHECK_EMAIL,
    service: 'PRODCHECK — ignore',
    description: 'automated check',
  }),
});
const cb = await created.json();
ok(
  'POST /api/booking 201 (email-only)',
  created.status === 201 && cb.success === true,
  JSON.stringify(cb).slice(0, 120)
);
const id = cb.booking?.id;

if (id) {
  const jpeg = new Uint8Array([
    0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1, 1, 0, 0, 1,
  ]);
  const fd = new FormData();
  fd.append('healthDataConsent', 'true');
  fd.append('files', new File([jpeg], 'prodcheck.jpg', { type: 'image/jpeg' }));
  const up = await get(`/api/booking/${id}/files`, { method: 'POST', body: fd });
  ok('upload to R2 201', up.status === 201, String(up.status));

  const files = await (
    await get(`/api/receptionist/bookings/${id}/files`, { headers: admin })
  ).json();
  const file = files.files?.[0];
  ok('admin lists the file as available', file?.available === true);
  if (file) {
    const dl = await get(`/api/receptionist/bookings/${id}/files/${file.id}`, { headers: admin });
    const bytes = new Uint8Array(await dl.arrayBuffer());
    ok(
      'admin download is byte-identical, no-store attachment',
      dl.status === 200 &&
        bytes.length === jpeg.length &&
        bytes.every((b, i) => b === jpeg[i]) &&
        dl.headers.get('cache-control') === 'no-store' &&
        (dl.headers.get('content-disposition') ?? '').startsWith('attachment')
    );
  }

  const list = await (
    await get(`/api/receptionist/bookings?search=${encodeURIComponent('PRODCHECK')}`, {
      headers: admin,
    })
  ).json();
  ok(
    'receptionist list finds the booking',
    list.bookings?.some(b => b.id === id)
  );

  const day = new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10);
  const conf = await get(`/api/receptionist/bookings/${id}/confirm`, {
    method: 'PATCH',
    headers: { ...admin, 'content-type': 'application/json' },
    body: JSON.stringify({
      confirmed_date: day,
      confirmed_time: '09:00',
      send_whatsapp: false,
      send_email: true,
    }),
  });
  const cj = await conf.json();
  ok(
    'confirm 200 and Resend accepted the e-mail',
    conf.status === 200 && cj.email_sent === true,
    `email_sent=${cj.email_sent}`
  );
  console.log(
    `        → check ${PRODCHECK_EMAIL.replace(/(.).*@/, '$1…@')} for "Takimi juaj është konfirmuar"`
  );

  const ex = { authorization: `Bearer ${SHEETS_EXPORT_TOKEN}` };
  const leads = await (await get('/api/export/leads?limit=500', { headers: ex })).json();
  const mine = leads.items?.find(i => i.ref === id.slice(0, 8));
  ok(
    'export/leads has the booking with whitelisted fields only',
    !!mine &&
      Object.keys(mine).join(',') ===
        'ref,created_at,updated_at,name,phone,email,preferred_date,preferred_time,confirmed_date,confirmed_time,status'
  );
  const appts = await (await get('/api/export/appointments', { headers: ex })).json();
  ok(
    'export/appointments lists it as upcoming',
    appts.items?.some(i => i.ref === id.slice(0, 8))
  );
  ok(
    'export rejects the admin token',
    (await get('/api/export/leads', { headers: admin })).status === 401
  );

  if (!flag('--no-cleanup')) {
    const now = new Date().toISOString();
    const sql = `UPDATE booking_files SET deleted_at = '${now}' WHERE booking_id = '${id}'; UPDATE bookings SET deleted_at = '${now}', updated_at = '${now}' WHERE id = '${id}';`;
    try {
      execFileSync(
        'npx',
        [
          'wrangler',
          'd1',
          'execute',
          'zeo-dental',
          flag('--local') ? '--local' : '--remote',
          '--command',
          sql,
        ],
        { cwd: join(here, '..'), stdio: 'ignore' }
      );
      const gone = await get(`/api/receptionist/bookings/${id}`, { headers: admin });
      ok('test booking soft-deleted (404 now, row kept)', gone.status === 404);
    } catch {
      ok(
        'test booking soft-deleted',
        false,
        `run by hand: npx wrangler d1 execute zeo-dental --remote --command "${sql}"`
      );
    }
  }
}

// --- chat (one real Gemini call)
if (!flag('--no-chat')) {
  const chat = await get('/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      message: 'Ping from the deployment check. Reply with one short sentence.',
      language: 'en',
    }),
  });
  const cj = await chat.json().catch(() => ({}));
  ok(
    'POST /api/chat answers (Gemini key + model live)',
    chat.status === 200 && typeof cj.response === 'string' && cj.response.length > 0,
    `${chat.status} ${cj.error ?? ''}`
  );
}

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
