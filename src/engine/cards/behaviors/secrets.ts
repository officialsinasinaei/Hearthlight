import { defineCardBehavior } from '../registry.ts';

// 1. [Card #38] 69607 - Counterspell
defineCardBehavior('69607', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    ctx.registerSecret(ctx.card);
  },
});

// 2. [Card #40] 86235 - Explosive Runes
defineCardBehavior('86235', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    ctx.registerSecret(ctx.card);
  },
});

// 3. [Card #41] 121187 - Flames of Infinity
defineCardBehavior('121187', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    ctx.registerSecret(ctx.card);
  },
});

// 4. [Card #43] 69608 - Ice Barrier
defineCardBehavior('69608', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    ctx.registerSecret(ctx.card);
  },
});

// 5. [Card #45] 126113 - Mystic Misdirection
defineCardBehavior('126113', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    ctx.registerSecret(ctx.card);
  },
});

// 6. [Card #46] 120392 - Oasis Ally
defineCardBehavior('120392', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    ctx.registerSecret(ctx.card);
  },
});
