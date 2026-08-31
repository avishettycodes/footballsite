/**
 * Every random event in MEGATRON comes through here — spins, tiebreaks, and the
 * Super Bowl roll. Nothing calls Math.random() in game logic. Ever.
 *
 * The generator is mulberry32, written as a PURE function of a uint32 state so
 * the state can live in the Zustand store, be serialized to localStorage, and be
 * replayed exactly from a `?seed=` URL. A closure-based PRNG cannot do any of that.
 */

export type Draw = { value: number; state: number };

/** One step of mulberry32. Returns the value in [0,1) and the next state. */
export function nextRandom(state: number): Draw {
  const a = (state + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return { value: ((t ^ (t >>> 14)) >>> 0) / 4294967296, state: a };
}

/** Integer in [0, max). */
export function nextInt(state: number, max: number): { value: number; state: number } {
  const draw = nextRandom(state);
  return { value: Math.floor(draw.value * max), state: draw.state };
}

/** Uniform pick from a non-empty array. */
export function nextPick<T>(state: number, items: readonly T[]): { value: T; state: number } {
  const draw = nextInt(state, items.length);
  return { value: items[draw.value], state: draw.state };
}

/** xmur3 — turns a seed string into a well-mixed uint32 starting state. */
export function hashSeed(seed: string): number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

// Skips I, O, 0 and 1, because people read these out loud to each other.
const SEED_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** A short shareable seed like "GRIDIRON-7QX3". */
export function makeSeed(): string {
  const words = ['BLITZ', 'GRIDIRON', 'HAILMARY', 'PYLON', 'AUDIBLE', 'SHOTGUN', 'REDZONE', 'TURF'];
  let out = words[Math.floor(Math.random() * words.length)] + '-';
  for (let i = 0; i < 4; i++) {
    out += SEED_ALPHABET[Math.floor(Math.random() * SEED_ALPHABET.length)];
  }
  return out;
}

/** Seeds are case- and punctuation-insensitive so they survive being texted around. */
export function normalizeSeed(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 32);
}

export function seedFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const raw = new URLSearchParams(window.location.search).get('seed');
  if (!raw) return null;
  const seed = normalizeSeed(raw);
  return seed.length ? seed : null;
}
