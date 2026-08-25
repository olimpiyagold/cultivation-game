import type { Hero, FatePath, CultivationPathKey, ResonanceResult, ResonanceType, HeroPsyche } from './types';

interface ResonanceRule {
  keywords: { en: string[]; ru: string[]; zh: string[] };
  type: ResonanceType;
  psycheDelta: Partial<HeroPsyche>;
  yinYangDelta: number;
  pathBoost?: CultivationPathKey;
  fatePush?: FatePath;
  feedback: Record<'en' | 'ru' | 'zh', string>;
}

const RESONANCE_RULES: ResonanceRule[] = [
  {
    type: 'aggressive',
    keywords: {
      en: ['fight', 'attack', 'kill', 'destroy', 'battle', 'strike', 'slay', 'conquer', 'war'],
      ru: ['бой', 'атак', 'убей', 'уничтож', 'сражайся', 'удар', 'воюй'],
      zh: ['战', '打', '杀', '攻击', '摧毁', '斩', '征服'],
    },
    psycheDelta: { pride: 5, cowardice: -3 },
    yinYangDelta: 5,
    pathBoost: 'sword',
    fatePush: 'sword',
    feedback: {
      en: 'Warrior resonance — your hero\'s blade instinct sharpens. Sword path enhanced.',
      ru: 'Боевой резонанс — инстинкт клинка обостряется. Путь меча усилен.',
      zh: '战士共鸣——英雄的剑意更加锐利，剑道得到强化。',
    },
  },
  {
    type: 'peaceful',
    keywords: {
      en: ['meditate', 'rest', 'peace', 'calm', 'breathe', 'relax', 'harmony', 'zen', 'still'],
      ru: ['медитируй', 'отдохни', 'покой', 'спокойств', 'гармони', 'дыши'],
      zh: ['冥想', '休息', '平静', '和谐', '呼吸', '宁静', '修心'],
    },
    psycheDelta: { compassion: 5, greed: -2 },
    yinYangDelta: -5,
    pathBoost: 'spirit',
    fatePush: 'hermit',
    feedback: {
      en: 'Serene resonance — your hero\'s spirit deepens. Spirit path enhanced.',
      ru: 'Безмятежный резонанс — дух героя углубляется. Духовный путь усилен.',
      zh: '宁静共鸣——英雄的灵魂更加深邃，灵道得到强化。',
    },
  },
  {
    type: 'greedy',
    keywords: {
      en: ['gold', 'money', 'rich', 'wealth', 'coin', 'profit', 'trade', 'sell', 'buy', 'merchant'],
      ru: ['золото', 'богат', 'деньги', 'торгуй', 'продай', 'купи', 'прибыль'],
      zh: ['金', '富', '钱', '灵石', '贸易', '买', '卖', '商'],
    },
    psycheDelta: { greed: 6 },
    yinYangDelta: 2,
    pathBoost: 'trade',
    fatePush: 'merchant',
    feedback: {
      en: 'Merchant resonance — your hero\'s nose for profit sharpens. Trade path enhanced.',
      ru: 'Торговый резонанс — чутьё к прибыли обостряется. Торговый путь усилен.',
      zh: '商道共鸣——英雄的商业嗅觉更敏锐，商道得到强化。',
    },
  },
  {
    type: 'curious',
    keywords: {
      en: ['explore', 'learn', 'discover', 'study', 'read', 'know', 'research', 'investigate', 'find'],
      ru: ['исследуй', 'учись', 'изучи', 'открой', 'читай', 'узнай'],
      zh: ['探索', '学习', '研究', '发现', '读', '了解', '调查'],
    },
    psycheDelta: { curiosity: 6, cowardice: -2 },
    yinYangDelta: 1,
    pathBoost: 'scholar',
    fatePush: 'alchemy',
    feedback: {
      en: 'Scholarly resonance — your hero\'s mind opens. Scholar path enhanced.',
      ru: 'Учёный резонанс — разум героя раскрывается. Путь учёного усилен.',
      zh: '学者共鸣——英雄的心智更加开阔，文道得到强化。',
    },
  },
  {
    type: 'alchemist',
    keywords: {
      en: ['pill', 'brew', 'alchemy', 'potion', 'refine', 'elixir', 'formula', 'recipe', 'concoct'],
      ru: ['пилюл', 'алхим', 'зелье', 'рецепт', 'варить', 'элексир'],
      zh: ['丹', '炼丹', '药', '炼制', '丹方', '药草', '配方'],
    },
    psycheDelta: { curiosity: 3 },
    yinYangDelta: -2,
    pathBoost: 'alchemy',
    fatePush: 'alchemy',
    feedback: {
      en: 'Alchemical resonance — the furnace roars. Alchemy path enhanced.',
      ru: 'Алхимический резонанс — печь ревёт. Путь алхимии усилен.',
      zh: '炼丹共鸣——炉火熊熊，炼丹之道得到强化。',
    },
  },
  {
    type: 'cowardly',
    keywords: {
      en: ['run', 'hide', 'flee', 'afraid', 'scared', 'retreat', 'avoid', 'escape'],
      ru: ['убегай', 'прячься', 'бежи', 'боишься', 'отступай', 'избегай'],
      zh: ['逃跑', '躲', '害怕', '撤退', '回避'],
    },
    psycheDelta: { cowardice: 6, pride: -3 },
    yinYangDelta: -3,
    feedback: {
      en: 'Retreating resonance — your hero\'s courage wavers slightly.',
      ru: 'Отступающий резонанс — мужество героя слегка колеблется.',
      zh: '退缩共鸣——英雄的勇气微微动摇。',
    },
  },
];

export function analyzeResonance(message: string, locale: 'en' | 'ru' | 'zh'): ResonanceResult | null {
  const lower = message.toLowerCase();

  for (const rule of RESONANCE_RULES) {
    const keywords = rule.keywords[locale];
    if (keywords.some(kw => lower.includes(kw))) {
      return {
        type: rule.type,
        psycheDelta: rule.psycheDelta,
        yinYangDelta: rule.yinYangDelta,
        pathBoost: rule.pathBoost,
        fatePush: rule.fatePush,
        feedback: rule.feedback[locale],
      };
    }
  }
  return null;
}

export function applyResonanceToHero(
  hero: Hero,
  result: ResonanceResult,
  resonanceCount: number,
): Partial<Hero> {
  const newPsyche = { ...hero.psyche };
  for (const [k, v] of Object.entries(result.psycheDelta) as [keyof HeroPsyche, number][]) {
    newPsyche[k] = Math.max(0, Math.min(100, newPsyche[k] + v));
  }

  const newYinYang = Math.max(-100, Math.min(100, hero.yin_yang + result.yinYangDelta));

  // Path resonance boost
  let paths = { ...hero.cultivation_paths };
  if (result.pathBoost) {
    const p = { ...paths[result.pathBoost] };
    p.xp += 15;
    if (p.xp >= p.xp_to_next) {
      p.xp -= p.xp_to_next;
      p.level += 1;
      p.xp_to_next = Math.floor(p.xp_to_next * 1.5);
    }
    paths[result.pathBoost] = p;
  }

  // Fate shift: after 8 resonances of same type, fate path shifts
  let newFate = hero.fate_path;
  if (result.fatePush && resonanceCount > 0 && resonanceCount % 8 === 0) {
    newFate = result.fatePush;
  }

  return {
    psyche: newPsyche,
    yin_yang: newYinYang,
    cultivation_paths: paths,
    fate_path: newFate,
    commands_sent: (hero.commands_sent ?? 0) + 1,
  };
}
