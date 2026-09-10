import { useEffect, useState } from 'react';
import { ATTRIBUTE_LABELS, ATTRIBUTE_SETS, TEAMS_BY_ID } from '../data';
import { ERA_LABELS } from '../data';
import type { AttributeKey, Era, Position } from '../data';
import type { FilledSlot } from '../store/gameStore';
import { GATES, RECORD_YARDS, accoladeDefs, allProFloor, softestSlot, spikeAt } from '../lib/scoring';
import type { CareerResult } from '../lib/scoring';
import { STAT_LABELS, careerLength, careerPath, careerStats, commas, draftSlot } from '../lib/career';
import {
  bestSeasonLine, draftBadge, draftLine, emptyCaseLine, franchisesRaided, honorsLine,
  missedBecause, productionLine, ringMissLine, tenureLine,
} from '../lib/narrative';
import type { RunShape } from '../lib/narrative';
import { inkOn, teamMark } from '../lib/contrast';
import { Chevron, Ring, RingBroken, TrophyIcon } from './Icons';
import { deflate, fanfare, heartbeat } from '../lib/audio';
import { ratingColor } from './AttributeBar';

type Props = {
  position: Position;
  /** Which league he was built out of. Every gate on this page is read against it. */
  era: Era;
  slots: Partial<Record<AttributeKey, FilledSlot>>;
  /** Which slot was filled first. The franchises behind these are the ones in play. */
  pickOrder: AttributeKey[];
  career: CareerResult;
  seed: string;
  hardMode: boolean;
  creationName: string;
  onName: (name: string) => void;
  onRestart: () => void;
  soundOn: boolean;
  /**
   * Reopening a saved player out of the hall rather than finishing a run.
   *
   * The reveal is a first-time thing. Sitting through the count up, seven heartbeats
   * and the ring again to look at a player you built last week is not suspense, it is a
   * loading screen, and the outcome was decided the day he was built. So a replay opens
   * fully revealed and silent, and the name is set rather than editable.
   */
  replay?: boolean;
};

/** Reveal stages. The OUTCOME is already decided — this only paces the telling. */
type Stage = 'overall' | 'rolling' | 'ring' | 'done';

/**
 * Every block on the report is a numbered section, and that is the whole layout idea.
 *
 * The old report was six boxes of the same weight stacked on each other, so a reader had
 * to work out where the story stopped and the receipts started. Numbering them gives the
 * page an order to be read in, which is what makes it hold together as one thing worth
 * sending somebody rather than a pile of panels.
 */
function Section({ index, title, aside, children }: {
  index: string;
  title: string;
  aside?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-white/10 px-5 py-4">
      <div className="mb-3 flex items-baseline gap-2">
        <span className="font-mono text-[10px] font-bold text-hazard tabular-nums">{index}</span>
        <h3 className="font-mono text-[10px] tracking-[0.2em] text-white/45">{title}</h3>
        {aside && (
          <span className="ml-auto font-mono text-[10px] tracking-[0.15em] text-white/30">{aside}</span>
        )}
      </div>
      {children}
    </section>
  );
}

