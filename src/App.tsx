import { useState } from 'react';
import { ATTRIBUTE_SETS, getTeam } from './data';
import type { AttributeKey } from './data';
import { useGame } from './store/gameStore';
import { lock, primeAudio } from './lib/audio';
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

  if (new URLSearchParams(window.location.search).has('debug')) return <DataInspector />;

  const pool = g.currentTeamId ? g.currentPool() : [];
  const team = g.currentTeamId ? getTeam(g.currentTeamId) : null;
  const filledCount = ATTRIBUTE_SETS[g.position].filter((k) => g.slots[k]).length;
  const totalSlots = ATTRIBUTE_SETS[g.position].length;

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-turf-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <button onClick={g.abandonRun} className="text-left">
            <h1 className="font-display text-2xl leading-none tracking-tighter uppercase sm:text-3xl">
              Mega<span className="text-hazard">tron</span>
            </h1>
          </button>

          <div className="flex items-center gap-2 font-mono text-[10px]">
            {g.phase !== 'setup' && g.entered && (
              <>
                <span className="hidden rounded bg-white/8 px-2 py-1 text-white/60 sm:inline">
                  {g.seed}
                </span>
                <span className="rounded bg-white/8 px-2 py-1 text-white/60">{g.position}</span>
                {g.hardMode && (
                  <span className="rounded bg-red-500/20 px-2 py-1 font-bold text-red-400">HARD</span>
                )}
                <span className="rounded bg-white/8 px-2 py-1 text-white/60">
                  {g.rerollsLeft} REROLL{g.rerollsLeft === 1 ? '' : 'S'}
                </span>
              </>
            )}
            <button
              onClick={g.toggleSound}
              title="Tick sound"
              className="rounded bg-white/8 px-2 py-1 text-white/60 hover:bg-white/15"
            >
              {g.soundOn ? '🔊' : '🔇'}
            </button>
          </div>
        </div>
      </header>

      {g.phase === 'setup' || !g.entered ? (
        <StartScreen
          onStart={(opts) => { primeAudio(); g.startRun(opts); }}
          canResume={g.hasSavedRun()}
          onResume={() => { primeAudio(); g.resumeRun(); }}
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
                    targetTeamId={g.currentTeamId}
                    spinNonce={g.spinNonce}
                    hardMode={g.hardMode}
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
                      YOU LANDED ON
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
                  onSteal={(playerId, attribute) => { if (g.soundOn) lock(); g.takeAttribute(playerId, attribute); }}
                  onHover={setHover}
                />
              </section>
            )}

            {g.phase === 'complete' && (
              <section className="rounded-lg border-2 border-hazard bg-hazard/10 px-5 py-10 text-center">
                <h2 className="font-display text-3xl tracking-tight uppercase">Build complete</h2>
                <p className="mt-2 font-mono text-[12px] text-white/60">
                  Every slot is full. Time to find out what he did with his life.
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
                slots={g.slots}
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
                slots={g.slots}
                highlight={hover}
                usedPlayerIds={g.usedPlayerIds}
                hardMode={g.hardMode}
                visitedTeamIds={g.visitedTeamIds}
              />
            </div>
          </aside>

          <div className={g.phase === 'results' ? 'hidden' : 'lg:hidden'}>
            <button
              onClick={() => setSheetOpen(!sheetOpen)}
              className="w-full rounded-lg border border-white/12 bg-turf-800 px-4 py-3 text-left font-display text-lg tracking-tight uppercase"
            >
              Build sheet · {filledCount}/{totalSlots} {sheetOpen ? '▾' : '▸'}
            </button>
            {sheetOpen && (
              <div className="mt-2">
                <BuildSheet
                  position={g.position}
                  slots={g.slots}
                  highlight={hover}
                  usedPlayerIds={g.usedPlayerIds}
                  hardMode={g.hardMode}
                  visitedTeamIds={g.visitedTeamIds}
                />
              </div>
            )}
          </div>
        </main>
      )}

      <footer className="mt-8 border-t border-white/10 px-4 py-6 text-center font-mono text-[10px] leading-relaxed text-white/30">
        Megatron is a fan project. It has nothing to do with the NFL and no team has endorsed
        it. Team names are here so you know whose history you are digging through. Every
        rating was written by hand for fun, and none of it comes from a real scouting source.
        If you disagree with a number, you are probably right.
        <br />
        {import.meta.env.VITE_FEEDBACK_URL && (
          <>
            <a
              href={import.meta.env.VITE_FEEDBACK_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-hazard/70 underline hover:text-hazard"
            >
              Something feel wrong? Tell me about it
            </a>{' '}
            ·{' '}
          </>
        )}
        <a href="?debug" className="mt-2 inline-block underline hover:text-white/50">data inspector</a>
      </footer>
    </div>
  );
}
