import React from 'react';
import { AnimatePresence } from 'motion/react';
import { useBattleStore } from '../../store/useBattleStore.ts';
import { FireVisualEffect } from './FireVisualEffect.tsx';
import { FrostVisualEffect } from './FrostVisualEffect.tsx';
import { ArcaneVisualEffect } from './ArcaneVisualEffect.tsx';
import { SecretVisualEffect } from './SecretVisualEffect.tsx';
import { BattlecryVisualEffect } from './BattlecryVisualEffect.tsx';

export const SpellVisualEffectsOverlay: React.FC = () => {
  const activeEffect = useBattleStore((s) => s.activeVisualEffect);

  if (!activeEffect) return null;

  return (
    <div
      data-testid="spell-effect-overlay"
      className="fixed inset-0 pointer-events-none z-[45] overflow-hidden"
    >
      <AnimatePresence mode="wait">
        <div key={activeEffect.id} className="relative w-full h-full pointer-events-none">
          {activeEffect.school === 'FIRE' && <FireVisualEffect effect={activeEffect} />}
          {activeEffect.school === 'FROST' && <FrostVisualEffect effect={activeEffect} />}
          {activeEffect.school === 'ARCANE' && <ArcaneVisualEffect effect={activeEffect} />}
          {activeEffect.school === 'SECRET' && <SecretVisualEffect effect={activeEffect} />}
          {(activeEffect.school === 'BATTLECRY' || activeEffect.school === 'COMBAT') && (
            <BattlecryVisualEffect effect={activeEffect} />
          )}
        </div>
      </AnimatePresence>
    </div>
  );
};
