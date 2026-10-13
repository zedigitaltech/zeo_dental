-- The site language the patient booked in (sq, en, it, de, fr, tr, el, es), so confirmation and
-- cancellation emails go out in that language. Nullable: rows imported from Fly have none and the
-- email falls back to the phone prefix. Additive only.
ALTER TABLE bookings ADD COLUMN language TEXT;
