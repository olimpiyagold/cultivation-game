import type { Hero, SectMentor, MentorType, FatePath, CultivationPathKey } from './types';

// Mentor definitions
export interface MentorDef {
  type: MentorType;
  name: Record<'en'|'ru'|'zh', string>;
  title: Record<'en'|'ru'|'zh', string>;
  icon: string;
  primaryColor: string;
  personality: Record<'en'|'ru'|'zh', string>;
}

export const MENTOR_DEFS: Record<MentorType, MentorDef> = {
  strict: {
    type: 'strict',
    name: { en: 'Elder Wang', ru: 'Старейшина Ван', zh: '王长老' },
    title: { en: 'Iron Fist Elder', ru: 'Старейшина Железного Кулака', zh: '铁拳长老' },
    icon: '⚔',
    primaryColor: 'text-crimson',
    personality: {
      en: 'Exacting, demanding, respects strength above all. Hides begrudging pride behind criticism.',
      ru: 'Требовательный, уважает силу превыше всего. Скрывает скрытую гордость за критикой.',
      zh: '严苛，以实力为尊，批评背后藏着不情愿的骄傲。',
    },
  },
  wise: {
    type: 'wise',
    name: { en: 'Scholar Liu', ru: 'Учёный Лю', zh: '刘学士' },
    title: { en: 'Keeper of Ten Thousand Scrolls', ru: 'Хранитель Десяти Тысяч Свитков', zh: '万卷守护者' },
    icon: '📜',
    primaryColor: 'text-amber-500',
    personality: {
      en: 'Philosophical, indirect, speaks in riddles, sees patterns others miss.',
      ru: 'Философский, косвенный, говорит загадками, видит паттерны.',
      zh: '富有哲理，迂回，惯用谜语，能看出别人忽略的规律。',
    },
  },
  chaotic: {
    type: 'chaotic',
    name: { en: 'Mad Jun', ru: 'Безумный Цзюнь', zh: '疯狂君前辈' },
    title: { en: 'The Unpredictable Senior', ru: 'Непредсказуемый Старший', zh: '不可预测的前辈' },
    icon: '🌀',
    primaryColor: 'text-purple-400',
    personality: {
      en: 'Completely unhinged, wise in random bursts, contradicts themselves constantly.',
      ru: 'Полностью невменяемый, мудрый в случайных вспышках.',
      zh: '完全疯癫，随机爆发的智慧，永远自相矛盾。',
    },
  },
  compassionate: {
    type: 'compassionate',
    name: { en: 'Abbess Fei', ru: 'Аббатиса Фэй', zh: '妃庵主' },
    title: { en: 'Healer of Ten Thousand Sorrows', ru: 'Исцелительница Десяти Тысяч Скорбей', zh: '万苦疗愈者' },
    icon: '🌸',
    primaryColor: 'text-jade',
    personality: {
      en: 'Gentle, empathetic, always asks about others before self, makes you feel guilty for violence.',
      ru: 'Мягкая, добрая, спрашивает о других прежде всего.',
      zh: '温柔体贴，总是先问他人，让人为暴力行为感到内疚。',
    },
  },
  merchant: {
    type: 'merchant',
    name: { en: 'Boss Xu', ru: 'Хозяин Сюй', zh: '徐老板' },
    title: { en: 'Master of the Celestial Exchange', ru: 'Мастер Небесной Биржи', zh: '天机交易所掌门' },
    icon: '💰',
    primaryColor: 'text-gold',
    personality: {
      en: 'Everything is a transaction. Pragmatic, profit-obsessed, secretly quite wise.',
      ru: 'Всё — сделка. Прагматичный, одержимый прибылью, тайно мудрый.',
      zh: '一切皆为交易，实用主义，痴迷利润，骨子里颇为睿智。',
    },
  },
};

// Match mentor type to hero fate path
export function assignMentorType(fatePath: FatePath): MentorType {
  const mapping: Record<FatePath, MentorType> = {
    sword:    'strict',
    demon:    'strict',
    alchemy:  'wise',
    hermit:   'chaotic',
    merchant: 'merchant',
    unknown:  'compassionate',
  };
  return mapping[fatePath] || 'chaotic';
}

