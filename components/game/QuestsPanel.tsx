'use client';

import { Gift, Clock, BookOpen, RefreshCw } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { useGame } from '@/lib/game/context';
import type { Quest, QuestType } from '@/lib/game/types';

const TYPE_ICONS: Record<QuestType, React.ReactNode> = {
  daily:  <Clock className="w-3.5 h-3.5 text-jade" />,
  weekly: <RefreshCw className="w-3.5 h-3.5 text-primary" />,
  story:  <BookOpen className="w-3.5 h-3.5 text-gold" />,
};

const TYPE_COLORS: Record<QuestType, string> = {
  daily: 'border-jade/30 bg-jade/5',
  weekly: 'border-primary/30 bg-primary/5',
  story: 'border-gold/30 bg-gold/5',
};

const TYPE_BADGE: Record<QuestType, string> = {
  daily: 'text-jade bg-jade/10',
  weekly: 'text-primary bg-primary/10',
  story: 'text-gold bg-gold/10',
};

export function QuestsPanel() {
  const { locale } = useI18n();
  const { quests, claimQuestReward } = useGame();

  const active = quests.filter(q => q.status === 'active' || q.status === 'completed');
  const claimed = quests.filter(q => q.status === 'claimed');

  const typeLabelMap = {
    daily:  { en: 'Daily', ru: 'Ежедн.', zh: '日常' },
    weekly: { en: 'Weekly', ru: 'Еженед.', zh: '周常' },
    story:  { en: 'Story', ru: 'История', zh: '剧情' },
  };

  if (quests.length === 0) {
    return <p className="text-xs text-muted-foreground text-center py-8 italic">The Heavens are preparing your tasks...</p>;
  }

  return (
    <div className="space-y-2.5">
      {active.map(quest => <QuestCard key={quest.id} quest={quest} locale={locale} typeLabelMap={typeLabelMap} onClaim={claimQuestReward} />)}

      {claimed.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground font-semibold px-1">
            {locale === 'zh' ? '已完成' : locale === 'ru' ? 'Завершено' : 'Completed'}
          </p>
          {claimed.slice(-3).map(quest => (
            <div key={quest.id} className="flex items-center gap-2 p-2.5 rounded-xl border border-border/20 bg-muted/10 opacity-60">
              <span className="text-sm">✓</span>
              <p className="text-xs text-muted-foreground line-through">{quest.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QuestCard({
  quest, locale, typeLabelMap, onClaim,
}: {
  quest: Quest;
  locale: 'en' | 'ru' | 'zh';
  typeLabelMap: Record<string, Record<string, string>>;
  onClaim: (id: string) => Promise<void>;
}) {
  const isCompleted = quest.status === 'completed';
  const totalProgress = quest.objectives.reduce((s, o) => s + o.progress, 0);
  const totalAmount = quest.objectives.reduce((s, o) => s + o.amount, 0);
  const pct = totalAmount > 0 ? Math.min(100, (totalProgress / totalAmount) * 100) : 0;

  const expiresIn = quest.expires_at ? Math.max(0, Math.floor((new Date(quest.expires_at).getTime() - Date.now()) / 3600000)) : null;

  const rewardText = [
    quest.reward.gold ? `+${quest.reward.gold} ✦` : '',
    quest.reward.item_name ? quest.reward.item_name : '',
    quest.reward.path_xp ? `+XP` : '',
  ].filter(Boolean).join(' · ');

  return (
    <div className={`rounded-xl border p-3 space-y-2.5 ${isCompleted ? 'border-jade/40 bg-jade/5' : TYPE_COLORS[quest.quest_type]}`}>
      {/* Header */}
      <div className="flex items-start gap-2">
        <div className="mt-0.5">{TYPE_ICONS[quest.quest_type]}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-xs font-semibold">{quest.title}</p>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${TYPE_BADGE[quest.quest_type]}`}>
              {typeLabelMap[quest.quest_type][locale]}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{quest.description}</p>
        </div>
      </div>

      {/* Objectives */}
      <div className="space-y-1.5">
        {quest.objectives.map((obj, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span className="capitalize">{obj.type.replace(/_/g, ' ')}</span>
              <span className="tabular-nums font-medium">{obj.progress}/{obj.amount}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${obj.progress >= obj.amount ? 'bg-jade' : 'bg-primary/60'}`}
                style={{ width: `${Math.min(100, (obj.progress / obj.amount) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Gift className="w-3 h-3 text-gold" />
          <span>{rewardText || 'Reward'}</span>
          {expiresIn !== null && (
            <span className={`ml-2 ${expiresIn < 2 ? 'text-crimson' : ''}`}>· {expiresIn}h left</span>
          )}
        </div>
        {isCompleted && (
          <button
            onClick={() => onClaim(quest.id)}
            className="px-3 py-1 rounded-full bg-jade/20 text-jade text-[10px] font-semibold border border-jade/30 hover:bg-jade/30 transition-colors animate-pulse"
          >
            {locale === 'zh' ? '领取' : locale === 'ru' ? 'Забрать' : 'Claim!'}
          </button>
        )}
      </div>
    </div>
  );
}
