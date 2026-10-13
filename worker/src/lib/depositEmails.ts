/**
 * Deposit emails: the payment request and the receipt (patient's language) and the clinic's
 * "deposit paid" notification (Albanian). Same layout and rules as emailTemplates.ts. Pure.
 */
import { DEPOSIT_COPY } from './depositCopy';
import { EMAIL_COPY } from './emailCopy';
import type { EmailLanguage } from './emailLanguage';
import {
  C,
  CLINIC,
  SERIF,
  button,
  contactBlock,
  detailsBox,
  e,
  layout,
  noteBox,
  origin,
  paragraph,
  signoff,
  spacer,
  type RenderOptions,
  type RenderedEmail,
} from './emailTemplates';

/** The deposit fields the templates read. */
export interface EmailDeposit {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  language: EmailLanguage;
  amount_cents: number;
  currency: string;
  confirm_url?: string | null;
  expires_at?: string | null;
  paid_at?: string | null;
  created_by?: string | null;
  call_list_ref?: string | null;
  booking_id?: string | null;
  provider_order_id?: string | null;
}

export interface DepositRenderOptions extends RenderOptions {
  /** DEPOSIT_TERMS_URL: the clinic's own terms page, if it has one. */
  termsUrl?: string;
}

/** "100,00 €" / "€100.00" in the language's locale. */
export function formatAmount(cents: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}

/** ISO timestamp → "16 ottobre 2026, 14:05" in Tirana time, or null. */
export function formatDateTime(iso: string | null | undefined, locale: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Tirane',
  }).format(d);
}

export const depositRef = (id: string): string => id.slice(0, 8);

/** The short message an agent sends on WhatsApp, in the patient's language. */
export function depositWhatsAppText(d: EmailDeposit, url: string): string {
  const copy = EMAIL_COPY[d.language];
  return `${copy.greeting(d.name)} ${DEPOSIT_COPY[d.language].whatsapp(
    formatAmount(d.amount_cents, d.currency, copy.locale),
    url
  )}`;
}

/**
 * wa.me link for the patient's number, or null. National Italian mobiles (3xx…, 9-10 digits) get
 * +39 and Albanian ones (06x…) +355, like the call list; anything else must carry its country code.
 */
export function whatsappUrl(phone: string | null | undefined, text: string): string | null {
  let d = String(phone ?? '').replace(/\D/g, '');
  if (!d) return null;
  if (d.startsWith('00')) d = d.slice(2);
  else if (d.startsWith('3') && (d.length === 9 || d.length === 10)) d = `39${d}`;
  else if (d.startsWith('06') && d.length === 10) d = `355${d.slice(1)}`;
  if (d.length < 8 || d.length > 15) return null;
  return `https://wa.me/${d}?text=${encodeURIComponent(text)}`;
}

function termsHtml(copy: (typeof DEPOSIT_COPY)[EmailLanguage], termsUrl?: string): string {
  return termsUrl
    ? `${e(copy.termsLink)} <a href="${e(termsUrl)}" target="_blank" style="color:${C.black};">${e(termsUrl)}</a>`
    : e(copy.termsDefault);
}

function textFooter(lang: EmailLanguage): string[] {
  const copy = EMAIL_COPY[lang];
  return [
    copy.signoff,
    copy.team,
    '',
    '—',
    `${CLINIC.name} · ${copy.addressValue}`,
    `${CLINIC.phoneDisplay} · ${CLINIC.email}`,
    DEPOSIT_COPY[lang].footerNote,
  ];
}

