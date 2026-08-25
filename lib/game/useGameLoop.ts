'use client';

import { useEffect, useRef } from 'react';
import { useGame } from '@/lib/game/context';
import { useI18n } from '@/lib/i18n/context';
import { MOCK_NPC_NAMES } from '@/lib/game/mockAI';
import { getAIDiaryEvent } from '@/lib/game/aiClient';
import type { CultivationPathKey, LogType } from './types';

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const YIN_YANG_DELTA: Record<LogType, number> = {
  combat: 3, loot: 1, rest: -2, dungeon: 2,
  pet: -1, sect: 0, system: 0, chain: 1,
};

const CHAIN_TRIGGERS = {
  en: [
    { trigger: 'bandits', follow: 'The bandit chief sends a formal challenge letter. Eloquent handwriting.', delay: 3 },
    { trigger: 'spirit fox', follow: 'The spirit fox returns and drops a jade bead at your feet.', delay: 2 },
    { trigger: 'elder', follow: "The elder's disciple arrives to thank you. Brings 15 spirit stones.", delay: 4 },
    { trigger: 'pill', follow: 'Side effects kick in: brief enlightenment. +Alchemy XP.', delay: 2 },
  ],
  ru: [
    { trigger: 'бандит', follow: 'Главарь бандитов прислал официальное письмо с вызовом. Красивый почерк.', delay: 3 },
    { trigger: 'духовная лиса', follow: 'Духовная лиса вернулась и положила нефритовую бусину у ваших ног.', delay: 2 },
    { trigger: 'старейшин', follow: 'Ученик старейшины пришёл поблагодарить. Принёс 15 духовных камней.', delay: 4 },
    { trigger: 'пилюл', follow: 'Побочный эффект: краткое просветление. +Алхимия XP.', delay: 2 },
  ],
  zh: [
    { trigger: '劫匪', follow: '土匪头目发来正式挑战书，字迹优美。', delay: 3 },
    { trigger: '灵狐', follow: '灵狐回来了，在你脚边放了一颗玉珠。', delay: 2 },
    { trigger: '长老', follow: '长老的弟子前来道谢，带来了15块灵石。', delay: 4 },
    { trigger: '丹', follow: '之前那颗丹的副作用发作：短暂顿悟。+炼丹经验。', delay: 2 },
  ],
};

const ECONOMY_ELEMENTS = ['Fire', 'Water', 'Earth', 'Wind', 'Lightning'];

const AI_EVENT_TYPES: Record<LogType, string> = {
  combat: 'combat encounter', loot: 'treasure discovery',
  rest: 'meditation rest', dungeon: 'dungeon exploration',
  pet: 'spirit beast bonding', sect: 'sect gathering',
  system: 'cultivation insight', chain: 'unexpected twist',
};

