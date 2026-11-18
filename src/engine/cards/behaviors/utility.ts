import { defineCardBehavior } from '../registry.ts';
import {
  getRandomSpell,
  getRandomSpellOfCost,
  getRandomMinionOfCost,
  LEYLINES_POOL,
} from '../tokenRegistry.ts';

// 1. [Card #3] 114293 - Forbidden Shrine
defineCardBehavior('114293', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    const hero = ctx.state[ctx.ownerId];
    const mana = hero.mana;
    hero.mana = 0;
    const randomSpell = getRandomSpellOfCost(mana, ctx.rng);
    ctx.addCardToHand(randomSpell);
  },
});

// 2. [Card #11] 120971 - Violet Spellwing
defineCardBehavior('120971', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (_ctx) => {
    // Deathrattle: Add an 'Arcane Missiles' spell to hand
  },
});

// 3. [Card #15] 126109 - Contraband Wands
defineCardBehavior('126109', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    ctx.addCardToHand('token-arcane-missiles');
    ctx.addCardToHand('token-arcane-missiles');
    ctx.addCardToHand('token-arcane-missiles');
  },
});

// 4. [Card #16] 129112 - Discs of Norgannon
defineCardBehavior('129112', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    const hero = ctx.state[ctx.ownerId];
    const spells = hero.deck.filter((c) => c.type === 'SPELL');
    const nonSpells = hero.deck.filter((c) => c.type !== 'SPELL');
    hero.deck = [...spells, ...nonSpells];
  },
});

// 5. [Card #17] 114012 - Divination
defineCardBehavior('114012', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    const board = ctx.state[ctx.ownerId].board;
    const wispIdx = board.findIndex(
      (m) => m.name.toLowerCase().includes('wisp') || m.definitionId === 'token-wisp'
    );
    if (wispIdx !== -1) {
      board.splice(wispIdx, 1);
      ctx.drawCards(3);
    }
  },
});

// 6. [Card #18] 119740 - Faceless Enigma
defineCardBehavior('119740', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    const s1 = getRandomSpell('secret', ctx.rng);
    ctx.registerSecret(s1);
  },
});

// 7. [Card #21] 123508 - Leyline Nexus
defineCardBehavior('123508', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    const handBefore = ctx.state[ctx.ownerId].hand.length;
    ctx.drawCards(1);
    const hand = ctx.state[ctx.ownerId].hand;
    if (hand.length > handBefore) {
      const drawn = hand[hand.length - 1];
      drawn.cost = Math.max(0, drawn.cost - 1);
    }
  },
});

// 8. [Card #22] 123515 - Mystic Runesaber
defineCardBehavior('123515', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (_ctx) => {
    // Battlecry: Increase effects of Leylines by 1
  },
});

// 9. [Card #25] 118636 - Semi-Stable Portal
defineCardBehavior('118636', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    const randomCost = ctx.rng.nextInt(1, 8);
    const minion = getRandomMinionOfCost(randomCost, ctx.rng);
    ctx.addCardToHand(minion, { costModifier: -3 });
  },
});

// 10. [Card #26] 115635 - Smoldering Grove
defineCardBehavior('115635', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    ctx.drawCards(1);
  },
});

// 11. [Card #27] 116462 - Spirit Gatherer
defineCardBehavior('116462', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    ctx.addCardToHand('token-wisp');
  },
});

// 12. [Card #29] 118265 - Story of the Waygate
defineCardBehavior('118265', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    for (const card of ctx.state[ctx.ownerId].hand) {
      card.cost = Math.max(0, card.cost - 1);
    }
  },
});

// 13. [Card #30] 129801 - Thaw From Ice
defineCardBehavior('129801', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    const minion = getRandomMinionOfCost(3, ctx.rng);
    ctx.addCardToHand(minion);
  },
});

// 14. [Card #33] 69500 - Arcane Intellect
defineCardBehavior('69500', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    ctx.drawCards(2);
  },
});

