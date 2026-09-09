import { useEffect, useState, useSyncExternalStore } from 'react';
import { ATTRIBUTE_SETS, getTeam } from './data';
import type { AttributeKey } from './data';
import { useGame } from './store/gameStore';
import { audioState, lock, primeAudio, setSoundEnabled, subscribeAudio } from './lib/audio';
import { savedEra } from './lib/hall';
import type { SavedPlayer } from './lib/hall';
import { Chevron, SoundOff, SoundOn } from './components/Icons';
import { SlotMachine } from './components/SlotMachine';
import { BuildSheet } from './components/BuildSheet';
import { PoolPicker } from './components/PoolPicker';
import { StartScreen } from './components/StartScreen';
import { ResultsScreen } from './components/ResultsScreen';
import DataInspector from './DataInspector';

export default function App() {
  const g = useGame();
  const [hover, setHover] = useState<AttributeKey | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  /** Confirm step for walking out on a run. See the quit control in the header. */
  const [quitting, setQuitting] = useState(false);
  /**
   * A saved player being read back out of the hall. This is not a run and never becomes
   * one: it renders the frozen report and nothing else, so opening somebody you built
   * last week cannot disturb a half finished build sitting in the autosave.
   */
  const [viewing, setViewing] = useState<SavedPlayer | null>(null);
  /**
   * Whether a sound played right now would actually be heard. A tester could not tell
   * the toggle apart from a browser that had simply never let the audio start, so the
   * header says which of the two it is instead of showing one ambiguous speaker icon.
   */
  const audio = useSyncExternalStore(subscribeAudio, audioState);

  /**
   * With the sound off, never open an audio context at all. On iOS opening one claims
   * the playback audio session, which is what stops the ringer switch muting the game,
   * and it is also what interrupts whatever the phone was already playing. Nobody who
   * turned the sound off should lose their podcast to a silent game.
   */
  useEffect(() => { setSoundEnabled(g.soundOn); }, [g.soundOn]);

  if (new URLSearchParams(window.location.search).has('debug')) return <DataInspector />;

  /** A run is live from the first spin screen until the report is closed. */
  const inRun = g.entered && g.phase !== 'setup';
  const pool = g.currentTeamId ? g.currentPool() : [];
  const team = g.currentTeamId ? getTeam(g.currentTeamId) : null;
  const filledCount = ATTRIBUTE_SETS[g.position].filter((k) => g.slots[k]).length;
  const totalSlots = ATTRIBUTE_SETS[g.position].length;

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-turf-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <button
            onClick={() => {
              if (inRun) { setQuitting(true); return; }
              setViewing(null);
              g.abandonRun();
            }}
            className="text-left"
          >
            <h1 className="font-display text-2xl leading-none tracking-tighter uppercase sm:text-3xl">
              Gridiron<span className="text-hazard">Lab</span>
            </h1>
          </button>

          {/*
            Wraps rather than overflows. With a run live, the sound blocked and the quit
            button up, this row is 404px of chips inside a 390px phone, and a header that
            cannot wrap simply cuts the last one off the screen.
          */}
          <div className="flex flex-wrap items-center justify-end gap-2 font-mono text-[10px]">
            {g.phase !== 'setup' && g.entered && (
              <>
                <span className="hidden rounded bg-white/8 px-2 py-1 text-white/60 sm:inline">
                  {g.seed}
                </span>
                <span className="rounded bg-white/8 px-2 py-1 text-white/60">{g.position}</span>
                {/* One chip, not two. A BLIND chip was tried here and taken back out: it
                    is a second red word saying what the banner over the pool already says
                    at the moment it matters, and this row is the one that overflowed a
                    390px header before. The question marks are explained where they are. */}
                {g.hardMode && (
                  <span className="rounded bg-red-500/20 px-2 py-1 font-bold text-red-400">HARD</span>
                )}
                <span className="rounded bg-white/8 px-2 py-1 text-white/60">
                  {g.rerollsLeft} REROLL{g.rerollsLeft === 1 ? '' : 'S'}
                </span>
              </>
            )}
            {/* Short on purpose. At full length it took a whole extra row of a phone header. */}
            {g.soundOn && audio === 'blocked' && (
              <span className="rounded bg-amber-500/20 px-2 py-1 font-bold tracking-wider text-amber-300">
                TAP FOR SOUND
              </span>
            )}
            {/*
              There was no way out of a run except finishing it. The logo went home, but
              nothing said so and it did it on one tap with the build still on screen, so
              it was a trap rather than an exit. This is the exit, it is reachable during
              a spin, and it asks first.
            */}
            {inRun && (
              <>
                {/*
                  RESTART DOES NOT ASK, and that is the point of it rather than an
                  oversight. QUIT asks because leaving is a decision somebody might be
                  making by accident, and the sentence it asks with names how much of the
                  build goes with it. Restarting is the decision already made: a tester
                  described the old route as clicking abandon, confirming, and then
                  choosing his league, position and mode all over again, which is four taps
                  to do the thing he had already asked for on the first one.
                  It costs the run, same as QUIT. What it does not cost is the setup, which
                  the start screen now comes back on.
                */}
                <button
                  onClick={g.restartRun}
                  title="Drop this run and set up another"
                  className="rounded bg-white/8 px-2 py-1 font-bold tracking-wider text-white/45 transition-colors hover:bg-hazard/25 hover:text-hazard"
                >
                  RESTART
                </button>
                <button
                  onClick={() => setQuitting(true)}
                  title="Walk away from this run"
                  className="rounded bg-white/8 px-2 py-1 font-bold tracking-wider text-white/45 transition-colors hover:bg-red-500/25 hover:text-red-300"
                >
                  QUIT
                </button>
              </>
            )}
            <button
              onClick={() => {
                // Enable BEFORE priming. With the sound off no context is opened at all,
                // so switching it on has to lift that inside the same tap or the browser
                // will not let the context start until you tap something else.
                const next = !g.soundOn;
                setSoundEnabled(next);
                if (next) primeAudio();
                g.toggleSound();
              }}
              aria-pressed={g.soundOn}
              title={g.soundOn ? 'Turn the sound off' : 'Turn the sound on'}
              className={`flex items-center gap-1.5 rounded px-2 py-1 font-bold tracking-wider transition-colors ${
                g.soundOn
                  ? 'bg-hazard text-turf-950 hover:bg-hazard/85'
                  : 'bg-white/8 text-white/45 hover:bg-white/15'
              }`}
            >
              {g.soundOn ? <SoundOn className="h-3.5 w-3.5" /> : <SoundOff className="h-3.5 w-3.5" />}
              SOUND {g.soundOn ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </header>

      {viewing ? (
        <main className="mx-auto max-w-7xl px-4 py-5">
          <ResultsScreen
            position={viewing.position}
            era={savedEra(viewing)}
            slots={viewing.slots}
            pickOrder={viewing.pickOrder}
            career={viewing.career}
            seed={viewing.seed}
            hardMode={viewing.hardMode}
            creationName={viewing.name}
            // A saved report is a record of what happened. Renaming him happens on the
            // run that made him, not here.
            onName={() => {}}
            onRestart={() => setViewing(null)}
            soundOn={g.soundOn}
            replay
          />
        </main>
      ) : g.phase === 'setup' || !g.entered ? (
        <StartScreen
          onStart={(opts) => { primeAudio(); g.startRun(opts); }}
          setup={g.setup}
          canResume={g.hasSavedRun()}
          onResume={() => { primeAudio(); g.resumeRun(); }}
          hall={g.hall}
          onOpenSaved={setViewing}
          onDeleteSaved={g.deleteSaved}
        />
      ) : (
        <main
          className={`mx-auto grid max-w-7xl gap-5 px-4 py-5 ${
            g.phase === 'results' ? '' : 'lg:grid-cols-[1fr_300px]'
          }`}
        >
          <div className="min-w-0">
            {g.lastEventMessage && (
              <div className="mb-3 rounded border border-amber-500/40 bg-amber-500/10 px-3 py-2 font-mono text-[11px] tracking-wider text-amber-300">
                {g.lastEventMessage}
              </div>
            )}

            {(g.phase === 'ready' || g.phase === 'spinning') && (
              <section>
                <div className="mb-3 flex items-baseline justify-between">
                  <h2 className="font-display text-xl tracking-tight uppercase">
                    Slot {filledCount + 1} of {totalSlots}
                  </h2>
                  <span className="font-mono text-[11px] text-white/45">
                    {g.remainingSlots().length} slots left
                  </span>
                </div>

                {g.phase === 'spinning' && g.currentTeamId ? (
                  <SlotMachine
                    position={g.position}
                    era={g.era}
                    targetTeamId={g.currentTeamId}
                    spinNonce={g.spinNonce}
                    visitedTeamIds={g.visitedTeamIds}
                    usedPlayerIds={g.usedPlayerIds}
                    soundOn={g.soundOn}
                    onLanded={g.landSpin}
                  />
                ) : (
                  <div className="flex h-[84px] items-center justify-center rounded-lg border-2 border-dashed border-white/15 bg-turf-900 font-mono text-[11px] tracking-[0.2em] text-white/35">
                    PULL THE LEVER
                  </div>
                )}

                <button
                  onClick={() => { primeAudio(); g.spin(); }}
                  disabled={g.phase === 'spinning'}
                  className="mt-4 w-full rounded-lg bg-hazard py-5 font-display text-3xl tracking-tight text-turf-950 uppercase transition-transform enabled:hover:scale-[1.02] disabled:opacity-40"
                >
                  {g.phase === 'spinning' ? 'Spinning…' : 'Spin'}
                </button>
              </section>
            )}

            {g.phase === 'picking' && team && (
              <section>
                <div
                  className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg px-4 py-3"
                  style={{ background: `linear-gradient(100deg, ${team.primary}, ${team.primary}22)` }}
                >
                  <div>
                    <div className="font-mono text-[10px] tracking-[0.2em] text-white/60">
                      {g.repeatVisit ? 'YOU LANDED HERE AGAIN' : 'YOU LANDED ON'}
                    </div>
                    <h2 className="font-display text-2xl leading-none tracking-tight uppercase sm:text-3xl">
                      {team.city} {team.name}
                    </h2>
                  </div>
                  <button
                    onClick={g.reroll}
                    disabled={g.rerollsLeft === 0}
                    className="rounded border-2 border-white/30 px-4 py-2 font-display text-sm tracking-wide uppercase transition-colors enabled:hover:bg-white/15 disabled:opacity-30"
                    title={g.rerollsLeft === 0 ? 'No rerolls left. Take somebody.' : 'Skip this franchise'}
                  >
                    Reroll ({g.rerollsLeft})
                  </button>
                </div>

                <PoolPicker
                  position={g.position}
                  pool={pool}
                  usedPlayerIds={g.usedPlayerIds}
                  slots={g.slots}
                  blind={g.hardMode}
                  onSteal={(playerId, attribute) => { if (g.soundOn) lock(); g.takeAttribute(playerId, attribute); }}
                  onHover={setHover}
                />
              </section>
            )}

            {g.phase === 'complete' && (
              <section className="rounded-lg border-2 border-hazard bg-hazard/10 px-5 py-10 text-center">
                <h2 className="font-display text-3xl tracking-tight uppercase">Build complete</h2>
                <p className="mt-2 font-mono text-[12px] text-white/60">
                  Every slot is full. Time to find out what he did with his career.
                </p>
                <button
                  onClick={g.runSimulation}
                  className="mt-6 w-full rounded-lg bg-hazard py-5 font-display text-3xl tracking-tight text-turf-950 uppercase transition-transform hover:scale-[1.02]"
                >
                  Simulate career
                </button>
              </section>
            )}

            {g.phase === 'results' && g.career && (
              <ResultsScreen
                position={g.position}
                era={g.era}
                slots={g.slots}
                pickOrder={g.pickOrder}
                career={g.career}
                seed={g.seed}
                hardMode={g.hardMode}
                creationName={g.creationName}
                onName={g.setCreationName}
                onRestart={g.abandonRun}
                soundOn={g.soundOn}
              />
            )}

            {g.phase === 'stuck' && (
              <section className="rounded-lg border-2 border-red-500 bg-red-500/10 px-5 py-8 text-center">
                <h2 className="font-display text-2xl uppercase">This run got stuck</h2>
                <p className="mt-2 font-mono text-[12px] text-white/60">{g.lastEventMessage}</p>
                <button onClick={g.abandonRun} className="mt-4 rounded bg-white/15 px-5 py-2 font-display uppercase">
                  Start over
                </button>
              </section>
            )}
          </div>

          {/* Sidebar on desktop, drawer on phones. */}
          <aside className={`hidden ${g.phase === 'results' ? '' : 'lg:block'}`}>
            <div className="sticky top-20">
              <BuildSheet
                position={g.position}
                era={g.era}
                slots={g.slots}
                highlight={hover}
                usedPlayerIds={g.usedPlayerIds}
                blind={g.hardMode}
              />
            </div>
          </aside>

          <div className={g.phase === 'results' ? 'hidden' : 'lg:hidden'}>
            <button
              onClick={() => setSheetOpen(!sheetOpen)}
              className="flex w-full items-center justify-between rounded-lg border border-white/12 bg-turf-800 px-4 py-3 text-left font-display text-lg uppercase"
            >
              <span>Build sheet · {filledCount}/{totalSlots}</span>
              <Chevron className={`h-5 w-5 transition-transform ${sheetOpen ? '' : '-rotate-90'}`} />
            </button>
            {sheetOpen && (
              <div className="mt-2">
                <BuildSheet
                  position={g.position}
                  era={g.era}
                  slots={g.slots}
                  highlight={hover}
                  usedPlayerIds={g.usedPlayerIds}
                  blind={g.hardMode}
                />
              </div>
            )}
          </div>
        </main>
      )}

      {/*
        Confirm, because this is the one button in the app that destroys something. The
        slot count is in the sentence on purpose: six of seven filled reads very
        differently from one of seven, and it is the number that changes your mind.
      */}
      {quitting && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Abandon this run"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-turf-950/85 px-4 backdrop-blur-sm"
          onClick={() => setQuitting(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl border-2 border-white/20 bg-turf-900 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-2xl tracking-tight uppercase">
              {g.phase === 'results' ? 'Close the report?' : 'Walk away from him?'}
            </h2>
            <p className="mt-2 font-mono text-[11px] leading-relaxed text-white/55">
              {g.phase === 'results'
                ? 'The report goes away and the run goes with it. Copy the link first if you want to keep the seed.'
                : `He is ${filledCount} of ${totalSlots} slots built. Leaving deletes him, and the seed goes too. There is no picking this one back up.`}
            </p>
            <div className="mt-5 flex gap-2">
              <button
                autoFocus
                onClick={() => setQuitting(false)}
                className="flex-1 rounded-lg bg-hazard px-4 py-3 font-display text-lg tracking-wide text-turf-950 uppercase"
              >
                {g.phase === 'results' ? 'Stay here' : 'Keep playing'}
              </button>
              <button
                onClick={() => { setQuitting(false); g.abandonRun(); }}
                className="rounded-lg border-2 border-red-500/60 px-4 py-3 font-display text-lg tracking-wide text-red-300 uppercase hover:bg-red-500/15"
              >
                Abandon
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-8 border-t border-white/10 px-4 py-6 text-center font-mono text-[10px] leading-relaxed text-white/30">
        GridironLab is a fan project. It has nothing to do with the NFL and no team has endorsed
        it. Team names are here so you know whose history you are digging through. Every
        rating was written by hand for fun, and none of it comes from a real scouting source.
        If you disagree with a number, you are probably right.
        <br />
        {/*
          THE DATA INSPECTOR IS NOT LINKED ANY MORE, and it has not been deleted either.
          It is a wall of raw ratings for whoever is editing the pools, and a link to it
          sitting under the disclaimer on a public site is an invitation to read the
          answers before playing. `?debug` still opens it for anyone who knows.
        */}
        {import.meta.env.VITE_FEEDBACK_URL && (
          <a
            href={import.meta.env.VITE_FEEDBACK_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-hazard/70 underline hover:text-hazard"
          >
            Something feel wrong? Tell me about it
          </a>
        )}
      </footer>
    </div>
  );
}
