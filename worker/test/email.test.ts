import { env } from 'cloudflare:test';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  emailLanguage,
  languageFromPhone,
  SUPPORTED_EMAIL_LANGUAGES,
} from '../src/lib/emailLanguage';
import { EMAIL_COPY } from '../src/lib/emailCopy';
import {
  formatEmailDate,
  renderCancellationEmail,
  renderClinicNotification,
  renderConfirmationEmail,
} from '../src/lib/emailTemplates';
import { futureDay, mockFetch, patchJson, postJson, seedBooking } from './helpers';

afterEach(() => vi.restoreAllMocks());

type Json = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
const resendOk = () => mockFetch(() => new Response(JSON.stringify({ id: 'x' }), { status: 200 }));
const sentMail = (f: ReturnType<typeof resendOk>, i = 0): Json =>
  JSON.parse(String((f.mock.calls[i][1] as RequestInit).body));

describe('emailLanguage', () => {
  const cases: Array<[string | null, string | null, string]> = [
    ['it', '+355 68 000 0000', 'it'], // stored language wins over the phone
    ['el', null, 'el'],
    ['xx', '+39 333 111 2222', 'it'], // invalid stored code → phone
    [null, '+355 68 400 4840', 'sq'],
    [null, '0039 333 111 2222', 'it'],
    [null, '+49 151 0000000', 'de'],
    [null, '+43 660 0000000', 'de'],
    [null, '+41 79 000 00 00', 'de'],
    [null, '+33 6 00 00 00 00', 'fr'],
    [null, '+32 470 00 00 00', 'fr'],
    [null, '+90 532 000 00 00', 'tr'],
    [null, '+30 690 000 0000', 'el'],
    [null, '+357 99 000000', 'el'],
    [null, '+34 600 000 000', 'es'],
    [null, '+44 7700 900000', 'en'],
    [null, '+353 85 000 0000', 'en'],
    [null, '+1 (555) 010-0000', 'en'],
    [null, '+381 60 000 0000', 'en'], // unmapped country → default
    [null, '068 400 4840', 'en'], // national format: not guessed
    [null, null, 'en'],
  ];
  for (const [language, phone, want] of cases) {
    it(`${language ?? 'none'} / ${phone ?? 'none'} -> ${want}`, () => {
      expect(emailLanguage({ language, phone })).toBe(want);
    });
  }

  it('languageFromPhone needs an international prefix', () => {
    expect(languageFromPhone('+355684004840')).toBe('sq');
    expect(languageFromPhone('00355684004840')).toBe('sq');
    expect(languageFromPhone('355684004840')).toBeNull();
    expect(languageFromPhone('')).toBeNull();
  });
});

describe('templates', () => {
  const base = {
    name: 'Maria Rossi',
    email: 'maria@example.invalid',
    phone: '+39 333 111 2222',
    service: 'Implantologia',
    confirmed_date: '2026-11-03',
    confirmed_time: '10:30',
  };

  it('every language renders subject, html and text without leftovers', () => {
    for (const lang of SUPPORTED_EMAIL_LANGUAGES) {
      for (const mail of [
        renderConfirmationEmail(base, lang),
        renderCancellationEmail({ ...base, cancellation_reason: 'x' }, lang),
      ]) {
        expect(mail.subject).toContain('Zeo Dental Clinic');
        expect(mail.html).toContain(`<html lang="${lang}"`);
        expect(mail.html).toContain('https://wa.me/355684004840');
        expect(mail.html).toContain('https://zeodentalclinic.com/images/zeo-logo-email.png');
        expect(mail.html).not.toMatch(/\bundefined\b|\bnull\b|N\/A|\bNaN\b/);
        expect(mail.text).toContain('+355 68 400 4840');
        expect(mail.text).not.toMatch(/\bundefined\b|\bnull\b|\bNaN\b|</);
      }
    }
  });

  it('formats dates per locale in Tirana time', () => {
    expect(formatEmailDate('2026-11-03', 'it-IT')).toBe('martedì 3 novembre 2026');
    expect(formatEmailDate('2026-11-03', 'de-DE')).toBe('Dienstag, 3. November 2026');
    expect(formatEmailDate(null, 'it-IT')).toBeNull();
    expect(formatEmailDate('soon', 'it-IT')).toBeNull();
  });

  it('no date: says the clinic will be in touch instead of N/A', () => {
    const mail = renderConfirmationEmail({ ...base, confirmed_date: null }, 'it');
    expect(mail.html).toContain('La contatteremo a breve');
    expect(mail.text).toContain('La contatteremo a breve');
  });

  it('uses BASE_URL for the logo and panel link', () => {
    const mail = renderClinicNotification(base, { baseUrl: 'https://staging.example.invalid/' });
    expect(mail.html).toContain('https://staging.example.invalid/images/zeo-logo-email.png');
    expect(mail.html).toContain('https://staging.example.invalid/receptionist');
  });

  it('clinic notification is Albanian and shows the patient language', () => {
    expect(renderClinicNotification({ ...base, language: 'it' }).html).toContain(
      'Gjuha e pacientit'
    );
    expect(renderClinicNotification({ ...base, language: 'it' }).text).toContain(
      'Gjuha e pacientit: Italiano'
    );
    expect(renderClinicNotification({ ...base, language: null }).text).toContain(
      'Italiano (sipas numrit të telefonit)'
    );
  });

  it('escapes a malicious name, service, notes and reason in every template', () => {
    const evil = '<img src=x onerror=alert(1)>"\'';
    const b = {
      ...base,
      name: evil,
      service: evil,
      notes: evil,
      description: evil,
      cancellation_reason: evil,
      phone: '+39 333 111 2222',
      email: 'a@example.invalid',
    };
    const all = [
      ...SUPPORTED_EMAIL_LANGUAGES.flatMap(l => [
        renderConfirmationEmail(b, l),
        renderCancellationEmail(b, l),
      ]),
      renderClinicNotification(b),
    ];
    for (const mail of all) {
      expect(mail.html).not.toContain('<img src=x');
      expect(mail.html).not.toContain('onerror=alert(1)>');
      expect(mail.html).toContain('&lt;img src=x onerror=alert(1)&gt;&quot;&#x27;');
    }
  });

  it('copy avoids offer / discount / guarantee wording', () => {
    const banned =
      /discount|offer|promotion|guarantee|sconto|offerta|promozione|garanzi|rabatt|angebot|garantie|remise|promo|indirim|kampanya|garanti|έκπτωση|προσφορά|εγγύηση|descuento|oferta|promoci|garantía|zbritje|ofert|garanci/i;
    for (const lang of SUPPORTED_EMAIL_LANGUAGES) {
      expect(JSON.stringify(EMAIL_COPY[lang])).not.toMatch(banned);
    }
  });
});

