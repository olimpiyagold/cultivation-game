/*
# Expand Lazy Dao schema — full ZRPG system

## Summary
Adds all advanced game systems: cultivation paths, Yin/Yang, fate, pets,
dungeons, Spirit Ark, Pavilion, Boss Lab, items, NPC memory.

## New columns on heroes
- yin_yang (integer -100..100): balance meter
- fate_path (text): hidden destiny
- psyche (jsonb): greed/compassion/cowardice/curiosity/pride
- cultivation_paths (jsonb): XP per path (sword/alchemy/trade/spirit/scholar)
- total_ticks (integer): for offline progress
- max_hp (integer)

## New tables
- pets: spirit beast companion
- dungeon_runs: active/past dungeon expeditions
- ark: Spirit Vessel with 5 upgradeable rooms
- pavilion: auto-income shop/stall
- boss_lab: captured essences + crafted minions
- items: inventory items with rarity and stats
- npc_memories: persistent NPC relationship tracking

## Security
- All tables: RLS enabled, anon + authenticated CRUD (single-tenant)
*/

-- Extend heroes table
ALTER TABLE heroes
  ADD COLUMN IF NOT EXISTS yin_yang integer NOT NULL DEFAULT 0 CHECK (yin_yang >= -100 AND yin_yang <= 100),
  ADD COLUMN IF NOT EXISTS fate_path text NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS psyche jsonb NOT NULL DEFAULT '{"greed":20,"compassion":50,"cowardice":30,"curiosity":60,"pride":40}'::jsonb,
  ADD COLUMN IF NOT EXISTS cultivation_paths jsonb NOT NULL DEFAULT '{"sword":{"level":1,"xp":0,"xp_to_next":100},"alchemy":{"level":1,"xp":0,"xp_to_next":100},"trade":{"level":1,"xp":0,"xp_to_next":100},"spirit":{"level":1,"xp":0,"xp_to_next":100},"scholar":{"level":1,"xp":0,"xp_to_next":100}}'::jsonb,
  ADD COLUMN IF NOT EXISTS total_ticks integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_hp integer NOT NULL DEFAULT 100;

