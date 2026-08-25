'use client';

import { ArrowUp, Anchor, Zap, Shield, Leaf, Hammer } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { useGame } from '@/lib/game/context';
import type { Ark, ArkRoom } from '@/lib/game/types';
import { ARK_ROOM_COSTS } from '@/lib/game/types';

const ROOM_ICONS: Record<ArkRoom, React.ReactNode> = {
  cabin:    <Anchor className="w-4 h-4" />,
  engine:   <Zap className="w-4 h-4" />,
  armory:   <Shield className="w-4 h-4" />,
  garden:   <Leaf className="w-4 h-4" />,
  workshop: <Hammer className="w-4 h-4" />,
};

const ROOM_COLORS: Record<ArkRoom, string> = {
  cabin:    'text-blue-400',
  engine:   'text-amber-400',
  armory:   'text-crimson',
  garden:   'text-jade',
  workshop: 'text-orange-400',
};

function canAfford(materials: Ark['materials'], cost: Partial<Ark['materials']>): boolean {
  return Object.entries(cost).every(([k, v]) => (materials[k as keyof Ark['materials']] ?? 0) >= (v ?? 0));
}

export function ArkView() {
  const { t } = useI18n();
  const { ark, upgradeArkRoom } = useGame();

  if (!ark) return null;

  const rooms: ArkRoom[] = ['cabin', 'engine', 'armory', 'garden', 'workshop'];

  return (
    <div className="space-y-4">
      {/* Ark Name & Stats */}
      <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card/50">
        <span className="text-2xl">⛵</span>
        <div>
          <p className="font-calligraphy font-semibold text-sm">{ark.name}</p>
          <p className="text-xs text-muted-foreground">{ark.total_voyages} {t.sect.voyages}</p>
        </div>
      </div>

      {/* Materials */}
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(ark.materials) as (keyof Ark['materials'])[]).map(mat => (
          <div key={mat} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 text-xs">
            <span className="text-muted-foreground">{t.sect.materials[mat]}</span>
            <span className="ml-auto font-semibold tabular-nums">{ark.materials[mat]}</span>
          </div>
        ))}
      </div>

      {/* Rooms */}
      <div className="space-y-2">
        {rooms.map((room) => {
          const level = ark[`${room}_level` as keyof Ark] as number;
          const maxed = level >= 3;
          const nextCost = maxed ? null : ARK_ROOM_COSTS[room][level + 1];
          const affordable = nextCost ? canAfford(ark.materials, nextCost) : false;

          return (
            <div key={room} className="p-3 rounded-xl border border-border/50 bg-card/30">
              <div className="flex items-center gap-2 mb-2">
                <span className={ROOM_COLORS[room]}>{ROOM_ICONS[room]}</span>
                <span className="text-sm font-medium">{t.sect.rooms[room]}</span>
                <div className="ml-auto flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className={`w-2 h-2 rounded-full ${i < level ? 'bg-primary' : 'bg-muted'}`} />
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{t.sect.roomDesc[room]}</p>
              {!maxed && nextCost && (
                <button
                  onClick={() => affordable && upgradeArkRoom(room)}
                  disabled={!affordable}
                  className={`w-full py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                    affordable
                      ? 'bg-primary/20 text-primary hover:bg-primary/30'
                      : 'bg-muted/30 text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  <ArrowUp className="w-3 h-3" />
                  {t.sect.upgrade}: {Object.entries(nextCost).map(([k, v]) => `${t.sect.materials[k as keyof Ark['materials']]} x${v}`).join(', ')}
                </button>
              )}
              {maxed && (
                <div className="text-center text-xs text-gold font-medium py-1">★ Max Level</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
