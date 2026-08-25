export type FatePath = 'sword' | 'alchemy' | 'merchant' | 'hermit' | 'demon' | 'unknown';
export type TribunalCaseType = 'redemption' | 'accusation' | 'defense' | 'glory';
export type TribunalVerdict = 'approved' | 'denied' | 'partial' | 'pending';
export type TribunalStatus = 'pending' | 'judging' | 'resolved';
export type WagerPrediction = 'rise' | 'fall';
export type WagerStatus = 'active' | 'resolved' | 'expired';
export type MentorType = 'strict' | 'wise' | 'chaotic' | 'compassionate' | 'merchant';
export type AchievementCategory = 'combat' | 'exploration' | 'cultivation' | 'social' | 'legacy';

export interface TribunalCase {
  id: string;
  hero_id?: string;
  hero_name: string;
  case_type: TribunalCaseType;
  plea_text: string;
  verdict?: TribunalVerdict;
  judgment_text?: string;
  reward_gold: number;
  reward_xp: number;
  penalty_gold: number;
  status: TribunalStatus;
  submitted_at: string;
  resolved_at?: string;
  is_ai_case: boolean;
}

export interface Wager {
  id: string;
  hero_id: string;
  target_hero_name: string;
  target_score_at_bet: number;
  amount: number;
  prediction: WagerPrediction;
  status: WagerStatus;
  outcome?: 'win' | 'loss';
  payout?: number;
  placed_at: string;
  resolves_at: string;
}

export interface SectMentor {
  id: string;
  hero_id: string;
  mentor_name: string;
  mentor_type: MentorType;
  relationship: number;
  total_conversations: number;
  last_wisdom?: string;
  last_wisdom_at?: string;
  created_at: string;
}
export type QuestType = 'daily' | 'weekly' | 'story';
export type QuestStatus = 'active' | 'completed' | 'expired' | 'claimed';
export type QuestObjType = 'kill_enemies' | 'collect_gold' | 'enter_dungeon' | 'complete_dungeon' | 'feed_pet' | 'collect_income' | 'reach_path_level' | 'craft_item' | 'meet_npcs' | 'collect_essences' | 'total_ticks' | 'send_resonance';
export type MarketActivity = 'crashing' | 'low' | 'normal' | 'high' | 'boom';
export type EconomyTrend = 'rising' | 'stable' | 'falling';
export type ResonanceType = 'aggressive' | 'peaceful' | 'greedy' | 'curious' | 'cowardly' | 'alchemist' | 'none';
export type CultivationPathKey = 'sword' | 'alchemy' | 'trade' | 'spirit' | 'scholar';
export type ItemType = 'weapon' | 'armor' | 'helmet' | 'boots' | 'accessory' | 'pill' | 'material' | 'scroll' | 'essence';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type EquipSlot = 'weapon' | 'offhand' | 'helmet' | 'armor' | 'boots' | 'accessory1' | 'accessory2';
export type DungeonType = 'cave' | 'ruins' | 'cloudtop' | 'abyss' | 'celestial';
export type DungeonStatus = 'active' | 'completed' | 'failed' | 'abandoned';
export type PetType = 'fox' | 'crane' | 'tiger' | 'turtle' | 'dragon_carp' | 'rabbit';
export type PetMood = 'happy' | 'neutral' | 'sad' | 'angry' | 'hungry' | 'excited';
export type Relationship = 'hostile' | 'wary' | 'neutral' | 'friendly' | 'allied';
export type LogType = 'combat' | 'loot' | 'rest' | 'dungeon' | 'pet' | 'sect' | 'system' | 'chain';

export interface PathLevel {
  level: number;
  xp: number;
  xp_to_next: number;
}

export interface HeroPsyche {
  greed: number;
  compassion: number;
  cowardice: number;
  curiosity: number;
  pride: number;
}

export interface HeroStats {
  strength: number;
  agility: number;
  spirit: number;
  luck: number;
}

export interface Hero {
  id: string;
  name: string;
  stage: string;
  hp: number;
  max_hp: number;
  gold: number;
  yin_yang: number;
  fate_path: FatePath;
  psyche: HeroPsyche;
  cultivation_paths: Record<CultivationPathKey, PathLevel>;
  stats: HeroStats;
  total_ticks: number;
  commands_sent: number;
  total_enemies_killed: number;
  total_dungeons_completed: number;
  total_gold_earned: number;
  total_items_crafted: number;
  resonance_count: number;
  ai_gens_today?: number;
  ai_last_gen_date?: string;
  created_at: string;
}

export interface DiaryLog {
  id: string;
  hero_id: string;
  timestamp: string;
  log_text: string;
  type: LogType;
}

export interface Pet {
  id: string;
  hero_id: string;
  name: string;
  type: PetType;
  level: number;
  xp: number;
  xp_to_next: number;
  mood: PetMood;
  personality: string;
  evolution_stage: 0 | 1 | 2 | 3;
  abilities: string[];
  hunger: number;
}

export interface DungeonRun {
  id: string;
  hero_id: string;
  dungeon_name: string;
  dungeon_type: DungeonType;
  current_floor: number;
  max_floor: number;
  status: DungeonStatus;
  enemies_defeated: number;
  loot_summary: { name: string; rarity: ItemRarity }[];
  entered_at: string;
  completed_at?: string;
}

export interface ArkMaterials {
  celestial_wood: number;
  spirit_iron: number;
  cloud_silk: number;
  dragon_scale: number;
}

