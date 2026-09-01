import { useState } from 'react';
import type { SavedPlayer } from '../lib/hall';
import { accoladeDefs } from '../lib/scoring';
import { ratingColor } from './AttributeBar';
import { Close, TrophyIcon } from './Icons';

type Props = {
  hall: SavedPlayer[];
  onOpen: (player: SavedPlayer) => void;
  onDelete: (id: string) => void;
};

/**
 * THE HALL OF BUILDS on the start screen.
 *
 * Deliberately below the build button rather than above it. Somebody arriving here
 * wants to make a player, and a returning player still has to scroll past the thing he
 * came back to do. It only appears at all once he has kept somebody.
 */
export function HallOfBuilds({ hall, onOpen, onDelete }: Props) {
  /** Which row has had its delete armed. Two taps, because there is no undo. */
  const [armed, setArmed] = useState<string | null>(null);

  if (hall.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl tracking-tight uppercase">Your hall</h2>
      <p className="font-mono text-[11px] text-white/45">
        Everybody you named. Open one to read his career report again, exactly as it
        came out.
      </p>

      <ul className="mt-3 space-y-2">
        {hall.map((player) => {
          const trophies = accoladeDefs(player.position).filter((d) => player.career.accolades[d.id]);
          return (
            <li
              key={player.id}
              className="flex items-center gap-3 rounded-lg border border-white/12 bg-turf-800 pr-2 transition-colors hover:border-white/25"
            >
              <button onClick={() => onOpen(player)} className="flex min-w-0 flex-1 items-center gap-3 py-2.5 pl-3 text-left">
                <span
                  className="w-9 shrink-0 text-center font-display text-2xl leading-none tabular-nums"
                  style={{ color: ratingColor(player.career.overall) }}
                >
                  {player.career.overall}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-lg leading-tight tracking-tight uppercase">
                    {player.name}
                  </span>
                  <span className="block font-mono text-[10px] tracking-wider text-white/40">
                    {player.position} · {player.hardMode ? 'HARD · ' : ''}{player.seed}
                  </span>
                </span>
                {trophies.length > 0 && (
                  <span
                    className="flex shrink-0 items-center gap-1"
                    title={trophies.map((d) => d.label).join(', ')}
                  >
                    {trophies.map((d) => (
                      <TrophyIcon
                        key={d.id}
                        id={d.trophy}
                        className={`h-4 w-4 ${d.id === 'hof' ? 'text-hazard' : 'text-white/45'}`}
                      />
                    ))}
                  </span>
                )}
              </button>

              {armed === player.id ? (
                <span className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => { onDelete(player.id); setArmed(null); }}
                    className="rounded border border-red-500/60 px-2 py-1 font-mono text-[10px] font-bold tracking-wider text-red-300 hover:bg-red-500/15"
                  >
                    DELETE
                  </button>
                  <button
                    onClick={() => setArmed(null)}
                    className="rounded px-2 py-1 font-mono text-[10px] tracking-wider text-white/45 hover:text-white/80"
                  >
                    KEEP
                  </button>
                </span>
              ) : (
                <button
                  onClick={() => setArmed(player.id)}
                  title={`Forget ${player.name}`}
                  aria-label={`Forget ${player.name}`}
                  className="shrink-0 rounded px-3 py-3 text-white/30 hover:text-red-300"
                >
                  <Close className="h-4 w-4" />
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
