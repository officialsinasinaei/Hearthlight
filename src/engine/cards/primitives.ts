import type { CardDefinition, CardInstance, Keyword, ActiveSecretInstance } from '../types.ts';
import type { BattleState } from '../battleEngine.ts';
import { getSpellDamageBonus, createCardInstance } from '../battleEngine.ts';
import { createRng, type Rng } from '../rng.ts';
import type { BehaviorContext } from './types.ts';
import { TOKEN_CARDS, getTokenCard } from './tokenRegistry.ts';
import { MAGE_CARDS } from '../cards.ts';

const mageCardMap = new Map<string, CardDefinition>(MAGE_CARDS.map((c) => [c.id, c]));

export function createBehaviorContext(
  draft: BattleState,
  card: CardInstance,
  playerSide: 'player' | 'opponent',
  targetId?: string,
  boardIndex?: number
): BehaviorContext {
  const opponentSide: 'player' | 'opponent' = playerSide === 'player' ? 'opponent' : 'player';
  const rng: Rng = createRng(draft.rngState);
  const spellBonus = card.type === 'SPELL' ? getSpellDamageBonus(draft, playerSide) : 0;

  function resolveCardDef(tokenIdOrDef: string | CardDefinition | CardInstance): CardDefinition {
    if (typeof tokenIdOrDef === 'string') {
      const fromToken = getTokenCard(tokenIdOrDef);
      if (fromToken) return fromToken;
      const fromMage = mageCardMap.get(tokenIdOrDef);
      if (fromMage) return fromMage;
      return TOKEN_CARDS['token-wisp'];
    }
    if ('definitionId' in tokenIdOrDef) {
      const fromToken = getTokenCard(tokenIdOrDef.definitionId);
      if (fromToken) return fromToken;
      const fromMage = mageCardMap.get(tokenIdOrDef.definitionId);
      if (fromMage) return fromMage;
    }
    if ('id' in tokenIdOrDef) {
      return tokenIdOrDef;
    }
    return TOKEN_CARDS['token-wisp'];
  }

  function applyDamageToCharacter(charId: string, amount: number): void {
    if (amount <= 0) return;

    if (charId === 'player' || charId === 'opponent') {
      const hero = draft[charId];
      if (hero.armor >= amount) {
        hero.armor -= amount;
      } else {
        const remaining = amount - hero.armor;
        hero.armor = 0;
        hero.hp = Math.max(0, hero.hp - remaining);
      }
      return;
    }

    // Check player board
    for (const m of draft.player.board) {
      if (m.instanceId === charId) {
        if (m.hasDivineShield) {
          m.hasDivineShield = false;
        } else {
          m.health -= amount;
        }
        return;
      }
    }

    // Check opponent board
    for (const m of draft.opponent.board) {
      if (m.instanceId === charId) {
        if (m.hasDivineShield) {
          m.hasDivineShield = false;
        } else {
          m.health -= amount;
        }
        return;
      }
    }
  }

  const ctx: BehaviorContext = {
    card,
    ownerId: playerSide,
    opponentId: opponentSide,
    targetId,
    boardIndex,
    rng,
    state: draft,
    spellDamageBonus: spellBonus,

    dealDamage(target: string, amount: number): void {
      const totalAmount = card.type === 'SPELL' ? amount + spellBonus : amount;
      applyDamageToCharacter(target, totalAmount);
      // Lifesteal check
      if (card.keywords.includes('LIFESTEAL')) {
        const hero = draft[playerSide];
        hero.hp = Math.min(hero.maxHp, hero.hp + totalAmount);
      }
    },

    dealSplitDamage(totalDamage: number, targetType: 'ENEMIES' | 'ENEMY_MINIONS'): void {
      const missiles = card.type === 'SPELL' ? totalDamage + spellBonus : totalDamage;
      if (missiles <= 0) return;

      for (let i = 0; i < missiles; i++) {
        const potentialTargetIds: string[] = [];
        const enemyMinions = draft[opponentSide].board.filter((m) => m.health > 0);
        for (const m of enemyMinions) {
          potentialTargetIds.push(m.instanceId);
        }

        if (targetType === 'ENEMIES' && draft[opponentSide].hp > 0) {
          potentialTargetIds.push(opponentSide);
        }

        if (potentialTargetIds.length === 0) break;

        const chosenTarget = rng.pick(potentialTargetIds);
        applyDamageToCharacter(chosenTarget, 1);
        if (card.keywords.includes('LIFESTEAL')) {
          const hero = draft[playerSide];
          hero.hp = Math.min(hero.maxHp, hero.hp + 1);
        }
      }
    },

    dealAoeDamage(amount: number, targetType: 'ENEMY_MINIONS' | 'ALL_MINIONS' | 'ALL_CHARACTERS'): void {
      const totalAmount = card.type === 'SPELL' ? amount + spellBonus : amount;
      if (totalAmount <= 0) return;

      if (targetType === 'ENEMY_MINIONS' || targetType === 'ALL_MINIONS' || targetType === 'ALL_CHARACTERS') {
        for (const m of draft[opponentSide].board) {
          if (m.hasDivineShield) {
            m.hasDivineShield = false;
          } else {
            m.health -= totalAmount;
          }
        }
      }

      if (targetType === 'ALL_MINIONS' || targetType === 'ALL_CHARACTERS') {
        for (const m of draft[playerSide].board) {
          if (m.hasDivineShield) {
            m.hasDivineShield = false;
          } else {
            m.health -= totalAmount;
          }
        }
      }

      if (targetType === 'ALL_CHARACTERS') {
        applyDamageToCharacter(playerSide, totalAmount);
        applyDamageToCharacter(opponentSide, totalAmount);
      }
    },

    freeze(target: string): void {
      if (target === 'player' || target === 'opponent') {
        return;
      }
      for (const m of draft.player.board) {
        if (m.instanceId === target) {
          m.isFrozen = true;
          return;
        }
      }
      for (const m of draft.opponent.board) {
        if (m.instanceId === target) {
          m.isFrozen = true;
          return;
        }
      }
    },

    drawCards(count: number): void {
      const hero = draft[playerSide];
      for (let i = 0; i < count; i++) {
        if (hero.deck.length === 0) {
          hero.fatigueCounter = (hero.fatigueCounter || 0) + 1;
          const fatigueDmg = hero.fatigueCounter;
          if (hero.armor >= fatigueDmg) {
            hero.armor -= fatigueDmg;
          } else {
            const rem = fatigueDmg - hero.armor;
            hero.armor = 0;
            hero.hp = Math.max(0, hero.hp - rem);
          }
        } else {
          const drawn = hero.deck.shift()!;
          if (hero.hand.length < 10) {
            hero.hand.push(drawn);
          } else {
            hero.graveyard.push(drawn);
          }
        }
      }
    },

    summonToken(tokenIdOrDef: string | CardDefinition, count: number = 1, options?: { atIndex?: number }): void {
      const def = resolveCardDef(tokenIdOrDef);
      const hero = draft[playerSide];

      // Check Khadgar: doubles summon count
      const hasKhadgar = hero.board.some((m) => m.definitionId === '126975' || m.name.toLowerCase() === 'khadgar');
      const actualCount = hasKhadgar ? count * 2 : count;

      for (let i = 0; i < actualCount; i++) {
        if (hero.board.length >= 7) break; // 7-minion board cap

        const instance = createCardInstance(def, playerSide);
        const atIdx = options?.atIndex !== undefined
          ? Math.min(hero.board.length, Math.max(0, options.atIndex + i))
          : hero.board.length;

        hero.board.splice(atIdx, 0, instance);
      }
    },

    addCardToHand(cardOrToken: string | CardDefinition, options?: { costModifier?: number }): void {
      const def = resolveCardDef(cardOrToken);
      const hero = draft[playerSide];
      const instance = createCardInstance(def, playerSide);

      if (options?.costModifier !== undefined) {
        instance.cost = Math.max(0, instance.cost + options.costModifier);
      }

      if (hero.hand.length >= 10) {
        hero.graveyard.push(instance);
        return;
      }

      hero.hand.push(instance);
    },

    transformMinion(target: string, intoTokenIdOrDef: string | CardDefinition): void {
      const def = resolveCardDef(intoTokenIdOrDef);

      const transformInList = (board: CardInstance[]) => {
        const idx = board.findIndex((m) => m.instanceId === target);
        if (idx !== -1) {
          const old = board[idx];
          const newInst = createCardInstance(def, old.ownerId);
          newInst.instanceId = old.instanceId;
          newInst.isExhausted = old.isExhausted;
          board[idx] = newInst;
          return true;
        }
        return false;
      };

      if (!transformInList(draft.player.board)) {
        transformInList(draft.opponent.board);
      }
    },

    gainArmor(amount: number): void {
      draft[playerSide].armor += amount;
    },

    buffMinion(target: string, attackBuff: number, healthBuff: number, options?: { grantKeywords?: Keyword[] }): void {
      const applyBuff = (board: CardInstance[]) => {
        const m = board.find((minion) => minion.instanceId === target);
        if (m) {
          m.attack = Math.max(0, m.attack + attackBuff);
          m.health += healthBuff;
          m.maxHealth += healthBuff;
          if (options?.grantKeywords) {
            for (const kw of options.grantKeywords) {
              if (!m.keywords.includes(kw)) m.keywords.push(kw);
              if (kw === 'TAUNT') m.hasTaunt = true;
              if (kw === 'DIVINE_SHIELD') m.hasDivineShield = true;
              if (kw === 'STEALTH') m.hasStealth = true;
              if (kw === 'CHARGE') { m.hasCharge = true; m.canAttack = true; m.isExhausted = false; }
              if (kw === 'RUSH') { m.hasRush = true; m.canAttack = true; }
              if (kw === 'WINDFURY') m.hasWindfury = true;
            }
          }
          return true;
        }
        return false;
      };

      if (!applyBuff(draft.player.board)) {
        applyBuff(draft.opponent.board);
      }
    },

    discover(options: CardDefinition[]): void {
      draft.pendingChoice = {
        title: 'Discover a card',
        options: options.slice(0, 3),
        sourceCardId: card.definitionId,
        ownerId: playerSide,
      };
    },

    registerSecret(secretCard: CardDefinition | CardInstance | string): void {
      const def = resolveCardDef(secretCard);
      const hero = draft[playerSide];
      if (hero.secrets.length >= 5) return;
      if (hero.secrets.some((s) => s.definitionId === def.id || s.name === def.name)) return;

      const secretInstance: ActiveSecretInstance = {
        id: `secret_${Date.now()}_${rng.nextInt(1000, 9999)}`,
        definitionId: def.id,
        name: def.name,
        text: def.text,
        ownerId: playerSide,
      };
      hero.secrets.push(secretInstance);
    },
  };

  return ctx;
}
