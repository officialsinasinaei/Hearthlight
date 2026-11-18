import { defineCardBehavior } from '../registry.ts';

// 1. [Card #2] 126227 - First Flame
defineCardBehavior('126227', {
  needsTarget: true,
  targetType: 'ANY_MINION',
  execute: (ctx) => {
    if (ctx.targetId) {
      ctx.dealDamage(ctx.targetId, 2);
    }
    ctx.addCardToHand('token-second-flame');
  },
});

// 2. [Card #6] 123410 - Sleet Storm
defineCardBehavior('123410', {
  needsTarget: true,
  targetType: 'ANY',
  execute: (ctx) => {
    if (ctx.targetId) {
      ctx.dealDamage(ctx.targetId, 2);
    }
    ctx.dealSplitDamage(1, 'ENEMY_MINIONS');
  },
});

// 3. [Card #23] 123419 - Raincaller
defineCardBehavior('123419', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (_ctx) => {
    // Passive minion effect triggered on spell damage; base battlecry no-op
  },
});

// 4. [Card #32] 119528 - Arcane Barrage
defineCardBehavior('119528', {
  needsTarget: true,
  targetType: 'ENEMY_CHAR',
  execute: (ctx) => {
    if (ctx.targetId) {
      ctx.dealDamage(ctx.targetId, 3);
    }
    // 2 damage to two other random enemies
    ctx.dealSplitDamage(4, 'ENEMIES');
  },
});

// 5. [Card #39] 121188 - Eternal Firebolt
defineCardBehavior('121188', {
  needsTarget: true,
  targetType: 'ANY_MINION',
  execute: (ctx) => {
    if (ctx.targetId) {
      ctx.dealDamage(ctx.targetId, 3);
    }
  },
});

// 6. [Card #48] 115634 - Scorching Winds
defineCardBehavior('115634', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    const spellsInHand = ctx.state[ctx.ownerId].hand.filter((c) => c.type === 'SPELL').length;
    const dmg = Math.max(1, 4 - spellsInHand);
    ctx.dealAoeDamage(dmg, 'ALL_MINIONS');
  },
});

// 7. [Card #49] 126355 - Spire Security
defineCardBehavior('126355', {
  needsTarget: true,
  targetType: 'ENEMY_CHAR',
  execute: (ctx) => {
    if (ctx.targetId) {
      ctx.dealDamage(ctx.targetId, 2);
    }
  },
});

// 8. [Card #50] 115866 - Starsurge
defineCardBehavior('115866', {
  needsTarget: false,
  targetType: 'ANY',
  execute: (ctx) => {
    if (ctx.targetId && ctx.targetId !== 'player' && ctx.targetId !== 'opponent') {
      ctx.dealDamage(ctx.targetId, 4);
    } else {
      ctx.dealAoeDamage(2, 'ENEMY_MINIONS');
    }
  },
});

// 9. [Card #55] 123692 - Arcane Flow
defineCardBehavior('123692', {
  needsTarget: true,
  targetType: 'ANY',
  execute: (ctx) => {
    if (ctx.targetId) {
      ctx.dealDamage(ctx.targetId, 4);
    }
    ctx.dealAoeDamage(2, 'ENEMY_MINIONS');
  },
});

// 10. [Card #57] 129811 - Astral Rain
defineCardBehavior('129811', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    for (let i = 0; i < 5; i++) {
      const minions = ctx.state[ctx.opponentId].board.filter((m) => m.health > 0);
      if (minions.length === 0) break;
      const target = ctx.rng.pick(minions);
      ctx.dealDamage(target.instanceId, 2);
    }
  },
});

// 11. [Card #58] 123495 - Bursting Leyline
defineCardBehavior('123495', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    const enemyMinions = ctx.state[ctx.opponentId].board.filter((m) => m.health > 0);
    if (enemyMinions.length > 0) {
      const target = ctx.rng.pick(enemyMinions);
      const hp = target.health;
      ctx.dealDamage(target.instanceId, 4);
      if (hp < 4) {
        ctx.dealDamage(ctx.opponentId, 4 - hp);
      }
    } else {
      ctx.dealDamage(ctx.opponentId, 4);
    }
  },
});

// 12. [Card #59] 69501 - Fireball
defineCardBehavior('69501', {
  needsTarget: true,
  targetType: 'ANY',
  execute: (ctx) => {
    if (ctx.targetId) {
      ctx.dealDamage(ctx.targetId, 6);
    }
  },
});

// 13. [Card #63] 118651 - Sheep Mask
defineCardBehavior('118651', {
  needsTarget: true,
  targetType: 'ANY_MINION',
  execute: (ctx) => {
    if (ctx.targetId) {
      ctx.transformMinion(ctx.targetId, 'token-sheep-mask');
    }
  },
});

// 14. [Card #76] 123847 - Sindragosa's Triumph
defineCardBehavior('123847', {
  needsTarget: true,
  targetType: 'ANY_MINION',
  execute: (ctx) => {
    if (ctx.targetId) {
      let targetHp = 0;
      const allMinions = [...ctx.state.player.board, ...ctx.state.opponent.board];
      const target = allMinions.find((m) => m.instanceId === ctx.targetId);
      if (target) targetHp = target.health;

      ctx.dealDamage(ctx.targetId, 8);
      const excess = Math.max(0, 8 - targetHp);
      if (excess > 0 && ctx.state[ctx.ownerId].hand.length > 0) {
        const randomCard = ctx.rng.pick(ctx.state[ctx.ownerId].hand);
        randomCard.cost = Math.max(0, randomCard.cost - excess);
      }
    }
  },
});

// 15. [Card #90] 69502 - Flamestrike
defineCardBehavior('69502', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    ctx.dealAoeDamage(5, 'ENEMY_MINIONS');
  },
});

// 16. [Card #93] 119649 - Temporal Construct
defineCardBehavior('119649', {
  needsTarget: true,
  targetType: 'ENEMY_MINION',
  execute: (ctx) => {
    if (ctx.targetId) {
      const target = ctx.state[ctx.opponentId].board.find((m) => m.instanceId === ctx.targetId);
      const targetHp = target ? target.health : 0;
      ctx.dealDamage(ctx.targetId, 5);
      const excess = Math.max(0, 5 - targetHp);
      if (excess > 0) {
        ctx.drawCards(excess);
      }
    }
  },
});

// 17. [Card #94] 123665 - Vulcanos
defineCardBehavior('123665', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    // Colossal +2 summons 2 appendages
    ctx.summonToken('token-plume-of-vulcanos', 2);
  },
});

// 18. [Card #95] 113700 - Aessina
defineCardBehavior('113700', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    const deadMinions = ctx.state[ctx.ownerId].graveyard.filter((c) => c.type === 'MINION').length;
    if (deadMinions >= 1) {
      ctx.dealSplitDamage(20, 'ENEMIES');
    }
  },
});