// 15. [Card #34] 117307 - Babbling Bookcase
defineCardBehavior('117307', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    const s1 = getRandomSpell('all', ctx.rng);
    const s2 = getRandomSpell('all', ctx.rng);
    ctx.addCardToHand(s1);
    ctx.addCardToHand(s2);
  },
});

// 16. [Card #35] 123848 - Conjuration Specialist
defineCardBehavior('123848', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    const hand = ctx.state[ctx.ownerId].hand;
    const spellIdx = hand.findIndex((c) => c.type === 'SPELL');
    if (spellIdx !== -1) {
      const spell = hand[spellIdx];
      hand.splice(spellIdx, 1);
      const s1 = getRandomSpellOfCost(spell.cost, ctx.rng);
      const s2 = getRandomSpellOfCost(spell.cost, ctx.rng);
      ctx.addCardToHand(s1);
      ctx.addCardToHand(s2);
    }
  },
});

// 17. [Card #37] 129787 - Cosmic Springs
defineCardBehavior('129787', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    const handBefore = ctx.state[ctx.ownerId].hand.length;
    ctx.drawCards(1);
    const hand = ctx.state[ctx.ownerId].hand;
    if (hand.length > handBefore && hand[hand.length - 1].type !== 'MINION') {
      const hero = ctx.state[ctx.ownerId];
      hero.mana = Math.min(hero.maxMana, hero.mana + 2);
    }
  },
});

// 18. [Card #44] 123496 - Ley Walker
defineCardBehavior('123496', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    const leyline = getRandomSpell('leyline', ctx.rng);
    ctx.addCardToHand(leyline);
  },
});

// 19. [Card #52] 119741 - Timelooper Toki
defineCardBehavior('119741', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (_ctx) => {
    // Battlecry timer
  },
});

// 20. [Card #60] 121189 - Fragment of Nothing
defineCardBehavior('121189', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (_ctx) => {
    // Passive triggered after spell cast on minion
  },
});

// 21. [Card #61] 115637 - Inferno Herald
defineCardBehavior('115637', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (_ctx) => {
    // Passive triggered after casting Fire spell
  },
});

// 22. [Card #64] 123507 - Surge Needle
defineCardBehavior('123507', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (_ctx) => {
    // Battlecry aura
  },
});

// 23. [Card #68] 129798 - Astral Mediator
defineCardBehavior('129798', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    const s = getRandomSpellOfCost(3, ctx.rng);
    ctx.addCardToHand(s);
  },
});

// 24. [Card #69] 119524 - Azure Queen Sindragosa
defineCardBehavior('119524', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (_ctx) => {
    // Passive aura reducing Arcane spell costs
  },
});

// 25. [Card #78] 126253 - Tricksy Improviser
defineCardBehavior('126253', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    const s1 = getRandomSpell('secret', ctx.rng);
    const s2 = getRandomSpell('secret', ctx.rng);
    ctx.registerSecret(s1);
    ctx.registerSecret(s2);
  },
});

// 26. [Card #79] 114292 - Wisprider
defineCardBehavior('114292', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    ctx.dealDamage(ctx.opponentId, 1);
  },
});

// 27. [Card #80] 132671 - Arrival of the Titans
defineCardBehavior('132671', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    ctx.drawCards(2);
    const hero = ctx.state[ctx.ownerId];
    hero.mana = Math.min(hero.maxMana, hero.mana + 6);
  },
});

// 28. [Card #83] 123514 - The Arcanomicon
defineCardBehavior('123514', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    for (const leyline of LEYLINES_POOL) {
      ctx.addCardToHand(leyline);
    }
  },
});

// 29. [Card #84] 117956 - Titanographer Osk
defineCardBehavior('117956', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (_ctx) => {
    // Passive Titan ability rotation
  },
});

// 30. [Card #86] 120426 - Archmage Antonidas
defineCardBehavior('120426', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (_ctx) => {
    // Passive aura adding Fireball on spell cast
  },
});
