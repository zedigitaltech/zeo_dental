/**
 * Which language a patient email goes out in. Pure: no bindings, no I/O.
 *
 * Order: the language the site was in when the patient booked (stored on the row) → the country
 * code of the phone number → English.
 */

/** The site's languages (utils/i18n.ts SUPPORTED_LANGUAGES). */
export const SUPPORTED_EMAIL_LANGUAGES = ['sq', 'en', 'it', 'de', 'fr', 'tr', 'el', 'es'] as const;
export type EmailLanguage = (typeof SUPPORTED_EMAIL_LANGUAGES)[number];

export const DEFAULT_EMAIL_LANGUAGE: EmailLanguage = 'en';

export const isEmailLanguage = (v: unknown): v is EmailLanguage =>
  typeof v === 'string' && (SUPPORTED_EMAIL_LANGUAGES as readonly string[]).includes(v);

/** Country calling code → language. Longest codes are matched first. */
const PHONE_PREFIXES: ReadonlyArray<[string, EmailLanguage]> = (
  [
    ['355', 'sq'],
    ['357', 'el'],
    ['353', 'en'],
    ['39', 'it'],
    ['49', 'de'],
    ['43', 'de'],
    ['41', 'de'],
    ['33', 'fr'],
    ['32', 'fr'],
    ['90', 'tr'],
    ['30', 'el'],
    ['34', 'es'],
    ['44', 'en'],
    ['1', 'en'],
  ] as Array<[string, EmailLanguage]>
).sort((a, b) => b[0].length - a[0].length);

/**
 * The language implied by an international phone number ("+39 333…", "0039 333…"), or null when
 * the number has no country code or an unmapped one. National numbers ("068…") are not guessed.
 */
export function languageFromPhone(phone: string | null | undefined): EmailLanguage | null {
  if (!phone) return null;
  const compact = phone.replace(/[\s\-().]/g, '');
  let digits: string;
  if (compact.startsWith('+')) digits = compact.slice(1);
  else if (compact.startsWith('00')) digits = compact.slice(2);
  else return null;
  if (!/^\d+$/.test(digits)) return null;
  for (const [prefix, lang] of PHONE_PREFIXES) if (digits.startsWith(prefix)) return lang;
  return null;
}

export type EmailLanguageSource = 'stored' | 'phone' | 'default';

export function resolveEmailLanguage(booking: {
  language?: string | null;
  phone?: string | null;
}): { language: EmailLanguage; source: EmailLanguageSource } {
  if (isEmailLanguage(booking.language)) return { language: booking.language, source: 'stored' };
  const fromPhone = languageFromPhone(booking.phone);
  if (fromPhone) return { language: fromPhone, source: 'phone' };
  return { language: DEFAULT_EMAIL_LANGUAGE, source: 'default' };
}

export function emailLanguage(booking: {
  language?: string | null;
  phone?: string | null;
}): EmailLanguage {
  return resolveEmailLanguage(booking).language;
}
