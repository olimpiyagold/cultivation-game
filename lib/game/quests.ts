import type { Hero, Quest, QuestObjType, QuestObjective, QuestReward, CultivationPathKey } from './types';

interface QuestTemplate {
  title: Record<'en' | 'ru' | 'zh', string>;
  description: Record<'en' | 'ru' | 'zh', string>;
  objectives: { type: QuestObjType; amount: number }[];
  reward: QuestReward;
  quest_type: Quest['quest_type'];
}

const DAILY_TEMPLATES: QuestTemplate[] = [
  {
    title: { en: 'Combat Practice', ru: 'Боевая Тренировка', zh: '战斗修炼' },
    description: { en: 'Your bones need exercise. Defeat 5 enemies.', ru: 'Кости нуждаются в тренировке. Победи 5 врагов.', zh: '筋骨需要磨砺，击败5个敌人。' },
    objectives: [{ type: 'kill_enemies', amount: 5 }],
    reward: { gold: 120, path_xp: { sword: 50 } },
    quest_type: 'daily',
  },
  {
    title: { en: 'Market Audit', ru: 'Аудит Рынка', zh: '市场审计' },
    description: { en: 'The pavilion awaits your lazy attention.', ru: 'Павильон ждёт твоего ленивого внимания.', zh: '灵市等待你懒洋洋的关注。' },
    objectives: [{ type: 'collect_income', amount: 1 }],
    reward: { gold: 80, path_xp: { trade: 40 } },
    quest_type: 'daily',
  },
  {
    title: { en: 'Spirit Bonding', ru: 'Духовная Связь', zh: '灵宠互动' },
    description: { en: 'Your spirit beast looks hungry. Feed it.', ru: 'Твой духовный зверь выглядит голодным. Покорми его.', zh: '你的灵宠看起来饿了，喂它吧。' },
    objectives: [{ type: 'feed_pet', amount: 1 }],
    reward: { gold: 60, path_xp: { spirit: 40 } },
    quest_type: 'daily',
  },
  {
    title: { en: 'Gold Collection', ru: 'Сбор Золота', zh: '灵石征集' },
    description: { en: 'Accumulate 300 spirit stones.', ru: 'Накопить 300 духовных камней.', zh: '积累300枚灵石。' },
    objectives: [{ type: 'collect_gold', amount: 300 }],
    reward: { gold: 150, path_xp: { trade: 60 } },
    quest_type: 'daily',
  },
  {
    title: { en: 'Dao Dialogue', ru: 'Диалог с Дао', zh: '与道对话' },
    description: { en: 'Speak to your hero to guide their path.', ru: 'Поговори с героем чтобы направить его путь.', zh: '与你的英雄对话，引导他的道途。' },
    objectives: [{ type: 'send_resonance', amount: 2 }],
    reward: { gold: 50, path_xp: { scholar: 40 } },
    quest_type: 'daily',
  },
];

const WEEKLY_TEMPLATES: QuestTemplate[] = [
  {
    title: { en: 'Trial by Fire', ru: 'Испытание Огнём', zh: '火之试炼' },
    description: { en: 'A great warrior must prove themselves. Defeat 30 enemies.', ru: 'Великий воин должен доказать себя. Победи 30 врагов.', zh: '真正的勇士必须证明自己，击败30个敌人。' },
    objectives: [{ type: 'kill_enemies', amount: 30 }],
    reward: { gold: 600, path_xp: { sword: 150 } },
    quest_type: 'weekly',
  },
  {
    title: { en: 'Dungeon Week', ru: 'Неделя Подземелий', zh: '地宫周' },
    description: { en: 'Delve into the dark and prove your worth.', ru: 'Погрузись в темноту и докажи свою ценность.', zh: '深入黑暗，证明你的价值。' },
    objectives: [{ type: 'complete_dungeon', amount: 1 }],
    reward: { gold: 500, item_name: 'Spirit Iron' },
    quest_type: 'weekly',
  },
  {
    title: { en: 'Essence Hunt', ru: 'Охота за Эссенциями', zh: '精华猎手' },
    description: { en: 'Collect boss essences for the Demon Altar.', ru: 'Собери эссенции боссов для Алтаря Демонов.', zh: '为炼魔台收集Boss精华。' },
    objectives: [{ type: 'collect_essences', amount: 2 }],
    reward: { gold: 400, item_name: 'Dragon Scale' },
    quest_type: 'weekly',
  },
  {
    title: { en: 'Path Devotion', ru: 'Преданность Пути', zh: '专注修道' },
    description: { en: 'Advance any cultivation path by 2 levels.', ru: 'Продвинуть любой путь культивации на 2 уровня.', zh: '任一道途提升2级。' },
    objectives: [{ type: 'reach_path_level', amount: 2 }],
    reward: { gold: 450, path_xp: { scholar: 100, spirit: 100 } },
    quest_type: 'weekly',
  },
];

