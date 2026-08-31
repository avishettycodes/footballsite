import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ATTRIBUTE_SETS, TEAMS, getPool } from '../data';
import type { AttributeKey, Player, Position } from '../data';
import { hashSeed, makeSeed, nextPick, seedFromUrl } from '../lib/rng';
import { simulateCareer } from '../lib/scoring';
import type { CareerResult } from '../lib/scoring';

/**
 * Autosave storage. Falls back to memory when localStorage is missing or throws —
 * Safari private mode, blocked site data, and headless test runs all hit this.
 * The run just doesn't survive a reload there, instead of the store screaming.
 */
const memory = new Map<string, string>();
const safeStorage = {
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

export const REROLLS_NORMAL = 3;
export const REROLLS_HARD = 0;

export type FilledSlot = {
  attribute: AttributeKey;
  value: number;
  playerId: string;
  playerName: string;
  teamId: string;
};

export type Phase =
  /** No run in progress — position select screen. */
  | 'setup'
  /** Ready to pull the lever. */
  | 'ready'
  /** Reel is moving; the landing team is already decided. */
  | 'spinning'
  /** Landed on a franchise, browsing the pool. */
  | 'picking'
  /** Every slot filled, career not yet simulated. */
  | 'complete'
  /** Career simulated; the result is frozen in state. */
  | 'results'
  /** Should be unreachable — see the deadlock rule below. */
  | 'stuck';

export type RunState = {
  runId: string;
  seed: string;
  /** Serializable PRNG cursor. This is what makes a run replayable and resumable. */
  rngState: number;
  position: Position;
  hardMode: boolean;
  slots: Partial<Record<AttributeKey, FilledSlot>>;
  /** Pick order, for the results card narrative. */
  pickOrder: AttributeKey[];
  usedPlayerIds: string[];
  visitedTeamIds: string[];
  rerollsLeft: number;
  phase: Phase;
  /** Franchise the reel is heading to / has landed on. */
  currentTeamId: string | null;
  /** Increments per spin so the reel component knows to re-animate. */
  spinNonce: number;
  /** Set when a spin hit an exhausted pool and the game gave the spin back. */
  lastEventMessage: string | null;
  startedAt: number;
  /** What you named your creation. */
  creationName: string;
  /**
   * Frozen career outcome, including the Super Bowl result. Written ONCE by
   * runSimulation() and then read-only. See the note on that action.
   */
  career: CareerResult | null;
};

type GameStore = RunState & {
  soundOn: boolean;
  /** Not persisted — a rehydrated run waits on the start screen until you opt in. */
  entered: boolean;
  toggleSound: () => void;
  resumeRun: () => void;

  startRun: (opts: { position: Position; hardMode: boolean; seed?: string }) => void;
  spin: () => void;
  landSpin: () => void;
  reroll: () => void;
  takeAttribute: (playerId: string, attribute: AttributeKey) => void;
  runSimulation: () => void;
  setCreationName: (name: string) => void;
  abandonRun: () => void;
  clearEvent: () => void;

  // selectors
  remainingSlots: () => AttributeKey[];
  isPlayerUsed: (playerId: string) => boolean;
  currentPool: () => Player[];
  hasSavedRun: () => boolean;
};

const emptyRun = (): RunState => ({
  runId: '',
  seed: '',
  rngState: 0,
  position: 'RB',
  hardMode: false,
  slots: {},
  pickOrder: [],
  usedPlayerIds: [],
  visitedTeamIds: [],
  rerollsLeft: REROLLS_NORMAL,
  phase: 'setup',
  currentTeamId: null,
  spinNonce: 0,
  lastEventMessage: null,
  startedAt: 0,
  creationName: '',
  career: null,
});

/**
 * DEADLOCK RULE
 * -------------
 * Two constraints can strand a run: a player may be used once, and a slot may be
 * filled once. If the reel lands on a franchise whose entire pool is already spent,
 * there is nothing legal to take and the run would be dead.
 *
 * The rule:
 *   1. Hard mode excludes already-visited franchises from the reel up front. That is
 *      a stated rule of the mode, so those panels are visibly greyed out rather than
 *      being a surprise.
 *   2. If the landing franchise's pool is exhausted (every player already used), the
 *      game announces it and respins for FREE — it does not cost a reroll.
 *   3. Otherwise you must take something. Not liking the pool is not a deadlock, it
 *      is the game. Escaping a live pool costs one of your rerolls.
 *
 * With 7–9 players per pool and at most 8 picks per run, case 2 requires landing on
 * the same franchise 8+ times. It is nearly unreachable, which is exactly why it gets
 * handled here instead of being discovered at 3am.
 */
function drawTeam(state: RunState): { teamId: string | null; rngState: number; freeRespin: boolean } {
  const { position, hardMode, usedPlayerIds, visitedTeamIds } = state;

  const hasUnused = (teamId: string) =>
    getPool(position, teamId).some((p) => !usedPlayerIds.includes(p.id));

  const allowed = TEAMS.filter((t) => !(hardMode && visitedTeamIds.includes(t.id))).map((t) => t.id);
  const eligible = allowed.filter(hasUnused);

  if (eligible.length === 0) return { teamId: null, rngState: state.rngState, freeRespin: false };

  const first = nextPick(state.rngState, allowed);
  if (hasUnused(first.value)) {
    return { teamId: first.value, rngState: first.state, freeRespin: false };
  }

  // Exhausted pool — respin from eligible franchises only, at no cost.
  const retry = nextPick(first.state, eligible);
  return { teamId: retry.value, rngState: retry.state, freeRespin: true };
}

export const useGame = create<GameStore>()(
  persist(
    (set, get) => ({
      ...emptyRun(),
      soundOn: true,
      entered: false,

      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
      resumeRun: () => set({ entered: true }),

      startRun: ({ position, hardMode, seed }) => {
        const finalSeed = seed || seedFromUrl() || makeSeed();
        set({
          ...emptyRun(),
          runId: `${Date.now().toString(36)}-${finalSeed}`,
          seed: finalSeed,
          rngState: hashSeed(finalSeed),
          position,
          hardMode,
          rerollsLeft: hardMode ? REROLLS_HARD : REROLLS_NORMAL,
          phase: 'ready',
          startedAt: Date.now(),
          entered: true,
        });
      },

      spin: () => {
        const state = get();
        if (state.phase !== 'ready') return;

        const { teamId, rngState, freeRespin } = drawTeam(state);
        if (!teamId) {
          set({
            phase: 'stuck',
            lastEventMessage: 'Every roster is picked clean, which really should not be possible. Sorry.',
          });
          return;
        }

        set({
          rngState,
          currentTeamId: teamId,
          phase: 'spinning',
          spinNonce: state.spinNonce + 1,
          lastEventMessage: freeRespin
            ? 'Nobody was left on that roster, so you got that spin back for free.'
            : null,
        });
      },

      /** Called by the reel when the animation finishes. */
      landSpin: () => {
        const state = get();
        if (state.phase !== 'spinning' || !state.currentTeamId) return;
        set({
          phase: 'picking',
          visitedTeamIds: state.visitedTeamIds.includes(state.currentTeamId)
            ? state.visitedTeamIds
            : [...state.visitedTeamIds, state.currentTeamId],
        });
      },

      reroll: () => {
        const state = get();
        if (state.phase !== 'picking' || state.rerollsLeft <= 0) return;
        set({
          rerollsLeft: state.rerollsLeft - 1,
          phase: 'ready',
          currentTeamId: null,
          lastEventMessage: null,
        });
        get().spin();
      },

      takeAttribute: (playerId, attribute) => {
        const state = get();
        if (state.phase !== 'picking') return;
        if (state.usedPlayerIds.includes(playerId)) return;
        if (state.slots[attribute]) return;

        const player = getPool(state.position, state.currentTeamId ?? '').find((p) => p.id === playerId);
        if (!player) return;
        const value = player.attributes[attribute];
        if (typeof value !== 'number') return;

        const slots = {
          ...state.slots,
          [attribute]: {
            attribute,
            value,
            playerId: player.id,
            playerName: player.name,
            teamId: player.teamId,
          },
        };
        const filled = ATTRIBUTE_SETS[state.position].every((k) => slots[k]);

        set({
          slots,
          pickOrder: [...state.pickOrder, attribute],
          usedPlayerIds: [...state.usedPlayerIds, player.id],
          phase: filled ? 'complete' : 'ready',
          currentTeamId: filled ? state.currentTeamId : null,
          lastEventMessage: null,
        });
      },

      /**
       * Rolls the career ONCE and freezes the result in persisted state.
       *
       * This must never live in a useEffect on the results screen. StrictMode fires
       * effects twice in dev, which would consume two draws and desync dev from prod
       * for the same seed. Worse, a reload on the results screen would re-roll — so
       * anyone who lost a ring could refresh until they won one. Rolling here, guarded
       * on `career` already being set, makes the outcome final the moment it happens.
       */
      runSimulation: () => {
        const state = get();
        if (state.phase !== 'complete' || state.career) return;

        const build: Partial<Record<AttributeKey, number>> = {};
        for (const key of ATTRIBUTE_SETS[state.position]) {
          build[key] = state.slots[key]?.value ?? 0;
        }

        set({ career: simulateCareer(state.position, build, state.seed), phase: 'results' });
      },

      setCreationName: (name) => set({ creationName: name.slice(0, 28) }),

      abandonRun: () => set({ ...emptyRun(), entered: false }),
      clearEvent: () => set({ lastEventMessage: null }),

      remainingSlots: () => {
        const s = get();
        return ATTRIBUTE_SETS[s.position].filter((k) => !s.slots[k]);
      },
      isPlayerUsed: (playerId) => get().usedPlayerIds.includes(playerId),
      currentPool: () => {
        const s = get();
        return s.currentTeamId ? getPool(s.position, s.currentTeamId) : [];
      },
      hasSavedRun: () => {
        const s = get();
        return s.phase !== 'setup' && s.runId !== '';
      },
    }),
    {
      name: 'megatron.run.v1',
      storage: createJSONStorage(() => safeStorage),
      // Autosave the run itself; UI-only flags stay out except the sound preference.
      partialize: (s) => ({
        runId: s.runId, seed: s.seed, rngState: s.rngState, position: s.position,
        hardMode: s.hardMode, slots: s.slots, pickOrder: s.pickOrder,
        usedPlayerIds: s.usedPlayerIds, visitedTeamIds: s.visitedTeamIds,
        rerollsLeft: s.rerollsLeft, phase: s.phase, currentTeamId: s.currentTeamId,
        startedAt: s.startedAt, soundOn: s.soundOn,
        creationName: s.creationName, career: s.career,
      }),
      onRehydrateStorage: () => (state) => {
        // A reload mid-spin would otherwise resume into a reel that never lands.
        if (state && state.phase === 'spinning') state.phase = 'picking';
      },
    },
  ),
);
