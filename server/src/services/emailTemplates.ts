import type { Booking } from '../types.js';
import type { FastifyInstance } from 'fastify';
import { Resend } from 'resend';

import {
  escapeHtml,
  getConfirmationEmailHtml,
  getCancellationEmailHtml,
  getClinicNotificationHtml,
} from '../utils/emailHtml.js';

// Initialize Resend
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const mailFrom = process.env.MAIL_FROM || 'Zeo Dental Clinic <onboarding@resend.dev>';
const clinicEmail = process.env.MAIL_TO || 'zeodentalclinic@gmail.com';
const partnerEmail = process.env.MAIL_TO_PARTNER || '';


// Send confirmation email via Resend
export async function sendConfirmationEmail(
  booking: Booking,
  fastify: FastifyInstance
): Promise<boolean> {
  if (!resend) {
    fastify.log.warn('RESEND_API_KEY not configured; skipping confirmation email');
    return false;
  }

  try {
    const html = getConfirmationEmailHtml(booking, 'sq');
    const subject = `Takimi juaj është konfirmuar - Zeo Dental`;

    const { error } = await resend.emails.send({
      from: mailFrom,
      to: booking.email,
      subject,
      html,
    });

    if (error) {
      fastify.log.error('Resend confirmation error: %s', error.message);
      return false;
    }

    fastify.log.info('Confirmation email sent to %s', booking.email);
    return true;
  } catch (error) {
    fastify.log.error(
      'Confirmation email error: %s',
      error instanceof Error ? error.message : String(error)
    );
    return false;
  }
}

// Send cancellation email via Resend
export async function sendCancellationEmail(
  booking: Booking,
  fastify: FastifyInstance
): Promise<boolean> {
  if (!resend) {
    fastify.log.warn('RESEND_API_KEY not configured; skipping cancellation email');
    return false;
  }

  try {
    const html = getCancellationEmailHtml(booking, 'sq');
    const subject = `Takimi juaj është anuluar - Zeo Dental`;

    const { error } = await resend.emails.send({
      from: mailFrom,
      to: booking.email,
      subject,
      html,
    });

    if (error) {
      fastify.log.error('Resend cancellation error: %s', error.message);
      return false;
    }

    fastify.log.info('Cancellation email sent to %s', booking.email);
    return true;
  } catch (error) {
    fastify.log.error(
      'Cancellation email error: %s',
      error instanceof Error ? error.message : String(error)
    );
    return false;
  }
}

// Send notification to clinic about new booking
export async function sendClinicNotification(
  booking: Booking,
  fastify: FastifyInstance
): Promise<boolean> {
  if (!resend) {
    return false;
  }

  try {
    const recipients = [clinicEmail];
    if (partnerEmail) recipients.push(partnerEmail);

    const notificationHtml = getClinicNotificationHtml(booking);

    const { error } = await resend.emails.send({
      from: mailFrom,
      to: recipients,
      subject: `Kërkesë e Re: ${escapeHtml(booking.name)} - ${escapeHtml(booking.service)}`,
      html: notificationHtml,
    });

    if (error) {
      fastify.log.error('Clinic notification error: %s', error.message);
      return false;
    }

    fastify.log.info('Clinic notification sent for booking %s', booking.id);
    return true;
  } catch (error) {
    fastify.log.error(
      'Clinic notification error: %s',
      error instanceof Error ? error.message : String(error)
    );
    return false;
  }
}
