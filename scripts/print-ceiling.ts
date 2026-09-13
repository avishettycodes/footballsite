/**
 * What the very best build at a position actually earns, and what it cannot earn.
 *
 * TWO QUESTIONS, BOTH ASKED BY PLAYERS RATHER THAN BY A CHECK.
 *
 * The first came from a tight end run that went seven for seven, averaged 97, and missed
 * the Hall of Fame. The player's words were "deadass what do i gotta do", which is a
 * reasonable question and one the results screen deliberately never answers, since
 * learning the shape of the thresholds by playing is the point. It is a much less
 * reasonable question to leave unanswered in the repo, because if the answer is "nothing"
 * then the position has a bar it cannot clear and this project calls that a bug wearing a
 * difficulty costume.
 *
 * The second came from the same conversation: is a 99 overall possible at all when a
 * position's source data does not hand every trait a literal 99. It is a sharper question
 * than it looks, because the overall is half weighted mean and half weak link anchor, so
 * the ceiling is set by the WORST slot the league can fill rather than by the best. Current
 * mode now answers it in the card model: its actual source leaders display as 99,
 * and the ordinary scoring formula still has to grade the finished build.
 *
 * WHAT PERFECT MEANS HERE. The ceiling build takes the highest number in the league at
 * every slot. It ignores the constraint that you only get seven franchise landings, so it
 * is an upper bound rather than a target: nothing a person can actually play beats it.
 * When it comes back under 99
 * the position cannot reach 99 by any route at all, which is the answer the question
 * wanted.
 *
 * THE RING IS A COIN AND IS TREATED AS ONE. Every trophy but the Super Bowl is a pure
 * function of the build, so they are read once. The ring is a seeded roll, and the Hall of
 * Fame counts it, so both are measured over a sweep of seeds and reported as rates.
 *
 *   npm run ceiling
 *   npm run ceiling -- alltime
 */
import { ATTRIBUTE_LABELS, ATTRIBUTE_SETS, ERAS, ROSTERS, TEAMS, getPool, positionsWithData } from '../src/data';
import type { AttributeKey, Era, Position } from '../src/data';
import {
  GATES, allProFloor, computeOverall, gateShift, mvpFloor, simulateCareer,
  spikeAt, spikeTraitsRequired,
} from '../src/lib/scoring';

const args = process.argv.slice(2).map((a) => a.toLowerCase());
const eras: Era[] = ERAS.filter((e) => args.includes(e));
const chosen: Era[] = eras.length ? eras : ['current'];

/** Enough rolls that a rate is stable to a tenth. */
const SEEDS = 4000;

function leagueBest(position: Position, era: Era): Record<string, { value: number; who: string }> {
  const out: Record<string, { value: number; who: string }> = {};
  const pool = ROSTERS[era].filter((p) => p.position === position);
  for (const key of ATTRIBUTE_SETS[position]) {
    let best = { value: -1, who: '' };
    for (const p of pool) {
      const v = p.attributes[key] ?? 0;
      if (v > best.value) best = { value: v, who: p.name };
    }
    out[key] = best;
  }
  return out;
}

/**
 * HOW MANY DOORS LEAD TO A NUMBER, which is the difference between reachable and real.
 *
 * "A 99 exists in the league" and "you can get one" are not the same claim. You land on
 * seven franchises, so a trait whose only 99 sits in one room is a trait you reach by
 * landing there AND spending that particular pick there. Counting the rooms that can
 * answer a slot at a given bar is what turns the ceiling from a fact about the data into a
 * fact about a run.
 */
function roomsOffering(position: Position, era: Era, key: AttributeKey, bar: number): number {
  return TEAMS.filter((t) => {
    const pool = getPool(position, t.id, era);
    return pool.length > 0 && Math.max(...pool.map((p) => p.attributes[key] ?? 0)) >= bar;
  }).length;
}