interface WisdomContext {
  hero: Hero;
  locale: 'en'|'ru'|'zh';
  mentorType: MentorType;
  recentLogText?: string;
}

const WISDOM_TEMPLATES: Record<MentorType, Record<'en'|'ru'|'zh', string[]>> = {
  strict: {
    en: [
      'Your {topPath} is at level {topLevel}. {topAssessment}. A warrior does not rest on adequate. Push further.',
      '{enemiesKilled} enemies defeated. For any disciple of mine, that number would be embarrassing. It is... acceptable. For now.',
      'I have reviewed your diary. The word "napping" appears {restCount} times. Unacceptable. Strength demands wakefulness.',
      'Your Yin/Yang balance of {yinYang} is {balanceDesc}. Chaos in the soul leads to chaos in combat. Fix it.',
      'I notice your spirit beast is level {petLevel}. At least your companion shows effort. Learn from it.',
    ],
    ru: [
      'Ваш {topPath} достиг {topLevel} уровня. {topAssessment}. Воин не почивает на достаточном. Двигайтесь вперёд.',
      '{enemiesKilled} врагов побеждено. Для любого моего ученика эта цифра была бы позорной. Но... приемлемо.',
      'Дисбаланс Инь/Ян в {yinYang} недопустим. Хаос в душе ведёт к хаосу в бою. Исправьте.',
    ],
    zh: [
      '汝的{topPath}已达{topLevel}层。{topAssessment}。武者不应满足于够用，继续精进。',
      '击败了{enemiesKilled}个敌人。若是我的弟子，这个数字会令人汗颜……还算凑合。',
      '阴阳失衡达{yinYang}，灵魂混乱则战斗混乱，速速纠正。',
    ],
  },
  wise: {
    en: [
      'A cultivator with {topLevel} levels in {topPath} is like a river — powerful, but must find its own course.',
      'I see {npcCount} encounters with other souls in your memory. Each encounter is a mirror. What did you see?',
      'Your Yin/Yang is {yinYang}. {balanceDesc}. The ancient texts say: "A perfectly balanced scale weighs nothing and everything."',
      'You have completed {dungeonsCompleted} dungeons. The darkness inside teaches what the light outside cannot.',
      '{totalTicks} moments of cultivation recorded. Every moment was a teacher. Did you listen?',
    ],
    ru: [
      'Культиватор с уровнем {topLevel} в {topPath} подобен реке — мощный, но должен найти свой путь.',
      'Я вижу {npcCount} встреч с другими душами. Каждая встреча — зеркало. Что вы увидели?',
      'Ваш Инь/Ян равен {yinYang}. Древние тексты говорят: "Идеально сбалансированные весы ничего не весят."',
    ],
    zh: [
      '在{topPath}达到{topLevel}层的修士，如同一条河流——强大，但必须找到自己的道途。',
      '你的记忆中有{npcCount}次与他人相遇，每次相遇都是一面镜子，你看到了什么？',
      '阴阳值{yinYang}。古籍有云：完美平衡的秤既轻若无，又重如万物。',
    ],
  },
  chaotic: {
    en: [
      'I was watching you cultivate and I thought: what IS cultivation? Also: why is fire hot? Also: have you eaten today?',
      'Your {topPath} level of {topLevel} is either impressive or terrible. I cannot decide. Both! Neither! The Dao is chaos!',
      'I tried to write you a profound lesson but the ink ran away. Interpret that as you will.',
      '{enemiesKilled} defeated! Or... were THEY defeated? What if you are the enemy? THINK ABOUT IT.',
      'I fell asleep writing this wisdom. Then I woke up and forgot everything. This IS the wisdom.',
    ],
    ru: [
      'Я наблюдал за вашей культивацией и подумал: что ТАКОЕ культивация? И ещё: почему огонь горячий?',
      'Ваш уровень {topPath} в {topLevel} впечатляет или ужасен. Не могу решить. Оба! Ни одно! Дао — хаос!',
      '{enemiesKilled} побеждено! Или... они были побеждены? А вдруг ВЫ враг? ЗАДУМАЙТЕСЬ.',
    ],
    zh: [
      '我看着你修炼，忽然想到：修炼到底是什么？还有：火为什么是热的？还有：你今天吃了吗？',
      '你的{topPath}达到{topLevel}层，这既令人印象深刻又很糟糕。我无法决定。两者都是！都不是！道即混沌！',
      '击败了{enemiesKilled}个！或者……是他们打败了你？如果你才是敌人呢？细思极恐！',
    ],
  },
  compassionate: {
    en: [
      'Your spirit beast is level {petLevel} and seems {petMood}. Tell me — do you spend enough time with them?',
      'I noticed your HP has been quite low recently. Are you taking care of yourself? {hp}/{maxHp} is not healthy.',
      '{enemiesKilled} enemies defeated. Each had a family, a dream, a reason to fight. Does this weigh on you?',
      'Your compassion score of {compassion} warms my heart. But it could be higher. Help more. Fight less.',
      'The sect is peaceful today. Peaceful days are the most important. How are YOU feeling?',
    ],
    ru: [
      'Ваш духовный зверь уровня {petLevel} выглядит {petMood}. Скажите — вы проводите с ним достаточно времени?',
      '{enemiesKilled} врагов побеждено. У каждого была семья, мечта. Вас это не тяготит?',
      'Ваш показатель сострадания {compassion} согревает моё сердце. Но он мог бы быть выше.',
    ],
    zh: [
      '你的灵宠{petLevel}级，心情{petMood}。告诉我——你是否花足够的时间陪伴它？',
      '击败了{enemiesKilled}个敌人，每一个都有家人、有梦想、有战斗的理由，这让你心里难受吗？',
      '你的慈悲值{compassion}让我欣慰，但还可以更高，多帮助他人，少一些争斗。',
    ],
  },
  merchant: {
    en: [
      'Pavilion income: {pavilionIncome} spirit stones total. Respectable for your level. But why stop there?',
      'I calculated your ROI on {topPath} cultivation: {topLevel} levels × time invested = {topLevel}x eventual power. Smart.',
      'Gold hoarding: {gold} spirit stones. Good. Never enough, but good.',
      'The market is currently at {marketActivity}. Sell high, buy low. Elementary, yet most cultivators never learn.',
      'Your laziness score is actually profitable. Less action = less cost = more ROI. You understand business.',
    ],
    ru: [
      'Доход павильона: {pavilionIncome} духовных камней. Приемлемо для вашего уровня. Но почему останавливаться?',
      '{gold} духовных камней в запасе. Хорошо. Никогда не бывает достаточно, но хорошо.',
      'Рынок сейчас на уровне {marketActivity}. Продавайте высоко, покупайте низко. Элементарно, но большинство не учится.',
    ],
    zh: [
      '灵市总收益：{pavilionIncome}枚灵石。以汝之层次尚算不错，但为何止步于此？',
      '储石{gold}枚，不错，但永远不够，还要更多。',
      '目前市场处于{marketActivity}状态，高卖低买，简单道理，却鲜有修士真正领悟。',
    ],
  },
};

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function topPath(hero: Hero): { key: CultivationPathKey; level: number } {
  const entries = Object.entries(hero.cultivation_paths) as [CultivationPathKey, { level: number }][];
  return entries.reduce((best, [k, v]) => v.level > best.level ? { key: k, level: v.level } : best, { key: 'spirit' as CultivationPathKey, level: 1 });
}

