/**
 * Resend over fetch (the SDK is not needed on Workers). Recipients match
 * server/src/services/emailTemplates.ts; the templates live in ./emailTemplates.ts. Patient emails go
 * out in the patient's language (emailLanguage), the clinic notification in Albanian. Every email
 * carries a plain-text alternative. Logs carry booking ids only, never addresses.
 */
import type { Env } from '../env';
import type { BookingRow } from './db';
import { emailLanguage } from './emailLanguage';
import {
  renderCancellationEmail,
  renderClinicNotification,
  renderConfirmationEmail,
  type EmailBooking,
  type RenderedEmail,
} from './emailTemplates';
import { errMsg } from './http';

export const RESEND_URL = 'https://api.resend.com/emails';

async function send(
  env: Env,
  to: string | string[],
  mail: RenderedEmail,
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
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
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

const opts = (env: Env) => ({ baseUrl: env.BASE_URL });

export async function sendClinicNotification(
  env: Env,
  booking: Partial<BookingRow>
): Promise<boolean> {
  if (!env.RESEND_API_KEY) return false; // parity: silent when unconfigured
  const ok = await send(
    env,
    clinicRecipients(env),
    renderClinicNotification(booking as EmailBooking, opts(env)),
    'clinic notification'
  );
  if (ok) console.log(`Clinic notification sent for booking ${booking.id}`);
  return ok;
}

export function sendConfirmationEmail(env: Env, booking: BookingRow): Promise<boolean> {
  return send(
    env,
    booking.email ?? '',
    renderConfirmationEmail(booking, emailLanguage(booking), opts(env)),
    'confirmation'
  );
}

export function sendCancellationEmail(env: Env, booking: BookingRow): Promise<boolean> {
  return send(
    env,
    booking.email ?? '',
    renderCancellationEmail(booking, emailLanguage(booking), opts(env)),
    'cancellation'
  );
}
