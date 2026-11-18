import { defineCardBehavior } from '../registry.ts';
import { getRandomMinionOfCost, getRandomSpellOfCost } from '../tokenRegistry.ts';

// 1. [Card #4] 119541 - Mirror Dimension
defineCardBehavior('119541', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    const hasDragon = ctx.state[ctx.ownerId].hand.some(
      (c) => c.tribe?.toLowerCase() === 'dragon' || c.text?.toLowerCase().includes('dragon')
    );
    ctx.summonToken('token-mirror-dim', hasDragon ? 2 : 1);
  },
});

// 2. [Card #14] 129788 - Constellar's Calling
defineCardBehavior('129788', {
  needsTarget: true,
  targetType: 'FRIENDLY_MINION',
  execute: (ctx) => {
    if (ctx.targetId) {
      const target = ctx.state[ctx.ownerId].board.find((m) => m.instanceId === ctx.targetId);
      const cost = target ? target.cost : 2;
      const minion = getRandomMinionOfCost(cost, ctx.rng);
      ctx.summonToken(minion);
    }
  },
});

// 3. [Card #20] 126975 - Khadgar
defineCardBehavior('126975', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (_ctx) => {
    // Passive aura active on board, evaluated in summonToken
  },
});

// 4. [Card #36] 117535 - Conjured Bookkeeper
defineCardBehavior('117535', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    // Battlecry / Deathrattle: draws a spell
    ctx.drawCards(1);
  },
});

// 5. [Card #65] 123351 - Unstable Spellcaster
defineCardBehavior('123351', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    // Battlecry: summon a copy of this
    ctx.summonToken(ctx.card);
  },
});

// 6. [Card #66] 117531 - Windswept Pageturner
defineCardBehavior('117531', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (_ctx) => {
    // Passive triggered after summoning an Elemental
  },
});

// 7. [Card #71] 126111 - Bootleg Alchemist
defineCardBehavior('126111', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    const hand = ctx.state[ctx.ownerId].hand;
    if (hand.length > 0) {
      const targetCard = ctx.rng.pick(hand);
      const originalCost = targetCard.cost;
      const transformedSpell = getRandomSpellOfCost(originalCost + 5, ctx.rng);
      targetCard.name = transformedSpell.name;
      targetCard.type = 'SPELL';
      targetCard.text = transformedSpell.text;
      targetCard.cost = originalCost;
    }
  },
});

// 8. [Card #73] 123504 - Crystallized Leyline
defineCardBehavior('123504', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    const minion = getRandomMinionOfCost(6, ctx.rng);
    ctx.summonToken(minion);
  },
});

// 9. [Card #74] 129889 - Icebelt Magi
defineCardBehavior('129889', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    const handBefore = ctx.state[ctx.ownerId].hand.length;
    ctx.drawCards(2);
    const hand = ctx.state[ctx.ownerId].hand;
    const drawnCount = hand.length - handBefore;
    let nonMinions = 0;
    for (let i = 0; i < drawnCount; i++) {
      const card = hand[hand.length - 1 - i];
      if (card && card.type !== 'MINION') {
        nonMinions++;
      }
    }
    if (nonMinions > 0) {
      ctx.summonToken('token-water-elemental', nonMinions);
    }
  },
});

// 10. [Card #75] 126353 - Jailhouse Manastorm
defineCardBehavior('126353', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (_ctx) => {
    // Battlecry: aura registering spell trigger for game
  },
});

// 11. [Card #77] 118554 - Tribute Dance
defineCardBehavior('118554', {
  needsTarget: true,
  targetType: 'ANY_MINION',
  execute: (ctx) => {
    if (ctx.targetId) {
      const randomMinion = getRandomMinionOfCost(ctx.rng.nextInt(1, 6), ctx.rng);
      ctx.transformMinion(ctx.targetId, randomMinion);
    }
  },
});

// 12. [Card #85] 119691 - Anomalize
defineCardBehavior('119691', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    const m10 = getRandomMinionOfCost(10, ctx.rng);
    const m1 = getRandomMinionOfCost(1, ctx.rng);
    ctx.summonToken(m10);
    ctx.summonToken(m1);

    const board = ctx.state[ctx.ownerId].board;
    if (board.length >= 2) {
      const first = board[board.length - 2];
      const second = board[board.length - 1];
      const tempAttack = first.attack;
      first.attack = second.attack;
      second.attack = tempAttack;
    }
  },
});

// 13. [Card #87] 129846 - Astromancer
defineCardBehavior('129846', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    const handSize = ctx.state[ctx.ownerId].hand.length;
    const minion = getRandomMinionOfCost(handSize, ctx.rng);
    ctx.summonToken(minion);
  },
});

// 14. [Card #88] 126841 - Code Violet
defineCardBehavior('126841', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    const m8 = getRandomMinionOfCost(8, ctx.rng);
    ctx.summonToken(m8);
  },
});

// 15. [Card #96] 122454 - Spellweaver's Brilliance
defineCardBehavior('122454', {
  needsTarget: false,
  targetType: 'NONE',
  execute: (ctx) => {
    ctx.summonToken('token-dragon-6-6');
  },
});
