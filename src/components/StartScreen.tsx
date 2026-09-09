import { useState } from 'react';
import { DATA_STATS } from '../data';
import type { Era, Position } from '../data';
import type { SavedPlayer } from '../lib/hall';
import { makeSeed, parseSeedInput, seedFromUrl } from '../lib/rng';
import { HallOfBuilds } from './HallOfBuilds';

const POSITIONS: Position[] = ['QB', 'RB', 'WR', 'TE'];

/**
 * WHICH POSITION IS THE HARD ONE DEPENDS ON THE LEAGUE, and it stopped being one answer
 * the moment the second dataset landed.
 *
 * All-time, tight end is the hard one on its own and always has been. Its history holds by
 * far the fewest great players, so a typical roster offers less in every slot and the top
 * awards sit further away. Measured, a sensible run there ends with an empty trophy case
 * about one time in five against one in twenty at receiver.
 *
 * In the current league the reason changes and so does the answer. Quarterback and tight
 * end are the two positions where a real roster carries two or three men, so a landing
 * there is a room of two or three cards while a receiver room holds five or six. Measured,
 * both end about one run in six with nothing at all, against one in ten at receiver, so
 * both are labelled and the label says why.
 *
 * Leaving THE HARD ONE under tight end alone would have been a sentence the game's own
 * numbers contradict, which is the bug this project keeps finding on the results screen.
 */
const HARD_ONES: Record<Era, Partial<Record<Position, string>>> = {
  alltime: { TE: 'THE HARD ONE' },
  current: { QB: 'THIN ROOM', TE: 'THIN ROOM' },
};

type Props = {
  onStart: (opts: { position: Position; hardMode: boolean; era: Era; seed?: string }) => void;
  canResume: boolean;
  onResume: () => void;
  hall: SavedPlayer[];
  onOpenSaved: (player: SavedPlayer) => void;
  onDeleteSaved: (id: string) => void;
};

