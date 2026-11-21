import type {
  CardDefinition,
  CardInstance,
  SavedDeck,
  ActiveSecretInstance,
  PendingChoice,
} from './types.ts';
import { MAGE_CARDS, createStarterMageDeck, hydrateKeywords } from './cards.ts';
import { resolveCardEffect } from './cardEffects.ts';
import { createRng, type Rng } from './rng.ts';
import { getCardBehavior } from './cards/registry.ts';
import { createBehaviorContext } from './cards/primitives.ts';
import './cards/index.ts';

export interface BattleHero {
  id: 'player' | 'opponent';
  name: string;
  title: string;
  portraitUrl: string;
  heroPowerUrl: string;
  heroPowerName: string;
  heroPowerCost: number;
  heroPowerUsed: boolean;
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
  secrets: ActiveSecretInstance[];
}

export interface BattleHistoryEntry {
  id: string;
  type: 'PLAY_CARD' | 'ATTACK' | 'HERO_POWER' | 'FATIGUE' | 'DEATH' | 'TURN';
  ownerId: 'player' | 'opponent';
  sourceName: string;
  sourceCardId?: string;
  targetName?: string;
  amount?: number;
  description: string;
  timestamp: number;
}

export interface BattleState {
  matchId: string;
  phase: 'MULLIGAN' | 'ACTION' | 'GAME_OVER';
  turnNumber: number;
  activePlayer: 'player' | 'opponent';
  playerFirst: boolean;
  player: BattleHero;
  opponent: BattleHero;
  winner: 'player' | 'opponent' | null;
  history: BattleHistoryEntry[];
  turnTimeRemaining: number;
  isRopeBurning: boolean;
  mulliganChoiceConfirmed: boolean;
  mulliganOfferedCardIds: string[];
  seed: number;
  rngState: number;
  pendingChoice: PendingChoice | null;
}

export const THE_COIN_CARD: CardDefinition = {
  id: 'GAME_005',
  name: 'The Coin',
  cost: 0,
  type: 'SPELL',
  rarity: 'COMMON',
  text: 'Gain 1 Mana Crystal this turn only.',
  artEmoji: '🪙',
  artGradient: 'from-amber-400 to-yellow-600',
  keywords: [],
};

let instanceCounter = 0;
export function createCardInstance(
  card: CardDefinition,
  ownerId: 'player' | 'opponent'
): CardInstance {
  instanceCounter++;
  const uniqueId = `${card.id}_${ownerId}_${Date.now()}_${instanceCounter}`;
  const keywords = hydrateKeywords(card.text || '', card.keywords || []);
  const hasTaunt = keywords.includes('TAUNT');
  const hasDivineShield = keywords.includes('DIVINE_SHIELD');
  const hasStealth = keywords.includes('STEALTH');
  const hasRush = keywords.includes('RUSH');
  const hasCharge = keywords.includes('CHARGE');
  const hasWindfury = keywords.includes('WINDFURY');
  const isFrozen = false;

  let spellDamage: number | undefined = undefined;
  if (keywords.includes('SPELL_DAMAGE')) {
    const match = (card.text || '').match(/spell damage \+(\d+)/i);
    spellDamage = match ? parseInt(match[1], 10) : 1;
  }

  return {
    instanceId: uniqueId,
    definitionId: card.id,
    ownerId,
    name: card.name,
    cost: card.cost,
    baseCost: card.cost,
    attack: card.attack ?? 0,
    baseAttack: card.attack ?? 0,
    health: card.health ?? 0,
    maxHealth: card.health ?? 0,
    baseHealth: card.health ?? 0,
    type: card.type,
    rarity: card.rarity,
    tribe: card.tribe,
    text: card.text || '',
    artEmoji: card.artEmoji || '✨',
    artGradient: card.artGradient || 'from-blue-600 to-indigo-900',
    keywords,
    effects: card.effects,
    canAttack: hasCharge,
    attacksPerformedThisTurn: 0,
    isExhausted: !hasCharge,
    hasDivineShield,
    hasTaunt,
    isFrozen,
    hasStealth,
    hasRush,
    hasCharge,
    hasWindfury,
    spellDamage,
  };
}

export function shuffleDeck<T>(array: T[], rng?: Rng): T[] {
  if (rng) {
    return rng.shuffle(array);
  }
  const fallback = createRng();
  return fallback.shuffle(array);
}

export function buildDeckInstances(
  savedDeck: SavedDeck | null | undefined,
  ownerId: 'player' | 'opponent',
  rng?: Rng
): CardInstance[] {
  const cardMap = new Map<string, CardDefinition>();
  for (const c of MAGE_CARDS) {
    cardMap.set(c.id, c);
  }

  const deckToUse = savedDeck && savedDeck.totalCount === 30 ? savedDeck : createStarterMageDeck();
  const instances: CardInstance[] = [];

  for (const [cardId, count] of Object.entries(deckToUse.cards)) {
    const def = cardMap.get(cardId);
    if (def) {
      for (let i = 0; i < count; i++) {
        instances.push(createCardInstance(def, ownerId));
      }
    }
  }

  const activeRng = rng || createRng();

  // Fallback if less than 30 cards
  while (instances.length < 30) {
    const randomCard = activeRng.pick(MAGE_CARDS);
    instances.push(createCardInstance(randomCard, ownerId));
  }

  return shuffleDeck(instances, activeRng);
}

export function initBattleState(options?: {
  playerDeck?: SavedDeck | null;
  opponentDeck?: SavedDeck | null;
  playerFirst?: boolean;
  seed?: number;
}): BattleState {
  const seed = options?.seed !== undefined ? options.seed : (Date.now() | 0);
  const rng = createRng(seed);

  const playerFirst = options?.playerFirst ?? true;
  const playerDeckList = buildDeckInstances(options?.playerDeck, 'player', rng);
  const opponentDeckList = buildDeckInstances(options?.opponentDeck, 'opponent', rng);

  // Player starting hand for mulligan: 3 if 1st, 4 if 2nd
  const playerHandCount = playerFirst ? 3 : 4;
  const playerHand = playerDeckList.splice(0, playerHandCount);

  // Opponent starting hand: 3 if 2nd (since player 1st), 4 if 1st
  const opponentHandCount = playerFirst ? 4 : 3;
  const opponentHand = opponentDeckList.splice(0, opponentHandCount);

  const player: BattleHero = {
    id: 'player',
    name: 'Jaina Proudmoore',
    title: 'Archmage of the Kirin Tor',
    portraitUrl: '/art/HERO_08.jpg',
    heroPowerUrl: '/art/CS2_034.jpg',
    heroPowerName: 'Fireblast',
    heroPowerCost: 2,
    heroPowerUsed: false,
    hp: 30,
    maxHp: 30,
    armor: 0,
    mana: 0,
    maxMana: 0,
    deck: playerDeckList,
    hand: playerHand,
    board: [],
    graveyard: [],
    fatigueCounter: 0,
    secrets: [],
  };

  const opponent: BattleHero = {
    id: 'opponent',
    name: 'Jaina Proudmoore',
    title: 'Archmage (Bot)',
    portraitUrl: '/art/HERO_08.jpg',
    heroPowerUrl: '/art/CS2_034.jpg',
    heroPowerName: 'Fireblast',
    heroPowerCost: 2,
    heroPowerUsed: false,
    hp: 30,
    maxHp: 30,
    armor: 0,
    mana: 0,
    maxMana: 0,
    deck: opponentDeckList,
    hand: opponentHand,
    board: [],
    graveyard: [],
    fatigueCounter: 0,
    secrets: [],
  };

  return {
    matchId: `match_${Date.now()}`,
    phase: 'MULLIGAN',
    turnNumber: 0,
    activePlayer: playerFirst ? 'player' : 'opponent',
    playerFirst,
    player,
    opponent,
    winner: null,
    history: [
      {
        id: `h_${Date.now()}_0`,
        type: 'TURN',
        ownerId: 'player',
        sourceName: 'Match Start',
        description: `Game started! ${playerFirst ? 'You go first.' : 'Opponent goes first.'}`,
        timestamp: Date.now(),
      },
    ],
    turnTimeRemaining: 75,
    isRopeBurning: false,
    mulliganChoiceConfirmed: false,
    mulliganOfferedCardIds: playerHand.map((c) => c.instanceId),
    seed,
    rngState: rng.getState(),
    pendingChoice: null,
  };
}