const STORY_TEMPLATES: QuestTemplate[] = [
  {
    title: { en: 'The Lazy Legend Begins', ru: 'Начало Ленивой Легенды', zh: '懒仙传说开篇' },
    description: { en: 'A thousand moments of effortless cultivation. Reach 100 ticks.', ru: 'Тысяча мгновений без усилий. Достичь 100 тиков.', zh: '百次无为的修炼瞬间。达到100个节拍。' },
    objectives: [{ type: 'total_ticks', amount: 100 }],
    reward: { gold: 1000, path_xp: { spirit: 200 } },
    quest_type: 'story',
  },
  {
    title: { en: 'Spirit Vessel Launched', ru: 'Корабль Спущен на Воду', zh: '灵舟首航' },
    description: { en: 'Build your Spirit Vessel — upgrade 3 rooms.', ru: 'Построй Духовный Корабль — улучши 3 комнаты.', zh: '建造你的灵舟，升级3个舱室。' },
    objectives: [{ type: 'craft_item', amount: 3 }],
    reward: { gold: 800, item_name: 'Cloud Silk' },
    quest_type: 'story',
  },
  {
    title: { en: 'Master of Essences', ru: 'Мастер Эссенций', zh: '精华宗师' },
    description: { en: 'Collect 5 boss essences for the Demon Altar.', ru: 'Собери 5 эссенций боссов для Алтаря.', zh: '为炼魔台收集5个Boss精华。' },
    objectives: [{ type: 'collect_essences', amount: 5 }],
    reward: { gold: 2000, item_name: 'Dragon Scale' },
    quest_type: 'story',
  },
  {
    title: { en: 'Known Across the Land', ru: 'Известный по Всей Земле', zh: '名传天下' },
    description: { en: 'Encounter 5 different souls in the mortal realm.', ru: 'Встретить 5 разных душ в смертном мире.', zh: '在凡人世界遇见5个不同的灵魂。' },
    objectives: [{ type: 'meet_npcs', amount: 5 }],
    reward: { gold: 600, path_xp: { trade: 120, scholar: 120 } },
    quest_type: 'story',
  },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateQuests(hero: Hero, heroId: string, locale: 'en' | 'ru' | 'zh'): Omit<Quest, 'id'>[] {
  const now = Date.now();
  const dailyExpiry = new Date(now + 24 * 60 * 60 * 1000).toISOString();
  const weeklyExpiry = new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString();

  const makeObjectives = (template: QuestTemplate): QuestObjective[] =>
    template.objectives.map(obj => {
      const baseline = getBaseline(hero, obj.type);
      return { type: obj.type, amount: obj.amount, baseline, progress: 0 };
    });

  const daily1 = pick(DAILY_TEMPLATES);
  const daily2 = pick(DAILY_TEMPLATES.filter(t => t !== daily1));
  const weekly = pick(WEEKLY_TEMPLATES);
  const story = pick(STORY_TEMPLATES);

  return [
    {
      hero_id: heroId, quest_type: 'daily', status: 'active',
      title: daily1.title[locale], description: daily1.description[locale],
      objectives: makeObjectives(daily1), reward: daily1.reward,
      expires_at: dailyExpiry, created_at: new Date().toISOString(),
    },
    {
      hero_id: heroId, quest_type: 'daily', status: 'active',
      title: daily2.title[locale], description: daily2.description[locale],
      objectives: makeObjectives(daily2), reward: daily2.reward,
      expires_at: dailyExpiry, created_at: new Date().toISOString(),
    },
    {
      hero_id: heroId, quest_type: 'weekly', status: 'active',
      title: weekly.title[locale], description: weekly.description[locale],
      objectives: makeObjectives(weekly), reward: weekly.reward,
      expires_at: weeklyExpiry, created_at: new Date().toISOString(),
    },
    {
      hero_id: heroId, quest_type: 'story', status: 'active',
      title: story.title[locale], description: story.description[locale],
      objectives: makeObjectives(story), reward: story.reward,
      created_at: new Date().toISOString(),
    },
  ];
}

function getBaseline(hero: Hero, type: QuestObjType): number {
  switch (type) {
    case 'kill_enemies': return hero.total_enemies_killed;
    case 'collect_gold': return hero.gold;
    case 'complete_dungeon': return hero.total_dungeons_completed;
    case 'craft_item': return hero.total_items_crafted;
    case 'total_ticks': return hero.total_ticks;
    default: return 0;
  }
}

export function checkQuestProgress(quest: Quest, hero: Hero, npcCount: number, resonanceCount: number, feedCount: number, incomeCount: number): Quest {
  const updatedObjectives = quest.objectives.map(obj => {
    let current = 0;
    switch (obj.type) {
      case 'kill_enemies': current = hero.total_enemies_killed - obj.baseline; break;
      case 'collect_gold': current = Math.max(0, hero.gold - obj.baseline); break;
      case 'complete_dungeon': current = hero.total_dungeons_completed - obj.baseline; break;
      case 'craft_item': current = hero.total_items_crafted - obj.baseline; break;
      case 'total_ticks': current = hero.total_ticks - obj.baseline; break;
      case 'meet_npcs': current = npcCount; break;
      case 'send_resonance': current = resonanceCount; break;
      case 'feed_pet': current = feedCount; break;
      case 'collect_income': current = incomeCount; break;
      case 'collect_essences': current = 0; break; // tracked separately
      default: current = obj.progress;
    }
    return { ...obj, progress: Math.min(current, obj.amount) };
  });

  const allMet = updatedObjectives.every(o => o.progress >= o.amount);
  const isExpired = quest.expires_at ? new Date(quest.expires_at) < new Date() : false;

  return {
    ...quest,
    objectives: updatedObjectives,
    status: allMet ? 'completed' : isExpired ? 'expired' : quest.status,
  };
}
