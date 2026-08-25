'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { ArkView } from '@/components/game/ArkView';
import { PavilionView } from '@/components/game/PavilionView';
import { BossLabView } from '@/components/game/BossLabView';
import { WorldEconomyView } from '@/components/game/WorldEconomyView';
import { MentorView } from '@/components/game/MentorView';

type SectSubTab = 'ark' | 'pavilion' | 'lab' | 'economy' | 'mentor';

export function SectTab() {
  const { t } = useI18n();
  const [subTab, setSubTab] = useState<SectSubTab>('ark');

  return (
    <div className="flex flex-col h-full p-3 gap-3">
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-full bg-jade/20 flex items-center justify-center text-xl">宗</div>
        <div><p className="font-calligraphy font-semibold">{t.sect.title}</p><p className="text-xs text-muted-foreground">懒云宗 · Lazy Cloud Sect</p></div>
      </div>
      <div className="grid grid-cols-5 gap-1 p-0.5 bg-muted/30 rounded-xl shrink-0">
        <SubTabBtn active={subTab === 'ark'} onClick={() => setSubTab('ark')} icon="⛵" label={t.sect.ark} />
        <SubTabBtn active={subTab === 'pavilion'} onClick={() => setSubTab('pavilion')} icon="🏪" label={t.sect.pavilion} />
        <SubTabBtn active={subTab === 'lab'} onClick={() => setSubTab('lab')} icon="⚗" label={t.sect.bossLab} />
        <SubTabBtn active={subTab === 'economy'} onClick={() => setSubTab('economy')} icon="📈" label="Economy" />
        <SubTabBtn active={subTab === 'mentor'} onClick={() => setSubTab('mentor')} icon="🎓" label="Mentor" />
      </div>
      <div className="flex-1 overflow-y-auto">
        {subTab === 'ark' && <ArkView />}
        {subTab === 'pavilion' && <PavilionView />}
        {subTab === 'lab' && <BossLabView />}
        {subTab === 'economy' && <WorldEconomyView />}
        {subTab === 'mentor' && <MentorView />}
      </div>
    </div>
  );
}

function SubTabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) {
  return (
    <button onClick={onClick} className={`py-2 rounded-lg text-[10px] font-medium flex flex-col items-center gap-0.5 transition-all duration-150 ${active ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
      <span className="text-sm">{icon}</span><span className="truncate w-full text-center px-0.5">{label}</span>
    </button>
  );
}