export function renderDepositRequestEmail(
  d: EmailDeposit,
  confirmUrl: string,
  opts?: DepositRenderOptions
): RenderedEmail {
  const lang = d.language;
  const copy = EMAIL_COPY[lang];
  const dc = DEPOSIT_COPY[lang];
  const t = dc.request;
  const baseUrl = origin(opts);
  const amount = formatAmount(d.amount_cents, d.currency, copy.locale);
  const until = formatDateTime(d.expires_at, copy.locale);

  const rows: Array<[string, string]> = [
    [e(dc.labels.payee), e(CLINIC.name)],
    [e(dc.labels.amount), e(amount)],
  ];
  if (until) rows.push([e(dc.labels.validUntil), e(until)]);
  rows.push([e(dc.labels.reference), e(depositRef(d.id))]);

  const body = [
    paragraph(e(copy.greeting(d.name)), `font-family:${SERIF};font-size:20px;color:${C.black};`),
    paragraph(e(t.intro), 'margin-bottom:26px;'),
    detailsBox(e(t.detailsTitle), rows),
    `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${spacer(26)}<tr><td align="center">${button(confirmUrl, e(t.button), true)}</td></tr>${spacer(22)}</table>`,
    noteBox(`${e(dc.secureNote)}<br>${e(dc.deducted)}<br>${termsHtml(dc, opts?.termsUrl)}`),
    '<div style="height:18px;line-height:18px;font-size:0;">&nbsp;</div>',
    paragraph(
      `${e(t.linkFallback)}<br><a href="${e(confirmUrl)}" target="_blank" style="color:${C.black};word-break:break-all;">${e(confirmUrl)}</a>`,
      'font-size:13px;line-height:20px;'
    ),
    paragraph(e(dc.notRequested), 'font-size:13px;line-height:20px;'),
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
    footerNote: e(dc.footerNote),
    addressLine: e(copy.addressValue),
    baseUrl,
  });

  const text = [
    copy.greeting(d.name),
    '',
    t.intro,
    '',
    t.detailsTitle.toUpperCase(),
    `${dc.labels.payee}: ${CLINIC.name}`,
    `${dc.labels.amount}: ${amount}`,
    ...(until ? [`${dc.labels.validUntil}: ${until}`] : []),
    `${dc.labels.reference}: ${depositRef(d.id)}`,
    '',
    `${t.button}: ${confirmUrl}`,
    '',
    dc.secureNote,
    dc.deducted,
    opts?.termsUrl ? `${dc.termsLink} ${opts.termsUrl}` : dc.termsDefault,
    '',
    dc.notRequested,
    '',
    copy.help,
    `WhatsApp: ${CLINIC.whatsappUrl}`,
    '',
    ...textFooter(lang),
  ].join('\n');

  return { subject: t.subject, html, text };
}

export function renderDepositReceiptEmail(
  d: EmailDeposit,
  opts?: DepositRenderOptions
): RenderedEmail {
  const lang = d.language;
  const copy = EMAIL_COPY[lang];
  const dc = DEPOSIT_COPY[lang];
  const t = dc.receipt;
  const baseUrl = origin(opts);
  const amount = formatAmount(d.amount_cents, d.currency, copy.locale);
  const paid = formatDateTime(d.paid_at, copy.locale);

  const rows: Array<[string, string]> = [
    [e(dc.labels.payee), e(CLINIC.name)],
    [e(dc.labels.amount), e(amount)],
  ];
  if (paid) rows.push([e(dc.labels.paidOn), e(paid)]);
  rows.push([e(dc.labels.reference), e(depositRef(d.id))]);

  const body = [
    paragraph(e(copy.greeting(d.name)), `font-family:${SERIF};font-size:20px;color:${C.black};`),
    paragraph(e(t.intro), 'margin-bottom:26px;'),
    detailsBox(e(t.detailsTitle), rows),
    '<div style="height:20px;line-height:20px;font-size:0;">&nbsp;</div>',
    noteBox(`${e(dc.deducted)}<br>${termsHtml(dc, opts?.termsUrl)}`),
    '<div style="height:18px;line-height:18px;font-size:0;">&nbsp;</div>',
    paragraph(e(t.next)),
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
    footerNote: e(dc.footerNote),
    addressLine: e(copy.addressValue),
    baseUrl,
  });

  const text = [
    copy.greeting(d.name),
    '',
    t.intro,
    '',
    t.detailsTitle.toUpperCase(),
    `${dc.labels.payee}: ${CLINIC.name}`,
    `${dc.labels.amount}: ${amount}`,
    ...(paid ? [`${dc.labels.paidOn}: ${paid}`] : []),
    `${dc.labels.reference}: ${depositRef(d.id)}`,
    '',
    dc.deducted,
    opts?.termsUrl ? `${dc.termsLink} ${opts.termsUrl}` : dc.termsDefault,
    '',
    t.next,
    '',
    copy.help,
    `WhatsApp: ${CLINIC.whatsappUrl}`,
    '',
    ...textFooter(lang),
  ].join('\n');

  return { subject: t.subject, html, text };
}

