/**
 * Deterministic Seeded Pseudo-Random Number Generator (PRNG)
 * Mulberry32 implementation for reproducible Hearthstone mechanics,
 * random targeting, deck shuffling, and headless verification.
 */

export interface Rng {
  /** Return next float in [0, 1) */
  next(): number;
  /** Return next integer in [min, max] inclusive */
  nextInt(min: number, max: number): number;
  /** Pick a random element from a non-empty array */
  pick<T>(arr: T[]): T;
  /** Shuffle array in-place (or return shuffled copy) using Fisher-Yates */
  shuffle<T>(arr: T[]): T[];
  /** Get current internal 32-bit state */
  getState(): number;
  /** Restore internal 32-bit state */
  setState(state: number): void;
}

/**
 * Canonical Mulberry32 32-bit PRNG generator.
 * Produces uniform 32-bit floating-point numbers in [0, 1).
 */
export function mulberry32(seed: number): () => number {
  let state = seed | 0;
  return function (): number {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Creates an authoritative Rng instance seeded deterministically.
 * If no seed is passed, initializes from a timestamp-derived 32-bit integer.
 */
export function createRng(initialSeed?: number): Rng {
  let s = (initialSeed !== undefined ? initialSeed : (Date.now() ^ (Math.random() * 0x100000000))) | 0;

  const next = (): number => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    next,
    nextInt(min: number, max: number): number {
      const low = Math.ceil(min);
      const high = Math.floor(max);
      if (low >= high) return low;
      return Math.floor(next() * (high - low + 1)) + low;
    },
    pick<T>(arr: T[]): T {
      if (arr.length === 0) {
        throw new Error('Cannot pick from empty array');
      }
      const index = Math.floor(next() * arr.length);
      return arr[index];
    },
    shuffle<T>(arr: T[]): T[] {
      const result = [...arr];
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
      return result;
    },
    getState(): number {
      return s;
    },
    setState(state: number): void {
      s = state | 0;
    },
  };
}
