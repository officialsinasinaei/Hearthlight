import { create } from 'zustand';
import type { SavedDeck, CardDefinition, ActiveSecretInstance } from '../engine/types.ts';
import { useAppStore } from './useAppStore.ts';
import { MAGE_CARDS } from '../engine/cards.ts';
import { getTokenCard, TOKEN_CARDS } from '../engine/cards/tokenRegistry.ts';
import {
  BattleState,
  initBattleState,
  createCardInstance,
  confirmMulligan as engineConfirmMulligan,
  endTurn as engineEndTurn,
  playCard as enginePlayCard,
  useHeroPower as engineUseHeroPower,
  attackWithMinion as engineAttackWithMinion,
  concede as engineConcede,
  resolveChoice as engineResolveChoice,
  getValidTargetsForAttacker,
  getValidTargetsForHeroPower,
  getValidTargetsForSpell,
} from '../engine/battleEngine.ts';
import {
  playOpponentLockedChime,
  playRatchetTick,
} from '../utils/tavernAudio.ts';
import type { VisualEffectEvent, SpellSchool } from '../components/fx/types.ts';
import {
  classifyCardSchoolAndType,
  resolveEffectCoordinates,
  resolveHeroPowerCoordinates,
  resolveCombatCoordinates,
} from '../components/fx/types.ts';

export interface TargetingSource {
  type: 'MINION_ATTACK' | 'HERO_POWER' | 'SPELL';
  id: string; // cardInstanceId or 'hero_power'
  name: string;
}

export interface TargetingCoords {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

interface BattleStoreState {
  battle: BattleState | null;
  isMenuOpen: boolean;

  // Targeting state
  isTargeting: boolean;
  targetingSource: TargetingSource | null;
  targetingCoords: TargetingCoords | null;
  hoveredTargetId: string | null;

  // Card inspecting / dragging
  draggedCardId: string | null;

  // Visual Effects
  activeVisualEffect: VisualEffectEvent | null;
  triggerVisualEffect: (effect: Partial<VisualEffectEvent> & { school: SpellSchool }) => void;
  clearVisualEffect: () => void;

  // Actions
  startMatch: (playerDeck?: SavedDeck | null, options?: { playerFirst?: boolean }) => void;
  confirmMulligan: (replacedIds: string[]) => void;
  playCard: (
    cardInstanceId: string,
    targetId?: string,
    boardIndex?: number,
    coords?: { startX?: number; startY?: number; targetX?: number; targetY?: number }
  ) => void;
  useHeroPower: (targetId: string) => void;
  attackWithMinion: (attackerId: string, targetId: string) => void;
  endTurn: () => void;
  concede: () => void;
  resolveChoice: (optionIndex: number) => void;
  toggleMenu: (force?: boolean) => void;

  // Targeting handlers
  startTargeting: (source: TargetingSource, startX: number, startY: number) => void;
  updateTargetCoords: (currentX: number, currentY: number) => void;
  setHoveredTarget: (targetId: string | null) => void;
  commitTargeting: (targetId: string) => void;
  cancelTargeting: () => void;

  // Dragging card
  setDraggedCard: (id: string | null) => void;

