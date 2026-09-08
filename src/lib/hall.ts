import type { AttributeKey, Era, Position } from '../data';
import type { CareerResult } from './scoring';
import { readJSON, writeJSON } from './storage';

/**
 * THE HALL OF BUILDS. Players you named, kept across sessions.
 *
 * A run is disposable by design: QUIT deletes it, and BUILD ANOTHER PLAYER deletes it
 * too. That is correct for a run and it was wrong for the player at the end of one,
 * because naming him is the moment somebody decides he was worth keeping. So naming is
 * the save. Type a name on the report and he is in here; clear it again and he is out.
 *
 * This lives under its OWN storage key, separate from the run autosave. Abandoning a run
 * must never take somebody's saved players with it, and the two have completely
 * different lifetimes.
 */

/**
 * One stolen attribute, credited. Structurally the same as the store's `FilledSlot`,
 * declared here so the hall does not have to import the store and the store does not
 * have to import itself back. A saved player is a frozen record, not a live run.
 */
export type HallSlot = {
  attribute: AttributeKey;
  value: number;
  playerId: string;
  playerName: string;
  teamId: string;
};

export type SavedPlayer = {
  /** The runId he was built in. Renaming updates this record rather than adding one. */
  id: string;
  name: string;
  position: Position;
  hardMode: boolean;
  /**
   * Which league he was built out of. OPTIONAL, because players saved before the second
   * dataset existed do not carry it and every one of them was an all-time build. Read it
   * through `savedEra` below rather than directly, so an old entry cannot re-open with an
   * undefined league and score itself against pools that do not exist.
   */
  era?: Era;
  seed: string;
  savedAt: number;
  /** Pick order, which is the only thing that knows which franchise drafted him. */
  pickOrder: AttributeKey[];
  slots: Partial<Record<AttributeKey, HallSlot>>;
  /**
   * The whole frozen career, so reopening the report shows exactly what it showed on
   * the day. Overall and the accolades both live in here, and deriving them again from
   * the build would risk a saved player quietly re-rating himself after a calibration
   * change. He got what he got.
   */
  career: CareerResult;
};

/** An entry from before the current pools landed was an all-time build by definition. */
export function savedEra(player: SavedPlayer): Era {
  return player.era ?? 'alltime';
}

export const HALL_KEY = 'megatron.hall.v1';

/**
 * Old entries fall off the end. Twenty is enough to keep a favourite around for weeks
 * and small enough that the start screen stays a start screen.
 */
export const HALL_LIMIT = 20;

/** Anything that does not look like a saved player is dropped rather than rendered. */
function isSavedPlayer(value: unknown): value is SavedPlayer {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<SavedPlayer>;
  return typeof v.id === 'string'
    && typeof v.name === 'string'
    && typeof v.position === 'string'
    && typeof v.seed === 'string'
    && typeof v.savedAt === 'number'
    && Array.isArray(v.pickOrder)
    && !!v.slots && typeof v.slots === 'object'
    && !!v.career && typeof v.career === 'object'
    && typeof (v.career as CareerResult).overall === 'number';
}

export function loadHall(): SavedPlayer[] {
  const raw = readJSON<unknown>(HALL_KEY, []);
  if (!Array.isArray(raw)) return [];
  return raw.filter(isSavedPlayer).sort((a, b) => b.savedAt - a.savedAt).slice(0, HALL_LIMIT);
}

/** Upsert by runId, newest first, capped. Returns the list as it now stands. */
export function saveToHall(entry: SavedPlayer): SavedPlayer[] {
  const next = [entry, ...loadHall().filter((p) => p.id !== entry.id)].slice(0, HALL_LIMIT);
  writeJSON(HALL_KEY, next);
  return next;
}

export function removeFromHall(id: string): SavedPlayer[] {
  const next = loadHall().filter((p) => p.id !== id);
  writeJSON(HALL_KEY, next);
  return next;
}
