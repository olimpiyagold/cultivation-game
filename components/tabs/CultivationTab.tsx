'use client';

import { useEffect, useRef } from 'react';
import { Heart, Gem, Swords, Gift, Moon, Zap, Star, Trophy } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { useGame, type DiaryLog } from '@/lib/game/context';
import { useGameLoop } from '@/lib/game/useGameLoop';
import { PathProgress } from '@/components/game/PathProgress';
import { YinYangMeter } from '@/components/game/YinYangMeter';
import { AchievementsPanel } from '@/components/game/AchievementsPanel';
import type { LogType } from '@/lib/game/types';
import { useState } from 'react';

type CultSubTab = 'overview' | 'achievements';

const LOG_ICONS: Record<LogType, React.ReactNode> = {
  combat:  <Swords className="w-3 h-3 text-crimson shrink-0 mt-0.5" />,
  loot:    <Gift className="w-3 h-3 text-gold shrink-0 mt-0.5" />,
  rest:    <Moon className="w-3 h-3 text-jade shrink-0 mt-0.5" />,
  dungeon: <Zap className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />,
  pet:     <span className="text-[10px] shrink-0 mt-0.5">🐾</span>,
  sect:    <span className="text-[10px] shrink-0 mt-0.5">宗</span>,
  system:  <Star className="w-3 h-3 text-gold shrink-0 mt-0.5" />,
  chain:   <span className="text-[10px] shrink-0 mt-0.5">⛓</span>,
};

export function CultivationTab() {
  const { t } = useI18n();
  const { hero, logs, achievements, realtimeConnected } = useGame();
  const [subTab, setSubTab] = useState<CultSubTab>('overview');
  const scrollRef = useRef<HTMLDivElement>(null);

  useGameLoop();

  useEffect(() => {
    if (scrollRef.current && subTab === 'overview') {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, subTab]);

  if (!hero) return null;

  const hpPct = Math.max(0, Math.min(100, (hero.hp / hero.max_hp) * 100));
  const hpColor = hpPct > 60 ? 'from-jade to-emerald-500' : hpPct > 30 ? 'from-amber-400 to-amber-500' : 'from-crimson to-red-600';

  return (
    <div className="flex flex-col h-full p-3 gap-3 overflow-hidden">
      <div className="flex gap-1 p-0.5 bg-muted/30 rounded-xl shrink-0">
        <button onClick={() => setSubTab('overview')} className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all duration-150 ${subTab === 'overview' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
          <Swords className="w-3.5 h-3.5" />{t.cultivation.title}
        </button>
        <button onClick={() => setSubTab('achievements')} className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all duration-150 ${subTab === 'achievements' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
          <Trophy className="w-3.5 h-3.5" />
          {achievements.length > 0 && <span className="text-gold font-bold">{achievements.length}</span>}
          {t.cultivation.title === '修炼密室' ? '成就' : 'Achievements'}
        </button>
      </div>
      {subTab === 'achievements' ? (
        <div className="flex-1 overflow-y-auto"><AchievementsPanel /></div>
      ) : (
        <>
          <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-3 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="font-calligraphy text-sm font-semibold">{t.cultivation.title}</h2>
              <div className="flex items-center gap-2">
                {realtimeConnected && (<span className="text-[9px] text-jade flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-jade animate-pulse" />Live</span>)}
                <span className="text-[10px] text-jade font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-jade animate-pulse" />{t.cultivation.active}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-muted-foreground"><Heart className="w-3 h-3 text-crimson" />{t.cultivation.hp}</span>
                <span className="font-semibold tabular-nums">{hero.hp}/{hero.max_hp}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full bg-gradient-to-r ${hpColor} transition-all duration-700`} style={{ width: `${hpPct}%` }} />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-1.5 text-xs"><Gem className="w-3 h-3 text-gold" /><span className="text-muted-foreground">{t.cultivation.gold}</span><span className="ml-auto font-semibold text-gold">{hero.gold}</span></div>
              <div className="w-px bg-border/30" />
              <div className="flex-1 flex items-center gap-1.5 text-xs"><span className="text-muted-foreground">{t.cultivation.fatePath}</span><span className="ml-auto font-medium text-primary capitalize">{t.fate[hero.fate_path]}</span></div>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {(['strength', 'agility', 'spirit', 'luck'] as const).map(stat => (
                <div key={stat} className="flex flex-col items-center py-1.5 rounded-lg bg-muted/40">
                  <span className="text-[10px] text-muted-foreground">{t.cultivation[stat]}</span>
                  <span className="text-sm font-bold">{hero.stats[stat]}</span>
                </div>
              ))}
            </div>
            <YinYangMeter value={hero.yin_yang} />
          </div>
          <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm p-3 shrink-0"><PathProgress hero={hero} /></div>
          <div className="flex-1 min-h-0 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm flex flex-col overflow-hidden">
            <div className="px-3 py-2 border-b border-border/30 shrink-0"><h3 className="font-calligraphy text-xs font-semibold flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-jade animate-pulse" />{t.cultivation.diary}</h3></div>
            <div className="flex-1 overflow-y-auto" ref={scrollRef}>
              <div className="p-2 space-y-1.5">
                {logs.length === 0 ? (<p className="text-xs text-muted-foreground text-center py-6 italic">The Dao unfolds...</p>) : (logs.map((log, i) => <LogEntry key={log.id} log={log} isNew={i === logs.length - 1} />))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function LogEntry({ log, isNew }: { log: DiaryLog; isNew: boolean }) {
  const time = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return (
    <div className={`flex items-start gap-2 text-xs p-2 rounded-lg transition-all ${isNew ? 'animate-float-up bg-primary/5' : 'opacity-75 hover:opacity-100'}`}>
      {LOG_ICONS[log.type] ?? <span className="w-3 h-3" />}
      <p className="flex-1 leading-relaxed">{log.log_text}</p>
      <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">{time}</span>
    </div>
  );
}
