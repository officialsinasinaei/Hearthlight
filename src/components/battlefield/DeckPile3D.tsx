import React from 'react';

interface DeckPile3DProps {
  count: number;
  owner: 'player' | 'opponent';
  isCompact?: boolean;
  testId?: string;
}

export const DeckPile3D: React.FC<DeckPile3DProps> = ({
  count,
  owner,
  isCompact = false,
  testId = `${owner}-deck-well`,
}) => {
  const isPlayer = owner === 'player';
  const stackLayers = count === 0 ? 0 : Math.min(5, Math.max(1, Math.ceil(count / 6)));

  return (
    <div
      data-testid={testId}
      title={`${isPlayer ? 'Your' : "Opponent's"} Deck: ${count} cards remaining`}
      className="relative flex flex-col items-center group cursor-help select-none"
    >
      {/* Recessed Wooden Deck Well */}
      <div
        className={`relative ${
          isCompact ? 'w-10 h-13' : 'w-13 h-17'
        } rounded-lg bg-[#180f0a] border border-[#331c11] shadow-[inset_0_4px_10px_rgba(0,0,0,0.95),0_1px_3px_rgba(255,255,255,0.06)] flex items-center justify-center p-0.5 sm:p-1`}
      >
        {count === 0 ? (
          /* Empty Deck Well Inlay */
          <div className="w-full h-full rounded border border-dashed border-amber-900/40 flex items-center justify-center opacity-40">
            <span className="text-[10px] font-serif text-amber-700/60 uppercase font-bold tracking-widest">
              Empty
            </span>
          </div>
        ) : (
          /* 3D Stacked Physical Card Backs */
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Stack Thickness Under-layers */}
            {Array.from({ length: stackLayers }).map((_, idx) => {
              const offset = (stackLayers - 1 - idx) * 1.5;
              return (
                <div
                  key={idx}
                  className="absolute inset-0 rounded bg-[#1e130c] border border-[#422513] shadow-[0_2px_4px_rgba(0,0,0,0.85)]"
                  style={{
                    transform: `translateY(${offset}px) scale(${1 - (stackLayers - 1 - idx) * 0.02})`,
                    zIndex: idx + 1,
                  }}
                />
              );
            })}

            {/* Top Card Back (Hearthstone Tavern Blue/Gold Card Back) */}
            <div
              className={`relative w-full h-full rounded bg-gradient-to-b ${
                isPlayer
                  ? 'from-[#1a2d4c] via-[#101b30] to-[#0c1322] border-[#254677]'
                  : 'from-[#381c1c] via-[#221010] to-[#140808] border-[#6b2b2b]'
              } border-2 shadow-[0_4px_12px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col items-center justify-center`}
              style={{
                transform: `translateY(-${(stackLayers - 1) * 1.5}px)`,
                zIndex: 10,
              }}
            >
              {/* Outer Card Back Filigree Inlay */}
              <div className="w-[85%] h-[85%] rounded border border-amber-500/30 flex items-center justify-center relative">
                {/* Center Swirl Jewel Medallion */}
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-700 border border-amber-300/80 shadow-[0_0_8px_rgba(245,158,11,0.6)] flex items-center justify-center">
                  <span className="text-[10px] text-amber-950 font-black leading-none drop-shadow">
                    🌀
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recessed Count Plaque */}
      <div className="mt-1 px-2 py-0.5 rounded-full bg-[#1c120b] border border-[#4a2e19] shadow-[0_2px_6px_rgba(0,0,0,0.8)] flex items-center gap-1 z-20">
        <span className="text-[8px] sm:text-[9px] font-serif font-black tracking-widest uppercase text-amber-400/80">
          DECK
        </span>
        <span className="text-[10px] sm:text-[11px] font-serif font-black tabular-nums text-amber-100">
          {count}
        </span>
      </div>
    </div>
  );
};
