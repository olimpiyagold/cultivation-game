'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Flame, Droplets, Wind, Zap } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { useGame } from '@/lib/game/context';
import type { MarketActivity } from '@/lib/game/types';

const ACTIVITY_CONFIG: Record<MarketActivity, { color: string; label: Record<'en'|'ru'|'zh', string>; mult: string }> = {
  crashing: { color: 'text-crimson border-crimson/40 bg-crimson/10', label: { en: 'Crashing', ru: 'Обвал', zh: '崩盘' }, mult: '×0.5' },
  low:      { color: 'text-amber-600 border-amber-600/40 bg-amber-600/10', label: { en: 'Low', ru: 'Низкий', zh: '低迷' }, mult: '×0.75' },
  normal:   { color: 'text-foreground border-border/40 bg-muted/20', label: { en: 'Normal', ru: 'Норма', zh: '正常' }, mult: '×1.0' },
  high:     { color: 'text-jade border-jade/40 bg-jade/10', label: { en: 'High', ru: 'Высокий', zh: '兴旺' }, mult: '×1.5' },
  boom:     { color: 'text-gold border-gold/40 bg-gold/10', label: { en: 'Boom!', ru: 'Бум!', zh: '繁荣！' }, mult: '×2.0' },
};

const ELEMENT_ICONS: Record<string, React.ReactNode> = {
  Fire:      <Flame className="w-4 h-4 text-crimson" />,
  Water:     <Droplets className="w-4 h-4 text-blue-400" />,
  Wind:      <Wind className="w-4 h-4 text-jade" />,
  Lightning: <Zap className="w-4 h-4 text-gold" />,
  Earth:     <span className="text-sm">⛰</span>,
};

const INVEST_AMOUNTS = [100, 300, 500];

export function WorldEconomyView() {
  const { locale } = useI18n();
  const { economy, hero, investInEconomy } = useGame();
  const [investing, setInvesting] = useState(false);

  if (!economy) return null;

  const cfg = ACTIVITY_CONFIG[economy.market_activity];
  const TrendIcon = economy.trend === 'rising' ? TrendingUp : economy.trend === 'falling' ? TrendingDown : Minus;
  const trendColor = economy.trend === 'rising' ? 'text-jade' : economy.trend === 'falling' ? 'text-crimson' : 'text-muted-foreground';

  const labels = {
    en: { title: 'World Economy', invest: 'Invest Spirit Stones', activity: 'Market Activity', element: 'Dominant Element', income: 'Pavilion Income', sects: 'Total Invested', threshold: 'Next boost at 1000 invested' },
    ru: { title: 'Мировая Экономика', invest: 'Инвестировать', activity: 'Активность Рынка', element: 'Доминирующий Элемент', income: 'Доход Павильона', sects: 'Всего Вложено', threshold: 'Следующий буст при 1000 вложенных' },
    zh: { title: '天下经济', invest: '投资灵石', activity: '市场活跃度', element: '主导灵气', income: '灵市收益', sects: '总投资', threshold: '投资满1000触发下一阶段' },
  };
  const l = labels[locale];

  const handleInvest = async (amount: number) => {
    if (investing || !hero || hero.gold < amount) return;
    setInvesting(true);
    await investInEconomy(amount);
    setTimeout(() => setInvesting(false), 800);
  };

  const nextThreshold = 1000 - (economy.total_sect_investment % 1000);
  const investPct = Math.min(100, ((economy.total_sect_investment % 1000) / 1000) * 100);

  return (
    <div className="space-y-4">
      {/* Market status card */}
      <div className={`rounded-xl border p-4 space-y-3 ${cfg.color}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground">{l.activity}</p>
            <p className="font-calligraphy font-semibold text-lg">{cfg.label[locale]}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{cfg.mult}</p>
            <p className="text-[10px] text-muted-foreground">{l.income}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <TrendIcon className={`w-4 h-4 ${trendColor}`} />
          <span className={trendColor}>{economy.trend}</span>
          <span className="text-muted-foreground mx-1">·</span>
          <span className="flex items-center gap-1">
            {ELEMENT_ICONS[economy.dominant_element] || <span>?</span>}
            {l.element}: {economy.dominant_element}
          </span>
        </div>
      </div>

      {/* Sect investment progress */}
      <div className="p-3 rounded-xl border border-border/50 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{l.sects}</span>
          <span className="font-semibold">{economy.total_sect_investment} ✦</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-jade to-gold transition-all duration-700" style={{ width: `${investPct}%` }} />
        </div>
        <p className="text-[10px] text-muted-foreground">{l.threshold} ({nextThreshold} more)</p>
      </div>

      {/* Invest buttons */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">{l.invest}</p>
        <div className="grid grid-cols-3 gap-2">
          {INVEST_AMOUNTS.map(amount => {
            const canAfford = (hero?.gold ?? 0) >= amount;
            return (
              <button
                key={amount}
                onClick={() => handleInvest(amount)}
                disabled={!canAfford || investing}
                className={`py-2.5 rounded-xl text-xs font-medium border transition-all ${
                  canAfford && !investing
                    ? 'border-jade/30 bg-jade/10 text-jade hover:bg-jade/20'
                    : 'border-border/20 bg-muted/20 text-muted-foreground cursor-not-allowed'
                }`}
              >
                <span className="block font-bold">{amount}</span>
                <span className="text-[9px]">✦</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Activity history bar */}
      <div className="p-3 rounded-xl border border-border/30 space-y-1.5">
        <p className="text-xs text-muted-foreground font-medium">Market Levels</p>
        <div className="flex gap-1 items-end h-8">
          {(['crashing','low','normal','high','boom'] as MarketActivity[]).map(level => {
            const heights = { crashing: 20, low: 40, normal: 60, high: 80, boom: 100 };
            const isActive = level === economy.market_activity;
            return (
              <div key={level} className="flex-1 flex flex-col items-center gap-0.5">
                <div
                  className={`w-full rounded-t transition-all duration-500 ${isActive ? ACTIVITY_CONFIG[level].color.split(' ')[0].replace('text-', 'bg-') + '/70' : 'bg-muted/40'}`}
                  style={{ height: `${heights[level]}%` }}
                />
                {isActive && <div className="w-1 h-1 rounded-full bg-current" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
