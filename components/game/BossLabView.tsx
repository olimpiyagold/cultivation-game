'use client';

import { useState } from 'react';
import { Flame, Sparkles, Zap, Droplets, Wind } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { useGame } from '@/lib/game/context';
import type { BossEssence } from '@/lib/game/types';

const ELEMENT_ICONS: Record<string, React.ReactNode> = {
  Fire:      <Flame className="w-3.5 h-3.5 text-crimson" />,
  Water:     <Droplets className="w-3.5 h-3.5 text-blue-400" />,
  Lightning: <Zap className="w-3.5 h-3.5 text-gold" />,
  Wind:      <Wind className="w-3.5 h-3.5 text-jade" />,
  Dark:      <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />,
  Light:     <Sparkles className="w-3.5 h-3.5 text-amber-300" />,
  Earth:     <span className="text-xs">⛰</span>,
};

function craftMinion(essences: BossEssence[]) {
  const elements = essences.map(e => e.element);
  const dominant = elements.sort((a, b) => elements.filter(v => v === a).length - elements.filter(v => v === b).length).pop();
  const totalPotency = essences.reduce((s, e) => s + e.potency, 0);
  const minionNames = {
    Fire: 'Ember Wraith', Water: 'Tide Phantom', Lightning: 'Thunder Golem',
    Wind: 'Gale Spirit', Dark: 'Shadow Revenant', Light: 'Radiant Servitor', Earth: 'Stone Sentinel',
  };
  return {
    name: minionNames[dominant as keyof typeof minionNames] || 'Chaos Construct',
    description: `Crafted from ${essences.length} essences. Bound to serve until the next moon cycle.`,
    power: Math.floor(totalPotency / essences.length) + essences.length * 5,
    element: dominant || 'Chaos',
    created_at: new Date().toISOString(),
  };
}

export function BossLabView() {
  const { t } = useI18n();
  const { bossLab, updateBossLab } = useGame();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [crafting, setCrafting] = useState(false);

  if (!bossLab) return null;

  const essences = bossLab.essences || [];
  const canCraft = selected.size >= 2;

  const toggleEssence = (i: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else if (next.size < 5) next.add(i);
      return next;
    });
  };

  const handleCraft = async () => {
    if (!canCraft) return;
    setCrafting(true);
    const chosenEssences = Array.from(selected).map(i => essences[i]);
    const minion = craftMinion(chosenEssences);
    const remaining = essences.filter((_, i) => !selected.has(i));
    await updateBossLab({
      essences: remaining,
      active_minion: minion,
      total_crafted: bossLab.total_crafted + 1,
    });
    setSelected(new Set());
    setCrafting(false);
  };

  return (
    <div className="space-y-4">
      {/* Active minion */}
      <div className="p-3 rounded-xl border border-border/50 bg-card/50">
        <p className="text-xs font-semibold text-muted-foreground mb-2">{t.sect.activeMinion}</p>
        {bossLab.active_minion ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-lg">
              {ELEMENT_ICONS[bossLab.active_minion.element] || '👾'}
            </div>
            <div>
              <p className="text-sm font-semibold">{bossLab.active_minion.name}</p>
              <p className="text-[10px] text-muted-foreground">{bossLab.active_minion.element} · Power {bossLab.active_minion.power}</p>
              <p className="text-[10px] text-muted-foreground italic">{bossLab.active_minion.description}</p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">{t.sect.noMinion}</p>
        )}
      </div>

      {/* Essences */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">{t.sect.essences} ({essences.length})</p>
        {essences.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-4 text-center">{t.sect.noEssences}</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {essences.map((essence, i) => (
              <button
                key={i}
                onClick={() => toggleEssence(i)}
                className={`p-2.5 rounded-xl border text-left transition-all duration-150 ${
                  selected.has(i) ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-border/50 bg-card/30 hover:bg-card/60'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  {ELEMENT_ICONS[essence.element] || <Sparkles className="w-3.5 h-3.5" />}
                  <span className="text-xs font-medium">{essence.element}</span>
                </div>
                <p className="text-[10px] text-muted-foreground line-clamp-1">{essence.name}</p>
                <p className="text-[10px] text-primary mt-0.5">Potency: {essence.potency}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Craft button */}
      {essences.length > 0 && (
        <button
          onClick={handleCraft}
          disabled={!canCraft || crafting}
          className={`w-full py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2 ${
            canCraft && !crafting
              ? 'bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30'
              : 'bg-muted/30 text-muted-foreground cursor-not-allowed'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          {crafting ? 'Refining...' : `${t.sect.craft} (${selected.size}/2+ selected)`}
        </button>
      )}
    </div>
  );
}
