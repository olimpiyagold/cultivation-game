'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { generateQuests } from '@/lib/game/quests';
import { getNewAchievements } from '@/lib/game/achievements';
import { analyzeResonance, applyResonanceToHero } from '@/lib/game/resonance';
import { generateVerdict } from '@/lib/game/tribunal';
import { createWager, resolveWager, driftAIScore, MAX_ACTIVE_WAGERS, MIN_WAGER, MAX_WAGER } from '@/lib/game/wagers';
import { assignMentorType, generateMentorWisdom } from '@/lib/game/mentor';
import { generateFateBookData, getNPCDialogue as aiGetNPCDialogue } from '@/lib/game/aiClient';
import type {
  Hero, Pet, DungeonRun, Ark, Pavilion, BossLab,
  Item, NPCMemory, DiaryLog, LogType, DungeonType,
  FatePath, CultivationPathKey, Achievement, Quest, LeaderboardEntry,
  WorldEconomy, ResonanceResult, TribunalCase, TribunalCaseType, Wager, SectMentor, MarketActivity,
  FateBook,
} from './types';

export type {
  Hero, Pet, DungeonRun, Ark, Pavilion, BossLab, Item,
  NPCMemory, DiaryLog, Achievement, Quest, LeaderboardEntry, WorldEconomy,
  TribunalCase, TribunalCaseType, Wager, SectMentor, FateBook,
};

interface GameState {
  hero: Hero | null;
  pet: Pet | null;
  ark: Ark | null;
  pavilion: Pavilion | null;
  bossLab: BossLab | null;
  activeDungeon: DungeonRun | null;
  inventory: Item[];
  npcMemories: NPCMemory[];
  logs: DiaryLog[];
  achievements: Achievement[];
  quests: Quest[];
  leaderboard: LeaderboardEntry[];
  economy: WorldEconomy | null;
  resonanceCount: number;
  feedCount: number;
  incomeCount: number;
  loading: boolean;
  realtimeConnected: boolean;
  tribunalCases: TribunalCase[];
  wagers: Wager[];
  mentor: SectMentor | null;
  fateBook: FateBook | null;
}

interface GameContextType extends GameState {
  addLog: (log: { log_text: string; type: LogType }) => Promise<void>;
  updateHero: (updates: Partial<Hero>) => Promise<void>;
  updatePet: (updates: Partial<Pet>) => Promise<void>;
  updateArk: (updates: Partial<Ark>) => Promise<void>;
  upgradeArkRoom: (room: 'cabin' | 'engine' | 'armory' | 'garden' | 'workshop') => Promise<void>;
  updatePavilion: (updates: Partial<Pavilion>) => Promise<void>;
  collectPavilionIncome: () => Promise<void>;
  updateBossLab: (updates: Partial<BossLab>) => Promise<void>;
  enterDungeon: (type: DungeonType) => Promise<void>;
  advanceDungeon: () => Promise<void>;
  exitDungeon: () => Promise<void>;
  addItem: (item: Omit<Item, 'id' | 'hero_id'>) => Promise<void>;
  equipItem: (itemId: string, slot: Item['equipped_slot']) => Promise<void>;
  unequipItem: (slot: NonNullable<Item['equipped_slot']>) => Promise<void>;
  upsertNPCMemory: (npcName: string, type: string, notes: string) => Promise<void>;
  incrementTicks: () => void;
  checkAndUnlockAchievements: () => Promise<void>;
  updateQuestProgress: (type: Quest['objectives'][number]['type'], amount?: number) => Promise<void>;
  claimQuestReward: (questId: string) => Promise<void>;
  triggerDaoResonance: (message: string, locale: 'en' | 'ru' | 'zh') => Promise<ResonanceResult | null>;
  investInEconomy: (gold: number) => Promise<void>;
  feedPet: () => Promise<void>;
  onInteraction: () => void;
  submitTribunalCase: (caseType: TribunalCaseType, pleaText: string, locale: 'en' | 'ru' | 'zh') => Promise<TribunalCase | null>;
  placeWager: (targetName: string, targetScore: number, amount: number, prediction: 'rise' | 'fall') => Promise<void>;
  resolveExpiredWagers: () => Promise<void>;
  requestMentorWisdom: (locale: 'en' | 'ru' | 'zh') => Promise<string>;
  notifyMentorResonance: (mentorType: import('./types').MentorType, locale: 'en' | 'ru' | 'zh') => Promise<void>;
  generateFateBook: (locale: 'en' | 'ru' | 'zh') => Promise<FateBook | null>;
  updateFateBookProgress: (type: string, amount?: number) => Promise<void>;
  claimFateBookReward: () => Promise<void>;
  getNPCDialogue: (npc: NPCMemory, locale: 'en' | 'ru' | 'zh') => Promise<string>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const DUNGEON_NAMES: Record<DungeonType, string> = {
  cave: 'Shadow Bone Cave', ruins: 'Ancient Celestial Ruins',
  cloudtop: 'Cloud Peak Labyrinth', abyss: 'Abyssal Demon Gate',
  celestial: 'Heavenly Vault',
};
const DUNGEON_FLOORS: Record<DungeonType, number> = {
  cave: 5, ruins: 7, cloudtop: 8, abyss: 10, celestial: 12,
};

function defaultCultivationPaths(): Hero['cultivation_paths'] {
  const base = { level: 1, xp: 0, xp_to_next: 100 };
  return { sword: { ...base }, alchemy: { ...base }, trade: { ...base }, spirit: { ...base }, scholar: { ...base } };
}

const FATE_PATHS: FatePath[] = ['sword', 'alchemy', 'merchant', 'hermit', 'demon'];

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>({
    hero: null, pet: null, ark: null, pavilion: null,
    bossLab: null, activeDungeon: null, inventory: [],
    npcMemories: [], logs: [], achievements: [], quests: [],
    leaderboard: [], economy: null,
    resonanceCount: 0, feedCount: 0, incomeCount: 0,
    loading: true, realtimeConnected: false,
    tribunalCases: [], wagers: [], mentor: null, fateBook: null,
  });
  const heroIdRef = useRef<string | null>(null);

