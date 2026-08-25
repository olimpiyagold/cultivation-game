'use client';

import { useState } from 'react';
import { Swords, Globe2, Home as HomeIcon, Archive, MessageCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { useGame } from '@/lib/game/context';
import { CultivationTab } from '@/components/tabs/CultivationTab';
import { WorldTab } from '@/components/tabs/WorldTab';
import { SectTab } from '@/components/tabs/SectTab';
import { BagTab } from '@/components/tabs/BagTab';
import { ChatTab } from '@/components/tabs/ChatTab';
import { SettingsTab } from '@/components/tabs/SettingsTab';

type Tab = 'cultivation' | 'world' | 'sect' | 'bag' | 'profile';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('cultivation');
  const [showSettings, setShowSettings] = useState(false);
  const { t } = useI18n();
  const { hero, loading, activeDungeon, pet } = useGame();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center rice-paper dark:ink-wash">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="text-6xl font-calligraphy text-gold animate-pulse-glow">道</div>
            <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-jade/60 animate-ping" />
          </div>
          <p className="text-sm font-calligraphy text-muted-foreground">Loading the Dao...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-[420px] mx-auto rice-paper dark:ink-wash overflow-hidden relative">
      {/* Top App Bar */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-7 h-7 rounded-full bg-jade/20 flex items-center justify-center text-xs font-calligraphy text-jade hover:bg-jade/30 transition-colors"
          >
            道
          </button>
          <h1 className="text-base font-calligraphy font-semibold text-gold">{t.appName}</h1>
        </div>
        <div className="flex items-center gap-2">
          {activeDungeon && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-crimson/20 text-crimson animate-pulse">
              F{activeDungeon.current_floor}
            </span>
          )}
          {hero && (
            <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              {hero.stage}
            </span>
          )}
        </div>
      </header>

      {/* Settings overlay */}
      {showSettings && (
        <div className="absolute inset-0 z-20 bg-background/95 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
            <h2 className="font-calligraphy font-semibold">{t.settings.title}</h2>
            <button onClick={() => setShowSettings(false)} className="text-sm text-muted-foreground hover:text-foreground p-1">✕</button>
          </div>
          <SettingsTab />
        </div>
      )}

      {/* Tab content */}
      <main className="flex-1 min-h-0 overflow-hidden">
        <div className={`h-full ${activeTab === 'cultivation' ? 'block' : 'hidden'}`}>
          <CultivationTab />
        </div>
        <div className={`h-full ${activeTab === 'world' ? 'block' : 'hidden'}`}>
          <WorldTab />
        </div>
        <div className={`h-full ${activeTab === 'sect' ? 'block' : 'hidden'}`}>
          <SectTab />
        </div>
        <div className={`h-full ${activeTab === 'bag' ? 'block' : 'hidden'}`}>
          <BagTab />
        </div>
        <div className={`h-full ${activeTab === 'profile' ? 'block' : 'hidden'}`}>
          <ChatTab />
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="flex items-stretch border-t border-border/50 bg-background/90 backdrop-blur-sm shrink-0">
        <NavBtn active={activeTab === 'cultivation'} onClick={() => setActiveTab('cultivation')}
          icon={<Swords className="w-5 h-5" />} label={t.tabs.cultivation} />
        <NavBtn active={activeTab === 'world'} onClick={() => setActiveTab('world')}
          icon={<Globe2 className="w-5 h-5" />} label={t.tabs.world}
          badge={activeDungeon ? '!' : undefined} />
        <NavBtn active={activeTab === 'sect'} onClick={() => setActiveTab('sect')}
          icon={<HomeIcon className="w-5 h-5" />} label={t.tabs.sect} />
        <NavBtn active={activeTab === 'bag'} onClick={() => setActiveTab('bag')}
          icon={<Archive className="w-5 h-5" />} label={t.tabs.bag} />
        <NavBtn active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}
          icon={<MessageCircle className="w-5 h-5" />} label={t.tabs.profile} />
      </nav>
    </div>
  );
}

function NavBtn({
  active, onClick, icon, label, badge,
}: {
  active: boolean; onClick: () => void;
  icon: React.ReactNode; label: string; badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 relative transition-all duration-150 ${
        active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <div className={`transition-transform duration-150 ${active ? 'scale-110' : ''}`}>
        {icon}
        {active && (
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
        )}
        {badge && (
          <span className="absolute top-1.5 right-[calc(50%-14px)] w-3.5 h-3.5 rounded-full bg-crimson text-[8px] text-white flex items-center justify-center font-bold">
            {badge}
          </span>
        )}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
