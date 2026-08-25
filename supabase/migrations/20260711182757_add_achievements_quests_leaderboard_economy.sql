-- Add tracking counters to heroes for quest/achievement progress
ALTER TABLE heroes
  ADD COLUMN IF NOT EXISTS commands_sent integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_enemies_killed integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_dungeons_completed integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_gold_earned integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_items_crafted integer NOT NULL DEFAULT 0;

-- Achievements (unlocked milestones per hero)
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_id uuid NOT NULL REFERENCES heroes(id) ON DELETE CASCADE,
  key text NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(hero_id, key)
);
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_achievements" ON achievements;
CREATE POLICY "anon_select_achievements" ON achievements FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_achievements" ON achievements;
CREATE POLICY "anon_insert_achievements" ON achievements FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_achievements" ON achievements;
CREATE POLICY "anon_update_achievements" ON achievements FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_achievements" ON achievements;
CREATE POLICY "anon_delete_achievements" ON achievements FOR DELETE TO anon, authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_achievements_hero ON achievements(hero_id);

-- Quests (daily / weekly / story tasks)
CREATE TABLE IF NOT EXISTS quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_id uuid NOT NULL REFERENCES heroes(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  quest_type text NOT NULL DEFAULT 'daily' CHECK (quest_type IN ('daily','weekly','story')),
  objectives jsonb NOT NULL DEFAULT '[]'::jsonb,
  reward jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','expired','claimed')),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_quests" ON quests;
CREATE POLICY "anon_select_quests" ON quests FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_quests" ON quests;
CREATE POLICY "anon_insert_quests" ON quests FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_quests" ON quests;
CREATE POLICY "anon_update_quests" ON quests FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_quests" ON quests;
CREATE POLICY "anon_delete_quests" ON quests FOR DELETE TO anon, authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_quests_hero ON quests(hero_id);

-- Leaderboard (real hero + AI seed entries)
CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_id uuid REFERENCES heroes(id) ON DELETE CASCADE,
  hero_name text NOT NULL,
  stage text NOT NULL DEFAULT 'Qi Condensation I',
  total_ticks integer NOT NULL DEFAULT 0,
  commands_sent integer NOT NULL DEFAULT 0,
  laziness_score integer NOT NULL DEFAULT 0,
  is_ai boolean NOT NULL DEFAULT false,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_leaderboard" ON leaderboard;
CREATE POLICY "anon_select_leaderboard" ON leaderboard FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_leaderboard" ON leaderboard;
CREATE POLICY "anon_insert_leaderboard" ON leaderboard FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_leaderboard" ON leaderboard;
CREATE POLICY "anon_update_leaderboard" ON leaderboard FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_leaderboard" ON leaderboard;
CREATE POLICY "anon_delete_leaderboard" ON leaderboard FOR DELETE TO anon, authenticated USING (true);

-- Seed AI leaderboard entries
INSERT INTO leaderboard (hero_name, stage, total_ticks, commands_sent, laziness_score, is_ai)
VALUES
  ('Sleeping Dragon Wuming',   'Nascent Soul I',             12400, 2,  6200, true),
  ('Cloud Hermit Bai',         'Core Formation II',           8830, 3,  2943, true),
  ('Iron Napper Chen',         'Foundation Establishment II', 6120, 4,  1530, true),
  ('Jade Sloth Yao',           'Core Formation I',            5440, 5,  1088, true),
  ('Tea Sage Liu',             'Foundation Establishment II', 4800, 6,   800, true),
  ('Silent Mountain Xu',       'Foundation Establishment I',  3960, 7,   565, true),
  ('Wandering Zhu',            'Qi Condensation III',         3100, 10,  310, true),
  ('Lazy Sword Li',            'Qi Condensation II',          2400, 12,  200, true),
  ('Napping Scholar Fan',      'Qi Condensation II',          1800, 14,  128, true)
ON CONFLICT DO NOTHING;

-- World Economy (single shared row, updated by game events)
CREATE TABLE IF NOT EXISTS world_economy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_activity text NOT NULL DEFAULT 'normal'
    CHECK (market_activity IN ('crashing','low','normal','high','boom')),
  dominant_element text NOT NULL DEFAULT 'Earth',
  price_mult real NOT NULL DEFAULT 1.0,
  total_sect_investment integer NOT NULL DEFAULT 0,
  trend text NOT NULL DEFAULT 'stable'
    CHECK (trend IN ('rising','stable','falling')),
  last_updated timestamptz DEFAULT now()
);
ALTER TABLE world_economy ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_economy" ON world_economy;
CREATE POLICY "anon_select_economy" ON world_economy FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_economy" ON world_economy;
CREATE POLICY "anon_insert_economy" ON world_economy FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_economy" ON world_economy;
CREATE POLICY "anon_update_economy" ON world_economy FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO world_economy (market_activity, dominant_element, price_mult, total_sect_investment, trend)
VALUES ('normal', 'Earth', 1.0, 0, 'stable')
ON CONFLICT DO NOTHING;
