import { useEffect, useState } from 'react';
import type { Era, Position } from '../data';
import { ERA_LABELS } from '../data';
import { loadLeaderboard } from '../lib/leaderboard';
import type { LeaderboardEntry } from '../lib/leaderboard';
import { ratingColor } from './AttributeBar';

type Props = { position: Position; era: Era };

export function Leaderboard({ position, era }: Props) {
  const filter = `${era}:${position}`;
  const [result, setResult] = useState<{
    filter: string;
    entries: LeaderboardEntry[];
    failed: boolean;
  }>({ filter: '', entries: [], failed: false });

  useEffect(() => {
    const controller = new AbortController();
    loadLeaderboard(position, era, controller.signal)
      .then((next) => {
        setResult({ filter, entries: next, failed: false });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setResult({ filter, entries: [], failed: true });
      });
    return () => controller.abort();
  }, [position, era, filter]);

  const current = result.filter === filter;
  const entries = current ? result.entries : [];
  const state = !current ? 'loading' : result.failed ? 'error' : 'ready';

  return (
    <section id="leaderboard" className="mt-10 scroll-mt-20">
      <div className="flex items-end justify-between gap-3">
        <h2 className="font-display text-2xl tracking-tight uppercase">Leaderboard</h2>
        <span className="font-mono text-[10px] tracking-wider text-white/35">
          {ERA_LABELS[era].toUpperCase()} · {position}
        </span>
      </div>

      {state === 'loading' && (
        <p className="mt-3 font-mono text-[11px] text-white/35">Loading builds…</p>
      )}
      {state === 'error' && (
        <p className="mt-3 rounded-lg border border-white/10 bg-turf-800 px-3 py-3 font-mono text-[11px] text-white/40">
          Leaderboard unavailable right now.
        </p>
      )}
      {state === 'ready' && entries.length === 0 && (
        <p className="mt-3 rounded-lg border border-white/10 bg-turf-800 px-3 py-3 font-mono text-[11px] text-white/40">
          No builds yet. Name the first one.
        </p>
      )}
      {state === 'ready' && entries.length > 0 && (
        <ol className="mt-3 space-y-2">
          {entries.map((entry, index) => (
            <li
              key={`${entry.name}-${entry.submittedAt}-${index}`}
              className="flex items-center gap-3 rounded-lg border border-white/12 bg-turf-800 px-3 py-2.5"
            >
              <span className="w-5 shrink-0 text-center font-mono text-xs font-bold text-white/30">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-lg leading-tight tracking-tight uppercase">
                  {entry.name}
                </span>
                <span className="block font-mono text-[10px] tracking-wider text-white/35">
                  {entry.trophies} TROPH{entry.trophies === 1 ? 'Y' : 'IES'} · {entry.seasons} SEA
                  {entry.hardMode && ' · HARD'}
                </span>
              </span>
              <span
                className="shrink-0 font-display text-3xl leading-none tabular-nums"
                style={{ color: ratingColor(entry.overall) }}
              >
                {entry.overall}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
