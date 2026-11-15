import { create } from 'zustand';
import type { SavedDeck } from '../engine/types.ts';
import { useAppStore } from './useAppStore.ts';
import { MAGE_CARDS } from '../engine/cards.ts';
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
  getValidTargetsForAttacker,
  getValidTargetsForHeroPower,
  getValidTargetsForSpell,
} from '../engine/battleEngine.ts';
import {
  playOpponentLockedChime,
  playRatchetTick,
} from '../utils/tavernAudio.ts';

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

  // Actions
  startMatch: (playerDeck?: SavedDeck | null, options?: { playerFirst?: boolean }) => void;
  confirmMulligan: (replacedIds: string[]) => void;
  playCard: (cardInstanceId: string, targetId?: string, boardIndex?: number) => void;
  useHeroPower: (targetId: string) => void;
  attackWithMinion: (attackerId: string, targetId: string) => void;
  endTurn: () => void;
  concede: () => void;
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

function clearAllTimers() {
  if (turnTimerInterval) {
    clearInterval(turnTimerInterval);
    turnTimerInterval = null;
  }
  if (botTurnTimeout) {
    clearTimeout(botTurnTimeout);
    botTurnTimeout = null;
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

    playCard: (cardInstanceId, targetId, boardIndex) => {
      const cur = get().battle;
      if (!cur || cur.phase !== 'ACTION' || cur.activePlayer !== 'player') return;

      const next = enginePlayCard(cur, cardInstanceId, targetId, boardIndex);
      set({ battle: next, draggedCardId: null });
      playRatchetTick(1.2);
    },

    useHeroPower: (targetId) => {
      const cur = get().battle;
      if (!cur || cur.phase !== 'ACTION' || cur.activePlayer !== 'player') return;

      const next = engineUseHeroPower(cur, targetId);
      set({ battle: next });
      playRatchetTick(0.9);
    },

    attackWithMinion: (attackerId, targetId) => {
      const cur = get().battle;
      if (!cur || cur.phase !== 'ACTION' || cur.activePlayer !== 'player') return;

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
      const { targetingSource } = get();
      if (!targetingSource) return;

      if (targetingSource.type === 'MINION_ATTACK') {
        get().attackWithMinion(targetingSource.id, targetId);
      } else if (targetingSource.type === 'HERO_POWER') {
        get().useHeroPower(targetId);
      } else if (targetingSource.type === 'SPELL') {
        get().playCard(targetingSource.id, targetId);
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

      let hand = [...cur.player.hand];
      if (!hand.some((c) => c.type === 'MINION')) {
        const minionDef = MAGE_CARDS.find((c) => c.type === 'MINION' && (c.cost ?? 0) <= 2) || MAGE_CARDS[0];
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
  };
}
