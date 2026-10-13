/**
 * Zeo Dental Clinic transactional emails: patient confirmation / cancellation (in the patient's
 * language) and the clinic notification (Albanian, for staff). Pure: no bindings, no I/O.
 *
 * Email-client rules: table layout, 600px max, inline CSS only, role="presentation" tables, a hidden
 * preheader, padded-cell buttons that survive Outlook, explicit background colours everywhere and
 * an opaque logo so clients that force dark mode still render it readably. Every user-provided value
 * goes through escapeHtml.
 */
import { escapeHtml } from '../../../server/src/utils/emailHtml';
import { EMAIL_COPY, type EmailCopy } from './emailCopy';
import { resolveEmailLanguage, type EmailLanguage } from './emailLanguage';
import { hasXraySq, travelTimeframeSq, treatmentInterestSq } from './bookingQuestions';

export const DEFAULT_BASE_URL = 'https://zeodentalclinic.com';

/** Clinic facts, as already published on the site and in the previous templates. */
export const CLINIC = {
  name: 'Zeo Dental Clinic',
  phoneDisplay: '+355 68 400 4840',
  phoneTel: '+355684004840',
  email: 'zeodentalclinic@gmail.com',
  whatsappUrl: 'https://wa.me/355684004840',
  mapsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=' +
    encodeURIComponent('Rruga Hamdi Sina, Tiranë, Albania'),
} as const;

export const C = {
  black: '#050505',
  gold: '#C5A47E',
  gray: '#999999',
  light: '#F9F9F9',
  white: '#FFFFFF',
  text: '#3A3A3A',
  rule: '#E8E2D9',
} as const;

export const SERIF = "'Playfair Display', Georgia, 'Times New Roman', Times, serif";
export const SANS = "'Montserrat', 'Helvetica Neue', Helvetica, Arial, sans-serif";

/** The booking fields the templates read. Everything optional so old rows render too. */
export interface EmailBooking {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  service?: string | null;
  preferred_date?: string | null;
  preferred_time?: string | null;
  confirmed_date?: string | null;
  confirmed_time?: string | null;
  cancellation_reason?: string | null;
  description?: string | null;
  notes?: string | null;
  language?: string | null;
  treatment_interest?: string | null;
  has_xray?: boolean | number | null;
  travel_timeframe?: string | null;
}

