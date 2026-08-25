'use client';

import { useState } from 'react';
import { Scale, Send, Clock, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import { useGame } from '@/lib/game/context';
import type { TribunalCaseType, TribunalCase } from '@/lib/game/context';

const CASE_TYPES: { key: TribunalCaseType; icon: string; label: string; desc: string }[] = [
  { key: 'redemption', icon: '🕊', label: 'Redemption', desc: 'Seek forgiveness for past sins' },
  { key: 'accusation', icon: '⚔', label: 'Accusation', desc: 'File a grievance against another' },
  { key: 'defense',    icon: '🛡', label: 'Defense',    desc: 'Defend yourself from charges' },
  { key: 'glory',      icon: '🏆', label: 'Glory',      desc: 'Petition for recognition of deeds' },
];

const VERDICT_STYLES = {
  approved: { icon: CheckCircle,  color: 'text-jade',    bg: 'bg-jade/10 border-jade/30',    label: 'Approved' },
  partial:  { icon: MinusCircle,  color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30', label: 'Partial' },
  denied:   { icon: XCircle,      color: 'text-crimson',  bg: 'bg-crimson/10 border-crimson/30', label: 'Denied' },
  pending:  { icon: Clock,        color: 'text-muted-foreground', bg: 'bg-muted/20 border-border', label: 'Pending' },
};

export function TribunalView() {
  const { hero, tribunalCases, submitTribunalCase } = useGame();
  const [selectedType, setSelectedType] = useState<TribunalCaseType | null>(null);
  const [pleaText, setPleaText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<TribunalCase | null>(null);
  const [view, setView] = useState<'submit' | 'history'>('submit');

  if (!hero) return null;

  async function handleSubmit() {
    if (!selectedType || pleaText.trim().length < 10) return;
    setSubmitting(true);
    const tc = await submitTribunalCase(selectedType, pleaText.trim(), 'en');
    setResult(tc);
    setPleaText('');
    setSelectedType(null);
    setSubmitting(false);
  }

  const playerCases = tribunalCases.filter(c => c.hero_id === hero.id);
  const worldCases = tribunalCases.filter(c => c.is_ai_case || c.hero_id !== hero.id).slice(0, 8);

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
          <Scale className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <p className="font-calligraphy font-semibold text-sm">Heavenly Tribunal</p>
          <p className="text-xs text-muted-foreground">天庭仲裁 · Where celestial law rules</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-0.5 bg-muted/30 rounded-lg">
        <button onClick={() => setView('submit')} className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${view === 'submit' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'}`}>
          Submit Case
        </button>
        <button onClick={() => setView('history')} className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${view === 'history' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'}`}>
          World Cases ({tribunalCases.length})
        </button>
      </div>

      {view === 'submit' && (
        <div className="flex flex-col gap-3">
          {/* Result card */}
          {result && result.verdict && (() => {
            const vs = VERDICT_STYLES[result.verdict];
            const Icon = vs.icon;
            return (
              <div className={`rounded-xl border p-3 ${vs.bg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${vs.color}`} />
                  <span className={`text-sm font-semibold ${vs.color}`}>{vs.label}</span>
                  {result.reward_gold > 0 && <span className="ml-auto text-xs text-amber-500 font-medium">+{result.reward_gold} stones</span>}
                  {result.penalty_gold > 0 && <span className="ml-auto text-xs text-crimson font-medium">-{result.penalty_gold} stones</span>}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{result.judgment_text}</p>
                <button onClick={() => setResult(null)} className="mt-2 text-[10px] text-muted-foreground hover:text-foreground underline">Dismiss</button>
              </div>
            );
          })()}

          {/* Case type selection */}
          <div className="grid grid-cols-2 gap-2">
            {CASE_TYPES.map(ct => (
              <button
                key={ct.key}
                onClick={() => setSelectedType(selectedType === ct.key ? null : ct.key)}
                className={`rounded-lg border p-2.5 text-left transition-all ${
                  selectedType === ct.key
                    ? 'border-amber-500/60 bg-amber-500/10'
                    : 'border-border bg-card/50 hover:border-border/80'
                }`}
              >
                <span className="text-lg">{ct.icon}</span>
                <p className="text-xs font-semibold mt-1">{ct.label}</p>
                <p className="text-[10px] text-muted-foreground">{ct.desc}</p>
              </button>
            ))}
          </div>

          {/* Plea text */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground font-medium">Your Plea</label>
            <textarea
              value={pleaText}
              onChange={e => setPleaText(e.target.value)}
              placeholder="State your case before the Heavenly Court. Be truthful — the Jade Arbiter sees all..."
              className="w-full h-24 rounded-lg bg-muted/30 border border-border px-3 py-2 text-xs resize-none focus:outline-none focus:border-amber-500/50 placeholder:text-muted-foreground/50"
              maxLength={400}
            />
            <p className="text-[10px] text-muted-foreground text-right">{pleaText.length}/400</p>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!selectedType || pleaText.trim().length < 10 || submitting}
            className="w-full py-2.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-500 text-sm font-medium flex items-center justify-center gap-2 hover:bg-amber-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <><Clock className="w-4 h-4 animate-spin" /> Judging...</>
            ) : (
              <><Send className="w-4 h-4" /> Submit to Heavenly Court</>
            )}
          </button>

          {/* My cases */}
          {playerCases.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Your Cases</p>
              {playerCases.slice(0, 3).map(c => (
                <CaseRow key={c.id} c={c} />
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'history' && (
        <div className="flex flex-col gap-2">
          {tribunalCases.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8">The Heavenly Court awaits its first petitioner...</p>
          )}
          {[...playerCases, ...worldCases].map(c => (
            <CaseRow key={c.id} c={c} expanded />
          ))}
        </div>
      )}
    </div>
  );
}

function CaseRow({ c, expanded = false }: { c: TribunalCase; expanded?: boolean }) {
  const [open, setOpen] = useState(false);
  const vs = c.verdict ? VERDICT_STYLES[c.verdict] : VERDICT_STYLES.pending;
  const Icon = vs.icon;

  return (
    <div className={`rounded-lg border p-2.5 ${vs.bg} cursor-pointer`} onClick={() => setOpen(!open)}>
      <div className="flex items-center gap-2">
        <Icon className={`w-3.5 h-3.5 shrink-0 ${vs.color}`} />
        <span className="text-xs font-medium flex-1 truncate">{c.hero_name} · {c.case_type}</span>
        {c.is_ai_case && <span className="text-[9px] px-1.5 py-0.5 bg-muted/50 rounded text-muted-foreground">AI</span>}
        <span className={`text-[10px] font-medium ${vs.color}`}>{vs.label}</span>
      </div>
      {expanded && open && c.judgment_text && (
        <p className="mt-2 text-[10px] text-muted-foreground leading-relaxed whitespace-pre-line border-t border-border/30 pt-2">{c.judgment_text}</p>
      )}
      {expanded && !open && (
        <p className="mt-1 text-[10px] text-muted-foreground line-clamp-1">{c.plea_text}</p>
      )}
    </div>
  );
}
