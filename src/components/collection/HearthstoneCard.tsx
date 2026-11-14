import React, { useState } from 'react';
import { CardDefinition, CardRarity } from '../../engine/types';
import { useCollectionStore } from '../../store/useCollectionStore';

export interface RarityConfig {
  label: string;
  textColor: string;
  facetTopL: string;
  facetTopR: string;
  facetBotL: string;
  facetBotR: string;
  stroke: string;
  glow: string;
}

export const RARITY_CONFIGS: Record<CardRarity, RarityConfig> = {
  COMMON: {
    label: 'Common',
    textColor: '#d6cfc4', // warm pewter
    facetTopL: '#e6ded4',
    facetTopR: '#d6cfc4',
    facetBotL: '#9d9387',
    facetBotR: '#70685e',
    stroke: '#423b32',
    glow: 'rgba(214, 207, 196, 0.45)',
  },
  RARE: {
    label: 'Rare',
    textColor: '#69b4ff', // sapphire
    facetTopL: '#9ecaff',
    facetTopR: '#69b4ff',
    facetBotL: '#2570e3',
    facetBotR: '#1148ab',
    stroke: '#0d3278',
    glow: 'rgba(105, 180, 255, 0.6)',
  },
  EPIC: {
    label: 'Epic',
    textColor: '#c58aff', // amethyst
    facetTopL: '#deb3ff',
    facetTopR: '#c58aff',
    facetBotL: '#9438d8',
    facetBotR: '#5c1696',
    stroke: '#3b0b63',
    glow: 'rgba(197, 138, 255, 0.6)',
  },
  LEGENDARY: {
    label: 'Legendary',
    textColor: '#f5c451', // burnished gold
    facetTopL: '#ffec9e',
    facetTopR: '#f5c451',
    facetBotL: '#d97c11',
    facetBotR: '#8a4800',
    stroke: '#5c2d00',
    glow: 'rgba(245, 196, 81, 0.65)',
  },
};

export function RarityGemIcon({ rarity, size = 12 }: { rarity: CardRarity; size?: number }) {
  const cfg = RARITY_CONFIGS[rarity] || RARITY_CONFIGS.COMMON;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className="shrink-0"
      style={{ filter: `drop-shadow(0 0 3px ${cfg.glow})` }}
      aria-hidden="true"
    >
      {/* Outer gem contour */}
      <polygon
        points="8,1 14,5.5 8,15 2,5.5"
        stroke={cfg.stroke}
        strokeWidth="0.8"
      />
      {/* Facet Top-Left */}
      <polygon points="8,1 2,5.5 8,6.5" fill={cfg.facetTopL} />
      {/* Facet Top-Right */}
      <polygon points="8,1 14,5.5 8,6.5" fill={cfg.facetTopR} />
      {/* Facet Bottom-Left */}
      <polygon points="2,5.5 8,15 8,6.5" fill={cfg.facetBotL} />
      {/* Facet Bottom-Right */}
      <polygon points="14,5.5 8,15 8,6.5" fill={cfg.facetBotR} />
      {/* Table highlight facet */}
      <polygon points="8,2.2 11,5.5 8,8.2 5,5.5" fill="rgba(255, 255, 255, 0.45)" />
      {/* Specular sparkle */}
      <circle cx="7.2" cy="4.2" r="0.9" fill="#ffffff" fillOpacity="0.85" />
    </svg>
  );
}

export function RarityBadge({ rarity, className = '' }: { rarity: CardRarity; className?: string }) {
  const cfg = RARITY_CONFIGS[rarity] || RARITY_CONFIGS.COMMON;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] bg-[#1d150f] border border-[#8e6328]/60 shadow-[inset_0_1px_3px_rgba(0,0,0,0.85),0_2px_4px_rgba(0,0,0,0.35)] ${className}`}
    >
      <RarityGemIcon rarity={rarity} size={11} />
      <span
        className="font-serif text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]"
        style={{ color: cfg.textColor }}
      >
        {cfg.label}
      </span>
    </div>
  );
}

interface HearthstoneCardProps {
  card: CardDefinition;
  onInspect?: (card: CardDefinition) => void;
  onQuickAdd?: (card: CardDefinition) => void;
}

