import { describe, expect, it } from 'vitest';
import flyRaw from './fixtures/fly-headers.txt?raw';
import headersFile from '../../public/_headers?raw';
import { HARDENING } from '../src/lib/http';
import { call } from './helpers';

const fly = Object.fromEntries(
  flyRaw
    .split('\n')
    .filter(l => l && !l.startsWith('#'))
    .map(l => [l.slice(0, l.indexOf(':')).trim(), l.slice(l.indexOf(':') + 1).trim()])
);

describe('security headers match what Fly serves today', () => {
  it('HARDENING equals the captured Fly header set exactly', () => {
    expect(HARDENING).toEqual(fly);
  });

  it('public/_headers applies the same set to every static file', () => {
    const lines = headersFile.split('\n');
    expect(lines[0].trim()).toBe('/*');
    const parsed = Object.fromEntries(
      lines
        .slice(1)
        .filter(l => /^\s+\S/.test(l))
        .map(l => [
          l.slice(0, l.indexOf(':')).trim().toLowerCase(),
          l.slice(l.indexOf(':') + 1).trim(),
        ])
    );
    expect(parsed).toEqual(fly);
  });

  for (const path of [
    '/sq/',
    '/',
    '/health',
    '/api/detect-language',
    '/sitemap.xml',
    '/api/nope',
    '/assets/x.js',
  ]) {
    it(`Worker response ${path} carries every header`, async () => {
      const res = await call(path);
      for (const [k, v] of Object.entries(fly)) expect(res.headers.get(k), `${path} ${k}`).toBe(v);
    });
  }

  it('CORS: allowed origin gets ACAO, preflight lists the methods', async () => {
    const pre = await call('/api/booking', {
      method: 'OPTIONS',
      headers: { origin: 'https://example.org', 'access-control-request-method': 'POST' },
    });
    expect(pre.status).toBe(204);
    expect(pre.headers.get('access-control-allow-methods')).toBe('GET,POST,PATCH,OPTIONS');
    // ZEO_ENV=test is not production, so (like Fastify in dev) any origin is reflected.
    expect(pre.headers.get('access-control-allow-origin')).toBe('https://example.org');
  });

  it('CORS in production: unknown origins get no ACAO', async () => {
    const res = await call(
      '/health',
      { headers: { origin: 'https://evil.example' } },
      { ZEO_ENV: 'production' }
    );
    expect(res.headers.get('access-control-allow-origin')).toBeNull();
    const ok = await call(
      '/health',
      { headers: { origin: 'https://www.zeodentalclinic.com' } },
      { ZEO_ENV: 'production' }
    );
    expect(ok.headers.get('access-control-allow-origin')).toBe('https://www.zeodentalclinic.com');
  });
});
