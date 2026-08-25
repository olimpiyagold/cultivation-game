'use client';

import { useState } from 'react';
import { Trophy, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { useGame } from '@/lib/game/context';
import { ACHIEVEMENTS } from '@/lib/game/achievements';
import type { AchievementCategory } from '@/lib/game/types';

const CAT_ICONS: Record<AchievementCategory, string> = {
  combat: '⚔', exploration: '🗺', cultivation: '☯', social: '🤝', legacy: '👑',
};

const CAT_COLORS: Record<AchievementCategory, string> = {
  combat: 'text-crimson', exploration: 'text-jade',
  cultivation: 'text-primary', social: 'text-amber-400', legacy: 'text-gold',
};

export function AchievementsPanel() {
  const { locale } = useI18n();
  const { achievements } = useGame();
  const [openCat, setOpenCat] = useState<AchievementCategory | null>('combat');

  const unlockedKeys = new Set(achievements.map(a => a.key));
  const categories: AchievementCategory[] = ['combat', 'exploration', 'cultivation', 'social', 'legacy'];

  const catLabels: Record<AchievementCategory, Record<'en'|'ru'|'zh', string>> = {
    combat:      { en: 'Combat',     ru: 'Бой',        zh: '战斗' },
    exploration: { en: 'Exploration', ru: 'Исследование', zh: '探索' },
    cultivation: { en: 'Cultivation', ru: 'Культивация',  zh: '修炼' },
    social:      { en: 'Social',     ru: 'Социальное', zh: '社交' },
    legacy:      { en: 'Legacy',     ru: 'Наследие',   zh: '传承' },
  };

  return (
    <div className="space-y-2">
      {/* Progress bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span className="flex items-center gap-1"><Trophy className="w-3 h-3 text-gold" /> Achievements</span>
        <span className="text-gold font-semibold">{unlockedKeys.size} / {ACHIEVEMENTS.length}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-gold/70 transition-all duration-700" style={{ width: `${(unlockedKeys.size / ACHIEVEMENTS.length) * 100}%` }} />
      </div>

      {/* Categories */}
      {categories.map(cat => {
        const catAchs = ACHIEVEMENTS.filter(a => a.category === cat);
        const catUnlocked = catAchs.filter(a => unlockedKeys.has(a.key)).length;
        const isOpen = openCat === cat;
        return (
          <div key={cat} className="rounded-xl border border-border/50 overflow-hidden">
            <button
              onClick={() => setOpenCat(isOpen ? null : cat)}
              className="w-full flex items-center gap-2.5 p-3 text-left hover:bg-muted/20 transition-colors"
            >
              <span className={`text-base ${CAT_COLORS[cat]}`}>{CAT_ICONS[cat]}</span>
              <span className="flex-1 text-sm font-medium">{catLabels[cat][locale]}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{catUnlocked}/{catAchs.length}</span>
                <div className="w-10 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${CAT_COLORS[cat].replace('text-', 'bg-')}/70`} style={{ width: `${(catUnlocked / catAchs.length) * 100}%` }} />
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-border/30 divide-y divide-border/20">
                {catAchs.map(def => {
                  const unlocked = unlockedKeys.has(def.key);
                  const achievement = achievements.find(a => a.key === def.key);
                  return (
                    <div key={def.key} className={`flex items-center gap-3 p-2.5 ${unlocked ? 'bg-card/30' : 'opacity-50'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0 ${unlocked ? 'bg-gold/20' : 'bg-muted/50'}`}>
                        {unlocked ? def.icon : <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium ${unlocked ? '' : 'blur-[1px]'}`}>
                          {def.secret && !unlocked ? '???' : def.name[locale]}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{def.description[locale]}</p>
                      </div>
                      {unlocked && achievement && (
                        <span className="text-[9px] text-muted-foreground shrink-0">
                          {new Date(achievement.unlocked_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
