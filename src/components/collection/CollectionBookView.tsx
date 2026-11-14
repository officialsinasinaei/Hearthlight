import { useMemo, useEffect } from 'react';
import { MAGE_CARDS } from '../../engine/cards';
import { CardDefinition } from '../../engine/types';
import { useCollectionStore } from '../../store/useCollectionStore';
import { HearthstoneCard } from './HearthstoneCard';

/**
 * Clean engraved brass filigree divider SVG for tome header plaque.
 */
function BrassFiligreeDivider({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      width="64"
      height="18"
      viewBox="0 0 64 18"
      fill="none"
      className={`shrink-0 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)] ${flip ? 'scale-x-[-1]' : ''}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`filigreeGrad-${flip ? 'r' : 'l'}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fae6a2" />
          <stop offset="50%" stopColor="#c89a42" />
          <stop offset="100%" stopColor="#7a521a" />
        </linearGradient>
      </defs>
      {/* Outer tapered scroll flourish */}
      <path
        d="M2 9 C 14 9, 22 3.5, 36 3.5 C 46 3.5, 54 8, 60 9 C 54 10, 46 14.5, 36 14.5 C 22 14.5, 14 9, 2 9 Z"
        fill={`url(#filigreeGrad-${flip ? 'r' : 'l'})`}
        stroke="#4a2e0a"
        strokeWidth="0.6"
      />
      {/* Center engraved metallic spine line */}
      <path d="M4 9 L54 9" stroke="#fff5d1" strokeWidth="0.8" strokeLinecap="round" strokeOpacity="0.75" />
      {/* Swirling acanthus accents */}
      <path
        d="M12 9 C 12 5.5, 7 5.5, 7 8 C 7 10.5, 13 11.5, 18 9.5"
        stroke="#ffeab0"
        strokeWidth="1.1"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M26 9 C 26 5, 21 5, 21 7.5 C 21 10, 27 11, 32 9.5"
        stroke="#ffeab0"
        strokeWidth="1.1"
        fill="none"
        strokeLinecap="round"
      />
      {/* Terminal diamond jewel stud */}
      <polygon points="61,9 63.5,6.5 66,9 63.5,11.5" fill="#fef08a" stroke="#7a521a" strokeWidth="0.6" />
    </svg>
  );
}

/**
 * Carved brass-and-walnut latch tab for page turns integrated into tome outer border rails.
 */
function CarvedBookLatchTab({
  direction,
  disabled,
  onClick,
}: {
  direction: 'prev' | 'next';
  disabled: boolean;
  onClick: () => void;
}) {
  const isPrev = direction === 'prev';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={isPrev ? 'Previous Page' : 'Next Page'}
      className={`absolute top-1/2 -translate-y-1/2 z-30 flex items-center justify-center transition-all ${
        isPrev
          ? '-left-3 sm:-left-3.5 rounded-r-xl border-y-2 border-r-2'
          : '-right-3 sm:-right-3.5 rounded-l-xl border-y-2 border-l-2'
      } ${
        disabled
          ? 'opacity-30 cursor-not-allowed filter grayscale-[40%]'
          : 'cursor-pointer hover:brightness-125 hover:shadow-[0_0_12px_rgba(245,196,81,0.5)] active:scale-95'
      } w-8 sm:w-10 h-18 sm:h-22 bg-gradient-to-b from-[#2e190d] via-[#1d1007] to-[#120803] border-[#a0742a] shadow-[0_6px_16px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.2)] group`}
    >
      {/* Top and Bottom Brass Rivet Heads */}
      <div className="absolute top-2 w-1.5 h-1.5 rounded-full bg-gradient-to-b from-[#fffae0] to-[#b3842c] border border-[#5a3915] shadow-xs" />
      <div className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-gradient-to-b from-[#fffae0] to-[#b3842c] border border-[#5a3915] shadow-xs" />

      {/* Carved Brass Chevron SVG */}
      <svg
        width="16"
        height="22"
        viewBox="0 0 16 22"
        fill="none"
        className={`transition-transform drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] ${
          isPrev ? 'group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'
        }`}
      >
        <defs>
          <linearGradient id={`latchGrad-${direction}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fffae0" />
            <stop offset="50%" stopColor="#e2b755" />
            <stop offset="100%" stopColor="#8a5316" />
          </linearGradient>
        </defs>
        {isPrev ? (
          <path
            d="M11 4 L4 11 L11 18"
            stroke={`url(#latchGrad-${direction})`}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M5 4 L12 11 L5 18"
            stroke={`url(#latchGrad-${direction})`}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>
  );
}

/**
 * Beveled, faceted mana crystal button with authentic Hearthstone facet lighting.
 */
function FacetedManaCrystalButton({
  val,
  isActive,
  onClick,
}: {
  val: string | number;
  isActive: boolean;
  onClick: () => void;
}) {
  const isAll = val === 'All';
  const label = isAll ? 'ALL' : val === 7 ? '7+' : String(val);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center transition-all cursor-pointer ${
        isActive
          ? 'scale-115 z-10 drop-shadow-[0_0_12px_rgba(56,189,248,0.95)]'
          : 'hover:scale-105 opacity-85 hover:opacity-100'
      }`}
      aria-pressed={isActive}
      aria-label={`Filter by ${label} Mana`}
    >
      <svg viewBox="0 0 36 36" className="w-full h-full" fill="none">
        <defs>
          {/* Active Sapphire Gradients */}
          <linearGradient id={`activeTopFacet-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id={`activeMidFacet-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id={`activeBotFacet-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e40af" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <radialGradient id={`activeCenterGlow-${label}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="65%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </radialGradient>

          {/* Inactive Recessed Dark Bronze / Slate Gradients */}
          <linearGradient id={`inactiveTopFacet-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3a2e20" />
            <stop offset="100%" stopColor="#251d14" />
          </linearGradient>
          <linearGradient id={`inactiveMidFacet-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#251e17" />
            <stop offset="100%" stopColor="#14100c" />
          </linearGradient>
          <linearGradient id={`inactiveBotFacet-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#17120e" />
            <stop offset="100%" stopColor="#0b0806" />
          </linearGradient>
        </defs>

        {isActive ? (
          <>
            {/* Outer Sapphire Gem Bezel */}
            <polygon
              points="18,1 32,9 32,27 18,35 4,27 4,9"
              fill="none"
              stroke="#93c5fd"
              strokeWidth="1.2"
            />
            {/* Top Facet */}
            <polygon points="18,2 31,9.5 24,14 18,9 12,14 5,9.5" fill={`url(#activeTopFacet-${label})`} />
            {/* Left Facet */}
            <polygon points="5,9.5 12,14 12,22 5,26.5" fill={`url(#activeMidFacet-${label})`} />
            {/* Right Facet */}
            <polygon points="31,9.5 31,26.5 24,22 24,14" fill={`url(#activeMidFacet-${label})`} />
            {/* Bottom Facets */}
            <polygon points="5,26.5 12,22 18,27 18,34" fill={`url(#activeBotFacet-${label})`} />
            <polygon points="31,26.5 18,34 18,27 24,22" fill={`url(#activeBotFacet-${label})`} />
            {/* Center Table Facet */}
            <polygon points="18,9 24,14 24,22 18,27 12,22 12,14" fill={`url(#activeCenterGlow-${label})`} />
            {/* Specular Facet Highlight */}
            <polygon points="18,3 22,8 18,9 14,8" fill="#ffffff" fillOpacity="0.85" />
          </>
        ) : (
          <>
            {/* Inactive Recessed Bezel */}
            <polygon
              points="18,1 32,9 32,27 18,35 4,27 4,9"
              fill="none"
              stroke="#5e462b"
              strokeWidth="0.8"
              strokeOpacity="0.8"
            />
            {/* Top Facet */}
            <polygon points="18,2 31,9.5 24,14 18,9 12,14 5,9.5" fill={`url(#inactiveTopFacet-${label})`} />
            {/* Left Facet */}
            <polygon points="5,9.5 12,14 12,22 5,26.5" fill={`url(#inactiveMidFacet-${label})`} />
            {/* Right Facet */}
            <polygon points="31,9.5 31,26.5 24,22 24,14" fill={`url(#inactiveMidFacet-${label})`} />
            {/* Bottom Facets */}
            <polygon points="5,26.5 12,22 18,27 18,34" fill={`url(#inactiveBotFacet-${label})`} />
            <polygon points="31,26.5 18,34 18,27 24,22" fill={`url(#inactiveBotFacet-${label})`} />
            {/* Center Table Facet */}
            <polygon points="18,9 24,14 24,22 18,27 12,22 12,14" fill="#17120e" />
          </>
        )}
      </svg>

      {/* Number / ALL Typography */}
      <span
        className={`absolute font-black ${
          isAll ? 'text-[9px] tracking-tight' : 'text-xs'
        } select-none leading-none ${
          isActive
            ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]'
            : 'text-[#9e8b75] drop-shadow-[0_1px_1px_rgba(0,0,0,0.85)]'
        }`}
      >
        {label}
      </span>
    </button>
  );
}

/**
 * Bespoke brass-and-walnut magnifying glass SVG.
 */
function BespokeMagnifyingGlass() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 20 20"
      fill="none"
      className="shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="glassRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fae6a2" />
          <stop offset="50%" stopColor="#c89a42" />
          <stop offset="100%" stopColor="#7a5118" />
        </linearGradient>
        <linearGradient id="glassHandleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4a2810" />
          <stop offset="50%" stopColor="#251206" />
          <stop offset="100%" stopColor="#0d0502" />
        </linearGradient>
      </defs>
      {/* Lens Outer Rim */}
      <circle cx="8.5" cy="8.5" r="6" stroke="url(#glassRingGrad)" strokeWidth="1.6" />
      {/* Specular Lens Reflection Line */}
      <path
        d="M5.5 5.5 C 7 4, 10 4, 11.5 5.5"
        stroke="#ffffff"
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeOpacity="0.8"
      />
      {/* Metal Ferrule Bracket */}
      <rect
        x="12"
        y="12"
        width="3"
        height="2"
        transform="rotate(45 12 12)"
        fill="url(#glassRingGrad)"
      />
      {/* Turned Walnut Handle */}
      <line
        x1="13.2"
        y1="13.2"
        x2="18"
        y2="18"
        stroke="url(#glassHandleGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Brass Spine Inlay on Handle */}
      <line
        x1="13.5"
        y1="13.5"
        x2="17.5"
        y2="17.5"
        stroke="#fae6a2"
        strokeWidth="0.6"
        strokeLinecap="round"
        strokeOpacity="0.5"
      />
    </svg>
  );
}

export function CollectionBookView() {
  const currentPage = useCollectionStore((s) => s.currentPage);
  const manaFilter = useCollectionStore((s) => s.manaFilter);
  const searchQuery = useCollectionStore((s) => s.searchQuery);
  const setPage = useCollectionStore((s) => s.setPage);
  const setManaFilter = useCollectionStore((s) => s.setManaFilter);
  const setSearchQuery = useCollectionStore((s) => s.setSearchQuery);
  const setInspectedCard = useCollectionStore((s) => s.setInspectedCard);
  const addCardToDeck = useCollectionStore((s) => s.addCardToDeck);

  // Filter cards by Mana cost & Search Query
  const filteredCards = useMemo(() => {
    return MAGE_CARDS.filter((card) => {
      // Mana filter
      if (manaFilter !== null) {
        if (manaFilter === 7) {
          if (card.cost < 7) return false;
        } else {
          if (card.cost !== manaFilter) return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = card.name.toLowerCase().includes(q);
        const matchesText = card.text.toLowerCase().includes(q);
        const matchesType = card.type.toLowerCase().includes(q);
        const matchesRarity = card.rarity.toLowerCase().includes(q);
        if (!matchesName && !matchesText && !matchesType && !matchesRarity) {
          return false;
        }
      }

      return true;
    });
  }, [manaFilter, searchQuery]);

  const cardsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(filteredCards.length / cardsPerPage));
  const activePage = Math.min(currentPage, totalPages);

  // Sliced 8-card slice: 4 cards for left page, 4 cards for right page
  const pageCards = useMemo(() => {
    const start = (activePage - 1) * cardsPerPage;
    return filteredCards.slice(start, start + cardsPerPage);
  }, [filteredCards, activePage]);

  const leftPageCards = pageCards.slice(0, 4);
  const rightPageCards = pageCards.slice(4, 8);

  // Preload adjacent page card images in background (Image cache) for instant 60 FPS page flips
  useEffect(() => {
    const pagesToPreload = [activePage - 1, activePage + 1];
    pagesToPreload.forEach((p) => {
      if (p >= 1 && p <= totalPages) {
        const start = (p - 1) * cardsPerPage;
        const slice = filteredCards.slice(start, start + cardsPerPage);
        slice.forEach((card) => {
          if (card.imageUrl) {
            const img = new Image();
            img.src = card.imageUrl;
          }
        });
      }
    });
  }, [activePage, totalPages, filteredCards]);

  const manaCrystals = ['All', 0, 1, 2, 3, 4, 5, 6, 7];

  function handleInspect(card: CardDefinition) {
    setInspectedCard(card);
  }

  function handleQuickAdd(card: CardDefinition) {
    addCardToDeck(card.id);
  }

  return (
    <div className="relative flex-1 h-full flex flex-col items-center justify-between p-2.5 sm:p-3 select-none overflow-hidden">
      {/* THE OPEN TOME (WALNUT & VELLUM COLLECTOR'S GRIMOIRE) */}
      <div className="relative w-full max-w-4xl flex-1 rounded-[22px] bg-gradient-to-b from-[#3a2213] via-[#24140a] to-[#160b05] p-2.5 sm:p-3.5 border-4 border-[#8e6129] shadow-[0_24px_60px_rgba(0,0,0,0.95)] flex flex-col justify-between overflow-visible">
        
        {/* Top Header Plaque: "Mage" with Clean Engraved Brass Filigree Dividers (No Generic Sparkles) */}
        <div className="relative z-10 flex items-center justify-center -mt-1 mb-2">
          <div className="relative px-6 sm:px-10 py-1.5 rounded-b-xl bg-gradient-to-b from-[#2e190d] via-[#201007] to-[#120803] border-x-2 border-b-2 border-[#94682a] shadow-[0_6px_16px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.15)] flex items-center gap-3">
            <BrassFiligreeDivider />
            <div className="flex flex-col items-center">
              <span className="text-lg sm:text-2xl font-black tracking-[0.25em] uppercase font-serif drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] bg-gradient-to-b from-[#fff2c2] via-[#e2b755] to-[#a07421] bg-clip-text text-transparent">
                Mage
              </span>
              <span className="text-[9px] uppercase tracking-[0.3em] text-[#a8824b] font-bold -mt-0.5 leading-none">
                Arcane Tome
              </span>
            </div>
            <BrassFiligreeDivider flip />
          </div>
        </div>

        {/* The Two-Page Open Book Interior */}
        <div className="relative flex-1 rounded-[14px] bg-[#eadecb] shadow-[inset_0_0_40px_rgba(0,0,0,0.38)] border border-[#a2845c] p-3 sm:p-4 flex gap-4 overflow-hidden">
          
          {/* Subtle Page Watermark Texture */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_45%,_rgba(110,80,45,0.18)_100%)] pointer-events-none" />

          {/* Layered Paper-Edge Lines along Left Outer Margin (Stacked Vellum Pages) */}
          <div className="absolute inset-y-0 left-0 w-3 flex flex-row pointer-events-none z-10" aria-hidden="true">
            <div className="w-[1.5px] h-full bg-[#8c6f44] opacity-80" />
            <div className="w-[1px] h-full bg-[#d9c49e] opacity-90 ml-[1px]" />
            <div className="w-[1px] h-full bg-[#a8895b] opacity-75 ml-[1px]" />
            <div className="w-[1.5px] h-full bg-[#f2e2c4] opacity-80 ml-[1px]" />
            <div className="w-[1px] h-full bg-[#7a5e35] opacity-60 ml-[1px]" />
            <div className="w-1.5 h-full bg-gradient-to-r from-black/25 to-transparent" />
          </div>

          {/* Layered Paper-Edge Lines along Right Outer Margin (Stacked Vellum Pages) */}
          <div className="absolute inset-y-0 right-0 w-3 flex flex-row-reverse pointer-events-none z-10" aria-hidden="true">
            <div className="w-[1.5px] h-full bg-[#8c6f44] opacity-80" />
            <div className="w-[1px] h-full bg-[#d9c49e] opacity-90 mr-[1px]" />
            <div className="w-[1px] h-full bg-[#a8895b] opacity-75 mr-[1px]" />
            <div className="w-[1.5px] h-full bg-[#f2e2c4] opacity-80 mr-[1px]" />
            <div className="w-[1px] h-full bg-[#7a5e35] opacity-60 mr-[1px]" />
            <div className="w-1.5 h-full bg-gradient-to-l from-black/25 to-transparent" />
          </div>

          {/* Recessed Dark-Leather Spine Crease with Realistic Inner Page-Curl Shadows Flanking Both Sides */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none z-20">
            {/* Left Page-Curl Shadow */}
            <div className="w-12 sm:w-16 h-full bg-gradient-to-l from-black/45 via-black/15 to-transparent" />

            {/* Recessed Dark Leather Spine Crease */}
            <div className="w-5 sm:w-6 h-full bg-gradient-to-r from-[#0d0602] via-[#1f1107] to-[#0d0602] shadow-[inset_0_0_8px_rgba(0,0,0,0.95)] border-x border-[#3b220d]/80 flex flex-col items-center justify-between py-2">
              {/* Dashed Brass Thread Stitch Line */}
              <div className="w-[1px] h-full border-r border-dashed border-[#b88c38]/40" />
            </div>

            {/* Right Page-Curl Shadow */}
            <div className="w-12 sm:w-16 h-full bg-gradient-to-r from-black/45 via-black/15 to-transparent" />
          </div>

          {/* The Two-Page Open Book Content */}
          {filteredCards.length === 0 ? (
            <>
              {/* Left Page (Empty Tome Arcane Inscription & Seal) */}
              <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 sm:px-10 text-center select-none">
                {/* Arcane Mage Crest Watermark */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-2.5 bg-gradient-to-b from-[#fae6a2]/40 to-transparent border border-[#b88c38]/60 shadow-[inset_0_2px_6px_rgba(0,0,0,0.15)] flex items-center justify-center mb-3">
                  <svg className="w-10 h-10 sm:w-12 sm:h-12 text-[#8c672b]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polygon points="12,2 22,12 12,22 2,12" stroke="currentColor" strokeWidth="1.2" />
                    <polygon points="12,5 19,12 12,19 5,12" stroke="#b88c38" strokeWidth="0.8" fill="rgba(184, 140, 56, 0.15)" />
                    <circle cx="12" cy="12" r="3" fill="#8c672b" />
                    <circle cx="12" cy="12" r="1.2" fill="#fffbe6" />
                    <line x1="12" y1="2" x2="12" y2="6" stroke="#8c672b" strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="12" y1="18" x2="12" y2="22" stroke="#8c672b" strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="2" y1="12" x2="6" y2="12" stroke="#8c672b" strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="18" y1="12" x2="22" y2="12" stroke="#8c672b" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </div>
                <h4 className="text-xs sm:text-sm font-black font-serif uppercase tracking-widest text-[#7a572a]">
                  Arcane Archives
                </h4>
                <p className="text-[11px] sm:text-xs italic font-serif text-[#8f6d42] mt-1.5 max-w-[210px] leading-relaxed">
                  "The library remains still. No spells or allies answer this query."
                </p>
              </div>

              {/* Right Page (Empty State Status, Filter Details & Tactile Reset Button) */}
              <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 sm:px-10 text-center select-none">
                <h3 className="text-base sm:text-xl font-black text-[#422910] font-serif uppercase tracking-wider drop-shadow-xs">
                  No Cards Found
                </h3>

                <p className="text-xs sm:text-sm text-[#6e502d] mt-2 max-w-xs font-serif leading-relaxed">
                  {manaFilter !== null && searchQuery ? (
                    <>
                      No Mage cards match <span className="font-bold text-[#422910]">"{searchQuery}"</span> at{' '}
                      <span className="font-bold text-[#422910]">{manaFilter === 7 ? '7+' : manaFilter} Mana</span>.
                    </>
                  ) : manaFilter !== null ? (
                    <>
                      There are no <span className="font-bold text-[#422910]">{manaFilter === 7 ? '7+' : manaFilter}-Mana</span>{' '}
                      Mage cards in the current Standard set.
                    </>
                  ) : searchQuery ? (
                    <>
                      No Mage cards match <span className="font-bold text-[#422910]">"{searchQuery}"</span>.
                    </>
                  ) : (
                    'No Mage cards match your current search or mana filters.'
                  )}
                </p>

                {/* Tactile Reset Filters Brass Button */}
                <button
                  type="button"
                  onClick={() => {
                    setManaFilter(null);
                    setSearchQuery('');
                  }}
                  className="mt-4 px-4 py-1.5 rounded-xl bg-gradient-to-b from-[#f7e0a3] via-[#cda043] to-[#7e5118] text-stone-950 font-serif font-black text-xs uppercase tracking-wider border-t border-[#fffbe6] border-b-2 border-[#54330a] shadow-[0_3px_8px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.7)] hover:brightness-110 active:translate-y-0.5 cursor-pointer transition-all"
                >
                  Reset Filters
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Left Page (2x2 Grid) */}
              <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-2 sm:gap-3 items-center justify-items-center relative z-10 pl-2">
                {leftPageCards.map((card) => (
                  <HearthstoneCard
                    key={card.id}
                    card={card}
                    onInspect={handleInspect}
                    onQuickAdd={handleQuickAdd}
                  />
                ))}
                {/* Empty slot filler if needed */}
                {leftPageCards.length < 4 &&
                  Array.from({ length: 4 - leftPageCards.length }).map((_, i) => (
                    <div key={`empty-left-${i}`} className="w-36 h-52 opacity-0 pointer-events-none" />
                  ))}
              </div>

              {/* Right Page (2x2 Grid) */}
              <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-2 sm:gap-3 items-center justify-items-center relative z-10 pr-2">
                {rightPageCards.map((card) => (
                  <HearthstoneCard
                    key={card.id}
                    card={card}
                    onInspect={handleInspect}
                    onQuickAdd={handleQuickAdd}
                  />
                ))}
                {/* Empty slot filler */}
                {rightPageCards.length < 4 &&
                  Array.from({ length: 4 - rightPageCards.length }).map((_, i) => (
                    <div key={`empty-right-${i}`} className="w-36 h-52 opacity-0 pointer-events-none" />
                  ))}
              </div>
            </>
          )}

          {/* Carved Brass-and-Walnut Latch Tabs for Page Turns */}
          <CarvedBookLatchTab
            direction="prev"
            disabled={activePage <= 1}
            onClick={() => setPage(activePage - 1)}
          />

          <CarvedBookLatchTab
            direction="next"
            disabled={activePage >= totalPages}
            onClick={() => setPage(activePage + 1)}
          />
        </div>

        {/* Book Footer: Page Indicator */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[#b88c38]/60" />
          <span className="text-xs font-serif font-bold text-[#f5e2b3] tracking-widest uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            Page {activePage} of {totalPages}
          </span>
          <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-[#b88c38]/60" />
        </div>
      </div>

      {/* BOTTOM CONTROL TRAY: FACETED MANA CRYSTALS & RECESSED SEARCH BAR */}
      <div className="relative mt-2.5 w-full max-w-4xl px-3 sm:px-4 py-2 rounded-2xl bg-gradient-to-b from-[#2b180d] to-[#140b05] border-2 border-[#8e6129]/70 shadow-[0_8px_20px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.1)] flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Centered Mana Crystal Filter Tray */}
        <div className="flex items-center gap-1 sm:gap-2">
          {manaCrystals.map((val) => {
            const isAll = val === 'All';
            const crystalNum = isAll ? null : (val as number);
            const isActive = isAll ? manaFilter === null : manaFilter === crystalNum;

            return (
              <FacetedManaCrystalButton
                key={String(val)}
                val={val}
                isActive={isActive}
                onClick={() => setManaFilter(crystalNum)}
              />
            );
          })}
        </div>

        {/* Live Search Input: Recessed Leather-and-Wood Trough with Bespoke Magnifying Glass */}
        <div className="relative flex items-center px-3 py-1.5 rounded-xl bg-gradient-to-b from-[#120803] via-[#1a0e05] to-[#0f0602] border border-[#6b4c25] shadow-[inset_0_2px_6px_rgba(0,0,0,0.9),0_1px_1px_rgba(255,255,255,0.06)] focus-within:border-[#e2b755] focus-within:shadow-[inset_0_2px_6px_rgba(0,0,0,0.9),0_0_8px_rgba(226,183,85,0.35)] transition-all">
          <BespokeMagnifyingGlass />
          <input
            type="text"
            placeholder="Search Mage cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-36 sm:w-48 ml-2 text-xs bg-transparent text-[#f5e2b3] placeholder-[#8e7557] focus:outline-none font-medium selection:bg-[#7a5118]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="w-4 h-4 ml-1 rounded-full bg-[#2a170b] border border-[#8e6328]/60 flex items-center justify-center text-[10px] text-[#fae6a2] hover:bg-[#4a2b15] cursor-pointer"
              aria-label="Clear Search"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
