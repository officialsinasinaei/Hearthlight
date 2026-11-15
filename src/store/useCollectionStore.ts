import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CardDefinition, SavedDeck } from '../engine/types';
import { MAGE_CARDS, completeDeckSmart, createStarterMageDeck } from '../engine/cards';
import { useAppStore } from './useAppStore';

interface CollectionState {
  decks: SavedDeck[];
  activeDeckId: string | null;
  editingDeckId: string | null;
  isHeroSelectOpen: boolean;
  inspectedCard: CardDefinition | null;
  manaFilter: number | null; // null = ALL, 0..7 (7 = 7+)
  searchQuery: string;
  currentPage: number;
  toastMessage: string | null;

  // Deck Management Actions
  createMageDeck: (name?: string) => string | null;
  deleteDeck: (deckId: string) => void;
  renameDeck: (deckId: string, name: string) => void;
  setActiveDeck: (deckId: string) => void;
  openDeckEditor: (deckId: string) => void;
  closeDeckEditor: () => void;
  addCardToDeck: (cardId: string) => boolean;
  removeCardFromDeck: (cardId: string) => void;
  autoCompleteDeck: () => void;

  // UI / Filter Actions
  setHeroSelectOpen: (open: boolean) => void;
  setInspectedCard: (card: CardDefinition | null) => void;
  setManaFilter: (mana: number | null) => void;
  setSearchQuery: (query: string) => void;
  setPage: (page: number) => void;
  showToast: (message: string) => void;

  // Selector helper
  getActiveValidDeck: () => SavedDeck | null;
}

