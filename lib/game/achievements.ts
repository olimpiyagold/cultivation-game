import type { Hero, Pet, Ark, Pavilion, BossLab, NPCMemory, Item, DiaryLog, AchievementCategory, CultivationPathKey } from './types';

export interface AchievementCheckState {
  hero: Hero;
  logs: DiaryLog[];
  pet: Pet | null;
  ark: Ark | null;
  pavilion: Pavilion | null;
  bossLab: BossLab | null;
  npcMemories: NPCMemory[];
  inventory: Item[];
  unlockedKeys: Set<string>;
  resonanceCount: number;
}

export interface AchievementDef {
  key: string;
  icon: string;
  category: AchievementCategory;
  name: Record<'en' | 'ru' | 'zh', string>;
  description: Record<'en' | 'ru' | 'zh', string>;
  check: (s: AchievementCheckState) => boolean;
  secret?: boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // === COMBAT ===
  {
    key: 'first_blood', icon: '⚔', category: 'combat',
    name: { en: 'First Strike', ru: 'Первый Удар', zh: '初战' },
    description: { en: 'Win your first combat', ru: 'Победить в первом бою', zh: '赢得第一场战斗' },
    check: s => s.hero.total_enemies_killed >= 1,
  },
  {
    key: 'demon_slayer', icon: '🗡', category: 'combat',
    name: { en: 'Demon Slayer', ru: 'Убийца Демонов', zh: '斩妖除魔' },
    description: { en: 'Defeat 50 enemies', ru: 'Победить 50 врагов', zh: '击败50个敌人' },
    check: s => s.hero.total_enemies_killed >= 50,
  },
  {
    key: 'hundred_battles', icon: '🏆', category: 'combat',
    name: { en: 'Iron Will', ru: 'Железная Воля', zh: '百战不殆' },
    description: { en: 'Defeat 100 enemies', ru: 'Победить 100 врагов', zh: '击败100个敌人' },
    check: s => s.hero.total_enemies_killed >= 100,
  },
  {
    key: 'essence_collector', icon: '💎', category: 'combat',
    name: { en: 'Essence Reaper', ru: 'Жнец Эссенций', zh: '采灵者' },
    description: { en: 'Collect 5 boss essences', ru: 'Собрать 5 эссенций боссов', zh: '收集5个Boss精华' },
    check: s => (s.bossLab?.essences?.length ?? 0) >= 5,
  },
  {
    key: 'minion_master', icon: '👾', category: 'combat',
    name: { en: 'Demon Refiner', ru: 'Укротитель Демонов', zh: '炼魔宗师' },
    description: { en: 'Craft 3 minions at the Demon Altar', ru: 'Создать 3 миньона на Алтаре', zh: '在炼魔台制造3个傀儡' },
    check: s => (s.bossLab?.total_crafted ?? 0) >= 3,
  },

  // === EXPLORATION ===
  {
    key: 'first_dungeon', icon: '🗺', category: 'exploration',
    name: { en: 'Cave Crawler', ru: 'Первопроходец', zh: '地宫探险家' },
    description: { en: 'Complete your first dungeon', ru: 'Завершить первое подземелье', zh: '完成第一个地宫' },
    check: s => s.hero.total_dungeons_completed >= 1,
  },
  {
    key: 'dungeon_master', icon: '🏯', category: 'exploration',
    name: { en: 'Dungeon Lord', ru: 'Владыка Подземелий', zh: '地宫领主' },
    description: { en: 'Complete 5 dungeons', ru: 'Завершить 5 подземелий', zh: '完成5个地宫' },
    check: s => s.hero.total_dungeons_completed >= 5,
  },
  {
    key: 'celestial_entered', icon: '✨', category: 'exploration',
    name: { en: 'Heaven Trespasser', ru: 'Небесный Нарушитель', zh: '闯天穹' },
    description: { en: 'Enter the Heavenly Vault dungeon', ru: 'Войти в Небесный Свод', zh: '进入天穹秘境' },
    check: s => s.logs.some(l => l.log_text.includes('Heavenly Vault') || l.log_text.includes('天穹')),
  },
  {
    key: 'loot_hoarder', icon: '🎁', category: 'exploration',
    name: { en: 'Loot Hoarder', ru: 'Собиратель Добычи', zh: '囤货达人' },
    description: { en: 'Collect 20 items total', ru: 'Собрать 20 предметов', zh: '共收集20件物品' },
    check: s => s.inventory.length >= 20,
  },
  {
    key: 'world_traveler', icon: '🌍', category: 'exploration',
    name: { en: 'World Wanderer', ru: 'Странник Мира', zh: '天涯旅人' },
    description: { en: 'Accumulate 500 game ticks', ru: 'Накопить 500 тиков', zh: '累积500个游戏节拍' },
    check: s => s.hero.total_ticks >= 500,
  },

