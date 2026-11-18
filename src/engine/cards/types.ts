import type { CardDefinition, CardInstance, Keyword } from '../types.ts';
import type { BattleState } from '../battleEngine.ts';
import type { Rng } from '../rng.ts';

export type TargetType =
  | 'ANY'
  | 'ENEMY_CHAR'
  | 'ENEMY_MINION'
  | 'ANY_MINION'
  | 'FRIENDLY_MINION'
  | 'FRIENDLY_CHAR'
  | 'NONE';

export interface BehaviorContext {
  /** The card instance being played or triggering */
  readonly card: CardInstance;
  /** Active player playing the card ('player' | 'opponent') */
  readonly ownerId: 'player' | 'opponent';
  /** Opponent player id */
  readonly opponentId: 'player' | 'opponent';
  /** Target selected at play time */
  readonly targetId?: string;
  /** Target board index if minion was played */
  readonly boardIndex?: number;
  /** Authoritative seeded PRNG instance */
  readonly rng: Rng;
  /** Mutable reference to current draft state */
  readonly state: BattleState;
  /** Dynamic Spell Damage bonus applicable to this cast */
  readonly spellDamageBonus: number;

  /** Deal damage to hero or minion. Consumes Divine Shield, respects Armor before Hero HP.
   * Scales with spellDamageBonus if source card is a SPELL. */
  dealDamage(targetId: string, amount: number): void;

  /** Deal 1-damage missiles randomly distributed among enemies or enemy minions.
   * Number of missiles scales with spellDamageBonus if source is a SPELL. */
  dealSplitDamage(totalDamage: number, targetType: 'ENEMIES' | 'ENEMY_MINIONS'): void;

  /** Deal AoE damage to multiple targets. Scales with spellDamageBonus if SPELL. */
  dealAoeDamage(amount: number, targetType: 'ENEMY_MINIONS' | 'ALL_MINIONS' | 'ALL_CHARACTERS'): void;

  /** Freeze a minion or hero character. */
  freeze(targetId: string): void;

  /** Draw cards from deck. Enforces fatigue on empty deck and 10-card hand cap overdraw. */
  drawCards(count: number): void;

  /** Summon token(s) by ID, instance, or definition onto friendly board (capped at 7 minions).
   * Automatically doubles count if Khadgar is on friendly board. */
  summonToken(tokenIdOrDef: string | CardDefinition | CardInstance, count?: number, options?: { atIndex?: number }): void;

  /** Add a card or token definition to friendly hand (capped at 10 cards). */
  addCardToHand(cardOrToken: string | CardDefinition | CardInstance, options?: { costModifier?: number }): void;

  /** Transform a target minion in-place into another minion/token. */
  transformMinion(targetId: string, intoTokenIdOrDef: string | CardDefinition | CardInstance): void;

  /** Add armor to friendly hero. */
  gainArmor(amount: number): void;

  /** Modify minion attack and health (+attackBuff/+healthBuff). */
  buffMinion(targetId: string, attackBuff: number, healthBuff: number, options?: { grantKeywords?: Keyword[] }): void;

  /** Populate state.pendingChoice with discover options. */
  discover(options: CardDefinition[], onSelect?: (selected: CardDefinition) => void): void;

  /** Register an active secret for the friendly hero (capped at 5, unique definition). */
  registerSecret(secretCard: CardDefinition | CardInstance | string): void;
}

export type CardBehaviorFunction = (ctx: BehaviorContext) => void;

export interface CardBehaviorDefinition {
  cardId: string;
  needsTarget?: boolean;
  targetType?: TargetType;
  execute: CardBehaviorFunction;
}
