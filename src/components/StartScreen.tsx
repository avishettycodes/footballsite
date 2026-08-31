import { useState } from 'react';
import { DATA_STATS } from '../data';
import type { Position } from '../data';
import { makeSeed, normalizeSeed, seedFromUrl } from '../lib/rng';

const POSITIONS: Position[] = ['QB', 'RB', 'WR', 'TE'];

type Props = {
  onStart: (opts: { position: Position; hardMode: boolean; seed?: string }) => void;
  canResume: boolean;
  onResume: () => void;
};

export function StartScreen({ onStart, canResume, onResume }: Props) {
  const [position, setPosition] = useState<Position>('RB');
  const [hardMode, setHardMode] = useState(false);
  const [seed, setSeed] = useState(seedFromUrl() ?? '');

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

      <h2 className="font-display text-2xl tracking-tight uppercase">1 · Pick your position</h2>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {POSITIONS.map((pos) => {
          const live = DATA_STATS.byPosition[pos] > 0;
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
              {/*
                Tight end really is harder, and saying so turns a broken promise into
                the point. It is the only seven attribute position and it has by far the
                fewest elite players in its history, so the top awards sit further away
                than they do anywhere else.
              */}
              {pos === 'TE' && live && (
                <div className="font-mono text-[8px] tracking-wider text-red-400">
                  THE HARD ONE
                </div>
              )}
            </button>
          );
        })}
      </div>

      <h2 className="mt-8 font-display text-2xl tracking-tight uppercase">2 · Set the rules</h2>
      <button
        onClick={() => setHardMode(!hardMode)}
        className={`mt-3 flex w-full items-center justify-between rounded-lg border-2 px-4 py-3 text-left transition-colors ${
          hardMode ? 'border-red-500 bg-red-500/12' : 'border-white/12 bg-turf-800'
        }`}
      >
        <div>
          <div className="font-display text-lg tracking-tight uppercase">
            Hard mode {hardMode ? '· ON' : '· OFF'}
          </div>
          <div className="font-mono text-[11px] text-white/50">
            {hardMode
              ? 'No rerolls at all. Every franchise stays in the wheel the whole way, so you can land on the Browns twice and you get to live with it.'
              : 'Three rerolls, and every franchise stays in the wheel the whole way.'}
          </div>
        </div>
        <div
          className={`h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors ${hardMode ? 'bg-red-500' : 'bg-white/20'}`}
        >
          <div
            className={`h-5 w-5 rounded-full bg-white transition-transform ${hardMode ? 'translate-x-5' : ''}`}
          />
        </div>
      </button>

      <h2 className="mt-8 font-display text-2xl tracking-tight uppercase">3 · Seed (optional)</h2>
      <p className="font-mono text-[11px] text-white/45">
        The same seed always gives you the same spins. Send one to somebody and you both
        face the identical wheel, so it comes down to who builds the better player.
      </p>
      <div className="mt-2 flex gap-2">
        <input
          value={seed}
          onChange={(e) => setSeed(normalizeSeed(e.target.value))}
          placeholder="RANDOM"
          className="min-w-0 flex-1 rounded-lg border border-white/12 bg-turf-800 px-3 py-2.5 font-mono text-sm tracking-wider uppercase placeholder:text-white/25 focus:border-hazard focus:outline-none"
        />
        <button
          onClick={() => setSeed(makeSeed())}
          className="rounded-lg bg-turf-700 px-4 font-display text-sm tracking-wide uppercase hover:bg-turf-600"
        >
          Roll
        </button>
      </div>

      <button
        onClick={() => onStart({ position, hardMode, seed: seed || undefined })}
        className="mt-8 w-full rounded-lg bg-hazard py-5 font-display text-3xl tracking-tight text-turf-950 uppercase transition-transform hover:scale-[1.02] active:scale-100"
      >
        Build a player
      </button>
    </div>
  );
}
