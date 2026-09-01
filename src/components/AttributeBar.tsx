import { ATTRIBUTE_ABBR, ATTRIBUTE_LABELS } from '../data';
import type { AttributeKey } from '../data';

/**
 * FOUR BANDS, ON THE ROUND NUMBERS. The color IS the information, so it has to be
 * information somebody can hold in their head.
 *
 * This used to be six bands on 95, 88, 78, 66 and 52, which meant an 89 and a 79 were
 * different colours for no reason a player could name, and gold at 95 sat one shade off
 * the hazard yellow the interface already uses for buttons. Nobody reads a scale they
 * cannot predict, so the edges are now the numbers football people already say out loud.
 *
 *   90 and up   green    an actual strength
 *   80 to 89    yellow   fine, and not what wins you anything
 *   70 to 79    grey     filler
 *   under 70    red      a hole, and half your overall comes from your two worst
 */
export function ratingColor(value: number): string {
  if (value >= 90) return '#22c55e';
  if (value >= 80) return '#facc15';
  if (value >= 70) return '#94a3b8';
  return '#ef4444';
}

type Props = {
  attribute: AttributeKey;
  value: number;
  compact?: boolean;
};

export function AttributeBar({ attribute, value, compact }: Props) {
  const color = ratingColor(value);
  return (
    <div className="flex items-center gap-2">
      <span
        className="w-10 shrink-0 font-mono text-[10px] tracking-wider text-white/45"
        title={ATTRIBUTE_LABELS[attribute]}
      >
        {ATTRIBUTE_ABBR[attribute]}
      </span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span
        className="w-6 shrink-0 text-right font-mono text-[11px] font-bold tabular-nums"
        style={{ color }}
      >
        {value}
      </span>
      {!compact && <span className="sr-only">{ATTRIBUTE_LABELS[attribute]}</span>}
    </div>
  );
}
