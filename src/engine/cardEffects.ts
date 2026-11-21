import type { CardDefinition, Keyword } from './types.ts';
import { getCardBehavior } from './cards/registry.ts';

export interface ResolvedEffect {
  needsTarget: boolean;
  targetType: 'ANY' | 'ENEMY_MINION' | 'ANY_MINION' | 'ENEMY_CHAR' | 'FRIENDLY_CHAR' | 'FRIENDLY_MINION' | 'NONE';
  damage?: number;
  aoeDamage?: { target: 'ENEMY_MINIONS' | 'ALL_MINIONS' | 'ALL_CHARACTERS'; amount: number };
  splitDamage?: { count: number; target: 'ALL_ENEMIES' };
  heal?: number;
  armor?: number;
  drawCards?: number;
  freeze?: boolean;
  manaGain?: number;
  tokensToSummon?: Array<{ id: string; name: string; attack: number; health: number; keywords: Keyword[] }>;
  transformTarget?: { name: string; attack: number; health: number; text: string };
  isSecret?: boolean;
  isDiscover?: boolean;
  spellDamageBonus?: number;
  customDescription: string;
}

/**
 * Deterministic card effect parser and resolver for all Mage cards + The Coin.
 * Extracts combat, spell, and battlecry rules from card text and definition.
 */
