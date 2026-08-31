import { useState } from 'react';
import { ATTRIBUTE_LABELS, ATTRIBUTE_SETS, getTeam } from '../data';
import type { AttributeKey, Player, Position } from '../data';
import { ratingColor } from './AttributeBar';

type Selection = { player: Player; attribute: AttributeKey } | null;

type Props = {
  position: Position;
  pool: Player[];
  usedPlayerIds: string[];
  slots: Partial<Record<AttributeKey, unknown>>;
  onSteal: (playerId: string, attribute: AttributeKey) => void;
  onHover: (attribute: AttributeKey | null) => void;
};

export function PoolPicker({ position, pool, usedPlayerIds, slots, onSteal, onHover }: Props) {
  const [selection, setSelection] = useState<Selection>(null);
  const keys = ATTRIBUTE_SETS[position];

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {pool.map((player) => {
          const spent = usedPlayerIds.includes(player.id);
          const team = getTeam(player.teamId);
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
                      <span className="truncate font-mono text-[9px] tracking-wider">
                        {ATTRIBUTE_LABELS[key]}
                      </span>
                      <span
                        className="ml-1 font-mono text-[13px] leading-none font-bold tabular-nums"
                        style={{ color: active ? '#07090c' : disabled ? undefined : ratingColor(value) }}
                      >
                        {value}
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
              <div className="truncate font-display text-xl tracking-tight uppercase">
                {selection.player.name} ·{' '}
                <span className="text-hazard">{ATTRIBUTE_LABELS[selection.attribute]}</span> ·{' '}
                {selection.player.attributes[selection.attribute]}
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
