import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ATTRIBUTE_SETS, TEAMS, getPool } from '../data';
import type { AttributeKey, Player, Position } from '../data';
import { hashSeed, makeSeed, nextPick } from '../lib/rng';
import { simulateCareer } from '../lib/scoring';
import type { CareerResult } from '../lib/scoring';
import { loadHall, removeFromHall, saveToHall } from '../lib/hall';
import type { SavedPlayer } from '../lib/hall';
import { safeStorage } from '../lib/storage';

/**
 * TWO REROLLS, NOT THREE AND NOT ONE.
 *
 * Three meant you could escape almost every pool you did not like and the wheel stopped
 * being a constraint. One went too far the other way: a run is seven spins now, and a
 * single reroll against seven landings is close enough to none that people played as if
 * they had none. Two lets you walk away from the two worst rosters of a run and still
 * live with the other five, which is the difference between getting out of trouble and
 * shopping until the pool suits you.
 *
 * This number is now load-bearing on every rate `npm run verify:scoring` prints, because
 * the policies there spend rerolls. It did not used to be, and that was the bug rather
 * than the feature. Changing it means re-reading that output.
 */
export const REROLLS_NORMAL = 2;
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
  /** True when the reel just put you back on a roster you have already raided. */
  repeatVisit: boolean;
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
  /**
   * Saved players, newest first. Lives under its own storage key rather than in this
   * store's persisted slice, because it outlives every run and must survive QUIT.
   */
  hall: SavedPlayer[];
  toggleSound: () => void;
  resumeRun: () => void;
  deleteSaved: (id: string) => void;

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
  repeatVisit: false,
  lastEventMessage: null,
  startedAt: 0,
  creationName: '',
  career: null,
});

/**
 * DEADLOCK RULE
 * -------------
 * Two constraints can strand a run: a player may be used once, and a slot may be filled
 * once. If the reel lands on a franchise whose entire pool is already spent, there is
 * nothing legal to take and the run would be dead.
 *
 * The rule:
 *   1. If the landing franchise's pool is exhausted (every player already used), the
 *      game announces it and respins for FREE. It does not cost a reroll, and the
 *      respin is drawn from the franchises that still have somebody left, so one retry
 *      is always enough.
 *   2. Otherwise you must take something. Not liking the pool is not a deadlock, it is
 *      the game. Escaping a live pool costs a reroll, and hard mode does not give you
 *      any.
 *
 * HARD MODE USED TO CARRY HALF OF THIS AND NO LONGER DOES. It excluded already-visited
 * franchises from the reel, which meant the exhausted-pool case was nearly unreachable:
 * you could not land on the same roster twice, so you could not drain one. Repeats are
 * now allowed in every mode, on purpose, because landing on the Browns twice and having
 * to live with it is the funnier game. That puts the whole weight of the no-strand
 * guarantee on rule 1 above, so it is worth being precise about why it holds.
 *
 * The thinnest pool in the game holds 7 players and a run makes exactly 7 picks, so
 * draining one means landing on the same short roster every single spin. It is reachable
 * rather than impossible, which is the point of testing it. It still cannot strand:
 * `eligible` is every franchise with an unused player, and rule 1 redraws from that set,
 * so the only way to fail is for all 32 pools to be empty at once. That needs 200-odd
 * picks in a 7-pick run. `npm run verify:run` fuzzes every position in both modes and
 * asserts it never happens.
 */
function drawTeam(state: RunState): { teamId: string | null; rngState: number; freeRespin: boolean } {
  const { position, usedPlayerIds } = state;

  const hasUnused = (teamId: string) =>
    getPool(position, teamId).some((p) => !usedPlayerIds.includes(p.id));

  // Every franchise is always in the wheel. Hard mode takes away your reroll and hides
  // the pool's ratings, and it has never crossed teams off, so a repeat is a legal and
  // frequently funny outcome.
  const allowed = TEAMS.map((t) => t.id);
  const eligible = allowed.filter(hasUnused);

  if (eligible.length === 0) return { teamId: null, rngState: state.rngState, freeRespin: false };

  const first = nextPick(state.rngState, allowed);
  if (hasUnused(first.value)) {
    return { teamId: first.value, rngState: first.state, freeRespin: false };
  }

  // Exhausted pool. Respin from franchises that still have somebody, at no cost.
  const retry = nextPick(first.state, eligible);
  return { teamId: retry.value, rngState: retry.state, freeRespin: true };
}

