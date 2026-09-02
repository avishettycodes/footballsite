import { useState } from 'react';
import { ATTRIBUTE_LABELS, ATTRIBUTE_SETS, getTeam } from '../data';
import type { AttributeKey, Player, Position } from '../data';
import { ratingColor } from './AttributeBar';
import { CaretDown, CaretUp } from './Icons';

type Selection = { player: Player; attribute: AttributeKey } | null;

type Props = {
  position: Position;
  pool: Player[];
  usedPlayerIds: string[];
  slots: Partial<Record<AttributeKey, unknown>>;
  onSteal: (playerId: string, attribute: AttributeKey) => void;
  onHover: (attribute: AttributeKey | null) => void;
  /**
   * Hard mode. Every rating in the pool renders as a question mark and no colour is
   * spent on it, so the only things left to pick on are the name, the era and the blurb.
   *
   * THE POOL IS BLIND, YOUR BUILD IS NOT. The number you take lands on the build sheet
   * the moment you take it, because a game where you cannot see what you already have is
   * not harder, it is unplayable. Everything hidden here is hidden on the way in.
   *
   * The best and worst callout goes with the numbers rather than staying as a hint. It
   * is a rating read out in words, and leaving it up would be the same information
   * wearing a different coat.
   */
  blind?: boolean;
};

export function PoolPicker({ position, pool, usedPlayerIds, slots, onSteal, onHover, blind = false }: Props) {
  const [selection, setSelection] = useState<Selection>(null);
  const keys = ATTRIBUTE_SETS[position];

  return (
    <>
      {blind && (
        <p className="mb-3 rounded border border-red-500/40 bg-red-500/10 px-3 py-2 font-mono text-[11px] leading-relaxed tracking-wide text-red-300">
          Hard mode hides the ratings. You find out what you took once it is on your
          build sheet.
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {pool.map((player) => {
          const spent = usedPlayerIds.includes(player.id);
          const team = getTeam(player.teamId);
          /*
            Every card is a pitch and a punchline, and an unmarked row of eight bars is
            neither. Marking the best and worst makes "elite at one thing, hopeless at
            another" readable in the second you spend looking at it, which is the whole
            reason a 38 is funny rather than just short.
          */
          const ranked = [...keys].sort(
            (a, b) => (player.attributes[b] ?? 0) - (player.attributes[a] ?? 0),
          );
          const bestKey = ranked[0];
          const worstKey = ranked[ranked.length - 1];
          const bestValue = player.attributes[bestKey] ?? 0;
          const worstValue = player.attributes[worstKey] ?? 0;
          return (
            <article
              key={player.id}
              className={`overflow-hidden rounded-lg border bg-turf-800 transition-all ${
                spent
                  ? 'border-white/5 opacity-40 grayscale'
                  : selection?.player.id === player.id
                    ? 'border-hazard shadow-[0_0_0_1px_var(--color-hazard)]'
                    : 'border-white/10 hover:border-white/25'
              }`}
            >
              <div className="h-1 w-full" style={{ backgroundColor: team.primary }} />
              <div className="flex items-baseline justify-between gap-2 px-4 pt-3">
                <h3 className="truncate font-display text-lg leading-tight tracking-tight uppercase">
                  {player.name}
                </h3>
                <span className="shrink-0 font-mono text-[10px] text-white/40">{player.era}</span>
              </div>
              <p className="px-4 pt-1 text-[12px] leading-snug text-white/55 italic">
                {spent ? 'You already took something off him. Move on.' : player.blurb}
              </p>
              {!spent && !blind && (
                <p className="flex flex-wrap items-center gap-x-3 px-4 pt-1.5 font-mono text-[10px] tracking-wide">
                  <span className="inline-flex items-center gap-1" style={{ color: ratingColor(bestValue) }}>
                    <CaretUp className="h-2.5 w-2.5" />
                    {ATTRIBUTE_LABELS[bestKey]} {bestValue}
                  </span>
                  {worstValue <= 60 && (
                    <span className="inline-flex items-center gap-1 text-red-400">
                      <CaretDown className="h-2.5 w-2.5" />
                      {ATTRIBUTE_LABELS[worstKey]} {worstValue}
                    </span>
                  )}
                </p>
              )}

              <div className="mt-2 grid grid-cols-2 gap-1 px-3 pb-3">
                {keys.map((key) => {
                  const value = player.attributes[key] ?? 0;
                  const taken = Boolean(slots[key]);
                  const disabled = spent || taken;
                  const active =
                    selection?.player.id === player.id && selection.attribute === key;
                  return (
                    <button
                      key={key}
                      disabled={disabled}
                      onMouseEnter={() => !disabled && onHover(key)}
                      onMouseLeave={() => onHover(null)}
                      onClick={() => setSelection({ player, attribute: key })}
                      className={`flex items-center justify-between rounded px-2 py-1.5 text-left transition-colors ${
                        active
                          ? 'bg-hazard text-turf-950'
                          : disabled
                            ? 'cursor-not-allowed bg-white/3 text-white/20'
                            : 'bg-white/6 hover:bg-white/12'
                      }`}
                      title={taken ? 'You already filled that slot' : ATTRIBUTE_LABELS[key]}
                    >
                      <span className="flex min-w-0 items-center gap-1 font-mono text-[9px] tracking-wider">
                        {key === bestKey && !disabled && !active && !blind && (
                          <CaretUp className="h-2 w-2 shrink-0" />
                        )}
                        <span className="truncate">{ATTRIBUTE_LABELS[key]}</span>
                      </span>
                      <span
                        className="ml-1 font-mono text-[13px] leading-none font-bold tabular-nums"
                        style={{
                          color: active
                            ? '#07090c'
                            : disabled
                              ? undefined
                              : blind
                                ? '#7c8698'
                                : ratingColor(value),
                        }}
                      >
                        {blind ? '?' : value}
                      </span>
                    </button>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>

      {/* Confirm bar. Two steps, so a mis-tap can't burn a slot. */}
      {selection && (
        <div className="sticky bottom-3 z-30 mt-4 animate-[slotpop_180ms_ease-out]">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border-2 border-hazard bg-turf-900/95 px-4 py-3 backdrop-blur">
            <div className="min-w-0">
              <div className="font-mono text-[10px] tracking-[0.2em] text-white/50">STEALING</div>
              {/* The number comes off the confirm bar too in hard mode. It is the last
                  place the rating could leak before you commit to it. */}
              <div className="truncate font-display text-xl tracking-tight uppercase">
                {selection.player.name} ·{' '}
                <span className="text-hazard">{ATTRIBUTE_LABELS[selection.attribute]}</span> ·{' '}
                {blind ? '?' : selection.player.attributes[selection.attribute]}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelection(null)}
                className="rounded px-3 py-2 font-display text-sm tracking-wide text-white/60 uppercase hover:text-white"
              >
                Back
              </button>
              <button
                onClick={() => {
                  onSteal(selection.player.id, selection.attribute);
                  setSelection(null);
                  onHover(null);
                }}
                className="rounded bg-hazard px-6 py-2 font-display text-lg tracking-wide text-turf-950 uppercase transition-transform hover:scale-105"
              >
                Steal it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
