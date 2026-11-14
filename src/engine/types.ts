export type CardRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
export type CardType = 'MINION' | 'SPELL' | 'WEAPON' | 'HERO' | 'LOCATION';
export type Keyword = 'TAUNT' | 'DIVINE_SHIELD' | 'RUSH' | 'WINDFURY' | 'LIFESTEAL';

export type EffectType =
  | 'DEAL_DAMAGE'
  | 'RESTORE_HEALTH'
  | 'DRAW_CARDS'
  | 'BUFF_ALL_FRIENDLY'
  | 'SUMMON_TOKEN';

export interface CardEffect {
  trigger: 'BATTLECRY' | 'SPELL' | 'DEATHRATTLE';
  type: EffectType;
  amount: number;
  needsTarget?: boolean;
  targetFilter?: 'ANY' | 'ENEMY_ONLY' | 'FRIENDLY_MINION';
}

export interface CardDefinition {
  id: string;
  slug?: string;
  name: string;
  cost: number;
  attack?: number;
  health?: number;
  durability?: number;
  type: CardType;
  rarity: CardRarity;
  tribe?: string;
  cardClass?: string;
  text: string;
  flavorText?: string;
  imageUrl?: string;
  artEmoji: string;
  artGradient: string;
  keywords: Keyword[];
  effects?: CardEffect[];
}

export interface SavedDeck {
  id: string;
  name: string;
  heroClass: 'MAGE';
  heroId: 'jaina';
  cards: Record<string, number>; // cardId -> quantity (max 2, or 1 for legendary)
  totalCount: number; // target 30
  isValid: boolean; // totalCount === 30
  updatedAt: number;
}

export interface CardInstance {
  instanceId: string;
  definitionId: string;
  ownerId: 'player' | 'opponent';
  name: string;
  cost: number;
  baseCost: number;
  attack: number;
  baseAttack: number;
  health: number;
  maxHealth: number;
  baseHealth: number;
  type: CardType;
  rarity: CardRarity;
  tribe?: string;
  text: string;
  artEmoji: string;
  artGradient: string;
  keywords: Keyword[];
  effects?: CardEffect[];
  // Live board state
  canAttack: boolean;
  attacksPerformedThisTurn: number;
  isExhausted: boolean;
  hasDivineShield: boolean;
  hasTaunt: boolean;
}

export interface HeroState {
  id: 'player' | 'opponent';
  name: string;
  title: string;
  avatarEmoji: string;
  hp: number;
  maxHp: number;
  armor: number;
  mana: number;
  maxMana: number;
  deck: CardInstance[];
  hand: CardInstance[];
  board: CardInstance[];
  graveyard: CardInstance[];
  fatigueCounter: number;
}

export type GameEvent =
  | { type: 'CARD_DRAWN'; playerId: 'player' | 'opponent'; card: CardInstance }
  | { type: 'CARD_PLAYED'; playerId: 'player' | 'opponent'; card: CardInstance; targetId?: string }
  | { type: 'MINION_SUMMONED'; playerId: 'player' | 'opponent'; card: CardInstance }
  | { type: 'ATTACK_DECLARED'; attackerId: string; targetId: string }
  | { type: 'DAMAGE_DEALT'; targetId: string; amount: number; blockedByShield?: boolean }
  | { type: 'HEALTH_RESTORED'; targetId: string; amount: number }
  | { type: 'MINION_DIED'; instanceId: string; ownerId: 'player' | 'opponent' }
  | { type: 'TURN_STARTED'; activePlayer: 'player' | 'opponent'; turnNumber: number }
  | { type: 'GAME_OVER'; winner: 'player' | 'opponent' };

export interface GameState {
  turnNumber: number;
  activePlayer: 'player' | 'opponent';
  player: HeroState;
  opponent: HeroState;
  winner: 'player' | 'opponent' | null;
}

export type GameAction =
  | { type: 'PLAY_CARD'; cardInstanceId: string; targetId?: string; boardIndex?: number }
  | { type: 'ATTACK'; attackerId: string; targetId: string }
  | { type: 'END_TURN' };
