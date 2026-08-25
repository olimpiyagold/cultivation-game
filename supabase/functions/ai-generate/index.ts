import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { ORACLE_RESPONSES, NPC_RESPONSES, type Locale } from "./responses.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const DAILY_LIMIT = 10;
const BUILTIN_MODEL = "deepseek/deepseek-v3-1-terminus";

type RequestType = "oracle" | "npc_dialogue" | "fate_book" | "diary_event";

interface AIRequest {
  type: RequestType;
  locale: Locale;
  context: Record<string, unknown>;
  heroId?: string;
  userApiKey?: string;  // user's own OpenRouter key — bypasses daily limit
}

// ── OpenRouter call (works with any key — built-in or user's own) ─────────────
async function callOpenRouter(
  prompt: string,
  systemPrompt: string,
  maxTokens: number,
  apiKey: string,
): Promise<string> {
  const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://lazydao.app",
      "X-Title": "Lazy Dao",
    },
    body: JSON.stringify({
      model: BUILTIN_MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`OpenRouter error ${resp.status}: ${err}`);
  }

  const data = await resp.json();
  return data.choices?.[0]?.message?.content ?? "";
}

// ── Daily quota (built-in key only) ──────────────────────────────────────────
async function getAndIncrementQuota(heroId: string): Promise<{ allowed: boolean; remaining: number }> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const db = createClient(supabaseUrl, serviceKey);

  const today = new Date().toISOString().slice(0, 10);

  const { data: hero } = await db
    .from("heroes")
    .select("ai_gens_today, ai_last_gen_date")
    .eq("id", heroId)
    .single();

  if (!hero) return { allowed: false, remaining: 0 };

  const sameDay = hero.ai_last_gen_date === today;
  const currentCount = sameDay ? (hero.ai_gens_today ?? 0) : 0;

  if (currentCount >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  await db
    .from("heroes")
    .update({ ai_gens_today: currentCount + 1, ai_last_gen_date: today })
    .eq("id", heroId);

  return { allowed: true, remaining: DAILY_LIMIT - currentCount - 1 };
}

async function getRemainingQuota(heroId: string): Promise<number> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const db = createClient(supabaseUrl, serviceKey);

  const today = new Date().toISOString().slice(0, 10);
  const { data: hero } = await db
    .from("heroes")
    .select("ai_gens_today, ai_last_gen_date")
    .eq("id", heroId)
    .single();

  if (!hero) return DAILY_LIMIT;
  if (hero.ai_last_gen_date !== today) return DAILY_LIMIT;
  return Math.max(0, DAILY_LIMIT - (hero.ai_gens_today ?? 0));
}

// ── Fallback helpers ──────────────────────────────────────────────────────────
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? k);
}

function fallbackOracle(ctx: Record<string, unknown>, locale: Locale): string {
  const pool = ORACLE_RESPONSES[locale] ?? ORACLE_RESPONSES.en;
  const template = pick(pool);
  const npc = (ctx.npcMemories as Array<{ npc_name: string }> | undefined)?.[0];
  return fill(template, {
    stage: String(ctx.heroStage ?? "Qi Condensation"),
    gold: String(ctx.heroGold ?? 0),
    yinYang: String(ctx.yinYang ?? 0),
    fatePath: String(ctx.fatePath ?? "unknown"),
    npcName: npc?.npc_name ?? "that wandering stranger",
  });
}

function fallbackNPC(ctx: Record<string, unknown>, locale: Locale): string {
  const pool = NPC_RESPONSES[locale] ?? NPC_RESPONSES.en;
  const template = pick(pool);
  return fill(template, {
    heroName: String(ctx.heroName ?? "Cultivator"),
    stage: String(ctx.heroStage ?? "Qi Condensation"),
    fatePath: String(ctx.fatePath ?? "unknown"),
    relationship: String(ctx.relationship ?? "neutral"),
    encounterCount: String(ctx.encounterCount ?? 1),
  });
}