  // === CULTIVATION ===
  {
    key: 'foundation_reached', icon: '⛩', category: 'cultivation',
    name: { en: 'True Foundation', ru: 'Истинный Фундамент', zh: '真正筑基' },
    description: { en: 'Advance to Foundation Establishment', ru: 'Достичь Закладки Основы', zh: '进阶至筑基期' },
    check: s => s.hero.stage.includes('Foundation') || s.hero.stage.includes('Core') || s.hero.stage.includes('Nascent'),
  },
  {
    key: 'balanced_soul', icon: '☯', category: 'cultivation',
    name: { en: 'Balanced Soul', ru: 'Уравновешенная Душа', zh: '阴阳平衡' },
    description: { en: 'Achieve perfect Yin/Yang balance', ru: 'Достичь баланса Инь/Ян', zh: '达到完美的阴阳平衡' },
    check: s => Math.abs(s.hero.yin_yang) <= 5,
  },
  {
    key: 'path_seeker', icon: '🛤', category: 'cultivation',
    name: { en: 'Path Seeker', ru: 'Искатель Пути', zh: '寻道者' },
    description: { en: 'Reach level 5 in any Dao path', ru: 'Достичь 5 уровня любого пути', zh: '任一道途达到5级' },
    check: s => Object.values(s.hero.cultivation_paths).some(p => p.level >= 5),
  },
  {
    key: 'five_paths', icon: '⭐', category: 'cultivation',
    name: { en: 'Five Paths Master', ru: 'Мастер Пяти Путей', zh: '五道圆满' },
    description: { en: 'Reach level 3 in all 5 Dao paths', ru: 'Достичь 3 уровня всех 5 путей', zh: '五种道途均达到3级' },
    check: s => Object.values(s.hero.cultivation_paths).every(p => p.level >= 3),
  },
  {
    key: 'resonance_adept', icon: '🔮', category: 'cultivation',
    name: { en: 'Resonance Adept', ru: 'Мастер Резонанса', zh: '共鸣大师' },
    description: { en: 'Trigger Dao Resonance 10 times', ru: 'Вызвать Дао-Резонанс 10 раз', zh: '触发10次道法共鸣' },
    check: s => s.resonanceCount >= 10,
  },

  // === SOCIAL ===
  {
    key: 'first_npc', icon: '🤝', category: 'social',
    name: { en: 'First Encounter', ru: 'Первая Встреча', zh: '初次相遇' },
    description: { en: 'Meet your first NPC', ru: 'Встретить первого NPC', zh: '遇见第一个NPC' },
    check: s => s.npcMemories.length >= 1,
  },
  {
    key: 'networker', icon: '🌐', category: 'social',
    name: { en: 'Networker', ru: 'Нетворкер', zh: '广结善缘' },
    description: { en: 'Meet 5 different NPCs', ru: 'Встретить 5 разных NPC', zh: '认识5个不同NPC' },
    check: s => s.npcMemories.length >= 5,
  },
  {
    key: 'beast_bond', icon: '🦊', category: 'social',
    name: { en: 'Spirit Bond', ru: 'Духовная Связь', zh: '灵宠情谊' },
    description: { en: 'Your pet reaches level 5', ru: 'Питомец достигает 5 уровня', zh: '灵宠达到5级' },
    check: s => (s.pet?.level ?? 0) >= 5,
  },
  {
    key: 'pavilion_open', icon: '🏪', category: 'social',
    name: { en: 'Open for Business', ru: 'Открыто для Торговли', zh: '开张大吉' },
    description: { en: 'Collect first income from your pavilion', ru: 'Собрать первый доход с павильона', zh: '首次从灵市收取收益' },
    check: s => (s.pavilion?.total_earned ?? 0) >= 1,
  },
  {
    key: 'market_mogul', icon: '💰', category: 'social',
    name: { en: 'Market Mogul', ru: 'Торговый Магнат', zh: '市场大亨' },
    description: { en: 'Earn 5000 spirit stones from pavilion', ru: 'Заработать 5000 духовных камней в павильоне', zh: '从灵市赚取5000灵石' },
    check: s => (s.pavilion?.total_earned ?? 0) >= 5000,
  },

  // === LEGACY ===
  {
    key: 'lazy_champion', icon: '😴', category: 'legacy',
    name: { en: 'True Laziness', ru: 'Истинная Лень', zh: '真正的懒' },
    description: { en: '100 ticks with fewer than 5 commands', ru: '100 тиков при менее чем 5 командах', zh: '100节拍内命令数少于5' },
    check: s => s.hero.total_ticks >= 100 && s.hero.commands_sent < 5,
    secret: true,
  },
  {
    key: 'millennium', icon: '🌟', category: 'legacy',
    name: { en: 'One Thousand Lives', ru: 'Тысяча Жизней', zh: '千年一遇' },
    description: { en: 'Accumulate 1000 game ticks', ru: 'Накопить 1000 тиков игры', zh: '累积1000个游戏节拍' },
    check: s => s.hero.total_ticks >= 1000,
  },
  {
    key: 'ark_complete', icon: '⛵', category: 'legacy',
    name: { en: 'Celestial Vessel', ru: 'Небесный Корабль', zh: '天地灵舟' },
    description: { en: 'Max all Spirit Vessel rooms', ru: 'Максимизировать все комнаты Корабля', zh: '将灵舟所有舱室升至满级' },
    check: s => s.ark ? (['cabin_level','engine_level','armory_level','garden_level','workshop_level'] as const).every(k => (s.ark as unknown as Record<string, number>)[k] >= 3) : false,
  },
  {
    key: 'spirit_millionaire', icon: '👑', category: 'legacy',
    name: { en: 'Spirit Millionaire', ru: 'Духовный Миллионер', zh: '灵石富翁' },
    description: { en: 'Earn 10000 spirit stones total', ru: 'Заработать 10000 духовных камней', zh: '总共赚取10000灵石' },
    check: s => s.hero.total_gold_earned >= 10000,
  },
  {
    key: 'nascent_soul', icon: '🌙', category: 'legacy',
    name: { en: 'Nascent Soul', ru: 'Юань-Шэнь', zh: '元婴境' },
    description: { en: 'Reach the Nascent Soul realm', ru: 'Достичь уровня Юань-Шэнь', zh: '突破至元婴境' },
    check: s => s.hero.stage.includes('Nascent') || s.hero.stage.includes('Spirit Severing'),
    secret: false,
  },
];

export function getNewAchievements(state: AchievementCheckState): AchievementDef[] {
  return ACHIEVEMENTS.filter(def => !state.unlockedKeys.has(def.key) && def.check(state));
}