export function useGameLoop() {
  const {
    hero, pet, activeDungeon, economy,
    addLog, updateHero, updatePet, advanceDungeon, incrementTicks,
    upsertNPCMemory, addItem, updateQuestProgress, checkAndUnlockAchievements,
    updateFateBookProgress,
  } = useGame();
  const { t, locale } = useI18n();
  const chainQueueRef = useRef<{ text: string; type: LogType; atTick: number }[]>([]);
  const tickRef = useRef(0);
  const achCheckCounterRef = useRef(0);
  const aiDiaryCounterRef = useRef(0);

  useEffect(() => {
    if (!hero) return;

    const interval = setInterval(async () => {
      tickRef.current += 1;
      const tick = tickRef.current;
      incrementTicks();

      // Resolve chain events
      const due = chainQueueRef.current.filter(e => e.atTick <= tick);
      chainQueueRef.current = chainQueueRef.current.filter(e => e.atTick > tick);
      for (const e of due) {
        await addLog({ log_text: e.text, type: e.type });
        if (e.type === 'loot') {
          await updateQuestProgress('collect_gold', 15);
          updateFateBookProgress('collect_gold', 15);
        }
      }

      // Dungeon advance (every 2 ticks)
      if (activeDungeon && activeDungeon.status === 'active') {
        if (tick % 2 === 0) {
          await advanceDungeon();
          const floorTemplate = pick(t.events.dungeon);
          const text = floorTemplate
            .replace('{n}', String(activeDungeon.current_floor + 1))
            .replace('{dungeon}', activeDungeon.dungeon_name);
          await addLog({ log_text: text, type: 'dungeon' });
          await updateQuestProgress('kill_enemies', 1);
          updateFateBookProgress('kill_enemies', 1);
          updateFateBookProgress('enter_dungeon', 1);
        }
        if (tick % 20 === 0 && economy) {
          const element = pick(ECONOMY_ELEMENTS);
          await supabaseUpdateEconomy(economy.id, element);
        }
        achCheckCounterRef.current++;
        if (achCheckCounterRef.current >= 10) {
          achCheckCounterRef.current = 0;
          await checkAndUnlockAchievements();
        }
        return;
      }

      // Regular tick event
      const rand = Math.random();
      let type: LogType;
      let logText: string;
      let hpDelta = 0;
      let goldDelta = 0;
      let pathXpKey: CultivationPathKey | null = null;

      if (rand < 0.35) {
        type = 'combat';
        logText = pick(t.events.combat);
        hpDelta = -(Math.floor(Math.random() * 18) + 5);
        goldDelta = Math.floor(Math.random() * 12);
        pathXpKey = 'sword';
        await updateQuestProgress('kill_enemies', 1);
        updateFateBookProgress('kill_enemies', 1);
      } else if (rand < 0.60) {
        type = 'loot';
        logText = pick(t.events.loot);
        goldDelta = Math.floor(Math.random() * 25) + 5;
        pathXpKey = 'trade';
        await updateQuestProgress('collect_gold', goldDelta);
        updateFateBookProgress('collect_gold', goldDelta);
        if (Math.random() < 0.15) {
          const mats = [
            { name: 'Celestial Wood', name_zh: '天木', item_type: 'material' as const, stats: {} },
            { name: 'Spirit Iron', name_zh: '灵铁', item_type: 'material' as const, stats: {} },
            { name: 'Cloud Silk', name_zh: '云丝', item_type: 'material' as const, stats: {} },
          ];
          await addItem({ ...pick(mats), rarity: 'common', source: 'Found', quantity: Math.floor(Math.random() * 3) + 1 });
        }
      } else if (rand < 0.80) {
        type = 'rest';
        logText = pick(t.events.rest);
        hpDelta = Math.floor(Math.random() * 25) + 10;
        pathXpKey = 'spirit';
      } else if (rand < 0.90 && pet) {
        type = 'pet';
        const petTemplate = pick(t.events.pet);
        logText = petTemplate.replace('{pet}', pet.name);
        pathXpKey = 'spirit';
        const newPetXp = pet.xp + 15;
        if (newPetXp >= pet.xp_to_next) {
          await updatePet({ xp: 0, level: pet.level + 1, xp_to_next: pet.xp_to_next + 30 });
        } else {
          await updatePet({ xp: newPetXp });
        }
        if (pet.hunger > 10) await updatePet({ hunger: pet.hunger - 5 });
      } else {
        type = 'combat';
        const npc = pick(MOCK_NPC_NAMES);
        logText = locale === 'zh'
          ? `与${npc.zh}相遇并交手。`
          : locale === 'ru'
            ? `Встретил ${npc.name} и вступил в схватку.`
            : `Encountered ${npc.name} and exchanged blows.`;
        await upsertNPCMemory(npc.name, npc.type, `Encountered on tick ${tick}`);
        hpDelta = -(Math.floor(Math.random() * 10) + 5);
        goldDelta = Math.floor(Math.random() * 8);
        pathXpKey = 'sword';
        await updateQuestProgress('kill_enemies', 1);
        updateFateBookProgress('kill_enemies', 1);
      }

      const newHp = Math.max(1, Math.min(hero.max_hp, hero.hp + hpDelta));
      const newGold = Math.max(0, hero.gold + goldDelta);
      const newYinYang = Math.max(-100, Math.min(100, hero.yin_yang + (YIN_YANG_DELTA[type] ?? 0)));
      const newGoldEarned = (hero.total_gold_earned ?? 0) + (goldDelta > 0 ? goldDelta : 0);

      const paths = { ...hero.cultivation_paths };
      if (pathXpKey) {
        const p = { ...paths[pathXpKey] };
        p.xp += Math.floor(Math.random() * 8) + 3;
        if (p.xp >= p.xp_to_next) {
          p.xp -= p.xp_to_next;
          p.level += 1;
          p.xp_to_next = Math.floor(p.xp_to_next * 1.5);
          const levelUpTexts = {
            en: `Breakthrough in ${t.paths[pathXpKey]}! Level ${p.level}.`,
            ru: `Прорыв в ${t.paths[pathXpKey]}! Уровень ${p.level}.`,
            zh: `${t.paths[pathXpKey]}突破！达到${p.level}层。`,
          };
          await addLog({ log_text: levelUpTexts[locale], type: 'system' });
          updateFateBookProgress('reach_path_level', 1);
        }
        paths[pathXpKey] = p;
      }

      await updateHero({
        hp: newHp, gold: newGold, yin_yang: newYinYang,
        cultivation_paths: paths, total_ticks: (hero.total_ticks ?? 0) + 1,
        total_enemies_killed: type === 'combat' ? (hero.total_enemies_killed ?? 0) + 1 : undefined,
        total_gold_earned: newGoldEarned,
      });

      // Every 15 ticks: fire-and-forget AI diary entry (non-blocking)
      aiDiaryCounterRef.current++;
      if (aiDiaryCounterRef.current >= 15) {
        aiDiaryCounterRef.current = 0;
        const zones = ['Misty Peak', 'Iron Valley', 'Jade Lake', 'Hollow Sword Ridge', 'Ancient Spirit Forest'];
        getAIDiaryEvent(hero, AI_EVENT_TYPES[type], pick(zones), logText, locale)
          .then(aiText => { if (aiText && aiText !== logText) addLog({ log_text: aiText, type }); })
          .catch(() => { /* silent — fallback log already added */ });
        // Still log the regular entry immediately so the UI isn't blank
        await addLog({ log_text: logText, type });
      } else {
        await addLog({ log_text: logText, type });
      }

      // Chain events
      const chains = CHAIN_TRIGGERS[locale];
      for (const chain of chains) {
        if (logText.toLowerCase().includes(chain.trigger.toLowerCase())) {
          chainQueueRef.current.push({ text: chain.follow, type: 'chain', atTick: tick + chain.delay });
          break;
        }
      }

      // Achievement check every 10 ticks
      achCheckCounterRef.current++;
      if (achCheckCounterRef.current >= 10) {
        achCheckCounterRef.current = 0;
        await checkAndUnlockAchievements();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [hero?.id, activeDungeon?.id, locale, pet?.id]);
}

// Lightweight economy element update (outside context to avoid circular dep)
async function supabaseUpdateEconomy(economyId: string, newElement: string) {
  const { supabase } = await import('@/lib/supabase');
  await supabase.from('world_economy').update({ dominant_element: newElement, last_updated: new Date().toISOString() }).eq('id', economyId);
}