export interface RenderOptions {
  /** Site origin for the logo and links; defaults to the production domain. */
  baseUrl?: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export const e = (v: unknown): string => escapeHtml(String(v ?? ''));
export const origin = (o?: RenderOptions) => (o?.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '');

/** "2026-10-20" → "martedì 20 ottobre 2026" in the language's locale, Tirana time. */
export function formatEmailDate(date: string | null | undefined, locale: string): string | null {
  if (!date || !/^\d{4}-\d{2}-\d{2}/.test(date)) return null;
  // Noon UTC is the same calendar day in Tirana all year round.
  const d = new Date(`${date.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Tirane',
  }).format(d);
}

/** A confirmed clock time as given ("10:30"), or a preferred slot name in the language. */
function formatTime(
  time: string | null | undefined,
  slot: string | null | undefined,
  copy: EmailCopy
): string | null {
  if (time && time.trim()) return time.trim();
  const key = slot?.toLowerCase();
  if (key === 'morning' || key === 'afternoon' || key === 'evening') return copy.slots[key];
  return null;
}

/** Confirmed clock time when the booking is confirmed, else the preferred slot. */
function appointmentTime(booking: EmailBooking, copy: EmailCopy): string | null {
  return booking.confirmed_date
    ? formatTime(booking.confirmed_time, null, copy)
    : formatTime(null, booking.preferred_time, copy);
}

// ---------------------------------------------------------------------------------------------
// Building blocks (all return HTML; callers pass already-escaped strings unless noted).
// Exported for the deposit emails (depositEmails.ts), which share the layout.

export function button(href: string, label: string, primary: boolean): string {
  const bg = primary ? C.black : C.white;
  const fg = primary ? C.white : C.black;
  const border = primary ? C.black : C.gold;
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto;">
  <tr>
    <td align="center" bgcolor="${bg}" style="background-color:${bg};border:1px solid ${border};border-radius:2px;mso-padding-alt:14px 28px;">
      <a href="${e(href)}" target="_blank" style="display:inline-block;padding:14px 28px;font-family:${SANS};font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;line-height:18px;color:${fg};text-decoration:none;">${label}</a>
    </td>
  </tr>
</table>`;
}

function detailRow(label: string, value: string, last = false): string {
  const border = last ? '' : `border-bottom:1px solid ${C.rule};`;
  return `<tr>
  <td class="zeo-stack zeo-label" valign="top" style="padding:12px 0;${border}font-family:${SANS};font-size:11px;line-height:16px;letter-spacing:0.12em;text-transform:uppercase;color:${C.gray};width:34%;">${label}</td>
  <td class="zeo-stack" valign="top" style="padding:12px 0;${border}font-family:${SERIF};font-size:16px;line-height:22px;color:${C.black};">${value}</td>
</tr>`;
}

export function detailsBox(title: string, rows: Array<[string, string]>): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${C.light}" style="background-color:${C.light};border-left:3px solid ${C.gold};">
  <tr>
    <td style="padding:22px 24px 10px 24px;font-family:${SERIF};font-size:18px;line-height:24px;color:${C.black};">${title}</td>
  </tr>
  <tr>
    <td style="padding:0 24px 12px 24px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        ${rows.map(([l, v], i) => detailRow(l, v, i === rows.length - 1)).join('\n')}
      </table>
    </td>
  </tr>
</table>`;
}

export function paragraph(html: string, extra = ''): string {
  return `<p style="margin:0 0 16px 0;font-family:${SANS};font-size:15px;line-height:24px;color:${C.text};${extra}">${html}</p>`;
}

export function noteBox(html: string): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${C.white}" style="background-color:${C.white};border:1px solid ${C.gold};">
  <tr>
    <td style="padding:14px 18px;font-family:${SANS};font-size:14px;line-height:22px;color:${C.text};">${html}</td>
  </tr>
</table>`;
}

export const spacer = (h: number) =>
  `<tr><td style="height:${h}px;line-height:${h}px;font-size:0;">&nbsp;</td></tr>`;

export interface LayoutParts {
  lang: string;
  title: string; // escaped
  preheader: string; // escaped
  eyebrow: string; // escaped
  heading: string; // escaped
  body: string; // HTML
  footerNote: string; // escaped
  addressLine: string; // escaped
  baseUrl: string;
}

export function layout(p: LayoutParts): string {
  const logo = `${p.baseUrl}/images/zeo-logo-email.png`;
  // Pads the preheader so clients don't pull body text into the inbox preview.
  const filler = '&#847;&zwnj;&nbsp;'.repeat(40);
  return `<!DOCTYPE html>
<html lang="${e(p.lang)}" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${p.title}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<style>
  @media only screen and (max-width: 620px) {
    .zeo-pad { padding-left: 22px !important; padding-right: 22px !important; }
    .zeo-h1 { font-size: 24px !important; line-height: 30px !important; }
    .zeo-stack { display: block !important; width: 100% !important; }
    .zeo-label { border-bottom: 0 !important; padding-bottom: 2px !important; }
    .zeo-stack + .zeo-stack { padding-top: 0 !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;width:100%;background-color:${C.light};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;color:${C.light};">${p.preheader}${filler}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${C.light}" style="background-color:${C.light};">
  <tr>
    <td align="center" style="padding:24px 12px;">
      <!--[if mso]><table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" align="center"><tr><td><![endif]-->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${C.white}" style="max-width:600px;width:100%;background-color:${C.white};">
        <tr>
          <td align="center" bgcolor="${C.white}" style="background-color:${C.white};border-top:4px solid ${C.gold};padding:30px 24px 22px 24px;">
            <a href="${e(p.baseUrl)}" target="_blank" style="text-decoration:none;"><img src="${e(logo)}" width="160" height="108" alt="Zeo Dental Clinic" style="display:block;width:160px;max-width:160px;height:auto;border:0;outline:none;text-decoration:none;font-family:${SERIF};font-size:22px;color:${C.black};"></a>
          </td>
        </tr>
        <tr>
          <td class="zeo-pad" bgcolor="${C.black}" style="background-color:${C.black};padding:30px 40px 30px 40px;">
            <p style="margin:0 0 10px 0;font-family:${SANS};font-size:11px;line-height:16px;letter-spacing:0.22em;text-transform:uppercase;color:${C.gold};">${p.eyebrow}</p>
            <h1 class="zeo-h1" style="margin:0;font-family:${SERIF};font-size:28px;line-height:34px;font-weight:normal;color:${C.white};">${p.heading}</h1>
          </td>
        </tr>
        <tr>
          <td class="zeo-pad" bgcolor="${C.white}" style="background-color:${C.white};padding:34px 40px 10px 40px;">
            ${p.body}
          </td>
        </tr>
        <tr>
          <td class="zeo-pad" bgcolor="${C.black}" style="background-color:${C.black};padding:28px 40px;text-align:center;">
            <p style="margin:0 0 6px 0;font-family:${SERIF};font-size:20px;line-height:24px;letter-spacing:0.18em;color:${C.white};">ZEO<span style="color:${C.gold};">.</span></p>
            <p style="margin:0 0 12px 0;font-family:${SANS};font-size:12px;line-height:20px;color:${C.gray};">${p.addressLine}<br><a href="tel:${CLINIC.phoneTel}" style="color:${C.gold};text-decoration:none;">${CLINIC.phoneDisplay}</a> &nbsp;·&nbsp; <a href="mailto:${CLINIC.email}" style="color:${C.gold};text-decoration:none;">${CLINIC.email}</a></p>
            <p style="margin:0;font-family:${SANS};font-size:11px;line-height:17px;color:${C.gray};">${p.footerNote}</p>
          </td>
        </tr>
      </table>
      <!--[if mso]></td></tr></table><![endif]-->
    </td>
  </tr>
</table>
</body>
</html>`;
}

function patientActions(copy: EmailCopy): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  ${spacer(8)}
  <tr><td align="center">${button(CLINIC.whatsappUrl, e(copy.whatsappButton), true)}</td></tr>
  ${spacer(12)}
  <tr><td align="center">${button(CLINIC.mapsUrl, e(copy.directionsButton), false)}</td></tr>
  ${spacer(24)}
</table>`;
}

export function contactBlock(copy: EmailCopy): string {
  return (
    paragraph(e(copy.help)) +
    paragraph(
      `<a href="tel:${CLINIC.phoneTel}" style="color:${C.black};text-decoration:none;font-family:${SERIF};font-size:20px;">${CLINIC.phoneDisplay}</a><br><a href="mailto:${CLINIC.email}" style="color:${C.gold};text-decoration:none;">${CLINIC.email}</a>`,
      'text-align:center;'
    )
  );
}

export function signoff(copy: EmailCopy): string {
  return paragraph(
    `${e(copy.signoff)}<br><span style="font-family:${SERIF};font-size:17px;color:${C.black};">${e(copy.team)}</span>`,
    'margin-top:8px;margin-bottom:26px;'
  );
}

export function textFooter(copy: EmailCopy): string[] {
  return [
    `${copy.signoff}`,
    copy.team,
    '',
    '—',
    `${CLINIC.name} · ${copy.addressValue}`,
    `${CLINIC.phoneDisplay} · ${CLINIC.email}`,
    `WhatsApp: ${CLINIC.whatsappUrl}`,
    copy.footerNote,
  ];
}

// ---------------------------------------------------------------------------------------------
// Patient emails

export function renderConfirmationEmail(
  booking: EmailBooking,
  lang: EmailLanguage,
  opts?: RenderOptions
): RenderedEmail {
  const copy = EMAIL_COPY[lang];
  const t = copy.confirmation;
  const baseUrl = origin(opts);
  const date = formatEmailDate(booking.confirmed_date || booking.preferred_date, copy.locale);
  const time = date ? appointmentTime(booking, copy) : null;
  const name = booking.name ?? '';
  const service = booking.service ?? '';

  const rows: Array<[string, string]> = [];
  if (service) rows.push([e(copy.labels.service), e(service)]);
  if (date) {
    rows.push([e(copy.labels.date), e(date)]);
    rows.push([e(copy.labels.time), e(time ?? copy.timeTbd)]);
  } else {
    rows.push([e(copy.labels.date), e(copy.noDate)]);
  }
  rows.push([e(copy.labels.address), e(copy.addressValue)]);

  const body = [
    paragraph(e(copy.greeting(name)), `font-family:${SERIF};font-size:20px;color:${C.black};`),
    paragraph(e(t.intro), 'margin-bottom:26px;'),
    detailsBox(e(t.detailsTitle), rows),
    '<div style="height:20px;line-height:20px;font-size:0;">&nbsp;</div>',
    noteBox(e(t.arriveNote)),
    '<div style="height:16px;line-height:16px;font-size:0;">&nbsp;</div>',
    patientActions(copy),
    contactBlock(copy),
    signoff(copy),
  ].join('\n');

  const html = layout({
    lang,
    title: e(t.subject),
    preheader: e(t.preheader),
    eyebrow: 'Zeo Dental Clinic',
    heading: e(t.title),
    body,
    footerNote: e(copy.footerNote),
    addressLine: e(copy.addressValue),
    baseUrl,
  });

  const text = [
    copy.greeting(name),
    '',
    t.intro,
    '',
    t.detailsTitle.toUpperCase(),
    ...(service ? [`${copy.labels.service}: ${service}`] : []),
    ...(date
      ? [`${copy.labels.date}: ${date}`, `${copy.labels.time}: ${time ?? copy.timeTbd}`]
      : [`${copy.labels.date}: ${copy.noDate}`]),
    `${copy.labels.address}: ${copy.addressValue}`,
    '',
    t.arriveNote,
    '',
    copy.help,
    `${copy.whatsappButton}: ${CLINIC.whatsappUrl}`,
    `${copy.directionsButton}: ${CLINIC.mapsUrl}`,
    '',
    ...textFooter(copy),
  ].join('\n');

  return { subject: t.subject, html, text };
}

export function renderCancellationEmail(
  booking: EmailBooking,
  lang: EmailLanguage,
  opts?: RenderOptions
): RenderedEmail {
  const copy = EMAIL_COPY[lang];
  const t = copy.cancellation;
  const baseUrl = origin(opts);
  const date = formatEmailDate(booking.confirmed_date || booking.preferred_date, copy.locale);
  const time = date ? appointmentTime(booking, copy) : null;
  const name = booking.name ?? '';
  const service = booking.service ?? '';
  const reason = booking.cancellation_reason?.trim() || '';

  const rows: Array<[string, string]> = [];
  if (service) rows.push([e(copy.labels.service), e(service)]);
  if (date) rows.push([e(copy.labels.date), e(date)]);
  if (time) rows.push([e(copy.labels.time), e(time)]);
  if (reason) rows.push([e(t.reason), e(reason)]);

  const body = [
    paragraph(e(copy.greeting(name)), `font-family:${SERIF};font-size:20px;color:${C.black};`),
    paragraph(e(t.intro), 'margin-bottom:26px;'),
    rows.length ? detailsBox(e(t.detailsTitle), rows) : '',
    '<div style="height:22px;line-height:22px;font-size:0;">&nbsp;</div>',
    paragraph(e(t.rebook)),
    patientActions(copy),
    contactBlock(copy),
    signoff(copy),
  ].join('\n');

  const html = layout({
    lang,
    title: e(t.subject),
    preheader: e(t.preheader),
    eyebrow: 'Zeo Dental Clinic',
    heading: e(t.title),
    body,
    footerNote: e(copy.footerNote),
    addressLine: e(copy.addressValue),
    baseUrl,
  });

  const text = [
    copy.greeting(name),
    '',
    t.intro,
    '',
    ...(rows.length
      ? [
          t.detailsTitle.toUpperCase(),
          ...(service ? [`${copy.labels.service}: ${service}`] : []),
          ...(date ? [`${copy.labels.date}: ${date}`] : []),
          ...(time ? [`${copy.labels.time}: ${time}`] : []),
          ...(reason ? [`${t.reason}: ${reason}`] : []),
          '',
        ]
      : []),
    t.rebook,
    `${copy.whatsappButton}: ${CLINIC.whatsappUrl}`,
    `${copy.labels.address}: ${copy.addressValue}`,
    '',
    copy.help,
    '',
    ...textFooter(copy),
  ].join('\n');

  return { subject: t.subject, html, text };
}

// ---------------------------------------------------------------------------------------------
// Clinic notification (staff, Albanian)

export function clinicNotificationSubject(booking: EmailBooking): string {
  // Kept byte-for-byte with the previous subject so inbox filters keep matching.
  return `Kërkesë e Re: ${e(booking.name)} - ${e(booking.service)}`;
}

/** "Italiano", "Italiano (sipas numrit të telefonit)" or "English (parazgjedhje)". */
export function patientLanguageLabel(booking: EmailBooking): string {
  const { language, source } = resolveEmailLanguage(booking);
  const name = EMAIL_COPY[language].languageName;
  if (source === 'stored') return name;
  if (source === 'phone') return `${name} (sipas numrit të telefonit)`;
  return `${name} (parazgjedhje)`;
}

/** The Meta-form answers, Albanian, only those the patient gave (older bookings have none). */
export function clinicQuestionRows(booking: EmailBooking): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  const interest = treatmentInterestSq(booking.treatment_interest);
  const xray = hasXraySq(booking.has_xray);
  const when = travelTimeframeSq(booking.travel_timeframe);
  if (interest) out.push(['Interesi për trajtim', interest]);
  if (xray) out.push(['Ka foto / radiografi', xray]);
  if (when) out.push(['Kur dëshiron të vijë', when]);
  return out;
}

export function renderClinicNotification(
  booking: EmailBooking,
  opts?: RenderOptions
): RenderedEmail {
  const sq = EMAIL_COPY.sq;
  const baseUrl = origin(opts);
  const date = formatEmailDate(booking.preferred_date, sq.locale);
  const time = formatTime(null, booking.preferred_time, sq);
  const lang = patientLanguageLabel(booking);
  const phone = booking.phone?.trim() || '';
  const email = booking.email?.trim() || '';

  const rows: Array<[string, string]> = [
    ['Emri', e(booking.name)],
    [
      'Telefon',
      phone
        ? `<a href="tel:${e(phone.replace(/[^\d+]/g, ''))}" style="color:${C.black};text-decoration:none;">${e(phone)}</a>`
        : '—',
    ],
    [
      'Email',
      email
        ? `<a href="mailto:${e(email)}" style="color:${C.black};text-decoration:none;">${e(email)}</a>`
        : '—',
    ],
    ['Shërbimi', e(booking.service)],
    ['Gjuha e pacientit', e(lang)],
    ['Data e preferuar', e(date ?? 'Pa datë – kontaktoni pacientin për ta caktuar')],
  ];
  if (time) rows.push(['Ora e preferuar', e(time)]);
  const questions = clinicQuestionRows(booking);
  for (const [label, value] of questions) rows.push([label, e(value)]);

  const free: string[] = [];
  if (booking.description)
    free.push(
      `<p style="margin:0 0 6px 0;font-family:${SANS};font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${C.gray};">Përshkrimi i nevojave</p>` +
        noteBox(e(booking.description).replace(/\n/g, '<br>'))
    );
  if (booking.notes)
    free.push(
      `<p style="margin:0 0 6px 0;font-family:${SANS};font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${C.gray};">Shënime</p>` +
        noteBox(e(booking.notes).replace(/\n/g, '<br>'))
    );

  const body = [
    paragraph('Një pacient sapo dërgoi një kërkesë për takim nga faqja e internetit.'),
    detailsBox('Detajet e kërkesës', rows),
    '<div style="height:20px;line-height:20px;font-size:0;">&nbsp;</div>',
    free.join('<div style="height:16px;line-height:16px;font-size:0;">&nbsp;</div>'),
    `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${spacer(16)}<tr><td align="center">${button(`${baseUrl}/receptionist`, 'Shko te paneli', true)}</td></tr>${spacer(26)}</table>`,
  ].join('\n');

  const subject = clinicNotificationSubject(booking);
  const html = layout({
    lang: 'sq',
    title: e(subject),
    preheader: e(`${booking.name ?? ''} · ${booking.service ?? ''} · ${lang}`),
    eyebrow: 'Kërkesë e re',
    heading: e(booking.name),
    body,
    footerNote: 'Njoftim i brendshëm për stafin e klinikës.',
    addressLine: e(sq.addressValue),
    baseUrl,
  });

  const text = [
    'Kërkesë e re për takim',
    '',
    `Emri: ${booking.name ?? ''}`,
    `Telefon: ${phone || '—'}`,
    `Email: ${email || '—'}`,
    `Shërbimi: ${booking.service ?? ''}`,
    `Gjuha e pacientit: ${lang}`,
    `Data e preferuar: ${date ?? 'Pa datë – kontaktoni pacientin për ta caktuar'}`,
    ...(time ? [`Ora e preferuar: ${time}`] : []),
    ...questions.map(([label, value]) => `${label}: ${value}`),
    ...(booking.description ? ['', 'Përshkrimi i nevojave:', booking.description] : []),
    ...(booking.notes ? ['', 'Shënime:', booking.notes] : []),
    '',
    `Paneli: ${baseUrl}/receptionist`,
  ].join('\n');

  return { subject, html, text };
}
