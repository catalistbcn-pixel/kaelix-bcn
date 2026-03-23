-- Run this in: Supabase Dashboard → SQL Editor → New Query

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  instagram   TEXT NOT NULL,
  whatsapp    TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick email lookup (prevent duplicates if needed)
CREATE INDEX IF NOT EXISTS reservations_email_idx ON reservations (email);

-- Optional: prevent duplicate emails
-- ALTER TABLE reservations ADD CONSTRAINT unique_email UNIQUE (email);

-- Disable public access (only service role key can insert)
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Allow inserts from service role only (no public read/write)
-- No RLS policies needed when using the service role key from the function