const PATH_NAMES: Record<CultivationPathKey, Record<'en'|'ru'|'zh', string>> = {
  sword:   { en: 'Sword Dao', ru: 'Путь Меча', zh: '剑道' },
  alchemy: { en: 'Alchemy', ru: 'Алхимия', zh: '炼丹' },
  trade:   { en: 'Trade Dao', ru: 'Торговый Путь', zh: '商道' },
  spirit:  { en: 'Spirit Dao', ru: 'Духовный Путь', zh: '灵道' },
  scholar: { en: 'Scholar Dao', ru: 'Путь Учёного', zh: '文道' },
};

const ASSESSMENTS = {
  en: { low: 'barely begun', mid: 'shows promise', high: 'becoming respectable', vhigh: 'impressive dedication' },
  ru: { low: 'едва начат', mid: 'перспективен', high: 'становится уважаемым', vhigh: 'впечатляющее посвящение' },
  zh: { low: '刚刚起步', mid: '颇有潜力', high: '已显声望', vhigh: '惊人的专注' },
};

export function generateMentorWisdom(
  mentor: SectMentor,
  hero: Hero,
  locale: 'en'|'ru'|'zh',
  petLevel = 1,
  petMood = 'neutral',
  pavilionIncome = 0,
  marketActivity = 'normal',
): string {
  const templates = WISDOM_TEMPLATES[mentor.mentor_type][locale];
  const template = pick(templates);
  const { key: topKey, level: topLvl } = topPath(hero);
  const balance = Math.abs(hero.yin_yang);
  const assessArr = ASSESSMENTS[locale];
  const assessment = topLvl >= 8 ? assessArr.vhigh : topLvl >= 5 ? assessArr.high : topLvl >= 3 ? assessArr.mid : assessArr.low;
  const balanceDesc = balance < 10 ? 'perfectly balanced' : balance < 30 ? 'slightly off-balance' : 'dangerously unbalanced';

  return template
    .replace('{topPath}', PATH_NAMES[topKey][locale])
    .replace('{topLevel}', String(topLvl))
    .replace('{topAssessment}', assessment)
    .replace('{enemiesKilled}', String(hero.total_enemies_killed ?? 0))
    .replace('{dungeonsCompleted}', String(hero.total_dungeons_completed ?? 0))
    .replace('{totalTicks}', String(hero.total_ticks ?? 0))
    .replace('{npcCount}', '3')
    .replace('{yinYang}', String(hero.yin_yang))
    .replace('{balanceDesc}', balanceDesc)
    .replace('{hp}', String(hero.hp))
    .replace('{maxHp}', String(hero.max_hp))
    .replace('{compassion}', String(hero.psyche.compassion))
    .replace('{gold}', String(hero.gold))
    .replace('{petLevel}', String(petLevel))
    .replace('{petMood}', petMood)
    .replace('{pavilionIncome}', String(pavilionIncome))
    .replace('{marketActivity}', marketActivity)
    .replace('{restCount}', '3');
}

