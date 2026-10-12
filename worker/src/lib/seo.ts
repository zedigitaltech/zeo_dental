/**
 * Port of renderHtml / generateSitemap / language detection from server/src/index.ts.
 * The per-route text comes from the server's own seoMeta.ts and i18n.ts (imported, not copied).
 * test/seo.test.ts holds the output byte-identical to what Fastify renders.
 */
import { SUPPORTED_LANGUAGES, LANG_TO_LOCALE } from '../../../server/src/utils/i18n';
import type { Language } from '../../../server/src/utils/i18n';
import { getSeoMeta } from '../../../server/src/utils/seoMeta';

export {
  SUPPORTED_LANGUAGES,
  getLangFromPath,
  stripLangPrefix,
} from '../../../server/src/utils/i18n';
export type { Language };

export const PUBLIC_ROUTES = [
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

export const FALLBACK_TEMPLATE =
  '<!DOCTYPE html><html lang="en"><head><title>Zeo Dental Clinic</title></head><body><div id="root"></div><script type="module" src="/assets/index.js"></script></body></html>';

export function renderHtml(
  template: string,
  lang: Language,
  barePath: string,
  BASE_URL: string
): string {
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

  let html = template;

  html = html.replace(/lang="en"/, `lang="${lang}"`);
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${seo.title}</title>`);
  html = html.replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${seo.description}"`
  );
  html = html.replace(
    /<link rel="canonical" href="[^"]*"/,
    `<link rel="canonical" href="${canonicalUrl}"`
  );
  html = html.replace(
    /<!-- hreflang tags injected dynamically by server per language -->/,
    `${hreflangTags}\n    ${xDefault}`
  );
  html = html.replace(
    /<meta property="og:url" content="[^"]*"/,
    `<meta property="og:url" content="${canonicalUrl}"`
  );
  html = html.replace(
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="${seo.title}"`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${seo.description}"`
  );
  html = html.replace(
    /<meta property="og:locale" content="[^"]*"/,
    `<meta property="og:locale" content="${locale}"`
  );
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*"/,
    `<meta name="twitter:title" content="${seo.title}"`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*"/,
    `<meta name="twitter:description" content="${seo.description}"`
  );
  html = html.replace(
    /<meta name="twitter:url" content="[^"]*"/,
    `<meta name="twitter:url" content="${canonicalUrl}"`
  );

  return html;
}

export function generateSitemap(BASE_URL: string): string {
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

/** Same table as the Fastify server. The country now comes from request.cf, not ip-api.com. */
export const COUNTRY_TO_LANG: Record<string, Language> = {
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

export function languageForCountry(country: unknown): Language {
  return (typeof country === 'string' && COUNTRY_TO_LANG[country]) || 'en';
}

export function isLanguage(v: unknown): v is Language {
  return typeof v === 'string' && (SUPPORTED_LANGUAGES as readonly string[]).includes(v);
}