/** Staff notification, Albanian, sent once when POK confirms the payment. */
export function renderClinicDepositNotification(
  d: EmailDeposit,
  opts?: RenderOptions
): RenderedEmail {
  const sq = EMAIL_COPY.sq;
  const baseUrl = origin(opts);
  const amount = formatAmount(d.amount_cents, d.currency, sq.locale);
  const paid = formatDateTime(d.paid_at, sq.locale) ?? '—';
  const phone = d.phone?.trim() || '';
  const email = d.email?.trim() || '';

  const rows: Array<[string, string]> = [
    ['Emri', e(d.name)],
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
    ['Shuma', e(amount)],
    ['Paguar më', e(paid)],
    ['Gjuha e pacientit', e(EMAIL_COPY[d.language].languageName)],
    ['Krijuar nga', e(d.created_by || '—')],
  ];
  if (d.call_list_ref) rows.push(['Rreshti në listë', e(d.call_list_ref)]);
  if (d.booking_id) rows.push(['Rezervimi', e(d.booking_id.slice(0, 8))]);
  rows.push(['Referenca', e(depositRef(d.id))]);
  if (d.provider_order_id) rows.push(['Porosia POK', e(d.provider_order_id)]);

  const subject = `Parapagim i paguar: ${d.name} – ${amount}`;
  const body = [
    paragraph(
      'POK konfirmoi pagesën e parapagimit më poshtë. Paratë shkojnë drejtpërdrejt në llogarinë POK të klinikës.'
    ),
    detailsBox('Detajet e parapagimit', rows),
    `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${spacer(22)}<tr><td align="center">${button(`${baseUrl}/receptionist`, 'Shko te paneli', true)}</td></tr>${spacer(26)}</table>`,
  ].join('\n');

  const html = layout({
    lang: 'sq',
    title: e(subject),
    preheader: e(`${d.name} · ${amount}`),
    eyebrow: 'Parapagim i paguar',
    heading: e(d.name),
    body,
    footerNote: 'Njoftim i brendshëm për stafin e klinikës.',
    addressLine: e(sq.addressValue),
    baseUrl,
  });

  const text = [
    'Parapagim i paguar (konfirmuar nga POK)',
    '',
    `Emri: ${d.name}`,
    `Telefon: ${phone || '—'}`,
    `Email: ${email || '—'}`,
    `Shuma: ${amount}`,
    `Paguar më: ${paid}`,
    `Gjuha e pacientit: ${EMAIL_COPY[d.language].languageName}`,
    `Krijuar nga: ${d.created_by || '—'}`,
    ...(d.call_list_ref ? [`Rreshti në listë: ${d.call_list_ref}`] : []),
    ...(d.booking_id ? [`Rezervimi: ${d.booking_id.slice(0, 8)}`] : []),
    `Referenca: ${depositRef(d.id)}`,
    ...(d.provider_order_id ? [`Porosia POK: ${d.provider_order_id}`] : []),
    '',
    `Paneli: ${baseUrl}/receptionist`,
  ].join('\n');

  return { subject, html, text };
}
