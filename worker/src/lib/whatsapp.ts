/**
 * WhatsApp Cloud API, same messages as server/src/services/whatsapp.ts (text imported from the
 * server's shared module). Off unless both WHATSAPP_* secrets are set; then it returns false
 * without logging the message (the Fastify version logged it, with the patient's name).
 */
import type { Booking } from '../../../server/src/types';
import {
  formatPhoneForWhatsApp,
  whatsappCancellationText,
  whatsappConfirmationText,
} from '../../../server/src/utils/whatsappText';
import type { Env } from '../env';
import type { BookingRow } from './db';
import { errMsg } from './http';

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';

async function sendWhatsAppMessage(env: Env, to: string | null, message: string): Promise<boolean> {
  if (!env.WHATSAPP_PHONE_NUMBER_ID || !env.WHATSAPP_ACCESS_TOKEN || !to) return false;
  try {
    const res = await fetch(`${WHATSAPP_API_URL}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formatPhoneForWhatsApp(to),
        type: 'text',
        text: { preview_url: false, body: message },
      }),
    });
    if (!res.ok) {
      console.error(`[WhatsApp] API error: HTTP ${res.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[WhatsApp] send error: ${errMsg(err)}`);
    return false;
  }
}

export const sendWhatsAppConfirmation = (env: Env, b: BookingRow) =>
  sendWhatsAppMessage(env, b.phone, whatsappConfirmationText(b as unknown as Booking));

export const sendWhatsAppCancellation = (env: Env, b: BookingRow) =>
  sendWhatsAppMessage(env, b.phone, whatsappCancellationText(b as unknown as Booking));
