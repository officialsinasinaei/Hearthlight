import { useMemo } from 'react';
import { MAGE_CARDS } from '../../engine/cards';
import { CardDefinition } from '../../engine/types';
import { useCollectionStore } from '../../store/useCollectionStore';
import { HearthstoneCard } from './HearthstoneCard';

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

  const manaCrystals = ['All', 0, 1, 2, 3, 4, 5, 6, 7];

  function handleInspect(card: CardDefinition) {
    setInspectedCard(card);
  }

  function handleQuickAdd(card: CardDefinition) {
    addCardToDeck(card.id);
  }

  return (
    <div className="relative flex-1 h-full flex flex-col items-center justify-between p-3 select-none">
      {/* THE OPEN TOME (WALNUT & PARCHMENT BOOK) */}
      <div className="relative w-full max-w-4xl flex-1 rounded-[22px] bg-gradient-to-b from-[#3a2213] via-[#24140a] to-[#160b05] p-3 sm:p-4 border-4 border-[#8e6129] shadow-[0_24px_60px_rgba(0,0,0,0.9)] flex flex-col justify-between overflow-hidden">
        
        {/* Top Parchment Banner: "Mage" */}
        <div className="relative z-10 flex items-center justify-center -mt-1 mb-2">
          <div className="relative px-12 py-1.5 rounded-b-xl bg-gradient-to-b from-[#f2e6cb] via-[#e5d4ad] to-[#cdb98d] border-x-2 border-b-2 border-[#8e6328] shadow-[0_4px_12px_rgba(0,0,0,0.6)] flex items-center gap-2">
            <span className="text-sky-700 text-sm font-black">✦</span>
            <span className="text-xl sm:text-2xl font-black text-[#3e2513] tracking-wider uppercase font-serif">
              Mage
            </span>
            <span className="text-sky-700 text-sm font-black">✦</span>
          </div>
        </div>

        {/* The Two-Page Open Book Interior */}
        <div className="relative flex-1 rounded-[14px] bg-[#eadecb] shadow-[inset_0_0_40px_rgba(0,0,0,0.35)] border border-[#a2845c] p-4 flex gap-4 overflow-hidden">
          
          {/* Subtle Page Watermark Texture & Edge Shadows */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(110,80,45,0.18)_100%)] pointer-events-none" />

          {/* Center Book Spine Crease Shadow */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-r from-transparent via-black/25 to-transparent pointer-events-none z-10" />

          {/* Left Page (2x2 Grid) */}
          <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-3 items-center justify-items-center">
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
          <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-3 items-center justify-items-center">
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

          {/* Left Page Turn Button */}
          <button
            type="button"
            disabled={activePage <= 1}
            onClick={() => setPage(activePage - 1)}
            aria-label="Previous Page"
            className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-12 rounded-r-lg bg-gradient-to-r from-[#8e6129] to-[#5a3812] border-y border-r border-[#fae6a2]/60 shadow-lg flex items-center justify-center text-[#fffae0] font-black text-lg transition-transform ${
              activePage <= 1 ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110 active:scale-95 cursor-pointer'
            }`}
          >
            ‹
          </button>

          {/* Right Page Turn Button */}
          <button
            type="button"
            disabled={activePage >= totalPages}
            onClick={() => setPage(activePage + 1)}
            aria-label="Next Page"
            className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-12 rounded-l-lg bg-gradient-to-l from-[#8e6129] to-[#5a3812] border-y border-l border-[#fae6a2]/60 shadow-lg flex items-center justify-center text-[#fffae0] font-black text-lg transition-transform ${
              activePage >= totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110 active:scale-95 cursor-pointer'
            }`}
          >
            ›
          </button>
        </div>

        {/* Book Footer: Page Indicator */}
        <div className="text-center text-xs font-bold text-[#f5e2b3] mt-2 tracking-wider">
          Page {activePage} of {totalPages}
        </div>
      </div>

      {/* BOTTOM CONTROL TRAY: MANA CRYSTALS & SEARCH BAR */}
      <div className="relative mt-3 w-full max-w-4xl px-4 py-2 rounded-2xl bg-gradient-to-b from-[#2b180d] to-[#140b05] border-2 border-[#8e6129]/60 shadow-lg flex items-center justify-between gap-4">
        
        {/* Centered Mana Crystal Filter Tray */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {manaCrystals.map((val) => {
            const isAll = val === 'All';
            const crystalNum = isAll ? null : (val as number);
            const isActive = isAll ? manaFilter === null : manaFilter === crystalNum;

            return (
              <button
                key={String(val)}
                type="button"
                onClick={() => setManaFilter(crystalNum)}
                className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-xs transition-transform cursor-pointer ${
                  isActive
                    ? 'scale-110 bg-gradient-to-b from-sky-300 via-sky-500 to-blue-800 text-white border-2 border-white shadow-[0_0_10px_#38bdf8]'
                    : 'bg-gradient-to-b from-[#243555] via-[#162136] to-[#0c1322] text-[#93a7cf] border border-[#3e537d]/60 hover:scale-105 hover:text-white'
                }`}
              >
                {isAll ? 'All' : val === 7 ? '7+' : val}
              </button>
            );
          })}
        </div>

        {/* Live Search Input with Clear Button */}
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Search Mage cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-44 sm:w-56 pl-3 pr-7 py-1 text-xs rounded-lg bg-[#140b05] border border-[#a2845c]/50 text-[#f5e2b3] placeholder-[#a2845c]/70 focus:outline-none focus:border-[#fae6a2]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 text-xs text-[#a2845c] hover:text-white cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
