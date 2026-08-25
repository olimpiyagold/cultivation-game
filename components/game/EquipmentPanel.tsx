'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { useGame } from '@/lib/game/context';
import type { Item, EquipSlot } from '@/lib/game/types';
import { RARITY_COLORS, RARITY_BORDER } from '@/lib/game/types';

const SLOT_ICONS: Record<EquipSlot, string> = {
  weapon: '⚔', offhand: '🛡', helmet: '⛑', armor: '🥋', boots: '👢', accessory1: '💍', accessory2: '💍',
};

export function EquipmentPanel() {
  const { t } = useI18n();
  const { inventory, equipItem, unequipItem } = useGame();
  const [activeSlot, setActiveSlot] = useState<EquipSlot | null>(null);

  const slots: EquipSlot[] = ['weapon', 'offhand', 'helmet', 'armor', 'boots', 'accessory1', 'accessory2'];
  const equipped = Object.fromEntries(
    slots.map(s => [s, inventory.find(i => i.equipped_slot === s)])
  ) as Record<EquipSlot, Item | undefined>;

  const equipableForSlot = (slot: EquipSlot) => {
    const typeMap: Partial<Record<EquipSlot, Item['item_type'][]>> = {
      weapon: ['weapon'],
      offhand: ['weapon', 'accessory'],
      helmet: ['helmet'],
      armor: ['armor'],
      boots: ['boots'],
      accessory1: ['accessory'],
      accessory2: ['accessory'],
    };
    const types = typeMap[slot] || [];
    return inventory.filter(i => types.includes(i.item_type) && i.equipped_slot !== slot);
  };

  return (
    <div className="space-y-3">
      {/* Equipment slots */}
      <div className="grid grid-cols-4 gap-2">
        {slots.map(slot => {
          const item = equipped[slot];
          return (
            <button
              key={slot}
              onClick={() => setActiveSlot(activeSlot === slot ? null : slot)}
              className={`p-2 rounded-xl border transition-all flex flex-col items-center gap-1 ${
                activeSlot === slot
                  ? 'border-primary bg-primary/10 scale-[1.02]'
                  : item
                    ? `${RARITY_BORDER[item.rarity]} bg-card/50`
                    : 'border-border/30 bg-muted/20 hover:border-border'
              }`}
            >
              <span className="text-lg">{SLOT_ICONS[slot]}</span>
              {item ? (
                <span className={`text-[9px] font-medium text-center leading-tight line-clamp-2 ${RARITY_COLORS[item.rarity]}`}>
                  {item.name}
                </span>
              ) : (
                <span className="text-[9px] text-muted-foreground">{t.bag.slots[slot]}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Slot details */}
      {activeSlot && (
        <div className="rounded-xl border border-border/50 bg-card/30 p-3 space-y-2 animate-float-up">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">{SLOT_ICONS[activeSlot]} {t.bag.slots[activeSlot]}</span>
            {equipped[activeSlot] && (
              <button
                onClick={() => { unequipItem(activeSlot); setActiveSlot(null); }}
                className="text-[10px] text-muted-foreground hover:text-crimson transition-colors"
              >
                {t.bag.unequip}
              </button>
            )}
          </div>

          {equipableForSlot(activeSlot).length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No items available for this slot</p>
          ) : (
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {equipableForSlot(activeSlot).map(item => (
                <button
                  key={item.id}
                  onClick={() => { equipItem(item.id, activeSlot); setActiveSlot(null); }}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg border transition-colors hover:bg-card/50 ${RARITY_BORDER[item.rarity]} bg-card/20`}
                >
                  <div className="flex-1 text-left">
                    <p className={`text-xs font-medium ${RARITY_COLORS[item.rarity]}`}>{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {Object.entries(item.stats).map(([k, v]) => `+${v} ${k}`).join(' ')}
                    </p>
                  </div>
                  <span className="text-[10px] text-primary">{t.bag.equip}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
