/**
 * Zeo Dental Clinic Worker. Static files come from assets (wrangler.toml [assets]); this Worker
 * handles "/", /{lang}/* SEO pages, /sitemap.xml, /health and the /api/* surface of the old
 * Fastify server (server/), plus admin file access and the sheet-sync export feeds.
 */
import { Hono } from 'hono';
import type { AppEnv } from './env';
import { PREFLIGHT_HEADERS, corsHeaders, errMsg, harden } from './lib/http';
import { booking } from './routes/booking';
import { chat } from './routes/chat';
import { deposits } from './routes/deposits';
import { exportApi } from './routes/export';
import { receptionist } from './routes/receptionist';
import { site } from './routes/site';

const app = new Hono<AppEnv>();

app.use('*', async (c, next) => {
  const cors = corsHeaders(c.env, c.req.header('origin') ?? null);
  if (c.req.method === 'OPTIONS') {
    return harden(new Response(null, { status: 204, headers: { ...cors, ...PREFLIGHT_HEADERS } }));
  }
  await next();
  c.res = harden(c.res);
  for (const [k, v] of Object.entries(cors)) c.res.headers.set(k, v);
});

app.onError((err, c) => {
  console.error(
    `Unhandled error on ${c.req.method} ${new URL(c.req.url).pathname}: ${errMsg(err)}`
  );
  return c.json({ error: 'Internal Server Error' }, 500);
});

app.route('/', chat);
app.route('/', booking);
app.route('/', receptionist);
app.route('/', exportApi);
app.route('/', deposits);
app.route('/', site); // last: owns the catch-all

export default { fetch: app.fetch } satisfies ExportedHandler<AppEnv['Bindings']>;
