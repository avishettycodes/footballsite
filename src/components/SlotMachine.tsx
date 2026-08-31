import { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';
import { TEAMS, TEAMS_BY_ID, getPool } from '../data';
import type { Position, Team } from '../data';
import { tick, thunk } from '../lib/audio';

const ITEM_H = 84;
const REEL_LEN = 44;
/** Long, slow tail. Fast off the line, then an agonizing crawl into the stop. */
const SPIN_MS = 3400;
const EASE: [number, number, number, number] = [0.08, 0.82, 0.16, 1];

function bezierY(t: number, [, p1y, , p3y]: [number, number, number, number]) {
  // cubic-bezier(p0x,p0y,p1x,p1y) with fixed endpoints (0,0)/(1,1), sampled on t.
  const u = 1 - t;
  return 3 * u * u * t * p1y + 3 * u * t * t * p3y + t * t * t;
}

type Props = {
  position: Position;
  targetTeamId: string;
  spinNonce: number;
  hardMode: boolean;
  visitedTeamIds: string[];
  usedPlayerIds: string[];
  soundOn: boolean;
  onLanded: () => void;
};

export function SlotMachine({
  position, targetTeamId, spinNonce, hardMode, visitedTeamIds, usedPlayerIds, soundOn, onLanded,
}: Props) {
  const reelRef = useRef<HTMLDivElement>(null);
  const [reel, setReel] = useState<Team[]>([]);
  const [flooding, setFlooding] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (!spinNonce || !targetTeamId) return;

    // Filler panels are cosmetic only — they never touch the seeded RNG.
    const strip: Team[] = [];
    for (let i = 0; i < REEL_LEN; i++) strip.push(TEAMS[(i * 7 + spinNonce * 3) % TEAMS.length]);
    strip[REEL_LEN - 1] = TEAMS_BY_ID[targetTeamId];
    setReel(strip);
    setFlooding(false);

    const target = -(REEL_LEN - 1) * ITEM_H;
    const node = reelRef.current;
    if (!node) return;

    // Ticks land where the reel actually crosses a panel, so audio tracks the
    // deceleration instead of being a flat metronome.
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (soundOn) {
      for (let i = 1; i < REEL_LEN; i++) {
        const goal = i / (REEL_LEN - 1);
        let lo = 0, hi = 1;
        for (let k = 0; k < 24; k++) {
          const mid = (lo + hi) / 2;
          bezierY(mid, EASE) < goal ? (lo = mid) : (hi = mid);
        }
        timers.current.push(window.setTimeout(() => tick(goal), ((lo + hi) / 2) * SPIN_MS));
      }
    }

    const controls = animate(node, { y: [0, target] }, { duration: SPIN_MS / 1000, ease: EASE });

    controls.then(() => {
      // Hard snap: a short overshoot and settle so it stops like a machine, not a tween.
      animate(node, { y: [target, target + 9, target] }, { duration: 0.19, ease: 'easeOut' });
      if (soundOn) thunk();
      setFlooding(true);
      window.setTimeout(onLanded, 420);
    });

    return () => {
      timers.current.forEach(clearTimeout);
      controls.stop();
    };
    // onLanded is stable from zustand; re-running on nonce is the whole point.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinNonce, targetTeamId]);

  const target = TEAMS_BY_ID[targetTeamId];

  return (
    <div className="relative">
      <div
        className="relative overflow-hidden rounded-lg border-2 border-white/15 bg-turf-900"
        style={{ height: ITEM_H }}
      >
        <div ref={reelRef} className="will-change-transform">
          {reel.map((team, i) => {
            const locked = hardMode && visitedTeamIds.includes(team.id) && i < REEL_LEN - 1;
            const empty = getPool(position, team.id).every((p) => usedPlayerIds.includes(p.id));
            return (
              <div
                key={`${team.id}-${i}`}
                className="flex items-center justify-between px-5"
                style={{
                  height: ITEM_H,
                  backgroundColor: team.primary,
                  boxShadow: `inset 0 -4px 0 ${team.secondary}`,
                  opacity: locked || empty ? 0.32 : 1,
                }}
              >
                <div className="min-w-0">
                  <div className="font-display text-2xl leading-none tracking-tight text-white uppercase sm:text-3xl">
                    {team.city} {team.name}
                  </div>
                  <div className="font-mono text-[10px] tracking-[0.2em] text-white/60">
                    {locked ? 'ALREADY BEEN HERE' : empty ? 'NOBODY LEFT' : `${getPool(position, team.id).length} ${position}`}
                  </div>
                </div>
                <div className="font-display text-4xl leading-none text-white/35 sm:text-5xl">
                  {team.abbr}
                </div>
              </div>
            );
          })}
        </div>

        {/* Broadcast-style center bug */}
        <div className="pointer-events-none absolute inset-0 border-y-2 border-hazard/70" />
        <div className="pointer-events-none absolute top-1/2 -left-1 h-0 w-0 -translate-y-1/2 border-y-8 border-l-8 border-y-transparent border-l-hazard" />
        <div className="pointer-events-none absolute top-1/2 -right-1 h-0 w-0 -translate-y-1/2 border-y-8 border-r-8 border-y-transparent border-r-hazard" />
      </div>

      {/* Team colors flooding the screen on the hard stop. */}
      {flooding && target && (
        <div
          key={spinNonce}
          className="pointer-events-none fixed inset-0 z-50 animate-[flood_600ms_ease-out_forwards]"
          style={{ background: `radial-gradient(circle at 50% 45%, ${target.primary}, ${target.secondary})` }}
        />
      )}
    </div>
  );
}
