import { describe, expect, it } from 'vitest';
import golden from './fixtures/seo-golden.json';
import { call } from './helpers';

const sha = async (s: string) =>
  [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

describe('SEO pages are byte-identical to the Fastify renderHtml output', () => {
  it('all 15 routes x 8 languages', async () => {
    const paths = Object.keys(golden.pages);
    expect(paths).toHaveLength(120);
    const mismatches: string[] = [];
    for (const path of paths) {
      const res = await call(path);
      expect(res.status, path).toBe(200);
      expect(res.headers.get('content-type')).toContain('text/html');
      if ((await sha(await res.text())) !== (golden.pages as Record<string, string>)[path])
        mismatches.push(path);
    }
    expect(mismatches).toEqual([]);
  });

  it('/sitemap.xml matches the Fastify sitemap', async () => {
    const res = await call('/sitemap.xml');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/xml');
    expect(await sha(await res.text())).toBe(golden.sitemap);
  });

  it('/{lang} without trailing slash renders the home page', async () => {
    const res = await call('/it');
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('<html lang="it"');
  });
});

describe('language redirects', () => {
  it('/ follows the zeo-lang cookie first', async () => {
    const res = await call('/', { headers: { cookie: 'a=1; zeo-lang=de' }, cf: { country: 'AL' } });
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('/de/');
  });

  it('/ ignores an unsupported cookie and uses cf.country', async () => {
    const res = await call('/', { headers: { cookie: 'zeo-lang=xx' }, cf: { country: 'AL' } });
    expect(res.headers.get('location')).toBe('/sq/');
  });

  it('/ falls back to en for an unmapped or missing country', async () => {
    expect((await call('/', { cf: { country: 'US' } })).headers.get('location')).toBe('/en/');
    expect((await call('/')).headers.get('location')).toBe('/en/');
  });

  it('an unprefixed path redirects to /en<path> without the query', async () => {
    const res = await call('/treatments/crowns?x=1');
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('/en/treatments/crowns');
    expect((await call('/receptionist')).headers.get('location')).toBe('/en/receptionist');
  });

  it('a missing static file is a plain 404, never the page', async () => {
    const res = await call('/assets/missing.js');
    expect(res.status).toBe(404);
    expect(await res.text()).toBe('Not found');
    expect((await call('/en/images/nope.webp')).status).toBe(404);
  });
});

describe('health and detect-language', () => {
  it('GET /health', async () => {
    const res = await call('/health');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string; timestamp: string };
    expect(body.status).toBe('ok');
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
  });

  it('GET /api/detect-language uses request.cf.country (no third-party call)', async () => {
    expect(await (await call('/api/detect-language', { cf: { country: 'XK' } })).json()).toEqual({
      language: 'sq',
    });
    expect(await (await call('/api/detect-language', { cf: { country: 'CH' } })).json()).toEqual({
      language: 'de',
    });
    expect(await (await call('/api/detect-language')).json()).toEqual({ language: 'en' });
  });

  it('an unknown API path is JSON 404', async () => {
    const res = await call('/api/nope');
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'API endpoint not found' });
  });
});
