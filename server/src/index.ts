import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import fastifyCookie from '@fastify/cookie';
import fastifyMultipart from '@fastify/multipart';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { chatRoutes } from './routes/chat.js';
import { bookingRoutes } from './routes/booking.js';
import { receptionistRoutes } from './routes/receptionist.js';
import { postgresPlugin } from './plugins/postgres.js';
import { initCrmSync } from './services/crmSync.js';
import {
  SUPPORTED_LANGUAGES,
  LANG_TO_LOCALE,
  getLangFromPath,
  stripLangPrefix,
} from './utils/i18n.js';
import type { Language } from './utils/i18n.js';
import { getSeoMeta } from './utils/seoMeta.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport:
      process.env.NODE_ENV !== 'production'
        ? {
            target: 'pino-pretty',
            options: { colorize: true },
          }
        : undefined,
  },
});

// --- SEO / HTML rendering ---

const BASE_URL = process.env.BASE_URL || 'https://zeodentalclinic.com';
const publicPath = join(__dirname, '..', 'public');

let indexHtmlTemplate: string;
try {
  indexHtmlTemplate = readFileSync(join(publicPath, 'index.html'), 'utf-8');
} catch (err) {
  console.error(`Failed to read index.html from ${join(publicPath, 'index.html')}:`, err);
  indexHtmlTemplate =
    '<!DOCTYPE html><html lang="en"><head><title>Zeo Dental Clinic</title></head><body><div id="root"></div><script type="module" src="/assets/index.js"></script></body></html>';
}

const PUBLIC_ROUTES = [
  '/',
  '/treatments',
  '/treatments/implantology',
  '/treatments/prosthetics',
  '/treatments/aligners',
  '/treatments/orthodontics',
  '/treatments/crowns',
  '/treatments/endodontics',
  '/philosophy',
  '/team',
  '/cases',
  '/book',
  '/packages',
  '/privacy-policy',
  '/terms-of-service',
];

function renderHtml(lang: Language, barePath: string): string {
  const seo = getSeoMeta(barePath, lang);
  const canonicalPath = barePath === '/' ? `/${lang}/` : `/${lang}${barePath}`;
  const canonicalUrl = `${BASE_URL}${canonicalPath}`;
  const locale = LANG_TO_LOCALE[lang];

  // Build hreflang tags
  const hreflangTags = SUPPORTED_LANGUAGES.map(l => {
    const altPath = barePath === '/' ? `/${l}/` : `/${l}${barePath}`;
    return `<link rel="alternate" href="${BASE_URL}${altPath}" hreflang="${l}" />`;
  }).join('\n    ');
  const xDefault = `<link rel="alternate" href="${BASE_URL}/en${barePath === '/' ? '/' : barePath}" hreflang="x-default" />`;

  let html = indexHtmlTemplate;

  // Replace html lang
  html = html.replace(/lang="en"/, `lang="${lang}"`);

  // Replace title
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${seo.title}</title>`);

  // Replace meta description
  html = html.replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${seo.description}"`
  );

  // Replace canonical
  html = html.replace(
    /<link rel="canonical" href="[^"]*"/,
    `<link rel="canonical" href="${canonicalUrl}"`
  );

  // Replace hreflang comment (or existing hreflang tags) with actual hreflang links
  html = html.replace(
    /<!-- hreflang tags injected dynamically by server per language -->/,
    `${hreflangTags}\n    ${xDefault}`
  );

  // Replace og:url
  html = html.replace(
    /<meta property="og:url" content="[^"]*"/,
    `<meta property="og:url" content="${canonicalUrl}"`
  );

  // Replace og:title
  html = html.replace(
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="${seo.title}"`
  );

  // Replace og:description
  html = html.replace(
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${seo.description}"`
  );

  // Replace og:locale
  html = html.replace(
    /<meta property="og:locale" content="[^"]*"/,
    `<meta property="og:locale" content="${locale}"`
  );

  // Replace twitter title
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*"/,
    `<meta name="twitter:title" content="${seo.title}"`
  );

  // Replace twitter description
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*"/,
    `<meta name="twitter:description" content="${seo.description}"`
  );

  // Replace twitter url
  html = html.replace(
    /<meta name="twitter:url" content="[^"]*"/,
    `<meta name="twitter:url" content="${canonicalUrl}"`
  );

  return html;
}

