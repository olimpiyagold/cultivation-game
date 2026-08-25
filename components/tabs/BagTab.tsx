'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { useGame } from '@/lib/game/context';
import { EquipmentPanel } from '@/components/game/EquipmentPanel';
import type { Item } from '@/lib/game/types';
import { RARITY_COLORS, RARITY_BORDER } from '@/lib/game/types';

type BagSubTab = 'inventory' | 'equipment' | 'alchemy';

const ITEM_TYPE_ICONS: Record<Item['item_type'], string> = {
  weapon: '⚔', armor: '🥋', helmet: '⛑', boots: '👢',
  accessory: '💍', pill: '💊', material: '🪨', scroll: '📜', essence: '✨',
};

const ALCH_RECIPES = [
  { name: 'Foundation Pill', name_zh: '筑基丹', requires: ['Healing Pill', 'Spirit Stone Fragment'], result: { rarity: 'uncommon' as const, stats: { hp: 50, spirit: 3 } } },
  { name: 'Spirit Iron Sword', name_zh: '灵铁剑', requires: ['Spirit Iron', 'Spirit Iron'], result: { rarity: 'uncommon' as const, stats: { attack: 8 } } },
  { name: 'Cloud Silk Robe', name_zh: '云衣', requires: ['Cloud Silk', 'Cloud Silk'], result: { rarity: 'uncommon' as const, stats: { defense: 6, spirit: 2 } } },
];

export function BagTab() {
  const { t } = useI18n();
  const { inventory, addItem, hero } = useGame();
  const [subTab, setSubTab] = useState<BagSubTab>('inventory');
  const [selectedForAlch, setSelectedForAlch] = useState<string[]>([]);

  const nonEquipped = inventory.filter(i => !i.equipped_slot);

  const handleAlchToggle = (name: string) => {
    setSelectedForAlch(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : prev.length < 2 ? [...prev, name] : prev
    );
  };

  const tryRecipe = async () => {
    if (selectedForAlch.length < 2 || !hero) return;
    const recipe = ALCH_RECIPES.find(r =>
      r.requires.every(req => selectedForAlch.includes(req)) && selectedForAlch.every(s => r.requires.includes(s))
    );
    if (!recipe) return;
    for (const req of recipe.requires) {
      const item = inventory.find(i => i.name === req);
      if (!item || item.quantity < recipe.requires.filter(r => r === req).length) return;
    }
    await addItem({
      name: recipe.name, name_zh: recipe.name_zh,
      item_type: 'pill', rarity: recipe.result.rarity,
      stats: recipe.result.stats, source: 'Alchemy', quantity: 1,
    });
    setSelectedForAlch([]);
  };

  return (
    <div className="flex flex-col h-full p-3 gap-3">
      <div className="flex gap-1 p-0.5 bg-muted/30 rounded-xl shrink-0">
        <SubTabBtn active={subTab === 'inventory'} onClick={() => setSubTab('inventory')} icon="🎒" label={t.bag.inventory} />
        <SubTabBtn active={subTab === 'equipment'} onClick={() => setSubTab('equipment')} icon="⚔" label={t.bag.equipment} />
        <SubTabBtn active={subTab === 'alchemy'} onClick={() => setSubTab('alchemy')} icon="⚗" label={t.bag.alchemy} />
      </div>
      <div className="flex-1 overflow-y-auto">
        {subTab === 'inventory' && (
          <div className="space-y-1.5">
            {inventory.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-10 italic">{t.bag.empty}</p>
            ) : (
              inventory.map(item => <InventoryRow key={item.id} item={item} />)
            )}
          </div>
        )}
        {subTab === 'equipment' && <EquipmentPanel />}
        {subTab === 'alchemy' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground">{t.bag.combineHint}</p>
              <div className="space-y-1">
                {nonEquipped.filter(i => ['material', 'pill'].includes(i.item_type)).map(item => (
                  <button key={item.id} onClick={() => handleAlchToggle(item.name)}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${selectedForAlch.includes(item.name) ? 'border-primary bg-primary/10' : 'border-border/30 bg-card/20 hover:bg-card/40'}`}>
                    <span>{ITEM_TYPE_ICONS[item.item_type]}</span>
                    <span className="flex-1 text-xs">{item.name}</span>
                    <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground">Known Recipes</p>
              {ALCH_RECIPES.map((r, i) => {
                const canMake = selectedForAlch.length === 2 && r.requires.every(req => selectedForAlch.includes(req)) && selectedForAlch.every(s => r.requires.includes(s));
                return (
                  <div key={i} className={`p-2.5 rounded-xl border transition-all ${canMake ? 'border-primary bg-primary/5' : 'border-border/30 bg-card/20'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">⚗</span>
                      <div className="flex-1">
                        <p className={`text-xs font-medium ${RARITY_COLORS[r.result.rarity]}`}>{r.name}</p>
                        <p className="text-[10px] text-muted-foreground">{r.requires.join(' + ')}</p>
                      </div>
                      {canMake && <button onClick={tryRecipe} className="text-[10px] px-2 py-1 rounded-lg bg-primary text-primary-foreground">{t.bag.combine}</button>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InventoryRow({ item }: { item: Item }) {
  return (
    <div className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-colors ${RARITY_BORDER[item.rarity]} bg-card/20 hover:bg-card/40`}>
      <span className="text-lg w-6 text-center">{ITEM_TYPE_ICONS[item.item_type]}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium ${RARITY_COLORS[item.rarity]}`}>{item.name}</p>
        <p className="text-[10px] text-muted-foreground">{Object.entries(item.stats).filter(([, v]) => v).map(([k, v]) => `+${v} ${k}`).join(' ') || item.source}</p>
      </div>
      <div className="text-right shrink-0">
        <span className="text-xs font-semibold tabular-nums">×{item.quantity}</span>
        {item.equipped_slot && <p className="text-[10px] text-jade">Equipped</p>}
      </div>
    </div>
  );
}

function SubTabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) {
  return (
    <button onClick={onClick} className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all duration-150 ${active ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
      <span>{icon}</span><span>{label}</span>
    </button>
  );
}
