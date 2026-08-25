'use client';

import { useI18n } from '@/lib/i18n/context';

interface Props {
  value: number; // -100 to 100
}

export function YinYangMeter({ value }: Props) {
  const { t } = useI18n();

  // value: negative = yin, positive = yang
  const yinPct = value < 0 ? Math.abs(value) : 0;
  const yangPct = value > 0 ? value : 0;
  const isBalanced = Math.abs(value) < 10;

  const label = isBalanced ? t.cultivation.balanced : value < 0 ? t.cultivation.yin : t.cultivation.yang;
  const labelColor = isBalanced ? 'text-jade' : value < 0 ? 'text-blue-400' : 'text-amber-400';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{t.cultivation.yinYang}</span>
        <span className={`font-medium ${labelColor}`}>{label} {isBalanced ? '' : `${Math.abs(value)}%`}</span>
      </div>
      <div className="relative h-3 w-full rounded-full bg-muted overflow-hidden">
        {/* Center balance line */}
        <div className="absolute inset-y-0 left-1/2 w-px bg-border/50 z-10" />
        {/* Yin (blue, from center left) */}
        <div
          className="absolute inset-y-0 right-1/2 bg-gradient-to-l from-blue-400/70 to-blue-600/40 transition-all duration-700"
          style={{ width: `${yinPct / 2}%` }}
        />
        {/* Yang (gold, from center right) */}
        <div
          className="absolute inset-y-0 left-1/2 bg-gradient-to-r from-amber-400/70 to-amber-600/40 transition-all duration-700"
          style={{ width: `${yangPct / 2}%` }}
        />
        {/* Yin/Yang symbol when balanced */}
        {isBalanced && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[8px] text-jade/80">☯</span>
          </div>
        )}
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{t.cultivation.yin}</span>
        <span>{t.cultivation.yang}</span>
      </div>
    </div>
  );
}
