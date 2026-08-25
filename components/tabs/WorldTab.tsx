'use client';

import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { useGame } from '@/lib/game/context';
import { DungeonView } from '@/components/game/DungeonView';
import { PetView } from '@/components/game/PetView';
import { QuestsPanel } from '@/components/game/QuestsPanel';
import { LeaderboardView } from '@/components/game/LeaderboardView';
import { TribunalView } from '@/components/game/TribunalView';
import { WagerView } from '@/components/game/WagerView';
import { FateBookView } from '@/components/game/FateBookView';

type WorldSubTab = 'dungeon' | 'quests' | 'pet' | 'board' | 'tribunal' | 'wager' | 'fate';
const ZONE_ICONS = ['🌾', '🎋', '🌫', '⛈', '🌊'];

export function WorldTab() {
  const { t } = useI18n();
  const { hero, activeDungeon, pet, quests, fateBook } = useGame();
  const [subTab, setSubTab] = useState<WorldSubTab>('dungeon');
  if (!hero) return null;
  const zoneIndex = Math.min(Math.floor(Object.values(hero.cultivation_paths).reduce((s, p) => s + p.level, 0) / 4), t.world.zones.length - 1);
  const zone = t.world.zones[zoneIndex];
  const zoneIcon = ZONE_ICONS[zoneIndex];
  const activeQuestCount = quests.filter(q => q.status === 'active').length;
  const completedQuestCount = quests.filter(q => q.status === 'completed').length;

  return (
    <div className="flex flex-col h-full p-3 gap-3">
      <div className="rounded-xl border border-border/50 bg-card/50 p-3 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-xl">{zoneIcon}</div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{t.world.currentZone}</p>
          <p className="font-calligraphy font-semibold text-sm">{zone}</p>
        </div>
        {activeDungeon && <span className="text-[10px] px-2 py-1 rounded-full bg-crimson/20 text-crimson animate-pulse font-medium">{t.world.exploring}</span>}
      </div>
      <div className="flex gap-1 p-0.5 bg-muted/30 rounded-xl shrink-0 overflow-x-auto">
        <SubTabBtn active={subTab === 'dungeon'} onClick={() => setSubTab('dungeon')} icon="⚔" label={t.world.dungeon} />
        <SubTabBtn active={subTab === 'quests'} onClick={() => setSubTab('quests')} icon="📋" label="Quests" badge={completedQuestCount > 0 ? String(completedQuestCount) : activeQuestCount > 0 ? String(activeQuestCount) : undefined} badgeColor={completedQuestCount > 0 ? 'text-jade' : 'text-muted-foreground'} />
        <SubTabBtn active={subTab === 'pet'} onClick={() => setSubTab('pet')} icon={pet ? '🦊' : '?'} label={pet?.name || 'Spirit Beast'} />
        <SubTabBtn active={subTab === 'board'} onClick={() => setSubTab('board')} icon="👑" label="Rank" />
        <SubTabBtn active={subTab === 'tribunal'} onClick={() => setSubTab('tribunal')} icon="⚖" label="Tribunal" />
        <SubTabBtn active={subTab === 'wager'} onClick={() => setSubTab('wager')} icon="💰" label="Wagers" />
        <SubTabBtn active={subTab === 'fate'} onClick={() => setSubTab('fate')} icon="📖" label="Fate Book" badge={fateBook?.status === 'completed' ? '!' : undefined} badgeColor="text-jade" />
      </div>
      <div className="flex-1 overflow-y-auto">
        {subTab === 'dungeon' && <DungeonView />}
        {subTab === 'quests' && <QuestsPanel />}
        {subTab === 'pet' && <PetView />}
        {subTab === 'board' && <LeaderboardView />}
        {subTab === 'tribunal' && <TribunalView />}
        {subTab === 'wager' && <WagerView />}
        {subTab === 'fate' && <FateBookView />}
      </div>
    </div>
  );
}

function SubTabBtn({ active, onClick, icon, label, badge, badgeColor }: { active: boolean; onClick: () => void; icon: string; label: string; badge?: string; badgeColor?: string }) {
  return (
    <button onClick={onClick} className={`shrink-0 py-2 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all duration-150 relative ${active ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
      <span>{icon}</span><span className="truncate max-w-[52px]">{label}</span>
      {badge && <span className={`text-[9px] font-bold ${badgeColor || 'text-muted-foreground'}`}>({badge})</span>}
    </button>
  );
}
