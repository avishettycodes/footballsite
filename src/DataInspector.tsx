import { useMemo, useState } from 'react';
import {
  ATTRIBUTE_SETS,
  DATA_STATS,
  ERAS,
  ERA_LABELS,
  ROSTERS,
  TEAMS,
  getPool,
  getTeam,
  validateData,
} from './data';
import type { Era, Position } from './data';
import { inkOn } from './lib/contrast';
import { PlayerCard } from './components/PlayerCard';
import { ratingColor } from './components/AttributeBar';

const POSITIONS: Position[] = ['QB', 'RB', 'WR', 'TE'];

/**
 * STEP 1 SCREEN — the data inspector.
 * This exists to prove the seed data loads and looks right. The actual game
 * (wheel, build sheet, results) replaces this in step 2.
 */
export default function DataInspector() {
  const [position, setPosition] = useState<Position>('RB');
  const [teamId, setTeamId] = useState<string>('bal');
  const [era, setEra] = useState<Era>('alltime');

  const issues = useMemo(() => validateData(), []);
  const pool = getPool(position, teamId, era);
  const team = getTeam(teamId);

  // League leaderboard per attribute — proves a perfect build is reachable.
  const leaders = useMemo(
    () =>
      ATTRIBUTE_SETS[position].map((key) => {
        const best = ROSTERS[era].filter((p) => p.position === position).reduce(
          (a, b) => ((b.attributes[key] ?? 0) > (a?.attributes[key] ?? -1) ? b : a),
          undefined as (typeof ROSTERS)[Era][number] | undefined,
        );
        return { key, best, value: best?.attributes[key] ?? 0 };
      }),
    [position, era],
  );

  return (
    <div className="min-h-full bg-turf-950">
      <header className="border-b border-white/10 bg-turf-900">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-4 py-5">
          <div>
            <h1 className="font-display text-4xl leading-none tracking-tighter uppercase sm:text-5xl">
              Build a <span className="text-hazard">99</span>
            </h1>
            <p className="mt-1 font-mono text-[11px] tracking-[0.2em] text-white/40 uppercase">
              Build a player · Steal his best part
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="rounded bg-white/8 px-2 py-1 text-white/60">
              {DATA_STATS.teams} FRANCHISES
            </span>
            <span className="rounded bg-white/8 px-2 py-1 text-white/60">
              {DATA_STATS.players} PLAYERS
            </span>
            <span
              className={`rounded px-2 py-1 font-bold ${
                issues.some((i) => i.level === 'error')
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-emerald-500/15 text-emerald-400'
              }`}
            >
              {issues.length === 0 ? 'DATA OK' : `${issues.length} ISSUE(S)`}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <p className="mb-5 rounded border border-hazard/25 bg-hazard/8 px-3 py-2 text-[12px] leading-snug text-hazard/85">
          <strong className="font-display tracking-wide">DATA INSPECTOR.</strong>{' '}
          Debug view of the seed pools.{' '}
          <a href="/" className="underline">Back to the game</a>
        </p>

        <div className="mb-4 flex gap-2">
          {ERAS.map((e) => (
            <button
              key={e}
              onClick={() => setEra(e)}
              className={`rounded px-4 py-2 font-display text-lg tracking-wide uppercase transition-colors ${
                era === e ? 'bg-sky-400 text-turf-950' : 'bg-turf-700 text-white/80 hover:bg-turf-600'
              }`}
            >
              {ERA_LABELS[e]}
              <span className="ml-2 font-mono text-[10px] opacity-60">
                {ROSTERS[e].length}
              </span>
            </button>
          ))}
        </div>

        <div className="mb-4 flex gap-2">
          {POSITIONS.map((pos) => {
            const count = DATA_STATS.byEra[era][pos];
            const live = count > 0;
            return (
              <button
                key={pos}
                disabled={!live}
                onClick={() => setPosition(pos)}
                className={`rounded px-4 py-2 font-display text-lg tracking-wide uppercase transition-colors ${
                  position === pos
                    ? 'bg-hazard text-turf-950'
                    : live
                      ? 'bg-turf-700 text-white/80 hover:bg-turf-600'
                      : 'cursor-not-allowed bg-turf-800 text-white/25'
                }`}
              >
                {pos}
                <span className="ml-2 font-mono text-[10px] opacity-60">
                  {live ? count : 'SOON'}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mb-6 grid grid-cols-4 gap-1 sm:grid-cols-8">
          {TEAMS.map((t) => {
            const size = getPool(position, t.id, era).length;
            const active = t.id === teamId;
            return (
              <button
                key={t.id}
                onClick={() => setTeamId(t.id)}
                title={`${t.city} ${t.name}, ${size} ${position}`}
                className={`relative rounded px-1 py-2 font-display text-sm tracking-wide transition-transform hover:scale-105 ${
                  active ? 'ring-2 ring-hazard' : ''
                }`}
                style={{
                  backgroundColor: t.primary,
                  color: inkOn(t.primary),
                  boxShadow: `inset 0 -3px 0 ${t.secondary}`,
                }}
              >
                {t.abbr}
                <span className="absolute top-0.5 right-1 font-mono text-[9px] opacity-70">
                  {size}
                </span>
              </button>
            );
          })}
        </div>

        <div
          className="mb-4 flex items-baseline gap-3 rounded px-4 py-3"
          style={{ background: `linear-gradient(90deg, ${team.primary}, transparent)` }}
        >
          <h2 className="font-display text-2xl tracking-tight uppercase">
            {team.city} {team.name}
          </h2>
          <span className="font-mono text-[11px] text-white/60">
            {pool.length} {position} IN THE POOL
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pool.map((p) => (
            <PlayerCard key={p.id} player={p} />
          ))}
        </div>

        <section className="mt-10">
          <h2 className="font-display text-xl tracking-wide uppercase">
            League leaders for {position}
          </h2>
          <p className="mb-3 font-mono text-[11px] text-white/40">
            The best number anyone in the league has for each slot. A perfect build takes
            every one of them.
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {leaders.map(({ key, best, value }) => (
              <div key={key} className="rounded border border-white/10 bg-turf-800 px-3 py-2">
                <div className="font-mono text-[10px] tracking-wider text-white/40">
                  {key.toUpperCase()}
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate font-display text-base tracking-tight uppercase">
                    {best?.name}
                  </span>
                  <span
                    className="font-mono text-lg font-bold tabular-nums"
                    style={{ color: ratingColor(value) }}
                  >
                    {value}
                  </span>
                </div>
                <div className="font-mono text-[10px] text-white/35">
                  {best ? getTeam(best.teamId).abbr : ''}
                </div>
              </div>
            ))}
          </div>
        </section>

        {issues.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-xl tracking-wide uppercase">Data warnings</h2>
            <ul className="mt-2 space-y-1 font-mono text-[11px] text-white/50">
              {issues.map((i) => (
                <li key={i.message}>
                  <span className={i.level === 'error' ? 'text-red-400' : 'text-amber-400'}>
                    {i.level}
                  </span>{' '}
                  {i.message}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <footer className="mt-8 border-t border-white/10 px-4 py-6 text-center font-mono text-[10px] leading-relaxed text-white/30">
        Build a 99 is a fan project. It has nothing to do with the NFL and no team has endorsed
        it. Team names are here so you know whose history you are digging through. Every
        rating was written by hand for fun, and none of it comes from a real scouting source.
        If you disagree with a number, you are probably right.
      </footer>
    </div>
  );
}
