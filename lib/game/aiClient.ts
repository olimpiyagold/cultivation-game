import type { Hero, NPCMemory, DiaryLog, Pet } from './types';
import type { Locale } from '@/lib/i18n/translations';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const EDGE_URL = `${SUPABASE_URL}/functions/v1/ai-generate`;

const USER_KEY_STORAGE = 'lazy_dao_user_api_key';

export function getUserApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(USER_KEY_STORAGE) ?? '';
}

export function setUserApiKey(key: string) {
  if (typeof window === 'undefined') return;
  if (key.trim()) {
    localStorage.setItem(USER_KEY_STORAGE, key.trim());
  } else {
    localStorage.removeItem(USER_KEY_STORAGE);
  }
}

export interface AIResponse {
  result: unknown;
  aiPowered: boolean;
  usingUserKey: boolean;
  remaining: number | null;
  dailyLimit: number;
}

interface CallOptions {
  type: 'oracle' | 'npc_dialogue' | 'fate_book' | 'diary_event';
  locale: Locale;
  context: Record<string, unknown>;
  heroId?: string;
  userApiKey?: string;
}

async function callAI(opts: CallOptions): Promise<AIResponse> {
  const resp = await fetch(EDGE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(opts),
  });
  if (!resp.ok) throw new Error(`ai-generate ${resp.status}`);
  return resp.json();
}

export async function getOracleResponse(
  hero: Hero,
  pet: Pet | null,
  recentLogs: DiaryLog[],
  npcMemories: NPCMemory[],
  userMessage: string,
  locale: Locale,
): Promise<{ text: string; aiPowered: boolean; remaining: number | null; usingUserKey: boolean }> {
  const context = {
    heroName: hero.name,
    heroStage: hero.stage,
    heroGold: hero.gold,
    yinYang: hero.yin_yang,
    fatePath: hero.fate_path,
    pathLevels: Object.fromEntries(
      Object.entries(hero.cultivation_paths).map(([k, v]) => [k, v.level])
    ),
    totalEnemiesKilled: hero.total_enemies_killed,
    recentEvents: recentLogs.slice(-5).map(l => l.log_text),
    npcMemories: npcMemories.slice(0, 5),
    petName: pet?.name ?? null,
    petType: pet?.type ?? null,
    userMessage,
  };
  const userApiKey = getUserApiKey();
  const res = await callAI({ type: 'oracle', locale, context, heroId: hero.id, userApiKey: userApiKey || undefined });
  return { text: String(res.result), aiPowered: res.aiPowered, remaining: res.remaining, usingUserKey: res.usingUserKey };
}

export async function getNPCDialogue(
  hero: Hero,
  npc: NPCMemory,
  locale: Locale,
): Promise<{ text: string; aiPowered: boolean }> {
  const context = {
    heroName: hero.name,
    heroStage: hero.stage,
    fatePath: hero.fate_path,
    npcName: npc.npc_name,
    npcType: npc.npc_type,
    encounterCount: npc.encounter_count,
    relationship: npc.relationship,
    memoryNotes: npc.memory_notes,
  };
  const userApiKey = getUserApiKey();
  const res = await callAI({ type: 'npc_dialogue', locale, context, heroId: hero.id, userApiKey: userApiKey || undefined });
  return { text: String(res.result), aiPowered: res.aiPowered };
}

export interface FateBookData {
  title: string;
  narrative: string;
  objectives: Array<{ type: string; amount: number; label: string; progress: number; baseline: number }>;
  rewardText: string;
  rewardGold: number;
}

export async function generateFateBookData(
  hero: Hero,
  locale: Locale,
): Promise<{ data: FateBookData; aiPowered: boolean }> {
  const context = {
    heroName: hero.name,
    heroStage: hero.stage,
    fatePath: hero.fate_path,
    pathLevels: Object.fromEntries(
      Object.entries(hero.cultivation_paths).map(([k, v]) => [k, v.level])
    ),
    totalEnemiesKilled: hero.total_enemies_killed ?? 0,
    totalDungeons: hero.total_dungeons_completed ?? 0,
    psyche: hero.psyche,
  };
  const userApiKey = getUserApiKey();
  const res = await callAI({ type: 'fate_book', locale, context, heroId: hero.id, userApiKey: userApiKey || undefined });
  const data = res.result as FateBookData;
  data.objectives = (data.objectives ?? []).map(o => ({ ...o, progress: 0, baseline: 0 }));
  return { data, aiPowered: res.aiPowered };
}

export async function getAIDiaryEvent(
  hero: Hero,
  eventType: string,
  zone: string,
  fallback: string,
  locale: Locale,
): Promise<string> {
  const context = { heroName: hero.name, heroStage: hero.stage, zone, eventType, fallback };
  const userApiKey = getUserApiKey();
  const res = await callAI({ type: 'diary_event', locale, context, heroId: hero.id, userApiKey: userApiKey || undefined });
  return String(res.result);
}