  // Test / Automation Helpers
  setPlayerMana: (mana: number, maxMana: number) => void;
  triggerRopeNow: () => void;
  directLaunch: () => void;
  spawnBoardMinionsForTest: () => void;
}

let turnTimerInterval: ReturnType<typeof setInterval> | null = null;
let botTurnTimeout: ReturnType<typeof setTimeout> | null = null;
let effectTimeout: ReturnType<typeof setTimeout> | null = null;

function clearAllTimers() {
  if (turnTimerInterval) {
    clearInterval(turnTimerInterval);
    turnTimerInterval = null;
  }
  if (botTurnTimeout) {
    clearTimeout(botTurnTimeout);
    botTurnTimeout = null;
  }
  if (effectTimeout) {
    clearTimeout(effectTimeout);
    effectTimeout = null;
  }
}

export const useBattleStore = create<BattleStoreState>((set, get) => {
  const setupTurnTimer = () => {
    clearAllTimers();

    const state = get().battle;
    if (!state || state.phase !== 'ACTION') return;

    if (state.activePlayer === 'opponent') {
      // Bot turn: Hearthstone rules state bot takes turn, wait 2.2s showing "ENEMY TURN", then end turn
      botTurnTimeout = setTimeout(() => {
        const cur = get().battle;
        if (cur && cur.phase === 'ACTION' && cur.activePlayer === 'opponent') {
          get().endTurn();
        }
      }, 2200);
      return;
    }

    // Player turn timer (75s)
    turnTimerInterval = setInterval(() => {
      const cur = get().battle;
      if (!cur || cur.phase !== 'ACTION' || cur.activePlayer !== 'player') {
        clearAllTimers();
        return;
      }

      const nextRemaining = cur.turnTimeRemaining - 1;
      const shouldRopeBurn = nextRemaining <= 20;

      if (nextRemaining <= 0) {
        clearAllTimers();
        get().endTurn();
      } else {
        set({
          battle: {
            ...cur,
            turnTimeRemaining: nextRemaining,
            isRopeBurning: shouldRopeBurn,
          },
        });
      }
    }, 1000);
  };

  return {
    battle: null,
    isMenuOpen: false,
    isTargeting: false,
    targetingSource: null,
    targetingCoords: null,
    hoveredTargetId: null,
    draggedCardId: null,
    activeVisualEffect: null,

    triggerVisualEffect: (effect) => {
      if (effectTimeout) {
        clearTimeout(effectTimeout);
        effectTimeout = null;
      }
      const duration = effect.durationMs ?? 550;
      const newEffect: VisualEffectEvent = {
        id: `fx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        startedAt: Date.now(),
        durationMs: duration,
        startX: effect.startX ?? (typeof window !== 'undefined' ? window.innerWidth * 0.5 : 720),
        startY: effect.startY ?? (typeof window !== 'undefined' ? window.innerHeight * 0.85 : 750),
        targetX: effect.targetX ?? (typeof window !== 'undefined' ? window.innerWidth * 0.5 : 720),
        targetY: effect.targetY ?? (typeof window !== 'undefined' ? window.innerHeight * 0.35 : 300),
        school: effect.school,
        cardName: effect.cardName,
        cardId: effect.cardId,
        sourceType: effect.sourceType,
        isAoE: effect.isAoE,
        targetId: effect.targetId,
      };
      set({ activeVisualEffect: newEffect });
      effectTimeout = setTimeout(() => {
        set({ activeVisualEffect: null });
        effectTimeout = null;
      }, duration);
    },

    clearVisualEffect: () => {
      if (effectTimeout) {
        clearTimeout(effectTimeout);
        effectTimeout = null;
      }
      set({ activeVisualEffect: null });
    },

    startMatch: (playerDeck, options) => {
      clearAllTimers();
      const initial = initBattleState({
        playerDeck,
        playerFirst: options?.playerFirst ?? true,
      });

      set({
        battle: initial,
        isMenuOpen: false,
        isTargeting: false,
        targetingSource: null,
        targetingCoords: null,
        hoveredTargetId: null,
        draggedCardId: null,
        activeVisualEffect: null,
      });
    },

    confirmMulligan: (replacedIds) => {
      const cur = get().battle;
      if (!cur || cur.phase !== 'MULLIGAN') return;

      const next = engineConfirmMulligan(cur, replacedIds);
      set({ battle: next });
      playOpponentLockedChime();
      setupTurnTimer();
    },

    playCard: (cardInstanceId, targetId, boardIndex, coords) => {
      const cur = get().battle;
      if (!cur || cur.phase !== 'ACTION' || cur.activePlayer !== 'player') return;

      const card = cur.player.hand.find((c) => c.instanceId === cardInstanceId);
      if (card) {
        const classification = classifyCardSchoolAndType(card);
        const fxCoords = resolveEffectCoordinates(card, targetId, coords);
        get().triggerVisualEffect({
          school: classification.school,
          cardName: card.name,
          cardId: card.definitionId,
          sourceType: card.type === 'MINION' ? 'MINION' : 'SPELL',
          isAoE: classification.isAoE,
          startX: fxCoords.startX,
          startY: fxCoords.startY,
          targetX: fxCoords.targetX,
          targetY: fxCoords.targetY,
          targetId,
          durationMs: 550,
        });
      }

      const next = enginePlayCard(cur, cardInstanceId, targetId, boardIndex);
      set({ battle: next, draggedCardId: null });
      playRatchetTick(1.2);
      if (next.pendingChoice && next.pendingChoice.ownerId === 'opponent') {
        setTimeout(() => {
          get().resolveChoice(0);
        }, 500);
      }
    },

    useHeroPower: (targetId) => {
      const cur = get().battle;
      if (!cur || cur.phase !== 'ACTION' || cur.activePlayer !== 'player') return;

      const heroCoords = resolveHeroPowerCoordinates(targetId);
      get().triggerVisualEffect({
        school: 'FIRE',
        cardName: 'Fireblast',
        sourceType: 'HERO_POWER',
        isAoE: false,
        startX: heroCoords.startX,
        startY: heroCoords.startY,
        targetX: heroCoords.targetX,
        targetY: heroCoords.targetY,
        targetId,
        durationMs: 500,
      });

      const next = engineUseHeroPower(cur, targetId);
      set({ battle: next });
      playRatchetTick(0.9);
    },

    attackWithMinion: (attackerId, targetId) => {
      const cur = get().battle;
      if (!cur || cur.phase !== 'ACTION' || cur.activePlayer !== 'player') return;

      const combatCoords = resolveCombatCoordinates(attackerId, targetId);
      get().triggerVisualEffect({
        school: 'COMBAT',
        sourceType: 'ATTACK',
        startX: combatCoords.startX,
        startY: combatCoords.startY,
        targetX: combatCoords.targetX,
        targetY: combatCoords.targetY,
        targetId,
        durationMs: 450,
      });

      const next = engineAttackWithMinion(cur, attackerId, targetId);
      set({ battle: next });
      playRatchetTick(0.7);
    },

    endTurn: () => {
      const cur = get().battle;
      if (!cur || cur.phase !== 'ACTION') return;

      const next = engineEndTurn(cur);
      set({
        battle: next,
        isTargeting: false,
        targetingSource: null,
        targetingCoords: null,
      });
      playRatchetTick(1.0);
      setupTurnTimer();
    },

    concede: () => {
      clearAllTimers();
      const cur = get().battle;
      if (!cur) return;
      const next = engineConcede(cur, 'player');
      set({ battle: next, isMenuOpen: false });
    },

    resolveChoice: (optionIndex: number) => {
      const cur = get().battle;
      if (!cur) return;
      const next = engineResolveChoice(cur, optionIndex);
      set({ battle: next });
    },

    toggleMenu: (force) => {
      set((s) => ({ isMenuOpen: force !== undefined ? force : !s.isMenuOpen }));
    },

    startTargeting: (source, startX, startY) => {
      set({
        isTargeting: true,
        targetingSource: source,
        targetingCoords: {
          startX,
          startY,
          currentX: startX,
          currentY: startY,
        },
      });
    },

    updateTargetCoords: (currentX, currentY) => {
      const coords = get().targetingCoords;
      if (!coords) return;
      set({
        targetingCoords: {
          ...coords,
          currentX,
          currentY,
        },
      });
    },

    setHoveredTarget: (targetId) => {
      set({ hoveredTargetId: targetId });
    },

    commitTargeting: (targetId) => {
      const { targetingSource, targetingCoords } = get();
      if (!targetingSource) return;

      if (targetingSource.type === 'MINION_ATTACK') {
        get().attackWithMinion(targetingSource.id, targetId);
      } else if (targetingSource.type === 'HERO_POWER') {
        get().useHeroPower(targetId);
      } else if (targetingSource.type === 'SPELL') {
        get().playCard(
          targetingSource.id,
          targetId,
          undefined,
          targetingCoords
            ? {
                startX: targetingCoords.startX,
                startY: targetingCoords.startY,
                targetX: targetingCoords.currentX,
                targetY: targetingCoords.currentY,
              }
            : undefined
        );
      }

      set({
        isTargeting: false,
        targetingSource: null,
        targetingCoords: null,
        hoveredTargetId: null,
      });
    },

    cancelTargeting: () => {
      set({
        isTargeting: false,
        targetingSource: null,
        targetingCoords: null,
        hoveredTargetId: null,
      });
    },

    setDraggedCard: (id) => {
      set({ draggedCardId: id });
    },

    // Test & Automation helpers
    setPlayerMana: (mana, maxMana) => {
      const cur = get().battle;
      if (!cur) return;
      set({
        battle: {
          ...cur,
          player: {
            ...cur.player,
            mana,
            maxMana,
          },
        },
      });
    },

    triggerRopeNow: () => {
      const cur = get().battle;
      if (!cur) return;
      set({
        battle: {
          ...cur,
          turnTimeRemaining: 20,
          isRopeBurning: true,
        },
      });
    },

    directLaunch: () => {
      clearAllTimers();
      const initial = initBattleState({ playerFirst: true });
      const active = engineConfirmMulligan(initial, []);
      set({
        battle: active,
        isMenuOpen: false,
        isTargeting: false,
        targetingSource: null,
        targetingCoords: null,
        hoveredTargetId: null,
        draggedCardId: null,
      });
      useAppStore.getState().closeFindingOpponent();
      useAppStore.getState().navigateTo('BATTLEFIELD');
      setupTurnTimer();
    },

    spawnBoardMinionsForTest: () => {
      const cur = get().battle;
      if (!cur) return;
      const p1 = createCardInstance(
        MAGE_CARDS.find((c) => c.type === 'MINION' && (c.attack ?? 0) > 1) || MAGE_CARDS[0],
        'player'
      );
      p1.canAttack = true;
      p1.isExhausted = false;

      const p2 = createCardInstance(
        MAGE_CARDS.find((c) => c.type === 'MINION' && c.id !== p1.definitionId) || MAGE_CARDS[1],
        'player'
      );
      p2.canAttack = false;
      p2.isExhausted = true;

      const o1 = createCardInstance(
        MAGE_CARDS.find((c) => c.type === 'MINION' && c.text.toLowerCase().includes('taunt')) || MAGE_CARDS[2],
        'opponent'
      );
      o1.hasTaunt = true;

      const o2 = createCardInstance(
        MAGE_CARDS.find((c) => c.type === 'MINION' && c.id !== o1.definitionId) || MAGE_CARDS[3],
        'opponent'
      );

      let hand = cur.player.hand.filter((c) => !c.text.toLowerCase().includes('discover'));
      if (!hand.some((c) => c.type === 'MINION')) {
        const minionDef =
          MAGE_CARDS.find(
            (c) => c.type === 'MINION' && (c.cost ?? 0) <= 2 && !c.text.toLowerCase().includes('discover')
          ) || MAGE_CARDS[0];
        hand.push(createCardInstance(minionDef, 'player'));
      }

      set({
        battle: {
          ...cur,
          player: {
            ...cur.player,
            board: [p1, p2],
            hand,
          },
          opponent: {
            ...cur.opponent,
            board: [o1, o2],
          },
        },
      });
    },
  };
});

// Expose helper on window for automated verification tests
if (typeof window !== 'undefined') {
  (window as unknown as { __hearthlightBattle: unknown }).__hearthlightBattle = {
    getState: () => useBattleStore.getState(),
    setPlayerMana: (cur: number, max: number) => useBattleStore.getState().setPlayerMana(cur, max),
    triggerRopeNow: () => useBattleStore.getState().triggerRopeNow(),
    directLaunch: () => useBattleStore.getState().directLaunch(),
    spawnBoardMinionsForTest: () => useBattleStore.getState().spawnBoardMinionsForTest(),
    getValidTargetsForAttacker: (attackerId: string) => {
      const b = useBattleStore.getState().battle;
      return b ? getValidTargetsForAttacker(b, attackerId) : [];
    },
    getValidTargetsForHeroPower: () => {
      const b = useBattleStore.getState().battle;
      return b ? getValidTargetsForHeroPower(b) : [];
    },
    getValidTargetsForSpell: (spellId: string) => {
      const b = useBattleStore.getState().battle;
      return b ? getValidTargetsForSpell(b, spellId) : [];
    },
    resolveChoice: (index: number) => {
      useBattleStore.getState().resolveChoice(index);
    },
    triggerDiscoverForTest: (options?: CardDefinition[]) => {
      const cur = useBattleStore.getState().battle;
      if (!cur) return;
      const opts = options || MAGE_CARDS.slice(0, 3);
      useBattleStore.setState({
        battle: {
          ...cur,
          pendingChoice: {
            title: 'Discover a card',
            options: opts,
            ownerId: 'player',
          },
        },
      });
    },
    addActiveSecretForTest: (ownerId: 'player' | 'opponent' = 'player', secretName = 'Ice Block') => {
      const cur = useBattleStore.getState().battle;
      if (!cur) return;
      const isPlayer = ownerId === 'player';
      const hero = isPlayer ? cur.player : cur.opponent;
      const newSecret: ActiveSecretInstance = {
        id: `secret_test_${Date.now()}`,
        definitionId: 'CORE_EX1_295',
        name: secretName,
        text: 'When your hero takes fatal damage, prevent it and become Immune this turn.',
        ownerId,
      };
      const updatedHero = {
        ...hero,
        secrets: [...(hero.secrets || []), newSecret],
      };
      useBattleStore.setState({
        battle: {
          ...cur,
          player: isPlayer ? updatedHero : cur.player,
          opponent: isPlayer ? cur.opponent : updatedHero,
        },
      });
    },
    setBoardMinionStateForTest: (
      minionIndex: number,
      isFriendly: boolean,
      flags: { isFrozen?: boolean; hasStealth?: boolean; spellDamage?: number }
    ) => {
      const cur = useBattleStore.getState().battle;
      if (!cur) return;
      const hero = isFriendly ? cur.player : cur.opponent;
      const board = [...hero.board];
      if (board[minionIndex]) {
        board[minionIndex] = {
          ...board[minionIndex],
          ...flags,
        };
        useBattleStore.setState({
          battle: {
            ...cur,
            player: isFriendly ? { ...cur.player, board } : cur.player,
            opponent: isFriendly ? cur.opponent : { ...cur.opponent, board },
          },
        });
      }
    },
    triggerVisualEffect: (effect: Partial<VisualEffectEvent> & { school: SpellSchool }) =>
      useBattleStore.getState().triggerVisualEffect(effect),
    getActiveVisualEffect: () => useBattleStore.getState().activeVisualEffect,
    setupCardPlayScenario: (cardDefOrId: string | CardDefinition): string | null => {
      clearAllTimers();
      let cardDef: CardDefinition | undefined;
      if (typeof cardDefOrId === 'string') {
        const query = cardDefOrId.toLowerCase();
        cardDef =
          MAGE_CARDS.find(
            (c) => c.id === cardDefOrId || c.slug === cardDefOrId || c.name.toLowerCase() === query
          ) ||
          getTokenCard(cardDefOrId) ||
          Object.values(TOKEN_CARDS).find((t) => t.name.toLowerCase() === query);
      } else {
        cardDef = cardDefOrId;
      }
      if (!cardDef) return null;

      const initial = initBattleState({ playerFirst: true });
      const active = engineConfirmMulligan(initial, []);
      const playerCardInstance = createCardInstance(cardDef, 'player');

      const friendlyMinionDef =
        MAGE_CARDS.find((c) => c.type === 'MINION' && (c.cost ?? 0) <= 3) || MAGE_CARDS[0];
      const friendlyMinion = createCardInstance(friendlyMinionDef, 'player');
      friendlyMinion.canAttack = true;
      friendlyMinion.isExhausted = false;

      const enemyMinion1Def =
        MAGE_CARDS.find((c) => c.type === 'MINION' && c.text.toLowerCase().includes('taunt')) || MAGE_CARDS[2];
      const enemyMinion1 = createCardInstance(enemyMinion1Def, 'opponent');
      enemyMinion1.hasTaunt = true;

      const enemyMinion2Def =
        MAGE_CARDS.find((c) => c.type === 'MINION' && c.id !== enemyMinion1Def.id) || MAGE_CARDS[3];
      const enemyMinion2 = createCardInstance(enemyMinion2Def, 'opponent');

      useBattleStore.setState({
        battle: {
          ...active,
          phase: 'ACTION',
          activePlayer: 'player',
          player: {
            ...active.player,
            mana: 10,
            maxMana: 10,
            hand: [playerCardInstance],
            board: [friendlyMinion],
          },
          opponent: {
            ...active.opponent,
            board: [enemyMinion1, enemyMinion2],
          },
        },
        isMenuOpen: false,
        isTargeting: false,
        targetingSource: null,
        targetingCoords: null,
        hoveredTargetId: null,
        draggedCardId: null,
        activeVisualEffect: null,
      });
      useAppStore.getState().closeFindingOpponent();
      useAppStore.getState().navigateTo('BATTLEFIELD');
      return playerCardInstance.instanceId;
    },
  };
}