/**
 * Executes the Mulligan confirmation. Replaces unwanted cards, shuffles them back,
 * gives The Coin to 2nd player, and begins Turn 1.
 */
export function confirmMulligan(state: BattleState, replacedIds: string[]): BattleState {
  if (state.phase !== 'MULLIGAN') return state;

  const playerDeck = [...state.player.deck];
  const currentHand = [...state.player.hand];

  const keptCards: CardInstance[] = [];
  const cardsToShuffleBack: CardInstance[] = [];

  for (const card of currentHand) {
    if (replacedIds.includes(card.instanceId)) {
      cardsToShuffleBack.push(card);
    } else {
      keptCards.push(card);
    }
  }

  // Draw replacement cards from deck
  const newDrawn: CardInstance[] = [];
  for (let i = 0; i < cardsToShuffleBack.length; i++) {
    if (playerDeck.length > 0) {
      newDrawn.push(playerDeck.shift()!);
    }
  }

  // Put replaced cards back and shuffle deterministically
  playerDeck.push(...cardsToShuffleBack);
  const rng = createRng(state.rngState);
  const shuffledDeck = shuffleDeck(playerDeck, rng);

  const finalHand = [...keptCards, ...newDrawn];

  // If player went 2nd, add The Coin to hand
  if (!state.playerFirst) {
    finalHand.push(createCardInstance(THE_COIN_CARD, 'player'));
  }

  // If opponent went 2nd, opponent gets The Coin
  const oppHand = [...state.opponent.hand];
  if (state.playerFirst) {
    oppHand.push(createCardInstance(THE_COIN_CARD, 'opponent'));
  }

  const nextState: BattleState = {
    ...state,
    phase: 'ACTION',
    mulliganChoiceConfirmed: true,
    rngState: rng.getState(),
    player: {
      ...state.player,
      hand: finalHand,
      deck: shuffledDeck,
    },
    opponent: {
      ...state.opponent,
      hand: oppHand,
    },
  };

  // Start Turn 1 for whoever goes first
  return startTurn(nextState, state.playerFirst ? 'player' : 'opponent');
}

/**
 * Starts a player or opponent turn according to standard Hearthstone rules:
 * - Increment max mana by 1 (up to 10)
 * - Refill mana to maxMana
 * - Un-exhaust minions and reset attack counters
 * - Unfreeze characters who couldn't attack last turn
 * - Reset Hero Power usage
 * - Draw a card (with Fatigue and Overdraw rules)
 */
export function startTurn(state: BattleState, activePlayer: 'player' | 'opponent'): BattleState {
  if (state.phase === 'GAME_OVER') return state;

  const isPlayer = activePlayer === 'player';
  const hero = isPlayer ? state.player : state.opponent;

  const newTurnNumber = state.turnNumber + 1;
  const newMaxMana = Math.min(10, hero.maxMana + 1);
  const newMana = newMaxMana;

  // Un-exhaust board minions and handle thawing
  const refreshedBoard = hero.board.map((m) => {
    let isFrozen = m.isFrozen;
    let canAttack = false;
    let isExhausted = false;

    if (isFrozen) {
      // Frozen minion misses attack, thaws at turn start
      isFrozen = false;
      canAttack = false;
      isExhausted = true;
    } else {
      canAttack = m.attack > 0;
      isExhausted = false;
    }

    return {
      ...m,
      isFrozen,
      isExhausted,
      attacksPerformedThisTurn: 0,
      canAttack,
    };
  });

  let deck = [...hero.deck];
  let hand = [...hero.hand];
  let hp = hero.hp;
  let fatigueCounter = hero.fatigueCounter;
  let winner = state.winner;

  const newHistory = [...state.history];
  newHistory.unshift({
    id: `turn_${Date.now()}_${newTurnNumber}`,
    type: 'TURN',
    ownerId: activePlayer,
    sourceName: `${isPlayer ? 'Player' : 'Opponent'} Turn ${newTurnNumber}`,
    description: `Turn ${newTurnNumber} begins. Mana: ${newMana}/${newMaxMana}.`,
    timestamp: Date.now(),
  });

  // Draw card
  if (deck.length > 0) {
    const drawn = deck.shift()!;
    if (hand.length < 10) {
      hand.push(drawn);
      newHistory.unshift({
        id: `draw_${Date.now()}`,
        type: 'PLAY_CARD',
        ownerId: activePlayer,
        sourceName: drawn.name,
        sourceCardId: drawn.definitionId,
        description: `${isPlayer ? 'You drew' : 'Opponent drew'} ${drawn.name}.`,
        timestamp: Date.now(),
      });
    } else {
      // Overdraw! Excess drawn card burned to graveyard
      hero.graveyard.push(drawn);
      newHistory.unshift({
        id: `overdraw_${Date.now()}`,
        type: 'PLAY_CARD',
        ownerId: activePlayer,
        sourceName: 'Overdraw',
        sourceCardId: drawn.definitionId,
        description: `Hand is full! ${drawn.name} was destroyed.`,
        timestamp: Date.now(),
      });
    }
  } else {
    // Fatigue damage
    fatigueCounter += 1;
    hp -= fatigueCounter;
    newHistory.unshift({
      id: `fatigue_${Date.now()}`,
      type: 'FATIGUE',
      ownerId: activePlayer,
      sourceName: 'Fatigue',
      amount: fatigueCounter,
      description: `${isPlayer ? 'You took' : 'Opponent took'} ${fatigueCounter} Fatigue damage from an empty deck!`,
      timestamp: Date.now(),
    });

    if (hp <= 0) {
      hp = 0;
      winner = isPlayer ? 'opponent' : 'player';
    }
  }

  const updatedHero: BattleHero = {
    ...hero,
    maxMana: newMaxMana,
    mana: newMana,
    board: refreshedBoard,
    deck,
    hand,
    hp,
    fatigueCounter,
    heroPowerUsed: false,
  };

  return {
    ...state,
    turnNumber: newTurnNumber,
    activePlayer,
    turnTimeRemaining: 75,
    isRopeBurning: false,
    winner,
    phase: winner ? 'GAME_OVER' : 'ACTION',
    player: isPlayer ? updatedHero : state.player,
    opponent: isPlayer ? state.opponent : updatedHero,
    history: newHistory,
  };
}

