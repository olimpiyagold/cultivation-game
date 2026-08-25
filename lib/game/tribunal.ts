import type { Hero, TribunalCase, TribunalCaseType, Achievement } from './types';

interface JudgmentResult {
  verdict: 'approved' | 'denied' | 'partial';
  judgmentText: string;
  rewardGold: number;
  rewardXp: number;
  penaltyGold: number;
}

const JUDGE_NAMES = ['The Celestial Magistrate', 'Elder of Ten Thousand Laws', 'The Jade Arbiter', 'Heaven\'s Voice', 'The Impartial One'];
function pickJudge() { return JUDGE_NAMES[Math.floor(Math.random() * JUDGE_NAMES.length)]; }

function scorePlea(hero: Hero, caseType: TribunalCaseType, plea: string, achievementCount: number): number {
  let score = 40 + Math.floor(Math.random() * 20); // 40-60 base + randomness
  const p = hero.psyche;
  const balance = Math.abs(hero.yin_yang);
  const pathLevels = Object.values(hero.cultivation_paths).reduce((s, v) => s + v.level, 0);

  switch (caseType) {
    case 'redemption':
      score += Math.floor(p.compassion / 5);       // compassion helps
      score -= Math.floor(p.pride / 8);             // pride hurts
      score += balance < 20 ? 15 : balance < 40 ? 5 : -10; // balance bonus
      score += achievementCount > 5 ? 10 : 0;
      break;
    case 'accusation':
      score += Math.floor(p.pride / 5);             // pride helps
      score += Math.floor(hero.cultivation_paths.sword.level * 2);
      score += hero.total_enemies_killed > 20 ? 15 : hero.total_enemies_killed > 5 ? 5 : -10;
      score -= Math.floor(p.cowardice / 6);
      break;
    case 'defense':
      score += Math.floor(hero.cultivation_paths.scholar.level * 3); // scholar helps defend
      score += Math.floor(p.compassion / 8);
      score += Math.floor(p.curiosity / 8);
      score += plea.length > 100 ? 10 : plea.length > 50 ? 5 : -5; // detailed plea helps
      break;
    case 'glory':
      score += achievementCount * 8; // achievements are everything for glory
      score += pathLevels > 20 ? 15 : pathLevels > 10 ? 8 : 0;
      score += hero.total_dungeons_completed * 3;
      score -= p.cowardice > 60 ? 15 : 0; // cowards shouldn't seek glory
      break;
  }
  return Math.max(0, Math.min(100, score));
}

