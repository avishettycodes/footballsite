import { ATTRIBUTE_LABELS, ATTRIBUTE_SETS, TEAMS, TEAMS_BY_ID, getPool } from '../data';
import type { AttributeKey, Position } from '../data';
import type { FilledSlot } from '../store/gameStore';
import { ratingColor } from './AttributeBar';
import { inkOn } from '../lib/contrast';

type Props = {
  position: Position;
  slots: Partial<Record<AttributeKey, FilledSlot>>;
  highlight?: AttributeKey | null;
  usedPlayerIds?: string[];
};

/** A slot is "covered" by a franchise if it still has an unused player with a good one. */
const GOOD_ENOUGH = 90;

export function BuildSheet({ position, slots, highlight, usedPlayerIds = [] }: Props) {
  const keys = ATTRIBUTE_SETS[position];
  const filled = keys.filter((k) => slots[k]);
  const open = keys.filter((k) => !slots[k]);

  /**
   * The sentence you actually want by the middle of a run. Counting in your head which
   * franchises can still solve catching is work the screen should be doing for you.
   */
  // Every franchise stays in the wheel in both modes, so scarcity is now purely about
  // who is left on the rosters rather than about which teams you have used up.
  const reachable = TEAMS;
  const scarcity = open
    .map((key) => ({
      key,
      teams: reachable.filter((t) =>
        getPool(position, t.id).some(
          (p) => !usedPlayerIds.includes(p.id) && (p.attributes[key] ?? 0) >= GOOD_ENOUGH,
        ),
      ).length,
    }))
    .sort((a, b) => a.teams - b.teams);
  const hardest = scarcity[0];

  /**
   * A bare count does not tell you whether you are in trouble. Sixteen franchises with
   * three spins left is comfortable; four franchises with two spins left is not. This is
   * the chance that no franchise able to solve your hardest slot ever comes up again.
   */
  const risk = hardest && reachable.length
    ? Math.pow((reachable.length - hardest.teams) / reachable.length, open.length)
    : 0;
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
                    style={{ backgroundColor: TEAMS_BY_ID[slot.teamId].primary, color: inkOn(TEAMS_BY_ID[slot.teamId].primary) }}
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

      {hardest && (
        <div className="border-t border-white/10 px-4 py-3">
          <div className="font-mono text-[10px] tracking-[0.15em] text-white/45">
            HARDEST SLOT LEFT
          </div>
          <p className="mt-1 text-[12px] leading-snug text-white/80">
            <b className="text-hazard">{ATTRIBUTE_LABELS[hardest.key]}</b>
            {hardest.teams === 0
              ? '. Nobody left anywhere has a good one. Take the best you can find.'
              : hardest.teams === 1
                ? '. Exactly one franchise can still solve it.'
                : `. ${hardest.teams} franchises can still solve it.`}
          </p>
          <p className="mt-1 font-mono text-[10px] text-white/40">
            {open.length} spin{open.length === 1 ? '' : 's'} to go
          </p>
          {risk > 0.2 && (
            <p className="mt-1.5 rounded bg-red-500/15 px-2 py-1 font-mono text-[10px] text-red-300">
              {risk > 0.6
                ? 'You are probably not getting a good one. Start planning around it.'
                : 'Getting tight. There is a real chance it never comes up again.'}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
        <span className="font-mono text-[10px] tracking-[0.15em] text-white/45">AVG SO FAR</span>
        <span className="font-display text-2xl leading-none" style={{ color: ratingColor(avg) }}>
          {filled.length ? avg : '--'}
        </span>
      </div>
    </div>
  );
}
