'use client';

import { useState } from 'react';
import { MessageSquare, Heart, Sparkles } from 'lucide-react';
import { useGame } from '@/lib/game/context';
import { useI18n } from '@/lib/i18n/context';
import { MENTOR_DEFS } from '@/lib/game/mentor';

const REL_LABELS = ['Stranger', 'Acquaintance', 'Disciple', 'Trusted', 'Favored', 'Intimate'];
function relLabel(rel: number) {
  if (rel >= 80) return REL_LABELS[5];
  if (rel >= 60) return REL_LABELS[4];
  if (rel >= 40) return REL_LABELS[3];
  if (rel >= 20) return REL_LABELS[2];
  if (rel >= 5)  return REL_LABELS[1];
  return REL_LABELS[0];
}

export function MentorView() {
  const { mentor, hero, requestMentorWisdom } = useGame();
  const { locale } = useI18n();
  const [loading, setLoading] = useState(false);
  const [wisdom, setWisdom] = useState<string | null>(null);

  if (!mentor || !hero) return null;

  const def = MENTOR_DEFS[mentor.mentor_type];
  const relPct = Math.min(100, mentor.relationship);
  const relText = relLabel(mentor.relationship);

  async function handleAskWisdom() {
    setLoading(true);
    const w = await requestMentorWisdom(locale);
    setWisdom(w);
    setLoading(false);
  }

  const MENTOR_BG: Record<string, string> = {
    strict:       'border-crimson/30 bg-crimson/5',
    wise:         'border-amber-500/30 bg-amber-500/5',
    chaotic:      'border-purple-500/30 bg-purple-500/5',
    compassionate:'border-jade/30 bg-jade/5',
    merchant:     'border-gold/30 bg-gold/5',
  };
  const MENTOR_ICON_BG: Record<string, string> = {
    strict:       'bg-crimson/20',
    wise:         'bg-amber-500/20',
    chaotic:      'bg-purple-500/20',
    compassionate:'bg-jade/20',
    merchant:     'bg-gold/20',
  };
  const MENTOR_BAR: Record<string, string> = {
    strict:       'bg-crimson',
    wise:         'bg-amber-500',
    chaotic:      'bg-purple-500',
    compassionate:'bg-jade',
    merchant:     'bg-gold',
  };

  const bgCls   = MENTOR_BG[mentor.mentor_type] ?? 'border-border bg-card/50';
  const iconBg  = MENTOR_ICON_BG[mentor.mentor_type] ?? 'bg-muted/50';
  const barCls  = MENTOR_BAR[mentor.mentor_type] ?? 'bg-primary';

  return (
    <div className="flex flex-col gap-3">
      {/* Mentor portrait card */}
      <div className={`rounded-xl border p-4 ${bgCls}`}>
        <div className="flex items-center gap-3">
          <div className={`w-14 h-14 rounded-full ${iconBg} flex items-center justify-center text-2xl shrink-0`}>
            {def.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-calligraphy font-bold text-base">{def.name[locale]}</p>
            <p className="text-xs text-muted-foreground">{def.title[locale]}</p>
            <p className="text-[10px] text-muted-foreground/70 mt-0.5 italic line-clamp-1">{def.personality[locale]}</p>
          </div>
        </div>

        {/* Relationship bar */}
        <div className="mt-3 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Heart className="w-3 h-3" /> Relationship
            </span>
            <span className="text-[10px] font-medium text-muted-foreground">{relText} ({mentor.relationship}/100)</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${barCls}`} style={{ width: `${relPct}%` }} />
          </div>
        </div>

        <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
          <span><MessageSquare className="w-3 h-3 inline mr-0.5" />{mentor.total_conversations} conversations</span>
        </div>
      </div>

      {/* Ask wisdom button */}
      <button
        onClick={handleAskWisdom}
        disabled={loading}
        className={`w-full py-3 rounded-xl border font-medium text-sm flex items-center justify-center gap-2 transition-all ${bgCls} hover:brightness-110 disabled:opacity-50`}
      >
        {loading ? (
          <><Sparkles className="w-4 h-4 animate-pulse" /> Seeking wisdom...</>
        ) : (
          <><MessageSquare className="w-4 h-4" /> Request Guidance</>
        )}
      </button>

      {/* Current wisdom bubble */}
      {(wisdom ?? mentor.last_wisdom) && (
        <div className={`rounded-xl border p-3.5 ${bgCls}`}>
          <div className="flex items-start gap-2">
            <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center text-sm shrink-0 mt-0.5`}>
              {def.icon}
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-medium text-muted-foreground mb-1">{def.name[locale]} says:</p>
              <p className="text-xs leading-relaxed text-foreground/90">
                "{wisdom ?? mentor.last_wisdom}"
              </p>
            </div>
          </div>
          {mentor.last_wisdom_at && (
            <p className="text-[9px] text-muted-foreground/50 mt-2 text-right">
              {new Date(mentor.last_wisdom_at).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {/* Personality info */}
      <div className="rounded-lg border border-border/50 bg-card/30 p-3">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Mentor Archetype</p>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-lg">{def.icon}</span>
          <span className="text-xs font-semibold capitalize">{mentor.mentor_type}</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{def.personality[locale]}</p>
        <p className="text-[10px] text-muted-foreground/60 mt-2">Resonance amplifies mentor bonding. Keep channeling the Dao.</p>
      </div>
    </div>
  );
}
