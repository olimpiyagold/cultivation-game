'use client';

import { useI18n } from '@/lib/i18n/context';
import { useGame } from '@/lib/game/context';
import type { Pet } from '@/lib/game/types';

const PET_EMOJIS: Record<Pet['type'], string> = {
  fox: '🦊', crane: '🦢', tiger: '🐯', turtle: '🐢', dragon_carp: '🐟', rabbit: '🐰',
};

const PET_MOOD_ICONS: Record<Pet['mood'], { icon: string; color: string }> = {
  happy:   { icon: '😊', color: 'text-jade' },
  excited: { icon: '🤩', color: 'text-gold' },
  neutral: { icon: '😐', color: 'text-muted-foreground' },
  sad:     { icon: '😢', color: 'text-blue-400' },
  angry:   { icon: '😠', color: 'text-crimson' },
  hungry:  { icon: '😋', color: 'text-amber-500' },
};

const PET_EVO_NAMES: Record<number, string> = {
  0: 'Newborn', 1: 'Young', 2: 'Mature', 3: 'Ancient',
};

export function PetView() {
  const { t } = useI18n();
  const { pet, updatePet } = useGame();

  if (!pet) return null;

  const xpPct = Math.min(100, (pet.xp / pet.xp_to_next) * 100);
  const hungerPct = pet.hunger;
  const { icon: moodIcon, color: moodColor } = PET_MOOD_ICONS[pet.mood];

  return (
    <div className="space-y-4">
      {/* Pet card */}
      <div className="relative rounded-xl border border-border/50 bg-card/50 p-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center text-3xl">
          {PET_EMOJIS[pet.type]}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-calligraphy font-semibold">{pet.name}</p>
            <span className={`text-sm ${moodColor}`}>{moodIcon}</span>
          </div>
          <p className="text-xs text-muted-foreground capitalize">{pet.type} · {PET_EVO_NAMES[pet.evolution_stage]} · Lv.{pet.level}</p>
          <p className="text-xs text-muted-foreground italic">"{pet.personality}"</p>
        </div>
        {/* Evolution stars */}
        <div className="absolute top-2 right-3 flex gap-0.5">
          {[0,1,2,3].map(i => (
            <span key={i} className={`text-[10px] ${i < pet.evolution_stage ? 'text-gold' : 'text-muted'}`}>★</span>
          ))}
        </div>
      </div>

      {/* XP Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>XP</span>
          <span>{pet.xp}/{pet.xp_to_next}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-jade/70 transition-all duration-700" style={{ width: `${xpPct}%` }} />
        </div>
      </div>

      {/* Hunger Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Hunger</span>
          <span>{hungerPct}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${hungerPct > 50 ? 'bg-amber-400/70' : hungerPct > 20 ? 'bg-amber-600/70' : 'bg-crimson/70'}`}
            style={{ width: `${hungerPct}%` }}
          />
        </div>
      </div>

      {/* Abilities */}
      {pet.abilities.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Abilities</p>
          <div className="flex flex-wrap gap-1.5">
            {pet.abilities.map((ab, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{ab}</span>
            ))}
          </div>
        </div>
      )}

      {/* Feed button */}
      {pet.hunger < 100 && (
        <button
          onClick={() => updatePet({ hunger: Math.min(100, pet.hunger + 30), mood: 'happy' })}
          className="w-full py-2.5 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/30 text-xs font-medium hover:bg-amber-500/30 transition-colors"
        >
          🍖 Feed Spirit Pill (+30 Hunger)
        </button>
      )}
    </div>
  );
}