-- Pets / Spirit Beasts
CREATE TABLE IF NOT EXISTS pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_id uuid NOT NULL REFERENCES heroes(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Little Cloud',
  type text NOT NULL DEFAULT 'fox',
  level integer NOT NULL DEFAULT 1 CHECK (level >= 1),
  xp integer NOT NULL DEFAULT 0,
  xp_to_next integer NOT NULL DEFAULT 50,
  mood text NOT NULL DEFAULT 'happy' CHECK (mood IN ('happy','neutral','sad','angry','hungry','excited')),
  personality text NOT NULL DEFAULT 'curious',
  evolution_stage integer NOT NULL DEFAULT 0 CHECK (evolution_stage >= 0 AND evolution_stage <= 3),
  abilities jsonb NOT NULL DEFAULT '[]'::jsonb,
  hunger integer NOT NULL DEFAULT 80 CHECK (hunger >= 0 AND hunger <= 100),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_pets" ON pets;
CREATE POLICY "anon_select_pets" ON pets FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_pets" ON pets;
CREATE POLICY "anon_insert_pets" ON pets FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_pets" ON pets;
CREATE POLICY "anon_update_pets" ON pets FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_pets" ON pets;
CREATE POLICY "anon_delete_pets" ON pets FOR DELETE TO anon, authenticated USING (true);

-- Dungeon Runs
CREATE TABLE IF NOT EXISTS dungeon_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_id uuid NOT NULL REFERENCES heroes(id) ON DELETE CASCADE,
  dungeon_name text NOT NULL,
  dungeon_type text NOT NULL DEFAULT 'cave',
  current_floor integer NOT NULL DEFAULT 1,
  max_floor integer NOT NULL DEFAULT 10,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','failed','abandoned')),
  enemies_defeated integer NOT NULL DEFAULT 0,
  loot_summary jsonb NOT NULL DEFAULT '[]'::jsonb,
  entered_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE dungeon_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_dungeon_runs" ON dungeon_runs;
CREATE POLICY "anon_select_dungeon_runs" ON dungeon_runs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_dungeon_runs" ON dungeon_runs;
CREATE POLICY "anon_insert_dungeon_runs" ON dungeon_runs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_dungeon_runs" ON dungeon_runs;
CREATE POLICY "anon_update_dungeon_runs" ON dungeon_runs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_dungeon_runs" ON dungeon_runs;
CREATE POLICY "anon_delete_dungeon_runs" ON dungeon_runs FOR DELETE TO anon, authenticated USING (true);

-- Spirit Ark (灵舟)
CREATE TABLE IF NOT EXISTS ark (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_id uuid NOT NULL UNIQUE REFERENCES heroes(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Drifting Cloud',
  cabin_level integer NOT NULL DEFAULT 0,
  engine_level integer NOT NULL DEFAULT 0,
  armory_level integer NOT NULL DEFAULT 0,
  garden_level integer NOT NULL DEFAULT 0,
  workshop_level integer NOT NULL DEFAULT 0,
  materials jsonb NOT NULL DEFAULT '{"celestial_wood":0,"spirit_iron":0,"cloud_silk":0,"dragon_scale":0}'::jsonb,
  total_voyages integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ark ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_ark" ON ark;
CREATE POLICY "anon_select_ark" ON ark FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_ark" ON ark;
CREATE POLICY "anon_insert_ark" ON ark FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_ark" ON ark;
CREATE POLICY "anon_update_ark" ON ark FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_ark" ON ark;
CREATE POLICY "anon_delete_ark" ON ark FOR DELETE TO anon, authenticated USING (true);

-- Pavilion / Spirit Market (灵市)
CREATE TABLE IF NOT EXISTS pavilion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_id uuid NOT NULL UNIQUE REFERENCES heroes(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Lazy Immortal Pavilion',
  shop_type text NOT NULL DEFAULT 'pill' CHECK (shop_type IN ('pill','equipment','talisman')),
  level integer NOT NULL DEFAULT 1,
  staff_count integer NOT NULL DEFAULT 0,
  income_per_tick integer NOT NULL DEFAULT 2,
  total_earned integer NOT NULL DEFAULT 0,
  last_collected_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pavilion ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_pavilion" ON pavilion;
CREATE POLICY "anon_select_pavilion" ON pavilion FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_pavilion" ON pavilion;
CREATE POLICY "anon_insert_pavilion" ON pavilion FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_pavilion" ON pavilion;
CREATE POLICY "anon_update_pavilion" ON pavilion FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_pavilion" ON pavilion;
CREATE POLICY "anon_delete_pavilion" ON pavilion FOR DELETE TO anon, authenticated USING (true);

-- Boss Lab / Demon Refinement Altar (炼魔台)
CREATE TABLE IF NOT EXISTS boss_lab (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_id uuid NOT NULL UNIQUE REFERENCES heroes(id) ON DELETE CASCADE,
  essences jsonb NOT NULL DEFAULT '[]'::jsonb,
  active_minion jsonb,
  total_crafted integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE boss_lab ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_boss_lab" ON boss_lab;
CREATE POLICY "anon_select_boss_lab" ON boss_lab FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_boss_lab" ON boss_lab;
CREATE POLICY "anon_insert_boss_lab" ON boss_lab FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_boss_lab" ON boss_lab;
CREATE POLICY "anon_update_boss_lab" ON boss_lab FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_boss_lab" ON boss_lab;
CREATE POLICY "anon_delete_boss_lab" ON boss_lab FOR DELETE TO anon, authenticated USING (true);

-- Items
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_id uuid NOT NULL REFERENCES heroes(id) ON DELETE CASCADE,
  name text NOT NULL,
  name_zh text,
  item_type text NOT NULL CHECK (item_type IN ('weapon','armor','helmet','boots','accessory','pill','material','scroll','essence')),
  rarity text NOT NULL DEFAULT 'common' CHECK (rarity IN ('common','uncommon','rare','epic','legendary')),
  stats jsonb NOT NULL DEFAULT '{}'::jsonb,
  ai_description text,
  source text,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  equipped_slot text CHECK (equipped_slot IN ('weapon','offhand','helmet','armor','boots','accessory1','accessory2')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_items" ON items;
CREATE POLICY "anon_select_items" ON items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_items" ON items;
CREATE POLICY "anon_insert_items" ON items FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_items" ON items;
CREATE POLICY "anon_update_items" ON items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_items" ON items;
CREATE POLICY "anon_delete_items" ON items FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_items_hero_id ON items(hero_id);

-- NPC Memories
CREATE TABLE IF NOT EXISTS npc_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_id uuid NOT NULL REFERENCES heroes(id) ON DELETE CASCADE,
  npc_name text NOT NULL,
  npc_type text NOT NULL DEFAULT 'merchant',
  encounter_count integer NOT NULL DEFAULT 1,
  last_interaction timestamptz DEFAULT now(),
  relationship text NOT NULL DEFAULT 'neutral' CHECK (relationship IN ('hostile','wary','neutral','friendly','allied')),
  memory_notes text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(hero_id, npc_name)
);

ALTER TABLE npc_memories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_npc_memories" ON npc_memories;
CREATE POLICY "anon_select_npc_memories" ON npc_memories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_npc_memories" ON npc_memories;
CREATE POLICY "anon_insert_npc_memories" ON npc_memories FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_npc_memories" ON npc_memories;
CREATE POLICY "anon_update_npc_memories" ON npc_memories FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_npc_memories" ON npc_memories;
CREATE POLICY "anon_delete_npc_memories" ON npc_memories FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_npc_memories_hero_id ON npc_memories(hero_id);

-- Chain Events (pending follow-up events)
CREATE TABLE IF NOT EXISTS chain_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_id uuid NOT NULL REFERENCES heroes(id) ON DELETE CASCADE,
  trigger_log_text text NOT NULL,
  pending_log_text text NOT NULL,
  event_type text NOT NULL,
  scheduled_tick integer NOT NULL,
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chain_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_chain_events" ON chain_events;
CREATE POLICY "anon_select_chain_events" ON chain_events FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_chain_events" ON chain_events;
CREATE POLICY "anon_insert_chain_events" ON chain_events FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_chain_events" ON chain_events;
CREATE POLICY "anon_update_chain_events" ON chain_events FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_chain_events" ON chain_events;
CREATE POLICY "anon_delete_chain_events" ON chain_events FOR DELETE TO anon, authenticated USING (true);
