/**
 * The three qualifying questions of the clinic's Meta lead form, also asked on the website.
 * Pure: no bindings, no I/O. Invalid or missing answers become null — a booking is never rejected
 * because of them.
 *
 * Health data rule: treatment_interest and has_xray stay in D1 (receptionist dashboard + internal
 * clinic email). Only travel_timeframe may leave through the export feeds.
 */

export const TREATMENT_INTERESTS = ['implants', 'veneers', 'unsure'] as const;
export type TreatmentInterest = (typeof TREATMENT_INTERESTS)[number];

export const TRAVEL_TIMEFRAMES = ['within_30_days', '1_to_3_months', 'over_3_months'] as const;
export type TravelTimeframe = (typeof TRAVEL_TIMEFRAMES)[number];

const oneOf =
  <T extends string>(allowed: readonly T[]) =>
  (v: unknown): T | null => {
    if (typeof v !== 'string') return null;
    const s = v.trim().toLowerCase();
    return (allowed as readonly string[]).includes(s) ? (s as T) : null;
  };

export const parseTreatmentInterest = oneOf(TREATMENT_INTERESTS);
export const parseTravelTimeframe = oneOf(TRAVEL_TIMEFRAMES);

/** true/false (what the forms send) or 1/0 → 1/0; anything else (strings too) → null. */
export function parseHasXray(v: unknown): 0 | 1 | null {
  if (v === true || v === 1) return 1;
  if (v === false || v === 0) return 0;
  return null;
}

/** Albanian labels for staff (dashboard and clinic email). */
export const TREATMENT_INTEREST_SQ: Record<TreatmentInterest, string> = {
  implants: 'Implante dentare',
  veneers: 'Faseta dentare',
  unsure: 'Nuk e di',
};

export const TRAVEL_TIMEFRAME_SQ: Record<TravelTimeframe, string> = {
  within_30_days: 'Brenda 30 ditëve',
  '1_to_3_months': 'Për 1 deri në 3 muaj',
  over_3_months: 'Pas më shumë se 3 muajsh',
};

export const treatmentInterestSq = (v: unknown): string | null => {
  const k = parseTreatmentInterest(v);
  return k ? TREATMENT_INTEREST_SQ[k] : null;
};

export const travelTimeframeSq = (v: unknown): string | null => {
  const k = parseTravelTimeframe(v);
  return k ? TRAVEL_TIMEFRAME_SQ[k] : null;
};

export const hasXraySq = (v: unknown): string | null => {
  const k = parseHasXray(v);
  return k === null ? null : k === 1 ? 'Po' : 'Jo';
};
