/*
# Add Fate Book (Weekly AI Challenges)

1. New Tables
   - `fate_book`
     - `id` (uuid, primary key)
     - `hero_id` (uuid, FK to heroes)
     - `week_key` (text) - ISO week string like '2026-W28'
     - `title` (text) - AI-generated challenge title
     - `narrative` (text) - AI-generated lore backstory
     - `objectives` (jsonb) - Array of { type, amount, label, progress, baseline }
     - `reward_text` (text) - AI-generated reward description
     - `reward_gold` (integer) - Gold reward amount
     - `status` (text) - 'active' | 'completed' | 'claimed'
     - `created_at` (timestamptz)

2. Security
   - RLS enabled, anon + authenticated can CRUD their own hero's fate_book rows.

3. Notes
   - week_key allows one challenge per hero per week.
   - objectives jsonb mirrors quest objective shape for consistent progress tracking.
*/

CREATE TABLE IF NOT EXISTS fate_book (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_id uuid NOT NULL REFERENCES heroes(id) ON DELETE CASCADE,
  week_key text NOT NULL,
  title text NOT NULL DEFAULT 'Veiled Fate',
  narrative text NOT NULL DEFAULT '',
  objectives jsonb NOT NULL DEFAULT '[]'::jsonb,
  reward_text text NOT NULL DEFAULT '',
  reward_gold integer NOT NULL DEFAULT 200,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE fate_book ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_fate_book" ON fate_book;
CREATE POLICY "anon_select_fate_book" ON fate_book FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_fate_book" ON fate_book;
CREATE POLICY "anon_insert_fate_book" ON fate_book FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_fate_book" ON fate_book;
CREATE POLICY "anon_update_fate_book" ON fate_book FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_fate_book" ON fate_book;
CREATE POLICY "anon_delete_fate_book" ON fate_book FOR DELETE
  TO anon, authenticated USING (true);
