/**
 * Resend over fetch (the SDK is not needed on Workers). Same templates and recipients as
 * server/src/services/emailTemplates.ts — the HTML is imported from the server's shared module.
 * Logs carry booking ids only, never addresses.
 */
import type { Booking } from '../../../server/src/types';
import {
  CANCELLATION_SUBJECT,
  CONFIRMATION_SUBJECT,
  clinicNotificationSubject,
  getCancellationEmailHtml,
  getClinicNotificationHtml,
  getConfirmationEmailHtml,
} from '../../../server/src/utils/emailHtml';
import type { Env } from '../env';
import type { BookingRow } from './db';
import { errMsg } from './http';

export const RESEND_URL = 'https://api.resend.com/emails';

const asBooking = (b: Partial<BookingRow>) => b as unknown as Booking;

async function send(
  env: Env,
  to: string | string[],
  subject: string,
  html: string,
  tag: string
): Promise<boolean> {
  if (!env.RESEND_API_KEY) {
    console.warn(`RESEND_API_KEY not configured; skipping ${tag}`);
    return false;
  }
  try {
    const res = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: env.MAIL_FROM || 'Zeo Dental Clinic <onboarding@resend.dev>',
        to,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      console.error(`Resend ${tag} error: HTTP ${res.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Resend ${tag} error: ${errMsg(err)}`);
    return false;
  }
}

export function clinicRecipients(env: Env): string[] {
  const to = [env.MAIL_TO || 'zeodentalclinic@gmail.com'];
  if (env.MAIL_TO_PARTNER) to.push(env.MAIL_TO_PARTNER);
  return to;
}

export async function sendClinicNotification(
  env: Env,
  booking: Partial<BookingRow>
): Promise<boolean> {
  if (!env.RESEND_API_KEY) return false; // parity: silent when unconfigured
  const ok = await send(
    env,
    clinicRecipients(env),
    clinicNotificationSubject({ name: booking.name ?? '', service: booking.service ?? '' }),
    getClinicNotificationHtml(asBooking(booking)),
    'clinic notification'
  );
  if (ok) console.log(`Clinic notification sent for booking ${booking.id}`);
  return ok;
}

export function sendConfirmationEmail(env: Env, booking: BookingRow): Promise<boolean> {
  return send(
    env,
    booking.email ?? '',
    CONFIRMATION_SUBJECT,
    getConfirmationEmailHtml(asBooking(booking), 'sq'),
    'confirmation'
  );
}

export function sendCancellationEmail(env: Env, booking: BookingRow): Promise<boolean> {
  return send(
    env,
    booking.email ?? '',
    CANCELLATION_SUBJECT,
    getCancellationEmailHtml(asBooking(booking), 'sq'),
    'cancellation'
  );
}
