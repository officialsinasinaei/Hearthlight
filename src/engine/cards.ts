import { CardDefinition, SavedDeck } from './types';
import rawMageCards from './mage-cards.json';

export const MAGE_CARDS: CardDefinition[] = rawMageCards as CardDefinition[];

export function getLocalCardArt(id: string): string {
  return `/art/cards/${id}.png`;
}

export const HERO_ASSETS = {
  JAINA_PORTRAIT: '/art/HERO_08.jpg',
  FIREBLAST_HERO_POWER: '/art/CS2_034.jpg',
} as const;

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

  const cardMap = new Map<string, CardDefinition>();
  for (const c of allCards) {
    cardMap.set(c.id, c);
  }

  // Canonical Mage Mana Curve targets for a standard 30-card deck:
  // 1-cost: 4 cards
  // 2-cost: 6 cards
  // 3-cost: 6 cards
  // 4-cost: 5 cards
  // 5-cost: 4 cards
  // 6-cost: 3 cards
  // 7+ cost: 2 cards
  // Total: 4 + 6 + 6 + 5 + 4 + 3 + 2 = 30 cards
  const targetCurve: Record<number, number> = {
    1: 4,
    2: 6,
    3: 6,
    4: 5,
    5: 4,
    6: 3,
    7: 2,
  };

  const getBucket = (cost: number) => Math.min(Math.max(1, cost), 7);

  // Track counts per mana bucket
  const currentBucketCounts: Record<number, number> = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0
  };

  for (const [cardId, count] of Object.entries(result)) {
    const card = cardMap.get(cardId);
    if (card) {
      const b = getBucket(card.cost);
      currentBucketCounts[b] = (currentBucketCounts[b] || 0) + count;
    }
  }

  const addCard = (card: CardDefinition, qty = 1): number => {
    if (currentTotal >= 30) return 0;
    const maxCopies = card.rarity === 'LEGENDARY' ? 1 : 2;
    const existing = result[card.id] || 0;
    const allowed = Math.min(maxCopies - existing, 30 - currentTotal, qty);
    if (allowed > 0) {
      result[card.id] = existing + allowed;
      currentTotal += allowed;
      const b = getBucket(card.cost);
      currentBucketCounts[b] = (currentBucketCounts[b] || 0) + allowed;
      return allowed;
    }
    return 0;
  };

  // Step 1: Complete 2-of pairs for non-legendary cards already selected by player if bucket isn't full
  for (const [cardId, count] of Object.entries(result)) {
    if (currentTotal >= 30) break;
    const card = cardMap.get(cardId);
    if (card && card.rarity !== 'LEGENDARY' && count === 1) {
      const b = getBucket(card.cost);
      if (currentBucketCounts[b] < (targetCurve[b] || 4) + 1) {
        addCard(card, 1);
      }
    }
  }

  // Step 2: Score Mage cards by versatility and synergy (spells, card draw, spell damage, board control)
  const scoreCard = (card: CardDefinition): number => {
    let score = 10;
    if (card.type === 'SPELL') score += 4;
    if (card.rarity === 'COMMON' || card.rarity === 'RARE') score += 2;
    const textLower = (card.text || '').toLowerCase();
    if (textLower.includes('draw')) score += 3;
    if (textLower.includes('spell damage')) score += 3;
    if (textLower.includes('freeze')) score += 2;
    if (textLower.includes('taunt')) score += 2;
    if (textLower.includes('deal')) score += 2;
    return score;
  };

  // Group candidate cards by mana bucket and sort by score descending
  const candidatesByBucket: Record<number, CardDefinition[]> = {
    1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []
  };

  for (const card of allCards) {
    const b = getBucket(card.cost);
    candidatesByBucket[b].push(card);
  }

  for (const b of [1, 2, 3, 4, 5, 6, 7]) {
    candidatesByBucket[b].sort((a, b) => scoreCard(b) - scoreCard(a));
  }

  // Step 3: Iteratively fill highest-deficit mana buckets to shape the curve
  while (currentTotal < 30) {
    let maxDeficit = -999;
    let chosenBucket = 1;

    for (const b of [1, 2, 3, 4, 5, 6, 7]) {
      const deficit = targetCurve[b] - (currentBucketCounts[b] || 0);
      if (deficit > maxDeficit) {
        const hasAvailable = candidatesByBucket[b].some((card) => {
          const maxCopies = card.rarity === 'LEGENDARY' ? 1 : 2;
          return (result[card.id] || 0) < maxCopies;
        });
        if (hasAvailable) {
          maxDeficit = deficit;
          chosenBucket = b;
        }
      }
    }

    let added = false;
    for (const card of candidatesByBucket[chosenBucket]) {
      const maxCopies = card.rarity === 'LEGENDARY' ? 1 : 2;
      const existing = result[card.id] || 0;
      if (existing < maxCopies) {
        const addedCount = addCard(card, Math.min(2 - existing, 30 - currentTotal));
        if (addedCount > 0) {
          added = true;
          break;
        }
      }
    }

    // Fallback if the chosen bucket has no more legal cards: scan all pool
    if (!added) {
      for (const card of allCards) {
        if (currentTotal >= 30) break;
        const maxCopies = card.rarity === 'LEGENDARY' ? 1 : 2;
        const existing = result[card.id] || 0;
        if (existing < maxCopies) {
          addCard(card, 1);
          added = true;
          break;
        }
      }
      if (!added) break;
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
