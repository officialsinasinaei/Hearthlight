import type { CardDefinition, CardInstance, SavedDeck, Keyword } from './types.ts';
import { MAGE_CARDS, createStarterMageDeck } from './cards.ts';
import { resolveCardEffect } from './cardEffects.ts';

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
  secrets: Array<{ id: string; name: string; text: string }>;
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
  const keywords = card.keywords || [];
  const hasTaunt = keywords.includes('TAUNT');
  const hasDivineShield = keywords.includes('DIVINE_SHIELD');

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
    canAttack: false,
    attacksPerformedThisTurn: 0,
    isExhausted: true,
    hasDivineShield,
    hasTaunt,
  };
}

export function shuffleDeck<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function buildDeckInstances(
  savedDeck: SavedDeck | null | undefined,
  ownerId: 'player' | 'opponent'
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

  // Fallback if less than 30 cards
  while (instances.length < 30) {
    const randomCard = MAGE_CARDS[Math.floor(Math.random() * MAGE_CARDS.length)];
    instances.push(createCardInstance(randomCard, ownerId));
  }

  return shuffleDeck(instances);
}

export function initBattleState(options?: {
  playerDeck?: SavedDeck | null;
  opponentDeck?: SavedDeck | null;
  playerFirst?: boolean;
}): BattleState {
  const playerFirst = options?.playerFirst ?? true;
  const playerDeckList = buildDeckInstances(options?.playerDeck, 'player');
  const opponentDeckList = buildDeckInstances(options?.opponentDeck, 'opponent');

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

  // Put replaced cards back and shuffle
  playerDeck.push(...cardsToShuffleBack);
  const shuffledDeck = shuffleDeck(playerDeck);

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
  const newTurnNumber = isPlayer ? state.turnNumber + 1 : state.turnNumber;

  const newMaxMana = Math.min(10, hero.maxMana + 1);
  const newMana = newMaxMana;

  // Un-exhaust board minions
  const refreshedBoard = hero.board.map((m) => ({
    ...m,
    isExhausted: false,
    attacksPerformedThisTurn: 0,
    canAttack: (m.attack > 0) && !m.keywords.includes('RUSH' as Keyword), // normal attack ready
  }));

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
        sourceName: 'Draw Card',
        sourceCardId: drawn.definitionId,
        description: `${isPlayer ? 'You drew' : 'Opponent drew'} ${drawn.name}.`,
        timestamp: Date.now(),
      });
    } else {
      // Overdraw!
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
  const nextPlayer = state.activePlayer === 'player' ? 'opponent' : 'player';
  return startTurn(state, nextPlayer);
}

/**
 * Calculates current Spell Damage bonus on the board for a player
 */
export function getSpellDamageBonus(board: CardInstance[]): number {
  let bonus = 0;
  for (const m of board) {
    const textLower = m.text.toLowerCase();
    const match = textLower.match(/spell damage \+(\d+)/);
    if (match) {
      bonus += parseInt(match[1], 10);
    }
  }
  return bonus;
}

/**
 * Valid target resolution
 */
export function getValidTargetsForAttacker(state: BattleState, attackerId: string): string[] {
  const isPlayer = state.activePlayer === 'player';
  const attacker = (isPlayer ? state.player.board : state.opponent.board).find(
    (m) => m.instanceId === attackerId
  );

  if (!attacker || attacker.isExhausted || attacker.attack <= 0) return [];

  const opponent = isPlayer ? state.opponent : state.player;
  const tauntMinions = opponent.board.filter((m) => m.hasTaunt && m.health > 0);

  // If opponent has Taunt minions, attacker MUST target one of the Taunt minions!
  if (tauntMinions.length > 0) {
    return tauntMinions.map((m) => m.instanceId);
  }

  // Otherwise, can target any enemy minion or opponent hero
  return [...opponent.board.map((m) => m.instanceId), opponent.id];
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

  const effect = resolveCardEffect({
    name: card.name,
    text: card.text,
    cost: card.cost,
    type: card.type,
  });

  if (!effect.needsTarget) return [];

  const targets: string[] = [];
  const opponent = isPlayer ? state.opponent : state.player;
  const player = isPlayer ? state.player : state.opponent;

  if (effect.targetType === 'ANY' || effect.targetType === 'ENEMY_CHAR') {
    targets.push(opponent.id);
    opponent.board.forEach((m) => targets.push(m.instanceId));
    if (effect.targetType === 'ANY') {
      targets.push(player.id);
      player.board.forEach((m) => targets.push(m.instanceId));
    }
  } else if (effect.targetType === 'ENEMY_MINION') {
    opponent.board.forEach((m) => targets.push(m.instanceId));
  } else if (effect.targetType === 'ANY_MINION') {
    player.board.forEach((m) => targets.push(m.instanceId));
    opponent.board.forEach((m) => targets.push(m.instanceId));
  } else if (effect.targetType === 'FRIENDLY_MINION') {
    player.board.forEach((m) => targets.push(m.instanceId));
  }

  return targets;
}

