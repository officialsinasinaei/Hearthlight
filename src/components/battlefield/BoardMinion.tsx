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
          minion.hasStealth ? 'opacity-85' : ''
        } ${
          canAttack
            ? 'filter drop-shadow-[0_0_12px_rgba(34,197,94,0.95)] drop-shadow-[0_0_4px_rgba(74,222,128,0.85)] drop-shadow-[0_8px_14px_rgba(0,0,0,0.75)]'
            : minion.isFrozen
            ? 'filter drop-shadow-[0_0_12px_rgba(34,211,238,0.9)] drop-shadow-[0_8px_14px_rgba(0,0,0,0.7)]'
            : minion.hasDivineShield
            ? 'filter drop-shadow-[0_0_12px_rgba(250,204,21,0.9)] drop-shadow-[0_8px_14px_rgba(0,0,0,0.7)]'
            : (minion.spellDamage ?? 0) > 0
            ? 'filter drop-shadow-[0_0_10px_rgba(168,85,247,0.8)] drop-shadow-[0_8px_14px_rgba(0,0,0,0.7)]'
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

        {/* Frozen Frost Sheen and Ice Crystal Overlay */}
        {minion.isFrozen && (
          <div
            data-testid="minion-frozen-overlay"
            className="absolute inset-0 rounded-2xl bg-gradient-to-b from-cyan-300/35 via-blue-500/25 to-cyan-400/40 pointer-events-none flex items-center justify-center overflow-hidden z-10"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.45)_0%,transparent_65%)]" />
            <svg
              viewBox="0 0 48 48"
              className="w-8 h-8 text-cyan-100/80 filter drop-shadow-[0_0_8px_rgba(34,211,238,0.95)]"
              fill="currentColor"
            >
              <path
                d="M24 2 L26 18 L38 8 L30 22 L46 24 L30 26 L38 40 L26 30 L24 46 L22 30 L10 40 L18 26 L2 24 L18 22 L10 8 L22 18 Z"
                opacity="0.75"
              />
            </svg>
          </div>
        )}

        {/* Stealth Shrouded Shadow Mist Veil */}
        {minion.hasStealth && (
          <div
            data-testid="minion-stealth-overlay"
            className="absolute inset-0 rounded-2xl bg-gradient-to-t from-purple-950/50 via-stone-900/40 to-transparent pointer-events-none opacity-85 shadow-[inset_0_0_14px_rgba(88,28,135,0.6)] z-10"
          >
            <div className="absolute inset-0 rounded-2xl ring-1 ring-purple-500/30" />
          </div>
        )}
      </div>

      {/* Spell Damage Arcane Violet Aura */}
      {(minion.spellDamage ?? 0) > 0 && (
        <div
          data-testid="minion-spell-damage-overlay"
          className="absolute -inset-1 rounded-2xl pointer-events-none -z-10 flex items-center justify-center"
        >
          <div className="absolute inset-0 rounded-2xl bg-violet-500/20 animate-pulse blur-[3px]" />
          <div className="absolute -bottom-1 right-1 flex items-center justify-center text-violet-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.95)]">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-violet-400">
              <path d="M12 0 L14 9 L23 12 L14 15 L12 24 L10 15 L1 12 L10 9 Z" />
            </svg>
          </div>
        </div>
      )}

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