export function endTurn(state: BattleState): BattleState {
  if (state.phase !== 'ACTION') return state;
  const currentSide = state.activePlayer;
  const enemySide = currentSide === 'player' ? 'opponent' : 'player';
  const enemyHero = state[enemySide];
  const activeHero = state[currentSide];

  // Evaluate Flames of Infinity secret (When your enemy's turn ends, deal INFINITE damage to their highest Health minion)
  const flamesIdx = enemyHero.secrets.findIndex(
    (s) =>
      (s.name || '').toLowerCase().includes('flames of infinity') ||
      (s.text || '').toLowerCase().includes("enemy's turn ends")
  );

  let updatedState = state;
  if (flamesIdx !== -1 && activeHero.board.length > 0) {
    const updatedEnemySecrets = [...enemyHero.secrets];
    const [consumedSecret] = updatedEnemySecrets.splice(flamesIdx, 1);

    let highestIdx = 0;
    let highestHp = -Infinity;
    for (let i = 0; i < activeHero.board.length; i++) {
      if (activeHero.board[i].health > highestHp) {
        highestHp = activeHero.board[i].health;
        highestIdx = i;
      }
    }
    const victim = activeHero.board[highestIdx];
    const updatedActiveBoard = activeHero.board.filter((_, idx) => idx !== highestIdx);

    const history: BattleHistoryEntry[] = [
      {
        id: `sec_flames_${Date.now()}`,
        type: 'PLAY_CARD',
        ownerId: enemyHero.id,
        sourceName: consumedSecret.name,
        description: `${enemyHero.name}'s Secret Flames of Infinity triggered! Dealt infinite damage to ${victim.name}.`,
        timestamp: Date.now(),
      },
      ...state.history,
    ];

    updatedState = {
      ...state,
      [enemySide]: {
        ...enemyHero,
        secrets: updatedEnemySecrets,
      },
      [currentSide]: {
        ...activeHero,
        board: updatedActiveBoard,
      },
      history,
    };
  }

  const nextPlayer = state.activePlayer === 'player' ? 'opponent' : 'player';
  return startTurn(updatedState, nextPlayer);
}

/**
 * Calculates current Spell Damage bonus on the board for a player.
 * Supports passing either BattleState (with optional playerSide) or CardInstance[] board.
 */
export function getSpellDamageBonus(
  targetOrBoard: BattleState | CardInstance[],
  playerSide?: 'player' | 'opponent'
): number {
  let board: CardInstance[];
  if (Array.isArray(targetOrBoard)) {
    board = targetOrBoard;
  } else {
    const side = playerSide || targetOrBoard.activePlayer;
    board = side === 'player' ? targetOrBoard.player.board : targetOrBoard.opponent.board;
  }

  let bonus = 0;
  for (const m of board) {
    if (m.spellDamage !== undefined && m.spellDamage > 0) {
      bonus += m.spellDamage;
    } else {
      const match = (m.text || '').toLowerCase().match(/spell damage \+(\d+)/);
      if (match) {
        bonus += parseInt(match[1], 10);
      }
    }
  }
  return bonus;
}

/**
 * Dynamically calculates card mana cost based on active board/hand auras
 * (e.g. Sorcerer's Apprentice reducing spell cost by 1, min 0).
 */
export function getEffectiveCardCost(
  state: BattleState,
  playerSide: 'player' | 'opponent',
  card: CardInstance
): number {
  let cost = card.cost;
  const board = playerSide === 'player' ? state.player.board : state.opponent.board;

  for (const minion of board) {
    const textLower = (minion.text || '').toLowerCase();
    const nameLower = (minion.name || '').toLowerCase();

    // Sorcerer's Apprentice / spell cost reduction aura
    if (card.type === 'SPELL') {
      if (nameLower.includes("sorcerer's apprentice") || /your spells cost \(?(\d+)\)? less/i.test(textLower)) {
        const match = textLower.match(/your spells cost \(?(\d+)\)? less/i);
        const reduction = match ? parseInt(match[1], 10) : 1;
        cost -= reduction;
      }
    }
  }

  return Math.max(0, cost);
}

/**
 * Valid target resolution for attackers.
 * Enforces Taunt, and excludes Stealthed enemy minions.
 */
export function getValidTargetsForAttacker(state: BattleState, attackerId: string): string[] {
  const isPlayer = state.activePlayer === 'player';
  const attacker = (isPlayer ? state.player.board : state.opponent.board).find(
    (m) => m.instanceId === attackerId
  );

  if (!attacker || attacker.isExhausted || attacker.attack <= 0 || attacker.isFrozen) return [];

  const opponent = isPlayer ? state.opponent : state.player;
  const targetableMinions = opponent.board.filter((m) => !m.hasStealth && m.health > 0);
  const tauntMinions = targetableMinions.filter((m) => m.hasTaunt);

  // If opponent has Taunt minions, attacker MUST target one of the Taunt minions!
  if (tauntMinions.length > 0) {
    return tauntMinions.map((m) => m.instanceId);
  }

  // Otherwise, can target any non-stealthed enemy minion or opponent hero
  return [...targetableMinions.map((m) => m.instanceId), opponent.id];
}

export function getValidTargetsForHeroPower(state: BattleState): string[] {
  // Fireblast can target any character: both heroes, all minions
  const targets: string[] = ['player', 'opponent'];
  state.player.board.forEach((m) => targets.push(m.instanceId));
  state.opponent.board.forEach((m) => targets.push(m.instanceId));
  return targets;
}

export function getValidTargetsForSpell(state: BattleState, cardInstanceId: string): string[] {
  const isPlayer = state.activePlayer === 'player';
  const hand = isPlayer ? state.player.hand : state.opponent.hand;
  const card = hand.find((c) => c.instanceId === cardInstanceId);
  if (!card) return [];

  const behaviorDef = getCardBehavior(card.definitionId);
  const effect = resolveCardEffect(card);

  const needsTarget = behaviorDef?.needsTarget ?? effect.needsTarget;
  if (!needsTarget) return [];

  const targetType = behaviorDef?.targetType ?? effect.targetType;

  const targets: string[] = [];
  const opponent = isPlayer ? state.opponent : state.player;
  const player = isPlayer ? state.player : state.opponent;

  // Stealthed enemy minions cannot be targeted by enemy spells
  const targetableEnemyMinions = opponent.board.filter((m) => !m.hasStealth);

  if (targetType === 'ANY' || targetType === 'ENEMY_CHAR') {
    targets.push(opponent.id);
    targetableEnemyMinions.forEach((m) => targets.push(m.instanceId));
    if (targetType === 'ANY') {
      targets.push(player.id);
      player.board.forEach((m) => targets.push(m.instanceId));
    }
  } else if (targetType === 'ENEMY_MINION') {
    targetableEnemyMinions.forEach((m) => targets.push(m.instanceId));
  } else if (targetType === 'ANY_MINION') {
    player.board.forEach((m) => targets.push(m.instanceId));
    targetableEnemyMinions.forEach((m) => targets.push(m.instanceId));
  } else if (targetType === 'FRIENDLY_MINION') {
    player.board.forEach((m) => targets.push(m.instanceId));
  } else if (targetType === 'FRIENDLY_CHAR') {
    targets.push(player.id);
    player.board.forEach((m) => targets.push(m.instanceId));
  }

  return targets;
}