const FATE_BOOK_FALLBACK = {
  en: {
    titles: [
      "The Whispering Jade Trial", "Seven Nights of Descending Fire",
      "The Forgotten Mountain Pact", "Blood Moon Convergence",
      "Trial of the Hollow Sword", "The Celestial Creditor's Demand",
      "Echoes of the Fallen Elder", "The Wandering Prophet's Decree",
      "Night of Ten Thousand Whispers", "The Jade Arbiter Awakens",
    ],
    narratives: [
      "An ancient fragment from the Great Cultivation Wars surfaces in your territory. The Jade Arbiter has marked your name in the Celestial Ledger — debts of karma, unpaid since three lifetimes ago, have come due. Seven days to settle what was sown.",
      "The ghost of a disgraced elder haunts your cultivation chamber, whispering incomplete techniques. To silence it you must prove your worth not through combat, but through growth. The Heavens watch. They always watch.",
      "A wandering prophet burned a scroll before your feet and vanished. The ash spelled your name. Interpret this however you wish — the deadline does not care about your interpretation.",
      "An ancient compact between your bloodline and the mountain spirits has been invoked. The terms were written in a language that predates your sect. The payment, however, is perfectly modern.",
      "Three omens appeared at dawn: a sword without a scabbard, a coin with no face, and a question with no answer. The Celestial Scribe has recorded them against your name.",
    ],
  },
  ru: {
    titles: [
      "Испытание Нефритового Шёпота", "Семь Ночей Нисходящего Огня",
      "Забытый Горный Пакт", "Конвергенция Кровавой Луны",
      "Эхо Павшего Старейшины", "Указ Странствующего Пророка",
    ],
    narratives: [
      "Древний фрагмент из Великих Войн Культивации всплывает на вашей территории. Нефритовый Арбитр внёс ваше имя в Небесный Гроссбух — долги кармы, не уплаченные за три жизни, подошли к сроку.",
      "Дух опозоренного старейшины преследует вашу медитационную комнату, шепча незаконченные техники. Чтобы его заглушить, вы должны доказать свою ценность не через бой, а через рост.",
      "Три знамения появились на рассвете: меч без ножен, монета без лика и вопрос без ответа. Небесный Летописец записал их против вашего имени.",
    ],
  },
  zh: {
    titles: [
      "玉鸣试炼", "七夜降火之约", "遗忘山盟", "血月会聚",
      "中空剑之考", "天机债主之令", "堕落长老的回响", "流浪先知之令",
    ],
    narratives: [
      "大修炼战争时期的一块古老碎片浮现于你的领地。玉公断已在天机账簿上记下你的名字——三世未偿的因果之债，如今已到期。七日之内，清算昔日所种之因。",
      "一位失职长老的亡魂萦绕你的修炼室，低语着残缺的功法。若想令其安息，你须以成长而非战斗证明自身的价值。天道在看，它始终在看。",
      "黎明时出现三个征兆：一把无鞘的剑、一枚无面的钱币、一个无解的问题。天机书记已将它们记在你的名下。",
    ],
  },
};