/**
 * Minion combat attack resolution
 */
export function attackWithMinion(
  state: BattleState,
  attackerId: string,
  targetId: string
): BattleState {
  if (state.phase !== 'ACTION') return state;
  const isPlayer = state.activePlayer === 'player';
  const friendly = isPlayer ? state.player : state.opponent;
  const enemy = isPlayer ? state.opponent : state.player;

  const attacker = friendly.board.find((m) => m.instanceId === attackerId);
  if (!attacker || attacker.isExhausted || attacker.attack <= 0) return state;

  const validTargets = getValidTargetsForAttacker(state, attackerId);
  if (!validTargets.includes(targetId)) return state;

  let nextEnemy = { ...enemy };
  let nextFriendly = { ...friendly };
  let nextWinner = state.winner;
  const history = [...state.history];

  if (targetId === enemy.id) {
    // Attack opponent hero
    let enemyArmor = nextEnemy.armor;
    let enemyHp = nextEnemy.hp;
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

    history.unshift({
      id: `atk_${Date.now()}`,
      type: 'ATTACK',
      ownerId: state.activePlayer,
      sourceName: attacker.name,
      sourceCardId: attacker.definitionId,
      targetName: nextEnemy.name,
      amount: attacker.attack,
      description: `${attacker.name} attacked ${nextEnemy.name} for ${attacker.attack} damage!`,
      timestamp: Date.now(),
    });

    if (enemyHp <= 0) {
      enemyHp = 0;
      nextWinner = state.activePlayer;
    }

    nextEnemy = {
      ...nextEnemy,
      hp: enemyHp,
      armor: enemyArmor,
    };
  } else {
    // Attack enemy minion
    const targetMinion = enemy.board.find((m) => m.instanceId === targetId);
    if (!targetMinion) return state;

    let targetShield = targetMinion.hasDivineShield;
    let attackerShield = attacker.hasDivineShield;
    let targetHp = targetMinion.health;
    let attackerHp = attacker.health;

    // Attacker deals damage to target
    if (targetShield) {
      targetShield = false;
    } else {
      targetHp -= attacker.attack;
    }

    // Target deals damage back to attacker
    if (attackerShield) {
      attackerShield = false;
    } else {
      attackerHp -= targetMinion.attack;
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

    // Update target minion
    const updatedEnemyBoard = enemy.board
      .map((m) =>
        m.instanceId === targetId
          ? { ...m, health: targetHp, hasDivineShield: targetShield }
          : m
      )
      .filter((m) => m.health > 0);

    // Update attacker
    const updatedFriendlyBoard = friendly.board
      .map((m) =>
        m.instanceId === attackerId
          ? {
              ...m,
              health: attackerHp,
              hasDivineShield: attackerShield,
              attacksPerformedThisTurn: m.attacksPerformedThisTurn + 1,
              isExhausted: true,
              canAttack: false,
            }
          : m
      )
      .filter((m) => m.health > 0);

    nextEnemy = { ...nextEnemy, board: updatedEnemyBoard };
    nextFriendly = { ...nextFriendly, board: updatedFriendlyBoard };

    return {
      ...state,
      winner: nextWinner,
      phase: nextWinner ? 'GAME_OVER' : 'ACTION',
      player: isPlayer ? nextFriendly : nextEnemy,
      opponent: isPlayer ? nextEnemy : nextFriendly,
      history,
    };
  }

  // Update attacker attacks performed
  const updatedFriendlyBoard = friendly.board.map((m) =>
    m.instanceId === attackerId
      ? {
          ...m,
          attacksPerformedThisTurn: m.attacksPerformedThisTurn + 1,
          isExhausted: true,
          canAttack: false,
        }
      : m
  );

  nextFriendly = { ...nextFriendly, board: updatedFriendlyBoard };

  return {
    ...state,
    winner: nextWinner,
    phase: nextWinner ? 'GAME_OVER' : 'ACTION',
    player: isPlayer ? nextFriendly : nextEnemy,
    opponent: isPlayer ? nextEnemy : nextFriendly,
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

  let nextPlayer = { ...state.player };
  let nextOpponent = { ...state.opponent };
  let winner = state.winner;
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
    if (nextPlayer.hp <= 0) winner = 'opponent';
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
    if (nextOpponent.hp <= 0) winner = 'player';
  } else {
    // Check if target is a minion on either board
    const hitMinion = (board: CardInstance[]): CardInstance[] =>
      board
        .map((m) => {
          if (m.instanceId !== targetId) return m;
          if (m.hasDivineShield) {
            return { ...m, hasDivineShield: false };
          }
          return { ...m, health: m.health - damage };
        })
        .filter((m) => m.health > 0);

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

  return {
    ...state,
    player: nextPlayer,
    opponent: nextOpponent,
    winner,
    phase: winner ? 'GAME_OVER' : 'ACTION',
    history,
  };
}

/**
 * Play a card from hand (Minion or Spell)
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
  if (hero.mana < card.cost) return state;

  const effect = resolveCardEffect({
    name: card.name,
    text: card.text,
    cost: card.cost,
    type: card.type,
  });

  if (effect.needsTarget && !targetId) return state;

  const nextHand = hero.hand.filter((_, idx) => idx !== cardIndex);
  let nextMana = hero.mana - card.cost;
  let nextPlayer = { ...state.player };
  let nextOpponent = { ...state.opponent };
  let winner = state.winner;
  const history = [...state.history];

  if (card.type === 'MINION') {
    const board = isPlayer ? nextPlayer.board : nextOpponent.board;
    if (board.length >= 7) return state; // Board full!

    const newMinion: CardInstance = {
      ...card,
      isExhausted: !card.keywords.includes('CHARGE' as Keyword),
      attacksPerformedThisTurn: 0,
      canAttack: card.keywords.includes('CHARGE' as Keyword),
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
  } else if (card.type === 'SPELL') {
    const spellDmgBonus = getSpellDamageBonus(isPlayer ? nextPlayer.board : nextOpponent.board);

    if (isPlayer) {
      nextPlayer.hand = nextHand;
      nextPlayer.mana = nextMana;
    } else {
      nextOpponent.hand = nextHand;
      nextOpponent.mana = nextMana;
    }

    // Handle Mana Gain (The Coin)
    if (effect.manaGain) {
      if (isPlayer) {
        nextPlayer.mana = Math.min(10, nextPlayer.mana + effect.manaGain);
      } else {
        nextOpponent.mana = Math.min(10, nextOpponent.mana + effect.manaGain);
      }
    }

    // Handle Card Draw (Arcane Intellect, etc.)
    if (effect.drawCards && effect.drawCards > 0) {
      const activeHero = isPlayer ? nextPlayer : nextOpponent;
      for (let i = 0; i < effect.drawCards; i++) {
        if (activeHero.deck.length > 0 && activeHero.hand.length < 10) {
          activeHero.hand.push(activeHero.deck.shift()!);
        }
      }
    }

    // Handle Direct Target Damage
    if (effect.damage && targetId) {
      const totalDmg = effect.damage + spellDmgBonus;
      if (targetId === 'opponent') {
        nextOpponent.hp = Math.max(0, nextOpponent.hp - totalDmg);
        if (nextOpponent.hp <= 0) winner = 'player';
      } else if (targetId === 'player') {
        nextPlayer.hp = Math.max(0, nextPlayer.hp - totalDmg);
        if (nextPlayer.hp <= 0) winner = 'opponent';
      } else {
        const applySpellToBoard = (board: CardInstance[]) =>
          board
            .map((m) => {
              if (m.instanceId !== targetId) return m;
              if (m.hasDivineShield) return { ...m, hasDivineShield: false };
              return { ...m, health: m.health - totalDmg };
            })
            .filter((m) => m.health > 0);

        nextPlayer.board = applySpellToBoard(nextPlayer.board);
        nextOpponent.board = applySpellToBoard(nextOpponent.board);
      }
    }

    // Handle AoE Damage (Flamestrike, Blizzard, etc.)
    if (effect.aoeDamage) {
      const aoeDmg = effect.aoeDamage.amount + spellDmgBonus;
      const targetSide = isPlayer ? nextOpponent : nextPlayer;
      targetSide.board = targetSide.board
        .map((m) => {
          if (m.hasDivineShield) return { ...m, hasDivineShield: false };
          return { ...m, health: m.health - aoeDmg };
        })
        .filter((m) => m.health > 0);
    }

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

  return {
    ...state,
    player: nextPlayer,
    opponent: nextOpponent,
    winner,
    phase: winner ? 'GAME_OVER' : 'ACTION',
    history,
  };
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
