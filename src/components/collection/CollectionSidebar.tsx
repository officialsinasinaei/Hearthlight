import React, { useState } from 'react';
import { useCollectionStore } from '../../store/useCollectionStore';
import { useAppStore } from '../../store/useAppStore';
import { MAGE_CARDS } from '../../engine/cards';

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

  const [isEditingName, setIsEditingName] = useState(false);
  const [deckNameInput, setDeckNameInput] = useState('');

  const activeDeck = decks.find((d) => d.id === editingDeckId);

  // Deck list sorted cards in editor mode
  const editorCardList = React.useMemo(() => {
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
      .filter((item) => item.card !== undefined)
      .sort((a, b) => {
        if (a.card!.cost !== b.card!.cost) return a.card!.cost - b.card!.cost;
        return a.card!.name.localeCompare(b.card!.name);
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

  return (
    <div className="relative w-80 sm:w-88 h-full bg-gradient-to-b from-[#2b180d] via-[#1d1007] to-[#120803] border-l-4 border-[#8e6129] shadow-[0_0_30px_rgba(0,0,0,0.85)] flex flex-col justify-between p-3 select-none">
      
      {/* MODE 1: DECK LIST (WHEN NOT EDITING A SPECIFIC DECK) */}
      {!editingDeckId && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#8e6129]/40">
            <h2 className="text-lg font-black text-[#fae6a2] tracking-wide uppercase font-serif">
              My Decks
            </h2>
            <span className="text-xs font-bold text-[#c89d46] bg-[#140b05] px-2 py-0.5 rounded border border-[#8e6129]/50">
              {decks.length} / 9 Decks
            </span>
          </div>

          {/* Decks Scroll List (Up to 9 slots) */}
          <div className="flex-1 my-3 overflow-y-auto space-y-2 pr-1">
            {decks.map((deck) => {
              const isActive = deck.id === activeDeckId;
              const isIncomplete = !deck.isValid;

              return (
                <div
                  key={deck.id}
                  onClick={() => openDeckEditor(deck.id)}
                  className={`group relative h-14 rounded-xl p-0.5 cursor-pointer transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-400 via-amber-300 to-blue-500 shadow-[0_0_15px_rgba(56,189,248,0.5)] scale-[1.02]'
                      : 'bg-gradient-to-b from-[#8e6129] to-[#4a2e12] hover:scale-[1.01]'
                  }`}
                >
                  {/* Inner Deck Banner */}
                  <div className="relative w-full h-full rounded-[10px] bg-gradient-to-r from-[#2a170c] via-[#1c0f06] to-[#25140a] px-3 flex items-center justify-between overflow-hidden border border-[#523315]">
                    
                    {/* Left: Jaina Hero Avatar + Name */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-[#140b05] border border-[#a2845c] flex items-center justify-center text-lg overflow-hidden">
                        🧙‍♀️
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-[#f7eedc] group-hover:text-white transition-colors line-clamp-1">
                          {deck.name}
                        </div>
                        <div className="text-[10px] font-semibold text-[#c89d46] uppercase">
                          Mage
                        </div>
                      </div>
                    </div>

                    {/* Right: Active or Incomplete Badge */}
                    <div className="flex items-center gap-1.5">
                      {isActive && (
                        <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-700 text-white text-[10px] font-black tracking-wider uppercase border border-sky-200 shadow">
                          ★ Active
                        </span>
                      )}
                      {isIncomplete && !isActive && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-500/50 text-rose-300 text-[10px] font-bold">
                          {deck.totalCount}/30
                        </span>
                      )}
                      {!isIncomplete && !isActive && (
                        <span className="text-[11px] font-bold text-stone-400">
                          30/30
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Empty Dashed Slots */}
            {Array.from({ length: Math.max(0, 9 - decks.length) }).map((_, i) => (
              <div
                key={`empty-slot-${i}`}
                className="h-14 rounded-xl border-2 border-dashed border-[#543818]/60 flex items-center justify-center text-xs font-semibold text-[#6e4e2a]"
              >
                Empty Deck Slot
              </div>
            ))}
          </div>

          {/* Action Buttons: New Deck & Back to Main Menu */}
          <div className="pt-2 border-t border-[#8e6129]/40 space-y-2">
            <button
              type="button"
              disabled={decks.length >= 9}
              onClick={() => setHeroSelectOpen(true)}
              className={`w-full py-2.5 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all ${
                decks.length >= 9
                  ? 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
                  : 'bg-gradient-to-b from-[#f3d387] via-[#c6973e] to-[#7a4e15] text-stone-950 border border-[#fffae0] hover:brightness-110 active:scale-98'
              }`}
            >
              <span>+</span>
              <span>New Deck</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo('MAIN_MENU')}
              className="w-full py-2 rounded-xl bg-gradient-to-b from-[#3a2213] to-[#1c0f06] border border-[#8e6129]/60 text-[#f5e2b3] font-bold text-xs uppercase tracking-wider hover:text-white hover:border-[#fae6a2] transition-colors cursor-pointer"
            >
              Back to Main Menu
            </button>
          </div>
        </>
      )}

      {/* MODE 2: DECK EDITOR (WHEN A DECK IS OPENED) */}
      {editingDeckId && activeDeck && (
        <>
          {/* Deck Header & Rename */}
          <div className="pb-2 border-b border-[#8e6129]/40">
            <div className="flex items-center justify-between">
              {isEditingName ? (
                <div className="flex items-center gap-1.5 w-full">
                  <input
                    type="text"
                    value={deckNameInput}
                    onChange={(e) => setDeckNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveRename()}
                    className="flex-1 px-2 py-0.5 text-sm rounded bg-[#140b05] border border-[#a2845c] text-white focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSaveRename}
                    className="px-2 py-0.5 text-xs rounded bg-amber-600 text-white font-bold"
                  >
                    ✓
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <div
                    onClick={handleStartRename}
                    className="text-base font-black text-[#fae6a2] tracking-wide cursor-pointer hover:underline line-clamp-1"
                    title="Click to rename deck"
                  >
                    {activeDeck.name} ✎
                  </div>
                  <span className="text-xs font-black text-[#c89d46]">
                    {activeDeck.totalCount} / 30
                  </span>
                </div>
              )}
            </div>

            {/* Set as Active Deck Button / Status */}
            <div className="mt-2">
              {activeDeck.id === activeDeckId ? (
                <div className="w-full py-1 rounded-lg bg-gradient-to-r from-sky-600 to-blue-800 border border-sky-300 text-white font-black text-xs text-center shadow">
                  ★ Active Deck
                </div>
              ) : (
                <button
                  type="button"
                  disabled={!activeDeck.isValid}
                  onClick={() => setActiveDeck(activeDeck.id)}
                  className={`w-full py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all ${
                    activeDeck.isValid
                      ? 'bg-gradient-to-b from-[#f3d387] via-[#c6973e] to-[#7a4e15] text-stone-950 border border-[#fffae0] hover:brightness-110 cursor-pointer'
                      : 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
                  }`}
                >
                  {activeDeck.isValid ? 'Set as Active Deck' : 'Must have 30 cards to activate'}
                </button>
              )}
            </div>
          </div>

          {/* Cards List in Deck (Mana-Sorted Tiles) */}
          <div className="flex-1 my-2 overflow-y-auto space-y-1 pr-1">
            {editorCardList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-xs text-[#a2845c]">
                <span>Deck is empty.</span>
                <span className="mt-1">Click cards in your collection to add them.</span>
              </div>
            ) : (
              editorCardList.map(({ id, count, card }) => (
                <div
                  key={id}
                  onClick={() => removeCardFromDeck(id)}
                  title="Click to remove 1 copy"
                  className="group relative h-7 rounded-md bg-gradient-to-r from-[#1f140b] via-[#2a1b10] to-[#1a0f07] border border-[#6b471d] px-2 flex items-center justify-between cursor-pointer hover:border-rose-500 transition-colors shadow-sm"
                >
                  {/* Left: Mana Gem */}
                  <span className="w-5 h-5 rounded-full bg-gradient-to-b from-sky-400 to-blue-700 text-white font-black text-[11px] flex items-center justify-center shadow">
                    {card!.cost}
                  </span>

                  {/* Center: Card Name */}
                  <span className="flex-1 mx-2 text-xs font-bold text-[#f7eedc] group-hover:text-rose-200 line-clamp-1 text-left">
                    {card!.name}
                  </span>

                  {/* Right: Quantity badge or legendary star */}
                  <span className="w-5 h-5 rounded bg-black/60 border border-[#a2845c]/50 text-[#fae6a2] text-xs font-black flex items-center justify-center group-hover:bg-rose-900 group-hover:border-rose-400">
                    {card!.rarity === 'LEGENDARY' ? '★' : count}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions: Complete My Deck, Delete, Done */}
          <div className="pt-2 border-t border-[#8e6129]/40 space-y-2">
            {activeDeck.totalCount < 30 && (
              <button
                type="button"
                onClick={autoCompleteDeck}
                className="w-full py-1.5 rounded-lg bg-gradient-to-b from-amber-600 to-amber-800 border border-amber-300/60 text-white text-xs font-black uppercase tracking-wider hover:brightness-110 cursor-pointer shadow"
              >
                Complete My Deck
              </button>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => deleteDeck(activeDeck.id)}
                className="flex-1 py-1.5 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-bold hover:bg-rose-900 hover:text-white cursor-pointer"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={closeDeckEditor}
                className="flex-1 py-1.5 rounded-lg bg-gradient-to-b from-[#f3d387] via-[#c6973e] to-[#7a4e15] border border-[#fffae0] text-stone-950 text-xs font-black uppercase tracking-wider hover:brightness-110 cursor-pointer shadow"
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
