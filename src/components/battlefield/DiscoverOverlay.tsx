import React, { useEffect } from 'react';
import { useBattleStore } from '../../store/useBattleStore.ts';
import { playRatchetTick } from '../../utils/tavernAudio.ts';
import type { CardDefinition, CardInstance } from '../../engine/types.ts';

export const DiscoverOverlay: React.FC = () => {
  const pendingChoice = useBattleStore((s) => s.battle?.pendingChoice);

  const handleSelect = (index: number) => {
    try {
      playRatchetTick(1.2);
    } catch {
      // safe
    }
    useBattleStore.getState().resolveChoice(index);
  };

  useEffect(() => {
    if (!pendingChoice || (pendingChoice.ownerId && pendingChoice.ownerId !== 'player')) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1' && pendingChoice.options.length > 0) {
        e.preventDefault();
        handleSelect(0);
      } else if (e.key === '2' && pendingChoice.options.length > 1) {
        e.preventDefault();
        handleSelect(1);
      } else if (e.key === '3' && pendingChoice.options.length > 2) {
        e.preventDefault();
        handleSelect(2);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleSelect(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [pendingChoice]);

  if (!pendingChoice || (pendingChoice.ownerId && pendingChoice.ownerId !== 'player')) {
    return null;
  }

  return (
    <div
      data-testid="discover-overlay"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 select-none bg-black/80 backdrop-blur-sm animate-fadeIn"
    >
      {/* Header Banner */}
      <div className="relative mb-5 sm:mb-8 flex flex-col items-center">
        <div className="px-8 sm:px-14 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 border-2 border-amber-400 shadow-[0_0_35px_rgba(234,179,8,0.45)] backdrop-blur-sm">
          <h2
            data-testid="discover-title"
            className="text-xl sm:text-3xl font-serif font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-yellow-200 to-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] text-center"
          >
            {pendingChoice.title || 'Discover a card'}
          </h2>
        </div>
        <p className="text-xs sm:text-sm font-serif font-semibold text-amber-300/80 mt-1 drop-shadow">
          Choose one card to add to your hand (Keys 1, 2, or 3)
        </p>
      </div>

      {/* 3-Card Choices Row */}
      <div className="relative flex flex-row items-center justify-center gap-3 sm:gap-8 max-w-5xl w-full">
        {pendingChoice.options.map((option: CardDefinition | CardInstance, index: number) => {
          const cardDefId = 'definitionId' in option ? option.definitionId : option.id;
          const isMinion = option.type === 'MINION';
          const cost = option.cost ?? 0;
          const attack = isMinion ? option.attack ?? 0 : null;
          const health = isMinion ? option.health ?? 0 : null;

          return (
            <div key={cardDefId + '_' + index} className="flex flex-col items-center gap-2 sm:gap-3">
              <button
                type="button"
                data-testid={`discover-option-${index}`}
                data-testid-alt="discover-card"
                data-option-index={index}
                onClick={() => handleSelect(index)}
                aria-label={`Choose ${option.name}`}
                className="relative group cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 flex flex-col items-center focus:outline-none rounded-2xl"
              >
                {/* Card Container Frame */}
                <div className="relative w-28 sm:w-44 md:w-52 h-40 sm:h-64 md:h-76 rounded-[22px] overflow-hidden flex items-center justify-center ring-2 ring-amber-400/70 group-hover:ring-4 group-hover:ring-cyan-300 shadow-[0_10px_25px_rgba(0,0,0,0.85)] group-hover:shadow-[0_0_30px_rgba(34,211,238,0.7)] transition-all bg-stone-900">
                  <img
                    src={`/art/cards/${cardDefId}.png`}
                    alt={option.name}
                    className="w-full h-full object-contain filter drop-shadow select-none pointer-events-none"
                  />

                  {/* Top-Left Mana Gem */}
                  <div className="absolute top-1 left-1 sm:top-2 sm:left-2 w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-gradient-to-b from-blue-400 to-blue-700 border-2 border-blue-200 flex items-center justify-center font-serif font-black text-white text-[10px] sm:text-sm shadow-md pointer-events-none">
                    {cost}
                  </div>

                  {/* Minion Attack & Health Badges */}
                  {isMinion && attack !== null && (
                    <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-gradient-to-b from-amber-400 to-yellow-600 border-2 border-amber-200 flex items-center justify-center font-serif font-black text-stone-950 text-[10px] sm:text-sm shadow-md pointer-events-none">
                      {attack}
                    </div>
                  )}

                  {isMinion && health !== null && (
                    <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-gradient-to-b from-red-500 to-red-800 border-2 border-red-200 flex items-center justify-center font-serif font-black text-white text-[10px] sm:text-sm shadow-md pointer-events-none">
                      {health}
                    </div>
                  )}
                </div>

                {/* Tactile Choose Button */}
                <div className="mt-2 px-3 sm:px-5 py-1 sm:py-1.5 rounded-lg bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 group-hover:from-cyan-500 group-hover:to-blue-600 text-stone-950 group-hover:text-white font-serif font-black text-[11px] sm:text-xs tracking-wider shadow-md transition-all uppercase flex items-center gap-1.5 pointer-events-none">
                  <span>Choose</span>
                  <span className="text-[10px] opacity-75 font-mono">[{index + 1}]</span>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