/**
 * Triggers a Deathrattle hook for a minion that died.
 */
function triggerDeathrattle(
  state: BattleState,
  minion: CardInstance,
  ownerId: 'player' | 'opponent'
): BattleState {
  const isPlayer = ownerId === 'player';
  const friendly = isPlayer ? state.player : state.opponent;
  const textLower = (minion.text || '').toLowerCase();

  // Violet Spellwing: Add an 'Arcane Missiles' spell to hand
  if (textLower.includes('arcane missiles')) {
    const missilesDef = MAGE_CARDS.find((c) => c.name.toLowerCase() === 'arcane missiles') || {
      id: 'EX1_277',
      name: 'Arcane Missiles',
      cost: 1,
      type: 'SPELL' as const,
      rarity: 'COMMON' as const,
      text: 'Deal 3 damage randomly split among all enemies.',
      artEmoji: '✨',
      artGradient: 'from-purple-600 to-indigo-900',
      keywords: [],
    };

    if (friendly.hand.length < 10) {
      const cardInst = createCardInstance(missilesDef, ownerId);
      const updatedHero = {
        ...friendly,
        hand: [...friendly.hand, cardInst],
      };
      return {
        ...state,
        player: isPlayer ? updatedHero : state.player,
        opponent: isPlayer ? state.opponent : updatedHero,
        history: [
          {
            id: `dr_${Date.now()}`,
            type: 'PLAY_CARD',
            ownerId,
            sourceName: minion.name,
            description: `Deathrattle: Added Arcane Missiles to ${friendly.name}'s hand.`,
            timestamp: Date.now(),
          },
          ...state.history,
        ],
      };
    }
  }

  // Sheep Mask: Deal 2 damage to all minions
  if (textLower.includes('deal 2 damage to all minions')) {
    const hitAllMinions = (board: CardInstance[]): CardInstance[] =>
      board.map((m) => {
        if (m.hasDivineShield) {
          return { ...m, hasDivineShield: false };
        }
        return { ...m, health: m.health - 2 };
      });

    return {
      ...state,
      player: {
        ...state.player,
        board: hitAllMinions(state.player.board),
      },
      opponent: {
        ...state.opponent,
        board: hitAllMinions(state.opponent.board),
      },
      history: [
        {
          id: `dr_${Date.now()}`,
          type: 'PLAY_CARD',
          ownerId,
          sourceName: minion.name,
          description: `Deathrattle: Dealt 2 damage to all minions!`,
          timestamp: Date.now(),
        },
        ...state.history,
      ],
    };
  }

  // Conjured Bookkeeper: Draw a spell
  if (textLower.includes('draw a spell')) {
    const deck = [...friendly.deck];
    const spellIdx = deck.findIndex((c) => c.type === 'SPELL');
    if (spellIdx !== -1 && friendly.hand.length < 10) {
      const [drawnSpell] = deck.splice(spellIdx, 1);
      const updatedHero = {
        ...friendly,
        deck,
        hand: [...friendly.hand, drawnSpell],
      };
      return {
        ...state,
        player: isPlayer ? updatedHero : state.player,
        opponent: isPlayer ? state.opponent : updatedHero,
        history: [
          {
            id: `dr_${Date.now()}`,
            type: 'PLAY_CARD',
            ownerId,
            sourceName: minion.name,
            description: `Deathrattle: Drew a spell (${drawnSpell.name}).`,
            timestamp: Date.now(),
          },
          ...state.history,
        ],
      };
    }
  }

  // Ley Walker: Get a random Leyline
  if (textLower.includes('get a random leyline')) {
    const leylineCard = MAGE_CARDS.find((c) => c.name.toLowerCase().includes('leyline')) || MAGE_CARDS[0];
    if (friendly.hand.length < 10) {
      const cardInst = createCardInstance(leylineCard, ownerId);
      const updatedHero = {
        ...friendly,
        hand: [...friendly.hand, cardInst],
      };
      return {
        ...state,
        player: isPlayer ? updatedHero : state.player,
        opponent: isPlayer ? state.opponent : updatedHero,
      };
    }
  }

  return state;
}

/**
 * Iterative FIFO Death Resolution Phase:
 * Collects mortally wounded minions (health <= 0), removes them from board to graveyard,
 * and executes Deathrattles in FIFO play order. Repeats iteratively until no dead minions remain.
 */
export function resolveDeaths(state: BattleState): BattleState {
  let curState = { ...state };
  let hadDeaths = true;
  let iterations = 0;
  const MAX_DEATH_ITERATIONS = 20;

  while (hadDeaths && iterations < MAX_DEATH_ITERATIONS) {
    iterations++;
    hadDeaths = false;

    const deadPlayerMinions = curState.player.board.filter((m) => m.health <= 0);
    const deadOpponentMinions = curState.opponent.board.filter((m) => m.health <= 0);

    if (deadPlayerMinions.length === 0 && deadOpponentMinions.length === 0) {
      break;
    }

    hadDeaths = true;

    // FIFO dead minions order
    const deaths: { minion: CardInstance; owner: 'player' | 'opponent' }[] = [];
    deadPlayerMinions.forEach((m) => deaths.push({ minion: m, owner: 'player' }));
    deadOpponentMinions.forEach((m) => deaths.push({ minion: m, owner: 'opponent' }));

    const deadPlayerIds = new Set(deadPlayerMinions.map((m) => m.instanceId));
    const deadOpponentIds = new Set(deadOpponentMinions.map((m) => m.instanceId));

    const deathHistory: BattleHistoryEntry[] = deaths.map(({ minion, owner }) => ({
      id: `death_${Date.now()}_${minion.instanceId}`,
      type: 'DEATH',
      ownerId: owner,
      sourceName: minion.name,
      sourceCardId: minion.definitionId,
      description: `${minion.name} was destroyed.`,
      timestamp: Date.now(),
    }));

    curState = {
      ...curState,
      player: {
        ...curState.player,
        board: curState.player.board.filter((m) => !deadPlayerIds.has(m.instanceId)),
        graveyard: [...curState.player.graveyard, ...deadPlayerMinions],
      },
      opponent: {
        ...curState.opponent,
        board: curState.opponent.board.filter((m) => !deadOpponentIds.has(m.instanceId)),
        graveyard: [...curState.opponent.graveyard, ...deadOpponentMinions],
      },
      history: [...deathHistory, ...curState.history],
    };

    // Execute Deathrattles in FIFO order
    for (const { minion, owner } of deaths) {
      if (minion.keywords.includes('DEATHRATTLE') || (minion.text && minion.text.toLowerCase().includes('deathrattle:'))) {
        curState = triggerDeathrattle(curState, minion, owner);
      }
    }
  }

  // Hero death check
  let winner = curState.winner;
  if (!winner) {
    if (curState.player.hp <= 0 && curState.opponent.hp <= 0) {
      winner = 'opponent';
    } else if (curState.player.hp <= 0) {
      winner = 'opponent';
    } else if (curState.opponent.hp <= 0) {
      winner = 'player';
    }
  }

  return {
    ...curState,
    winner,
    phase: winner ? 'GAME_OVER' : curState.phase,
  };
}