// --- Language detection ---

const COUNTRY_TO_LANG: Record<string, Language> = {
  AL: 'sq',
  XK: 'sq',
  IT: 'it',
  SM: 'it',
  VA: 'it',
  DE: 'de',
  AT: 'de',
  CH: 'de',
  LI: 'de',
  FR: 'fr',
  BE: 'fr',
  MC: 'fr',
  LU: 'fr',
  TR: 'tr',
  GR: 'el',
  CY: 'el',
  ES: 'es',
  MX: 'es',
  AR: 'es',
  CO: 'es',
  CL: 'es',
};

function getClientIp(request: {
  headers: Record<string, string | string[] | undefined>;
  ip: string;
}): string {
  return (request.headers['fly-client-ip'] ||
    request.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ||
    request.ip) as string;
}

async function detectLanguageFromIp(clientIp: string): Promise<Language> {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^[0-9a-fA-F:]+$/;
  if (!ipv4Regex.test(clientIp) && !ipv6Regex.test(clientIp)) {
    return 'en';
  }

  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(clientIp)}?fields=countryCode`,
      {
        signal: AbortSignal.timeout(2000),
      }
    );
    if (res.ok) {
      const data = (await res.json()) as { countryCode?: string };
      if (data.countryCode && COUNTRY_TO_LANG[data.countryCode]) {
        return COUNTRY_TO_LANG[data.countryCode];
      }
    }
  } catch {
    // fall through
  }

  return 'en';
}

// --- Dynamic sitemap ---

function generateSitemap(): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

  for (const route of PUBLIC_ROUTES) {
    for (const lang of SUPPORTED_LANGUAGES) {
      const path = route === '/' ? `/${lang}/` : `/${lang}${route}`;
      xml += '  <url>\n';
      xml += `    <loc>${BASE_URL}${path}</loc>\n`;

      for (const altLang of SUPPORTED_LANGUAGES) {
        const altPath = route === '/' ? `/${altLang}/` : `/${altLang}${route}`;
        xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${BASE_URL}${altPath}" />\n`;
      }
      const defaultPath = route === '/' ? '/en/' : `/en${route}`;
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${defaultPath}" />\n`;

      xml += `    <changefreq>${route === '/' ? 'weekly' : 'monthly'}</changefreq>\n`;
      xml += `    <priority>${route === '/' ? '1.0' : route === '/book' ? '0.9' : '0.8'}</priority>\n`;
      xml += '  </url>\n';
    }
  }

  xml += '</urlset>';
  return xml;
}

// Cache sitemap in memory (regenerated on server restart)
const sitemapXml = generateSitemap();

// --- Server setup ---

