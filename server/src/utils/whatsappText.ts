// WhatsApp message text shared by the Fastify server (services/whatsapp.ts) and the Cloudflare Worker.
// Pure: no Node imports, no environment reads.
import type { Booking } from '../types.js';

// Format date for Albanian locale
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString('sq-AL', options);
}

// Format phone number for WhatsApp (must include country code, no + symbol)
export function formatPhoneForWhatsApp(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // If starts with 0, assume Albanian number and add country code
  if (cleaned.startsWith('0')) {
    cleaned = '355' + cleaned.slice(1);
  }

  // If doesn't start with country code, assume Albanian
  if (!cleaned.startsWith('355') && cleaned.length <= 10) {
    cleaned = '355' + cleaned;
  }

  return cleaned;
}

export function whatsappConfirmationText(booking: Booking): string {
  const confirmedDate = booking.confirmed_date
    ? formatDate(booking.confirmed_date)
    : booking.preferred_date
      ? formatDate(booking.preferred_date)
      : 'TBD';
  const confirmedTime = booking.confirmed_time || booking.preferred_time || 'TBD';

  const message = `🦷 *Zeo Dental Clinic*

Përshëndetje ${booking.name}!

Takimi juaj është konfirmuar:

📅 *Data:* ${confirmedDate}
🕐 *Ora:* ${confirmedTime}
🏥 *Shërbimi:* ${booking.service}

📍 *Adresa:*
Rruga Hamdi Sina, Tiranë, Shqipëri

📞 Për ndryshime na kontaktoni:
+355 68 400 4840

Ju mirëpresim!
_Zeo Dental Clinic_`;
  return message;
}

export function whatsappCancellationText(booking: Booking): string {
  const preferredDate = booking.preferred_date ? formatDate(booking.preferred_date) : 'TBD';

  const message = `🦷 *Zeo Dental Clinic*

Përshëndetje ${booking.name},

Takimi juaj për datën ${preferredDate} është anuluar.
${booking.cancellation_reason ? `\nArsyeja: ${booking.cancellation_reason}` : ''}

Për të ricaktuar një takim të ri, na kontaktoni:
📞 +355 68 400 4840
📧 zeodentalclinic@gmail.com

_Zeo Dental Clinic_`;
  return message;
}

export function whatsappReminderText(booking: Booking): string {
  const confirmedDate = booking.confirmed_date
    ? formatDate(booking.confirmed_date)
    : booking.preferred_date
      ? formatDate(booking.preferred_date)
      : 'TBD';
  const confirmedTime = booking.confirmed_time || booking.preferred_time || 'TBD';

  const message = `🦷 *Zeo Dental Clinic - Kujtesë*

Përshëndetje ${booking.name}!

Ju kujtojmë takimin tuaj nesër:

📅 *Data:* ${confirmedDate}
🕐 *Ora:* ${confirmedTime}

📍 Rruga Hamdi Sina, Tiranë

Në rast pamundësie, na njoftoni:
📞 +355 68 400 4840

Ju mirëpresim!
_Zeo Dental Clinic_`;
  return message;
}
