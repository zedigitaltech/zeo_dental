-- Deposit payment links (POK). The call centre creates a link for a patient; the money goes
-- straight to Zeo Dental Clinic's own POK merchant account, never through the call centre.
--
-- Most call-list patients are not website bookings, so booking_id is optional. No health data:
-- name and contact only, plus the agent's own label and call-list note.
-- status is decided only from POK's GET /sdk-orders/{id}, never from a webhook body.
-- webhook_token: random per deposit, part of the webhookUrl given to POK; compared in constant time.
-- Additive only. Soft delete only (deleted_at); nothing issues DELETE.
CREATE TABLE IF NOT EXISTS deposits (
  id                TEXT PRIMARY KEY NOT NULL,
  booking_id        TEXT REFERENCES bookings(id),
  name              TEXT NOT NULL,
  phone             TEXT,
  email             TEXT,
  language          TEXT NOT NULL DEFAULT 'it'
                    CHECK (language IN ('sq', 'en', 'it', 'de', 'fr', 'tr', 'el', 'es')),
  amount_cents      INTEGER NOT NULL CHECK (amount_cents > 0),
  currency          TEXT NOT NULL,
  provider          TEXT NOT NULL DEFAULT 'pok',
  provider_order_id TEXT UNIQUE,
  confirm_url       TEXT,
  webhook_token     TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'paid', 'expired', 'cancelled', 'failed')),
  -- Who the link is for, normalised: last 9 phone digits, else the lower-case e-mail.
  -- At most one pending link per contact (partial unique index below) closes the double-click race.
  match_key         TEXT NOT NULL,
  created_by        TEXT,
  call_list_ref     TEXT,
  -- Set once, by the first verified payment; guards the one-time emails.
  notified_at       TEXT,
  created_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  paid_at           TEXT,
  expires_at        TEXT,
  deleted_at        TEXT,
  CHECK (phone IS NOT NULL OR email IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_deposits_booking ON deposits(booking_id);
CREATE INDEX IF NOT EXISTS idx_deposits_status  ON deposits(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deposits_phone   ON deposits(phone);
CREATE UNIQUE INDEX IF NOT EXISTS uq_deposits_open_contact
  ON deposits(match_key) WHERE status = 'pending' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_deposits_email   ON deposits(email);
CREATE INDEX IF NOT EXISTS idx_deposits_created ON deposits(created_at DESC);
-- Export cursor (updated_at, id) for the sheet sync.
CREATE INDEX IF NOT EXISTS idx_deposits_updated ON deposits(updated_at, id);
