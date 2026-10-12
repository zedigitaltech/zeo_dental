import type { Booking } from '../types.js';
import {
  formatPhoneForWhatsApp,
  whatsappConfirmationText,
  whatsappCancellationText,
  whatsappReminderText,
} from '../utils/whatsappText.js';

// WhatsApp Business API via Meta Cloud API
// Documentation: https://developers.facebook.com/docs/whatsapp/cloud-api

interface WhatsAppResponse {
  messages?: { id: string }[];
}

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

const isWhatsAppEnabled = Boolean(WHATSAPP_PHONE_NUMBER_ID && WHATSAPP_ACCESS_TOKEN);

// Send WhatsApp message using Cloud API
async function sendWhatsAppMessage(to: string, message: string): Promise<boolean> {
  if (!isWhatsAppEnabled) {
    console.log('[WhatsApp] Service not configured. Message would be sent to:', to);
    console.log('[WhatsApp] Message:', message);
    return false;
  }

  try {
    const response = await fetch(`${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formatPhoneForWhatsApp(to),
        type: 'text',
        text: {
          preview_url: false,
          body: message,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[WhatsApp] API Error:', error);
      return false;
    }

    const result = (await response.json()) as WhatsAppResponse;
    console.log('[WhatsApp] Message sent successfully:', result.messages?.[0]?.id);
    return true;
  } catch (error) {
    console.error('[WhatsApp] Send error:', error);
    return false;
  }
}

// Send confirmation message
export async function sendWhatsAppConfirmation(booking: Booking): Promise<boolean> {
  return sendWhatsAppMessage(booking.phone, whatsappConfirmationText(booking));
}

// Send cancellation message
export async function sendWhatsAppCancellation(booking: Booking): Promise<boolean> {
  return sendWhatsAppMessage(booking.phone, whatsappCancellationText(booking));
}

// Send reminder message (can be used for day-before reminders)
export async function sendWhatsAppReminder(booking: Booking): Promise<boolean> {
  return sendWhatsAppMessage(booking.phone, whatsappReminderText(booking));
}