const initialStarterDeck = createStarterMageDeck();

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set, get) => ({
      decks: [initialStarterDeck],
      activeDeckId: initialStarterDeck.id,
      editingDeckId: null,
      isHeroSelectOpen: false,
      inspectedCard: null,
      manaFilter: null,
      searchQuery: '',
      currentPage: 1,
      toastMessage: null,

      createMageDeck: (name) => {
        const state = get();
        if (state.decks.length >= 9) {
          get().showToast('Maximum 9 decks reached. Delete a deck first.');
          return null;
        }

        const newId = `deck-${Date.now()}`;
        const deckName = name || `Custom Mage ${state.decks.length + 1}`;
        const newDeck: SavedDeck = {
          id: newId,
          name: deckName,
          heroClass: 'MAGE',
          heroId: 'jaina',
          cards: {},
          totalCount: 0,
          isValid: false,
          updatedAt: Date.now(),
        };

        const updatedDecks = [...state.decks, newDeck];
        set({
          decks: updatedDecks,
          editingDeckId: newId,
          isHeroSelectOpen: false,
        });

        return newId;
      },

      deleteDeck: (deckId) => {
        const state = get();
        const updatedDecks = state.decks.filter((d) => d.id !== deckId);
        const validDecks = updatedDecks.filter((d) => d.isValid);

        let newActiveId = state.activeDeckId;
        if (state.activeDeckId === deckId) {
          // Reassign to remaining valid deck
          newActiveId = validDecks.length > 0 ? validDecks[0].id : null;
        }

        // Auto-activate if only 1 valid deck exists
        if (validDecks.length === 1) {
          newActiveId = validDecks[0].id;
        } else if (newActiveId && !validDecks.some((d) => d.id === newActiveId)) {
          newActiveId = validDecks.length > 0 ? validDecks[0].id : null;
        }

        set({
          decks: updatedDecks,
          activeDeckId: newActiveId,
          editingDeckId: state.editingDeckId === deckId ? null : state.editingDeckId,
        });
        get().showToast('Deck deleted.');
      },

      renameDeck: (deckId, name) => {
        set((state) => ({
          decks: state.decks.map((d) =>
            d.id === deckId ? { ...d, name: name.trim() || d.name, updatedAt: Date.now() } : d
          ),
        }));
      },

      setActiveDeck: (deckId) => {
        const state = get();
        const target = state.decks.find((d) => d.id === deckId);
        if (!target) return;
        if (!target.isValid) {
          get().showToast(`Cannot activate an incomplete deck (${target.totalCount}/30 cards).`);
          return;
        }
        set({ activeDeckId: deckId });
        get().showToast(`"${target.name}" is now your Active Deck!`);
      },

      openDeckEditor: (deckId) => {
        set({ editingDeckId: deckId, isHeroSelectOpen: false });
      },

      closeDeckEditor: () => {
        set({ editingDeckId: null });
      },

      addCardToDeck: (cardId) => {
        const state = get();
        if (!state.editingDeckId) return false;

        const deck = state.decks.find((d) => d.id === state.editingDeckId);
        if (!deck) return false;

        if (deck.totalCount >= 30) {
          get().showToast('Deck is full (30/30 cards).');
          return false;
        }

        const card = MAGE_CARDS.find((c) => c.id === cardId);
        if (!card) return false;

        const maxCopies = card.rarity === 'LEGENDARY' ? 1 : 2;
        const currentCount = deck.cards[cardId] || 0;

        if (currentCount >= maxCopies) {
          get().showToast(`Deck limit reached for ${card.name} (${maxCopies}/${maxCopies}).`);
          return false;
        }

        const updatedCards = { ...deck.cards, [cardId]: currentCount + 1 };
        const newTotal = deck.totalCount + 1;
        const isValid = newTotal === 30;

        const updatedDecks = state.decks.map((d) =>
          d.id === deck.id
            ? { ...d, cards: updatedCards, totalCount: newTotal, isValid, updatedAt: Date.now() }
            : d
        );

        // Auto-activate if this becomes the single valid deck or no active deck was set
        let activeId = state.activeDeckId;
        const validDecks = updatedDecks.filter((d) => d.isValid);
        if (validDecks.length === 1 || !activeId) {
          activeId = validDecks[0]?.id || null;
        }

        set({
          decks: updatedDecks,
          activeDeckId: activeId,
        });

        return true;
      },

      removeCardFromDeck: (cardId) => {
        const state = get();
        if (!state.editingDeckId) return;

        const deck = state.decks.find((d) => d.id === state.editingDeckId);
        if (!deck) return;

        const currentCount = deck.cards[cardId] || 0;
        if (currentCount <= 0) return;

        const updatedCards = { ...deck.cards };
        if (currentCount === 1) {
          delete updatedCards[cardId];
        } else {
          updatedCards[cardId] = currentCount - 1;
        }

        const newTotal = Math.max(0, deck.totalCount - 1);
        const isValid = newTotal === 30;

        const updatedDecks = state.decks.map((d) =>
          d.id === deck.id
            ? { ...d, cards: updatedCards, totalCount: newTotal, isValid, updatedAt: Date.now() }
            : d
        );

        const validDecks = updatedDecks.filter((d) => d.isValid);
        let activeId = state.activeDeckId;
        if (deck.id === activeId && !isValid) {
          // If active deck became incomplete, reassign to remaining valid deck
          activeId = validDecks.length > 0 ? validDecks[0].id : null;
        } else if (validDecks.length === 1) {
          activeId = validDecks[0].id;
        }

        set({
          decks: updatedDecks,
          activeDeckId: activeId,
        });
      },

      autoCompleteDeck: () => {
        const state = get();
        if (!state.editingDeckId) return;

        const deck = state.decks.find((d) => d.id === state.editingDeckId);
        if (!deck) return;

        const completedCards = completeDeckSmart(deck.cards, MAGE_CARDS);
        const total = Object.values(completedCards).reduce((a, b) => a + b, 0);

        const updatedDecks = state.decks.map((d) =>
          d.id === deck.id
            ? { ...d, cards: completedCards, totalCount: total, isValid: total === 30, updatedAt: Date.now() }
            : d
        );

        let activeId = state.activeDeckId;
        const validDecks = updatedDecks.filter((d) => d.isValid);
        if (validDecks.length === 1 || !activeId) {
          activeId = validDecks[0]?.id || null;
        }

        set({
          decks: updatedDecks,
          activeDeckId: activeId,
        });

        get().showToast('Deck automatically completed with a balanced mana curve!');
      },

      setHeroSelectOpen: (open) => {
        set({ isHeroSelectOpen: open });
      },

      setInspectedCard: (card) => {
        set({ inspectedCard: card });
      },

      setManaFilter: (mana) => {
        // Sticky toggle: clicking already active filter resets to null (All)
        set((state) => ({
          manaFilter: state.manaFilter === mana ? null : mana,
          currentPage: 1,
        }));
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query, currentPage: 1 });
      },

      setPage: (page) => {
        set({ currentPage: Math.max(1, page) });
      },

      showToast: (message) => {
        set({ toastMessage: message });
        useAppStore.getState().showToast(message);
        setTimeout(() => {
          if (get().toastMessage === message) {
            set({ toastMessage: null });
          }
        }, 2600);
      },

      getActiveValidDeck: () => {
        const state = get();
        if (state.activeDeckId) {
          const deck = state.decks.find((d) => d.id === state.activeDeckId);
          if (deck && deck.isValid) return deck;
        }
        // Auto-activate single valid deck fallback
        const validDecks = state.decks.filter((d) => d.isValid);
        if (validDecks.length === 1) {
          return validDecks[0];
        }
        return null;
      },
    }),
    {
      name: 'hearthlight.collection.v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        decks: state.decks,
        activeDeckId: state.activeDeckId,
      }),
    }
  )
);
