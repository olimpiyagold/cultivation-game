'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun, Globe, UserCircle, Brain, MessageSquare, Sparkles, Key, Zap, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useI18n } from '@/lib/i18n/context';
import { useGame } from '@/lib/game/context';
import { getUserApiKey, setUserApiKey } from '@/lib/game/aiClient';
import type { Locale } from '@/lib/i18n/translations';
import type { NPCMemory } from '@/lib/game/context';

const LANGUAGES: { code: Locale; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
];

const REL_COLORS: Record<string, string> = {
  hostile: 'bg-crimson', wary: 'bg-amber-500', neutral: 'bg-muted-foreground', friendly: 'bg-jade', allied: 'bg-blue-400',
};

function NPCCard({ npc }: { npc: NPCMemory }) {
  const { getNPCDialogue } = useGame();
  const { locale } = useI18n();
  const [dialogue, setDialogue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSpeak() {
    if (loading) return;
    setLoading(true);
    const text = await getNPCDialogue(npc, locale);
    setDialogue(text);
    setLoading(false);
  }

  return (
    <div className="rounded-lg border border-border/50 bg-muted/20 overflow-hidden">
      <div className="flex items-center gap-2 p-2.5">
        <div className={`w-2 h-2 rounded-full shrink-0 ${REL_COLORS[npc.relationship] ?? 'bg-muted-foreground'}`} />
        <span className="text-xs font-medium flex-1">{npc.npc_name}</span>
        <span className="text-[10px] text-muted-foreground capitalize">{npc.npc_type}</span>
        <span className="text-[10px] text-muted-foreground">{npc.encounter_count}×</span>
        <button onClick={handleSpeak} disabled={loading} className="ml-1 w-6 h-6 rounded-full bg-jade/20 flex items-center justify-center hover:bg-jade/30 transition-all disabled:opacity-50" title="Ask AI for dialogue">
          {loading ? <Sparkles className="w-3 h-3 text-jade animate-spin" /> : <MessageSquare className="w-3 h-3 text-jade" />}
        </button>
      </div>
      {dialogue && (
        <div className="px-2.5 pb-2.5 border-t border-border/30 pt-2">
          <p className="text-[11px] text-muted-foreground italic leading-relaxed">"{dialogue}"</p>
          <button onClick={() => setDialogue(null)} className="text-[9px] text-muted-foreground/50 hover:text-muted-foreground mt-1">dismiss</button>
        </div>
      )}
    </div>
  );
}

export function SettingsTab() {
  const { t, locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const { hero, npcMemories } = useGame();
  const psycheEntries = hero ? Object.entries(hero.psyche) : [];
  const [keyInput, setKeyInput] = useState('');
  const [savedKey, setSavedKey] = useState('');
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    const k = getUserApiKey();
    setSavedKey(k);
    setKeyInput(k ? '••••••••••••••••' : '');
  }, []);

  function handleSaveKey() {
    setUserApiKey(keyInput.startsWith('••') ? savedKey : keyInput);
    const k = getUserApiKey();
    setSavedKey(k);
    setKeyInput(k ? '••••••••••••••••' : '');
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  }

  function handleClearKey() {
    setUserApiKey('');
    setSavedKey('');
    setKeyInput('');
  }

  const remaining = hero ? Math.max(0, 10 - (hero.ai_gens_today ?? 0)) : null;
  const aiLabels = {
    title: { en: 'AI Settings', ru: 'Настройки ИИ', zh: 'AI 设置' },
    quota: { en: 'Free daily generations', ru: 'Бесплатных генераций в день', zh: '每日免费次数' },
    customKey: { en: 'Your OpenRouter API key', ru: 'Ваш ключ OpenRouter', zh: '自定义 OpenRouter 密钥' },
    keyPlaceholder: { en: 'sk-or-v1-...', ru: 'sk-or-v1-...', zh: 'sk-or-v1-...' },
    save: { en: 'Save', ru: 'Сохранить', zh: '保存' },
    clear: { en: 'Clear', ru: 'Удалить', zh: '清除' },
    hint: { en: 'Bypass the daily limit with your own key. Get one free at', ru: 'Обойдите лимит с вашим ключом. Получите бесплатно на', zh: '使用自己的密钥绕过限制，免费获取密钥：' },
    active: { en: 'Custom key active — unlimited generations', ru: 'Ваш ключ активен — неограниченно', zh: '自定义密钥已激活，无限次生成' },
  } as const;
  const L = (key: keyof typeof aiLabels) => aiLabels[key][locale] ?? aiLabels[key].en;

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        {hero && (
          <section className="rounded-xl border border-border/50 bg-card/50 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-jade/20 border border-jade/30 flex items-center justify-center text-xl">道</div>
              <div>
                <p className="text-xs text-muted-foreground">{t.settings.heroName}</p>
                <p className="font-calligraphy font-semibold">{hero.name}</p>
                <p className="text-xs text-primary">{hero.stage}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-muted-foreground">{t.cultivation.totalTicks}</p>
                <p className="text-sm font-semibold">{hero.total_ticks}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Brain className="w-3 h-3" /> Psyche</p>
              {psycheEntries.map(([key, val]) => (
                <div key={key} className="flex items-center gap-2 text-xs">
                  <span className="w-20 text-muted-foreground capitalize">{key}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-primary/60 transition-all" style={{ width: `${val}%` }} /></div>
                  <span className="w-6 text-right text-muted-foreground">{val}</span>
                </div>
              ))}
            </div>
          </section>
        )}
        <section className="rounded-xl border border-border/50 bg-card/50 p-4 space-y-3">
          <h3 className="font-calligraphy text-sm font-semibold flex items-center gap-2"><Globe className="w-4 h-4 text-jade" />{t.settings.language}</h3>
          <div className="grid grid-cols-3 gap-2">
            {LANGUAGES.map(lang => (
              <button key={lang.code} onClick={() => setLocale(lang.code)} className={`py-2.5 rounded-lg text-xs font-medium flex flex-col items-center gap-1 transition-all duration-150 ${locale === lang.code ? 'bg-primary text-primary-foreground scale-[1.02]' : 'bg-muted/50 text-muted-foreground hover:text-foreground'}`}>
                <span className="text-lg">{lang.flag}</span><span>{lang.label}</span>
              </button>
            ))}
          </div>
        </section>
        <section className="rounded-xl border border-border/50 bg-card/50 p-4 space-y-3">
          <h3 className="font-calligraphy text-sm font-semibold flex items-center gap-2">{theme === 'dark' ? <Moon className="w-4 h-4 text-gold" /> : <Sun className="w-4 h-4 text-gold" />}{t.settings.theme}</h3>
          <div className="grid grid-cols-2 gap-2">
            {(['light', 'dark'] as const).map(th => (
              <button key={th} onClick={() => setTheme(th)} className={`py-3 rounded-lg text-xs font-medium flex flex-col items-center gap-1.5 transition-all duration-150 ${theme === th ? 'bg-primary text-primary-foreground scale-[1.02]' : 'bg-muted/50 text-muted-foreground hover:text-foreground'}`}>
                {th === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                <span>{th === 'dark' ? t.settings.darkMode : t.settings.lightMode}</span>
              </button>
            ))}
          </div>
        </section>
        <section className="rounded-xl border border-border/50 bg-card/50 p-4 space-y-3">
          <h3 className="font-calligraphy text-sm font-semibold flex items-center gap-2"><Zap className="w-4 h-4 text-jade" />{L('title')}</h3>
          <div className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2.5">
            <div>
              <p className="text-xs text-muted-foreground">{L('quota')}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">{locale === 'en' && 'Resets every day per hero'}{locale === 'ru' && 'Сбрасывается каждый день'}{locale === 'zh' && '每天重置'}</p>
            </div>
            {savedKey ? (<span className="text-xs text-jade flex items-center gap-1 font-medium"><Key className="w-3.5 h-3.5" />{locale === 'en' ? 'Unlimited' : locale === 'ru' ? 'Безлимит' : '无限'}</span>) : remaining !== null ? (<span className={`text-sm font-bold ${remaining === 0 ? 'text-crimson' : remaining <= 3 ? 'text-amber-500' : 'text-jade'}`}>{remaining}<span className="text-xs font-normal text-muted-foreground">/10</span></span>) : (<span className="text-xs text-muted-foreground">—</span>)}
          </div>
          {savedKey && (<div className="flex items-center gap-2 bg-jade/10 border border-jade/30 rounded-lg px-3 py-2"><CheckCircle className="w-3.5 h-3.5 text-jade shrink-0" /><p className="text-[11px] text-jade">{L('active')}</p></div>)}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground font-medium">{L('customKey')}</label>
            <div className="flex gap-2">
              <input type="password" value={keyInput} onChange={e => setKeyInput(e.target.value)} onFocus={() => { if (keyInput.startsWith('••')) setKeyInput(''); }} placeholder={L('keyPlaceholder')} className="flex-1 bg-muted/50 border border-border/50 rounded-lg px-3 py-2 text-xs placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-jade/50 transition-all font-mono" />
              <button onClick={handleSaveKey} disabled={!keyInput.trim() || keyInput.startsWith('••')} className="px-3 py-2 rounded-lg bg-jade text-background text-xs font-semibold disabled:opacity-40 hover:bg-jade/90 transition-all flex items-center gap-1">{keySaved ? <CheckCircle className="w-3.5 h-3.5" /> : null}{L('save')}</button>
              {savedKey && (<button onClick={handleClearKey} className="px-3 py-2 rounded-lg bg-crimson/20 text-crimson text-xs font-semibold hover:bg-crimson/30 transition-all flex items-center gap-1"><XCircle className="w-3.5 h-3.5" />{L('clear')}</button>)}
            </div>
            <p className="text-[10px] text-muted-foreground/70 leading-relaxed">{L('hint')} <span className="text-jade font-medium">openrouter.ai</span><ExternalLink className="w-2.5 h-2.5 inline ml-0.5 opacity-60" /></p>
          </div>
        </section>
        {npcMemories.length > 0 && (
          <section className="rounded-xl border border-border/50 bg-card/50 p-4 space-y-3">
            <h3 className="font-calligraphy text-sm font-semibold flex items-center gap-2"><UserCircle className="w-4 h-4 text-gold" />{t.settings.npcMemories}<span className="ml-auto text-[10px] text-muted-foreground font-normal flex items-center gap-1"><MessageSquare className="w-3 h-3" /> tap to speak</span></h3>
            <div className="space-y-1.5">{npcMemories.slice(-8).map(m => <NPCCard key={m.id} npc={m} />)}</div>
          </section>
        )}
      </div>
    </div>
  );
}