export function resolveCardEffect(card: CardDefinition | { name: string; text?: string; cost: number; type: string; id?: string; definitionId?: string }): ResolvedEffect {
  const text = (card.text || '').toLowerCase();
  const name = card.name.toLowerCase();

  // Explicit overrides for Mage cards with custom or non-heuristic targeting behaviors
  if (name.includes("constellar's calling")) {
    return {
      needsTarget: true,
      targetType: 'FRIENDLY_MINION',
      customDescription: 'Choose a friendly minion. Summon a random minion of the same Cost.',
    };
  }
  if (name.includes('arcane flow')) {
    return {
      needsTarget: true,
      targetType: 'ANY',
      damage: 4,
      customDescription: 'Deal 4 damage to any character.',
    };
  }
  if (name.includes('arcane barrage')) {
    return {
      needsTarget: true,
      targetType: 'ENEMY_CHAR',
      damage: 3,
      customDescription: 'Deal 3 damage to an enemy.',
    };
  }
  if (name.includes('sheep mask')) {
    return {
      needsTarget: true,
      targetType: 'ANY_MINION',
      transformTarget: { name: 'Sheep', attack: 1, health: 1, text: 'Deathrattle: Deal 2 damage to all minions.' },
      customDescription: 'Transform a minion into a 1/1 Explosive Sheep.',
    };
  }
  if (name.includes('bitter end')) {
    return {
      needsTarget: true,
      targetType: 'ANY_MINION',
      damage: 5,
      freeze: true,
      customDescription: 'Freeze a minion and deal 5 damage to it.',
    };
  }
  if (name.includes('tribute dance')) {
    return {
      needsTarget: true,
      targetType: 'ANY_MINION',
      customDescription: 'Destroy a minion. Summon random minions of each Cost.',
    };
  }
  if (name.includes('spire security')) {
    return {
      needsTarget: true,
      targetType: 'ENEMY_CHAR',
      damage: 2,
      customDescription: 'Battlecry: Deal 2 damage to an enemy.',
    };
  }
  if (name.includes('temporal construct')) {
    return {
      needsTarget: true,
      targetType: 'ENEMY_MINION',
      damage: 5,
      customDescription: 'Battlecry: Deal 5 damage to an enemy minion. Excess damage draws cards.',
    };
  }
  if (name.includes('scorching winds')) {
    return {
      needsTarget: false,
      targetType: 'NONE',
      aoeDamage: { target: 'ALL_MINIONS', amount: 3 },
      customDescription: 'Deal AoE damage to all minions.',
    };
  }
  if (name.includes('starsurge')) {
    return {
      needsTarget: false,
      targetType: 'ANY',
      customDescription: 'Deal 4 damage or 2 damage to all enemy minions.',
    };
  }
  if (name.includes('storage scuffle')) {
    return {
      needsTarget: false,
      targetType: 'NONE',
      isDiscover: true,
      customDescription: 'Discover a minion.',
    };
  }
  if (name.includes('astral rain')) {
    return {
      needsTarget: false,
      targetType: 'NONE',
      customDescription: 'Deal 2 damage to random enemy minions 5 times.',
    };
  }
  if (name.includes('bursting leyline')) {
    return {
      needsTarget: false,
      targetType: 'NONE',
      customDescription: 'Deal 4 damage to a random enemy minion and excess to enemy hero.',
    };
  }
  if (name.includes("spellweaver's brilliance")) {
    return {
      needsTarget: false,
      targetType: 'NONE',
      customDescription: 'Summon a 6/6 Dragon.',
    };
  }
  if (name.includes('unstable spellcaster')) {
    return {
      needsTarget: false,
      targetType: 'NONE',
      customDescription: 'Battlecry: If you dealt damage with a spell this turn, summon a copy of this.',
    };
  }
  if (name.includes('aessina')) {
    return {
      needsTarget: false,
      targetType: 'NONE',
      customDescription: 'Battlecry: If 20 friendly minions died, deal 20 damage split among all enemies.',
    };
  }

  // If card has an authoritative registered behavior with explicit targeting, respect it
  const cardId = (card as any).definitionId || (card as any).id;
  const registeredBehavior = cardId ? getCardBehavior(cardId) : undefined;
  if (registeredBehavior && registeredBehavior.needsTarget !== undefined && registeredBehavior.targetType) {
    return {
      needsTarget: registeredBehavior.needsTarget,
      targetType: registeredBehavior.targetType,
      customDescription: card.name,
    };
  }

  // The Coin
  if (name === 'the coin' || card.name === 'The Coin') {
    return {
      needsTarget: false,
      targetType: 'NONE',
      manaGain: 1,
      customDescription: 'Gain 1 Mana Crystal this turn only.',
    };
  }

  // Minions without active battlecry / spells that need target
  if (card.type === 'MINION') {
    const hasBattlecry = text.includes('battlecry');
    const hasDiscover = text.includes('discover');
    const spellDmgMatch = text.match(/spell damage \+(\d+)/);
    const spellDmg = spellDmgMatch ? parseInt(spellDmgMatch[1], 10) : 0;

    if (!hasBattlecry) {
      return {
        needsTarget: false,
        targetType: 'NONE',
        spellDamageBonus: spellDmg,
        customDescription: spellDmg ? `Spell Damage +${spellDmg}` : 'Summon Minion',
      };
    }

    // Minion with Battlecry
    if (text.includes('deal') && text.includes('damage')) {
      const dmgMatch = text.match(/deal (\d+) damage/);
      const dmg = dmgMatch ? parseInt(dmgMatch[1], 10) : 1;
      const targetType = text.includes('to a minion') ? 'ANY_MINION' : 'ANY';
      return {
        needsTarget: true,
        targetType,
        damage: dmg,
        customDescription: `Battlecry: Deal ${dmg} damage`,
      };
    }

    if (text.includes('freeze')) {
      return {
        needsTarget: true,
        targetType: text.includes('enemy') ? 'ENEMY_CHAR' : 'ANY',
        freeze: true,
        customDescription: 'Battlecry: Freeze target',
      };
    }

    if (text.includes('draw')) {
      const drawMatch = text.match(/draw (\d+) card/);
      const count = drawMatch ? parseInt(drawMatch[1], 10) : 1;
      return {
        needsTarget: false,
        targetType: 'NONE',
        drawCards: count,
        customDescription: `Battlecry: Draw ${count} card${count > 1 ? 's' : ''}`,
      };
    }

    if (hasDiscover) {
      return {
        needsTarget: false,
        targetType: 'NONE',
        isDiscover: true,
        customDescription: 'Battlecry: Discover a card',
      };
    }

    return {
      needsTarget: false,
      targetType: 'NONE',
      customDescription: 'Battlecry effect',
    };
  }

  // SPELL Cards
  if (card.type === 'SPELL') {
    // Secret
    if (text.includes('secret:')) {
      return {
        needsTarget: false,
        targetType: 'NONE',
        isSecret: true,
        armor: text.includes('armor') ? 8 : 0,
        customDescription: 'Secret: Prepares a hidden countermeasure',
      };
    }

    // Direct targeted damage spells
    // Fireball (Deal 6 damage), Frostbolt (Deal 3 damage to a character and Freeze it), etc.
    if (name === 'fireball' || text.includes('deal 6 damage')) {
      return {
        needsTarget: true,
        targetType: 'ANY',
        damage: 6,
        customDescription: 'Deal 6 damage.',
      };
    }

    if (name === 'frostbolt' || (text.includes('deal 3 damage') && text.includes('freeze'))) {
      return {
        needsTarget: true,
        targetType: 'ANY',
        damage: 3,
        freeze: true,
        customDescription: 'Deal 3 damage to a character and Freeze it.',
      };
    }

    if (name === 'first flame' || (text.includes('deal 2 damage to a minion') && text.includes('second flame'))) {
      return {
        needsTarget: true,
        targetType: 'ANY_MINION',
        damage: 2,
        customDescription: 'Deal 2 damage to a minion. Add Second Flame to hand.',
      };
    }

    if (name === 'polymorph' || text.includes('transform a minion into a 1/1 sheep')) {
      return {
        needsTarget: true,
        targetType: 'ANY_MINION',
        transformTarget: { name: 'Sheep', attack: 1, health: 1, text: '' },
        customDescription: 'Transform a minion into a 1/1 Sheep.',
      };
    }

    // AoE Spells
    if (name === 'flamestrike' || text.includes('deal 5 damage to all enemy minions') || text.includes('deal 4 damage to all enemy minions')) {
      const dmgMatch = text.match(/deal (\d+) damage to all enemy minions/);
      const dmg = dmgMatch ? parseInt(dmgMatch[1], 10) : 5;
      return {
        needsTarget: false,
        targetType: 'NONE',
        aoeDamage: { target: 'ENEMY_MINIONS', amount: dmg },
        customDescription: `Deal ${dmg} damage to all enemy minions.`,
      };
    }

    if (name === 'blizzard' || (text.includes('deal 2 damage to all enemy minions and freeze them'))) {
      return {
        needsTarget: false,
        targetType: 'NONE',
        aoeDamage: { target: 'ENEMY_MINIONS', amount: 2 },
        freeze: true,
        customDescription: 'Deal 2 damage to all enemy minions and Freeze them.',
      };
    }

    if (name === 'arcane explosion' || text.includes('deal 1 damage to all enemy minions') || text.includes('deal 2 damage to all enemy minions')) {
      const dmgMatch = text.match(/deal (\d+) damage to all enemy minions/);
      const dmg = dmgMatch ? parseInt(dmgMatch[1], 10) : 1;
      return {
        needsTarget: false,
        targetType: 'NONE',
        aoeDamage: { target: 'ENEMY_MINIONS', amount: dmg },
        customDescription: `Deal ${dmg} damage to all enemy minions.`,
      };
    }

    // Arcane Missiles: Deal 3 damage randomly split among all enemies
    if (name === 'arcane missiles' || text.includes('split among all enemies')) {
      const countMatch = text.match(/deal (\d+) damage randomly split/);
      const count = countMatch ? parseInt(countMatch[1], 10) : 3;
      return {
        needsTarget: false,
        targetType: 'NONE',
        splitDamage: { count, target: 'ALL_ENEMIES' },
        customDescription: `Deal ${count} damage randomly split among all enemies.`,
      };
    }

    // Draw Spells
    if (name === 'arcane intellect' || text.includes('draw 2 cards')) {
      return {
        needsTarget: false,
        targetType: 'NONE',
        drawCards: 2,
        customDescription: 'Draw 2 cards.',
      };
    }

    if (text.includes('draw 3 cards')) {
      return {
        needsTarget: false,
        targetType: 'NONE',
        drawCards: 3,
        customDescription: 'Draw 3 cards.',
      };
    }

    if (text.includes('draw a card') || text.includes('draw 1 card')) {
      return {
        needsTarget: false,
        targetType: 'NONE',
        drawCards: 1,
        customDescription: 'Draw 1 card.',
      };
    }

    // Summon Spells
    if (name === 'mirror image' || text.includes('summon two 0/2 minions with taunt')) {
      return {
        needsTarget: false,
        targetType: 'NONE',
        tokensToSummon: [
          { id: 'token-mirror-1', name: 'Mirror Image', attack: 0, health: 2, keywords: ['TAUNT'] },
          { id: 'token-mirror-2', name: 'Mirror Image', attack: 0, health: 2, keywords: ['TAUNT'] },
        ],
        customDescription: 'Summon two 0/2 minions with Taunt.',
      };
    }

    if (text.includes('summon a 0/4 minion with taunt')) {
      return {
        needsTarget: false,
        targetType: 'NONE',
        tokensToSummon: [
          { id: 'token-mirror-dim', name: 'Mirror Defender', attack: 0, health: 4, keywords: ['TAUNT'] },
        ],
        customDescription: 'Summon a 0/4 minion with Taunt.',
      };
    }

    // Generic Targeted Damage Spell
    if (text.includes('deal') && text.includes('damage') && !text.includes('all')) {
      const dmgMatch = text.match(/deal (\d+) damage/);
      const dmg = dmgMatch ? parseInt(dmgMatch[1], 10) : 2;
      const targetType = text.includes('to a minion') ? 'ANY_MINION' : 'ANY';
      return {
        needsTarget: true,
        targetType,
        damage: dmg,
        freeze: text.includes('freeze'),
        customDescription: `Deal ${dmg} damage${text.includes('freeze') ? ' and Freeze' : ''}.`,
      };
    }

    // Freeze single enemy
    if (text.includes('freeze') && text.includes('enemy')) {
      return {
        needsTarget: true,
        targetType: 'ENEMY_CHAR',
        freeze: true,
        drawCards: text.includes('draw') ? 1 : 0,
        customDescription: 'Freeze an enemy character.',
      };
    }

    // Generic discover or spell generation
    return {
      needsTarget: false,
      targetType: 'NONE',
      isDiscover: text.includes('discover'),
      drawCards: text.includes('add') ? 1 : 0,
      customDescription: 'Cast Spell',
    };
  }

  // Fallback for locations, weapons, heroes
  return {
    needsTarget: false,
    targetType: 'NONE',
    customDescription: card.name,
  };
}
