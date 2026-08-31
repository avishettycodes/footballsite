import { ATTRIBUTE_ABBR, ATTRIBUTE_LABELS } from '../data';
import type { AttributeKey } from '../data';

/** Elite traits glow, joke traits rot. The color IS the information. */
export function ratingColor(value: number): string {
  if (value >= 95) return '#ffd400';
  if (value >= 88) return '#4ade80';
  if (value >= 78) return '#a3e635';
  if (value >= 66) return '#94a3b8';
  if (value >= 52) return '#fb923c';
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
