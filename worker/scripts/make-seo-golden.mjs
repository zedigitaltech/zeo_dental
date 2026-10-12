/**
 * Records what the Fastify server (the Fly fallback) renders for every public route in every
 * language, so the Worker can be held to byte-identical output (test/seo.test.ts).
 *
 *   node scripts/make-seo-golden.mjs        (from worker/, needs server/node_modules)
 *
 * Starts server/src/index.ts locally on a spare port with no DATABASE_URL (the Postgres plugin
 * then runs in its mock mode), with test/fixtures/index.html as the template, and fetches
 * 15 routes × 8 languages + /sitemap.xml. Writes sha256 per route to test/fixtures/seo-golden.json.
 * Nothing leaves this machine.
 */
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const worker = join(here, '..');
const server = join(worker, '..', 'server');
const publicDir = join(server, 'public');
const PORT = 3917;

const LANGS = ['sq', 'en', 'it', 'de', 'fr', 'tr', 'el', 'es'];
const ROUTES = [
  '/', '/treatments', '/treatments/implantology', '/treatments/prosthetics', '/treatments/aligners',
  '/treatments/orthodontics', '/treatments/crowns', '/treatments/endodontics', '/philosophy', '/team',
  '/cases', '/book', '/packages', '/privacy-policy', '/terms-of-service',
];

if (existsSync(publicDir)) {
  console.error(`${publicDir} exists; refusing to overwrite it.`);
  process.exit(1);
}
mkdirSync(publicDir);
copyFileSync(join(worker, 'test', 'fixtures', 'index.html'), join(publicDir, 'index.html'));

const child = spawn(join(server, 'node_modules', '.bin', 'tsx'), ['src/index.ts'], {
  cwd: server,
  env: { PATH: process.env.PATH, PORT: String(PORT), HOST: '127.0.0.1', NODE_ENV: 'production', LOG_LEVEL: 'error' },
  stdio: ['ignore', 'inherit', 'inherit'],
});
const cleanup = () => {
  try { child.kill('SIGTERM'); } catch { /* gone */ }
  rmSync(publicDir, { recursive: true, force: true });
};
process.on('exit', cleanup);

const base = `http://127.0.0.1:${PORT}`;
for (let i = 0; ; i++) {
  try { if ((await fetch(`${base}/health`)).ok) break; } catch { /* not yet */ }
  if (i > 100) throw new Error('server did not start');
  await new Promise((r) => setTimeout(r, 200));
}

const sha = (s) => createHash('sha256').update(s, 'utf8').digest('hex');
const pages = {};
for (const lang of LANGS) {
  for (const route of ROUTES) {
    const path = route === '/' ? `/${lang}/` : `/${lang}${route}`;
    const res = await fetch(base + path, { redirect: 'manual' });
    if (res.status !== 200) throw new Error(`${path} → ${res.status}`);
    pages[path] = sha(await res.text());
  }
}
const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
writeFileSync(
  join(worker, 'test', 'fixtures', 'seo-golden.json'),
  JSON.stringify({ source: 'server/src/index.ts renderHtml + generateSitemap', pages, sitemap: sha(sitemap) }, null, 2) + '\n',
);
console.log(`recorded ${Object.keys(pages).length} pages + sitemap`);
process.exit(0);