function buildFateBookFallback(ctx: Record<string, unknown>, locale: Locale): object {
  const L = FATE_BOOK_FALLBACK[locale] ?? FATE_BOOK_FALLBACK.en;
  const title = pick(L.titles);
  const narrative = pick(L.narratives);
  const stage = String(ctx.heroStage ?? "Qi Condensation");
  const pathLevels = (ctx.pathLevels as Record<string, number>) ?? {};
  void Object.entries(pathLevels).sort((a, b) => b[1] - a[1])[0]?.[0];

  const objectivePool = [
    { type: "kill_enemies",     amount: 8,   label: { en: "Vanquish 8 enemies",           ru: "Победить 8 врагов",       zh: "击败8个敌人" } },
    { type: "enter_dungeon",    amount: 1,   label: { en: "Enter a sacred ruin",           ru: "Войти в руины",           zh: "进入一处秘境" } },
    { type: "complete_dungeon", amount: 1,   label: { en: "Complete the trial dungeon",    ru: "Пройти испытание",        zh: "完成一次地宫" } },
    { type: "send_resonance",   amount: 3,   label: { en: "Channel Dao 3 times",           ru: "Резонировать с Дао 3×",   zh: "与道法共鸣3次" } },
    { type: "feed_pet",         amount: 2,   label: { en: "Commune with your spirit beast",ru: "Пообщаться с питомцем",   zh: "与灵宠沟通2次" } },
    { type: "collect_gold",     amount: 150, label: { en: "Accumulate 150 spirit stones",  ru: "Накопить 150 камней",     zh: "积累150枚灵石" } },
  ];

  const shuffled = [...objectivePool].sort(() => Math.random() - 0.5).slice(0, 3);
  const objectives = shuffled.map(o => ({
    type: o.type, amount: o.amount,
    label: o.label[locale] ?? o.label.en,
    progress: 0, baseline: 0,
  }));

  const rewardGold = 150 + Math.floor(Math.random() * 200);
  const rewardTexts = {
    en: `The Heavens acknowledge your deeds, ${stage} cultivator. ${rewardGold} spirit stones materialise from the celestial ledger.`,
    ru: `Небеса признают ваши деяния, культиватор ${stage}. ${rewardGold} духовных камней материализуются из небесного реестра.`,
    zh: `天道承认了你的功绩，${stage}修士。${rewardGold}枚灵石从天机账簿中具现。`,
  };

  return { title, narrative, objectives, rewardText: rewardTexts[locale] ?? rewardTexts.en, rewardGold };
}

// ── Prompt builders ───────────────────────────────────────────────────────────
function buildOraclePrompt(ctx: Record<string, unknown>, locale: Locale) {
  const lang = locale === "zh" ? "Chinese" : locale === "ru" ? "Russian" : "English";
  return {
    system: `You are the spirit-voice of a lazy cultivator hero in a xianxia fantasy game called Lazy Dao.
Speak in first person, in character. Be witty, philosophical, reluctantly wise, and deeply lazy.
Never break character. Never mention being an AI. Keep responses under 80 words.
Respond in ${lang}.`,
    user: `Hero: ${ctx.heroName}, Stage: ${ctx.heroStage}, Gold: ${ctx.heroGold}, Yin/Yang: ${ctx.yinYang}, Fate: ${ctx.fatePath}
Recent events: ${JSON.stringify(ctx.recentEvents)}
Known souls: ${JSON.stringify((ctx.npcMemories as Array<{npc_name:string}>)?.slice(0,3).map(n=>n.npc_name))}
User says: "${ctx.userMessage}"
Reply in character.`,
  };
}

function buildNPCPrompt(ctx: Record<string, unknown>, locale: Locale) {
  const lang = locale === "zh" ? "Chinese" : locale === "ru" ? "Russian" : "English";
  return {
    system: `You are an NPC in a xianxia cultivation game. Short, in-character greeting from NPC's perspective.
Be colourful, use xianxia tropes. Under 70 words. Respond in ${lang}.`,
    user: `NPC: ${ctx.npcName} (${ctx.npcType})
Hero: ${ctx.heroName}, Stage: ${ctx.heroStage}, Fate: ${ctx.fatePath}
Encounters: ${ctx.encounterCount}, Relationship: ${ctx.relationship}
Memory: ${ctx.memoryNotes ?? "First meeting"}
Generate their dialogue.`,
  };
}

function buildFateBookPrompt(ctx: Record<string, unknown>, locale: Locale) {
  const lang = locale === "zh" ? "Chinese" : locale === "ru" ? "Russian" : "English";
  return {
    system: `You are the Celestial Scribe generating a weekly Book of Fate challenge for a xianxia idle RPG.
Return ONLY valid JSON, no markdown. Respond in ${lang}.`,
    user: `Hero: ${ctx.heroName}, Stage: ${ctx.heroStage}, Fate: ${ctx.fatePath}
Paths: ${JSON.stringify(ctx.pathLevels)}
Kills: ${ctx.totalEnemiesKilled}, Dungeons: ${ctx.totalDungeons}
JSON format:
{"title":"...","narrative":"...","objectives":[{"type":"kill_enemies"|"enter_dungeon"|"complete_dungeon"|"send_resonance"|"feed_pet"|"collect_gold","amount":N,"label":"..."},...],"rewardText":"...","rewardGold":N}`,
  };
}