/**
 * Minion combat attack resolution with Event Bus, Secret triggers,
 * and post-interrupt re-validation.
 */
export function attackWithMinion(
  state: BattleState,
  attackerId: string,
  targetId: string
): BattleState {
  if (state.phase !== 'ACTION') return state;
  const isPlayer = state.activePlayer === 'player';
  const friendly = isPlayer ? { ...state.player } : { ...state.opponent };
  const enemy = isPlayer ? { ...state.opponent } : { ...state.player };

  let attacker = friendly.board.find((m) => m.instanceId === attackerId);
  if (!attacker || attacker.isExhausted || attacker.attack <= 0 || attacker.isFrozen) return state;

  const validTargets = getValidTargetsForAttacker(state, attackerId);
  if (!validTargets.includes(targetId)) return state;

  let currentTargetId = targetId;
  const history = [...state.history];
  const defendingSecrets = [...enemy.secrets];
  const remainingSecrets: ActiveSecretInstance[] = [];

  // Evaluate active defending secrets in FIFO order
  for (const secret of defendingSecrets) {
    const secText = (secret.text || '').toLowerCase();
    const secName = (secret.name || '').toLowerCase();

    // 1. Mystic Misdirection: When an enemy minion attacks, transform it into a 1/1 Sheep
    if (secName.includes('mystic misdirection') || secText.includes('transform it into a 1/1 sheep')) {
      attacker = {
        ...attacker,
        name: 'Sheep',
        definitionId: 'sheep_token',
        text: '',
        cost: 1,
        baseCost: 1,
        attack: 1,
        baseAttack: 1,
        health: 1,
        baseHealth: 1,
        maxHealth: 1,
        tribe: 'Beast',
        keywords: [],
        artEmoji: '🐑',
        artGradient: 'from-amber-200 to-yellow-400',
        hasTaunt: false,
        hasDivineShield: false,
        hasStealth: false,
        hasRush: false,
        hasCharge: false,
        hasWindfury: false,
        isFrozen: false,
        spellDamage: undefined,
        isExhausted: false,
        canAttack: true,
      };

      friendly.board = friendly.board.map((m) => (m.instanceId === attackerId ? attacker! : m));

      history.unshift({
        id: `sec_${Date.now()}_${secret.id}`,
        type: 'PLAY_CARD',
        ownerId: enemy.id,
        sourceName: secret.name,
        description: `${enemy.name}'s Secret ${secret.name} triggered! Transformed attacker into a 1/1 Sheep.`,
        timestamp: Date.now(),
      });
      continue;
    }

    // 2. Oasis Ally: When a friendly minion is attacked, summon a 3/6 Water Elemental
    if (
      (secName.includes('oasis ally') || secText.includes('when a friendly minion is attacked')) &&
      currentTargetId !== enemy.id
    ) {
      if (enemy.board.length < 7) {
        const waterElemental: CardInstance = {
          instanceId: `water_elemental_${Date.now()}_${++instanceCounter}`,
          definitionId: 'water_elemental_token',
          ownerId: enemy.id,
          name: 'Water Elemental',
          cost: 4,
          baseCost: 4,
          attack: 3,
          baseAttack: 3,
          health: 6,
          baseHealth: 6,
          maxHealth: 6,
          type: 'MINION',
          rarity: 'COMMON',
          tribe: 'Elemental',
          text: '<b>Freeze</b> any character damaged by this minion.',
          artEmoji: '💧',
          artGradient: 'from-cyan-400 to-blue-600',
          keywords: ['FREEZE'],
          canAttack: false,
          attacksPerformedThisTurn: 0,
          isExhausted: true,
          hasDivineShield: false,
          hasTaunt: false,
          isFrozen: false,
          hasStealth: false,
          hasRush: false,
          hasCharge: false,
          hasWindfury: false,
          spellDamage: undefined,
        };
        enemy.board = [...enemy.board, waterElemental];
        currentTargetId = waterElemental.instanceId;
      }

      history.unshift({
        id: `sec_${Date.now()}_${secret.id}`,
        type: 'PLAY_CARD',
        ownerId: enemy.id,
        sourceName: secret.name,
        description: `${enemy.name}'s Secret ${secret.name} triggered! Summoned a 3/6 Water Elemental and redirected attack to it.`,
        timestamp: Date.now(),
      });
      continue;
    }

    // 3. Ice Barrier: When your hero is attacked, gain 8 Armor
    if (
      (secName.includes('ice barrier') || secText.includes('when your hero is attacked')) &&
      currentTargetId === enemy.id
    ) {
      enemy.armor += 8;

      history.unshift({
        id: `sec_${Date.now()}_${secret.id}`,
        type: 'PLAY_CARD',
        ownerId: enemy.id,
        sourceName: secret.name,
        description: `${enemy.name}'s Secret ${secret.name} triggered! Gained 8 Armor.`,
        timestamp: Date.now(),
      });
      continue;
    }

    // 4. Vaporize: When a minion attacks your hero, destroy it
    if (
      (secName.includes('vaporize') || (secText.includes('attacks your hero') && secText.includes('destroy'))) &&
      currentTargetId === enemy.id
    ) {
      attacker.health = 0;
      friendly.board = friendly.board.map((m) => (m.instanceId === attackerId ? attacker! : m));

      history.unshift({
        id: `sec_${Date.now()}_${secret.id}`,
        type: 'PLAY_CARD',
        ownerId: enemy.id,
        sourceName: secret.name,
        description: `${enemy.name}'s Secret ${secret.name} triggered! Destroyed the attacking minion.`,
        timestamp: Date.now(),
      });
      continue;
    }

    remainingSecrets.push(secret);
  }

  enemy.secrets = remainingSecrets;

  // Post-interrupt re-validation: abort cleanly if attacker is destroyed, frozen, or attack <= 0
  if (attacker.health <= 0 || attacker.isFrozen || attacker.attack <= 0) {
    attacker.isExhausted = true;
    attacker.canAttack = false;
    friendly.board = friendly.board.map((m) => (m.instanceId === attackerId ? attacker! : m));

    const intermediateState: BattleState = {
      ...state,
      player: isPlayer ? friendly : enemy,
      opponent: isPlayer ? enemy : friendly,
      history,
    };
    return resolveDeaths(intermediateState);
  }

  // Validate defender existence
  let targetMinion: CardInstance | undefined;
  if (currentTargetId !== enemy.id) {
    targetMinion = enemy.board.find((m) => m.instanceId === currentTargetId);
    if (!targetMinion || targetMinion.health <= 0) {
      attacker.isExhausted = true;
      attacker.canAttack = false;
      friendly.board = friendly.board.map((m) => (m.instanceId === attackerId ? attacker! : m));

      const intermediateState: BattleState = {
        ...state,
        player: isPlayer ? friendly : enemy,
        opponent: isPlayer ? enemy : friendly,
        history,
      };
      return resolveDeaths(intermediateState);
    }
  }

  // Combat damage execution
  if (currentTargetId === enemy.id) {
    // Attack enemy hero
    let enemyArmor = enemy.armor;
    let enemyHp = enemy.hp;
    let remainingDmg = attacker.attack;

    if (enemyArmor > 0) {
      if (enemyArmor >= remainingDmg) {
        enemyArmor -= remainingDmg;
        remainingDmg = 0;
      } else {
        remainingDmg -= enemyArmor;
        enemyArmor = 0;
      }
    }
    enemyHp -= remainingDmg;

    // Lifesteal
    if (attacker.keywords.includes('LIFESTEAL') && attacker.attack > 0) {
      friendly.hp = Math.min(friendly.maxHp, friendly.hp + attacker.attack);
    }

    history.unshift({
      id: `atk_${Date.now()}`,
      type: 'ATTACK',
      ownerId: state.activePlayer,
      sourceName: attacker.name,
      sourceCardId: attacker.definitionId,
      targetName: enemy.name,
      amount: attacker.attack,
      description: `${attacker.name} attacked ${enemy.name} for ${attacker.attack} damage!`,
      timestamp: Date.now(),
    });

    enemy.hp = Math.max(0, enemyHp);
    enemy.armor = enemyArmor;
  } else if (targetMinion) {
    // Clash with enemy minion
    let targetShield = targetMinion.hasDivineShield;
    let attackerShield = attacker.hasDivineShield;
    let targetHp = targetMinion.health;
    let attackerHp = attacker.health;

    // Attacker deals damage
    if (targetShield) {
      targetShield = false;
    } else {
      targetHp -= attacker.attack;
      if (attacker.keywords.includes('LIFESTEAL') && attacker.attack > 0) {
        friendly.hp = Math.min(friendly.maxHp, friendly.hp + attacker.attack);
      }
      if (attacker.keywords.includes('FREEZE')) {
        targetMinion.isFrozen = true;
      }
    }

    // Defender deals damage back
    if (attackerShield) {
      attackerShield = false;
    } else {
      attackerHp -= targetMinion.attack;
      if (targetMinion.keywords.includes('LIFESTEAL') && targetMinion.attack > 0) {
        enemy.hp = Math.min(enemy.maxHp, enemy.hp + targetMinion.attack);
      }
      if (targetMinion.keywords.includes('FREEZE')) {
        attacker.isFrozen = true;
      }
    }

    history.unshift({
      id: `atk_${Date.now()}`,
      type: 'ATTACK',
      ownerId: state.activePlayer,
      sourceName: attacker.name,
      sourceCardId: attacker.definitionId,
      targetName: targetMinion.name,
      amount: attacker.attack,
      description: `${attacker.name} clashed with ${targetMinion.name}!`,
      timestamp: Date.now(),
    });

    targetMinion = {
      ...targetMinion,
      health: targetHp,
      hasDivineShield: targetShield,
    };

    attacker = {
      ...attacker,
      health: attackerHp,
      hasDivineShield: attackerShield,
    };

    enemy.board = enemy.board.map((m) => (m.instanceId === currentTargetId ? targetMinion! : m));
  }

  // Update attacker swing count & exhaustion
  attacker.attacksPerformedThisTurn = (attacker.attacksPerformedThisTurn || 0) + 1;
  const maxAttacks = attacker.hasWindfury || attacker.keywords.includes('WINDFURY') ? 2 : 1;
  if (attacker.attacksPerformedThisTurn >= maxAttacks) {
    attacker.isExhausted = true;
    attacker.canAttack = false;
  } else {
    attacker.isExhausted = false;
    attacker.canAttack = true;
  }
  attacker.hasStealth = false;

  friendly.board = friendly.board.map((m) => (m.instanceId === attackerId ? attacker! : m));

  const postCombatState: BattleState = {
    ...state,
    player: isPlayer ? friendly : enemy,
    opponent: isPlayer ? enemy : friendly,
    history,
  };

  return resolveDeaths(postCombatState);
}

