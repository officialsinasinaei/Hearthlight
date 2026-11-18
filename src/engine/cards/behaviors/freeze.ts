import { defineCardBehavior } from '../registry.ts';
import { getRandomSpell, getRandomMinionOfCost } from '../tokenRegistry.ts';

// 1. [Card #1] 126356 - Cold Snap
defineCardBehavior('126356', {
  needsTarget: true,
  targetType: 'ENEMY_CHAR',
  execute: (ctx) => {
    if (ctx.targetId) {
      ctx.freeze(ctx.targetId);
    }
    const frostSpell = getRandomSpell('frost', ctx.rng);
    ctx.addCardToHand(frostSpell);
  },
});

// 2. [Card #19] 111365 - Frostbolt
defineCardBehavior('111365', {
  needsTarget: true,
  targetType: 'ANY',
  execute: (ctx) => {
    if (ctx.targetId) {
      ctx.dealDamage(ctx.targetId, 3);
      ctx.freeze(ctx.targetId);
    }
  },
});

// 3. [Card #42] 131200 - Foreboding Freeze
defineCardBehavior('131200', {
  needsTarget: true,
  targetType: 'ENEMY_CHAR',
  execute: (ctx) => {
    if (ctx.targetId) {
      ctx.freeze(ctx.targetId);
    }
    const minionDef = getRandomMinionOfCost(5, ctx.rng);
    ctx.summonToken(minionDef);
    const friendlyBoard = ctx.state[ctx.ownerId].board;
    if (friendlyBoard.length > 0) {
      friendlyBoard[friendlyBoard.length - 1].isFrozen = true;
    }
  },
});

// 4. [Card #70] 121176 - Bitter End
defineCardBehavior('121176', {
  needsTarget: true,
  targetType: 'ANY_MINION',
  execute: (ctx) => {
    if (!ctx.targetId) return;

    const findAndFreeze = (board: typeof ctx.state.player.board) => {
      const idx = board.findIndex((m) => m.instanceId === ctx.targetId);
      if (idx !== -1) {
        const indices = [idx - 1, idx, idx + 1].filter((i) => i >= 0 && i < board.length);
        for (const i of indices) {
          const m = board[i];
          m.isFrozen = true;
          if (m.health < m.maxHealth) {
            m.health = 0; // destroyed
          }
        }
        return true;
      }
      return false;
    };

    if (!findAndFreeze(ctx.state.player.board)) {
      findAndFreeze(ctx.state.opponent.board);
    }
  },
});

// 5. [Card #81] 76273 - Blizzard
defineCardBehavior('76273', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    ctx.dealAoeDamage(2, 'ENEMY_MINIONS');
    for (const m of ctx.state[ctx.opponentId].board) {
      m.isFrozen = true;
    }
  },
});

// 6. [Card #82] 129851 - Isiset
defineCardBehavior('129851', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    ctx.summonToken('token-construct', 2);
    for (const m of ctx.state[ctx.ownerId].board) {
      if (m.definitionId === 'token-construct' || m.name.toLowerCase() === 'construct') {
        m.isFrozen = true;
      }
    }
  },
});

// 7. [Card #89] 126976 - Deep Freeze
defineCardBehavior('126976', {
  needsTarget: true,
  targetType: 'ENEMY_CHAR',
  execute: (ctx) => {
    if (ctx.targetId) {
      ctx.freeze(ctx.targetId);
    }
    ctx.summonToken('token-water-elemental', 2);
  },
});
