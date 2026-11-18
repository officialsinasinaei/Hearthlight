import React, { useState } from 'react';
import type { ActiveSecretInstance } from '../../engine/types.ts';

export interface ActiveSecretCrestProps {
  secrets: ActiveSecretInstance[];
  isPlayer: boolean;
  isCompact?: boolean;
}

export const ActiveSecretCrest: React.FC<ActiveSecretCrestProps> = ({
  secrets,
  isPlayer,
  isCompact = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!secrets || secrets.length === 0) return null;

  return (
    <div
      data-testid="active-secret-crest"
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      className="relative flex items-center justify-center cursor-pointer group"
      aria-label={isPlayer ? `Active Secrets (${secrets.length})` : 'Enemy Secret'}
    >
      {/* Outer Arcane Pulsing Glow */}
      <div className="absolute inset-0 rounded-full bg-fuchsia-500/40 blur-[6px] animate-pulse pointer-events-none" />

      {/* Secret Crest Orb Medallion */}
      <div
        className={`relative ${
          isCompact ? 'w-6 h-6 border' : 'w-8 h-8 border-2'
        } rounded-full border-amber-300/90 bg-gradient-to-b from-fuchsia-600 via-purple-700 to-indigo-950 flex items-center justify-center shadow-[0_0_12px_rgba(217,70,239,0.85)] transition-transform duration-200 group-hover:scale-110`}
      >
        {/* Arcane Rune Question Mark Glyph */}
        <span
          className={`font-serif font-black text-amber-200 select-none pointer-events-none drop-shadow-[0_0_4px_rgba(255,255,255,0.8)] ${
            isCompact ? 'text-[11px] leading-none' : 'text-sm leading-none'
          }`}
        >
          ?
        </span>

        {/* Multi-Secret Count Indicator */}
        {secrets.length > 1 && (
          <span
            data-testid="active-secret-count"
            className={`absolute -bottom-1 -right-1 ${
              isCompact ? 'min-w-[12px] h-[12px] text-[8px] px-0.5' : 'min-w-[15px] h-[15px] text-[9px] px-1'
            } rounded-full bg-amber-400 text-stone-950 font-black font-serif flex items-center justify-center border border-amber-100 shadow pointer-events-none tabular-nums`}
          >
            {secrets.length}
          </span>
        )}
      </div>

      {/* Arcane Tooltip */}
      {isHovered && (
        <div
          data-testid="secret-tooltip"
          className={`absolute left-1/2 -translate-x-1/2 ${
            isPlayer ? 'bottom-full mb-2' : 'top-full mt-2'
          } z-50 w-52 p-2.5 rounded-lg bg-stone-900/95 border border-purple-400/80 shadow-[0_8px_20px_rgba(0,0,0,0.9),0_0_12px_rgba(168,85,247,0.4)] backdrop-blur-md pointer-events-none text-left`}
        >
          {isPlayer ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between border-b border-purple-500/30 pb-1">
                <span className="font-serif font-bold text-xs text-amber-300 tracking-wide">
                  Active Secrets ({secrets.length})
                </span>
                <span className="text-[10px] text-fuchsia-400 font-mono">Player</span>
              </div>
              {secrets.map((sec, idx) => (
                <div key={sec.id || idx} className="flex flex-col">
                  <span className="font-serif font-bold text-xs text-amber-100">{sec.name}</span>
                  <span className="text-[10px] text-stone-300 leading-tight mt-0.5">{sec.text}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <span className="font-serif font-bold text-xs text-fuchsia-300 tracking-wide">
                Secret: Hidden
              </span>
              <span className="text-[10px] text-stone-300 leading-tight">
                Triggers when specific conditions are met during your turn.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