/**
 * Headless Discover choice resolution:
 * Resolves a pending 3-choice modal or test selection, adds the selected card
 * to the owner's hand (respecting 10-card hand cap), and clears pendingChoice.
 */
export function resolveChoice(state: BattleState, optionIndex: number): BattleState {
  if (!state.pendingChoice) return state;
  const choice = state.pendingChoice;
  if (optionIndex < 0 || optionIndex >= choice.options.length) return state;

  const selected = choice.options[optionIndex];
  const isPlayer = choice.ownerId === 'player';
  const hero = isPlayer ? state.player : state.opponent;

  const cardInstance: CardInstance = 'instanceId' in selected
    ? selected
    : createCardInstance(selected, choice.ownerId);

  const nextHand = [...hero.hand];
  if (nextHand.length < 10) {
    nextHand.push(cardInstance);
  }

  const history: BattleHistoryEntry[] = [
    {
      id: `discover_${Date.now()}`,
      type: 'PLAY_CARD',
      ownerId: choice.ownerId,
      sourceName: hero.name,
      description: `${hero.name} discovered ${cardInstance.name}.`,
      timestamp: Date.now(),
    },
    ...state.history,
  ];

  const nextHero = {
    ...hero,
    hand: nextHand,
  };

  return {
    ...state,
    pendingChoice: null,
    player: isPlayer ? nextHero : state.player,
    opponent: isPlayer ? state.opponent : nextHero,
    history,
  };
}

/**
 * Use Fireblast Hero Power (2 Mana, deal 1 damage to any target)
 */
export function useHeroPower(state: BattleState, targetId: string): BattleState {
  if (state.phase !== 'ACTION') return state;
  const isPlayer = state.activePlayer === 'player';
  const hero = isPlayer ? state.player : state.opponent;

  if (hero.heroPowerUsed || hero.mana < hero.heroPowerCost) return state;

  const validTargets = getValidTargetsForHeroPower(state);
  if (!validTargets.includes(targetId)) return state;

  const nextPlayer = { ...state.player };
  const nextOpponent = { ...state.opponent };
  const damage = 1;
  const history = [...state.history];

  if (targetId === 'player') {
    let pArmor = nextPlayer.armor;
    let pHp = nextPlayer.hp;
    if (pArmor >= damage) {
      pArmor -= damage;
    } else {
      pHp -= damage - pArmor;
      pArmor = 0;
    }
    nextPlayer.armor = pArmor;
    nextPlayer.hp = Math.max(0, pHp);
  } else if (targetId === 'opponent') {
    let oArmor = nextOpponent.armor;
    let oHp = nextOpponent.hp;
    if (oArmor >= damage) {
      oArmor -= damage;
    } else {
      oHp -= damage - oArmor;
      oArmor = 0;
    }
    nextOpponent.armor = oArmor;
    nextOpponent.hp = Math.max(0, oHp);
  } else {
    // Hit minion
    const hitMinion = (board: CardInstance[]): CardInstance[] =>
      board.map((m) => {
        if (m.instanceId !== targetId) return m;
        if (m.hasDivineShield) {
          return { ...m, hasDivineShield: false };
        }
        return { ...m, health: m.health - damage };
      });

    nextPlayer.board = hitMinion(nextPlayer.board);
    nextOpponent.board = hitMinion(nextOpponent.board);
  }

  // Deduct mana and flag hero power as used
  if (isPlayer) {
    nextPlayer.mana -= nextPlayer.heroPowerCost;
    nextPlayer.heroPowerUsed = true;
  } else {
    nextOpponent.mana -= nextOpponent.heroPowerCost;
    nextOpponent.heroPowerUsed = true;
  }

  history.unshift({
    id: `hp_${Date.now()}`,
    type: 'HERO_POWER',
    ownerId: state.activePlayer,
    sourceName: 'Fireblast',
    amount: damage,
    description: `${hero.name} cast Fireblast on target for 1 damage!`,
    timestamp: Date.now(),
  });

  const nextState: BattleState = {
    ...state,
    player: nextPlayer,
    opponent: nextOpponent,
    history,
  };

  return resolveDeaths(nextState);
}

