'use client';

import { useI18n } from '@/lib/i18n/context';
import type { Hero, CultivationPathKey } from '@/lib/game/types';

const PATH_ICONS: Record<CultivationPathKey, string> = {
  sword: '⚔', alchemy: '⚗', trade: '💰', spirit: '✦', scholar: '📜',
};

const PATH_COLORS: Record<CultivationPathKey, string> = {
  sword:   'bg-crimson/70',
  alchemy: 'bg-jade/70',
  trade:   'bg-gold/70',
  spirit:  'bg-blue-400/70',
  scholar: 'bg-amber-600/70',
};

export function PathProgress({ hero }: { hero: Hero }) {
  const { t } = useI18n();
  const paths = hero.cultivation_paths;

  return (
    <div className="space-y-2.5">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.cultivation.paths}</h4>
      {(Object.keys(paths) as CultivationPathKey[]).map((key) => {
        const p = paths[key];
        const pct = Math.min(100, (p.xp / p.xp_to_next) * 100);
        return (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5">
                <span>{PATH_ICONS[key]}</span>
                <span className="font-medium">{t.paths[key]}</span>
                <span className="text-muted-foreground">Lv.{p.level}</span>
              </span>
              <span className="text-muted-foreground tabular-nums">{p.xp}/{p.xp_to_next}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${PATH_COLORS[key]}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
