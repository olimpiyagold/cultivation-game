-- Add resonance_count to heroes for persistent tracking
ALTER TABLE heroes
  ADD COLUMN IF NOT EXISTS resonance_count integer NOT NULL DEFAULT 0;

-- Heavenly Tribunal cases
CREATE TABLE IF NOT EXISTS tribunal_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_id uuid REFERENCES heroes(id) ON DELETE CASCADE,
  hero_name text NOT NULL,
  case_type text NOT NULL CHECK (case_type IN ('redemption','accusation','defense','glory')),
  plea_text text NOT NULL,
  verdict text CHECK (verdict IN ('approved','denied','partial','pending')),
  judgment_text text,
  reward_gold integer NOT NULL DEFAULT 0,
  reward_xp integer NOT NULL DEFAULT 0,
  penalty_gold integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','judging','resolved')),
  submitted_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  is_ai_case boolean NOT NULL DEFAULT false
);
ALTER TABLE tribunal_cases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_tribunal" ON tribunal_cases;
CREATE POLICY "anon_select_tribunal" ON tribunal_cases FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_tribunal" ON tribunal_cases;
CREATE POLICY "anon_insert_tribunal" ON tribunal_cases FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_tribunal" ON tribunal_cases;
CREATE POLICY "anon_update_tribunal" ON tribunal_cases FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_tribunal" ON tribunal_cases;
CREATE POLICY "anon_delete_tribunal" ON tribunal_cases FOR DELETE TO anon, authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_tribunal_hero ON tribunal_cases(hero_id);

-- Seed AI tribunal cases for world history
INSERT INTO tribunal_cases (hero_name, case_type, plea_text, verdict, judgment_text, reward_gold, reward_xp, status, resolved_at, is_ai_case)
VALUES
  ('Iron Fist Chen', 'redemption',
   'I have slain 200 demonic beasts and yet my heart remains heavy. I seek the Court''s blessing to wash away the stain of violence.',
   'partial',
   'The Heavenly Court acknowledges your martial dedication. However, violence cannot be cleansed by more violence. A partial blessing is granted — may it guide you toward balance.',
   150, 80, 'resolved', now() - interval '2 hours', true),
  ('Sleeping Dragon Wuming', 'glory',
   'I, the Laziest Cultivator under Heaven, have achieved 12,000 ticks of cultivation with merely 2 interventions. Surely this warrants celestial recognition.',
   'approved',
   'The Heavenly Court is humbled. Such extreme non-action IS the Dao. The Court grants the title: True Lazy Immortal. Gold and blessings rain upon this worthy soul.',
   800, 300, 'resolved', now() - interval '1 hour', true),
  ('Jade Sloth Yao', 'accusation',
   'I accuse the World Economy of being rigged against cultivators who choose the Napping Path. This is a cosmic injustice that must be addressed.',
   'denied',
   'The Heavenly Court has reviewed your complaint. The World Economy is, indeed, biased toward the awake. This is intentional. Case dismissed. Stop whining.',
   0, 0, 'resolved', now() - interval '30 minutes', true),
  ('Tea Sage Liu', 'defense',
   'The sect elders accuse me of sleeping through a critical battle. I submit that my sleeping INSPIRED my allies to fight harder. I win through absence.',
   'approved',
   'Philosophically sound. The Court rules: absence as strategy is valid. All charges dropped. A precedent has been set in celestial law.',
   200, 120, 'resolved', now() - interval '15 minutes', true),
  ('Napping Scholar Fan', 'redemption',
   'I forgot to feed my spirit beast for three days. It survived on spite. I feel guilt.',
   'denied',
   'The Heavenly Court is disturbed. Three days. Your spirit beast is now angrier than you deserve. The Court denies redemption and orders mandatory pet care.',
   0, 0, 'resolved', now() - interval '5 minutes', true)
ON CONFLICT DO NOTHING;

-- Wagers / Divine Stakes (天机赌坊)
CREATE TABLE IF NOT EXISTS wagers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_id uuid NOT NULL REFERENCES heroes(id) ON DELETE CASCADE,
  target_hero_name text NOT NULL,
  target_score_at_bet integer NOT NULL,
  amount integer NOT NULL CHECK (amount > 0),
  prediction text NOT NULL CHECK (prediction IN ('rise','fall')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','resolved','expired')),
  outcome text CHECK (outcome IN ('win','loss')),
  payout integer,
  placed_at timestamptz DEFAULT now(),
  resolves_at timestamptz NOT NULL
);
ALTER TABLE wagers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_wagers" ON wagers;
CREATE POLICY "anon_select_wagers" ON wagers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_wagers" ON wagers;
CREATE POLICY "anon_insert_wagers" ON wagers FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_wagers" ON wagers;
CREATE POLICY "anon_update_wagers" ON wagers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_wagers" ON wagers;
CREATE POLICY "anon_delete_wagers" ON wagers FOR DELETE TO anon, authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_wagers_hero ON wagers(hero_id);

-- Sect Mentor (AI Elder companion)
CREATE TABLE IF NOT EXISTS sect_mentor (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_id uuid NOT NULL UNIQUE REFERENCES heroes(id) ON DELETE CASCADE,
  mentor_name text NOT NULL,
  mentor_type text NOT NULL CHECK (mentor_type IN ('strict','wise','chaotic','compassionate','merchant')),
  relationship integer NOT NULL DEFAULT 50 CHECK (relationship >= 0 AND relationship <= 100),
  total_conversations integer NOT NULL DEFAULT 0,
  last_wisdom text,
  last_wisdom_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE sect_mentor ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_mentor" ON sect_mentor;
CREATE POLICY "anon_select_mentor" ON sect_mentor FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_mentor" ON sect_mentor;
CREATE POLICY "anon_insert_mentor" ON sect_mentor FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_mentor" ON sect_mentor;
CREATE POLICY "anon_update_mentor" ON sect_mentor FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_mentor" ON sect_mentor;
CREATE POLICY "anon_delete_mentor" ON sect_mentor FOR DELETE TO anon, authenticated USING (true);
