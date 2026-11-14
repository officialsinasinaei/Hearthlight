import { CardDefinition, SavedDeck } from './types';
import rawMageCards from './mage-cards.json';

export const MAGE_CARDS: CardDefinition[] = rawMageCards as CardDefinition[];

// Canonical Starter Card Pool (backward compatibility)
export const CARD_POOL: CardDefinition[] = MAGE_CARDS.slice(0, 12);

/**
 * Smart algorithm to complete an incomplete deck to 30 cards
 * with a balanced mana curve while respecting copy limits.
 */
export function completeDeckSmart(
  currentCards: Record<string, number>,
  allCards: CardDefinition[] = MAGE_CARDS
): Record<string, number> {
  const result: Record<string, number> = { ...currentCards };
  let currentTotal = Object.values(result).reduce((sum, count) => sum + count, 0);

  if (currentTotal >= 30) return result;

  // Target curve quotas for a standard Mage deck (out of 30 cards):
  // 1-2 mana: ~10 cards
  // 3-4 mana: ~10 cards
  // 5-6 mana: ~6 cards
  // 7+ mana: ~4 cards
  const sortedCandidates = [...allCards].sort((a, b) => {
    // Prefer spells & versatile minions
    const aWeight = (a.type === 'SPELL' ? 2 : 1) + (a.rarity === 'COMMON' || a.rarity === 'RARE' ? 1 : 0);
    const bWeight = (b.type === 'SPELL' ? 2 : 1) + (b.rarity === 'COMMON' || b.rarity === 'RARE' ? 1 : 0);
    return bWeight - aWeight || a.cost - b.cost;
  });

  for (const card of sortedCandidates) {
    if (currentTotal >= 30) break;
    const maxCopies = card.rarity === 'LEGENDARY' ? 1 : 2;
    const existing = result[card.id] || 0;
    const canAdd = Math.min(maxCopies - existing, 30 - currentTotal);

    if (canAdd > 0) {
      result[card.id] = existing + canAdd;
      currentTotal += canAdd;
    }
  }

  return result;
}

/**
 * Constructs the default starter "Classic Mage" deck (30/30 valid cards).
 */
export function createStarterMageDeck(): SavedDeck {
  const starterCards = completeDeckSmart({}, MAGE_CARDS);
  return {
    id: 'starter-mage-deck',
    name: 'Classic Mage',
    heroClass: 'MAGE',
    heroId: 'jaina',
    cards: starterCards,
    totalCount: 30,
    isValid: true,
    updatedAt: Date.now(),
  };
}
