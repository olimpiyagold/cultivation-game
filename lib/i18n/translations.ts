export type Locale = 'en' | 'ru' | 'zh';

export const translations = {
  en: {
    appName: 'Lazy Dao',
    tabs: { cultivation: 'Cultivate', world: 'World', sect: 'Sect', bag: 'Bag', profile: 'Oracle' },
    cultivation: {
      title: 'Cultivation Chamber', hp: 'Life Force', gold: 'Spirit Stones', stage: 'Realm',
      strength: 'Str', agility: 'Agi', spirit: 'Spr', luck: 'Lck',
      diary: 'Fate Chronicle', active: 'Cultivating...', paused: 'Resting...',
      yin: 'Yin', yang: 'Yang', balanced: 'Balanced', yinYang: 'Yin/Yang Balance',
      paths: 'Dao Paths', fatePath: 'Destiny', totalTicks: 'Lifetimes',
    },
    paths: { sword: 'Sword Dao', alchemy: 'Alchemy', trade: 'Merchant', spirit: 'Spirit', scholar: 'Scholar' },
    fate: { sword: 'Blade Destiny', alchemy: 'Elixir Destiny', merchant: 'Wealth Destiny', hermit: 'Solitude Destiny', demon: 'Demon Destiny', unknown: 'Veiled Fate' },
    world: {
      title: 'The Mortal Realm', currentZone: 'Current Zone', dungeon: 'Dungeon',
      enterDungeon: 'Enter Dungeon', exitDungeon: 'Retreat', floor: 'Floor',
      boss: 'Boss Awaits', exploring: 'Exploring...', cleared: 'Cleared!',
      failed: 'Defeated...', selectDungeon: 'Choose a dungeon to explore',
      enemies: 'Slain', loot: 'Loot Acquired',
      dungeons: {
        cave: 'Shadow Bone Cave', ruins: 'Ancient Celestial Ruins',
        cloudtop: 'Cloud Peak Labyrinth', abyss: 'Abyssal Demon Gate',
        celestial: 'Heavenly Vault',
      },
      zones: ['Mortal Valley', 'Bamboo Forest', 'Misty Mountains', 'Thunder Peaks', 'Celestial Sea'],
    },
    sect: {
      title: 'Lazy Cloud Sect', ark: 'Spirit Vessel', pavilion: 'Spirit Market',
      bossLab: 'Demon Altar', upgrade: 'Upgrade', collect: 'Collect Income',
      essences: 'Essences', craft: 'Refine Minion', income: 'Income/tick',
      rooms: { cabin: 'Cabin', engine: 'Engine Room', armory: 'Armory', garden: 'Spirit Garden', workshop: 'Workshop' },
      roomDesc: {
        cabin: '+10 Max HP per level',
        engine: '+1 tick speed per level',
        armory: '+5 combat power per level',
        garden: '+5 alchemy power per level',
        workshop: '+3 gold income per level',
      },
      materials: { celestial_wood: 'Celestial Wood', spirit_iron: 'Spirit Iron', cloud_silk: 'Cloud Silk', dragon_scale: 'Dragon Scale' },
      voyages: 'Voyages', staffHired: 'Staff Hired', totalEarned: 'Total Earned',
      activeMinion: 'Active Minion', noMinion: 'No minion crafted yet',
      noEssences: 'Collect boss essences from dungeons to craft here',
      shopTypes: { pill: 'Pill Emporium', equipment: 'Gear Bazaar', talisman: 'Talisman Hall' },
    },
    bag: {
      title: 'Worldly Possessions', inventory: 'Inventory', equipment: 'Equipment',
      alchemy: 'Alchemy', empty: 'Empty bag. The Dao provides...',
      equip: 'Equip', unequip: 'Remove', slots: {
        weapon: 'Weapon', offhand: 'Off-Hand', helmet: 'Helmet',
        armor: 'Armor', boots: 'Boots', accessory1: 'Ring I', accessory2: 'Ring II',
      },
      combineHint: 'Select 2 items to combine',
      combine: 'Combine',
    },
    chat: { title: 'Heavenly Oracle', placeholder: 'Speak to your cultivator...', send: 'Send', thinking: 'Channeling the Dao...' },
    settings: {
      title: 'Worldly Possessions', language: 'Language', theme: 'Theme',
      darkMode: 'Ink Wash Mode', lightMode: 'Rice Paper Mode',
      heroName: 'Dao Name', npcMemories: 'Known Souls',
    },
    events: {
      combat: [
        'Fought a demonic beast and barely survived!',
        'Defeated a rogue cultivator on the mountain path.',
        'Clashed with a spirit fox — it escaped!',
        'Ambushed by bandits. Dispatched them lazily.',
        'Sparred with a fellow disciple. Lost gracefully.',
        'A wandering demon elder challenged me. I won by falling asleep first.',
        'Battled three Bone Fiends at the crossroads. Collected their remains.',
        'Encountered an enraged spirit wolf. Calmed it with a spirit pill.',
      ],
      loot: [
        'Found a spirit stone by the river.',
        'Discovered a forgotten storage ring!',
        'Picked up a low-grade healing pill.',
        'Stumbled upon an ancient technique scroll.',
        'Looted a bandit camp. Modest haul.',
        'Found celestial wood beneath a thousand-year oak.',
        'A spirit iron vein discovered during a "nap".',
        'Recovered cloud silk from an abandoned crane nest.',
      ],
      rest: [
        'Meditated under the moonlight. Qi flows smoothly.',
        'Napped beneath a thousand-year willow tree.',
        'Absorbed ambient Qi while fishing lazily.',
        'Dozed off reading "The Lazy Immortal\'s Manual."',
        'Sat in lotus position. Contemplated doing nothing.',
        'Rested by a spiritual spring. Life force fully restored.',
        'Cloud-gazing on Misty Peak. Accidentally entered minor trance.',
        'Ate spirit peaches. Fell asleep. Woke up slightly more immortal.',
      ],
      dungeon: [
        'Descended to floor {n} of the {dungeon}.',
        'Slew the floor guardian of {dungeon} floor {n}.',
        'Discovered a hidden chamber on floor {n}!',
        'The {dungeon} floor {n} boss dropped a rare essence!',
        'Cleared {dungeon} floor {n}. The silence is suspicious.',
      ],
      chain: [
        'The bandits from last time returned — with friends.',
        'That merchant I helped sends a reward box.',
        'The spirit fox from before has joined as a companion!',
        'That elder\'s disciple seeks revenge for yesterday\'s defeat.',
        'Word of my deeds reaches the Sect. An elder takes notice.',
      ],
      pet: [
        '{pet} hunted a rabbit spirit while you were meditating.',
        '{pet} found a shiny item and dragged it over proudly.',
        '{pet} scared away a demon that was eyeing your camp.',
        '{pet} is hungry. Fed it a spirit pill. It looked unimpressed.',
        '{pet} leveled up! Its fur now glows faintly.',
      ],
    },
  },
  ru: {
    appName: 'Ленивое Дао',
    tabs: { cultivation: 'Культивация', world: 'Мир', sect: 'Секта', bag: 'Сумка', profile: 'Оракул' },
    cultivation: {
      title: 'Зал Культивации', hp: 'Жизненная Сила', gold: 'Духовные Камни', stage: 'Уровень',
      strength: 'Сил', agility: 'Лов', spirit: 'Дух', luck: 'Уда',
      diary: 'Хроника Судьбы', active: 'Культивирует...', paused: 'Отдыхает...',
      yin: 'Инь', yang: 'Ян', balanced: 'Баланс', yinYang: 'Баланс Инь/Ян',
      paths: 'Пути Дао', fatePath: 'Судьба', totalTicks: 'Жизней',
    },
    paths: { sword: 'Путь Меча', alchemy: 'Алхимия', trade: 'Торговец', spirit: 'Дух', scholar: 'Учёный' },
    fate: { sword: 'Судьба Клинка', alchemy: 'Судьба Эликсира', merchant: 'Судьба Богатства', hermit: 'Судьба Отшельника', demon: 'Демонская Судьба', unknown: 'Скрытая Судьба' },
    world: {
      title: 'Смертный Мир', currentZone: 'Текущая Зона', dungeon: 'Подземелье',
      enterDungeon: 'Войти', exitDungeon: 'Отступить', floor: 'Этаж',
      boss: 'Босс Ждёт', exploring: 'Исследует...', cleared: 'Очищено!',
      failed: 'Побеждён...', selectDungeon: 'Выберите подземелье',
      enemies: 'Убито', loot: 'Добыча',
      dungeons: {
        cave: 'Пещера Теневых Костей', ruins: 'Небесные Руины',
        cloudtop: 'Лабиринт Облачного Пика', abyss: 'Демонские Врата',
        celestial: 'Небесный Свод',
      },
      zones: ['Смертная Долина', 'Бамбуковый Лес', 'Туманные Горы', 'Громовые Вершины', 'Небесное Море'],
    },
    sect: {
      title: 'Секта Ленивого Облака', ark: 'Духовный Корабль', pavilion: 'Духовный Рынок',
      bossLab: 'Демонический Алтарь', upgrade: 'Улучшить', collect: 'Собрать доход',
      essences: 'Эссенции', craft: 'Создать Миньона', income: 'Доход/тик',
      rooms: { cabin: 'Каюта', engine: 'Машинное отделение', armory: 'Оружейная', garden: 'Духовный Сад', workshop: 'Мастерская' },
      roomDesc: {
        cabin: '+10 Макс. ХП за уровень',
        engine: '+1 скорость тика',
        armory: '+5 сила боя',
        garden: '+5 алхимия',
        workshop: '+3 доход золота',
      },
      materials: { celestial_wood: 'Небесное Дерево', spirit_iron: 'Духовное Железо', cloud_silk: 'Облачный Шёлк', dragon_scale: 'Чешуя Дракона' },
      voyages: 'Походов', staffHired: 'Нанято', totalEarned: 'Заработано',
      activeMinion: 'Активный Миньон', noMinion: 'Нет созданного миньона',
      noEssences: 'Собирайте эссенции боссов в подземельях',
      shopTypes: { pill: 'Лавка Пилюль', equipment: 'Базар Снаряжения', talisman: 'Зал Талисманов' },
    },
    bag: {
      title: 'Мирские Вещи', inventory: 'Инвентарь', equipment: 'Снаряжение',
      alchemy: 'Алхимия', empty: 'Пустая сумка. Дао обеспечит...',
      equip: 'Надеть', unequip: 'Снять', slots: {
        weapon: 'Оружие', offhand: 'Левая рука', helmet: 'Шлем',
        armor: 'Доспех', boots: 'Сапоги', accessory1: 'Кольцо I', accessory2: 'Кольцо II',
      },
      combineHint: 'Выберите 2 предмета для комбинирования',
      combine: 'Объединить',
    },
    chat: { title: 'Небесный Оракул', placeholder: 'Обратитесь к культиватору...', send: 'Послать', thinking: 'Постигает Дао...' },
    settings: {
      title: 'Мирские Вещи', language: 'Язык', theme: 'Тема',
      darkMode: 'Тушь и Вода', lightMode: 'Рисовая Бумага',
      heroName: 'Имя Дао', npcMemories: 'Знакомые Души',
    },
    events: {
      combat: [
        'Сразился с демоническим зверем и едва выжил!',
        'Победил разбойника-культиватора на горной тропе.',
        'Столкнулся с духовной лисой — она сбежала!',
        'Попал в засаду бандитов. Лениво их разгромил.',
        'Спарринг с учеником. Проиграл с достоинством.',
        'Демонический старейшина бросил вызов. Победил, заснув первым.',
        'Сразился с тремя Костяными Фиендами. Собрал их останки.',
        'Встретил разъярённого духовного волка. Успокоил пилюлей.',
      ],
      loot: [
        'Нашёл духовный камень у реки.',
        'Обнаружил забытое пространственное кольцо!',
        'Подобрал целебную пилюлю низкого ранга.',
        'Наткнулся на свиток древней техники.',
        'Разграбил лагерь бандитов. Скромная добыча.',
        'Нашёл небесное дерево под тысячелетним дубом.',
        'Обнаружил жилу духовного железа во время "отдыха".',
        'Нашёл облачный шёлк в заброшенном гнезде журавля.',
      ],
      rest: [
        'Медитировал под лунным светом. Ци течёт ровно.',
        'Задремал под тысячелетней ивой.',
        'Впитывал Ци, лениво рыбача на озере.',
        'Уснул за чтением "Руководства Ленивого Бессмертного."',
        'Сел в позу лотоса. Размышлял о безделье.',
        'Отдыхал у духовного источника. Силы полностью восстановлены.',
        'Любовался облаками на Туманном Пике. Случайно вошёл в транс.',
        'Ел духовные персики. Уснул. Проснулся немного бессмертнее.',
      ],
      dungeon: [
        'Спустился на {n} этаж {dungeon}.',
        'Убил стражника этажа {n} в {dungeon}.',
        'Обнаружил скрытую камеру на этаже {n}!',
        'Босс {n} этажа {dungeon} выронил редкую эссенцию!',
        'Очистил {n} этаж {dungeon}. Тишина подозрительная.',
      ],
      chain: [
        'Бандиты из прошлого раза вернулись — с подкреплением.',
        'Тот торговец, которому помог, прислал награду.',
        'Духовная лиса из прошлого раза присоединилась как спутник!',
        'Ученик того старейшины мстит за вчерашнее поражение.',
        'Слухи о деяниях дошли до Секты. Старейшина обратил внимание.',
      ],
      pet: [
        '{pet} поймал кроличьего духа пока ты медитировал.',
        '{pet} нашёл блестящий предмет и гордо притащил.',
        '{pet} отпугнул демона, следившего за лагерем.',
        '{pet} был голоден. Накормил духовной пилюлей. Выглядел недовольным.',
        '{pet} вырос в уровне! Шерсть теперь слабо светится.',
      ],
    },
  },
  zh: {
    appName: '懒道',
    tabs: { cultivation: '修炼', world: '天下', sect: '宗门', bag: '储物', profile: '天机' },
    cultivation: {
      title: '修炼密室', hp: '生命力', gold: '灵石', stage: '境界',
      strength: '力', agility: '敏', spirit: '灵', luck: '运',
      diary: '命运记录', active: '修炼中...', paused: '入定中...',
      yin: '阴', yang: '阳', balanced: '平衡', yinYang: '阴阳平衡',
      paths: '道途', fatePath: '天命', totalTicks: '历经',
    },
    paths: { sword: '剑道', alchemy: '炼丹', trade: '商道', spirit: '灵道', scholar: '文道' },
    fate: { sword: '剑仙命格', alchemy: '丹师命格', merchant: '财神命格', hermit: '隐士命格', demon: '魔道命格', unknown: '天机未泄' },
    world: {
      title: '凡俗世界', currentZone: '当前区域', dungeon: '地宫',
      enterDungeon: '进入地宫', exitDungeon: '撤退', floor: '层',
      boss: '首领等候', exploring: '探索中...', cleared: '已清！',
      failed: '落败...', selectDungeon: '选择地宫进行探索',
      enemies: '击杀', loot: '获得战利品',
      dungeons: {
        cave: '影骨洞窟', ruins: '古天遗迹',
        cloudtop: '云巅迷宫', abyss: '渊魔之门',
        celestial: '天穹秘境',
      },
      zones: ['凡人谷', '竹海', '云雾山脉', '雷峰', '仙海'],
    },
    sect: {
      title: '懒云宗', ark: '灵舟', pavilion: '灵市',
      bossLab: '炼魔台', upgrade: '升级', collect: '收取收益',
      essences: '精华', craft: '炼制傀儡', income: '收益/跳',
      rooms: { cabin: '船舱', engine: '动力舱', armory: '武器室', garden: '灵圃', workshop: '工坊' },
      roomDesc: {
        cabin: '每级+10最大生命',
        engine: '每级+1跳速度',
        armory: '每级+5战斗力',
        garden: '每级+5炼丹力',
        workshop: '每级+3灵石收益',
      },
      materials: { celestial_wood: '天木', spirit_iron: '灵铁', cloud_silk: '云丝', dragon_scale: '龙鳞' },
      voyages: '次航行', staffHired: '雇员', totalEarned: '总收益',
      activeMinion: '在役傀儡', noMinion: '尚未炼制傀儡',
      noEssences: '在地宫中收集Boss精华后来此炼制',
      shopTypes: { pill: '丹药铺', equipment: '法器坊', talisman: '符箓堂' },
    },
    bag: {
      title: '身外之物', inventory: '物品栏', equipment: '装备',
      alchemy: '炼丹', empty: '储物袋空空如也。道法自然...',
      equip: '装备', unequip: '卸下', slots: {
        weapon: '武器', offhand: '副手', helmet: '头盔',
        armor: '护甲', boots: '靴子', accessory1: '戒指一', accessory2: '戒指二',
      },
      combineHint: '选择2件物品进行合成',
      combine: '合成',
    },
    chat: { title: '天机阁', placeholder: '与修仙者对话...', send: '传音', thinking: '感悟大道中...' },
    settings: {
      title: '身外之物', language: '语言', theme: '界面',
      darkMode: '水墨风', lightMode: '宣纸风',
      heroName: '道号', npcMemories: '相识之人',
    },
    events: {
      combat: [
        '与妖兽搏斗，险些丧命！',
        '击败了山道上的散修。',
        '与灵狐交手——它跑了！',
        '遭遇劫匪埋伏。懒洋洋地解决了。',
        '与同门切磋，优雅落败。',
        '一位游荡魔修老头叫板，我睡着赢了。',
        '在路口与三只骨灵交战，收集了它们的遗骸。',
        '遭遇暴怒灵狼，用灵丹将其安抚。',
      ],
      loot: [
        '在河边捡到一块灵石。',
        '发现了一枚被遗忘的储物戒！',
        '捡到一颗低阶疗伤丹。',
        '偶然发现一卷古老功法。',
        '洗劫了一个匪窝。收获平平。',
        '在千年古木下发现天木。',
        '"小憩"时发现了一条灵铁矿脉。',
        '在废弃仙鹤巢中找到云丝。',
      ],
      rest: [
        '月下打坐，灵气充盈。',
        '在千年古柳下小憩。',
        '懒洋洋地钓鱼，顺便吸收灵气。',
        '读《懒仙手册》时睡着了。',
        '盘腿而坐，思考无为之道。',
        '在灵泉旁休息，生命力完全恢复。',
        '在雾峰观云，不小心进入了小入定。',
        '吃灵桃，睡着了，醒来更仙了一点。',
      ],
      dungeon: [
        '下到了{dungeon}第{n}层。',
        '击杀了{dungeon}第{n}层守卫。',
        '在第{n}层发现了隐藏密室！',
        '{dungeon}第{n}层Boss掉落稀有精华！',
        '清完{dungeon}第{n}层。这安静有点可疑。',
      ],
      chain: [
        '上次那帮劫匪回来了——带了帮手。',
        '曾经帮过的那个商人送来了答谢礼盒。',
        '上次那只灵狐跑回来要做宠物！',
        '那位长老的弟子来报昨日一败之仇。',
        '事迹传到宗门，一位长老注意到了你。',
      ],
      pet: [
        '{pet}趁你打坐时猎了只兔灵。',
        '{pet}找到一件亮晶晶的东西，骄傲地拖过来了。',
        '{pet}吓跑了一只盯着营地的妖怪。',
        '{pet}饿了，喂了颗灵丹，它看起来不太满意。',
        '{pet}升级了！皮毛现在微微发光。',
      ],
    },
  },
};

