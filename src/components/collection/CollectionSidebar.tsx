import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCollectionStore } from '../../store/useCollectionStore';
import { useAppStore } from '../../store/useAppStore';
import { MAGE_CARDS, HERO_ASSETS } from '../../engine/cards';
import { CardDefinition } from '../../engine/types';
import { TavernButton, TavernPlaque, CardImage, TavernModal } from '../ui';

export function CollectionSidebar() {
  const navigateTo = useAppStore((s) => s.navigateTo);

  const decks = useCollectionStore((s) => s.decks);
  const activeDeckId = useCollectionStore((s) => s.activeDeckId);
  const editingDeckId = useCollectionStore((s) => s.editingDeckId);
  const openDeckEditor = useCollectionStore((s) => s.openDeckEditor);
  const closeDeckEditor = useCollectionStore((s) => s.closeDeckEditor);
  const setHeroSelectOpen = useCollectionStore((s) => s.setHeroSelectOpen);
  const setActiveDeck = useCollectionStore((s) => s.setActiveDeck);
  const deleteDeck = useCollectionStore((s) => s.deleteDeck);
  const renameDeck = useCollectionStore((s) => s.renameDeck);
  const addCardToDeck = useCollectionStore((s) => s.addCardToDeck);
  const removeCardFromDeck = useCollectionStore((s) => s.removeCardFromDeck);
  const autoCompleteDeck = useCollectionStore((s) => s.autoCompleteDeck);
  const showToast = useCollectionStore((s) => s.showToast);

  const [isEditingName, setIsEditingName] = useState(false);
  const [deckNameInput, setDeckNameInput] = useState('');
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [hoveredCardInfo, setHoveredCardInfo] = useState<{
    card: CardDefinition;
    y: number;
  } | null>(null);

  const sidebarRef = useRef<HTMLDivElement>(null);

  const activeDeck = decks.find((d) => d.id === editingDeckId);

  // Deck list sorted cards in editor mode
  const editorCardList = useMemo(() => {
    if (!activeDeck) return [];
    return Object.entries(activeDeck.cards)
      .map(([cardId, count]) => {
        const def = MAGE_CARDS.find((c) => c.id === cardId);
        return {
          id: cardId,
          count,
          card: def,
        };
      })
      .filter((item): item is { id: string; count: number; card: CardDefinition } => item.card !== undefined)
      .sort((a, b) => {
        if (a.card.cost !== b.card.cost) return a.card.cost - b.card.cost;
        return a.card.name.localeCompare(b.card.name);
      });
  }, [activeDeck]);

  function handleStartRename() {
    if (!activeDeck) return;
    setDeckNameInput(activeDeck.name);
    setIsEditingName(true);
  }

  function handleSaveRename() {
    if (activeDeck && deckNameInput.trim()) {
      renameDeck(activeDeck.id, deckNameInput.trim());
    }
    setIsEditingName(false);
  }

  function handleDoneClick() {
    if (activeDeck && activeDeck.totalCount < 30) {
      setShowIncompleteModal(true);
    } else {
      closeDeckEditor();
    }
  }

  function handleRowMouseEnter(e: React.MouseEvent<HTMLDivElement>, card: CardDefinition) {
    if (sidebarRef.current) {
      const sidebarRect = sidebarRef.current.getBoundingClientRect();
      const rowRect = e.currentTarget.getBoundingClientRect();
      const rowCenterY = rowRect.top + rowRect.height / 2 - sidebarRect.top;
      // Clamp vertical position so the preview card remains fully in view
      const clampedY = Math.max(160, Math.min(sidebarRect.height - 160, rowCenterY));
      setHoveredCardInfo({ card, y: clampedY });
    }
  }

  function handleRowMouseLeave() {
    setHoveredCardInfo(null);
  }

  return (
    <aside
      ref={sidebarRef}
      className="relative w-[clamp(230px,27vw,340px)] shrink-0 h-full max-h-screen overflow-hidden bg-gradient-to-b from-[#2b180d] via-[#1d1007] to-[#120803] border-l-3 sm:border-l-4 border-[#8e6129] shadow-[0_0_30px_rgba(0,0,0,0.85)] flex flex-col p-2 sm:p-3 select-none"
    >
      {/* MODE 1: DECK LIST (WHEN NOT EDITING A SPECIFIC DECK) */}
      {!editingDeckId && (
        <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden justify-between">
          {/* Header */}
          <div className="flex items-center justify-between pb-1.5 sm:pb-2.5 border-b border-[#8e6129]/40 shrink-0">
            <h2 className="text-sm sm:text-base font-black text-[#fae6a2] tracking-wider uppercase font-serif drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              My Decks
            </h2>
            <TavernPlaque variant="wood" size="sm" className="px-2 py-0.5 rounded-md">
              <span className="text-[11px] sm:text-xs font-black tabular-nums text-[#fae6a2]">
                {decks.length}
              </span>
              <span className="text-[10px] font-bold text-stone-500">/</span>
              <span className="text-[11px] sm:text-xs font-black tabular-nums text-stone-400">
                9
              </span>
            </TavernPlaque>
          </div>

          {/* Decks Scroll List (Up to 9 slots) */}
          <div className="flex-1 my-2 overflow-y-auto space-y-1.5 sm:space-y-2 pr-1 custom-scrollbar min-h-0">
            {decks.map((deck) => {
              const isActive = deck.id === activeDeckId;
              const isIncomplete = !deck.isValid;

              return (
                <div
                  key={deck.id}
                  data-testid="deck-list-item"
                  onClick={() => openDeckEditor(deck.id)}
                  className={`group relative h-11 sm:h-13 rounded-xl p-0.5 cursor-pointer transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-400 via-amber-300 to-sky-500 shadow-[0_0_18px_rgba(56,189,248,0.55)] scale-[1.01]'
                      : 'bg-gradient-to-b from-[#8e6129] via-[#5c3a16] to-[#3a220c] hover:scale-[1.01] hover:brightness-105 shadow-[0_3px_8px_rgba(0,0,0,0.5)]'
                  }`}
                >
                  {/* Inner Deck Banner */}
                  <div className="relative w-full h-full rounded-[9px] bg-gradient-to-r from-[#2a170c] via-[#1c0f06] to-[#25140a] px-2 flex items-center justify-between overflow-hidden border border-[#523315]">
                    
                    {/* Left: Hero Portrait Thumbnail in Beveled Brass Square Frame + Deck Name & Meta Stacked */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {/* Beveled Brass Square Frame */}
                      <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg p-[1.5px] bg-gradient-to-b from-[#fae6a2] via-[#b6852f] to-[#5a390e] shadow shrink-0">
                        {/* Illuminated Gold Star Corner Emblem for Active Deck */}
                        {isActive && (
                          <div className="absolute -top-1 -left-1 z-20 w-3.5 h-3.5 rounded-full bg-gradient-to-b from-[#fef08a] via-[#eab308] to-[#854d0e] border border-[#fef9c3] shadow flex items-center justify-center">
                            <span className="text-[8px] text-[#422006] font-black leading-none">★</span>
                          </div>
                        )}
                        <div
                          data-testid="deck-avatar"
                          className="w-full h-full rounded-[5px] overflow-hidden bg-[#120a05] border border-[#2d1b0c] flex items-center justify-center relative"
                        >
                          <img
                            src={HERO_ASSETS.JAINA_PORTRAIT}
                            alt="Jaina Proudmoore"
                            loading="eager"
                            decoding="sync"
                            className="w-full h-full object-cover object-[50%_18%]"
                          />
                        </div>
                      </div>

                      {/* Stacked Two-Row Deck Details: Row 1 = Full Name, Row 2 = Class + Active + Count */}
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-extrabold text-[#f7eedc] group-hover:text-white transition-colors truncate leading-tight">
                          {deck.name}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] font-bold text-[#c89d46] uppercase tracking-wider leading-none">
                            Mage
                          </span>
                          {isActive && (
                            <span className="px-1.5 py-0.2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[8px] font-black tracking-wider uppercase border border-sky-300/80 shadow leading-none">
                              Active
                            </span>
                          )}
                          {isIncomplete ? (
                            <div className="px-1 py-0.2 rounded bg-[#2a090b] border border-rose-700/80 shadow flex items-center gap-0.5 text-rose-400 leading-none">
                              <span className="text-[9px] font-extrabold tabular-nums text-rose-400">
                                {deck.totalCount}
                              </span>
                              <span className="text-[8px] font-bold text-rose-700">/</span>
                              <span className="text-[9px] font-extrabold tabular-nums text-rose-600/80">
                                30
                              </span>
                            </div>
                          ) : (
                            <div className="px-1 py-0.2 rounded bg-[#0f0804] border border-[#4a2e12] shadow flex items-center gap-0.5 text-[#fae6a2] leading-none">
                              <span className="text-[9px] font-extrabold tabular-nums text-[#fae6a2]">
                                30
                              </span>
                              <span className="text-[8px] font-bold text-stone-500">/</span>
                              <span className="text-[9px] font-extrabold tabular-nums text-stone-400">
                                30
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}

            {/* Empty Deck Slots: Tactile Recessed Leather Card-Pocket Slots */}
            {Array.from({ length: Math.max(0, 9 - decks.length) }).map((_, i) => (
              <div
                key={`empty-slot-${i}`}
                className="relative h-9 sm:h-11 rounded-xl bg-gradient-to-b from-[#180e07] via-[#120a04] to-[#0c0603] border border-[#3d2411]/70 shadow flex items-center justify-between px-2.5 select-none overflow-hidden"
              >
                <div className="flex items-center gap-2 opacity-50">
                  <div className="w-5 h-5 rounded-lg border border-dashed border-[#4a2e15] bg-[#0c0603]/80 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-[#5e3c1d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="3 3" />
                      <path d="M12 8v8M8 12h8" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-[#6d4a25] tracking-wide font-serif">
                      Empty Slot
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons: New Deck & Back to Main Menu */}
          <div className="pt-2 border-t border-[#8e6129]/40 space-y-1.5 shrink-0">
            <TavernButton
              variant="primary"
              data-testid="new-deck-button"
              disabled={decks.length >= 9}
              onClick={() => setHeroSelectOpen(true)}
              className="w-full"
            >
              New Deck
            </TavernButton>

            <TavernButton
              variant="secondary"
              onClick={() => navigateTo('MAIN_MENU')}
              className="w-full"
            >
              Back to Main Menu
            </TavernButton>
          </div>
        </div>
      )}

      {/* MODE 2: DECK EDITOR (WHEN A DECK IS OPENED) */}
      {editingDeckId && activeDeck && (
        <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden justify-between">
          {/* Deck Header & Rename */}
          <div className="pb-1.5 sm:pb-2.5 border-b border-[#8e6129]/40 shrink-0">
            <div className="flex items-center justify-between">
              {isEditingName ? (
                <div className="flex items-center gap-1.5 w-full">
                  <input
                    type="text"
                    value={deckNameInput}
                    onChange={(e) => setDeckNameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRename();
                      if (e.key === 'Escape') setIsEditingName(false);
                    }}
                    className="flex-1 px-2 py-1 text-xs sm:text-sm rounded bg-[#140b05] border border-[#a2845c] text-[#fae6a2] focus:outline-none focus:ring-1 focus:ring-[#fae6a2]"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSaveRename}
                    className="px-2 py-1 text-xs rounded bg-gradient-to-b from-amber-500 to-amber-700 text-stone-950 font-black border border-amber-300 hover:brightness-110 cursor-pointer shadow"
                    title="Save name"
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(false)}
                    className="px-2 py-1 text-xs rounded bg-stone-800 text-stone-300 font-bold border border-stone-600 hover:bg-stone-700 cursor-pointer"
                    title="Cancel"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  {/* Deck Title with Bespoke Engraved Quill SVG */}
                  <div
                    data-testid="deck-editor-title"
                    onClick={handleStartRename}
                    className="group flex items-center gap-1.5 cursor-pointer min-w-0 pr-1.5"
                    title="Click to rename deck"
                  >
                    <span className="text-xs sm:text-sm font-black text-[#fae6a2] tracking-wide font-serif group-hover:text-white truncate transition-colors drop-shadow">
                      {activeDeck.name}
                    </span>
                    <svg
                      className="w-3 h-3 text-[#c89d46] group-hover:text-[#fae6a2] transition-colors shrink-0"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M21.7 2.3c-.4-.4-1-.4-1.4 0l-3.3 3.3c-.6-.4-1.3-.6-2-.6-2.2 0-4 1.8-4 4 0 .4.1.8.2 1.1L3.3 18c-.2.2-.3.5-.3.8V21c0 .6.4 1 1 1h2.2c.3 0 .6-.1.8-.3l7.9-7.9c.3.1.7.2 1.1.2 2.2 0 4-1.8 4-4 0-.7-.2-1.4-.6-2l3.3-3.3c.4-.4.4-1 0-1.4l-1-1zm-9.9 8.5c-.8.8-2 .8-2.8 0s-.8-2 0-2.8 2-.8 2.8 0 .8 2 0 2.8z" />
                    </svg>
                  </div>

                  <TavernPlaque
                    dataTestId="deck-card-count"
                    variant="wood"
                    size="sm"
                    className="px-2 py-0.5 rounded-md shrink-0"
                  >
                    <span
                      className={`text-xs font-black tabular-nums ${
                        activeDeck.totalCount === 30 ? 'text-[#fae6a2]' : 'text-amber-400'
                      }`}
                    >
                      {activeDeck.totalCount}
                    </span>
                    <span className="text-[10px] font-bold text-stone-500">/</span>
                    <span className="text-xs font-black tabular-nums text-stone-400">
                      30
                    </span>
                  </TavernPlaque>
                </div>
              )}
            </div>

            {/* Set as Active Deck Button / Status */}
            <div className="mt-1.5">
              {activeDeck.id === activeDeckId ? (
                <div className="w-full py-1 rounded-lg bg-gradient-to-b from-[#2e1d0f] via-[#1a1007] to-[#120803] border-2 border-[#f5c451] text-[#f5c451] font-black text-[11px] text-center uppercase tracking-wider shadow flex items-center justify-center gap-1">
                  <span className="text-[#f5c451] text-xs leading-none">★</span>
                  <span>Active Deck</span>
                </div>
              ) : (
                <TavernButton
                  variant="primary"
                  size="sm"
                  disabled={!activeDeck.isValid}
                  onClick={() => {
                    if (activeDeck.isValid) {
                      setActiveDeck(activeDeck.id);
                    } else {
                      showToast('You must have 30 cards to set as Active Deck');
                    }
                  }}
                  className="w-full text-[11px]"
                >
                  {activeDeck.isValid ? 'Set as Active Deck' : '30 cards needed'}
                </TavernButton>
              )}
            </div>
          </div>

          {/* Cards List in Deck (Mana-Sorted Tiles with Card Art Strip & Drop Target) */}
          <div
            data-testid="deck-drop-zone"
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'copy';
              if (!isDragOver) setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              const cardId =
                e.dataTransfer.getData('application/x-hearthlight-card-id') ||
                e.dataTransfer.getData('text/plain');
              if (cardId) {
                addCardToDeck(cardId);
              }
            }}
            onMouseLeave={handleRowMouseLeave}
            className={`flex-1 my-1.5 overflow-y-auto space-y-1 pr-1 custom-scrollbar min-h-0 rounded-lg transition-all ${
              isDragOver
                ? 'ring-2 ring-[#f5c451] bg-[#f5c451]/10 shadow-[inset_0_0_12px_rgba(245,196,81,0.25)]'
                : ''
            }`}
          >
            {isDragOver && (
              <div className="py-1.5 px-2 text-center rounded bg-[#f5c451]/20 border border-[#f5c451]/70 text-[#f5c451] text-[10px] font-black uppercase tracking-wider animate-pulse select-none">
                ✦ Drop Card to Add ✦
              </div>
            )}
            {editorCardList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-3 text-xs text-[#a2845c]">
                <span className="font-bold text-xs text-[#fae6a2]">Deck is empty</span>
                <span className="mt-1 text-[11px] text-stone-400">Click or drag cards from collection to add.</span>
              </div>
            ) : (
              editorCardList.map(({ id, count, card }) => (
                <div
                  key={id}
                  onClick={() => removeCardFromDeck(id)}
                  onMouseEnter={(e) => handleRowMouseEnter(e, card)}
                  onMouseLeave={handleRowMouseLeave}
                  title="Click to remove 1 copy"
                  className="group relative h-8 sm:h-8.5 rounded-md bg-[#1c140e] border border-[#6b471d]/90 flex items-center overflow-hidden cursor-pointer transition-all duration-150 hover:border-amber-400 hover:shadow active:scale-[0.99] select-none"
                >
                  {/* Layer 1: Cropped Card Illustration Strip on Right/Center */}
                  <div className="absolute right-0 top-0 bottom-0 w-[68%] overflow-hidden pointer-events-none">
                    {card.imageUrl ? (
                      <img
                        src={card.imageUrl}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover object-[50%_32%] scale-135 filter brightness-105 contrast-105"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-r ${card.artGradient || 'from-sky-900 to-indigo-950'}`} />
                    )}
                  </div>

                  {/* Layer 2: Gradient Blend Overlay (Dark Walnut into Artwork) */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(90deg, #1c140e 38%, rgba(28,20,14,0.65) 68%, rgba(28,20,14,0.15) 100%)',
                    }}
                  />

                  {/* Left: Beveled Blue Mana Gem */}
                  <div className="relative z-10 pl-1 shrink-0 flex items-center">
                    <div className="relative w-5 h-5 rounded bg-gradient-to-b from-[#42a5f5] via-[#1565c0] to-[#0c397a] border border-[#90caf9] shadow flex items-center justify-center">
                      <span className="text-[11px] font-black text-white tabular-nums drop-shadow">
                        {card.cost}
                      </span>
                    </div>
                  </div>

                  {/* Center: Crisp Card Name */}
                  <div className="relative z-10 flex-1 min-w-0 px-1.5 flex items-center">
                    <span className="text-[11px] sm:text-xs font-bold text-[#f7eedc] group-hover:text-white truncate [text-shadow:_0_1px_3px_rgba(0,0,0,1)] transition-colors">
                      {card.name}
                    </span>
                  </div>

                  {/* Right: Framed Brass / Dark-Slate End-Cap */}
                  {(count > 1 || card.rarity === 'LEGENDARY') && (
                    <div className="relative z-10 w-6 h-full shrink-0 flex items-center justify-center bg-gradient-to-b from-[#281a11] via-[#1a110a] to-[#100a06] border-l border-[#8e6129]">
                      {card.rarity === 'LEGENDARY' ? (
                        <svg
                          className="w-3.5 h-3.5 text-[#fcd34d] drop-shadow"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ) : (
                        <span className="text-[11px] font-black text-[#fae6a2] tabular-nums drop-shadow">
                          {count}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer Actions: Complete My Deck (Primary), Delete (Secondary Crimson), Done (Confirm Ivory/Brass) */}
          <div className="pt-1.5 border-t border-[#8e6129]/40 space-y-1.5 shrink-0">
            {activeDeck.totalCount < 30 && (
              <TavernButton
                variant="primary"
                size="sm"
                onClick={autoCompleteDeck}
                className="w-full bg-gradient-to-b from-[#fbbf24] via-[#d97706] to-[#92400e] border-b-2 border-[#78350f] text-[11px]"
              >
                <svg className="w-3 h-3 text-stone-950" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l2.4 4.8 5.3.8-3.8 3.7.9 5.3-4.8-2.5-4.8 2.5.9-5.3-3.8-3.7 5.3-.8L12 2z" />
                </svg>
                <span>Complete My Deck</span>
              </TavernButton>
            )}

            <div className="flex gap-1.5">
              <TavernButton
                variant="danger"
                size="sm"
                onClick={() => deleteDeck(activeDeck.id)}
                className="flex-1"
              >
                Delete
              </TavernButton>
              <TavernButton
                variant="primary"
                size="sm"
                data-testid="deck-editor-done-button"
                onClick={handleDoneClick}
                className="flex-1 bg-gradient-to-b from-[#fff7e6] via-[#e2ce9f] to-[#aa8447] text-[#1c1106] border-t border-white border-b-2 border-[#5c4015] hover:brightness-105"
              >
                Done
              </TavernButton>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING FULL-CARD PREVIEW TOOLTIP */}
      <AnimatePresence>
        {hoveredCardInfo && (
          <motion.div
            initial={{ opacity: 0, x: 12, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 8, scale: 0.94 }}
            transition={{ duration: 0.12 }}
            style={{ top: `${hoveredCardInfo.y}px` }}
            className="absolute right-[calc(100%+12px)] -translate-y-1/2 pointer-events-none z-50 flex flex-col items-center select-none"
          >
            <div className="relative w-52 sm:w-60 h-[280px] sm:h-[340px] flex items-center justify-center filter drop-shadow-[0_20px_45px_rgba(0,0,0,0.95)]">
              <CardImage card={hoveredCardInfo.card} size="inspect" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INCOMPLETE DECK WARNING CONFIRMATION MODAL */}
      <TavernModal
        isOpen={showIncompleteModal}
        onClose={() => setShowIncompleteModal(false)}
        showCloseButton={false}
        maxWidth="sm"
        dataTestId="incomplete-deck-modal"
        backdropClassName="bg-black/85 backdrop-blur-md"
        className="bg-[#1e1107] bg-gradient-to-b from-[#2e1d11] via-[#1e1107] to-[#120803] border-2 border-[#fae6a2] p-5 text-center shadow-[0_25px_60px_rgba(0,0,0,0.95)]"
      >
        <h3 className="text-base font-black text-amber-100 uppercase tracking-wider font-serif">
          Incomplete Deck
        </h3>
        <p className="text-xs text-stone-300 mt-2 leading-relaxed">
          This deck only contains <strong className="text-amber-300 font-extrabold">{activeDeck?.totalCount}/30</strong> cards. An incomplete deck cannot be used in matches.
        </p>
        <div className="mt-5 flex gap-2.5">
          <TavernButton
            variant="ghost"
            size="sm"
            onClick={() => setShowIncompleteModal(false)}
            className="flex-1"
          >
            Keep Editing
          </TavernButton>
          <TavernButton
            variant="primary"
            size="sm"
            onClick={() => {
              setShowIncompleteModal(false);
              closeDeckEditor();
            }}
            className="flex-1"
          >
            Exit Anyway
          </TavernButton>
        </div>
      </TavernModal>
    </aside>
  );
}