  useEffect(() => { loadAll(); }, []);

  // Supabase Realtime subscriptions
  useEffect(() => {
    const heroId = heroIdRef.current;
    if (!heroId) return;

    const heroChannel = supabase
      .channel(`hero_rt_${heroId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'heroes', filter: `id=eq.${heroId}` },
        (payload) => {
          setState(prev => prev.hero ? { ...prev, hero: { ...prev.hero!, ...(payload.new as Partial<Hero>) } } : prev);
        })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'quests', filter: `hero_id=eq.${heroId}` },
        (payload) => {
          setState(prev => ({ ...prev, quests: [...prev.quests, payload.new as Quest] }));
        })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'achievements', filter: `hero_id=eq.${heroId}` },
        () => { /* achievements loaded separately */ })
      .subscribe((status) => {
        setState(prev => ({ ...prev, realtimeConnected: status === 'SUBSCRIBED' }));
      });

    const economyChannel = supabase
      .channel('economy_rt')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'world_economy' },
        (payload) => {
          setState(prev => ({ ...prev, economy: payload.new as WorldEconomy }));
        })
      .subscribe();

    return () => {
      supabase.removeChannel(heroChannel);
      supabase.removeChannel(economyChannel);
    };
  }, [heroIdRef.current]);

  async function loadAll() {
    let { data: heroData } = await supabase.from('heroes').select('*').limit(1).maybeSingle();
    if (!heroData) {
      const fate = FATE_PATHS[Math.floor(Math.random() * FATE_PATHS.length)];
      const { data: newHero } = await supabase.from('heroes').insert({
        name: 'Lazy Cultivator',
        stage: 'Qi Condensation I',
        hp: 100, max_hp: 100, gold: 50,
        yin_yang: 0, fate_path: fate,
        stats: { strength: 5, agility: 3, spirit: 7, luck: 4 },
        cultivation_paths: defaultCultivationPaths(),
        psyche: { greed: 20, compassion: 50, cowardice: 30, curiosity: 60, pride: 40 },
        commands_sent: 0, total_enemies_killed: 0, total_dungeons_completed: 0,
        total_gold_earned: 0, total_items_crafted: 0,
      }).select().single();
      heroData = newHero;
    }

    const heroId = heroData!.id;
    heroIdRef.current = heroId;

    const [
      { data: petData }, { data: arkData }, { data: pavilionData },
      { data: bossLabData }, { data: dungeonData }, { data: itemsData },
      { data: npcData }, { data: logsData }, { data: achievementsData },
      { data: questsData }, { data: leaderboardData }, { data: economyData },
      { data: tribunalData }, { data: wagersData }, { data: mentorData },
      { data: fateBookData },
    ] = await Promise.all([
      supabase.from('pets').select('*').eq('hero_id', heroId).limit(1).maybeSingle(),
      supabase.from('ark').select('*').eq('hero_id', heroId).maybeSingle(),
      supabase.from('pavilion').select('*').eq('hero_id', heroId).maybeSingle(),
      supabase.from('boss_lab').select('*').eq('hero_id', heroId).maybeSingle(),
      supabase.from('dungeon_runs').select('*').eq('hero_id', heroId).eq('status', 'active').limit(1).maybeSingle(),
      supabase.from('items').select('*').eq('hero_id', heroId).order('created_at', { ascending: false }),
      supabase.from('npc_memories').select('*').eq('hero_id', heroId),
      supabase.from('diary_logs').select('*').eq('hero_id', heroId).order('created_at', { ascending: true }).limit(60),
      supabase.from('achievements').select('*').eq('hero_id', heroId),
      supabase.from('quests').select('*').eq('hero_id', heroId).in('status', ['active', 'completed']),
      supabase.from('leaderboard').select('*').order('laziness_score', { ascending: false }).limit(20),
      supabase.from('world_economy').select('*').limit(1).maybeSingle(),
      supabase.from('tribunal_cases').select('*').order('submitted_at', { ascending: false }).limit(30),
      supabase.from('wagers').select('*').eq('hero_id', heroId).in('status', ['active', 'resolved']).order('placed_at', { ascending: false }).limit(20),
      supabase.from('sect_mentor').select('*').eq('hero_id', heroId).maybeSingle(),
      supabase.from('fate_book').select('*').eq('hero_id', heroId).in('status', ['active', 'completed']).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ]);

    let pet = petData as Pet | null;
    let ark = arkData as Ark | null;
    let pavilion = pavilionData as Pavilion | null;
    let bossLab = bossLabData as BossLab | null;

    if (!pet) {
      const types = ['fox', 'crane', 'tiger', 'turtle', 'rabbit'];
      const t = types[Math.floor(Math.random() * types.length)];
      const names: Record<string, string> = { fox: 'Little Yao', crane: 'White Wing', tiger: 'Fierce Cub', turtle: 'Old Stone', rabbit: 'Jade Ear' };
      const { data } = await supabase.from('pets').insert({ hero_id: heroId, type: t, name: names[t] || 'Spirit Friend', level: 1, xp: 0, xp_to_next: 50, mood: 'happy', personality: 'curious', evolution_stage: 0, abilities: [], hunger: 80 }).select().single();
      pet = data as Pet;
    }
    if (!ark) {
      const { data } = await supabase.from('ark').insert({ hero_id: heroId, name: 'Drifting Cloud Vessel', cabin_level: 0, engine_level: 0, armory_level: 0, garden_level: 0, workshop_level: 0, materials: { celestial_wood: 3, spirit_iron: 2, cloud_silk: 1, dragon_scale: 0 }, total_voyages: 0 }).select().single();
      ark = data as Ark;
    }
    if (!pavilion) {
      const { data } = await supabase.from('pavilion').insert({ hero_id: heroId, name: 'Lazy Immortal Pavilion', shop_type: 'pill', level: 1, staff_count: 0, income_per_tick: 2, total_earned: 0, last_collected_at: new Date().toISOString() }).select().single();
      pavilion = data as Pavilion;
    }
    if (!bossLab) {
      const { data } = await supabase.from('boss_lab').insert({ hero_id: heroId, essences: [], active_minion: null, total_crafted: 0 }).select().single();
      bossLab = data as BossLab;
    }

    let mentor = mentorData as SectMentor | null;
    if (!mentor) {
      const mType = assignMentorType((heroData as Hero).fate_path);
      const { MENTOR_DEFS } = await import('@/lib/game/mentor');
      const def = MENTOR_DEFS[mType];
      const { data } = await supabase.from('sect_mentor').insert({
        hero_id: heroId,
        mentor_name: def.name.en,
        mentor_type: mType,
        relationship: 0,
        total_conversations: 0,
      }).select().single();
      mentor = data as SectMentor;
    }

    let inventory = (itemsData || []) as Item[];
    if (inventory.length === 0) {
      const { data: seeded } = await supabase.from('items').insert([
        { hero_id: heroId, name: 'Bamboo Sword', name_zh: '竹剑', item_type: 'weapon', rarity: 'common', stats: { attack: 3 }, source: 'Starting Equipment', quantity: 1 },
        { hero_id: heroId, name: 'Cloth Robe', name_zh: '布袍', item_type: 'armor', rarity: 'common', stats: { defense: 2 }, source: 'Starting Equipment', quantity: 1 },
        { hero_id: heroId, name: 'Healing Pill', name_zh: '疗伤丹', item_type: 'pill', rarity: 'common', stats: { hp: 20 }, source: 'Starting Supplies', quantity: 5 },
        { hero_id: heroId, name: 'Spirit Stone Fragment', name_zh: '灵石碎片', item_type: 'material', rarity: 'common', stats: {}, source: 'Starting Supplies', quantity: 8 },
      ]).select();
      inventory = (seeded || []) as Item[];
    }

    // Generate quests if none exist
    let quests = (questsData || []) as Quest[];
    if (quests.length === 0) {
      const templates = generateQuests(heroData as Hero, heroId, 'en');
      const { data: newQuests } = await supabase.from('quests').insert(templates).select();
      quests = (newQuests || []) as Quest[];
    }

    // Seed player into leaderboard if not already there
    const leaderboard = (leaderboardData || []) as LeaderboardEntry[];
    const playerInBoard = leaderboard.some(e => e.hero_id === heroId);
    if (!playerInBoard) {
      const h = heroData as Hero;
      const score = Math.floor((h.total_ticks ?? 0) / Math.max(1, h.commands_sent ?? 1));
      await supabase.from('leaderboard').insert({ hero_id: heroId, hero_name: h.name, stage: h.stage, total_ticks: h.total_ticks ?? 0, commands_sent: h.commands_sent ?? 0, laziness_score: score, is_ai: false });
    }

    setState({
      hero: heroData as Hero,
      pet, ark, pavilion, bossLab,
      activeDungeon: dungeonData as DungeonRun | null,
      inventory,
      npcMemories: (npcData || []) as NPCMemory[],
      logs: (logsData || []) as DiaryLog[],
      achievements: (achievementsData || []) as Achievement[],
      quests,
      leaderboard,
      economy: economyData as WorldEconomy | null,
      resonanceCount: 0, feedCount: 0, incomeCount: 0,
      loading: false, realtimeConnected: false,
      tribunalCases: (tribunalData || []) as TribunalCase[],
      wagers: (wagersData || []) as Wager[],
      mentor,
      fateBook: fateBookData as FateBook | null,
    });
  }

  const addLog = useCallback(async (log: { log_text: string; type: LogType }) => {
    const hero = state.hero;
    if (!hero) return;
    const newLog: DiaryLog = { id: crypto.randomUUID(), hero_id: hero.id, timestamp: new Date().toISOString(), log_text: log.log_text, type: log.type };
    setState(prev => ({ ...prev, logs: [...prev.logs.slice(-79), newLog] }));
    await supabase.from('diary_logs').insert({ hero_id: hero.id, log_text: log.log_text, type: log.type });
  }, [state.hero]);

  const updateHero = useCallback(async (updates: Partial<Hero>) => {
    setState(prev => prev.hero ? { ...prev, hero: { ...prev.hero!, ...updates } } : prev);
    if (state.hero) {
      const dbUpdates: Record<string, unknown> = { ...updates };
      if (updates.hp !== undefined) dbUpdates.hp = Math.max(0, Math.min(state.hero.max_hp, updates.hp));
      if (updates.gold !== undefined) dbUpdates.gold = Math.max(0, updates.gold);
      await supabase.from('heroes').update(dbUpdates).eq('id', state.hero.id);
    }
  }, [state.hero]);

  const updatePet = useCallback(async (updates: Partial<Pet>) => {
    setState(prev => prev.pet ? { ...prev, pet: { ...prev.pet!, ...updates } } : prev);
    if (state.pet) await supabase.from('pets').update(updates).eq('id', state.pet.id);
  }, [state.pet]);

  const updateArk = useCallback(async (updates: Partial<Ark>) => {
    setState(prev => prev.ark ? { ...prev, ark: { ...prev.ark!, ...updates } } : prev);
    if (state.ark) await supabase.from('ark').update(updates).eq('id', state.ark.id);
  }, [state.ark]);

  const upgradeArkRoom = useCallback(async (room: 'cabin' | 'engine' | 'armory' | 'garden' | 'workshop') => {
    const { ark } = state;
    if (!ark) return;
    const roomKey = `${room}_level` as keyof Ark;
    const currentLevel = ark[roomKey] as number;
    if (currentLevel >= 3) return;
    const roomUpdate = { [roomKey]: currentLevel + 1 } as Partial<Ark>;
    setState(prev => prev.ark ? { ...prev, ark: { ...prev.ark!, ...roomUpdate } } : prev);
    await supabase.from('ark').update(roomUpdate).eq('id', ark.id);
    onInteraction();
  }, [state.ark]);

  const updatePavilion = useCallback(async (updates: Partial<Pavilion>) => {
    setState(prev => prev.pavilion ? { ...prev, pavilion: { ...prev.pavilion!, ...updates } } : prev);
    if (state.pavilion) await supabase.from('pavilion').update(updates).eq('id', state.pavilion.id);
  }, [state.pavilion]);

  const collectPavilionIncome = useCallback(async () => {
    const { pavilion, hero, economy } = state;
    if (!pavilion || !hero) return;
    const ms = Date.now() - new Date(pavilion.last_collected_at).getTime();
    const ticks = Math.floor(ms / 10000);
    const mult = economy?.price_mult ?? 1.0;
    const income = Math.min(Math.floor(ticks * pavilion.income_per_tick * mult), pavilion.level * 500);
    if (income <= 0) return;
    const newGold = hero.gold + income;
    const newTotal = pavilion.total_earned + income;
    setState(prev => ({
      ...prev,
      hero: prev.hero ? { ...prev.hero, gold: newGold, total_gold_earned: (prev.hero.total_gold_earned ?? 0) + income } : prev.hero,
      pavilion: prev.pavilion ? { ...prev.pavilion, total_earned: newTotal, last_collected_at: new Date().toISOString() } : prev.pavilion,
      incomeCount: prev.incomeCount + 1,
    }));
    await Promise.all([
      supabase.from('heroes').update({ gold: newGold, total_gold_earned: (hero.total_gold_earned ?? 0) + income }).eq('id', hero.id),
      supabase.from('pavilion').update({ total_earned: newTotal, last_collected_at: new Date().toISOString() }).eq('id', pavilion.id),
    ]);
    onInteraction();
  }, [state.pavilion, state.hero, state.economy]);

  const updateBossLab = useCallback(async (updates: Partial<BossLab>) => {
    setState(prev => prev.bossLab ? { ...prev, bossLab: { ...prev.bossLab!, ...updates } } : prev);
    if (state.bossLab) await supabase.from('boss_lab').update(updates).eq('id', state.bossLab.id);
  }, [state.bossLab]);

  const enterDungeon = useCallback(async (type: DungeonType) => {
    if (!state.hero || state.activeDungeon) return;
    const { data } = await supabase.from('dungeon_runs').insert({ hero_id: state.hero.id, dungeon_name: DUNGEON_NAMES[type], dungeon_type: type, current_floor: 1, max_floor: DUNGEON_FLOORS[type], status: 'active', enemies_defeated: 0, loot_summary: [] }).select().single();
    if (data) setState(prev => ({ ...prev, activeDungeon: data as DungeonRun }));
    onInteraction();
  }, [state.hero, state.activeDungeon]);

  const advanceDungeon = useCallback(async () => {
    const { activeDungeon, hero } = state;
    if (!activeDungeon || !hero) return;
    const nextFloor = activeDungeon.current_floor + 1;
    if (nextFloor > activeDungeon.max_floor) {
      setState(prev => ({ ...prev, activeDungeon: null }));
      await supabase.from('dungeon_runs').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', activeDungeon.id);
      const newCompleted = (hero.total_dungeons_completed ?? 0) + 1;
      await updateHero({ total_dungeons_completed: newCompleted });
      if (state.bossLab) {
        const essence = { name: `${activeDungeon.dungeon_name} Essence`, element: ['Fire','Water','Earth','Wind','Lightning'][Math.floor(Math.random() * 5)], potency: Math.floor(Math.random() * 40) + 20, obtained_at: new Date().toISOString() };
        const newEssences = [...(state.bossLab.essences || []).slice(-9), essence];
        await supabase.from('boss_lab').update({ essences: newEssences }).eq('id', state.bossLab.id);
        setState(prev => prev.bossLab ? { ...prev, bossLab: { ...prev.bossLab!, essences: newEssences } } : prev);
      }
    } else {
      const updates = { current_floor: nextFloor, enemies_defeated: activeDungeon.enemies_defeated + 1 };
      setState(prev => ({ ...prev, activeDungeon: prev.activeDungeon ? { ...prev.activeDungeon, ...updates } : prev.activeDungeon }));
      await supabase.from('dungeon_runs').update(updates).eq('id', activeDungeon.id);
      await updateHero({ total_enemies_killed: (hero.total_enemies_killed ?? 0) + 1, hp: Math.max(10, hero.hp - Math.floor(Math.random() * 8 + 3)) });
    }
  }, [state.activeDungeon, state.hero, state.bossLab, updateHero]);

  const exitDungeon = useCallback(async () => {
    if (!state.activeDungeon) return;
    setState(prev => ({ ...prev, activeDungeon: null }));
    await supabase.from('dungeon_runs').update({ status: 'abandoned' }).eq('id', state.activeDungeon.id);
  }, [state.activeDungeon]);

  const addItem = useCallback(async (item: Omit<Item, 'id' | 'hero_id'>) => {
    if (!state.hero) return;
    const { data } = await supabase.from('items').insert({ ...item, hero_id: state.hero.id }).select().single();
    if (data) {
      setState(prev => ({ ...prev, inventory: [data as Item, ...prev.inventory] }));
      await updateHero({ total_items_crafted: (state.hero!.total_items_crafted ?? 0) + 1 });
    }
  }, [state.hero, updateHero]);

  const equipItem = useCallback(async (itemId: string, slot: Item['equipped_slot']) => {
    setState(prev => ({ ...prev, inventory: prev.inventory.map(i => i.id === itemId ? { ...i, equipped_slot: slot } : i.equipped_slot === slot ? { ...i, equipped_slot: undefined } : i) }));
    const existing = state.inventory.find(i => i.equipped_slot === slot && i.id !== itemId);
    if (existing) await supabase.from('items').update({ equipped_slot: null }).eq('id', existing.id);
    await supabase.from('items').update({ equipped_slot: slot }).eq('id', itemId);
  }, [state.inventory]);

  const unequipItem = useCallback(async (slot: NonNullable<Item['equipped_slot']>) => {
    const item = state.inventory.find(i => i.equipped_slot === slot);
    if (!item) return;
    setState(prev => ({ ...prev, inventory: prev.inventory.map(i => i.id === item.id ? { ...i, equipped_slot: undefined } : i) }));
    await supabase.from('items').update({ equipped_slot: null }).eq('id', item.id);
  }, [state.inventory]);

  const upsertNPCMemory = useCallback(async (npcName: string, type: string, notes: string) => {
    if (!state.hero) return;
    const existing = state.npcMemories.find(n => n.npc_name === npcName);
    if (existing) {
      const updated = { ...existing, encounter_count: existing.encounter_count + 1, memory_notes: notes, last_interaction: new Date().toISOString() };
      setState(prev => ({ ...prev, npcMemories: prev.npcMemories.map(n => n.npc_name === npcName ? updated : n) }));
      await supabase.from('npc_memories').update(updated).eq('id', existing.id);
    } else {
      const { data } = await supabase.from('npc_memories').insert({ hero_id: state.hero.id, npc_name: npcName, npc_type: type, encounter_count: 1, relationship: 'neutral', memory_notes: notes, last_interaction: new Date().toISOString() }).select().single();
      if (data) setState(prev => ({ ...prev, npcMemories: [...prev.npcMemories, data as NPCMemory] }));
    }
  }, [state.hero, state.npcMemories]);

  const incrementTicks = useCallback(() => {
    setState(prev => prev.hero ? { ...prev, hero: { ...prev.hero!, total_ticks: (prev.hero!.total_ticks || 0) + 1 } } : prev);
  }, []);

  const checkAndUnlockAchievements = useCallback(async () => {
    const { hero, pet, ark, pavilion, bossLab, npcMemories, inventory, logs, achievements, resonanceCount } = state;
    if (!hero) return;
    const unlockedKeys = new Set(achievements.map(a => a.key));
    const newOnes = getNewAchievements({ hero, logs, pet, ark, pavilion, bossLab, npcMemories, inventory, unlockedKeys, resonanceCount });
    if (newOnes.length === 0) return;
    const inserts = newOnes.map(def => ({ hero_id: hero.id, key: def.key, unlocked_at: new Date().toISOString() }));
    const { data } = await supabase.from('achievements').insert(inserts).select();
    if (data) {
      setState(prev => ({ ...prev, achievements: [...prev.achievements, ...(data as Achievement[])] }));
      for (const def of newOnes) {
        await addLog({ log_text: `Achievement unlocked: "${def.name.en}"`, type: 'system' });
      }
    }
  }, [state, addLog]);

  const updateQuestProgress = useCallback(async (type: Quest['objectives'][number]['type'], amount = 1) => {
    setState(prev => {
      const updated = prev.quests.map(q => {
        if (q.status !== 'active') return q;
        const newObjs = q.objectives.map(obj => obj.type === type ? { ...obj, progress: Math.min(obj.progress + amount, obj.amount) } : obj);
        const allMet = newObjs.every(o => o.progress >= o.amount);
        return { ...q, objectives: newObjs, status: allMet ? 'completed' as const : q.status };
      });
      return { ...prev, quests: updated };
    });
    // Persist completed quests
    const completed = state.quests.filter(q => q.status === 'active' && q.objectives.every(o => o.progress + amount >= o.amount));
    for (const q of completed) {
      await supabase.from('quests').update({ status: 'completed' }).eq('id', q.id);
    }
  }, [state.quests]);

  const claimQuestReward = useCallback(async (questId: string) => {
    const quest = state.quests.find(q => q.id === questId && q.status === 'completed');
    if (!quest || !state.hero) return;
    const { gold = 0, path_xp, item_name } = quest.reward;
    const updates: Partial<Hero> = { gold: state.hero.gold + gold, total_gold_earned: (state.hero.total_gold_earned ?? 0) + gold };
    if (path_xp) {
      const paths = { ...state.hero.cultivation_paths };
      for (const [k, v] of Object.entries(path_xp) as [CultivationPathKey, number][]) {
        const p = { ...paths[k] };
        p.xp += v;
        if (p.xp >= p.xp_to_next) { p.xp -= p.xp_to_next; p.level += 1; p.xp_to_next = Math.floor(p.xp_to_next * 1.5); }
        paths[k] = p;
      }
      updates.cultivation_paths = paths;
    }
    await updateHero(updates);
    if (item_name) await addItem({ name: item_name, item_type: 'material', rarity: 'uncommon', stats: {}, source: 'Quest Reward', quantity: 1 });
    await supabase.from('quests').update({ status: 'claimed' }).eq('id', questId);
    setState(prev => ({ ...prev, quests: prev.quests.map(q => q.id === questId ? { ...q, status: 'claimed' } : q) }));
    await addLog({ log_text: `Quest completed: "${quest.title}" — Reward claimed!`, type: 'system' });
  }, [state.quests, state.hero, updateHero, addItem, addLog]);

  const triggerDaoResonance = useCallback(async (message: string, locale: 'en' | 'ru' | 'zh'): Promise<ResonanceResult | null> => {
    if (!state.hero) return null;
    const result = analyzeResonance(message, locale);
    if (!result) return null;
    const heroUpdates = applyResonanceToHero(state.hero, result, state.resonanceCount);
    await updateHero(heroUpdates);
    setState(prev => ({ ...prev, resonanceCount: prev.resonanceCount + 1 }));
    await updateQuestProgress('send_resonance', 1);
    // Update leaderboard score
    const newScore = Math.floor(((state.hero.total_ticks ?? 0)) / Math.max(1, (state.hero.commands_sent ?? 0) + 1));
    await supabase.from('leaderboard').update({ laziness_score: newScore, commands_sent: (state.hero.commands_sent ?? 0) + 1, total_ticks: state.hero.total_ticks ?? 0 }).eq('hero_id', state.hero.id);
    return result;
  }, [state.hero, state.resonanceCount, updateHero, updateQuestProgress]);

  const investInEconomy = useCallback(async (gold: number) => {
    const { hero, economy } = state;
    if (!hero || !economy || hero.gold < gold) return;
    const newInvestment = (economy.total_sect_investment ?? 0) + gold;
    const LEVELS: MarketActivity[] = ['crashing', 'low', 'normal', 'high', 'boom'];
    const currentIdx = LEVELS.indexOf(economy.market_activity);
    const newActivity = newInvestment >= 1000 && currentIdx < 4 ? LEVELS[currentIdx + 1] : economy.market_activity;
    const priceMults: Record<string, number> = { crashing: 0.5, low: 0.75, normal: 1.0, high: 1.5, boom: 2.0 };
    const newMult = priceMults[newActivity];
    await updateHero({ gold: hero.gold - gold });
    const economyUpdates = { total_sect_investment: newInvestment, market_activity: newActivity, price_mult: newMult, trend: newActivity !== economy.market_activity ? 'rising' as const : economy.trend, last_updated: new Date().toISOString() };
    setState(prev => prev.economy ? { ...prev, economy: { ...prev.economy!, ...economyUpdates } } : prev);
    await supabase.from('world_economy').update(economyUpdates).eq('id', economy.id);
    onInteraction();
  }, [state.hero, state.economy, updateHero]);

  const feedPet = useCallback(async () => {
    if (!state.pet) return;
    await updatePet({ hunger: Math.min(100, state.pet.hunger + 30), mood: 'happy' });
    setState(prev => ({ ...prev, feedCount: prev.feedCount + 1 }));
    await updateQuestProgress('feed_pet', 1);
  }, [state.pet, updatePet, updateQuestProgress]);

  const onInteraction = useCallback(() => {
    setState(prev => {
      if (!prev.hero) return prev;
      const newCommands = (prev.hero.commands_sent ?? 0) + 1;
      return { ...prev, hero: { ...prev.hero, commands_sent: newCommands } };
    });
  }, []);

  const submitTribunalCase = useCallback(async (caseType: TribunalCaseType, pleaText: string, locale: 'en' | 'ru' | 'zh'): Promise<TribunalCase | null> => {
    const { hero, achievements } = state;
    if (!hero) return null;
    const verdict = generateVerdict(hero, caseType, pleaText, achievements.length, locale);
    const now = new Date().toISOString();
    const newCase: Omit<TribunalCase, 'id'> = {
      hero_id: hero.id,
      hero_name: hero.name,
      case_type: caseType,
      plea_text: pleaText,
      verdict: verdict.verdict,
      judgment_text: verdict.judgmentText,
      reward_gold: verdict.rewardGold,
      reward_xp: verdict.rewardXp,
      penalty_gold: verdict.penaltyGold,
      status: 'resolved',
      submitted_at: now,
      resolved_at: now,
      is_ai_case: false,
    };
    const { data } = await supabase.from('tribunal_cases').insert(newCase).select().single();
    if (!data) return null;
    const tc = data as TribunalCase;
    setState(prev => ({ ...prev, tribunalCases: [tc, ...prev.tribunalCases] }));
    const goldDelta = verdict.rewardGold - verdict.penaltyGold;
    await updateHero({ gold: Math.max(0, hero.gold + goldDelta), total_gold_earned: (hero.total_gold_earned ?? 0) + verdict.rewardGold });
    if (goldDelta !== 0) await addLog({ log_text: `Tribunal ${verdict.verdict}: "${caseType}" case — ${goldDelta >= 0 ? '+' : ''}${goldDelta} spirit stones.`, type: 'system' });
    onInteraction();
    return tc;
  }, [state.hero, state.achievements, updateHero, addLog]);

  const placeWager = useCallback(async (targetName: string, targetScore: number, amount: number, prediction: 'rise' | 'fall') => {
    const { hero, wagers } = state;
    if (!hero || hero.gold < amount) return;
    const activeCount = wagers.filter(w => w.status === 'active').length;
    if (activeCount >= MAX_ACTIVE_WAGERS) return;
    if (amount < MIN_WAGER || amount > MAX_WAGER) return;
    const wagerData = createWager(hero.id, targetName, targetScore, amount, prediction);
    const { data } = await supabase.from('wagers').insert(wagerData).select().single();
    if (!data) return;
    setState(prev => ({ ...prev, wagers: [data as Wager, ...prev.wagers] }));
    await updateHero({ gold: hero.gold - amount });
    onInteraction();
  }, [state.hero, state.wagers, updateHero]);

  const resolveExpiredWagers = useCallback(async () => {
    const { wagers, leaderboard } = state;
    const now = Date.now();
    const toResolve = wagers.filter(w => w.status === 'active' && new Date(w.resolves_at).getTime() <= now);
    if (toResolve.length === 0) return;
    for (const wager of toResolve) {
      const entry = leaderboard.find(e => e.hero_name === wager.target_hero_name);
      const currentScore = entry ? driftAIScore(wager.target_score_at_bet) : driftAIScore(wager.target_score_at_bet);
      const { outcome, payout } = resolveWager(wager, currentScore);
      await supabase.from('wagers').update({ status: 'resolved', outcome, payout }).eq('id', wager.id);
      setState(prev => ({
        ...prev,
        wagers: prev.wagers.map(w => w.id === wager.id ? { ...w, status: 'resolved', outcome, payout } : w),
      }));
      if (payout > 0 && state.hero) {
        await updateHero({ gold: state.hero.gold + payout, total_gold_earned: (state.hero.total_gold_earned ?? 0) + payout });
        await addLog({ log_text: `Wager won! ${wager.target_hero_name} ${wager.prediction === 'rise' ? 'rose' : 'fell'} — +${payout} spirit stones!`, type: 'system' });
      } else {
        await addLog({ log_text: `Wager lost. ${wager.target_hero_name} did not ${wager.prediction}. ${wager.amount} stones gone.`, type: 'system' });
      }
    }
  }, [state.wagers, state.hero, state.leaderboard, updateHero, addLog]);

  const requestMentorWisdom = useCallback(async (locale: 'en' | 'ru' | 'zh'): Promise<string> => {
    const { mentor, hero, pet, pavilion } = state;
    if (!mentor || !hero) return '';
    const petLvl = pet?.level ?? 1;
    const petMoodStr = pet?.mood ?? 'neutral';
    const pavIncome = pavilion?.total_earned ?? 0;
    const wisdom = generateMentorWisdom(mentor, hero, locale, petLvl, petMoodStr, pavIncome);
    const newRel = Math.min(100, mentor.relationship + 2);
    const newConvs = mentor.total_conversations + 1;
    await supabase.from('sect_mentor').update({ relationship: newRel, total_conversations: newConvs, last_wisdom: wisdom, last_wisdom_at: new Date().toISOString() }).eq('id', mentor.id);
    setState(prev => prev.mentor ? { ...prev, mentor: { ...prev.mentor!, relationship: newRel, total_conversations: newConvs, last_wisdom: wisdom, last_wisdom_at: new Date().toISOString() } } : prev);
    onInteraction();
    return wisdom;
  }, [state.mentor, state.hero, state.pet, state.pavilion]);

  const notifyMentorResonance = useCallback(async (mentorType: import('./types').MentorType, locale: 'en' | 'ru' | 'zh') => {
    const { mentor } = state;
    if (!mentor) return;
    const { getMentorResonanceReaction } = await import('@/lib/game/mentor');
    const reaction = getMentorResonanceReaction(mentorType, locale);
    const newRel = Math.min(100, mentor.relationship + 5);
    await supabase.from('sect_mentor').update({ relationship: newRel, last_wisdom: reaction, last_wisdom_at: new Date().toISOString() }).eq('id', mentor.id);
    setState(prev => prev.mentor ? { ...prev, mentor: { ...prev.mentor!, relationship: newRel, last_wisdom: reaction, last_wisdom_at: new Date().toISOString() } } : prev);
  }, [state.mentor]);

  const generateFateBook = useCallback(async (locale: 'en' | 'ru' | 'zh'): Promise<FateBook | null> => {
    const { hero, fateBook } = state;
    if (!hero) return null;
    // One per week — compute week key
    const now = new Date();
    const year = now.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const weekNum = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
    const weekKey = `${year}-W${String(weekNum).padStart(2, '0')}`;
    if (fateBook && fateBook.week_key === weekKey && fateBook.status !== 'claimed') return fateBook;

    const { data: bookData, aiPowered } = await generateFateBookData(hero, locale);
    // Snapshot hero baselines for objective tracking
    const heroStatMap: Record<string, number> = {
      kill_enemies: hero.total_enemies_killed ?? 0,
      collect_gold: hero.gold,
      enter_dungeon: hero.total_dungeons_completed ?? 0,
      complete_dungeon: hero.total_dungeons_completed ?? 0,
      feed_pet: 0,
      send_resonance: hero.resonance_count ?? 0,
      reach_path_level: Math.max(...Object.values(hero.cultivation_paths).map(p => p.level)),
    };
    const objectives = bookData.objectives.map(o => ({
      ...o,
      baseline: heroStatMap[o.type] ?? 0,
      progress: 0,
    }));

    const row = {
      hero_id: hero.id,
      week_key: weekKey,
      title: bookData.title,
      narrative: bookData.narrative,
      objectives,
      reward_text: bookData.rewardText,
      reward_gold: bookData.rewardGold,
      status: 'active' as const,
    };
    const { data } = await supabase.from('fate_book').insert(row).select().single();
    if (!data) return null;
    const newBook = data as FateBook;
    setState(prev => ({ ...prev, fateBook: newBook }));
    await addLog({ log_text: `Book of Fate: "${newBook.title}" — a new celestial trial begins.${aiPowered ? ' (AI)' : ''}`, type: 'system' });
    onInteraction();
    return newBook;
  }, [state.hero, state.fateBook, addLog]);

  const updateFateBookProgress = useCallback(async (type: string, amount = 1) => {
    setState(prev => {
      const { fateBook } = prev;
      if (!fateBook || fateBook.status !== 'active') return prev;
      const newObjs = fateBook.objectives.map(o =>
        o.type === type ? { ...o, progress: Math.min(o.progress + amount, o.amount) } : o
      );
      const allDone = newObjs.every(o => o.progress >= o.amount);
      return { ...prev, fateBook: { ...fateBook, objectives: newObjs, status: allDone ? 'completed' as const : fateBook.status } };
    });
    const { fateBook } = state;
    if (!fateBook || fateBook.status !== 'active') return;
    const updatedObjs = fateBook.objectives.map(o =>
      o.type === type ? { ...o, progress: Math.min(o.progress + amount, o.amount) } : o
    );
    const allDone = updatedObjs.every(o => o.progress >= o.amount);
    await supabase.from('fate_book').update({
      objectives: updatedObjs,
      status: allDone ? 'completed' : fateBook.status,
    }).eq('id', fateBook.id);
  }, [state.fateBook]);

  const claimFateBookReward = useCallback(async () => {
    const { fateBook, hero } = state;
    if (!fateBook || fateBook.status !== 'completed' || !hero) return;
    await updateHero({ gold: hero.gold + fateBook.reward_gold, total_gold_earned: (hero.total_gold_earned ?? 0) + fateBook.reward_gold });
    await supabase.from('fate_book').update({ status: 'claimed' }).eq('id', fateBook.id);
    setState(prev => prev.fateBook ? { ...prev, fateBook: { ...prev.fateBook!, status: 'claimed' } } : prev);
    await addLog({ log_text: `Book of Fate complete: "${fateBook.title}" — +${fateBook.reward_gold} spirit stones.`, type: 'system' });
  }, [state.fateBook, state.hero, updateHero, addLog]);

  const getNPCDialogue = useCallback(async (npc: NPCMemory, locale: 'en' | 'ru' | 'zh'): Promise<string> => {
    if (!state.hero) return '';
    try {
      const { text } = await aiGetNPCDialogue(state.hero, npc, locale);
      return text;
    } catch {
      return `${npc.npc_name} regards you with a ${npc.relationship} expression. You've met ${npc.encounter_count} time${npc.encounter_count !== 1 ? 's' : ''}.`;
    }
  }, [state.hero]);

  const value: GameContextType = {
    ...state,
    addLog, updateHero, updatePet, updateArk, upgradeArkRoom,
    updatePavilion, collectPavilionIncome, updateBossLab,
    enterDungeon, advanceDungeon, exitDungeon,
    addItem, equipItem, unequipItem, upsertNPCMemory, incrementTicks,
    checkAndUnlockAchievements, updateQuestProgress, claimQuestReward,
    triggerDaoResonance, investInEconomy, feedPet, onInteraction,
    submitTribunalCase, placeWager, resolveExpiredWagers,
    requestMentorWisdom, notifyMentorResonance,
    generateFateBook, updateFateBookProgress, claimFateBookReward, getNPCDialogue,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be inside GameProvider');
  return ctx;
}
