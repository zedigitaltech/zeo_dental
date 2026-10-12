/**
 * Small repository helpers over raw D1 prepared statements. Every read filters deleted_at IS NULL;
 * nothing here deletes a row.
 */

/** Postgres `SELECT *` column order of the Fly table, so JSON keys come out in the same order. */
export const BOOKING_COLUMNS = [
  'id',
  'name',
  'email',
  'phone',
  'service',
  'preferred_date',
  'preferred_time',
  'status',
  'notes',
  'created_at',
  'updated_at',
  'confirmed_date',
  'confirmed_time',
  'cancellation_reason',
  'confirmed_by',
  'confirmed_at',
  'whatsapp_sent',
  'confirmation_email_sent',
  'description',
] as const;

export const BOOKING_SELECT = BOOKING_COLUMNS.join(', ');

export interface BookingRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  service: string;
  preferred_date: string | null;
  preferred_time: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  confirmed_date: string | null;
  confirmed_time: string | null;
  cancellation_reason: string | null;
  confirmed_by: string | null;
  confirmed_at: string | null;
  whatsapp_sent: boolean;
  confirmation_email_sent: boolean;
  description: string | null;
}

/** SQLite stores booleans as 0/1; the API keeps returning true/false. */
export function toBooking(row: Record<string, unknown>): BookingRow {
  const out: Record<string, unknown> = {};
  for (const c of BOOKING_COLUMNS) out[c] = row[c] ?? null;
  out.whatsapp_sent = row.whatsapp_sent === 1 || row.whatsapp_sent === true;
  out.confirmation_email_sent =
    row.confirmation_email_sent === 1 || row.confirmation_email_sent === true;
  return out as unknown as BookingRow;
}

/** ISO-8601 UTC with milliseconds and Z — the format every timestamp column uses. */
export const nowIso = (): string => new Date().toISOString();

export const STATUSES = ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'] as const;

export async function findBooking(db: D1Database, id: string): Promise<BookingRow | null> {
  const row = await db
    .prepare(`SELECT ${BOOKING_SELECT} FROM bookings WHERE id = ? AND deleted_at IS NULL`)
    .bind(id)
    .first<Record<string, unknown>>();
  return row ? toBooking(row) : null;
}
