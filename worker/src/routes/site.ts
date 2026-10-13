import { Hono } from 'hono';
import type { AppEnv, Env } from '../env';
import {
  FALLBACK_TEMPLATE,
  generateSitemap,
  getLangFromPath,
  isLanguage,
  languageForCountry,
  renderHtml,
  stripLangPrefix,
} from '../lib/seo';

const STATIC_EXT = /\.(js|css|png|jpg|jpeg|webp|svg|ico|woff2?|ttf|eot|mp4|webm|json|map|txt)$/;
/** Internal or transactional pages: never indexed (not in the sitemap either). */
export const NOINDEX_PATHS = ['/agent', '/receptionist', '/pay/thanks', '/pay/failed'];
const baseUrl = (env: Env) => env.BASE_URL || 'https://zeodentalclinic.com';

/** index.html from static assets, fetched once per isolate (a deploy starts new isolates). */
let template: Promise<string> | null = null;
function getTemplate(env: Env, origin: string): Promise<string> {
  if (!template) {
    template = (async () => {
      if (!env.ASSETS) return FALLBACK_TEMPLATE;
      // With html_handling auto-trailing-slash, "/" is index.html and "/index.html" may redirect.
      for (const p of ['/', '/index.html']) {
        const res = await env.ASSETS.fetch(new Request(origin + p));
        if (res.ok) return res.text();
      }
      console.error('index.html not found in static assets; serving the fallback template');
      return FALLBACK_TEMPLATE;
    })().catch(err => {
      template = null;
      throw err;
    });
  }
  return template;
}

let sitemap: { base: string; xml: string } | null = null;

function cookie(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name)
      return decodeURIComponent(part.slice(i + 1).trim());
  }
  return undefined;
}

const country = (req: Request): unknown =>
  (req as Request & { cf?: { country?: unknown } }).cf?.country;

export const site = new Hono<AppEnv>();

site.get('/health', c => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

site.get('/api/detect-language', c => c.json({ language: languageForCountry(country(c.req.raw)) }));

site.get('/sitemap.xml', c => {
  const base = baseUrl(c.env);
  if (!sitemap || sitemap.base !== base) sitemap = { base, xml: generateSitemap(base) };
  return c.body(sitemap.xml, 200, { 'content-type': 'application/xml' });
});

site.all('/api/*', c => c.json({ error: 'API endpoint not found' }, 404));

/** Everything that is not a static file: "/", /{lang}/..., unprefixed paths, missing files. */
site.all('*', async c => {
  const url = new URL(c.req.url);
  const path = url.pathname;

  if (path === '/') {
    const saved = cookie(c.req.header('cookie'), 'zeo-lang');
    const lang = isLanguage(saved) ? saved : languageForCountry(country(c.req.raw));
    return c.redirect(`/${lang}/`, 302);
  }

  if (STATIC_EXT.test(path)) return c.text('Not found', 404);

  const lang = getLangFromPath(path);
  if (!lang) return c.redirect(`/en${path}`, 302);

  const html = renderHtml(
    await getTemplate(c.env, url.origin),
    lang,
    stripLangPrefix(path),
    baseUrl(c.env)
  );
  const bare = stripLangPrefix(path).replace(/\/+$/, '') || '/';
  const headers: Record<string, string> = { 'content-type': 'text/html; charset=utf-8' };
  if (NOINDEX_PATHS.includes(bare)) headers['x-robots-tag'] = 'noindex, nofollow';
  return c.body(html, 200, headers);
});
