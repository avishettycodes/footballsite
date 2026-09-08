import { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';
import { TEAMS, TEAMS_BY_ID, getPool } from '../data';
import { CONTRAST_LARGE_TEXT, inkOn } from '../lib/contrast';
import type { Era, Position, Team } from '../data';
import { tick, thunk } from '../lib/audio';

const ITEM_H = 84;
const REEL_LEN = 44;

/**
 * Long, slow tail. Fast off the line, then a crawl into the stop.
 *
 * 3400 is a guess that has never been felt by anyone. For what it is worth, the last
 * tenth of the distance eats 37% of the spin and the final second holds only three
 * ticks, so if it drags anywhere it will drag there. Add ?spin=2600 to the URL to try a
 * different number without editing anything, so the two can be compared back to back.
 */
const DEFAULT_SPIN_MS = 3400;
const SPIN_MS = (() => {
  if (typeof window === 'undefined') return DEFAULT_SPIN_MS;
  const raw = Number(new URLSearchParams(window.location.search).get('spin'));
  return Number.isFinite(raw) && raw >= 400 && raw <= 8000 ? raw : DEFAULT_SPIN_MS;
})();
const EASE: [number, number, number, number] = [0.08, 0.82, 0.16, 1];

function bezierY(t: number, [, p1y, , p3y]: [number, number, number, number]) {
  // cubic-bezier(p0x,p0y,p1x,p1y) with fixed endpoints (0,0)/(1,1), sampled on t.
  const u = 1 - t;
  return 3 * u * u * t * p1y + 3 * u * t * t * p3y + t * t * t;
}

type Props = {
  position: Position;
  era: Era;
  targetTeamId: string;
  spinNonce: number;
  visitedTeamIds: string[];
  usedPlayerIds: string[];
  soundOn: boolean;
  onLanded: () => void;
};

export function SlotMachine({
  position, era, targetTeamId, spinNonce, visitedTeamIds, usedPlayerIds, soundOn, onLanded,
}: Props) {
  const reelRef = useRef<HTMLDivElement>(null);
  const [reel, setReel] = useState<Team[]>([]);
  const [flooding, setFlooding] = useState(false);
  const timers = useRef<number[]>([]);
  /** Set by a tap so the running animation knows to stop crawling and just land. */
  const skipRef = useRef<(() => void) | null>(null);

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

    const finish = () => {
      // Hard snap: a short overshoot and settle so it stops like a machine, not a tween.
      animate(node, { y: [target, target + 9, target] }, { duration: 0.19, ease: 'easeOut' });
      if (soundOn) thunk();
      setFlooding(true);
      window.setTimeout(onLanded, 420);
    };

    /**
     * Tap to cut the tail. The first spin of a run is the one you want to watch. By the
     * sixth you already know which franchises you need and the long crawl is just time.
     * The landing is already decided, so skipping changes nothing except how long you
     * wait for it.
     */
    skipRef.current = () => {
      skipRef.current = null;
      timers.current.forEach(clearTimeout);
      controls.stop();
      animate(node, { y: target }, { duration: 0.14, ease: 'easeOut' }).then(finish);
    };

    controls.then(() => {
      if (!skipRef.current) return;
      skipRef.current = null;
      finish();
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
        onClick={() => skipRef.current?.()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') skipRef.current?.(); }}
        title="Tap to skip to the landing"
        className="relative cursor-pointer overflow-hidden rounded-lg border-2 border-white/15 bg-turf-900"
        style={{ height: ITEM_H }}
      >
        <div ref={reelRef} className="will-change-transform">
          {reel.map((team, i) => {
            // Nothing is locked out of the wheel any more. A franchise you have already
            // raided still comes around, which is the point, so it is marked rather than
            // greyed out. Only a genuinely empty roster is dimmed.
            const raided = visitedTeamIds.includes(team.id) && i < REEL_LEN - 1;
            const empty = getPool(position, team.id, era).every((p) => usedPlayerIds.includes(p.id));
            /*
              The reel is the single largest block of team colour in the game and you
              stare at it for the length of every spin, so it is the worst place to have
              a name you cannot read. White on Pittsburgh gold is 1.76:1 and on New
              Orleans it is 1.85:1, which is three seconds of unreadable franchise on
              every landing. The softer two lines keep their old weighting by taking the
              same ink at a lower opacity rather than being hardcoded to white.

              Judged at the LARGE TEXT threshold, which is what this type is. That is
              not a loosening, it is what stops the ink flipping between rows: Detroit
              and the Chargers are two blues nobody can tell apart that sit either side
              of the small text cutoff, and they turn up next to each other on the reel.
              At 3:1 only Pittsburgh and New Orleans flip, which are the two that are
              actually gold.
            */
            const ink = inkOn(team.primary, CONTRAST_LARGE_TEXT);
            return (
              <div
                key={`${team.id}-${i}`}
                className="flex items-center justify-between px-5"
                style={{
                  height: ITEM_H,
                  backgroundColor: team.primary,
                  boxShadow: `inset 0 -4px 0 ${team.secondary}`,
                  opacity: empty ? 0.32 : 1,
                }}
              >
                <div className="min-w-0">
                  <div
                    className="font-display text-2xl leading-none tracking-tight uppercase sm:text-3xl"
                    style={{ color: ink }}
                  >
                    {team.city} {team.name}
                  </div>
                  <div
                    className="font-mono text-[10px] tracking-[0.2em]"
                    style={{ color: ink, opacity: 0.6 }}
                  >
                    {empty ? 'NOBODY LEFT' : raided ? 'BEEN HERE ALREADY' : `${getPool(position, team.id, era).length} ${position}`}
                  </div>
                </div>
                <div
                  className="font-display text-4xl leading-none sm:text-5xl"
                  style={{ color: ink, opacity: 0.35 }}
                >
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
        <div className="pointer-events-none absolute right-2 bottom-1 font-mono text-[8px] tracking-widest text-white/35">
          TAP TO SKIP
        </div>
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
