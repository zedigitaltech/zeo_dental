-- The three qualifying questions of the clinic's Meta lead form, asked on the website forms too.
-- treatment_interest and has_xray are health-adjacent: they stay in D1 (receptionist dashboard and
-- the internal clinic email only) and are never exported. travel_timeframe is exported to the call
-- list. All nullable: older rows have none, and an invalid value from the form is stored as NULL.
-- Additive only.
ALTER TABLE bookings ADD COLUMN treatment_interest TEXT
  CHECK (treatment_interest IS NULL OR treatment_interest IN ('implants', 'veneers', 'unsure'));
ALTER TABLE bookings ADD COLUMN has_xray INTEGER CHECK (has_xray IS NULL OR has_xray IN (0, 1));
ALTER TABLE bookings ADD COLUMN travel_timeframe TEXT
  CHECK (travel_timeframe IS NULL OR travel_timeframe IN ('within_30_days', '1_to_3_months', 'over_3_months'));
