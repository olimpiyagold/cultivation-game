'use client';

import { useState } from 'react';
import { Sparkles, BookOpen, Clock, CheckCircle, Gift, Zap } from 'lucide-react';
import { useGame } from '@/lib/game/context';
import { useI18n } from '@/lib/i18n/context';n
const STATUS_STYLES = {
  active:    { color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30',    label: 'In Progress' },
  completed: { color: 'text-jade',      bg: 'bg-jade/10 border-jade/30',              label: 'Completed' },
  claimed:   { color: 'text-muted-foreground', bg: 'bg-muted/20 border-border',       label: 'Claimed' },
};

const OBJ_ICONS: Record<string, string> = {
  kill_enemies:     '⚔',
  enter_dungeon:    '🗺',
  complete_dungeon: '🏆',
  send_resonance:   '⚡',
  feed_pet:         '🦊',
  collect_gold:     '💎',
  reach_path_level: '☯',
  total_ticks:      '⏳',
};

export function FateBookView() {
  const { fateBook, generateFateBook, claimFateBookReward, hero } = useGame();
  const { locale } = useI18n();
  const [generating, setGenerating] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [aiPowered, setAiPowered] = useState(false);

  if (!hero) return null;

  async function handleGenerate() {
    setGenerating(true);
    try {
      const book = await generateFateBook(locale);
      if (book) setAiPowered(true);
    } finally {
      setGenerating(false);
    }
  }

  async function handleClaim() {
    setClaiming(true);
    await claimFateBookReward();
    setClaiming(false);
  }

  if (!fateBook || fateBook.status === 'claimed') {
    return (
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="font-calligraphy font-bold">Book of Fate</p>
              <p className="text-xs text-muted-foreground">命运之书 · Weekly celestial trial</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {fateBook?.status === 'claimed'
              ? 'This week\'s trial is complete. A new one will be written when the celestial cycle turns.'
              : 'The celestial scribe awaits to pen your trial. Each week brings a new fate — uniquely crafted for your cultivation journey.'}
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full py-3 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-500 font-medium text-sm flex items-center justify-center gap-2 hover:bg-amber-500/20 transition-all disabled:opacity-50"
        >
          {generating ? (
            <><Sparkles className="w-4 h-4 animate-spin" /> The celestial scribe writes...</>
          ) : (
            <><BookOpen className="w-4 h-4" /> Open the Book of Fate</>
          )}
        </button>

        {fateBook?.status === 'claimed' && (
          <div className="rounded-lg border border-border/50 bg-muted/20 p-3 text-center">
            <p className="text-xs text-muted-foreground">Past trial: <span className="text-foreground font-medium">{fateBook.title}</span></p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">Completed · {fateBook.reward_gold} stones earned</p>
          </div>
        )}
      </div>
    );
  }

  const st = STATUS_STYLES[fateBook.status];
  const totalObjs = fateBook.objectives.length;
  const doneObjs = fateBook.objectives.filter(o => o.progress >= o.amount).length;
  const overallPct = totalObjs > 0 ? Math.floor((doneObjs / totalObjs) * 100) : 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Title card */}
      <div className={`rounded-xl border p-4 ${st.bg}`}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <BookOpen className={`w-4 h-4 shrink-0 ${st.color}`} />
            <span className={`text-[10px] font-semibold uppercase tracking-wider ${st.color}`}>
              Book of Fate · {st.label}
            </span>
            {aiPowered && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-jade/20 text-jade flex items-center gap-0.5">
                <Zap className="w-2.5 h-2.5" /> AI
              </span>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground">{fateBook.week_key}</span>
        </div>
        <h3 className="font-calligraphy font-bold text-base mb-2">{fateBook.title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{fateBook.narrative}</p>
      </div>

      {/* Progress summary */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-muted/40 overflow-hidden">
          <div
            className="h-full rounded-full bg-amber-500 transition-all duration-500"
            style={{ width: `${overallPct}%` }}
          />
        </div>
        <span className="text-xs font-medium text-amber-500">{doneObjs}/{totalObjs}</span>
      </div>

      {/* Objectives */}
      <div className="flex flex-col gap-2">
        {fateBook.objectives.map((obj, i) => {
          const pct = Math.floor((obj.progress / obj.amount) * 100);
          const done = obj.progress >= obj.amount;
          return (
            <div
              key={i}
              className={`rounded-lg border p-2.5 transition-all ${
                done ? 'border-jade/30 bg-jade/5' : 'border-border bg-card/50'
              }`
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base">{OBJ_ICONS[obj.type] ?? '📌'}</span>
                <p className={`text-xs font-medium flex-1 ${done ? 'line-through text-muted-foreground' : ''}`}>
                  {obj.label}
                </p>
                {done
                  ? <CheckCircle className="w-4 h-4 text-jade shrink-0" />
                  : <span className="text-[10px] text-muted-foreground">{obj.progress}/{obj.amount}</span>}
              </div>
              {!done && (
                <div className="h-1 rounded-full bg-muted/40 overflow-hidden">
                  <div className="h-full rounded-full bg-amber-500/70 transition-all duration-300" style={{ width: `${pct}%` }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Reward */}
      <div className="rounded-lg border border-gold/30 bg-gold/5 p-3 flex items-start gap-2">
        <Gift className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-[10px] font-medium text-amber-500 uppercase tracking-wider mb-0.5">Celestial Reward</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{fateBook.reward_text}</p>
          <p className="text-sm font-bold text-amber-500 mt-1">+{fateBook.reward_gold} 💎</p>
        </div>
      </div>

      {/* Claim button */}
      {fateBook.status === 'completed' && (
        <button
          onClick={handleClaim}
          disabled={claiming}
          className="w-full py-3 rounded-xl border border-jade/40 bg-jade/10 text-jade font-medium text-sm flex items-center justify-center gap-2 hover:bg-jade/20 transition-all disabled:opacity-50"
        >
          {claiming
            ? <><Clock className="w-4 h-4 animate-spin" /> Receiving heavenly reward...</>
            : <><CheckCircle className="w-4 h-4" /> Claim Reward ({fateBook.reward_gold} stones)</>}
        </button>
      )}

      {fateBook.status === 'active' && (
        <p className="text-[10px] text-muted-foreground text-center">
          Progress updates automatically as your hero cultivates.
        </p>
      )}
    </div>
  );
}
