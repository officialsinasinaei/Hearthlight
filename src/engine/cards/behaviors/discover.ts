import { defineCardBehavior } from '../registry.ts';
import { MAGE_CARDS } from '../../cards.ts';
import {
  getRandomMinionOfCost,
  DRUID_SPELLS_POOL,
  ARCANE_SPELLS_POOL,
  HIGH_COST_SPELLS_5_PLUS,
  HIGH_COST_SPELLS_8_PLUS,
} from '../tokenRegistry.ts';

// 1. [Card #5] 118192 - Scrappy Scavenger
defineCardBehavior('118192', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    const remainingMana = ctx.state[ctx.ownerId].mana;
    const pool = MAGE_CARDS.filter((c) => c.cost === remainingMana);
    const shuffled = ctx.rng.shuffle(pool.length >= 3 ? pool : MAGE_CARDS);
    ctx.discover(shuffled.slice(0, 3));
  },
});

// 2. [Card #7] 116977 - Spark of Life
defineCardBehavior('116977', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    ctx.discover(ctx.rng.shuffle(DRUID_SPELLS_POOL).slice(0, 3));
  },
});

// 3. [Card #8] 118183 - The Forbidden Sequence
defineCardBehavior('118183', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    // Quest reward: The Origin Stone
    ctx.addCardToHand('token-origin-stone');
  },
});

// 4. [Card #9] 126116 - The Skeleton Key
defineCardBehavior('126116', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    const spells = MAGE_CARDS.filter((c) => c.type === 'SPELL');
    ctx.discover(ctx.rng.shuffle(spells).slice(0, 3));
  },
});

// 5. [Card #12] 123398 - Winterspring Whelp
defineCardBehavior('123398', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    const pool = MAGE_CARDS.filter((c) => c.type === 'SPELL' && c.cost === 1);
    const shuffled = ctx.rng.shuffle(pool.length >= 3 ? pool : MAGE_CARDS);
    ctx.discover(shuffled.slice(0, 3));
  },
});

// 6. [Card #13] 130441 - Coilbearer
defineCardBehavior('130441', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    const spells = MAGE_CARDS.filter((c) => c.type === 'SPELL');
    ctx.discover(ctx.rng.shuffle(spells).slice(0, 3));
  },
});

// 7. [Card #24] 126982 - Runed Orb
defineCardBehavior('126982', {
  needsTarget: true,
  targetType: 'ANY',
  execute: (ctx) => {
    if (ctx.targetId) {
      ctx.dealDamage(ctx.targetId, 2);
    }
    const spells = MAGE_CARDS.filter((c) => c.type === 'SPELL');
    ctx.discover(ctx.rng.shuffle(spells).slice(0, 3));
  },
});

// 8. [Card #31] 118199 - Unearthed Artifacts
defineCardBehavior('118199', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    const minion = getRandomMinionOfCost(2, ctx.rng);
    ctx.summonToken(minion);
  },
});

// 9. [Card #47] 114287 - Q'onzu
defineCardBehavior('114287', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    const spells = MAGE_CARDS.filter((c) => c.type === 'SPELL');
    ctx.discover(ctx.rng.shuffle(spells).slice(0, 3));
  },
});

// 10. [Card #51] 118266 - Storage Scuffle
defineCardBehavior('118266', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    const minions = MAGE_CARDS.filter((c) => c.type === 'MINION');
    ctx.discover(ctx.rng.shuffle(minions).slice(0, 3));
  },
});

// 11. [Card #53] 120582 - Vault Breaker
defineCardBehavior('120582', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (_ctx) => {
    // Passive triggered after discovering
  },
});

// 12. [Card #54] 119633 - Alter Time
defineCardBehavior('119633', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    ctx.discover(ctx.rng.shuffle(ARCANE_SPELLS_POOL).slice(0, 3));
  },
});

// 13. [Card #72] 126354 - Breakout Architect
defineCardBehavior('126354', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    ctx.discover(ctx.rng.shuffle(HIGH_COST_SPELLS_5_PLUS).slice(0, 3));
  },
});

// 14. [Card #91] 118616 - Relic of Kings
defineCardBehavior('118616', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    ctx.discover(ctx.rng.shuffle(HIGH_COST_SPELLS_8_PLUS).slice(0, 3));
  },
});
