import React, { useState } from 'react';
import type { BattleHistoryEntry } from '../../engine/battleEngine.ts';

interface HistoryRailProps {
  history: BattleHistoryEntry[];
}

const HistoryItemIcon: React.FC<{ item: BattleHistoryEntry }> = ({ item }) => {
  const [hasError, setHasError] = useState(false);
  if (!item.sourceCardId || hasError) {
    return (
      <span className="text-base sm:text-lg drop-shadow">
        {item.type === 'ATTACK' ? '⚔️' : item.type === 'HERO_POWER' ? '🔥' : '📜'}
      </span>
    );
  }
  return (
    <div className="w-full h-full rounded-lg overflow-hidden flex items-center justify-center">
      <img
        src={`/art/cards/${item.sourceCardId}.png`}
        alt={item.sourceName}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover select-none pointer-events-none"
      />
    </div>
  );
};

const HistoryPreviewImage: React.FC<{ sourceCardId: string; sourceName: string }> = ({
  sourceCardId,
  sourceName,
}) => {
  const [hasError, setHasError] = useState(false);
  if (hasError) {
    return (
      <div className="w-44 sm:w-52 h-62 sm:h-72 rounded-2xl flex flex-col items-center justify-center p-4 border-2 border-amber-600 bg-gradient-to-b from-[#2a170b] to-[#120803] text-center shadow-2xl select-none">
        <span className="text-4xl mb-2">📜</span>
        <span className="font-serif font-black text-amber-200 text-sm">{sourceName}</span>
      </div>
    );
  }
  return (
    <img
      src={`/art/cards/${sourceCardId}.png`}
      alt={sourceName}
      onError={() => setHasError(true)}
      className="w-full h-full object-contain select-none"
    />
  );
};

export const HistoryRail: React.FC<HistoryRailProps> = ({ history }) => {
  const [hoveredEntry, setHoveredEntry] = useState<BattleHistoryEntry | null>(null);

  return (
    <div
      data-testid="history-rail"
      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-1.5 p-1.5 sm:p-2 rounded-2xl bg-[#180f0a]/95 border-2 border-[#382315] shadow-[inset_0_4px_10px_rgba(0,0,0,0.9),0_6px_20px_rgba(0,0,0,0.85)] max-h-[75vh] select-none"
    >
      {/* Rail Header Plaque */}
      <div className="flex items-center justify-center pb-1 border-b border-[#442817]/60">
        <span className="text-[9px] sm:text-[10px] font-serif uppercase tracking-widest text-amber-400/90 font-black">
          History
        </span>
      </div>

      {/* History Items Track */}
      <div className="flex flex-col gap-1.5 overflow-y-auto no-scrollbar max-h-[60vh]">
        {history.slice(0, 7).map((item) => {
          const isPlayer = item.ownerId === 'player';
          return (
            <div
              key={item.id}
              data-testid="history-item"
              onMouseEnter={() => setHoveredEntry(item)}
              onMouseLeave={() => setHoveredEntry(null)}
              className={`relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center border-2 transition-all transform hover:scale-115 hover:z-40 cursor-help shadow-lg ${
                isPlayer
                  ? 'border-blue-500/80 bg-gradient-to-br from-[#12213d] to-[#0a101d] shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                  : 'border-red-600/80 bg-gradient-to-br from-[#3b1212] to-[#1a0808] shadow-[0_0_8px_rgba(239,68,68,0.5)]'
              }`}
            >
              <HistoryItemIcon item={item} />

              {/* Owner Indicator Pip */}
              <div
                className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-white/80 shadow ${
                  isPlayer ? 'bg-blue-500' : 'bg-red-600'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Full-Size Card Inspection Popout on Hover */}
      {hoveredEntry && (
        <div
          data-testid="history-preview-card"
          className="absolute left-14 sm:left-16 top-1/2 -translate-y-1/2 z-50 pointer-events-none flex flex-col items-center animate-fadeIn"
        >
          {hoveredEntry.sourceCardId ? (
            <div className="w-44 sm:w-52 h-62 sm:h-72 flex items-center justify-center filter drop-shadow-[0_16px_35px_rgba(0,0,0,0.95)]">
              <HistoryPreviewImage
                sourceCardId={hoveredEntry.sourceCardId}
                sourceName={hoveredEntry.sourceName}
              />
            </div>
          ) : null}

          {/* Action Description Plaque */}
          <div className="mt-1 px-3 py-1.5 rounded-xl bg-[#1a110a]/95 border border-[#52331d] shadow-[0_4px_16px_rgba(0,0,0,0.9)] max-w-xs text-center">
            <p className="text-xs font-serif text-amber-200 font-bold leading-tight">
              {hoveredEntry.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