const JUDGMENTS: Record<TribunalCaseType, Record<'approved' | 'partial' | 'denied', Record<'en'|'ru'|'zh', string[]>>> = {
  redemption: {
    approved: {
      en: [
        'The Heavenly Court is moved by your sincerity. Your compassionate heart speaks louder than your past transgressions. Redemption granted. Fortune favors the humble.',
        'The Jade Arbiter has reviewed your case. The balance of your soul satisfies celestial law. Your burden is lifted. Walk forward without guilt.',
        'A soul this balanced rarely requires judgment. The Heavenly Court blesses your continued cultivation. May the Dao guide your next steps.',
      ],
      ru: [
        'Небесный Суд тронут вашей искренностью. Сострадательное сердце говорит громче прошлых прегрешений. Прощение даровано.',
        'Нефритовый Арбитр рассмотрел дело. Баланс вашей души удовлетворяет небесному закону. Ваше бремя снято.',
        'Столь уравновешенная душа редко нуждается в суде. Небесный Суд благословляет вашу дальнейшую культивацию.',
      ],
      zh: [
        '天庭深为汝之诚意所动。慈悲之心胜过往昔罪愆，准予赎罪，赐福于谦逊者。',
        '玉公断仔细审阅此案，你的灵魂平衡令天道满意，重负已卸，从容前行。',
        '如此平衡的灵魂罕需裁判，天庭祝汝修炼顺遂，愿大道引领前路。',
      ],
    },
    partial: {
      en: [
        'The Court acknowledges your remorse, though your soul\'s balance leaves something to be desired. A partial blessing — enough to ease the burden, not remove it.',
        'Halfway redeemed. The other half you must earn through your own cultivation. The Heavenly Court gives partial favor and full advice: improve.',
      ],
      ru: [
        'Суд признаёт ваше раскаяние, хотя баланс вашей души оставляет желать лучшего. Частичное благословение — достаточно для облегчения бремени.',
        'Наполовину искупили. Вторую половину заработайте сами. Суд даёт частичное благоволение.',
      ],
      zh: [
        '天庭认可汝之悔意，然灵魂平衡尚有不足。赐予半分祝福，足以减轻负担，但尚未完全清算。',
        '赎了一半，另一半须靠自身修炼换来。天庭赐半分恩赐，望汝精进。',
      ],
    },
    denied: {
      en: [
        'The Heavenly Court has seen through your plea. Pride still blackens your cultivation. Return when genuine humility has taken root. Case denied.',
        'Your soul\'s imbalance is evident. Redemption cannot be purchased with words alone. The Court denies and recommends extensive meditation.',
      ],
      ru: [
        'Небесный Суд раскрыл вашу уловку. Гордость по-прежнему отравляет вашу культивацию. Вернитесь когда истинное смирение укоренится. Дело отклонено.',
        'Дисбаланс вашей души очевиден. Искупление словами не купишь. Суд отклоняет и рекомендует длительную медитацию.',
      ],
      zh: [
        '天庭洞察了你的心机，傲气犹如乌云遮蔽修行，等到真正谦逊之时再来。驳回。',
        '灵魂失衡显而易见，赎罪岂止言语可买？天庭驳回并建议广泛打坐。',
      ],
    },
  },
  accusation: {
    approved: {
      en: [
        'The accusation is found to have merit. The Heavenly Court rules in your favor. Combat compensation awarded. The accused should have known better.',
        'Your battle record speaks clearly. The Court upholds the accusation. Justice is served with spirit stones attached.',
      ],
      ru: [
        'Обвинение признано обоснованным. Небесный Суд выносит решение в вашу пользу. Боевая компенсация присуждена.',
        'Ваш боевой послужной список говорит сам за себя. Суд подтверждает обвинение. Справедливость восстановлена.',
      ],
      zh: [
        '诉状有据可查，天庭裁定汝胜诉，战斗补偿已裁定。被告本不该如此。',
        '战绩说话，天庭支持此诉状，公道已伸张，赔偿随附。',
      ],
    },
    partial: {
      en: ['Evidence is present but incomplete. The Court issues a partial ruling — the accused owes you something, but not everything.'],
      ru: ['Доказательства есть, но неполные. Суд выносит частичное решение.'],
      zh: ['证据不完整，天庭作出部分裁决，被告欠汝一些，但非全部。'],
    },
    denied: {
      en: [
        'The accusation lacks substance. The Heavenly Court finds it frivolous and dismisses it. The accuser is advised to fight their own battles.',
        'Combat record insufficient to support this bold accusation. Case dismissed. Perhaps train more before accusing celestial forces.',
      ],
      ru: ['Обвинение лишено оснований. Суд отклоняет его как пустяковое.'],
      zh: ['诉状缺乏依据，天庭视其为无聊诉讼，予以驳回。建议原告自行解决争端。'],
    },
  },
  defense: {
    approved: {
      en: [
        'Your defense is eloquent and legally sound. The Court clears you of all charges. The scholar path has served you well today.',
        'Words sharper than any sword. All accusations dismissed. The Court notes your exceptional defense for the celestial records.',
      ],
      ru: ['Ваша защита красноречива и юридически верна. Суд снимает с вас все обвинения.'],
      zh: ['辩护雄辩有力，法理周全，天庭宣告无罪，学识今日助汝一臂之力。'],
    },
    partial: {
      en: ['The defense is accepted in part. Some charges remain, but the worst is dismissed. Continue cultivating your scholarly path.'],
      ru: ['Защита частично принята. Некоторые обвинения остаются, но худшее снято.'],
      zh: ['辩护部分成立，部分指控仍在，但最重的已撤销。继续修行文道。'],
    },
    denied: {
      en: ['The defense is unconvincing. The Court finds the arguments weak. Perhaps invest in the Scholar path before your next trial.'],
      ru: ['Защита неубедительна. Суд находит аргументы слабыми.'],
      zh: ['辩护不具说服力，天庭认为论据薄弱，下次受审前或可修习文道。'],
    },
  },
  glory: {
    approved: {
      en: [
        'The Heavenly Court reviews your achievements and is... genuinely impressed. Glory granted! May your legend grow as lazy as your cultivation.',
        'Your deeds are undeniable. The celestial records are updated. Title and gold flow from the Heavens to your deserving hands.',
      ],
      ru: ['Небесный Суд рассматривает ваши достижения и... действительно впечатлён. Слава дарована!'],
      zh: ['天庭审阅汝之成就，竟真为之折服！赐予荣耀，愿汝传说如汝修炼般悠然流长。'],
    },
    partial: {
      en: ['A modest glory for modest deeds. The Court acknowledges your path, though the truly great would have done more by now.'],
      ru: ['Скромная слава за скромные деяния. Суд признаёт ваш путь.'],
      zh: ['微薄功勋换得微薄荣耀，天庭承认汝之道途，然大贤者此时本应有更多积累。'],
    },
    denied: {
      en: [
        'The Court has reviewed your "legendary" deeds. They are... underwhelming. Glory denied. Come back when you have actually done something.',
        'Boldness without substance. Your achievements do not support this claim of glory. The Court is embarrassed on your behalf.',
      ],
      ru: ['Суд изучил ваши "легендарные" деяния. Они... разочаровывают. Слава отклонена.'],
      zh: ['天庭审阅汝所谓的"传奇"功绩……着实平平。荣耀驳回，待真正建立功勋再来。'],
    },
  },
};

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

export function generateVerdict(hero: Hero, caseType: TribunalCaseType, pleaText: string, achievementCount: number, locale: 'en'|'ru'|'zh'): JudgmentResult {
  const score = scorePlea(hero, caseType, pleaText, achievementCount);
  const judge = pickJudge();
  const hasHubris = hero.psyche.pride > 75;

  let verdictKey: 'approved' | 'partial' | 'denied';
  if (score >= 65) verdictKey = 'approved';
  else if (score >= 40) verdictKey = 'partial';
  else verdictKey = 'denied';

  const texts = JUDGMENTS[caseType][verdictKey][locale];
  const baseText = pick(texts);
  const judgment = `— ${judge} —\n\n${baseText}`;

  const rewardGold = verdictKey === 'approved' ? 100 + Math.floor(score * 3) : verdictKey === 'partial' ? 50 + Math.floor(score) : 0;
  const rewardXp = verdictKey === 'approved' ? 80 + achievementCount * 10 : verdictKey === 'partial' ? 30 : 0;
  const penaltyGold = verdictKey === 'denied' && hasHubris ? Math.floor(Math.random() * 50 + 30) : 0;

  return { verdict: verdictKey, judgmentText: judgment, rewardGold, rewardXp, penaltyGold };
}

export async function fetchRecentTribunalCases(supabase: import('@supabase/supabase-js').SupabaseClient): Promise<TribunalCase[]> {
  const { data } = await supabase
    .from('tribunal_cases')
    .select('*')
    .order('submitted_at', { ascending: false })
    .limit(20);
  return (data || []) as TribunalCase[];
}