const MENTOR_REACTION_ON_RESONANCE: Record<MentorType, Record<'en'|'ru'|'zh', string[]>> = {
  strict: {
    en: ['You spoke with force. Good. The Dao of strength resonates.', 'Your words have edge. Continue.'],
    ru: ['Вы говорили с силой. Хорошо. Дао силы резонирует.'],
    zh: ['你说话有力，甚好，力量之道共鸣了。'],
  },
  wise: {
    en: ['Words shape reality. You are learning.', 'The resonance you triggered reveals your true nature.'],
    ru: ['Слова формируют реальность. Вы учитесь.'],
    zh: ['言语塑造现实，你正在领悟。'],
  },
  chaotic: {
    en: ['RESONANCE! Or was that just lunch? BOTH!', 'Your words vibrated! Or I imagined it! SAME THING!'],
    ru: ['РЕЗОНАНС! Или это был обед? ОБА!'],
    zh: ['共鸣了！还是我在幻觉？都是！'],
  },
  compassionate: {
    en: ['I felt that resonance. Were your words kind? I hope they were kind.', 'The Dao vibrated with your words. Speak gently next time.'],
    ru: ['Я почувствовала этот резонанс. Ваши слова были добрыми? Надеюсь.'],
    zh: ['我感受到了共鸣，你说的话是善意的吗？希望是。'],
  },
  merchant: {
    en: ['Resonance achieved. That cost you 1 command. ROI?', 'Your words moved the Dao. Did they move any spirit stones?'],
    ru: ['Резонанс достигнут. Стоило ли это 1 команды? Рентабельность?'],
    zh: ['共鸣触发，花了你1次命令，值吗？'],
  },
};

export function getMentorResonanceReaction(mentorType: MentorType, locale: 'en'|'ru'|'zh'): string {
  const lines = MENTOR_REACTION_ON_RESONANCE[mentorType][locale];
  return pick(lines || MENTOR_REACTION_ON_RESONANCE[mentorType].en);
}