function buildDiaryPrompt(ctx: Record<string, unknown>, locale: Locale) {
  const lang = locale === "zh" ? "Chinese" : locale === "ru" ? "Russian" : "English";
  return {
    system: `Single diary log entry for a lazy xianxia cultivator. Under 60 words. Dry humour about laziness. Respond in ${lang}.`,
    user: `Hero: ${ctx.heroName}, Stage: ${ctx.heroStage}, Zone: ${ctx.zone}
Event: ${ctx.eventType}
Write one diary entry.`,
  };
}

// ── Main handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: AIRequest = await req.json();
    const { type, locale = "en", context, heroId, userApiKey } = body;

    const builtinKey = Deno.env.get("OPENROUTER_API_KEY");

    // Determine which key to use and check quota
    let activeKey: string | null = null;
    let remaining: number | null = null;
    let usingUserKey = false;

    if (userApiKey) {
      // User's own key — unlimited, no quota check
      activeKey = userApiKey;
      usingUserKey = true;
    } else if (builtinKey && heroId) {
      // Built-in key — check daily quota
      const quota = await getAndIncrementQuota(heroId);
      if (quota.allowed) {
        activeKey = builtinKey;
        remaining = quota.remaining;
      } else {
        remaining = 0;
      }
    } else if (builtinKey && !heroId) {
      // No heroId — allow but don't track
      activeKey = builtinKey;
    }

    // If no active key, serve from dictionary
    const useDictionary = !activeKey;

    let result: string | object;

    if (type === "fate_book") {
      if (!useDictionary) {
        const { system, user } = buildFateBookPrompt(context, locale);
        try {
          const raw = await callOpenRouter(user, system, 400, activeKey!);
          const cleaned = raw.replace(/^```[\w]*\n?/m, "").replace(/\n?```$/m, "").trim();
          result = JSON.parse(cleaned);
        } catch {
          result = buildFateBookFallback(context, locale);
        }
      } else {
        result = buildFateBookFallback(context, locale);
      }
    } else if (type === "oracle") {
      if (!useDictionary) {
        const { system, user } = buildOraclePrompt(context, locale);
        try {
          result = await callOpenRouter(user, system, 160, activeKey!);
        } catch {
          result = fallbackOracle(context, locale);
        }
      } else {
        result = fallbackOracle(context, locale);
      }
    } else if (type === "npc_dialogue") {
      if (!useDictionary) {
        const { system, user } = buildNPCPrompt(context, locale);
        try {
          result = await callOpenRouter(user, system, 120, activeKey!);
        } catch {
          result = fallbackNPC(context, locale);
        }
      } else {
        result = fallbackNPC(context, locale);
      }
    } else if (type === "diary_event") {
      if (!useDictionary) {
        const { system, user } = buildDiaryPrompt(context, locale);
        try {
          result = await callOpenRouter(user, system, 100, activeKey!);
        } catch {
          result = String(context.fallback ?? "The day passed as most days do — lazily.");
        }
      } else {
        result = String(context.fallback ?? "The day passed as most days do — lazily.");
      }
    } else {
      return new Response(JSON.stringify({ error: "Unknown type" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If no heroId but builtin key, get remaining without incrementing
    if (remaining === null && heroId && builtinKey && !usingUserKey) {
      remaining = await getRemainingQuota(heroId);
    }

    return new Response(JSON.stringify({
      result,
      aiPowered: !useDictionary,
      usingUserKey,
      remaining: usingUserKey ? null : (remaining ?? DAILY_LIMIT),
      dailyLimit: DAILY_LIMIT,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
