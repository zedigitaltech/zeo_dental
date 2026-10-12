-- Zeo Dental on D1 (SQLite). Same columns as the Fly Postgres schema after migrations 001–006,
-- with the drift fixed (status CHECK, created/date indexes) and the email-only bug fixed
-- (phone is nullable; at least one of phone/email is required).
--
-- Conventions
--   ids          bookings: TEXT uuid (existing ids kept on import, new ones crypto.randomUUID())
--                booking_files / chat_usage: INTEGER (existing SERIAL ids kept on import)
--   timestamps   TEXT ISO-8601 UTC with milliseconds and Z, e.g. 2026-10-12T15:58:09.123Z
--   dates        TEXT YYYY-MM-DD
--   booleans     INTEGER 0/1 (mapped back to true/false in JSON)
--   deletion     soft only: deleted_at. Nothing in the app issues DELETE.
--   updated_at   set explicitly by every UPDATE (no triggers)
--
-- Owner decision 2026-10-12: uploaded files are never purged or auto-retired; booking_files.expires_at
-- stays informational. There is deliberately no retired_at column and no retention cron.

CREATE TABLE IF NOT EXISTS bookings (
  id                      TEXT PRIMARY KEY NOT NULL,
  name                    TEXT NOT NULL,
  email                   TEXT,
  phone                   TEXT,
  service                 TEXT NOT NULL,
  preferred_date          TEXT CHECK (preferred_date IS NULL OR preferred_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  preferred_time          TEXT CHECK (preferred_time IS NULL OR preferred_time IN ('morning', 'afternoon', 'evening')),
  status                  TEXT NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  description             TEXT,
  notes                   TEXT,
  confirmed_date          TEXT CHECK (confirmed_date IS NULL OR confirmed_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  confirmed_time          TEXT,
  cancellation_reason     TEXT,
  confirmed_by            TEXT,
  confirmed_at            TEXT,
  whatsapp_sent           INTEGER NOT NULL DEFAULT 0 CHECK (whatsapp_sent IN (0, 1)),
  confirmation_email_sent INTEGER NOT NULL DEFAULT 0 CHECK (confirmation_email_sent IN (0, 1)),
  created_at              TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at              TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  deleted_at              TEXT,
  CHECK (phone IS NOT NULL OR email IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_bookings_email       ON bookings(email);
CREATE INDEX IF NOT EXISTS idx_bookings_date        ON bookings(preferred_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status      ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created     ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_status_date ON bookings(status, preferred_date DESC);
-- Export cursor (updated_at, id) for the sheet sync.
CREATE INDEX IF NOT EXISTS idx_bookings_updated     ON bookings(updated_at, id);

CREATE TABLE IF NOT EXISTS booking_files (
  id                  INTEGER PRIMARY KEY,
  -- No ON DELETE CASCADE: rows are never deleted, and a file row must never vanish with its booking.
  booking_id          TEXT NOT NULL REFERENCES bookings(id),
  filename            TEXT NOT NULL,
  original_name       TEXT NOT NULL,
  mime_type           TEXT NOT NULL,
  size_bytes          INTEGER NOT NULL CHECK (size_bytes >= 0),
  -- R2 key: bookings/<booking_id>/<uuid>.<ext>
  storage_path        TEXT NOT NULL,
  health_data_consent INTEGER NOT NULL DEFAULT 0 CHECK (health_data_consent IN (0, 1)),
  -- Informational only (owner decision): nothing purges or hides a file when it passes.
  expires_at          TEXT NOT NULL,
  created_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  deleted_at          TEXT
);

CREATE INDEX IF NOT EXISTS idx_booking_files_booking_id ON booking_files(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_files_expires_at ON booking_files(expires_at);

CREATE TABLE IF NOT EXISTS chat_usage (
  id             INTEGER PRIMARY KEY,
  input_tokens   INTEGER NOT NULL,
  output_tokens  INTEGER NOT NULL,
  total_tokens   INTEGER NOT NULL,
  estimated_cost REAL NOT NULL DEFAULT 0,
  language       TEXT DEFAULT 'sq',
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  deleted_at     TEXT
);

CREATE INDEX IF NOT EXISTS idx_chat_usage_created_at ON chat_usage(created_at);

-- Fallback rate limiter (and the admin lockout / per-address daily chat cap, which always use D1).
-- A fixed ring: slot = '<bucket>:<n>' with n = sha256(salt · ip) mod 4096, so the table can never hold
-- more than 4096 rows per bucket and stores no address. A stale window is reset in place by the
-- upsert; nothing is ever deleted.
CREATE TABLE IF NOT EXISTS rate_limits (
  slot         TEXT PRIMARY KEY NOT NULL,
  window_start INTEGER NOT NULL,
  count        INTEGER NOT NULL DEFAULT 0
);