export const useGame = create<GameStore>()(
  persist(
    (set, get) => ({
      ...emptyRun(),
      soundOn: true,
      entered: false,
      hall: loadHall(),

      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
      resumeRun: () => set({ entered: true }),
      deleteSaved: (id) => set({ hall: removeFromHall(id) }),

      /**
       * The seed passed in is the only seed. It used to fall back to `?seed=` in the
       * URL when the field was empty, which meant clearing the box on somebody's seed
       * link replayed that same link anyway, forever, while the placeholder said
       * RANDOM. The start screen reads the URL for you and shows what it found, so an
       * empty field here means exactly what it looks like.
       */
      startRun: ({ position, hardMode, seed }) => {
        const finalSeed = seed || makeSeed();
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
          repeatVisit: false,
          lastEventMessage: freeRespin
            ? 'Nobody was left on that roster, so you got that spin back for free.'
            : null,
        });
      },

      /** Called by the reel when the animation finishes. */
      landSpin: () => {
        const state = get();
        if (state.phase !== 'spinning' || !state.currentTeamId) return;
        const seenBefore = state.visitedTeamIds.includes(state.currentTeamId);
        set({
          phase: 'picking',
          repeatVisit: seenBefore,
          visitedTeamIds: seenBefore
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

      /**
       * NAMING IS SAVING.
       *
       * A tester asked to name his player and keep him, named one, and then lost him to
       * the next tap, because the name field wrote to a run that BUILD ANOTHER PLAYER
       * deletes. Rather than adding a save button he has to notice, the act of naming
       * him is the act of keeping him: every keystroke upserts the finished career into
       * the hall under this run's id, and emptying the field takes him back out again,
       * which doubles as the undo.
       *
       * Only ever on a finished run. A name typed mid build has nothing to save yet,
       * and half a player in the hall would be worse than none.
       */
      setCreationName: (name) => {
        const state = get();
        const creationName = name.slice(0, 28);
        set({ creationName });

        if (state.phase !== 'results' || !state.career) return;
        const trimmed = creationName.trim();
        set({
          hall: trimmed
            ? saveToHall({
                id: state.runId,
                name: trimmed,
                position: state.position,
                hardMode: state.hardMode,
                seed: state.seed,
                savedAt: Date.now(),
                pickOrder: state.pickOrder,
                slots: state.slots,
                career: state.career,
              })
            : removeFromHall(state.runId),
        });
      },

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
      /**
       * DO NOT RENAME THIS KEY. The game is called GridironLab now and this still says
       * megatron, on purpose: the key is the address of everybody's autosaved run, and
       * changing it would strand every half finished player currently sitting in a
       * browser. A storage key is not player-facing copy, it is a pointer, and pointers
       * do not get renamed for taste. `megatron.hall.v1` is left alone for the same
       * reason, and it now holds saved players people intend to keep.
       */
      name: 'megatron.run.v1',
      storage: createJSONStorage(() => safeStorage),
      // Autosave the run itself; UI-only flags stay out except the sound preference.
      partialize: (s) => ({
        runId: s.runId, seed: s.seed, rngState: s.rngState, position: s.position,
        hardMode: s.hardMode, slots: s.slots, pickOrder: s.pickOrder,
        usedPlayerIds: s.usedPlayerIds, visitedTeamIds: s.visitedTeamIds,
        rerollsLeft: s.rerollsLeft, phase: s.phase, currentTeamId: s.currentTeamId,
        repeatVisit: s.repeatVisit,
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
