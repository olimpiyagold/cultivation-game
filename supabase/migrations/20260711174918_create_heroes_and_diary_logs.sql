/*
# Create heroes and diary_logs tables (single-tenant, no auth)

1. New Tables
  - `heroes`
    - `id` (uuid, primary key)
    - `name` (text, not null)
    - `stage` (text, not null, default 'Qi Condensation I')
    - `hp` (integer, not null, default 100, max 100)
    - `gold` (integer, not null, default 0)
    - `stats` (jsonb, default empty object)
    - `created_at` (timestamptz)
  - `diary_logs`
    - `id` (uuid, primary key)
    - `hero_id` (uuid, foreign key to heroes)
    - `timestamp` (timestamptz)
    - `log_text` (text, not null)
    - `type` (text, not null - combat/loot/rest)
    - `created_at` (timestamptz)

2. Security
  - Enable RLS on both tables.
  - Allow anon + authenticated full CRUD (single-tenant app, no sign-in).

3. Indexes
  - Index on diary_logs(hero_id) for fast lookups.
  - Index on diary_logs(created_at) for ordering.
*/

CREATE TABLE IF NOT EXISTS heroes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Lazy Cultivator',
  stage text NOT NULL DEFAULT 'Qi Condensation I',
  hp integer NOT NULL DEFAULT 100 CHECK (hp >= 0 AND hp <= 100),
  gold integer NOT NULL DEFAULT 0 CHECK (gold >= 0),
  stats jsonb NOT NULL DEFAULT '{"strength": 5, "agility": 3, "spirit": 7, "luck": 4}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE heroes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_heroes" ON heroes;
CREATE POLICY "anon_select_heroes" ON heroes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_heroes" ON heroes;
CREATE POLICY "anon_insert_heroes" ON heroes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_heroes" ON heroes;
CREATE POLICY "anon_update_heroes" ON heroes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_heroes" ON heroes;
CREATE POLICY "anon_delete_heroes" ON heroes FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS diary_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_id uuid NOT NULL REFERENCES heroes(id) ON DELETE CASCADE,
  timestamp timestamptz NOT NULL DEFAULT now(),
  log_text text NOT NULL,
  type text NOT NULL CHECK (type IN ('combat', 'loot', 'rest')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE diary_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_diary_logs" ON diary_logs;
CREATE POLICY "anon_select_diary_logs" ON diary_logs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_diary_logs" ON diary_logs;
CREATE POLICY "anon_insert_diary_logs" ON diary_logs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_diary_logs" ON diary_logs;
CREATE POLICY "anon_update_diary_logs" ON diary_logs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_diary_logs" ON diary_logs;
CREATE POLICY "anon_delete_diary_logs" ON diary_logs FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_diary_logs_hero_id ON diary_logs(hero_id);
CREATE INDEX IF NOT EXISTS idx_diary_logs_created_at ON diary_logs(created_at DESC);
