import type { CardDefinition, Keyword } from '../../engine/types.ts';

export type SpellSchool = 'FIRE' | 'FROST' | 'ARCANE' | 'SECRET' | 'BATTLECRY' | 'COMBAT';

export interface VisualEffectEvent {
  id: string;
  school: SpellSchool;
  cardName?: string;
  cardId?: string;
  sourceType?: 'SPELL' | 'MINION' | 'HERO_POWER' | 'ATTACK';
  isAoE?: boolean;
  startX: number;
  startY: number;
  targetX?: number;
  targetY?: number;
  targetId?: string;
  durationMs?: number;
  startedAt: number;
}

export interface CardClassificationResult {
  school: SpellSchool;
  isAoE: boolean;
}

/**
 * Classifies any card into its canonical spell school and effect pattern.
 */
export function classifyCardSchoolAndType(
  card: Partial<CardDefinition> & {
    name: string;
    text?: string;
    keywords?: Keyword[];
    type?: string;
    definitionId?: string;
  }
): CardClassificationResult {
  const name = (card.name || '').toLowerCase();
  const text = (card.text || '').toLowerCase();
  const keywords = card.keywords || [];
  const isMinion = card.type === 'MINION';

  // 1. Secret School
  if (keywords.includes('SECRET') || text.includes('secret:') || text.includes('<b>secret:</b>')) {
    return { school: 'SECRET', isAoE: false };
  }

  // 2. Minions
  if (isMinion) {
    if (name.includes('inferno') || name.includes('vulcanos') || name.includes('flame')) {
      return { school: 'FIRE', isAoE: false };
    }
    if (name.includes('water elemental') || name.includes('ice') || name.includes('frost')) {
      return { school: 'FROST', isAoE: false };
    }
    return { school: 'BATTLECRY', isAoE: false };
  }

  // 3. Frost School Spells (Evaluated before Fire to prevent shadow interception)
  const frostNameRegex = /\b(frost|freeze|frozen|ice|cold|sleet|blizzard|chill|glacial|hail|snow|shiver)/i;
  const frostTextRegex = /\b(freeze|frozen|frost spell)\b/i;
  if (keywords.includes('FREEZE') || frostNameRegex.test(name) || frostTextRegex.test(text)) {
    const isAoE =
      /all enemy|all minions|all characters/i.test(text) ||
      name.includes('blizzard') ||
      name.includes('foreboding freeze');
    return { school: 'FROST', isAoE };
  }

  // 4. Fire School Spells
  const fireNameRegex = /\b(fire|flame|pyro|burn|inferno|combustion|ignite|meteor|cinder|molten|lava|heat|scorch|blast|flamestrike)/i;
  const fireTextRegex = /fire spell|fire damage|deal .* fire damage/i;
  if (fireNameRegex.test(name) || fireTextRegex.test(text)) {
    const isAoE =
      /all enemy|all minions|all characters/i.test(text) ||
      name.includes('flamestrike') ||
      name.includes('scorching winds');
    return { school: 'FIRE', isAoE };
  }

  // 5. Arcane School Spells (Default for all Mage arcane magic and unclassified Mage spells)
  const isAoE =
    /all enemies|all enemy|split among|all characters/i.test(text) ||
    name.includes('astral rain') ||
    name.includes('arcane missiles') ||
    name.includes('arcane barrage');

  return { school: 'ARCANE', isAoE };
}

/**
 * Resolves starting and target screen coordinates for visual effect rendering.
 */
