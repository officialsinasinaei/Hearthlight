import React from 'react';
import { CardDefinition } from '../../engine/types';
import { useCollectionStore } from '../../store/useCollectionStore';
import { CardImage, TavernPlaque } from '../ui';

export { RarityGemIcon, RarityBadge } from '../ui';

interface HearthstoneCardProps {
  card: CardDefinition;
  onInspect?: (card: CardDefinition) => void;
  onQuickAdd?: (card: CardDefinition) => void;
}

export function HearthstoneCard({ card, onInspect, onQuickAdd }: HearthstoneCardProps) {
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
      data-capped={isCapped ? 'true' : 'false'}
      draggable={Boolean(editingDeckId && !isCapped)}
      onDragStart={(e) => {
        if (editingDeckId && !isCapped) {
          e.dataTransfer.setData('text/plain', card.id);
          e.dataTransfer.setData('application/x-hearthlight-card-id', card.id);
          e.dataTransfer.effectAllowed = 'copy';
        }
      }}
      onClick={handleClick}
      className={`group relative flex flex-col items-center justify-center cursor-pointer transition-transform duration-200 select-none w-full h-full min-h-0 min-w-0 max-h-full ${
        isCapped
          ? 'filter saturate-[0.80] brightness-[0.96] hover:scale-102'
          : 'hover:scale-105 hover:z-20'
      } ${editingDeckId && !isCapped ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      <div
        className={`relative flex-1 min-h-0 w-auto aspect-[5/7] flex items-center justify-center ${
          editingDeckId ? 'max-h-[calc(100%-24px)]' : 'max-h-full'
        }`}
      >
        <CardImage card={card} />
      </div>

      {editingDeckId && (
        <div className="mt-0.5 sm:mt-1 h-5 sm:h-6 shrink-0 flex items-center justify-center">
          {isAtDeckLimit ? (
            <TavernPlaque
              dataTestId="deck-limit-badge"
              className="px-1 md:px-1.5 py-[1px] md:py-0.5 rounded-[4px] border-[#8e6328]/80"
            >
              <span className="font-serif text-[7px] md:text-[9.5px] font-extrabold uppercase tracking-[0.01em] md:tracking-wider text-[#f5c451] leading-none whitespace-nowrap">
                Deck Limit: {maxCopies}
              </span>
            </TavernPlaque>
          ) : isDeckFull ? (
            <TavernPlaque
              dataTestId="deck-full-badge"
              className="px-1 md:px-1.5 py-[1px] md:py-0.5 rounded-[4px] border-[#6b5029]/80"
            >
              <span className="font-serif text-[7px] md:text-[9.5px] font-extrabold uppercase tracking-[0.01em] md:tracking-wider text-[#a88d6c] leading-none whitespace-nowrap">
                Deck Full
              </span>
            </TavernPlaque>
          ) : (
            <button
              type="button"
              data-testid="quick-add-button"
              onClick={handleQuickAdd}
              className="px-1 md:px-2 py-[1px] md:py-0.5 rounded-full bg-gradient-to-b from-[#f7e2a4] via-[#c99a42] to-[#7a4f18] border border-[#fff2c2]/80 text-[#1a0e05] text-[7.5px] md:text-[9.5px] font-black shadow-[0_2px_4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.4)] hover:brightness-115 hover:shadow-[0_0_8px_rgba(245,196,81,0.5)] active:scale-95 transition-all flex items-center gap-0.5 md:gap-1 cursor-pointer max-w-full w-fit whitespace-nowrap"
            >
              <span className="text-[9px] md:text-[10px] leading-none font-black">+</span>
              <span className="text-[7px] md:text-[9px] uppercase tracking-[0.01em] md:tracking-wider font-extrabold leading-none">
                Add
              </span>
              {cardCountInDeck > 0 && (
                <span className="text-[7px] md:text-[9px] font-mono font-black text-[#3d2008] ml-0.5 leading-none">
                  ({cardCountInDeck}/{maxCopies})
                </span>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
