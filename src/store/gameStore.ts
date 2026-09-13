import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ATTRIBUTE_SETS, TEAMS, getPool } from '../data';
import type { AttributeKey, Era, Player, Position } from '../data';
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

/** Early runs are disposable; QUIT protects the build once a fifth slot is filled. */
export const QUIT_CONFIRM_AFTER = 4;

export function quitNeedsConfirmation(filledSlots: number): boolean {
  return filledSlots > QUIT_CONFIRM_AFTER;
}

/**
 * WHAT THE START SCREEN COMES BACK ON.
 *
 * This is deliberately NOT part of RunState. A run's league is frozen onto the run
 * because a career is scored against the pools it came out of, and the whole reason that
 * field cannot drift is written on `era` below. This is the opposite kind of thing: a
 * preference about what to offer you next, which has to survive exactly the events that
 * delete a run.
 *
 * It exists because the screen kept forgetting. BUILD ANOTHER PLAYER dropped you back on
 * running back, normal mode and the current league no matter what you had just spent ten
 * minutes playing, so anybody doing a second tight end run in hard mode had to set all
 * three again every time. A tester put it plainly: he was tired of walking out of a run
 * and then rechoosing.
 */
export type Setup = { position: Position; hardMode: boolean; era: Era };

const DEFAULT_SETUP: Setup = { position: 'RB', hardMode: false, era: 'current' };

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
  /**
   * Which league this run is digging through, fixed at the first spin and never moved.
   *
   * It is on the RUN rather than being a global preference on purpose. A career is scored
   * against the supply of the pools it was built from, so a saved player whose era could
   * drift would have his All-Pro floor re-read against the wrong league the next time
   * anybody opened him.
   */
  era: Era;
  slots: Partial<Record<AttributeKey, FilledSlot>>;
  /** Pick order, for the results card narrative. */
  pickOrder: AttributeKey[];
  /** Pick history. A player can appear more than once after repeated team landings. */
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
  /** Short run event notice; retained in persisted state for backward compatibility. */
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
  /**
   * The last league, position and mode that were actually played. Persisted, so it
   * survives a reload as well as a restart, and updated only by startRun, so a run you
   * abandoned three spins in still counts as what you were playing.
   */
  setup: Setup;
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

  startRun: (opts: { position: Position; hardMode: boolean; era: Era; seed?: string }) => void;
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
  currentPool: () => Player[];
  hasSavedRun: () => boolean;
};

const emptyRun = (): RunState => ({
  runId: '',
  seed: '',
  rngState: 0,
  position: 'RB',
  hardMode: false,
  era: 'current',
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
 * REPEAT-PLAYER RULE
 * ------------------
 * The wheel may land on the same franchise more than once. When it does, the same player
 * may donate another still-open trait. This is necessary for truthful league-leader data:
 * Madden can rank one player first in several categories, and inventing a different 99
 * merely to preserve a one-use rule would make the ratings false.
 *
 * Each landing still fills exactly one slot, and every slot can only be filled once. A
 * repeat therefore never gives anything for free: chasing three Trey McBride traits means
 * actually landing on Arizona three times. Every nonempty roster always has a legal pick,
 * so repeated teams cannot deadlock a seven-pick run.
 */
function drawTeam(state: RunState): { teamId: string | null; rngState: number } {
  const allowed = TEAMS
    .filter((team) => getPool(state.position, team.id, state.era).length > 0)
    .map((team) => team.id);
  if (allowed.length === 0) return { teamId: null, rngState: state.rngState };
  const draw = nextPick(state.rngState, allowed);
  return { teamId: draw.value, rngState: draw.state };
}

export const useGame = create<GameStore>()(
  persist(
    (set, get) => ({
      ...emptyRun(),
      soundOn: true,
      setup: DEFAULT_SETUP,
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
      startRun: ({ position, hardMode, era, seed }) => {
        const finalSeed = seed || makeSeed();
        set({
          ...emptyRun(),
          runId: `${Date.now().toString(36)}-${finalSeed}`,
          seed: finalSeed,
          rngState: hashSeed(finalSeed),
          position,
          hardMode,
          era,
          rerollsLeft: hardMode ? REROLLS_HARD : REROLLS_NORMAL,
          phase: 'ready',
          startedAt: Date.now(),
          entered: true,
          // Remembered for the next visit to the start screen. The seed is deliberately
          // not in here: a seed is one specific run, and refilling the box with it would
          // be the bug where deleting a seed did not delete the seed, rebuilt by hand.
          setup: { position, hardMode, era },
        });
      },

      spin: () => {
        const state = get();
        if (state.phase !== 'ready') return;

        const { teamId, rngState } = drawTeam(state);
        if (!teamId) {
          set({
            phase: 'stuck',
            lastEventMessage: 'No franchise has a roster for this position. Sorry.',
          });
          return;
        }

        set({
          rngState,
          currentTeamId: teamId,
          phase: 'spinning',
          spinNonce: state.spinNonce + 1,
          repeatVisit: false,
          lastEventMessage: null,
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
        if (state.slots[attribute]) return;

        const player = getPool(state.position, state.currentTeamId ?? '', state.era).find((p) => p.id === playerId);
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

        set({ career: simulateCareer(state.position, build, state.seed, state.era), phase: 'results' });
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
                era: state.era,
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
      currentPool: () => {
        const s = get();
        return s.currentTeamId ? getPool(s.position, s.currentTeamId, s.era) : [];
      },
      hasSavedRun: () => {
        const s = get();
        return s.phase !== 'setup' && s.runId !== '';
      },
    }),
    {
      /**
       * DO NOT RENAME THIS KEY. The game is called Build a 99 now and this still says
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
        hardMode: s.hardMode, era: s.era, slots: s.slots, pickOrder: s.pickOrder,
        usedPlayerIds: s.usedPlayerIds, visitedTeamIds: s.visitedTeamIds,
        rerollsLeft: s.rerollsLeft, phase: s.phase, currentTeamId: s.currentTeamId,
        repeatVisit: s.repeatVisit,
        startedAt: s.startedAt, soundOn: s.soundOn, setup: s.setup,
        creationName: s.creationName, career: s.career,
      }),
      onRehydrateStorage: () => (state) => {
        // A reload mid-spin would otherwise resume into a reel that never lands.
        if (state && state.phase === 'spinning') state.phase = 'picking';
        // An autosave written before the second dataset existed has no era on it, and
        // every one of those runs was played against the all-time pools. Without this a
        // half finished player comes back with `undefined` where his league should be,
        // every pool lookup returns nothing, and the wheel spins onto empty rosters.
        if (state && !state.era) state.era = 'alltime';
        // Same shape of problem one field along. An autosave written before the start
        // screen remembered anything has no setup on it, and a start screen reading
        // `undefined.position` renders nothing at all.
        if (state && !state.setup) state.setup = DEFAULT_SETUP;
      },
    },
  ),
);