describe('booking language', () => {
  const valid = {
    name: 'Lingua Prova',
    email: 'lingua@example.invalid',
    phone: '+39 333 000 1111',
    service: 'X',
  };
  const stored = async (body: Json) => {
    resendOk();
    const res = await postJson('/api/booking', { ...valid, ...body });
    expect(res.status).toBe(201);
    const { booking } = (await res.json()) as Json;
    const row = await env.DB.prepare('SELECT language FROM bookings WHERE id = ?')
      .bind(booking.id)
      .first<Json>();
    return row!.language;
  };

  it('stores a supported language', async () => {
    expect(await stored({ language: 'it' })).toBe('it');
    expect(await stored({ language: 'EL' })).toBe('el');
  });

  it('stores NULL for a missing, unknown or non-string language (booking still accepted)', async () => {
    expect(await stored({})).toBeNull();
    expect(await stored({ language: 'xx' })).toBeNull();
    expect(await stored({ language: "it'; DROP TABLE bookings;--" })).toBeNull();
    expect(await stored({ language: 7 })).toBeNull();
  });

  it('clinic notification carries the patient language and a text part', async () => {
    const f = resendOk();
    await postJson('/api/booking', { ...valid, language: 'de' });
    const mail = sentMail(f);
    expect(mail.subject).toBe('Kërkesë e Re: Lingua Prova - X');
    expect(mail.text).toContain('Gjuha e pacientit: Deutsch');
    expect(mail.html).toContain('Deutsch');
  });
});

describe('patient emails in the patient language', () => {
  it('confirmation goes out in Italian for language "it", with a text part', async () => {
    const f = resendOk();
    const id = await seedBooking({ language: 'it', phone: '+355 68 000 0000' });
    const res = await patchJson(`/api/receptionist/bookings/${id}/confirm`, {
      confirmed_date: futureDay(5),
      confirmed_time: '10:30',
      send_email: true,
    });
    expect(res.status).toBe(200);
    const mail = sentMail(f);
    expect(mail.subject).toBe('Il suo appuntamento è confermato – Zeo Dental Clinic');
    expect(mail.html).toContain('Gentile');
    expect(mail.html).toContain('<html lang="it"');
    expect(mail.text).toContain('Dettagli dell’appuntamento'.toUpperCase());
    expect(mail.text).toContain('10:30');
  });

  it('confirmation falls back to the phone prefix when no language is stored', async () => {
    const f = resendOk();
    const id = await seedBooking({ language: null, phone: '+39 333 444 5555' });
    await patchJson(`/api/receptionist/bookings/${id}/confirm`, {
      confirmed_date: futureDay(5),
      confirmed_time: '09:00',
      send_email: true,
    });
    expect(sentMail(f).subject).toBe('Il suo appuntamento è confermato – Zeo Dental Clinic');
  });

  it('cancellation goes out in the stored language with the reason', async () => {
    const f = resendOk();
    const id = await seedBooking({ language: 'fr', phone: null });
    await patchJson(`/api/receptionist/bookings/${id}/cancel`, {
      reason: 'Indisponibilité',
      notify_patient: true,
    });
    const mail = sentMail(f);
    expect(mail.subject).toBe('Votre rendez-vous a été annulé – Zeo Dental Clinic');
    expect(mail.text).toContain('Motif: Indisponibilité');
    expect(typeof mail.text).toBe('string');
  });

  it('defaults to English without a language or international phone', async () => {
    const f = resendOk();
    const id = await seedBooking({ language: null, phone: null });
    await patchJson(`/api/receptionist/bookings/${id}/confirm`, {
      confirmed_date: futureDay(5),
      confirmed_time: '09:00',
      send_email: true,
    });
    expect(sentMail(f).subject).toBe('Your appointment is confirmed – Zeo Dental Clinic');
  });
});