export interface TranslationKey {
  appName: string;
  tabs: { cultivation: string; world: string; sect: string; bag: string; profile: string };
  cultivation: {
    title: string; hp: string; gold: string; stage: string;
    strength: string; agility: string; spirit: string; luck: string;
    diary: string; active: string; paused: string;
    yin: string; yang: string; balanced: string; yinYang: string;
    paths: string; fatePath: string; totalTicks: string;
  };
  paths: { sword: string; alchemy: string; trade: string; spirit: string; scholar: string };
  fate: { sword: string; alchemy: string; merchant: string; hermit: string; demon: string; unknown: string };
  world: {
    title: string; currentZone: string; dungeon: string;
    enterDungeon: string; exitDungeon: string; floor: string;
    boss: string; exploring: string; cleared: string;
    failed: string; selectDungeon: string; enemies: string; loot: string;
    dungeons: { cave: string; ruins: string; cloudtop: string; abyss: string; celestial: string };
    zones: string[];
  };
  sect: {
    title: string; ark: string; pavilion: string; bossLab: string;
    upgrade: string; collect: string; essences: string; craft: string; income: string;
    rooms: { cabin: string; engine: string; armory: string; garden: string; workshop: string };
    roomDesc: { cabin: string; engine: string; armory: string; garden: string; workshop: string };
    materials: { celestial_wood: string; spirit_iron: string; cloud_silk: string; dragon_scale: string };
    voyages: string; staffHired: string; totalEarned: string;
    activeMinion: string; noMinion: string; noEssences: string;
    shopTypes: { pill: string; equipment: string; talisman: string };
  };
  bag: {
    title: string; inventory: string; equipment: string; alchemy: string; empty: string;
    equip: string; unequip: string;
    slots: { weapon: string; offhand: string; helmet: string; armor: string; boots: string; accessory1: string; accessory2: string };
    combineHint: string; combine: string;
  };
  chat: { title: string; placeholder: string; send: string; thinking: string };
  settings: { title: string; language: string; theme: string; darkMode: string; lightMode: string; heroName: string; npcMemories: string };
  events: {
    combat: string[]; loot: string[]; rest: string[];
    dungeon: string[]; chain: string[]; pet: string[];
  };
}
