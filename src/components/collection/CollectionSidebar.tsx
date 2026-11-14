import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCollectionStore } from '../../store/useCollectionStore';
import { useAppStore } from '../../store/useAppStore';
import { MAGE_CARDS } from '../../engine/cards';
import { CardDefinition } from '../../engine/types';

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
  const removeCardFromDeck = useCollectionStore((s) => s.removeCardFromDeck);
  const autoCompleteDeck = useCollectionStore((s) => s.autoCompleteDeck);
  const showToast = useCollectionStore((s) => s.showToast);

  const [isEditingName, setIsEditingName] = useState(false);
  const [deckNameInput, setDeckNameInput] = useState('');
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
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
      const clampedY = Math.max(180, Math.min(sidebarRect.height - 180, rowCenterY));
      setHoveredCardInfo({ card, y: clampedY });
    }
  }

  function handleRowMouseLeave() {
    setHoveredCardInfo(null);
  }

  return (
    <aside
      ref={sidebarRef}
      className="relative w-80 sm:w-88 h-full max-h-screen overflow-hidden bg-gradient-to-b from-[#2b180d] via-[#1d1007] to-[#120803] border-l-4 border-[#8e6129] shadow-[0_0_30px_rgba(0,0,0,0.85)] flex flex-col p-3 select-none"
    >
      {/* MODE 1: DECK LIST (WHEN NOT EDITING A SPECIFIC DECK) */}
      {!editingDeckId && (
        <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden justify-between">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-[#8e6129]/40 shrink-0">
            <h2 className="text-base sm:text-lg font-black text-[#fae6a2] tracking-wider uppercase font-serif drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              My Decks
            </h2>
            <div className="px-2.5 py-0.5 rounded-md bg-[#0f0804] border border-[#4a2e12] shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)] flex items-center gap-1">
              <span className="text-xs font-black tabular-nums text-[#fae6a2]">
                {decks.length}
              </span>
              <span className="text-[10px] font-bold text-stone-500">/</span>
              <span className="text-xs font-black tabular-nums text-stone-400">
                9
              </span>
            </div>
          </div>

          {/* Decks Scroll List (Up to 9 slots) */}
          <div className="flex-1 my-3 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {decks.map((deck) => {
              const isActive = deck.id === activeDeckId;
              const isIncomplete = !deck.isValid;

              return (
                <div
                  key={deck.id}
                  onClick={() => openDeckEditor(deck.id)}
                  className={`group relative h-14 rounded-xl p-0.5 cursor-pointer transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-400 via-amber-300 to-sky-500 shadow-[0_0_22px_rgba(56,189,248,0.55)] scale-[1.01] animate-pulse'
                      : 'bg-gradient-to-b from-[#8e6129] via-[#5c3a16] to-[#3a220c] hover:scale-[1.01] hover:brightness-105 shadow-[0_4px_10px_rgba(0,0,0,0.5)]'
                  }`}
                >
                  {/* Inner Deck Banner */}
                  <div className="relative w-full h-full rounded-[10px] bg-gradient-to-r from-[#2a170c] via-[#1c0f06] to-[#25140a] px-2.5 flex items-center justify-between overflow-hidden border border-[#523315]">
                    
                    {/* Left: Hero Portrait Thumbnail in Beveled Brass Square Frame + Deck Name */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Beveled Brass Square Frame */}
                      <div className="relative w-9 h-9 rounded-lg p-[1.5px] bg-gradient-to-b from-[#fae6a2] via-[#b6852f] to-[#5a390e] shadow-[0_2px_4px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.4)] shrink-0">
                        {/* Illuminated Gold Star / Crown Corner Emblem for Active Deck */}
                        {isActive && (
                          <div className="absolute -top-1.5 -left-1.5 z-20 w-4 h-4 rounded-full bg-gradient-to-b from-[#fef08a] via-[#eab308] to-[#854d0e] border border-[#fef9c3] shadow-[0_2px_4px_rgba(0,0,0,0.9)] flex items-center justify-center">
                            <span className="text-[9px] text-[#422006] font-black leading-none">★</span>
                          </div>
                        )}
                        <div className="w-full h-full rounded-[6px] overflow-hidden bg-[#120a05] border border-[#2d1b0c] flex items-center justify-center relative">
                          <img
                            src="https://art.hearthstonejson.com/v1/256x/HERO_08.jpg"
                            alt="Jaina Proudmoore"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                            className="w-full h-full object-cover object-[50%_15%]"
                          />
                          {/* Fallback Mage Crest SVG if image is loading or fails */}
                          <svg
                            className="w-5 h-5 text-[#c89d46] absolute pointer-events-none -z-0"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 2l2.4 4.8 5.3.8-3.8 3.7.9 5.3-4.8-2.5-4.8 2.5.9-5.3-3.8-3.7 5.3-.8L12 2z" />
                          </svg>
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="text-sm font-extrabold text-[#f7eedc] group-hover:text-white transition-colors truncate">
                          {deck.name}
                        </div>
                        <div className="text-[10px] font-bold text-[#c89d46] uppercase tracking-wider">
                          Mage
                        </div>
                      </div>
                    </div>

                    {/* Right: Solid-Accent 'Active' Pill & Incomplete Warning / Tabular Counter Badge */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isActive && (
                        <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[10px] font-black tracking-wider uppercase border border-sky-300/80 shadow-[0_0_8px_rgba(2,132,199,0.5)]">
                          Active
                        </span>
                      )}

                      {isIncomplete ? (
                        <div className="px-2 py-0.5 rounded-md bg-[#2a090b] border border-rose-700/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)] flex items-center gap-0.5 text-rose-400">
                          <span className="text-[11px] font-extrabold tabular-nums text-rose-400">
                            {deck.totalCount}
                          </span>
                          <span className="text-[10px] font-bold text-rose-700">/</span>
                          <span className="text-[11px] font-extrabold tabular-nums text-rose-600/80">
                            30
                          </span>
                        </div>
                      ) : (
                        <div className="px-2 py-0.5 rounded-md bg-[#0f0804] border border-[#4a2e12] shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)] flex items-center gap-0.5 text-[#fae6a2]">
                          <span className="text-[11px] font-extrabold tabular-nums text-[#fae6a2]">
                            30
                          </span>
                          <span className="text-[10px] font-bold text-stone-500">/</span>
                          <span className="text-[11px] font-extrabold tabular-nums text-stone-400">
                            30
                          </span>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}

            {/* Empty Deck Slots: Tactile Recessed Leather Card-Pocket Slots */}
            {Array.from({ length: Math.max(0, 9 - decks.length) }).map((_, i) => (
              <div
                key={`empty-slot-${i}`}
                className="relative h-14 rounded-xl bg-gradient-to-b from-[#180e07] via-[#120a04] to-[#0c0603] border border-[#3d2411]/70 shadow-[inset_0_3px_8px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(0,0,0,0.95)] flex items-center justify-between px-3.5 select-none overflow-hidden"
              >
                {/* Leather pocket texture / stitched slot label */}
                <div className="flex items-center gap-3 opacity-60">
                  <div className="w-8 h-8 rounded-lg border border-dashed border-[#4a2e15] bg-[#0c0603]/80 flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#5e3c1d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="3 3" />
                      <path d="M12 8v8M8 12h8" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#6d4a25] tracking-wide font-serif [text-shadow:_0_1px_1px_rgba(0,0,0,0.9)]">
                      Empty Deck Slot
                    </div>
                    <div className="text-[10px] font-semibold text-[#4e3318] uppercase tracking-wider">
                      Slot {decks.length + i + 1}
                    </div>
                  </div>
                </div>
                
                {/* Subtle recessed leather notch */}
                <div className="w-1.5 h-6 rounded-full bg-[#0a0502] shadow-[inset_0_1px_2px_rgba(0,0,0,0.9)] border border-[#2b1809]/40" />
              </div>
            ))}
          </div>

          {/* Action Buttons: New Deck & Back to Main Menu */}
          <div className="pt-2 border-t border-[#8e6129]/40 space-y-2">
            <button
              type="button"
              disabled={decks.length >= 9}
              onClick={() => setHeroSelectOpen(true)}
              className={`w-full py-2.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_4px_12px_rgba(0,0,0,0.6)] flex items-center justify-center cursor-pointer transition-all ${
                decks.length >= 9
                  ? 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
                  : 'bg-gradient-to-b from-[#f7e0a3] via-[#cda043] to-[#7e5118] text-stone-950 border-t border-[#fffbe6] border-b-2 border-[#54330a] hover:brightness-110 active:translate-y-0.5 active:shadow-[0_2px_6px_rgba(0,0,0,0.6)]'
              }`}
            >
              New Deck
            </button>

            <button
              type="button"
              onClick={() => navigateTo('MAIN_MENU')}
              className="w-full py-2 rounded-xl bg-gradient-to-b from-[#3a2213] to-[#1c0f06] border border-[#8e6129]/60 text-[#f5e2b3] font-bold text-xs uppercase tracking-wider hover:text-white hover:border-[#fae6a2] transition-colors cursor-pointer"
            >
              Back to Main Menu
            </button>
          </div>
        </div>
      )}

      {/* MODE 2: DECK EDITOR (WHEN A DECK IS OPENED) */}
      {editingDeckId && activeDeck && (
        <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden justify-between">
          {/* Deck Header & Rename */}
          <div className="pb-2.5 border-b border-[#8e6129]/40 shrink-0">
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
                    className="flex-1 px-2.5 py-1 text-sm rounded bg-[#140b05] border border-[#a2845c] text-[#fae6a2] focus:outline-none focus:ring-1 focus:ring-[#fae6a2]"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSaveRename}
                    className="px-2.5 py-1 text-xs rounded bg-gradient-to-b from-amber-500 to-amber-700 text-stone-950 font-black border border-amber-300 hover:brightness-110 cursor-pointer shadow"
                    title="Save name"
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(false)}
                    className="px-2.5 py-1 text-xs rounded bg-stone-800 text-stone-300 font-bold border border-stone-600 hover:bg-stone-700 cursor-pointer"
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
                    className="group flex items-center gap-2 cursor-pointer min-w-0 pr-2"
                    title="Click to rename deck"
                  >
                    <span className="text-sm sm:text-base font-black text-[#fae6a2] tracking-wide font-serif group-hover:text-white truncate transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                      {activeDeck.name}
                    </span>
                    {/* Bespoke Engraved Quill SVG */}
                    <svg
                      className="w-3.5 h-3.5 text-[#c89d46] group-hover:text-[#fae6a2] transition-colors shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M21.7 2.3c-.4-.4-1-.4-1.4 0l-3.3 3.3c-.6-.4-1.3-.6-2-.6-2.2 0-4 1.8-4 4 0 .4.1.8.2 1.1L3.3 18c-.2.2-.3.5-.3.8V21c0 .6.4 1 1 1h2.2c.3 0 .6-.1.8-.3l7.9-7.9c.3.1.7.2 1.1.2 2.2 0 4-1.8 4-4 0-.7-.2-1.4-.6-2l3.3-3.3c.4-.4.4-1 0-1.4l-1-1zm-9.9 8.5c-.8.8-2 .8-2.8 0s-.8-2 0-2.8 2-.8 2.8 0 .8 2 0 2.8z" />
                    </svg>
                  </div>

                  {/* Dark Recessed Counter Badge */}
                  <div
                    data-testid="deck-card-count"
                    className="px-2.5 py-0.5 rounded-md bg-[#0f0804] border border-[#4a2e12] shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)] flex items-center gap-1 shrink-0"
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
                  </div>
                </div>
              )}
            </div>

            {/* Set as Active Deck Button / Status */}
            <div className="mt-2.5">
              {activeDeck.id === activeDeckId ? (
                <div className="w-full py-1.5 rounded-lg bg-gradient-to-b from-[#2e1d0f] via-[#1a1007] to-[#120803] border-2 border-[#f5c451] text-[#f5c451] font-black text-xs text-center uppercase tracking-wider shadow-[0_0_12px_rgba(245,196,81,0.35),inset_0_1px_2px_rgba(255,255,255,0.2)] flex items-center justify-center gap-1.5">
                  <span className="text-[#f5c451] text-sm leading-none">★</span>
                  <span>Active Deck</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (activeDeck.isValid) {
                      setActiveDeck(activeDeck.id);
                    } else {
                      showToast('You must have 30 cards to set as Active Deck');
                    }
                  }}
                  className={`w-full py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all shadow-[0_3px_8px_rgba(0,0,0,0.6)] ${
                    activeDeck.isValid
                      ? 'bg-gradient-to-b from-[#f7e0a3] via-[#cda043] to-[#7e5118] text-stone-950 border-t border-[#fffbe6] border-b-2 border-[#54330a] hover:brightness-110 active:translate-y-0.5 cursor-pointer'
                      : 'bg-stone-900/90 text-stone-500 border border-stone-800 cursor-not-allowed'
                  }`}
                >
                  {activeDeck.isValid ? 'Set as Active Deck' : 'Must have 30 cards to activate'}
                </button>
              )}
            </div>
          </div>

          {/* Cards List in Deck (Mana-Sorted Tiles with Card Art Strip) */}
          <div
            onMouseLeave={handleRowMouseLeave}
            className="flex-1 my-2 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar min-h-0"
          >
            {editorCardList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-xs text-[#a2845c]">
                <span className="font-bold text-sm text-[#fae6a2]">Deck is empty</span>
                <span className="mt-1 text-stone-400">Click cards in your collection to add them.</span>
              </div>
            ) : (
              editorCardList.map(({ id, count, card }) => (
                <div
                  key={id}
                  onClick={() => removeCardFromDeck(id)}
                  onMouseEnter={(e) => handleRowMouseEnter(e, card)}
                  onMouseLeave={handleRowMouseLeave}
                  title="Click to remove 1 copy"
                  className="group relative h-9 rounded-md bg-[#1c140e] border border-[#6b471d]/90 flex items-center overflow-hidden cursor-pointer transition-all duration-150 hover:border-amber-400 hover:shadow-[0_0_12px_rgba(251,191,36,0.35)] active:scale-[0.99] select-none"
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

                  {/* Layer 3: Subtle inner top/bottom borders & hover highlight */}
                  <div className="absolute inset-0 pointer-events-none border-t border-white/10 group-hover:bg-amber-400/[0.05] transition-colors" />

                  {/* Left: Beveled Blue Mana Gem */}
                  <div className="relative z-10 pl-1.5 shrink-0 flex items-center">
                    <div className="relative w-6 h-6 rounded bg-gradient-to-b from-[#42a5f5] via-[#1565c0] to-[#0c397a] border border-[#90caf9] shadow-[0_2px_4px_rgba(0,0,0,0.8),inset_0_1px_1.5px_rgba(255,255,255,0.8)] flex items-center justify-center">
                      <span className="text-[12px] font-black text-white tabular-nums drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                        {card.cost}
                      </span>
                    </div>
                  </div>

                  {/* Center: Crisp Card Name */}
                  <div className="relative z-10 flex-1 min-w-0 px-2 flex items-center">
                    <span className="text-xs font-bold text-[#f7eedc] group-hover:text-white truncate [text-shadow:_0_1px_3px_rgba(0,0,0,1)] transition-colors">
                      {card.name}
                    </span>
                  </div>

                  {/* Right: Framed Brass / Dark-Slate End-Cap */}
                  {(count > 1 || card.rarity === 'LEGENDARY') && (
                    <div className="relative z-10 w-7 h-full shrink-0 flex items-center justify-center bg-gradient-to-b from-[#281a11] via-[#1a110a] to-[#100a06] border-l border-[#8e6129] shadow-[-2px_0_5px_rgba(0,0,0,0.6)]">
                      {card.rarity === 'LEGENDARY' ? (
                        <svg
                          className="w-4 h-4 text-[#fcd34d] drop-shadow-[0_0_4px_rgba(251,191,36,0.9)]"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ) : (
                        <span className="text-[12px] font-black text-[#fae6a2] tabular-nums drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
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
          <div className="pt-2 border-t border-[#8e6129]/40 space-y-2 shrink-0">
            {activeDeck.totalCount < 30 && (
              <button
                type="button"
                onClick={autoCompleteDeck}
                className="w-full py-2 rounded-xl bg-gradient-to-b from-[#fbbf24] via-[#d97706] to-[#92400e] text-stone-950 text-xs font-black uppercase tracking-wider border-t border-[#fef08a] border-b-2 border-[#78350f] shadow-[0_4px_12px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.7)] hover:brightness-110 active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-1.5 transition-all"
              >
                <svg className="w-3.5 h-3.5 text-stone-950" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l2.4 4.8 5.3.8-3.8 3.7.9 5.3-4.8-2.5-4.8 2.5.9-5.3-3.8-3.7 5.3-.8L12 2z" />
                </svg>
                <span>Complete My Deck</span>
              </button>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => deleteDeck(activeDeck.id)}
                className="flex-1 py-2 rounded-xl bg-gradient-to-b from-[#3d1217] via-[#2c0c10] to-[#1a0709] border-t border-[#7f1d1d]/60 border-b-2 border-[#120406] text-rose-300 text-xs font-bold uppercase tracking-wider hover:text-white hover:bg-gradient-to-b hover:from-[#52171e] hover:via-[#3b0f14] hover:to-[#22070a] hover:border-rose-500/70 shadow-[0_3px_8px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.08)] active:translate-y-0.5 cursor-pointer transition-all"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={handleDoneClick}
                className="flex-1 py-2 rounded-xl bg-gradient-to-b from-[#fff7e6] via-[#e2ce9f] to-[#aa8447] text-[#1c1106] text-xs font-black uppercase tracking-wider border-t border-white border-b-2 border-[#5c4015] shadow-[0_4px_12px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.9)] hover:brightness-105 active:translate-y-0.5 cursor-pointer transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING FULL-CARD PREVIEW TOOLTIP (JUST TO THE LEFT OF SIDEBAR) */}
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
            {/* Full-Card Canvas */}
            <div className="relative w-60 sm:w-68 h-[350px] sm:h-[390px] flex items-center justify-center filter drop-shadow-[0_20px_45px_rgba(0,0,0,0.95)]">
              {hoveredCardInfo.card.imageUrl ? (
                <img
                  src={hoveredCardInfo.card.imageUrl}
                  alt={hoveredCardInfo.card.name}
                  loading="eager"
                  className="w-full h-full object-contain pointer-events-none"
                />
              ) : (
                /* Fallback if no card image */
                <div className="w-56 rounded-2xl bg-gradient-to-b from-[#2a170c] via-[#1a0f07] to-[#120803] border-2 border-[#8e6129] p-3.5 shadow-2xl flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-b from-sky-400 to-blue-800 text-white font-black text-sm flex items-center justify-center border border-sky-100 shadow">
                      {hoveredCardInfo.card.cost}
                    </div>
                    <span className="text-[10px] font-black uppercase text-[#fae6a2]">
                      {hoveredCardInfo.card.rarity}
                    </span>
                  </div>
                  <div className="my-3 text-center">
                    <div className="text-sm font-black text-[#fae6a2] font-serif">
                      {hoveredCardInfo.card.name}
                    </div>
                    <div
                      className="text-[11px] text-stone-300 mt-2 px-1 leading-snug"
                      dangerouslySetInnerHTML={{ __html: hoveredCardInfo.card.text }}
                    />
                  </div>
                  <div className="text-[10px] text-[#c89d46] text-center uppercase font-bold">
                    {hoveredCardInfo.card.type}
                  </div>
                </div>
              )}
            </div>

            {/* Floating Action Hint Badge */}
            <div className="mt-1 px-3 py-1 rounded-full bg-[#140b05]/95 border border-[#8e6129]/80 shadow-[0_4px_12px_rgba(0,0,0,0.8)] text-[11px] font-bold text-[#fae6a2] flex items-center gap-1.5 backdrop-blur-md">
              <span className="text-rose-400 font-black text-xs">−</span>
              <span>Click row to remove 1 copy</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INCOMPLETE DECK EXIT CONFIRMATION MODAL */}
      <AnimatePresence>
        {showIncompleteModal && activeDeck && (
          <div
            onClick={() => setShowIncompleteModal(false)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none cursor-pointer"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-sm w-full rounded-2xl bg-gradient-to-b from-[#2e190d] via-[#1f1007] to-[#120803] border-3 border-[#8e6129] shadow-[0_20px_50px_rgba(0,0,0,0.95)] p-5 text-center flex flex-col items-center cursor-default"
            >
              {/* Warning Icon Badge */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-b from-[#fbbf24] via-[#d97706] to-[#78350f] border-2 border-[#fef08a] flex items-center justify-center shadow-lg mb-3">
                <svg className="w-6 h-6 text-stone-950" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l2.4 4.8 5.3.8-3.8 3.7.9 5.3-4.8-2.5-4.8 2.5.9-5.3-3.8-3.7 5.3-.8L12 2z" />
                </svg>
              </div>

              <h3 className="text-base sm:text-lg font-black text-[#fae6a2] font-serif uppercase tracking-wide">
                Incomplete Deck
              </h3>

              <p className="text-xs text-stone-300 mt-2 leading-relaxed px-2">
                This deck is incomplete (<strong className="text-amber-300 font-bold">{activeDeck.totalCount}/30 cards</strong>). Would you like to automatically finish it?
              </p>

              {/* Modal Action Buttons */}
              <div className="mt-4 w-full space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    autoCompleteDeck();
                    setShowIncompleteModal(false);
                    closeDeckEditor();
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-b from-[#f7e0a3] via-[#cda043] to-[#7e5118] text-stone-950 text-xs font-black uppercase tracking-wider border-t border-[#fffbe6] border-b-2 border-[#54330a] shadow-[0_4px_12px_rgba(0,0,0,0.6)] hover:brightness-110 active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Finish Automatically (30/30)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowIncompleteModal(false);
                    closeDeckEditor();
                  }}
                  className="w-full py-2 rounded-xl bg-gradient-to-b from-[#3a2213] to-[#1c0f06] border border-[#8e6129]/60 text-[#f5e2b3] font-bold text-xs uppercase tracking-wider hover:text-white hover:border-[#fae6a2] transition-colors cursor-pointer"
                >
                  Save as Incomplete
                </button>

                <button
                  type="button"
                  onClick={() => setShowIncompleteModal(false)}
                  className="w-full py-1 text-[11px] text-stone-400 hover:text-stone-200 cursor-pointer"
                >
                  Keep Editing
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </aside>
  );
}
