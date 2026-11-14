import React, { useState } from 'react';
import { CardDefinition } from '../../engine/types';
import { useCollectionStore } from '../../store/useCollectionStore';

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

  const rarityColor =
    card.rarity === 'LEGENDARY'
      ? '#ff8000'
      : card.rarity === 'EPIC'
      ? '#a335ee'
      : card.rarity === 'RARE'
      ? '#0070dd'
      : '#ffffff';

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
        isCapped ? 'opacity-55 filter grayscale-[35%]' : 'hover:scale-105'
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

            {/* Center Art SVG Placeholder */}
            <div className="my-auto text-center flex flex-col items-center">
              <svg className="w-8 h-8 text-amber-300/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
              </svg>
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
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-xs font-black text-amber-300 pointer-events-none drop-shadow">
            ★
          </div>
        )}
      </div>

      {/* Bottom Status / Quick-Add Badging */}
      <div className="mt-1 h-7 flex items-center justify-center">
        {editingDeckId ? (
          isAtDeckLimit ? (
            <div className="px-2.5 py-0.5 rounded bg-[#2b180d] border border-[#a67938]/70 text-[#f5e2b3] text-[10px] font-black uppercase tracking-wider shadow">
              Deck Limit: {maxCopies}
            </div>
          ) : isDeckFull ? (
            <div className="px-2 py-0.5 rounded bg-[#241308] border border-[#7d5622]/50 text-stone-400 text-[10px] font-bold">
              Deck Full
            </div>
          ) : (
            <button
              type="button"
              onClick={handleQuickAdd}
              className="px-3 py-0.5 rounded-full bg-gradient-to-b from-[#f3d387] via-[#c6973e] to-[#7a4e15] border border-[#fffae0]/60 text-stone-950 text-xs font-black shadow hover:brightness-110 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>+</span>
              <span className="text-[10px] uppercase font-bold">Add</span>
              {cardCountInDeck > 0 && <span className="text-[9px] opacity-75">({cardCountInDeck}/2)</span>}
            </button>
          )
        ) : (
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-200/80">
            <span
              className="w-2 h-2 rounded-full shadow-sm"
              style={{ backgroundColor: rarityColor }}
            />
            <span className="capitalize">{card.rarity.toLowerCase()}</span>
          </div>
        )}
      </div>
    </div>
  );
}