export interface Ark {
  id: string;
  hero_id: string;
  name: string;
  cabin_level: number;
  engine_level: number;
  armory_level: number;
  garden_level: number;
  workshop_level: number;
  materials: ArkMaterials;
  total_voyages: number;
}

export interface Pavilion {
  id: string;
  hero_id: string;
  name: string;
  shop_type: 'pill' | 'equipment' | 'talisman';
  level: number;
  staff_count: number;
  income_per_tick: number;
  total_earned: number;
  last_collected_at: string;
}

export interface BossEssence {
  name: string;
  element: string;
  potency: number;
  obtained_at: string;
}

export interface CraftedMinion {
  name: string;
  description: string;
  power: number;
  element: string;
  created_at: string;
}

export interface BossLab {
  id: string;
  hero_id: string;
  essences: BossEssence[];
  active_minion?: CraftedMinion;
  total_crafted: number;
}

export interface ItemStats {
  hp?: number;
  defense?: number;
  attack?: number;
  spirit?: number;
  luck?: number;
  alchemy?: number;
}

export interface Item {
  id: string;
  hero_id: string;
  name: string;
  name_zh?: string;
  item_type: ItemType;
  rarity: ItemRarity;
  stats: ItemStats;
  ai_description?: string;
  source?: string;
  quantity: number;
  equipped_slot?: EquipSlot;
}

export interface NPCMemory {
  id: string;
  hero_id: string;
  npc_name: string;
  npc_type: string;
  encounter_count: number;
  last_interaction: string;
  relationship: Relationship;
  memory_notes: string;
}

export interface ChainEvent {
  id: string;
  hero_id: string;
  trigger_log_text: string;
  pending_log_text: string;
  event_type: LogType;
  scheduled_tick: number;
  resolved: boolean;
}

export type ArkRoom = 'cabin' | 'engine' | 'armory' | 'garden' | 'workshop';

export const ARK_ROOM_COSTS: Record<ArkRoom, Record<number, Partial<ArkMaterials>>> = {
  cabin:    { 1: { celestial_wood: 5 }, 2: { celestial_wood: 15 }, 3: { celestial_wood: 40 } },
  engine:   { 1: { spirit_iron: 5 },   2: { spirit_iron: 15 },    3: { spirit_iron: 40 } },
  armory:   { 1: { spirit_iron: 3, celestial_wood: 3 }, 2: { spirit_iron: 10, dragon_scale: 2 }, 3: { spirit_iron: 25, dragon_scale: 8 } },
  garden:   { 1: { cloud_silk: 5 },    2: { cloud_silk: 15 },     3: { cloud_silk: 40 } },
  workshop: { 1: { celestial_wood: 3, cloud_silk: 3 }, 2: { celestial_wood: 10, spirit_iron: 5 }, 3: { dragon_scale: 5, cloud_silk: 20 } },
};

export const RARITY_COLORS: Record<ItemRarity, string> = {
  common:    'text-foreground',
  uncommon:  'text-green-500 dark:text-green-400',
  rare:      'text-blue-500 dark:text-blue-400',
  epic:      'text-purple-500 dark:text-purple-400',
  legendary: 'text-amber-500 dark:text-amber-400',
};

export const RARITY_BORDER: Record<ItemRarity, string> = {
  common:    'border-border',
  uncommon:  'border-green-500/40',
  rare:      'border-blue-500/40',
  epic:      'border-purple-500/40',
  legendary: 'border-amber-500/40',
};

export const STAGES = [
  'Qi Condensation I', 'Qi Condensation II', 'Qi Condensation III',
  'Foundation Establishment I', 'Foundation Establishment II',
  'Core Formation I', 'Core Formation II',
  'Nascent Soul I', 'Nascent Soul II',
  'Spirit Severing I', 'Void Refinement I', 'Body Integration',
  'Mahayana Stage', 'Tribulation Transcendence', 'True Immortal',
];

export interface Achievement {
  id: string;
  hero_id: string;
  key: string;
  unlocked_at: string;
}

export interface FateBookObjective {
  type: QuestObjType;
  amount: number;
  label: string;
  progress: number;
  baseline: number;
}

export interface FateBook {
  id: string;
  hero_id: string;
  week_key: string;
  title: string;
  narrative: string;
  objectives: FateBookObjective[];
  reward_text: string;
  reward_gold: number;
  status: 'active' | 'completed' | 'claimed';
  created_at: string;
}


export interface QuestObjective {
  type: QuestObjType;
  amount: number;
  baseline: number;
  progress: number;
}

export interface QuestReward {
  gold?: number;
  path_xp?: Partial<Record<CultivationPathKey, number>>;
  item_name?: string;
}

export interface Quest {
  id: string;
  hero_id: string;
  title: string;
  description: string;
  quest_type: QuestType;
  objectives: QuestObjective[];
  reward: QuestReward;
  status: QuestStatus;
  expires_at?: string;
  created_at: string;
}

export interface LeaderboardEntry {
  id: string;
  hero_id?: string;
  hero_name: string;
  stage: string;
  total_ticks: number;
  commands_sent: number;
  laziness_score: number;
  is_ai: boolean;
}

export interface WorldEconomy {
  id: string;
  market_activity: MarketActivity;
  dominant_element: string;
  price_mult: number;
  total_sect_investment: number;
  trend: EconomyTrend;
  last_updated: string;
}

export interface ResonanceResult {
  type: ResonanceType;
  psycheDelta: Partial<HeroPsyche>;
  yinYangDelta: number;
  pathBoost?: CultivationPathKey;
  fatePush?: FatePath;
  feedback: string;
}
