import React from 'react';

interface EndTurnSwitchProps {
  isPlayerTurn: boolean;
  hasPlayableActions: boolean;
  isCompact?: boolean;
  onEndTurn: () => void;
}

export const EndTurnSwitch: React.FC<EndTurnSwitchProps> = ({
  isPlayerTurn,
  hasPlayableActions,
  isCompact = false,
  onEndTurn,
}) => {
  // Determine Switch Theme
  const isEmerald = isPlayerTurn && hasPlayableActions;
  const isAmber = isPlayerTurn && !hasPlayableActions;

  return (
    <div className="relative p-0.5 sm:p-1 rounded-xl sm:rounded-2xl bg-[#180f0a] border border-[#382315] shadow-[inset_0_4px_8px_rgba(0,0,0,0.9),0_2px_4px_rgba(255,255,255,0.06)] flex items-center justify-center">
      <button
        type="button"
        data-testid="end-turn-button"
        disabled={!isPlayerTurn}
        onClick={onEndTurn}
        className={`relative ${
          isCompact ? 'w-22 h-9 text-[9px]' : 'w-30 h-13 text-xs'
        } rounded-lg sm:rounded-xl font-serif font-black tracking-wider uppercase transition-all duration-300 transform select-none cursor-pointer ${
          isPlayerTurn
            ? 'active:scale-95 active:translate-y-0.5 hover:brightness-110'
            : 'cursor-not-allowed opacity-75 translate-y-0.5'
        }`}
        style={{
          boxShadow: isEmerald
            ? '0 0 25px rgba(34,197,94,0.75), 0 4px 12px rgba(0,0,0,0.9), inset 0 2px 3px rgba(255,255,255,0.4), inset 0 -3px 6px rgba(0,0,0,0.6)'
            : isAmber
            ? '0 0 20px rgba(245,158,11,0.6), 0 4px 12px rgba(0,0,0,0.9), inset 0 2px 3px rgba(255,255,255,0.4), inset 0 -3px 6px rgba(0,0,0,0.6)'
            : 'inset 0 3px 8px rgba(0,0,0,0.85), 0 1px 2px rgba(255,255,255,0.05)',
        }}
      >
        {/* Stone Texture & Gradient */}
        <div
          className={`absolute inset-0 rounded-xl border-2 transition-colors duration-300 ${
            isEmerald
              ? 'bg-gradient-to-b from-[#15803d] via-[#16a34a] to-[#0f532b] border-[#4ade80]'
              : isAmber
              ? 'bg-gradient-to-b from-[#9a3412] via-[#b45309] to-[#78350f] border-[#fde047]'
              : 'bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#090d16] border-[#334155]'
          }`}
        >
          {/* Subtle Carved Bevel Highlight */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-transparent via-white/10 to-white/25 pointer-events-none" />

          {/* Button Content */}
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <span
              className={`drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] ${
                isPlayerTurn ? 'text-amber-100 font-extrabold' : 'text-slate-400 font-bold'
              }`}
            >
              {isPlayerTurn ? 'END TURN' : 'ENEMY TURN'}
            </span>

            {/* Subtle Sub-label */}
            {isPlayerTurn && (
              <span className="text-[7.5px] font-sans tracking-tight text-amber-200/80 -mt-0.5">
                {isEmerald ? 'Actions left' : 'No moves'}
              </span>
            )}
          </div>
        </div>
      </button>
    </div>
  );
};
