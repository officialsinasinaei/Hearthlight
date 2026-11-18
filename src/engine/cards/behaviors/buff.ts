import { defineCardBehavior } from '../registry.ts';

// 1. [Card #10] 121174 - Time-Twisted Seer
defineCardBehavior('121174', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (_ctx) => {
    // Passive Spell Damage while damaged
  },
});

// 2. [Card #28] 116980 - Stellar Balance
defineCardBehavior('116980', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    ctx.addCardToHand('token-moonfire');
    ctx.addCardToHand('token-starfire');
  },
});

// 3. [Card #56] 122632 - Archmage Kalec
defineCardBehavior('122632', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    const hero = ctx.state[ctx.ownerId];
    for (const card of hero.hand) {
      if (card.type === 'SPELL') {
        card.keywords = [...card.keywords, 'SPELL_DAMAGE'];
        card.spellDamage = (card.spellDamage || 0) + 1;
      }
    }
    for (const card of hero.deck) {
      if (card.type === 'SPELL') {
        card.keywords = [...card.keywords, 'SPELL_DAMAGE'];
        card.spellDamage = (card.spellDamage || 0) + 1;
      }
    }
  },
});

// 4. [Card #62] 115805 - Merry Moonkin
defineCardBehavior('115805', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    const wisps = ctx.state[ctx.ownerId].board.filter(
      (m) => m.name.toLowerCase().includes('wisp') || m.definitionId === 'token-wisp'
    ).length;
    ctx.gainArmor(1 + wisps * 2);
  },
});

// 5. [Card #67] 119632 - Algeth'ar Instructor
defineCardBehavior('119632', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (_ctx) => {
    // Passive Spell Damage +2
  },
});

// 6. [Card #92] 118485 - Techysaurus
defineCardBehavior('118485', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (_ctx) => {
    // Dynamic cost reduction aura and Taunt
  },
});
