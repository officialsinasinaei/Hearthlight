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

          return (
            <div key={cardDefId + '_' + index} className="flex flex-col items-center">
              <button
                type="button"
                data-testid={`discover-option-${index}`}
                data-testid-alt="discover-card"
                data-option-index={index}
                onClick={() => handleSelect(index)}
                aria-label={`Choose ${option.name}`}
                className="relative group cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 flex flex-col items-center focus:outline-none bg-transparent p-0 border-0"
                style={{ border: '0px', borderWidth: '0px' }}
              >
                {/* Pure Borderless Hearthstone Card Silhouette */}
                <div
                  className="relative w-32 sm:w-48 md:w-56 h-44 sm:h-68 md:h-80 flex items-center justify-center transition-all duration-200 drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] group-hover:drop-shadow-[0_0_35px_rgba(250,204,21,0.9)] bg-transparent"
                  style={{ border: '0px', borderWidth: '0px' }}
                >
                  <img
                    src={`/art/cards/${cardDefId}.png`}
                    alt={option.name}
                    className="w-full h-full object-contain select-none pointer-events-none"
                    style={{ border: '0px', borderWidth: '0px' }}
                  />
                </div>

                {/* Subtle Keycap Hint Tucked Below Card */}
                <div className="mt-2.5 px-3 py-1 rounded-full bg-stone-900/85 border border-amber-500/40 text-amber-200/90 font-mono font-bold text-xs shadow-md tracking-wider flex items-center gap-1.5 pointer-events-none transition-all group-hover:border-amber-400 group-hover:text-amber-100 group-hover:bg-amber-950/90 group-hover:scale-105">
                  <span className="font-serif text-[11px] uppercase tracking-wider text-amber-300">Choose</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-400 text-stone-950 font-black text-[10px] tabular-nums">
                    [{index + 1}]
                  </span>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
