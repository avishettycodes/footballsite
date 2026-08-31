import { ATTRIBUTE_LABELS, ATTRIBUTE_SETS, TEAMS_BY_ID } from '../data';
import type { AttributeKey, Position } from '../data';
import type { FilledSlot } from '../store/gameStore';
import { ratingColor } from './AttributeBar';

type Props = {
  position: Position;
  slots: Partial<Record<AttributeKey, FilledSlot>>;
  highlight?: AttributeKey | null;
};

export function BuildSheet({ position, slots, highlight }: Props) {
  const keys = ATTRIBUTE_SETS[position];
  const filled = keys.filter((k) => slots[k]);
  const avg = filled.length
    ? Math.round(filled.reduce((sum, k) => sum + (slots[k]?.value ?? 0), 0) / filled.length)
    : 0;

  return (
    <div className="rounded-lg border border-white/10 bg-turf-900">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 className="font-display text-lg tracking-tight uppercase">Build sheet</h2>
        <span className="font-mono text-[11px] text-white/45">
          {filled.length}/{keys.length}
        </span>
      </div>

      <ul className="divide-y divide-white/6">
        {keys.map((key) => {
          const slot = slots[key];
          const isTarget = highlight === key;
          return (
            <li
              key={key}
              className={`px-4 py-2.5 transition-colors ${
                isTarget ? 'bg-hazard/12' : slot ? '' : 'opacity-55'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] tracking-[0.15em] text-white/50">
                  {ATTRIBUTE_LABELS[key]}
                </span>
                <span
                  className="font-mono text-lg leading-none font-bold tabular-nums"
                  style={{ color: slot ? ratingColor(slot.value) : '#3b4655' }}
                >
                  {slot ? slot.value : '--'}
                </span>
              </div>
              {slot ? (
                <div className="mt-1 flex items-center gap-1.5">
                  <span
                    className="rounded px-1.5 py-px font-mono text-[9px] font-bold"
                    style={{ backgroundColor: TEAMS_BY_ID[slot.teamId].primary, color: '#fff' }}
                  >
                    {TEAMS_BY_ID[slot.teamId].abbr}
                  </span>
                  <span className="truncate text-[11px] text-white/55">{slot.playerName}</span>
                </div>
              ) : (
                <div className="mt-1 h-[15px] font-mono text-[10px] text-white/25">empty</div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
        <span className="font-mono text-[10px] tracking-[0.15em] text-white/45">AVG SO FAR</span>
        <span className="font-display text-2xl leading-none" style={{ color: ratingColor(avg) }}>
          {filled.length ? avg : '--'}
        </span>
      </div>
    </div>
  );
}