/** Trophy rates for one fixed build, sweeping only the seed. */
function rates(position: Position, build: Partial<Record<AttributeKey, number>>, era: Era) {
  const tally = { allPro: 0, opoy: 0, mvp: 0, record: 0, superBowl: 0, hof: 0 };
  for (let i = 0; i < SEEDS; i++) {
    const c = simulateCareer(position, build, `CEIL${i}`, era);
    for (const k of Object.keys(tally) as (keyof typeof tally)[]) {
      if (c.accolades[k]) tally[k]++;
    }
  }
  const pct = (n: number) => `${((n / SEEDS) * 100).toFixed(1)}%`;
  return { tally, pct };
}

function requirements(position: Position, era: Era) {
  const shift = gateShift(position, era);
  return [
    `All-Pro  overall ${GATES.allPro + shift}+, nothing under ${allProFloor(position, era)}`,
    `OPOY     overall ${GATES.opoy + shift}+, ${spikeTraitsRequired(position)} traits at ${spikeAt(position, era)}+`,
    `MVP      overall ${GATES.mvp + shift}+, nothing under ${mvpFloor(position, era)}`,
  ];
}

for (const era of chosen) {
  console.log(`\n${'#'.repeat(72)}`);
  console.log(`# ${era.toUpperCase()} — is a 99 overall reachable?`);
  console.log('#'.repeat(72));

  for (const position of positionsWithData(era)) {
    const best = leagueBest(position, era);
    const build: Partial<Record<AttributeKey, number>> = {};
    for (const key of ATTRIBUTE_SETS[position]) build[key] = best[key].value;
    const breakdown = computeOverall(position, build, era);

    console.log(`\n${position}  ceiling build, the best number in the league at every slot:`);
    for (const key of ATTRIBUTE_SETS[position]) {
      console.log(
        `    ${ATTRIBUTE_LABELS[key].padEnd(16)} ${String(best[key].value).padStart(3)}  ` +
        `${best[key].who.padEnd(22)} of 32 rooms, ` +
        `${String(roomsOffering(position, era, key, 99)).padStart(2)} offer a 99 and ` +
        `${String(roomsOffering(position, era, key, mvpFloor(position, era))).padStart(2)} clear the MVP floor of ${mvpFloor(position, era)}`,
      );
    }
    /*
      The binding slot is the lowest one, not the average. Half the overall is the weak
      link anchor, so a single slot the league cannot fill above the low nineties holds the
      whole number down no matter what the other six are.
    */
    const floorKey = ATTRIBUTE_SETS[position].reduce(
      (lo, k) => ((build[k] ?? 0) < (build[lo] ?? 0) ? k : lo),
      ATTRIBUTE_SETS[position][0],
    );
    console.log(
      `  overall ${breakdown.overall}  (mean ${breakdown.weightedMean}, anchor ${breakdown.weakAnchor})  ` +
      `${breakdown.overall >= 99 ? 'LEAGUE-WIDE UPPER BOUND IS 99 (run npm run verify:99 for a legal path)' : `99 IS IMPOSSIBLE, held down by ${ATTRIBUTE_LABELS[floorKey]} ${build[floorKey]}`}`,
    );

    const { tally, pct } = rates(position, build, era);
    console.log(
      `  a perfect build wins:  All-Pro ${pct(tally.allPro)}   OPOY ${pct(tally.opoy)}   ` +
      `MVP ${pct(tally.mvp)}   record ${pct(tally.record)}   ring ${pct(tally.superBowl)}   ` +
      `Hall of Fame ${pct(tally.hof)}`,
    );
    for (const line of requirements(position, era)) console.log(`    ${line}`);
  }
}

/**
 * The build a player actually posted, run through the same machinery.
 *
 * He called it seven for seven and the average is 97, which is why it is worth measuring
 * rather than waving away: this is roughly the best card anybody is going to assemble at
 * the position without the league handing him something it does not stock.
 */
