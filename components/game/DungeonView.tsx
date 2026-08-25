'use client';

import { useState } from 'react';
import { Shield, Zap, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { useGame } from '@/lib/game/context';
import type { DungeonType } from '@/lib/game/types';

const DUNGEON_TYPES: { type: DungeonType; minLevel: number; icon: string; element: string }[] = [
  { type: 'cave',      minLevel: 1,  icon: '🪨', element: 'Earth' },
  { type: 'ruins',     minLevel: 3,  icon: '🏛', element: 'Wind'  },
  { type: 'cloudtop',  minLevel: 5,  icon: '☁', element: 'Water' },
  { type: 'abyss',     minLevel: 8,  icon: '🌑', element: 'Dark'  },
  { type: 'celestial', minLevel: 12, icon: '✨', element: 'Light' },
];

const RARITY_REWARDS = {
  cave:      ['Spirit Stone x5', 'Healing Pill x2'],
  ruins:     ['Ancient Scroll', 'Spirit Iron x3'],
  cloudtop:  ['Cloud Silk x2', 'Rare Pill'],
  abyss:     ['Demon Essence', 'Epic Weapon'],
  celestial: ['Legendary Artifact', 'Celestial Elixir'],
};

export function DungeonView() {
  const { t } = useI18n();
  const { activeDungeon, hero, enterDungeon, exitDungeon } = useGame();
  const [expanded, setExpanded] = useState<DungeonType | null>(null);

  const heroLevel = hero ? Math.max(1, Object.values(hero.cultivation_paths).reduce((sum, p) => sum + p.level, 0)) : 1;

  if (activeDungeon && activeDungeon.status === 'active') {
    const pct = ((activeDungeon.current_floor - 1) / activeDungeon.max_floor) * 100;
    const isBossFloor = activeDungeon.current_floor === activeDungeon.max_floor;
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-crimson/30 bg-crimson/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-calligraphy font-semibold text-sm">{activeDungeon.dungeon_name}</h3>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isBossFloor ? 'bg-crimson/20 text-crimson animate-pulse' : 'bg-jade/20 text-jade'}`}>
              {isBossFloor ? t.world.boss : t.world.exploring}
            </span>
          </div>

          {/* Floor Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t.world.floor} {activeDungeon.current_floor} / {activeDungeon.max_floor}</span>
              <span>{activeDungeon.enemies_defeated} {t.world.enemies}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${isBossFloor ? 'bg-crimson' : 'bg-jade'}`}
                style={{ width: `${Math.max(5, pct)}%` }}
              />
            </div>
            {/* Floor indicators */}
            <div className="flex gap-0.5 mt-1">
              {Array.from({ length: activeDungeon.max_floor }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                    i < activeDungeon.current_floor ? 'bg-jade' :
                    i === activeDungeon.max_floor - 1 ? 'bg-crimson/40' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={exitDungeon}
            className="w-full py-2 rounded-lg border border-border/50 text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            {t.world.exitDungeon}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <p className="text-xs text-muted-foreground">{t.world.selectDungeon}</p>
      {DUNGEON_TYPES.map(({ type, minLevel, icon, element }) => {
        const isLocked = heroLevel < minLevel;
        const isOpen = expanded === type;
        const dungeonName = t.world.dungeons[type];

        return (
          <div
            key={type}
            className={`rounded-xl border transition-all duration-200 overflow-hidden ${
              isLocked ? 'border-border/30 opacity-50' : 'border-border/50 hover:border-border'
            }`}
          >
            <button
              onClick={() => !isLocked && setExpanded(isOpen ? null : type)}
              disabled={isLocked}
              className="w-full flex items-center gap-3 p-3 text-left"
            >
              <span className="text-xl w-8 text-center">{icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{dungeonName}</span>
                  {isLocked && <span className="text-[10px] text-muted-foreground">Lv.{minLevel}</span>}
                </div>
                <span className="text-[10px] text-muted-foreground">{element} Element · {10 - (minLevel - 1)} floors</span>
              </div>
              {!isLocked && (isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />)}
            </button>

            {isOpen && !isLocked && (
              <div className="px-3 pb-3 space-y-2 border-t border-border/30 pt-2">
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Rewards: </span>
                  {RARITY_REWARDS[type].join(', ')}
                </div>
                <button
                  onClick={() => enterDungeon(type)}
                  className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  {t.world.enterDungeon}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
