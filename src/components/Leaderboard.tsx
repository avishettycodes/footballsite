import type { Era } from '../data';
import { ERA_LABELS } from '../data';
import type { SavedPlayer } from '../lib/hall';
import { LEADERBOARD_POSITIONS, rankLeaderboard } from '../lib/leaderboard';
import { ratingColor } from './AttributeBar';

type Props = { hall: SavedPlayer[]; era: Era };

export function Leaderboard({ hall, era }: Props) {
  return (
    <section id="leaderboard" className="mt-10 scroll-mt-20">
      <div className="flex items-end justify-between gap-3">
        <h2 className="font-display text-2xl tracking-tight uppercase">Leaderboard</h2>
        <span className="font-mono text-[10px] tracking-wider text-white/35">
          {ERA_LABELS[era].toUpperCase()} · SAVED BUILDS
        </span>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {LEADERBOARD_POSITIONS.map((position) => {
          const entries = rankLeaderboard(hall, era, position, 5);
          return (
            <section key={position} className="overflow-hidden rounded-lg border border-white/12 bg-turf-800">
              <h3 className="border-b border-white/10 px-3 py-2 font-display text-lg tracking-wide text-hazard uppercase">
                {position}
              </h3>
              {entries.length === 0 ? (
                <p className="px-3 py-3 font-mono text-[10px] text-white/35">No saved builds yet.</p>
              ) : (
                <ol>
                  {entries.map((entry, index) => (
                    <li
                      key={entry.id}
                      className="flex items-center gap-2 border-b border-white/8 px-3 py-2 last:border-b-0"
                    >
                      <span className="w-4 shrink-0 text-center font-mono text-[10px] font-bold text-white/30">
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-display text-base leading-tight tracking-tight uppercase">
                          {entry.name}
                        </span>
                        <span className="block font-mono text-[9px] tracking-wider text-white/35">
                          {entry.trophies} TROPH{entry.trophies === 1 ? 'Y' : 'IES'}
                          {entry.hardMode && ' · HARD'}
                        </span>
                      </span>
                      <span
                        className="shrink-0 font-display text-2xl leading-none tabular-nums"
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
        })}
      </div>
    </section>
  );
}
