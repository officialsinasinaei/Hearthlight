import type { CardBehaviorDefinition, CardBehaviorFunction } from './types.ts';
import type { CardDefinition } from '../types.ts';

const behaviorRegistry = new Map<string, CardBehaviorDefinition>();

export function defineCardBehavior(
  cardId: string,
  behavior: CardBehaviorFunction | Omit<CardBehaviorDefinition, 'cardId'>
): void {
  if (typeof behavior === 'function') {
    behaviorRegistry.set(cardId, { cardId, execute: behavior });
  } else {
    behaviorRegistry.set(cardId, { cardId, ...behavior });
  }
}

export function getCardBehavior(cardId: string): CardBehaviorDefinition | undefined {
  return behaviorRegistry.get(cardId);
}

export function hasCardBehavior(cardId: string): boolean {
  return behaviorRegistry.has(cardId);
}

export function getAllRegisteredIds(): string[] {
  return Array.from(behaviorRegistry.keys());
}

export function validateCardRegistry(allCards: CardDefinition[]): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  for (let i = 0; i < allCards.length; i++) {
    const card = allCards[i];
    if (!behaviorRegistry.has(card.id)) {
      missing.push(`[#${i + 1}] ID: ${card.id} - "${card.name}"`);
    }
  }

  if (missing.length > 0) {
    const message = `[EXHAUSTIVENESS FAILURE] Card Behavior Registry is missing behaviors for ${missing.length}/${allCards.length} cards:\n  - ${missing.join('\n  - ')}`;
    throw new Error(message);
  }

  return { valid: true, missing: [] };
}
