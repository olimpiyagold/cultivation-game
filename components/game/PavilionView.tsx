'use client';

import { useState } from 'react';
import { TrendingUp, Users, Coins } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { useGame } from '@/lib/game/context';
import type { Pavilion } from '@/lib/game/types';

function estimatePendingIncome(pavilion: Pavilion): number {
  const ms = Date.now() - new Date(pavilion.last_collected_at).getTime();
  const ticks = Math.floor(ms / 10000);
  return Math.min(ticks * pavilion.income_per_tick, pavilion.level * 500);
}

const SHOP_ICONS = { pill: '⚗', equipment: '⚔', talisman: '📜' };

export function PavilionView() {
  const { t } = useI18n();
  const { pavilion, collectPavilionIncome, updatePavilion, hero } = useGame();
  const [collecting, setCollecting] = useState(false);

  if (!pavilion) return null;

  const pending = estimatePendingIncome(pavilion);

  const handleCollect = async () => {
    setCollecting(true);
    await collectPavilionIncome();
    setTimeout(() => setCollecting(false), 600);
  };

  const UPGRADE_COST = pavilion.level * 100;
  const canUpgrade = (hero?.gold ?? 0) >= UPGRADE_COST;

  return (
    <div className="space-y-4">
      {/* Pavilion header */}
      <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card/50">
        <span className="text-2xl">{SHOP_ICONS[pavilion.shop_type]}</span>
        <div className="flex-1">
          <p className="font-calligraphy font-semibold text-sm">{pavilion.name}</p>
          <p className="text-xs text-muted-foreground">{t.sect.shopTypes[pavilion.shop_type]} · Lv.{pavilion.level}</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center p-2 rounded-xl bg-muted/30 text-center">
          <Coins className="w-4 h-4 text-gold mb-1" />
          <span className="text-sm font-semibold">{pavilion.income_per_tick}</span>
          <span className="text-[10px] text-muted-foreground">{t.sect.income}</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-xl bg-muted/30 text-center">
          <Users className="w-4 h-4 text-jade mb-1" />
          <span className="text-sm font-semibold">{pavilion.staff_count}</span>
          <span className="text-[10px] text-muted-foreground">{t.sect.staffHired}</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-xl bg-muted/30 text-center">
          <TrendingUp className="w-4 h-4 text-primary mb-1" />
          <span className="text-sm font-semibold">{pavilion.total_earned}</span>
          <span className="text-[10px] text-muted-foreground">{t.sect.totalEarned}</span>
        </div>
      </div>

      {/* Collect income */}
      {pending > 0 && (
        <button
          onClick={handleCollect}
          disabled={collecting}
          className={`w-full py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
            collecting ? 'bg-muted text-muted-foreground' : 'bg-gold/20 text-gold border border-gold/30 hover:bg-gold/30'
          }`}
        >
          <Coins className="w-4 h-4" />
          {collecting ? '...' : `${t.sect.collect} (+${pending} ✦)`}
        </button>
      )}

      {/* Upgrade */}
      <div className="p-3 rounded-xl border border-border/30 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Upgrade pavilion</span>
          <span className="font-medium text-gold">{UPGRADE_COST} ✦</span>
        </div>
        <button
          onClick={() => canUpgrade && updatePavilion({
            level: pavilion.level + 1,
            income_per_tick: pavilion.income_per_tick + 2,
          })}
          disabled={!canUpgrade}
          className={`w-full py-2 rounded-lg text-xs font-medium transition-all ${
            canUpgrade ? 'bg-primary/20 text-primary hover:bg-primary/30' : 'bg-muted/30 text-muted-foreground cursor-not-allowed'
          }`}
        >
          <TrendingUp className="w-3 h-3 inline mr-1" />
          Upgrade (Lv.{pavilion.level} → {pavilion.level + 1})
        </button>
      </div>
    </div>
  );
}
