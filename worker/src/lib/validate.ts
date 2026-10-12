/** Same rules as server/src/routes/booking.ts. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  return /^[\d\s\-()+]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/** Today or later (UTC, like the Fly machine). Returns the YYYY-MM-DD to store, or null if invalid/past. */
export function futureDate(dateString: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}/.test(dateString)) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (!(date >= today)) return null;
  return dateString.slice(0, 10);
}

export const isIsoDate = (s: unknown): s is string =>
  typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(s).getTime());

export const TIME_SLOTS = ['morning', 'afternoon', 'evening'];