/**
 * Play a card from hand (Minion or Spell).
 * Evaluates mana cost auras, counterspell interrupts, secrets, and board caps.
 */
export function playCard(
  state: BattleState,
  cardInstanceId: string,
  targetId?: string,
  boardIndex?: number
): BattleState {
  if (state.phase !== 'ACTION') return state;
  const isPlayer = state.activePlayer === 'player';
  const hero = isPlayer ? state.player : state.opponent;

  const cardIndex = hero.hand.findIndex((c) => c.instanceId === cardInstanceId);
  if (cardIndex === -1) return state;

  const card = hero.hand[cardIndex];
  const effectiveCost = getEffectiveCardCost(state, isPlayer ? 'player' : 'opponent', card);
  if (hero.mana < effectiveCost) return state;

  const behaviorDef = getCardBehavior(card.definitionId);
  const effect = resolveCardEffect(card);

  const needsTarget = behaviorDef?.needsTarget ?? effect.needsTarget;
  if (needsTarget && !targetId) {
    if (card.type === 'MINION') {
      const validTargets = getValidTargetsForSpell(state, cardInstanceId);
      if (validTargets.length > 0) {
        return state;
      }
    } else {
      return state;
    }
  }

  const nextHand = hero.hand.filter((_, idx) => idx !== cardIndex);
  const nextMana = hero.mana - effectiveCost;
  const nextPlayer = {
    ...state.player,
    board: [...state.player.board],
    hand: [...state.player.hand],
    deck: [...state.player.deck],
    graveyard: [...state.player.graveyard],
    secrets: [...state.player.secrets],
  };
  const nextOpponent = {
    ...state.opponent,
    board: [...state.opponent.board],
    hand: [...state.opponent.hand],
    deck: [...state.opponent.deck],
    graveyard: [...state.opponent.graveyard],
    secrets: [...state.opponent.secrets],
  };
  const history = [...state.history];

  // 1. Secret Card Play
  const isSecretCard = card.type === 'SPELL' && (card.keywords.includes('SECRET') || (card.text || '').toLowerCase().includes('secret:'));
  if (isSecretCard) {
    const activeHero = isPlayer ? nextPlayer : nextOpponent;
    if (activeHero.secrets.length >= 5 || activeHero.secrets.some((s) => s.definitionId === card.definitionId || s.name === card.name)) {
      return state;
    }

    const secretInstance: ActiveSecretInstance = {
      id: `secret_${Date.now()}_${++instanceCounter}`,
      definitionId: card.definitionId,
      name: card.name,
      text: card.text,
      ownerId: isPlayer ? 'player' : 'opponent',
    };

    activeHero.secrets = [...activeHero.secrets, secretInstance];
    activeHero.mana = nextMana;
    activeHero.hand = nextHand;

    history.unshift({
      id: `play_sec_${Date.now()}`,
      type: 'PLAY_CARD',
      ownerId: state.activePlayer,
      sourceName: card.name,
      sourceCardId: card.definitionId,
      description: `${hero.name} cast Secret: ${card.name}!`,
      timestamp: Date.now(),
    });

    return {
      ...state,
      player: nextPlayer,
      opponent: nextOpponent,
      history,
    };
  }

  // 2. Spell Card Play - Check Enemy Counterspell (ON_SPELL_CAST Interrupt)
  if (card.type === 'SPELL') {
    const enemyHero = isPlayer ? nextOpponent : nextPlayer;
    const activeHero = isPlayer ? nextPlayer : nextOpponent;
    activeHero.mana = nextMana;
    activeHero.hand = nextHand;

    const counterIdx = enemyHero.secrets.findIndex(
      (s) => (s.name || '').toLowerCase().includes('counterspell') || (s.text || '').toLowerCase().includes('counter')
    );

    if (counterIdx !== -1) {
      const [consumedSecret] = enemyHero.secrets.splice(counterIdx, 1);
      activeHero.graveyard = [...activeHero.graveyard, card];

      history.unshift({
        id: `counter_${Date.now()}`,
        type: 'PLAY_CARD',
        ownerId: enemyHero.id,
        sourceName: consumedSecret.name,
        description: `${enemyHero.name}'s Secret Counterspell triggered! Countered ${card.name}.`,
        timestamp: Date.now(),
      });

      return {
        ...state,
        player: nextPlayer,
        opponent: nextOpponent,
        history,
      };
    }
  }

  // 3. Minion Card Play
  if (card.type === 'MINION') {
    const board = isPlayer ? nextPlayer.board : nextOpponent.board;
    if (board.length >= 7) return state; // Board full!

    const hasCharge = card.keywords.includes('CHARGE') || !!card.hasCharge;
    const hasRush = card.keywords.includes('RUSH') || !!card.hasRush;

    const newMinion: CardInstance = {
      ...card,
      isExhausted: !hasCharge,
      attacksPerformedThisTurn: 0,
      canAttack: hasCharge,
      hasCharge,
      hasRush,
    };

    const insertIdx = boardIndex !== undefined ? Math.min(board.length, Math.max(0, boardIndex)) : board.length;
    const newBoard = [...board.slice(0, insertIdx), newMinion, ...board.slice(insertIdx)];

    if (isPlayer) {
      nextPlayer.board = newBoard;
      nextPlayer.hand = nextHand;
      nextPlayer.mana = nextMana;
    } else {
      nextOpponent.board = newBoard;
      nextOpponent.hand = nextHand;
      nextOpponent.mana = nextMana;
    }

    history.unshift({
      id: `play_${Date.now()}`,
      type: 'PLAY_CARD',
      ownerId: state.activePlayer,
      sourceName: card.name,
      sourceCardId: card.definitionId,
      description: `${hero.name} summoned ${card.name} (${card.attack}/${card.health}).`,
      timestamp: Date.now(),
    });

    // Evaluate enemy secrets on minion play (Explosive Runes)
    const enemyHeroForMinion = isPlayer ? nextOpponent : nextPlayer;
    const expRunesIdx = enemyHeroForMinion.secrets.findIndex(
      (s) =>
        (s.name || '').toLowerCase().includes('explosive runes') ||
        (s.text || '').toLowerCase().includes('plays a minion, deal 6 damage')
    );

    if (expRunesIdx !== -1) {
      const [consumedSecret] = enemyHeroForMinion.secrets.splice(expRunesIdx, 1);
      const minionHealth = newMinion.health;
      const minionDamage = Math.min(6, minionHealth);
      const heroDamage = 6 - minionDamage;
      newMinion.health -= minionDamage;

      const activeHeroForMinion = isPlayer ? nextPlayer : nextOpponent;
      if (heroDamage > 0) {
        if (activeHeroForMinion.armor >= heroDamage) {
          activeHeroForMinion.armor -= heroDamage;
        } else {
          const excess = heroDamage - activeHeroForMinion.armor;
          activeHeroForMinion.armor = 0;
          activeHeroForMinion.hp = Math.max(0, activeHeroForMinion.hp - excess);
        }
      }

      history.unshift({
        id: `sec_exp_${Date.now()}`,
        type: 'PLAY_CARD',
        ownerId: enemyHeroForMinion.id,
        sourceName: consumedSecret.name,
        description: `${enemyHeroForMinion.name}'s Secret Explosive Runes triggered! Dealt ${minionDamage} damage to ${newMinion.name} and ${heroDamage} to ${activeHeroForMinion.name}.`,
        timestamp: Date.now(),
      });

      if (newMinion.health <= 0) {
        if (isPlayer) {
          nextPlayer.board = nextPlayer.board.filter((m) => m.instanceId !== newMinion.instanceId);
        } else {
          nextOpponent.board = nextOpponent.board.filter((m) => m.instanceId !== newMinion.instanceId);
        }
      }
    }
  }

  const draft: BattleState = {
    ...state,
    player: nextPlayer,
    opponent: nextOpponent,
    history,
  };

  if (behaviorDef) {
    const ctx = createBehaviorContext(
      draft,
      card,
      isPlayer ? 'player' : 'opponent',
      targetId,
      boardIndex
    );
    behaviorDef.execute(ctx);
    draft.rngState = ctx.rng.getState();

    if (card.type === 'SPELL') {
      const activeHero = isPlayer ? draft.player : draft.opponent;
      activeHero.graveyard.push(card);

      history.unshift({
        id: `cast_${Date.now()}`,
        type: 'PLAY_CARD',
        ownerId: state.activePlayer,
        sourceName: card.name,
        sourceCardId: card.definitionId,
        description: `${hero.name} cast ${card.name}!`,
        timestamp: Date.now(),
      });
    }

    return resolveDeaths(draft);
  }

  if (card.type === 'SPELL') {
    // Execute Spell effects
    const spellDmgBonus = getSpellDamageBonus(isPlayer ? nextPlayer.board : nextOpponent.board);

    // Mana Gain (The Coin)
    if (effect.manaGain) {
      if (isPlayer) {
        nextPlayer.mana = Math.min(10, nextPlayer.mana + effect.manaGain);
      } else {
        nextOpponent.mana = Math.min(10, nextOpponent.mana + effect.manaGain);
      }
    }

    // Card Draw
    if (effect.drawCards && effect.drawCards > 0) {
      const activeHero = isPlayer ? nextPlayer : nextOpponent;
      for (let i = 0; i < effect.drawCards; i++) {
        if (activeHero.deck.length > 0) {
          const drawn = activeHero.deck.shift()!;
          if (activeHero.hand.length < 10) {
            activeHero.hand.push(drawn);
          } else {
            activeHero.graveyard.push(drawn);
          }
        }
      }
    }

    // Direct Damage
    if (effect.damage && targetId) {
      const totalDmg = effect.damage + spellDmgBonus;
      if (targetId === 'opponent') {
        let armor = nextOpponent.armor;
        let hp = nextOpponent.hp;
        if (armor >= totalDmg) {
          armor -= totalDmg;
        } else {
          hp -= totalDmg - armor;
          armor = 0;
        }
        nextOpponent.armor = armor;
        nextOpponent.hp = Math.max(0, hp);
      } else if (targetId === 'player') {
        let armor = nextPlayer.armor;
        let hp = nextPlayer.hp;
        if (armor >= totalDmg) {
          armor -= totalDmg;
        } else {
          hp -= totalDmg - armor;
          armor = 0;
        }
        nextPlayer.armor = armor;
        nextPlayer.hp = Math.max(0, hp);
      } else {
        const applySpellToBoard = (board: CardInstance[]) =>
          board.map((m) => {
            if (m.instanceId !== targetId) return m;
            if (m.hasDivineShield) return { ...m, hasDivineShield: false };
            return { ...m, health: m.health - totalDmg };
          });

        nextPlayer.board = applySpellToBoard(nextPlayer.board);
        nextOpponent.board = applySpellToBoard(nextOpponent.board);
      }
    }

    // AoE Damage
    if (effect.aoeDamage) {
      const aoeDmg = effect.aoeDamage.amount + spellDmgBonus;
      const targetSide = isPlayer ? nextOpponent : nextPlayer;
      targetSide.board = targetSide.board.map((m) => {
        if (m.hasDivineShield) return { ...m, hasDivineShield: false };
        return { ...m, health: m.health - aoeDmg };
      });
    }

    // Freeze Target
    if (effect.freeze && targetId) {
      const freezeBoard = (board: CardInstance[]) =>
        board.map((m) => (m.instanceId === targetId ? { ...m, isFrozen: true } : m));
      nextPlayer.board = freezeBoard(nextPlayer.board);
      nextOpponent.board = freezeBoard(nextOpponent.board);
    }

    // Armor Gain
    if (effect.armor) {
      const activeHero = isPlayer ? nextPlayer : nextOpponent;
      activeHero.armor += effect.armor;
    }

    // Put spell into graveyard
    const activeHero = isPlayer ? nextPlayer : nextOpponent;
    activeHero.graveyard.push(card);

    history.unshift({
      id: `cast_${Date.now()}`,
      type: 'PLAY_CARD',
      ownerId: state.activePlayer,
      sourceName: card.name,
      sourceCardId: card.definitionId,
      description: `${hero.name} cast ${card.name}!`,
      timestamp: Date.now(),
    });
  }

  // 4. Discover Effect Initiation
  let pendingChoice = state.pendingChoice;
  let nextRngState = state.rngState;
  if (effect.isDiscover || card.keywords.includes('DISCOVER') || (card.text || '').toLowerCase().includes('discover')) {
    const rng = createRng(state.rngState);
    const pool = MAGE_CARDS.filter((c) => c.id !== card.definitionId);
    const shuffled = rng.shuffle(pool);
    const options = shuffled.slice(0, 3);
    pendingChoice = {
      title: 'Discover a card',
      options,
      sourceCardId: card.definitionId,
      ownerId: isPlayer ? 'player' : 'opponent',
    };
    nextRngState = rng.getState();
  }

  const resultingState: BattleState = {
    ...state,
    player: nextPlayer,
    opponent: nextOpponent,
    pendingChoice,
    rngState: nextRngState,
    history,
  };

  return resolveDeaths(resultingState);
}

export function concede(state: BattleState, playerId: 'player' | 'opponent'): BattleState {
  const winner = playerId === 'player' ? 'opponent' : 'player';
  return {
    ...state,
    winner,
    phase: 'GAME_OVER',
    history: [
      {
        id: `concede_${Date.now()}`,
        type: 'TURN',
        ownerId: playerId,
        sourceName: 'Concede',
        description: `${playerId === 'player' ? 'Player' : 'Opponent'} conceded the match.`,
        timestamp: Date.now(),
      },
      ...state.history,
    ],
  };
}
