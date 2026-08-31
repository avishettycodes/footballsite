import { useEffect, useState } from 'react';
import { ATTRIBUTE_LABELS, ATTRIBUTE_SETS, TEAMS_BY_ID } from '../data';
import type { Position } from '../data';
import type { FilledSlot } from '../store/gameStore';
import { GATES, accoladeDefs, superBowlOdds } from '../lib/scoring';
import type { AccoladeId, CareerResult } from '../lib/scoring';
import { deflate, fanfare, heartbeat } from '../lib/audio';
import { ratingColor } from './AttributeBar';

type Props = {
  position: Position;
  slots: Partial<Record<import('../data').AttributeKey, FilledSlot>>;
  career: CareerResult;
  seed: string;
  hardMode: boolean;
  creationName: string;
  onName: (name: string) => void;
  onRestart: () => void;
  soundOn: boolean;
};

/** Reveal stages. The OUTCOME is already decided — this only paces the telling. */
type Stage = 'overall' | 'rolling' | 'ring' | 'done';

/**
 * How close he came, in words, never in numbers.
 *
 * This screen used to print the requirement straight off the accolade definition, so
 * "WHAT HE MISSED OUT ON" read "Offensive Player of the Year: Overall 94+ with 4 traits
 * at 95 or better". That turns a game into a spec sheet. Nobody tells you what 17-0 or
 * 82-0 needs either, and finding out by playing is the whole appeal.
 *
 * The gates are still READ here to work out how near he was. They are simply never
 * shown. The requirement strings on the definitions stay where they are, unused by the
 * UI, because they are what the calibration script reports against.
 */
function nearness(gap: number): string {
  if (gap <= 1) return 'He missed it by a hair.';
  if (gap <= 3) return 'He was close, and close is not what the voters reward.';
  if (gap <= 7) return 'Close enough to argue about at the bar. Not close enough to win it.';
  return 'He was never in that conversation.';
}

function missedBecause(id: AccoladeId, career: CareerResult, durability: number): string {
  switch (id) {
    case 'proBowl':
      return nearness(GATES.proBowl - career.overall);
    case 'allPro':
      return nearness(GATES.allPro - career.overall);
    case 'mvp':
      return nearness(GATES.mvp - career.overall);
    case 'opoy':
      return career.overall >= GATES.opoy
        ? 'The rating was there. They wanted more of him at the very top of the league.'
        : nearness(GATES.opoy - career.overall);
    case 'record':
      return durability < GATES.recordDurability
        ? 'He was not on the field enough to chase it.'
        : nearness(GATES.recordOverall - career.overall);
    case 'superBowl':
      return 'The coin did not come up for him.';
    case 'hof':
      return 'Not enough on the mantelpiece to get him in.';
  }
}

