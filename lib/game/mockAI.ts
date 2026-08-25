import { getOracleResponse } from './aiClient';
import type { Hero, Pet, DiaryLog, NPCMemory } from './types';
import type { Locale } from '@/lib/i18n/translations';

interface AIContext {
  hero: Hero;
  pet?: Pet | null;
  recentLogs: DiaryLog[];
  npcMemories: NPCMemory[];
  userMessage: string;
}

export async function getMockAIResponse(ctx: AIContext, locale: Locale): Promise<{ text: string; remaining: number | null; usingUserKey: boolean }> {
  try {
    const result = await getOracleResponse(
      ctx.hero,
      ctx.pet ?? null,
      ctx.recentLogs,
      ctx.npcMemories,
      ctx.userMessage,
      locale,
    );
    return { text: result.text, remaining: result.remaining, usingUserKey: result.usingUserKey };
  } catch {
    // Offline/edge-function unavailable fallback
    const fallbacks: Record<Locale, string[]> = {
      en: [
        "The Dao speaks, but the connection between worlds is disrupted. Try again, lazy cultivator.",
        "My enlightenment was interrupted. The spirit network seems unstable. Try once more.",
        "Even the celestial relay falters sometimes. My wisdom will return shortly.",
      ],
      ru: [
        "Дао говорит, но связь между мирами нарушена. Попробуйте ещё раз, ленивый культиватор.",
        "Моё просветление было прервано. Духовная сеть нестабильна.",
        "Даже небесное реле иногда сбоит. Моя мудрость скоро вернётся.",
      ],
      zh: [
        "道在言说，但界面间的连接中断了。再试一次，懒散的修士。",
        "我的顿悟被打断了，灵力网络似乎不稳定。",
        "就连天机传音也有失灵时候，我的智慧片刻后便会归来。",
      ],
    };
    const arr = fallbacks[locale] ?? fallbacks.en;
    return { text: arr[Math.floor(Math.random() * arr.length)], remaining: null, usingUserKey: false };
  }
}

export const MOCK_NPC_NAMES = [
  { name: 'Elder Wang', type: 'elder', zh: '王长老' },
  { name: 'Iron Fist Chen', type: 'warrior', zh: '铁拳陈' },
  { name: 'Pill Merchant Liu', type: 'merchant', zh: '刘药商' },
  { name: 'Wandering Swordsman', type: 'wanderer', zh: '游侠剑客' },
  { name: 'Demon Fox Yao', type: 'demon', zh: '妖狐瑶' },
  { name: 'Heavenly Scholar Bai', type: 'scholar', zh: '天才白' },
];