export function StartScreen({
  onStart, canResume, onResume, hall, onOpenSaved, onDeleteSaved,
}: Props) {
  const [position, setPosition] = useState<Position>('RB');
  const [hardMode, setHardMode] = useState(false);
  const [era, setEra] = useState<Era>('current');
  const [linkSeed, setLinkSeed] = useState(() => seedFromUrl());
  const [seed, setSeed] = useState(linkSeed ?? '');
  /** What the last thing typed or pasted in the seed box turned out to be. */
  const [pasted, setPasted] = useState<'clean' | 'recovered' | 'junk'>('clean');

  /**
   * A paste is the normal way a seed arrives, so the box has to survive one. A link, a
   * whole shared sentence with a link in it, or the bare code all end up as the same
   * seed. Anything with no seed in it stays on screen and gets told off, rather than
   * being quietly filed down into a legal seed that plays a different game.
   */
  function readSeed(raw: string) {
    const parsed = parseSeedInput(raw);
    setSeed(parsed.junk ? raw.slice(0, 120) : parsed.seed);
    setPasted(parsed.junk ? 'junk' : parsed.recovered ? 'recovered' : 'clean');
  }

  /**
   * DELETING THE SEED DID NOT DELETE THE SEED, and this is the whole of the fix.
   *
   * A `?seed=` link is read fresh every time this screen mounts, which is correct for
   * arriving on somebody's challenge and wrong for every visit after it. A tester cleared
   * the box, played his random run, came back for another and found the box refilled with
   * the same code, so the second run was the first run again. From where he was sitting
   * the seed was surviving being deleted, which is exactly what it was doing.
   *
   * A link seed is a one-shot instruction, so starting a run spends it and takes it out
   * of the address bar. The run keeps the seed it was given, `history.replaceState` adds
   * no entry to go back through, and reloading mid run resumes off the autosave rather
   * than off the URL.
   */
  function startRun() {
    if (new URLSearchParams(window.location.search).has('seed')) {
      const url = new URL(window.location.href);
      url.searchParams.delete('seed');
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
      setLinkSeed(null);
    }
    onStart({ position, hardMode, era, seed: seed || undefined });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {canResume && (
        <button
          onClick={onResume}
          className="mb-6 w-full rounded-lg border-2 border-hazard bg-hazard/10 px-4 py-3 text-left transition-colors hover:bg-hazard/20"
        >
          <div className="font-display text-xl tracking-tight uppercase">Pick up where you left off</div>
          <div className="font-mono text-[11px] text-white/55">
            You walked out on a half finished player. Go back and give him the rest of himself.
          </div>
        </button>
      )}

      {/*
        THE LEAGUE COMES FIRST because it decides what everything after it means. Picking
        a position before knowing whether the pool is a franchise's whole history or the
        men on its roster this morning is picking blind.

        CURRENT IS THE DEFAULT and all-time is the switch, which is the way round it
        should always have been. The men playing this Sunday are who somebody opening this
        wants to argue about, and the whole history of a franchise is the deeper cut you go
        looking for.

        Same switch as the mode below it, on purpose. Two settings that work identically
        should look identical, and the box always names the league it is currently set to
        rather than describing the one you would get by tapping it.
      */}
      <h2 className="font-display text-2xl tracking-tight uppercase">1 · Pick your league</h2>
      <button
        onClick={() => {
          const next = era === 'alltime' ? 'current' : 'alltime';
          setEra(next);
          // A position with no pool in the league you just switched to cannot stay
          // selected, or START would deal off an empty wheel.
          if (DATA_STATS.byEra[next][position] === 0) {
            const first = POSITIONS.find((p) => DATA_STATS.byEra[next][p] > 0);
            if (first) setPosition(first);
          }
        }}
        aria-pressed={era === 'alltime'}
        aria-label={era === 'current' ? 'Current players, switch to all time' : 'All time, switch to current players'}
        className={`mt-3 flex w-full items-center justify-between gap-3 rounded-lg border-2 px-4 py-3 text-left transition-colors ${
          era === 'alltime' ? 'border-sky-400 bg-sky-400/12' : 'border-white/12 bg-turf-800'
        }`}
      >
        <div className="min-w-0">
          <div
            className={`font-display text-lg tracking-tight uppercase ${era === 'alltime' ? 'text-sky-300' : ''}`}
          >
            {era === 'current' ? 'Current players' : 'All-time'}
          </div>
          <div className="font-mono text-[11px] text-white/50">
            {era === 'current'
              ? 'Only the men on a roster this morning, read off the depth chart. Every rating is judged against the league today, so the best one playing gets the 99.'
              : 'Everybody a franchise has ever had. Every rating is judged against everybody who has played the position, so the great ones set the top.'}
          </div>
        </div>
        <div className="shrink-0 text-center">
          <div
            className={`h-6 w-11 rounded-full p-0.5 transition-colors ${era === 'alltime' ? 'bg-sky-400' : 'bg-white/20'}`}
          >
            <div
              className={`h-5 w-5 rounded-full bg-white transition-transform ${era === 'alltime' ? 'translate-x-5' : ''}`}
            />
          </div>
          <div className="mt-1 font-mono text-[9px] tracking-wider whitespace-nowrap text-white/35">
            {era === 'current' ? 'GO ALL-TIME' : 'GO CURRENT'}
          </div>
        </div>
      </button>

      <h2 className="mt-8 font-display text-2xl tracking-tight uppercase">2 · Pick your position</h2>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {POSITIONS.map((pos) => {
          const live = DATA_STATS.byEra[era][pos] > 0;
          return (
            <button
              key={pos}
              disabled={!live}
              onClick={() => setPosition(pos)}
              className={`rounded-lg py-4 font-display text-2xl tracking-wide uppercase transition-all ${
                position === pos
                  ? 'scale-105 bg-hazard text-turf-950'
                  : live
                    ? 'bg-turf-700 hover:bg-turf-600'
                    : 'cursor-not-allowed bg-turf-800 text-white/20'
              }`}
            >
              {pos}
              {!live && <div className="font-mono text-[9px] opacity-60">SOON</div>}
              {live && HARD_ONES[era][pos] && (
                <div className="font-mono text-[8px] tracking-wider text-red-400">
                  {HARD_ONES[era][pos]}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <h2 className="mt-8 font-display text-2xl tracking-tight uppercase">3 · Set the rules</h2>
      {/*
        THE PANEL NAMES THE MODE YOU ARE IN, and nothing here says ON or OFF any more.

        It used to be one setting called HARD MODE with a state on the end of it, so the
        default read "HARD MODE · OFF" with the normal rules printed underneath. That is
        a heading and a body that disagree: the words say hard mode and the sentence
        describes the other one, and you have to hold the OFF in your head to read it.

        Two modes, one switch, and the box always shows the name and the rules of the
        mode it is currently set to. `aria-pressed` still carries the hard mode state,
        since that is the thing being turned on underneath.
      */}
      <button
        onClick={() => setHardMode(!hardMode)}
        aria-pressed={hardMode}
        aria-label={hardMode ? 'Hard mode, switch to normal' : 'Normal mode, switch to hard'}
        className={`mt-3 flex w-full items-center justify-between gap-3 rounded-lg border-2 px-4 py-3 text-left transition-colors ${
          hardMode ? 'border-red-500 bg-red-500/12' : 'border-white/12 bg-turf-800'
        }`}
      >
        <div className="min-w-0">
          <div
            className={`font-display text-lg tracking-tight uppercase ${hardMode ? 'text-red-400' : ''}`}
          >
            {hardMode ? 'Hard mode' : 'Normal mode'}
          </div>
          <div className="font-mono text-[11px] text-white/50">
            {/*
              Both lines are a plain statement of the rules and nothing else. They have
              been a joke, a pitch and an explanation of why the rule is good, and every
              version got the same note back: say what it does. A player reading a
              settings screen is deciding, not being entertained.

              No comma before an "and" here either, which is a small thing that was asked
              for twice. Two short sentences beat one that pauses in the middle.
            */}
            {hardMode
              ? 'No rerolls. The pool hides every rating. You pick a player and choose the attribute you think is his best. You find out the rating as you go.'
              : 'Two rerolls. Every rating in the pool is visible. You can land on the same franchise multiple times.'}
          </div>
        </div>
        <div className="shrink-0 text-center">
          <div
            className={`h-6 w-11 rounded-full p-0.5 transition-colors ${hardMode ? 'bg-red-500' : 'bg-white/20'}`}
          >
            <div
              className={`h-5 w-5 rounded-full bg-white transition-transform ${hardMode ? 'translate-x-5' : ''}`}
            />
          </div>
          {/*
            The switch on its own does not say what is on the other side of it, and with
            the ON and OFF gone there is nothing else to work it out from. This does.
          */}
          <div className="mt-1 font-mono text-[9px] tracking-wider whitespace-nowrap text-white/35">
            {hardMode ? 'GO NORMAL' : 'GO HARD'}
          </div>
        </div>
      </button>

      <h2 className="mt-8 font-display text-2xl tracking-tight uppercase">4 · Seed (optional)</h2>
      <p className="font-mono text-[11px] text-white/45">
        The same seed always gives you the same spins. Send one to somebody and you both
        face the identical wheel. Pasting a whole link in here works too.
      </p>
      <div className="mt-2 flex gap-2">
        <input
          value={seed}
          onChange={(e) => readSeed(e.target.value)}
          placeholder="RANDOM"
          aria-invalid={pasted === 'junk'}
          className={`min-w-0 flex-1 rounded-lg border bg-turf-800 px-3 py-2.5 font-mono text-sm tracking-wider uppercase placeholder:text-white/25 focus:outline-none ${
            pasted === 'junk' ? 'border-red-500 focus:border-red-400' : 'border-white/12 focus:border-hazard'
          }`}
        />
        <button
          onClick={() => { setSeed(makeSeed()); setPasted('clean'); }}
          className="rounded-lg bg-turf-700 px-4 font-display text-sm tracking-wide uppercase hover:bg-turf-600"
        >
          Roll
        </button>
      </div>

      {pasted === 'junk' && (
        <p className="mt-2 font-mono text-[11px] text-red-400">
          There is no seed in that. Paste the whole link, or just the code on its own,
          which looks like GRIDIRON-7QX3.
        </p>
      )}
      {pasted === 'recovered' && (
        <p className="mt-2 font-mono text-[11px] text-hazard/80">
          Got the seed out of that link. You are on their wheel now.
        </p>
      )}
      {pasted === 'clean' && linkSeed && seed === linkSeed && (
        <p className="mt-2 font-mono text-[11px] text-white/45">
          This link carries a seed, so you are about to face somebody else's wheel. Empty
          the box if you would rather have a random one.
        </p>
      )}

      {/*
        A bad paste blocks the start rather than quietly falling back to random. Getting
        an unexplained different wheel is the exact complaint this whole change exists to
        answer, so the one thing this button must never do is shrug and deal anyway.
      */}
      <button
        disabled={pasted === 'junk'}
        onClick={startRun}
        className="mt-8 w-full rounded-lg bg-hazard py-5 font-display text-3xl tracking-tight text-turf-950 uppercase transition-transform enabled:hover:scale-[1.02] enabled:active:scale-100 disabled:opacity-40"
      >
        {pasted === 'junk' ? 'Fix the seed first' : 'Build a player'}
      </button>

      <HallOfBuilds hall={hall} onOpen={onOpenSaved} onDelete={onDeleteSaved} />
    </div>
  );
}