export function ResultsScreen({
  position, slots, career, seed, hardMode, creationName, onName, onRestart, soundOn,
}: Props) {
  const [stage, setStage] = useState<Stage>('overall');
  const [copied, setCopied] = useState(false);
  const [counter, setCounter] = useState(0);
  const defs = accoladeDefs(position);
  const odds = superBowlOdds(career.overall);

  // Count the overall up. Cosmetic only — reads career.overall, never rolls anything.
  useEffect(() => {
    if (stage !== 'overall') return;
    let v = 0;
    const id = setInterval(() => {
      v += Math.max(1, Math.round((career.overall - v) / 6));
      if (v >= career.overall) { v = career.overall; clearInterval(id); setTimeout(() => setStage('rolling'), 700); }
      setCounter(v);
    }, 45);
    return () => clearInterval(id);
  }, [stage, career.overall]);

  // Suspense beat before the ring is shown. Again: reveal only.
  useEffect(() => {
    if (stage !== 'rolling') return;
    let beat = 0;
    const id = setInterval(() => {
      if (soundOn) heartbeat(beat);
      if (++beat >= 7) {
        clearInterval(id);
        setStage('ring');
        if (soundOn) (career.superBowl.won ? fanfare : deflate)();
        setTimeout(() => setStage('done'), 1400);
      }
    }, 340);
    return () => clearInterval(id);
  }, [stage, soundOn, career.superBowl.won]);

  const earned = defs.filter((d) => career.accolades[d.id]);
  const missed = defs.filter((d) => !career.accolades[d.id]);

  return (
    <div className="mx-auto max-w-3xl">
      {/* SHARE CARD */}
      <div className="overflow-hidden rounded-xl border-2 border-white/15 bg-turf-900">
        <div className="flex items-center justify-between bg-hazard px-4 py-1.5">
          <span className="font-display text-sm tracking-[0.2em] text-turf-950 uppercase">
            Megatron · Career Report
          </span>
          <span className="font-mono text-[10px] font-bold text-turf-950">
            {hardMode ? 'HARD MODE · ' : ''}{seed}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 px-5 py-5">
          <div className="min-w-0 flex-1">
            <input
              value={creationName}
              onChange={(e) => onName(e.target.value)}
              placeholder="NAME YOUR PLAYER"
              className="w-full bg-transparent font-display text-3xl leading-none tracking-tighter uppercase placeholder:text-white/25 focus:outline-none sm:text-5xl"
            />
            <div className="mt-1 font-mono text-[11px] tracking-[0.2em] text-white/40">
              {position} · BUILT OUT OF {new Set(Object.values(slots).map((s) => s?.teamId)).size} TEAMS
            </div>
          </div>
          <div className="text-center">
            <div
              className="font-display text-6xl leading-none tabular-nums sm:text-7xl"
              style={{ color: ratingColor(stage === 'overall' ? counter : career.overall) }}
            >
              {stage === 'overall' ? counter : career.overall}
            </div>
            <div className="font-mono text-[10px] tracking-[0.2em] text-white/40">OVERALL</div>
          </div>
        </div>

        {/*
          The weak link gets top billing. Half the overall comes from the two worst
          numbers, so if this is buried people just read the rating as broken.
        */}
        <div className="mx-5 mb-4 rounded-lg border-l-4 bg-turf-800 py-3 pr-4 pl-4"
             style={{ borderLeftColor: ratingColor(career.breakdown.weakest.value) }}>
          <div className="font-mono text-[10px] tracking-[0.2em] text-white/40">
            THE WEAK LINK
          </div>
          <p className="mt-1 text-[14px] leading-snug text-white/85">
            {career.breakdown.weakest.value >= 90 ? (
              <>
                Nothing on him drops below{' '}
                <b style={{ color: ratingColor(career.breakdown.weakest.value) }}>
                  {career.breakdown.weakest.value}
                </b>
                . There is no hole to find, which is most of why the number held up.
              </>
            ) : (
              <>
                His softest number is{' '}
                <b style={{ color: ratingColor(career.breakdown.weakest.value) }}>
                  {ATTRIBUTE_LABELS[career.breakdown.weakest.attribute].toLowerCase()} at{' '}
                  {career.breakdown.weakest.value}
                </b>
                {career.breakdown.weakest.value >= 86
                  ? '. That is a soft spot rather than a hole, and it cost him a couple of points.'
                  : career.breakdown.weakest.value >= 75
                    ? '. Half of the overall comes from your two worst numbers, so that cost you a few points.'
                    : '. Half of the overall comes from your two worst numbers, so a hole that size costs far more than any one big number gave back.'}
              </>
            )}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[10px] text-white/45">
            <span>AVERAGE OF THE EIGHT <b className="text-white/75">{career.breakdown.weightedMean}</b></span>
            <span>WORST TWO <b className="text-white/75">{career.breakdown.weakAnchor}</b></span>
            <span>ELITE TRAITS <b className="text-white/75">{career.breakdown.eliteCount}</b></span>
          </div>
        </div>

        {/* What he was actually great at, which the trophy case alone can miss entirely. */}
        {(() => {
          const keys = ATTRIBUTE_SETS[position];
          const top = keys
            .map((k) => ({ k, slot: slots[k] }))
            .filter((x) => x.slot)
            .sort((a, b) => (b.slot!.value - a.slot!.value))[0];
          if (!top?.slot || top.slot.value < 90) return null;
          const team = TEAMS_BY_ID[top.slot.teamId];
          return (
            <div className="mx-5 mb-4 rounded-lg border-l-4 border-hazard bg-turf-800 py-3 pr-4 pl-4">
              <div className="font-mono text-[10px] tracking-[0.2em] text-white/40">
                WHAT HE WAS KNOWN FOR
              </div>
              <p className="mt-1 text-[14px] leading-snug text-white/85">
                {top.slot.value >= 97
                  ? 'Nobody in the league had better '
                  : top.slot.value >= 93
                    ? 'One of the best in football at '
                    : 'He made his living on '}
                <b className="text-hazard">{ATTRIBUTE_LABELS[top.k].toLowerCase()}</b>
                {', a '}
                <b style={{ color: ratingColor(top.slot.value) }}>{top.slot.value}</b>
                {' you took off '}
                {top.slot.playerName} in {team.city}.
              </p>
            </div>
          );
        })()}

        {/* THE HEIST. Every trait credited back to whoever you took it from. */}
        <div className="border-t border-white/10">
          {ATTRIBUTE_SETS[position].map((key) => {
            const slot = slots[key];
            if (!slot) return null;
            const team = TEAMS_BY_ID[slot.teamId];
            return (
              <div key={key} className="flex items-center gap-3 border-b border-white/6 px-5 py-2">
                <span className="w-28 shrink-0 font-mono text-[10px] tracking-wider text-white/45">
                  {ATTRIBUTE_LABELS[key]}
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${slot.value}%`, backgroundColor: ratingColor(slot.value) }}
                  />
                </div>
                <span
                  className="w-7 shrink-0 text-right font-mono text-sm font-bold tabular-nums"
                  style={{ color: ratingColor(slot.value) }}
                >
                  {slot.value}
                </span>
                <span className="hidden w-44 shrink-0 items-center gap-1.5 sm:flex">
                  <span
                    className="rounded px-1.5 py-px font-mono text-[9px] font-bold text-white"
                    style={{ backgroundColor: team.primary }}
                  >
                    {team.abbr}
                  </span>
                  <span className="truncate text-[11px] text-white/55">{slot.playerName}</span>
                </span>
              </div>
            );
          })}
        </div>

        {/* SUPER BOWL */}
        <div className="px-5 py-5">
          {stage === 'overall' && (
            <div className="text-center font-mono text-[11px] tracking-[0.2em] text-white/35">
              WATCHING THE TAPE BACK…
            </div>
          )}

          {stage === 'rolling' && (
            <div className="text-center">
              <div className="font-mono text-[11px] tracking-[0.2em] text-white/45">
                SUPER BOWL ODDS · {(odds * 100).toFixed(0)}%
              </div>
              <div className="mt-2 font-display text-3xl tracking-tight text-white/80 uppercase">
                <span className="inline-block animate-pulse">The ring is being decided</span>
              </div>
            </div>
          )}

          {(stage === 'ring' || stage === 'done') && (
            <div
              className={`animate-[slotpop_400ms_ease-out] rounded-lg border-2 px-4 py-5 text-center ${
                career.superBowl.won
                  ? 'border-hazard bg-hazard/12'
                  : 'border-red-500/60 bg-red-500/10'
              }`}
            >
              <div className="text-4xl">{career.superBowl.won ? '💍' : '💔'}</div>
              <div className="mt-1 font-display text-2xl tracking-tight uppercase sm:text-3xl">
                {career.superBowl.won ? 'Super Bowl Champion' : 'Never won the big one'}
              </div>
              {/*
                This used to read "39% odds · rolled 88.1", and a tester asked why it
                said 88 when his average was 93. Two bare numbers side by side, one a
                rating and one a coin, and nothing on screen saying which was which. The
                coin is now a sentence about a coin, so it cannot be read as a rating.
              */}
              <div className="mt-1 font-mono text-[11px] text-white/45">
                He needed the coin to come in under {(odds * 100).toFixed(0)} out of 100.
                It came up {(career.superBowl.roll * 100).toFixed(0)}.
                {career.superBowl.won
                  ? ' He got there.'
                  : career.overall >= 92
                    ? ' Ninety plus overall and no ring. That one stings.'
                    : ' He was never really in it.'}
              </div>
            </div>
          )}
        </div>

        {/* TROPHY CASE */}
        {stage === 'done' && (
          <div className="animate-[slotpop_300ms_ease-out] border-t border-white/10 px-5 py-5">
            <div className="flex flex-wrap gap-2">
              {earned.map((d) => (
                <div
                  key={d.id}
                  className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 ${
                    d.id === 'hof' ? 'border-hazard bg-hazard/15' : 'border-white/20 bg-white/6'
                  }`}
                >
                  <span className="text-xl">{d.trophy}</span>
                  <span className="font-display text-sm tracking-tight uppercase">{d.label}</span>
                </div>
              ))}
              {/*
                An empty trophy case is not the same story every time. This line landed
                on a build carrying four traits at 99 and told him he was nobody, which
                is the framing we already fixed once at the signature trait level and
                missed here. A player that good with nothing to show for it was robbed,
                and the weak link box above has already said by what.
              */}
              {earned.length === 0 && (
                <div className="font-display text-xl text-white/40 uppercase">
                  {career.breakdown.eliteCount >= 3
                    ? `${career.breakdown.eliteCount} traits at the very top of the league and an empty case. This one was a robbery.`
                    : career.breakdown.eliteCount >= 1
                      ? 'A real weapon in there and nothing to show for it.'
                      : 'The trophy case is empty. Somebody has to play the other games.'}
                </div>
              )}
              {earned.length > 0 && earned.length < 3 && position === 'TE' && (
                <div className="w-full font-mono text-[11px] text-white/40">
                  Tight end is the hard one. Getting this far with a seven slot build is
                  more than it looks like.
                </div>
              )}
            </div>

            {missed.length > 0 && (
              <details className="mt-4">
                <summary className="cursor-pointer font-mono text-[10px] tracking-[0.2em] text-white/35 uppercase">
                  What he missed out on ({missed.length})
                </summary>
                <ul className="mt-2 space-y-1">
                  {missed.map((d) => (
                    <li key={d.id} className="font-mono text-[11px] text-white/35">
                      <span className="opacity-40">{d.trophy}</span> {d.label}:{' '}
                      <span className="text-white/25">
                        {missedBecause(d.id, career, slots.durability?.value ?? 0)}
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
      </div>

      {stage === 'done' && (
        <p className="mt-4 text-center font-mono text-[10px] leading-relaxed text-white/35">
          The seed replays this exact run, spin for spin. Send it to somebody and they
          face the identical wheel, so you get to find out who builds the better player.
        </p>
      )}

      {stage === 'done' && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={onRestart}
            className="flex-1 rounded-lg bg-hazard px-6 py-4 font-display text-2xl tracking-tight text-turf-950 uppercase transition-transform hover:scale-[1.02]"
          >
            Build another player
          </button>
          <button
            onClick={() => {
              const url = `${window.location.origin}${window.location.pathname}?seed=${seed}`;
              void navigator.clipboard?.writeText(
                `${creationName || 'My player'} came out at ${career.overall} overall with ${earned.length} accolade(s). ` +
                `Same seed gives you the same spins, so see if you can do better: ${url}`,
              );
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2600);
            }}
            className="rounded-lg border-2 border-white/25 px-6 py-4 font-display text-2xl tracking-tight uppercase hover:bg-white/10"
          >
            {copied ? 'Copied' : 'Copy seed'}
          </button>
        </div>
      )}
    </div>
  );
}