export function resolveEffectCoordinates(
  card: { definitionId?: string; type?: string; name?: string; text?: string; keywords?: Keyword[] },
  targetId?: string,
  overrideCoords?: { startX?: number; startY?: number; targetX?: number; targetY?: number }
): { startX: number; startY: number; targetX: number; targetY: number } {
  const w = typeof window !== 'undefined' ? window.innerWidth : 1440;
  const h = typeof window !== 'undefined' ? window.innerHeight : 900;

  // 1. Origin coords
  let startX = overrideCoords?.startX ?? w * 0.5;
  let startY = overrideCoords?.startY ?? h * 0.85;

  if (overrideCoords?.startX === undefined || overrideCoords?.startY === undefined) {
    if (typeof document !== 'undefined') {
      const cardEl =
        (card.definitionId && document.querySelector(`[data-card-id="${card.definitionId}"]`)) ||
        document.querySelector('[data-testid="hand-card"]');
      if (cardEl) {
        const rect = cardEl.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          startX = rect.left + rect.width / 2;
          startY = rect.top + rect.height / 2;
        }
      }
    }
  }

  // 2. Target coords
  let targetX = overrideCoords?.targetX ?? w * 0.5;
  let targetY = overrideCoords?.targetY ?? h * 0.35;

  const classification = classifyCardSchoolAndType(card as any);

  if (targetId) {
    if (targetId === 'opponent') {
      targetX = w * 0.5;
      targetY = h * 0.15;
      if (typeof document !== 'undefined') {
        const oppEl = document.querySelector('[data-testid="opponent-hero"]');
        if (oppEl) {
          const rect = oppEl.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            targetX = rect.left + rect.width / 2;
            targetY = rect.top + rect.height / 2;
          }
        }
      }
    } else if (targetId === 'player') {
      targetX = w * 0.25;
      targetY = h * 0.85;
      if (typeof document !== 'undefined') {
        const playerEl = document.querySelector('[data-testid="player-hero"]');
        if (playerEl) {
          const rect = playerEl.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            targetX = rect.left + rect.width / 2;
            targetY = rect.top + rect.height / 2;
          }
        }
      }
    } else if (typeof document !== 'undefined') {
      const minionEl =
        document.querySelector(`[data-target-id="${targetId}"]`) ||
        document.querySelector(`[data-minion-id="${targetId}"]`);
      if (minionEl) {
        const rect = minionEl.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          targetX = rect.left + rect.width / 2;
          targetY = rect.top + rect.height / 2;
        }
      }
    }
  } else {
    // Untargeted spells or minions
    if (classification.school === 'SECRET') {
      // Secret locks onto the player's secret medallion above player hero
      targetX = w * 0.25;
      targetY = h * 0.72;
      if (typeof document !== 'undefined') {
        const secretCrest = document.querySelector('[data-testid="active-secret-crest"]');
        const playerHero = document.querySelector('[data-testid="player-hero"]');
        const targetEl = secretCrest || playerHero;
        if (targetEl) {
          const rect = targetEl.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            targetX = rect.left + rect.width / 2;
            targetY = rect.top - 20;
          }
        }
      }
    } else if (classification.isAoE) {
      // AoE affects the enemy board
      targetX = w * 0.5;
      targetY = h * 0.35;
      if (typeof document !== 'undefined') {
        const enemyBoard = document.querySelector('[data-testid="opponent-board"]');
        if (enemyBoard) {
          const rect = enemyBoard.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            targetX = rect.left + rect.width / 2;
            targetY = rect.top + rect.height / 2;
          }
        }
      }
    } else if (card.type === 'MINION') {
      // Friendly board drop zone
      targetX = w * 0.5;
      targetY = h * 0.58;
      if (typeof document !== 'undefined') {
        const dropzone = document.querySelector('[data-testid="player-board-dropzone"]');
        if (dropzone) {
          const rect = dropzone.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            targetX = rect.left + rect.width / 2;
            targetY = rect.top + rect.height / 2;
          }
        }
      }
    } else {
      // Default untargeted spell (e.g. Arcane Intellect, Alter Time, The Coin)
      targetX = w * 0.5;
      targetY = h * 0.48;
    }
  }

  return { startX, startY, targetX, targetY };
}

/**
 * Resolves coordinates for Fireblast hero power targeting.
 */
export function resolveHeroPowerCoordinates(targetId?: string): {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
} {
  const w = typeof window !== 'undefined' ? window.innerWidth : 1440;
  const h = typeof window !== 'undefined' ? window.innerHeight : 900;

  let startX = w * 0.32;
  let startY = h * 0.88;
  if (typeof document !== 'undefined') {
    const hpBtn = document.querySelector('[data-testid="player-hero-power"]');
    if (hpBtn) {
      const rect = hpBtn.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        startX = rect.left + rect.width / 2;
        startY = rect.top + rect.height / 2;
      }
    }
  }

  const { targetX, targetY } = resolveEffectCoordinates({ type: 'SPELL', name: 'Fireblast' }, targetId);
  return { startX, startY, targetX, targetY };
}

/**
 * Resolves coordinates for minion combat lunges.
 */
export function resolveCombatCoordinates(
  attackerId: string,
  targetId: string
): { startX: number; startY: number; targetX: number; targetY: number } {
  const w = typeof window !== 'undefined' ? window.innerWidth : 1440;
  const h = typeof window !== 'undefined' ? window.innerHeight : 900;

  let startX = w * 0.5;
  let startY = h * 0.6;
  if (typeof document !== 'undefined') {
    const attackerEl = document.querySelector(`[data-target-id="${attackerId}"]`);
    if (attackerEl) {
      const rect = attackerEl.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        startX = rect.left + rect.width / 2;
        startY = rect.top + rect.height / 2;
      }
    }
  }

  const { targetX, targetY } = resolveEffectCoordinates({ type: 'MINION', name: 'Combat' }, targetId);
  return { startX, startY, targetX, targetY };
}
