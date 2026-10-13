/**
 * The Meta-form answers of a booking (treatment interest, X-ray, travel timeframe) as label/value
 * rows for the dashboard. treatment_interest and has_xray are health-adjacent: they are shown here
 * and in the internal clinic email only, never exported.
 */
export interface BookingAnswerFields {
  treatment_interest?: string | null;
  has_xray?: boolean | null;
  travel_timeframe?: string | null;
}

const INTERESTS = ['implants', 'veneers', 'unsure'];
const TIMEFRAMES = ['within_30_days', '1_to_3_months', 'over_3_months'];

export function bookingAnswerRows(
  b: BookingAnswerFields,
  t: (key: string) => string
): Array<{ key: string; label: string; value: string }> {
  const rows: Array<{ key: string; label: string; value: string }> = [];
  if (b.treatment_interest && INTERESTS.includes(b.treatment_interest)) {
    rows.push({
      key: 'treatment_interest',
      label: t('receptionist.questions.treatmentInterest'),
      value: t(`booking.questions.treatment_interest.${b.treatment_interest}`),
    });
  }
  if (b.has_xray === true || b.has_xray === false) {
    rows.push({
      key: 'has_xray',
      label: t('receptionist.questions.hasXray'),
      value: t(`booking.questions.has_xray.${b.has_xray ? 'yes' : 'no'}`),
    });
  }
  if (b.travel_timeframe && TIMEFRAMES.includes(b.travel_timeframe)) {
    rows.push({
      key: 'travel_timeframe',
      label: t('receptionist.questions.travelTimeframe'),
      value: t(`booking.questions.travel_timeframe.${b.travel_timeframe}`),
    });
  }
  return rows;
}