export function HearthstoneCard({ card, onInspect, onQuickAdd }: HearthstoneCardProps) {
  const [imgStatus, setImgStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const editingDeckId = useCollectionStore((s) => s.editingDeckId);
  const decks = useCollectionStore((s) => s.decks);
  const addCardToDeck = useCollectionStore((s) => s.addCardToDeck);

  const activeDeck = decks.find((d) => d.id === editingDeckId);
  const cardCountInDeck = activeDeck?.cards[card.id] || 0;
  const maxCopies = card.rarity === 'LEGENDARY' ? 1 : 2;
  const isAtDeckLimit = cardCountInDeck >= maxCopies;
  const isDeckFull = (activeDeck?.totalCount || 0) >= 30;
  const isCapped = isAtDeckLimit || (editingDeckId !== null && isDeckFull && cardCountInDeck === 0);

  function handleClick() {
    if (onInspect) {
      onInspect(card);
    }
  }

  function handleQuickAdd(e: React.MouseEvent) {
    e.stopPropagation();
    if (editingDeckId && !isCapped) {
      if (onQuickAdd) {
        onQuickAdd(card);
      } else {
        addCardToDeck(card.id);
      }
    }
  }

  return (
    <div
      data-testid="collection-card"
      onClick={handleClick}
      className={`group relative flex flex-col items-center cursor-pointer transition-transform duration-200 select-none ${
        isCapped
          ? 'filter saturate-[0.80] brightness-[0.96] hover:scale-102'
          : 'hover:scale-105 hover:z-20'
      }`}
    >
      {/* 3D Container */}
      <div className="relative w-36 sm:w-40 h-52 sm:h-56 flex items-center justify-center">
        {/* Layer 1: Resilient Fallback Card Canvas - ONLY rendered if image is NOT loaded */}
        {imgStatus !== 'loaded' && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#2a1b12] to-[#120a05] border-2 border-[#8a6027] overflow-hidden flex flex-col p-2.5 justify-between shadow-[0_8px_16px_rgba(0,0,0,0.85)]">
            {/* Mana Oval Fallback */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-b from-sky-400 to-blue-800 border-2 border-sky-100 flex items-center justify-center text-white font-black text-sm shadow">
              {card.cost}
            </div>

            {/* Center Art SVG Placeholder - Bespoke Arcane Diamond Emblem */}
            <div className="my-auto text-center flex flex-col items-center">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <svg className="w-8 h-8 text-[#93c5fd]/80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polygon points="12,2 22,12 12,22 2,12" stroke="currentColor" strokeWidth="1.2" />
                  <polygon points="12,5 19,12 12,19 5,12" stroke="#60a5fa" strokeWidth="0.8" fill="rgba(59, 130, 246, 0.2)" />
                  <circle cx="12" cy="12" r="2.5" fill="#93c5fd" />
                  <circle cx="12" cy="12" r="1" fill="#ffffff" />
                  <line x1="12" y1="2" x2="12" y2="6" stroke="#93c5fd" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="12" y1="18" x2="12" y2="22" stroke="#93c5fd" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="2" y1="12" x2="6" y2="12" stroke="#93c5fd" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="18" y1="12" x2="22" y2="12" stroke="#93c5fd" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="text-xs font-bold text-amber-100 mt-1 line-clamp-1">{card.name}</div>
            </div>

            {/* Rarity & Text */}
            <div className="text-[10px] text-stone-300 leading-tight line-clamp-3 bg-black/40 rounded p-1">
              <span dangerouslySetInnerHTML={{ __html: card.text }} />
            </div>
          </div>
        )}

        {/* Layer 2: Official Blizzard CloudFront Card Image - rendered clean with drop shadow and NO background box */}
        {card.imageUrl && (
          <img
            src={card.imageUrl}
            alt={card.name}
            loading="lazy"
            decoding="async"
            onLoad={() => setImgStatus('loaded')}
            onError={() => setImgStatus('error')}
            className={`w-full h-full object-contain pointer-events-none drop-shadow-[0_10px_18px_rgba(0,0,0,0.65)] transition-opacity duration-200 ${
              imgStatus === 'loaded' ? 'opacity-100' : 'opacity-0 absolute inset-0'
            }`}
          />
        )}

        {/* Legendary Dragon Crown Highlight if applicable */}
        {card.rarity === 'LEGENDARY' && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 pointer-events-none z-10 flex items-center justify-center">
            <div className="px-2 py-0.5 rounded-full bg-gradient-to-b from-[#fde68a] via-[#f59e0b] to-[#78350f] border border-[#fef3c7] shadow-[0_2px_6px_rgba(0,0,0,0.85)] text-[10px] font-black text-[#451a03] flex items-center gap-0.5">
              <span className="text-[#451a03]">★</span>
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#451a03]">Legend</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status / Quick-Add Badging */}
      <div className="mt-1.5 h-7 flex items-center justify-center">
        {editingDeckId ? (
          isAtDeckLimit ? (
            /* Clean recessed slate-and-brass status plaque for locked copy limit */
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] bg-[#1d150f] border border-[#8e6328]/80 shadow-[inset_0_1px_3px_rgba(0,0,0,0.85),0_1px_2px_rgba(0,0,0,0.3)]">
              {card.rarity === 'LEGENDARY' && (
                <span className="text-[10px] text-[#f5c451] leading-none">★</span>
              )}
              <span className="font-serif text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#f5c451] leading-none">
                Deck Limit: {maxCopies}
              </span>
            </div>
          ) : isDeckFull ? (
            /* Recessed slate-and-brass status plaque for deck full */
            <div className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-[5px] bg-[#1d150f] border border-[#6b5029]/80 shadow-[inset_0_1px_3px_rgba(0,0,0,0.85),0_1px_2px_rgba(0,0,0,0.3)]">
              <span className="font-serif text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#a88d6c] leading-none">
                Deck Full
              </span>
            </div>
          ) : (
            /* Quick-add '+' pill/button */
            <button
              type="button"
              onClick={handleQuickAdd}
              className="px-3 py-1 rounded-full bg-gradient-to-b from-[#f7e2a4] via-[#c99a42] to-[#7a4f18] border border-[#fff2c2]/80 text-[#1a0e05] text-xs font-black shadow-[0_2px_6px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.4)] hover:brightness-115 hover:shadow-[0_0_10px_rgba(245,196,81,0.5)] active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
            >
              <span className="text-sm leading-none font-black">+</span>
              <span className="text-[10px] uppercase tracking-wider font-extrabold leading-none">Add</span>
              {cardCountInDeck > 0 && (
                <span className="text-[10px] font-mono font-black text-[#3d2008] ml-0.5 leading-none">
                  ({cardCountInDeck}/{maxCopies})
                </span>
              )}
            </button>
          )
        ) : (
          /* View Mode: Dark recessed walnut/slate badge with faceted gemstone */
          <RarityBadge rarity={card.rarity} />
        )}
      </div>
    </div>
  );
}
