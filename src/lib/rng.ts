/**
 * Every random event in Build a 99 comes through here — spins, tiebreaks, and the
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

/**
 * What people actually put in the seed box.
 *
 * A tester said seeds were broken. The generator was not: the same seed replays the
 * same wheel every time, and `npm run verify:rng` has always proved it. What broke was
 * the round trip through a phone. COPY SEED handed him a whole sentence with a link
 * buried in it, and normalizeSeed() politely turned that paste into
 * "SAMESEEDGIVESYOUTHESAMESPINSSOSE", a legal 32 character seed that plays a completely
 * different game. It looked accepted, so nothing on screen ever said otherwise.
 *
 * So the field now reads a paste the way a person means it. A link, a `?seed=` URL, or
 * a sentence with either one in it all come back as the seed they contain. Something
 * with no seed in it comes back empty and flagged, which is what lets the screen say so
 * instead of quietly playing somebody else's run.
 *
 * Typing is untouched. "my cool seed" is still a seed, because a short phrase with no
 * link in it is somebody naming their own run rather than pasting the wrong thing.
 */
export type SeedInput = {
  /** Empty when nothing seed-shaped could be found. */
  seed: string;
  /** True when the seed was dug out of a link or a sentence rather than typed. */
  recovered: boolean;
  /** True when this was clearly a paste of something that is not a seed. */
  junk: boolean;
};

/** The shape makeSeed() produces, e.g. GRIDIRON-7QX3. */
const SEED_SHAPE = /[A-Z]{3,12}-[A-Z0-9]{3,8}/i;

export function parseSeedInput(raw: string): SeedInput {
  const text = raw.trim();
  if (!text) return { seed: '', recovered: false, junk: false };

  const param = /(?:^|[?&])seed=([^&\s#]+)/i.exec(text);
  if (param) {
    // A hand-mangled %-escape is not worth throwing over. Take the raw text instead.
    let value = param[1];
    try { value = decodeURIComponent(value); } catch { /* keep it as typed */ }
    const seed = normalizeSeed(value);
    return { seed, recovered: true, junk: seed.length === 0 };
  }

  const pasted = /https?:\/\/|www\./i.test(text) || (text.length > 32 && /\s/.test(text));
  if (pasted) {
    const found = SEED_SHAPE.exec(text);
    if (found) return { seed: normalizeSeed(found[0]), recovered: true, junk: false };
    return { seed: '', recovered: false, junk: true };
  }

  return { seed: normalizeSeed(text), recovered: false, junk: false };
}
