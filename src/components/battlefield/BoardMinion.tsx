import React from 'react';
import type { CardInstance } from '../../engine/types.ts';

interface BoardMinionProps {
  minion: CardInstance;
  isFriendly: boolean;
  canAttack: boolean;
  isCompact?: boolean;
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  onPointerUp?: () => void;
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

export const BoardMinion: React.FC<BoardMinionProps> = ({
  minion,
  isFriendly,
  canAttack,
  isCompact: _isCompact = false,
  onPointerDown,
  onPointerEnter,
  onPointerLeave,
  onPointerUp,
  onClick,
  style,
  className = '',
}) => {
  const isDamaged = minion.health < minion.baseHealth;

  return (
    <div
      data-testid="board-minion"
      data-target-id={minion.instanceId}
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerUp={onPointerUp}
      onClick={onClick}
      style={{
        borderWidth: 0,
        backgroundColor: 'transparent',
        ...style,
      }}
      className={`relative h-[clamp(52px,14.5dvh,118px)] aspect-[5/7] flex items-center justify-center select-none transition-all duration-200 ${
        isFriendly
          ? canAttack
            ? 'cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95'
            : 'cursor-default'
          : 'cursor-crosshair hover:scale-105'
      } ${className}`}
    >
      {/* Ground Contact Tabletop Shadow */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4/5 h-3 rounded-full bg-black/65 blur-[3px] pointer-events-none -z-10" />

      {/* Pure Borderless Card Silhouette Artwork */}
      <div
        className={`relative w-full h-full flex items-center justify-center transition-all duration-200 ${
          canAttack
            ? 'filter drop-shadow-[0_0_12px_rgba(34,197,94,0.95)] drop-shadow-[0_0_4px_rgba(74,222,128,0.85)] drop-shadow-[0_8px_14px_rgba(0,0,0,0.75)]'
            : minion.hasDivineShield
            ? 'filter drop-shadow-[0_0_12px_rgba(250,204,21,0.9)] drop-shadow-[0_8px_14px_rgba(0,0,0,0.7)]'
            : 'filter drop-shadow-[0_8px_14px_rgba(0,0,0,0.75)]'
        }`}
      >
        <img
          src={`/art/cards/${minion.definitionId}.png`}
          alt={minion.name}
          className="w-full h-full object-contain select-none pointer-events-none"
        />

        {/* Subtle Wounded Edge Vignette if damaged */}
        {isDamaged && (
          <div className="absolute inset-0 rounded-2xl bg-radial from-transparent via-red-900/10 to-red-600/25 pointer-events-none" />
        )}
      </div>

      {/* Divine Shield Golden Shimmer Aura Contour */}
      {minion.hasDivineShield && (
        <div className="absolute -inset-1 rounded-2xl border border-yellow-300/40 bg-yellow-400/10 animate-pulse pointer-events-none" />
      )}

      {/* Taunt Sculpted Stone-and-Bronze Shield Crest Silhouette */}
      {minion.hasTaunt && (
        <div className="absolute -inset-2 pointer-events-none -z-10 flex items-center justify-center">
          <svg
            viewBox="0 0 120 160"
            className="w-full h-full filter drop-shadow-[0_0_10px_rgba(217,119,6,0.55)] drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id={`taunt-rim-${minion.instanceId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d97706" />
                <stop offset="25%" stopColor="#78350f" />
                <stop offset="70%" stopColor="#451a03" />
                <stop offset="100%" stopColor="#92400e" />
              </linearGradient>
              <linearGradient id={`taunt-stone-${minion.instanceId}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3f3f46" />
                <stop offset="50%" stopColor="#27272a" />
                <stop offset="100%" stopColor="#18181b" />
              </linearGradient>
            </defs>
            {/* Sculpted Shield Crest Path */}
            <path
              d="M60 4 L98 16 C112 18 116 32 116 52 C116 94 88 136 60 156 C32 136 4 94 4 52 C4 32 8 18 22 16 Z"
              fill={`url(#taunt-stone-${minion.instanceId})`}
              stroke={`url(#taunt-rim-${minion.instanceId})`}
              strokeWidth="5"
              strokeLinejoin="round"
            />
            {/* Top Crown Bevel Accent */}
            <path
              d="M48 5 L60 12 L72 5"
              stroke="#fbbf24"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Bottom Point Bevel Accent */}
            <path
              d="M60 148 L60 138"
              stroke="#fbbf24"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Side Shoulders Bronze Rivets */}
            <circle cx="16" cy="24" r="2.5" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
            <circle cx="104" cy="24" r="2.5" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
          </svg>
        </div>
      )}

      {/* Summoning Sickness Subtle Drifting Zzz Wisps */}
      {isFriendly && minion.isExhausted && (
        <div className="absolute -top-3 right-0 flex items-center gap-0.5 pointer-events-none">
          <span className="text-xs font-serif font-black text-amber-300/90 drop-shadow animate-pulse">
            Zzz
          </span>
        </div>
      )}
    </div>
  );
};