async function start() {
  try {
    const adminToken = process.env.ADMIN_TOKEN;

    // Cookie support (for language preference)
    await fastify.register(fastifyCookie);

    // Multipart support (for file uploads)
    await fastify.register(fastifyMultipart, {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB per file
        files: 3, // max 3 files
      },
    });

    // Security headers
    await fastify.register(helmet, {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            'https://static.elfsight.com',
            'https://elfsightcdn.com',
            'https://*.elfsightcdn.com',
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://fonts.googleapis.com',
            'https://*.elfsightcdn.com',
          ],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
          imgSrc: [
            "'self'",
            'data:',
            'https://images.unsplash.com',
            'https://*.pexels.com',
            'https://i.pinimg.com',
            'https://img.youtube.com',
            'https://i.ytimg.com',
            'https://*.elfsightcdn.com',
          ],
          mediaSrc: ["'self'", 'https://videos.pexels.com', 'https://cdn.pixabay.com'],
          connectSrc: [
            "'self'",
            'https://generativelanguage.googleapis.com',
            'https://*.elfsight.com',
            'https://*.elfsightcdn.com',
          ],
          frameSrc: [
            "'self'",
            'https://www.google.com',
            'https://www.youtube.com',
            'https://www.youtube-nocookie.com',
          ],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    });

    // Global rate limiting with per-IP tracking
    await fastify.register(rateLimit, {
      max: parseInt(process.env.RATE_LIMIT_MAX || '200', 10),
      timeWindow: process.env.RATE_LIMIT_WINDOW || '1 minute',
      keyGenerator: req => {
        return (req.headers['fly-client-ip'] ||
          req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ||
          req.ip) as string;
      },
      allowList: req => {
        if (req.url === '/health') return true;
        if (adminToken && req.headers.authorization === `Bearer ${adminToken}`) return true;
        return false;
      },
    });

    // Register CORS
    const parsedOrigins = process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',')
          .map(o => o.trim())
          .filter(Boolean)
      : undefined;

    await fastify.register(cors, {
      origin: parsedOrigins
        ? parsedOrigins
        : process.env.NODE_ENV === 'production'
          ? [
              'https://zeodentalclinic.com',
              'https://www.zeodentalclinic.com',
              'https://zeo-dental.fly.dev',
            ]
          : true,
      methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // Register Postgres plugin
    await fastify.register(postgresPlugin);

    // Initialize CRM sync (optional - only if env vars are set)
    initCrmSync(fastify.log);

    // Register API routes
    await fastify.register(chatRoutes, { prefix: '/api' });
    await fastify.register(bookingRoutes, { prefix: '/api' });
    await fastify.register(receptionistRoutes, { prefix: '/api' });

    // Health check endpoint
    fastify.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    // Language detection API endpoint (kept for backwards compatibility)
    fastify.get('/api/detect-language', async request => {
      const clientIp = getClientIp(request);
      const lang = await detectLanguageFromIp(clientIp);
      return { language: lang };
    });

    // onRequest hook - intercepts routes before @fastify/static to avoid conflicts
    // Handles: root "/" redirect, dynamic /sitemap.xml
    fastify.addHook('onRequest', async (request, reply) => {
      const url = request.url.split('?')[0];

      // Dynamic sitemap
      if (url === '/sitemap.xml') {
        return reply.type('application/xml').send(sitemapXml);
      }

      if (url !== '/') return;

      // Check cookie for saved language preference
      const cookieLang = (request as any).cookies?.['zeo-lang'];
      if (cookieLang && (SUPPORTED_LANGUAGES as readonly string[]).includes(cookieLang)) {
        return reply.redirect(302, `/${cookieLang}/`);
      }

      // Detect from IP
      const clientIp = getClientIp(request);
      const detected = await detectLanguageFromIp(clientIp);
      return reply.redirect(302, `/${detected}/`);
    });

    // Serve static files (React build)
    await fastify.register(fastifyStatic, {
      root: publicPath,
      prefix: '/',
      wildcard: false,
    });

    // SPA fallback - handles root redirect, lang routing, and 404s
    fastify.setNotFoundHandler(async (request, reply) => {
      const url = request.url.split('?')[0]; // strip query string

      // API routes return 404 JSON
      if (url.startsWith('/api')) {
        return reply.status(404).send({ error: 'API endpoint not found' });
      }

      // Static file requests - let them 404
      if (url.match(/\.(js|css|png|jpg|jpeg|webp|svg|ico|woff2?|ttf|eot|mp4|webm|json|map|txt)$/)) {
        return reply.status(404).send('Not found');
      }

      // Extract language from URL
      const lang = getLangFromPath(url);
      if (!lang) {
        // No lang prefix - redirect to /en/ + path for backward compat
        return reply.redirect(302, `/en${url}`);
      }

      // Serve index.html with injected SEO tags
      const barePath = stripLangPrefix(url);
      const html = renderHtml(lang, barePath);
      return reply.type('text/html').send(html);
    });

    // Start server
    const host = process.env.HOST || '0.0.0.0';
    const port = parseInt(process.env.PORT || '3000', 10);

    await fastify.listen({ port, host });
    fastify.log.info(`Server running at http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Graceful shutdown
const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
signals.forEach(signal => {
  process.on(signal, async () => {
    fastify.log.info(`Received ${signal}, shutting down gracefully...`);
    await fastify.close();
    process.exit(0);
  });
});

start();
