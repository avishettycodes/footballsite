/**
 * localStorage that cannot throw.
 *
 * Safari private mode, blocked site data and headless test runs all make
 * `localStorage` either missing or a getter that raises on access. This wrapper falls
 * back to an in-memory map so the caller keeps working, and whatever it was holding
 * simply does not survive a reload rather than taking the app down with it.
 *
 * The run autosave and the hall both come through here, so they behave the same way
 * when storage is unavailable. They are deliberately separate KEYS though: abandoning a
 * run wipes the run and must not touch anybody's saved players.
 */
const memory = new Map<string, string>();

export const safeStorage = {
  getItem: (name: string) => {
    try { return globalThis.localStorage?.getItem(name) ?? memory.get(name) ?? null; }
    catch { return memory.get(name) ?? null; }
  },
  setItem: (name: string, value: string) => {
    memory.set(name, value);
    try { globalThis.localStorage?.setItem(name, value); } catch { /* quota or blocked */ }
  },
  removeItem: (name: string) => {
    memory.delete(name);
    try { globalThis.localStorage?.removeItem(name); } catch { /* blocked */ }
  },
};

/**
 * Reads JSON, and returns the fallback rather than throwing on anything it does not
 * like. Hand-edited storage, a half-written value and a schema from an older build all
 * land here, and none of them are worth a white screen on the start page.
 */
export function readJSON<T>(key: string, fallback: T): T {
  const raw = safeStorage.getItem(key);
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed == null ? fallback : (parsed as T);
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  try { safeStorage.setItem(key, JSON.stringify(value)); } catch { /* nothing worth doing */ }
}