export function ResultsScreen({
  position, era, slots, pickOrder, career, seed, hardMode, creationName,
  onName, onRestart, soundOn, replay = false,
}: Props) {
  const [stage, setStage] = useState<Stage>(replay ? 'done' : 'overall');
  const [copy, setCopy] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [counter, setCounter] = useState(0);
  const defs = accoladeDefs(position, era);
  const keys = ATTRIBUTE_SETS[position];

  /**
   * THE WHOLE REPORT IS REBUILT FROM THE SEED RIGHT HERE, and nothing but the season
   * count is read off the frozen career.
   *
   * Every one of these is a pure function of (position, build, overall, seed), so a
   * saved player opened out of the hall next month rebuilds the identical draft slot,
   * the identical uniforms and the identical stat line without any of it having been
   * written to storage. A player saved before careers had a length in them has no
   * `seasons` on his record, which is the one case the fallback is for.
   */
  const length = careerLength(position, career.overall, seed);
  const seasons = typeof career.seasons === 'number' ? career.seasons : length.seasons;
  const build: Partial<Record<AttributeKey, number>> = {};
  for (const key of keys) build[key] = slots[key]?.value ?? 0;

  /** How the career actually went. Three lines on this screen need it. */
  const run: RunShape = { seasons, expected: length.expected, cutShort: length.cutShort };

  const draft = draftSlot(position, career.overall, seed);
  const path = careerPath(position, career.overall, seasons, franchisesRaided(position, pickOrder, slots), seed, era);
  const stats = careerStats(position, build, career.overall, seasons, seed);
  const labels = STAT_LABELS[position];
  /** The lowest number he actually has, which the weak link box talks about. */
  const softest = softestSlot(position, build);

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
  const shareUrl = `${window.location.origin}${window.location.pathname}?seed=${seed}`;

  /** Which uniform he was wearing in a given season, for the bar chart below. */
  const teamInSeason = (season: number) =>
    path.stints.find((s) => season >= s.from && season <= s.to)?.team ?? path.stints[0]?.team ?? null;

  const peakSeasonYards = Math.max(1, ...stats.seasons.map((s) => s.yards));

  const tiles: { label: string; value: string; note?: string; sub?: string }[] = [
    {
      label: labels.yards,
      value: commas(stats.yards),
      /*
        Read off the YARDS rather than off the trophy, and those are the same thing for
        anybody built since the record became a yardage total. They come apart for a
        player saved before that, whose accolades are frozen under the old rule: his case
        keeps the trophy he was given, which is the promise the hall makes, but the tile
        would otherwise have stamped ALL-TIME RECORD on a number sitting well under it.
      */
      note: stats.yards >= RECORD_YARDS[position] ? 'ALL-TIME RECORD' : undefined,
    },
    { label: labels.touchdowns, value: commas(stats.touchdowns) },
    /*
      The fourth tile is where a whole pick used to go missing. A quarterback's mobility
      produced nothing on this screen at all, so it takes the slot attempts used to have:
      completions against attempts is not a decision anybody made on the build sheet and
      running for a thousand yards is. A back keeps his receptions and gets the yards that
      go with them underneath, since catching is a slot he spent a spin on.
    */
    position === 'QB'
      ? { label: labels.secondaryYards ?? 'RUSHING YARDS', value: commas(stats.secondaryYards) }
      : { label: labels.volume, value: commas(stats.volume) },
    labels.secondary
      ? {
        label: labels.secondary,
        value: commas(stats.secondary),
        sub: labels.secondaryYards && position !== 'QB'
          ? `${commas(stats.secondaryYards)} YARDS`
          : undefined,
      }
      : {
        label: 'YARDS PER CATCH',
        value: (stats.yards / Math.max(1, stats.volume)).toFixed(1),
      },
  ];

  /**
   * WHAT THIS BUTTON USED TO PUT ON THE CLIPBOARD, under the label COPY SEED, was a two
   * line sentence with a link somewhere inside it. Paste that into the seed box and it
   * came out as a legal 32 character seed that plays a different game, which is most of
   * what "seeds r also broken" turned out to mean. It now copies the link and nothing
   * else, and the seed box knows how to read a link.
   *
   * It also used to fire and forget, so it said COPIED whether or not anything reached
   * the clipboard. navigator.clipboard does not exist at all on a plain http origin,
   * which is exactly how a phone reaches a laptop's dev server, and it can reject on a
   * denied permission anywhere. So the write is awaited and a failure says so, with the
   * link printed underneath to hold and copy by hand.
   */
  async function copyLink() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('no clipboard on this origin');
      await navigator.clipboard.writeText(shareUrl);
      setCopy('copied');
    } catch {
      setCopy('failed');
    }
    window.setTimeout(() => setCopy('idle'), 4000);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="overflow-hidden rounded-xl border-2 border-white/15 bg-turf-900">
        {/* Both halves of this bar wrapped onto two lines each on a phone. */}
        <div className="flex items-center justify-between gap-2 bg-hazard px-4 py-1.5">
          <span className="truncate font-display text-[11px] tracking-[0.15em] text-turf-950 uppercase sm:text-sm sm:tracking-[0.2em]">
            GridironLab · Career Report
          </span>
          <span className="shrink-0 font-mono text-[10px] font-bold whitespace-nowrap text-turf-950">
            {hardMode ? 'HARD · ' : ''}{seed}
          </span>
        </div>

        {/*
          THE NAMEPLATE.

          NAME YOUR PLAYER used to come off an iPhone reading NAME YOUR PLAY, and the
          reason it never showed up on a Mac is the font stack. That is fixed at the font
          level now, but the sizing stays defensive: a long name still has to be readable
          back, and a name you cannot read is not worth typing.
        */}
        <div className="flex items-end justify-between gap-3 px-5 py-5 sm:gap-4">
          <div className="min-w-0 flex-1">
            {replay ? (
              <h2
                className={`w-full font-display leading-none tracking-tighter uppercase sm:text-4xl md:text-5xl ${
                  creationName.length > 20 ? 'text-base' : creationName.length > 14 ? 'text-lg' : 'text-2xl'
                }`}
              >
                {creationName}
              </h2>
            ) : (
              <input
                value={creationName}
                onChange={(e) => onName(e.target.value)}
                placeholder="NAME YOUR PLAYER"
                className={`w-full bg-transparent font-display leading-none tracking-tighter uppercase placeholder:text-white/25 focus:outline-none sm:text-4xl md:text-5xl ${
                  creationName.length > 20 ? 'text-base' : creationName.length > 14 ? 'text-lg' : 'text-2xl'
                }`}
              />
            )}
            {!replay && (
              <div className="mt-2">
                <div className={`font-mono text-[10px] tracking-wider ${
                  creationName.trim() ? 'text-emerald-300' : 'text-white/35'
                }`}>
                  {creationName.trim()
                    ? 'Saved to YOUR BUILDS.'
                    : 'Name your player to save him in YOUR BUILDS.'}
                </div>
              </div>
            )}
            {/*
              The league he was built out of sits here rather than in the seed stamp, and
              it is always named, in both eras. Two reports off the same seed hold two
              completely different players depending on which pools were open, so a report
              that only marked one of the two would leave the reader working out which
              this was from whether the names look familiar.
            */}
            <div className="mt-1.5 font-mono text-[10px] tracking-[0.15em] text-white/40 sm:text-[11px] sm:tracking-[0.2em]">
              {position} · {ERA_LABELS[era].toUpperCase()} · {seasons} SEASON{seasons === 1 ? '' : 'S'} · {path.stints.length} TEAM{path.stints.length === 1 ? '' : 'S'}
            </div>
            {/*
              Where he went in the draft, up top where a football card puts it. It used to
              be nowhere on the report at all, which meant the story started in the middle.
            */}
            <div className="mt-2 inline-block rounded border border-white/20 bg-white/6 px-2 py-1 font-mono text-[10px] font-bold tracking-[0.12em] text-white/70">
              {draftBadge(draft)}
            </div>
          </div>
          <div className="shrink-0 text-center">
            <div
              className="font-display text-5xl leading-none tabular-nums sm:text-7xl"
              style={{ color: ratingColor(stage === 'overall' ? counter : career.overall) }}
            >
              {stage === 'overall' ? counter : career.overall}
            </div>
            <div className="font-mono text-[10px] tracking-[0.15em] text-white/40 sm:tracking-[0.2em]">
              OVERALL
            </div>
          </div>
        </div>

        {/*
          01 THE CAREER. Every word of it derived from the run that already happened, and
          assembled in src/lib/narrative.ts rather than out of fragments here.

          The honours sentence is held back until the reveal is over, and only that
          sentence. Telling somebody he made the Hall of Fame directly above seven
          heartbeats and a Super Bowl reveal would hand him the ending first, which is
          the one thing the reveal exists to avoid.
        */}
        <Section index="01" title="THE CAREER">
          <p className="text-[14px] leading-relaxed text-white/85">
            <b className="text-white">{draftLine(draft, path.drafted)}</b>{' '}
            {tenureLine(seasons, path.stints, length.cutShort)}{' '}
            {productionLine(position, stats)}
            {stage === 'done' && <> {honorsLine(career)}</>}
          </p>
        </Section>

        {/*
          02 THE NUMBERS. A rating is an opinion and a stat line is a receipt, and the
          report only ever had the opinion on it. These come out of the same simulation
          the record trophy is judged against, so a player who owns the record is holding
          a number you can see him owning it with.
        */}
        <Section index="02" title="THE NUMBERS" aside={`${seasons} SEASON${seasons === 1 ? '' : 'S'}`}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {tiles.map((tile) => (
              <div key={tile.label} className="rounded-lg bg-turf-800 px-3 py-2.5">
                <div className="font-stat text-2xl leading-none font-bold tabular-nums text-white sm:text-3xl">
                  {tile.value}
                </div>
                <div className="mt-1 font-mono text-[9px] leading-tight tracking-[0.1em] text-white/40">
                  {tile.label}
                </div>
                {tile.sub && (
                  <div className="mt-0.5 font-mono text-[9px] tracking-[0.1em] text-white/30">
                    {tile.sub}
                  </div>
                )}
                {tile.note && (
                  <div className="mt-1 font-mono text-[9px] font-bold tracking-[0.1em] text-hazard">
                    {tile.note}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/*
            SEASON BY SEASON, coloured by whose uniform he was in at the time. This is the
            one graphic on the report that shows a career having a shape: the ramp, the
            peak, the decline, and the year everything went right. A table of totals
            cannot show any of that.

            Four seasons is the floor for drawing it. Below that the bars are wider than
            they are tall and it reads as three blocks of colour rather than as a chart,
            which is worse than not drawing one.
          */}
          {stats.seasons.length >= 4 && (
            <div className="mt-3">
              <div className="flex h-16 items-end gap-[3px] border-b border-white/15">
                {stats.seasons.map((line) => {
                  const team = teamInSeason(line.season);
                  const isBest = line.season === stats.best.season;
                  // Bars stop at 88% so the best-season marker has somewhere to sit.
                  const height = `${Math.max(6, (line.yards / peakSeasonYards) * 88)}%`;
                  return (
                    <div
                      key={line.season}
                      title={`Season ${line.season}: ${commas(line.yards)} yards, ${line.touchdowns} TD`}
                      className="relative flex h-full min-w-0 flex-1 items-end"
                    >
                      <div
                        className="w-full rounded-t-sm"
                        style={{
                          height,
                          // teamMark rather than the raw primary. Twenty two of the
                          // thirty two primaries are invisible on this card, and a bar
                          // has no text in it to give the colour away.
                          backgroundColor: team ? teamMark(team.primary, team.secondary) : '#3b4655',
                        }}
                      />
                      {/*
                        The marker sits ABOVE the bar rather than outlining it, and that
                        is not a style preference. It was a gold outline on the bar, and
                        Pittsburgh's colour is the same gold, so on the one career where
                        you most wanted to see which year was the big one it was invisible.
                        On the card behind the bars, hazard reads against every franchise.
                      */}
                      {isBest && (
                        <span
                          aria-hidden
                          className="absolute inset-x-0 mx-auto h-1.5 w-1.5 rounded-full bg-hazard"
                          style={{ bottom: `calc(${height} + 4px)` }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-1 flex items-baseline justify-between font-mono text-[9px] tracking-[0.1em] text-white/30">
                <span>SEASON 1</span>
                <span>SEASON {seasons}</span>
              </div>
            </div>
          )}

          {/*
            The best season gets its own line rather than being squeezed between the two
            axis labels, where on a phone it wrapped into them and the three ran together
            as one paragraph. It also has to survive the chart not being drawn at all,
            since a short career still had a best year.
          */}
          <div className="mt-2 rounded-lg bg-turf-800 px-3 py-2.5">
            <div className="font-mono text-[10px] tracking-[0.2em] text-white/40">BEST SEASON</div>
            <p className="mt-1 text-[13px] leading-snug text-white/85">{bestSeasonLine(position, stats)}</p>
          </div>
        </Section>

        {/*
          03 THE UNIFORMS. This used to be every franchise you stole from, which meant a
          report could tell you with a straight face that he played for seven teams.
          Nobody plays for seven teams. See careerPath in src/lib/career.ts for how many
          he really gets and which of them wanted him.
        */}
        {path.stints.length > 0 && (
          <Section index="03" title="THE UNIFORMS">
            {/*
              Three columns, not four. The year range used to be spelled out as YEARS 1 TO
              3 next to a separate season count, which between them left 94px for the
              franchise name on a phone and truncated the Denver Broncos.
            */}
            <ol className="space-y-1.5">
              {path.stints.map((stint) => (
                <li key={stint.team.id + stint.from} className="flex items-center gap-2.5">
                  <span
                    className="w-11 shrink-0 rounded py-1 text-center font-mono text-[10px] font-bold"
                    style={{ backgroundColor: stint.team.primary, color: inkOn(stint.team.primary) }}
                  >
                    {stint.team.abbr}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13px] text-white/80">
                    {stint.team.city} {stint.team.name}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] tabular-nums whitespace-nowrap text-white/35">
                    {stint.from === stint.to ? `YR ${stint.from}` : `YRS ${stint.from}-${stint.to}`}
                  </span>
                  <span className="shrink-0 text-right font-mono text-[11px] tabular-nums whitespace-nowrap text-white/65">
                    {stint.seasons} SEA
                  </span>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {/*
          04 THE BUILD. Every trait credited back to whoever you took it from, with the
          two lines that explain the rating sitting directly under it: the hole that cost
          him, and the one thing he was genuinely great at.
        */}
        <Section index="04" title="THE BUILD" aside={`${keys.length} PICKS`}>
          {/*
            THERE WAS A CAPTION HERE AND IT IS GONE. It read "who you stole from, which is
            not who he played for", and it existed because the two team lists on this
            report mean different things and look identical. The answer from the first
            person to read it was "why would it be who he played for", which is the right
            answer: nobody arrives at this table expecting it to be a career history. It
            was a sentence explaining a confusion that only its author had.
          */}
          <div className="overflow-hidden rounded-lg bg-turf-800">
            {keys.map((key) => {
              const slot = slots[key];
              if (!slot) return null;
              const team = TEAMS_BY_ID[slot.teamId];
              return (
                <div key={key} className="flex items-center gap-3 border-b border-white/6 px-3 py-2 last:border-b-0">
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
                      className="rounded px-1.5 py-px font-mono text-[9px] font-bold"
                      style={{ backgroundColor: team.primary, color: inkOn(team.primary) }}
                    >
                      {team.abbr}
                    </span>
                    <span className="truncate text-[11px] text-white/55">{slot.playerName}</span>
                  </span>
                </div>
              );
            })}
          </div>

          {/*
            The weak link keeps its billing. Half the overall comes from the two worst
            numbers, so if this is buried people just read the rating as broken.
          */}
          <div
            className="mt-3 rounded-lg border-l-4 bg-turf-800 py-2.5 pr-3 pl-3"
            style={{ borderLeftColor: ratingColor(softest.value) }}
          >
            <div className="font-mono text-[10px] tracking-[0.2em] text-white/40">THE WEAK LINK</div>
            {/*
              "No hole to find" is pinned to the All-Pro floor rather than to a round 90,
              because the game now has an opinion about where a hole starts and this box
              was disagreeing with it. A build whose softest number was 90 was told there
              was no hole in him on the same screen that the All-Pro vote had just turned
              him down over exactly that number.

              That floor is read per position now, so a tight end whose softest number is
              88 is told there is no hole in him and the All-Pro vote agrees with the box.
              See allProFloor in src/lib/scoring.ts.

              AND IT READS THE CARD RATHER THAN THE RATING'S OPINION OF THE CARD. This
              used to run off breakdown.weakest, which is the lowest number AFTER the
              position weights have had their say, so a quarterback with a 92 clutch and
              nothing else under 95 was told nothing on him dropped below 95 with the 92
              sitting three rows up the same screen. See softestSlot in scoring.ts.
            */}
            {/*
              THE THIRD SENTENCE, and it exists because playing the current league found
              the box telling a true thing that read as a lie.

              A hole-free current mode build lands around 91 and first-team All-Pro asks
              for 92, so the screen said "there is no hole to find" directly above a trophy
              case holding nothing. Both halves were correct and the reader is not wrong to
              call that a contradiction: he was told he built a complete player and handed
              an empty case, with no word about what actually went wrong.

              What went wrong is not a hole, it is the ceiling. Every number was good and
              none was good enough, which is a different sentence and the honest one. It is
              said only when it applies, so a build that clears the gate still just gets
              told there is no hole in him.
            */}
            <p className="mt-1 text-[13px] leading-snug text-white/85">
              {softest.value >= allProFloor(position, era) ? (
                <>
                  Nothing on him drops below{' '}
                  <b style={{ color: ratingColor(softest.value) }}>{softest.value}</b>
                  . There is no hole to find.
                  {career.overall < GATES.allPro && (
                    <> Every number was good and not one of them was good enough, which is
                    what a whole league of good players hands you.</>
                  )}
                </>
              ) : (
                <>
                  His softest number is{' '}
                  <b style={{ color: ratingColor(softest.value) }}>
                    {ATTRIBUTE_LABELS[softest.attribute].toLowerCase()} at {softest.value}
                  </b>
                  {/*
                    THIS BOX NO LONGER EXPLAINS THE POINT SYSTEM AT ALL.

                    It used to say the hole cost him a couple of points and the votes that
                    go with them, which is two invented currencies in one sentence. The
                    first fix only deleted the words and kept the lesson, "your worst two
                    numbers are half of the rating", and the note back was that nobody
                    asked for the lesson either. So it says what the soft number is and
                    how bad it is, and that is all. The three figures underneath are there
                    for anybody who wants to work the rest out.
                  */}
                  {softest.value >= 86
                    ? '. That is a soft spot rather than a hole.'
                    : softest.value >= 75
                      ? '. That is soft enough to hurt him.'
                      : '. That is a hole.'}
                </>
              )}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[10px] text-white/45">
              <span>AVERAGE OF THE {keys.length} <b className="text-white/75">{career.breakdown.weightedMean}</b></span>
              <span>WORST TWO <b className="text-white/75">{career.breakdown.weakAnchor}</b></span>
              {/* The bar is the league's own, so this label has to read it rather than the
                  constant. Printing 97+ over a count taken at 96 is the same report
                  contradicting itself this screen keeps getting caught doing. */}
              <span>TRAITS AT {spikeAt(position, era)}+ <b className="text-white/75">{career.breakdown.spikeCount}</b></span>
            </div>
          </div>

          {/* What he was actually great at, which the trophy case alone can miss entirely. */}
          {(() => {
            const top = keys
              .map((k) => ({ k, slot: slots[k] }))
              .filter((x) => x.slot)
              .sort((a, b) => (b.slot!.value - a.slot!.value))[0];
            if (!top?.slot || top.slot.value < 90) return null;
            const team = TEAMS_BY_ID[top.slot.teamId];
            return (
              <div className="mt-2 rounded-lg border-l-4 border-hazard bg-turf-800 py-2.5 pr-3 pl-3">
                <div className="font-mono text-[10px] tracking-[0.2em] text-white/40">
                  WHAT HE WAS KNOWN FOR
                </div>
                <p className="mt-1 text-[13px] leading-snug text-white/85">
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
        </Section>

        {/* 05 SUPER BOWL */}
        <Section index="05" title="SUPER BOWL SUNDAY">
          {stage === 'overall' && (
            <div className="py-3 text-center font-mono text-[11px] tracking-[0.2em] text-white/35">
              WATCHING THE TAPE BACK…
            </div>
          )}

          {stage === 'rolling' && (
            <div className="py-2 text-center">
              <div className="font-display text-3xl tracking-tight text-white/80 uppercase">
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
              <div className="flex justify-center">
                {career.superBowl.won
                  ? <Ring className="h-11 w-11 text-hazard" />
                  : <RingBroken className="h-11 w-11 text-red-400/80" />}
              </div>
              <div className="mt-1 font-display text-2xl tracking-tight uppercase sm:text-3xl">
                {career.superBowl.won ? 'Super Bowl Champion' : 'Never won the big one'}
              </div>
              {/*
                THIRD VERSION OF THIS LINE, AND THE LAST ONE WITH ANY MATHS IN IT.

                It started as "39% odds · rolled 88.1", which a tester read as a rating.
                Rewriting it as a sentence about a coin fixed the ambiguity and kept the
                arithmetic, so the same tester flagged it again, this time on a win. Two
                rounds of feedback on one sentence is the game telling you the numbers
                were never the problem worth solving.

                A broadcast does not read you the odds after the whistle. It tells you
                what happened. The roll is still what decides it, it is simply no longer
                read out, exactly like every gate on this screen.
              */}
              <div className="mt-1 font-mono text-[11px] text-white/45">
                {career.superBowl.won
                  ? 'He got his ring, and nobody can take that off him now.'
                  : ringMissLine(career.overall)}
              </div>
            </div>
          )}
        </Section>

        {/* 06 TROPHY CASE */}
        {stage === 'done' && (
          <div className="animate-[slotpop_300ms_ease-out]">
            <Section index="06" title="THE TROPHY CASE" aside={`${earned.length} OF ${defs.length}`}>
              <div className="flex flex-wrap gap-2">
                {earned.map((d) => (
                  <div
                    key={d.id}
                    className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 ${
                      d.id === 'hof' ? 'border-hazard bg-hazard/15' : 'border-white/20 bg-white/6'
                    }`}
                  >
                    <TrophyIcon
                      id={d.trophy}
                      className={`h-6 w-6 shrink-0 ${d.id === 'hof' ? 'text-hazard' : 'text-white/85'}`}
                    />
                    <span className="font-display text-sm uppercase">{d.label}</span>
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
                    {emptyCaseLine(career.overall, career.breakdown.spikeCount, run)}
                  </div>
                )}
              </div>

              {missed.length > 0 && (
                <details className="group mt-4">
                  {/*
                    list-none plus the webkit marker rule kills the browser's own arrow.
                    It is the last piece of stock UI chrome on this screen, and it does not
                    match a single other control in the app.
                  */}
                  <summary className="flex cursor-pointer list-none items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] text-white/35 uppercase [&::-webkit-details-marker]:hidden">
                    <Chevron className="h-3.5 w-3.5 shrink-0 -rotate-90 transition-transform group-open:rotate-0" />
                    What he missed out on ({missed.length})
                  </summary>
                  <ul className="mt-2 space-y-1">
                    {missed.map((d) => (
                      <li key={d.id} className="flex gap-2 font-mono text-[11px] text-white/35">
                        <TrophyIcon id={d.trophy} className="mt-px h-3.5 w-3.5 shrink-0 text-white/25" />
                        <span>
                          {d.label}:{' '}
                          <span className="text-white/25">
                            {missedBecause(d.id, position, career, run)}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </Section>
          </div>
        )}
      </div>

      {stage === 'done' && (
        <p className="mt-4 text-center font-mono text-[10px] leading-relaxed text-white/35">
          The seed replays this exact run, spin for spin, right down to the draft slot and
          the year his knee went. Send it to somebody and they face the identical wheel.
        </p>
      )}

      {stage === 'done' && (
        <>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={onRestart}
              className="flex-1 rounded-lg bg-hazard px-6 py-4 font-display text-2xl tracking-tight text-turf-950 uppercase transition-transform hover:scale-[1.02]"
            >
              {replay ? 'Back to the start' : 'Build another player'}
            </button>
            <button
              onClick={copyLink}
              className={`rounded-lg border-2 px-6 py-4 font-display text-2xl tracking-tight uppercase ${
                copy === 'failed'
                  ? 'border-red-500/60 text-red-300'
                  : 'border-white/25 hover:bg-white/10'
              }`}
            >
              {copy === 'copied' ? 'Copied' : copy === 'failed' ? 'Would not copy' : 'Copy link'}
            </button>
          </div>

          {/*
            Always on screen, not only when the copy fails. It is the seed in a form you
            can read out loud, hold to copy, or check against the one somebody sent you.
          */}
          <p className="mt-2 text-center font-mono text-[10px] break-all text-white/35 select-all">
            {shareUrl}
          </p>
          {copy === 'failed' && (
            <p className="mt-1 text-center font-mono text-[10px] text-red-400">
              This browser would not let the page write to the clipboard. Hold the link
              above and copy it by hand.
            </p>
          )}
        </>
      )}
    </div>
  );
}