const POSTED: { label: string; position: Position; era: Era; build: Partial<Record<AttributeKey, number>> } = {
  label: 'the 7/7 tight end a player posted',
  position: 'TE',
  era: 'current',
  build: {
    hands: 99, routeRunning: 98, yac: 99, toughness: 98, size: 97, blocking: 96, speed: 93,
  },
};

console.log(`\n${'#'.repeat(72)}`);
console.log(`# ${POSTED.label}`);
console.log('#'.repeat(72));
{
  const { position, era, build } = POSTED;
  const breakdown = computeOverall(position, build, era);
  const average = ATTRIBUTE_SETS[position].reduce((n, k) => n + (build[k] ?? 0), 0)
    / ATTRIBUTE_SETS[position].length;
  console.log(
    `\n  ${ATTRIBUTE_SETS[position].map((k) => `${ATTRIBUTE_LABELS[k]} ${build[k]}`).join(', ')}`,
  );
  console.log(
    `  raw average ${average.toFixed(1)}, overall ${breakdown.overall} ` +
    `(mean ${breakdown.weightedMean}, anchor ${breakdown.weakAnchor}), ` +
    `${breakdown.spikeCount} traits at the spike bar of ${spikeAt(position, era)}`,
  );
  const { tally, pct } = rates(position, build, era);
  console.log(
    `  wins:  All-Pro ${pct(tally.allPro)}   OPOY ${pct(tally.opoy)}   MVP ${pct(tally.mvp)}   ` +
    `record ${pct(tally.record)}   ring ${pct(tally.superBowl)}   Hall of Fame ${pct(tally.hof)}`,
  );
  for (const line of requirements(position, era)) console.log(`    ${line}`);
  /*
    WHICH ONE NUMBER COST HIM THE AWARD. The overall clears the MVP gate exactly, so the
    award was lost on the floor, and a floor is lost to one slot rather than to a build.
    Walking each slot up to the floor says which, and it is a far more useful answer than
    "he was close" is.
  */
  console.log('\n  one slot at a time, raised to the MVP floor:');
  for (const key of ATTRIBUTE_SETS[position]) {
    if ((build[key] ?? 0) >= mvpFloor(position, era)) continue;
    const lifted = { ...build, [key]: mvpFloor(position, era) };
    const c = computeOverall(position, lifted, era);
    const r = rates(position, lifted, era);
    console.log(
      `    ${ATTRIBUTE_LABELS[key]} ${build[key]} to ${mvpFloor(position, era)}: ` +
      `overall ${c.overall}, MVP ${r.pct(r.tally.mvp)}, Hall of Fame ${r.pct(r.tally.hof)}`,
    );
  }

  console.log(
    `\n  the same build read against the other league, for the comparison the gate shift is about:`,
  );
  const alt = computeOverall(position, build, 'alltime');
  const altRates = rates(position, build, 'alltime');
  console.log(
    `    all-time overall ${alt.overall}, ${alt.spikeCount} spikes, ` +
    `All-Pro ${altRates.pct(altRates.tally.allPro)}  OPOY ${altRates.pct(altRates.tally.opoy)}  ` +
    `MVP ${altRates.pct(altRates.tally.mvp)}  Hall of Fame ${altRates.pct(altRates.tally.hof)}`,
  );
}

/**
 * DID THE GATE SHIFT REACH TIGHT END THE WAY IT REACHED QUARTERBACK?
 *
 * This is the question underneath the complaint, and it has a one line answer that the
 * table above cannot show on its own, so it gets printed rather than inferred.
 */
console.log(`\n${'#'.repeat(72)}`);
console.log('# how far each position\'s gates moved for the current league');
console.log('#'.repeat(72));
for (const position of positionsWithData('current')) {
  console.log(
    `  ${position}  gates ${gateShift(position, 'current')}, ` +
    `All-Pro floor ${allProFloor(position, 'current')} against ${allProFloor(position, 'alltime')} all-time, ` +
    `spike bar ${spikeAt(position, 'current')} against ${spikeAt(position, 'alltime')}`,
  );
}
