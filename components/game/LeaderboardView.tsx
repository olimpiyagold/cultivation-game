'use client';

import { Crown, RefreshCw } from 'lucide-react';
import { useGame } from '@/lib/game/context';
import { useI18n } from '@/lib/i18n/context';

export function LeaderboardView() {
  const { leaderboard, hero } = useGame();
  const { locale } = useI18n();

  // Merge and sort: real player + AI entries
  const playerEntry = hero ? {
    id: hero.id,
    hero_id: hero.id,
    hero_name: hero.name,
    stage: hero.stage,
    total_ticks: hero.total_ticks ?? 0,
    commands_sent: hero.commands_sent ?? 0,
    laziness_score: Math.floor((hero.total_ticks ?? 0) / Math.max(1, hero.commands_sent ?? 1)),
    is_ai: false,
  } : null;

  const allEntries = [...leaderboard.filter(e => e.hero_id !== hero?.id)];
  if (playerEntry) allEntries.push(playerEntry);
  const sorted = allEntries.sort((a, b) => b.laziness_score - a.laziness_score).slice(0, 15);
  const playerRank = playerEntry ? sorted.findIndex(e => e.hero_id === hero?.id) + 1 : null;

  const labels = {
    en: { title: 'Laziness Ranking', score: 'Laziness Score', formula: 'Score = Ticks ÷ Commands Sent', myRank: 'Your Rank' },
    ru: { title: 'Рейтинг Лени', score: 'Счёт Лени', formula: 'Счёт = Тики ÷ Команды', myRank: 'Ваш Ранг' },
    zh: { title: '懒散排行榜', score: '懒散指数', formula: '得分 = 节拍 ÷ 命令数', myRank: '我的排名' },
  };
  const l = labels[locale];

  const RANK_COLORS = ['text-gold', 'text-zinc-400', 'text-amber-700', 'text-foreground'];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Crown className="w-4 h-4 text-gold" />
        <h3 className="font-calligraphy text-sm font-semibold">{l.title}</h3>
        {playerRank && (
          <span className="ml-auto text-xs text-primary font-semibold">
            {l.myRank}: #{playerRank}
          </span>
        )}
      </div>

      {/* Paradox hint */}
      <div className="text-[10px] text-muted-foreground bg-muted/30 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
        <RefreshCw className="w-3 h-3 shrink-0" />
        <span className="italic">{l.formula} — True power is not playing.</span>
      </div>

      {/* Rankings */}
      <div className="space-y-1.5">
        {sorted.map((entry, index) => {
          const isPlayer = entry.hero_id === hero?.id;
          const rank = index + 1;
          const rankColor = RANK_COLORS[Math.min(rank - 1, 3)];

          return (
            <div
              key={entry.id || index}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${
                isPlayer ? 'border-primary/40 bg-primary/10 scale-[1.01]' : 'border-border/30 bg-card/20'
              }`
            >
              {/* Rank */}
              <span className={`text-sm font-bold w-5 text-center shrink-0 ${rankColor}`}>
                {rank <= 3 ? ['👑','🥈','🥉'][rank - 1] : `#${rank}`}
              </span>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className={`text-xs font-semibold truncate ${isPlayer ? 'text-primary' : ''}`}>{entry.hero_name}</p>
                  {isPlayer && <span className="text-[9px] text-primary bg-primary/10 px-1 rounded">YOU</span>}
                  {entry.is_ai && <span className="text-[9px] text-muted-foreground bg-muted/50 px-1 rounded">NPC</span>}
                </div>
                <p className="text-[10px] text-muted-foreground">{entry.stage} · {entry.total_ticks} ticks · {entry.commands_sent} cmds</p>
              </div>

              {/* Score */}
              <div className="text-right shrink-0">
                <p className={`text-sm font-bold tabular-nums ${rank <= 3 ? rankColor : 'text-foreground'}`}>
                  {entry.laziness_score.toLocaleString()}
                </p>
                <p className="text-[9px] text-muted-foreground">{l.score}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
