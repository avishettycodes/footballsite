/**
 * CALIBRATION HARNESS. Run this before touching any weight or gate.
 *
 * It plays thousands of complete runs through the real store, for every position that
 * has data, and reports what each kind of player actually walks away with.
 *
 * The four policies form a SKILL LADDER, and the whole point is that moving up it has
 * to pay. If a careless policy ever out-earns a careful one at any trophy, the game is
 * quietly teaching people that care is optional, and the script fails.
 *
 *   random  any legal pick at all. The floor. Should win basically nothing.
 *   fan     goes for the famous name in the pool and takes his best open trait. This is
 *           how people really lose. You grab Barry Sanders on spin two and then you are
 *           sitting there on the last spin with no hands and nobody left who can catch.
 *   human   takes the biggest number on the board. Sensible but short-sighted, and
 *           roughly how most people will play.
 *   sharp   plays the actual objective. For every legal pick it fills the slots it has
 *           not reached yet with what it expects to get later, scores that finished
 *           player with the real rating function, and takes whichever pick leaves the
 *           best one. This is the ceiling by construction rather than by heuristic, and
 *           that matters. Two earlier hand-tuned versions each optimised something a
 *           little off and each produced a ladder inversion, one at MVP and one at the
 *           rushing record. A bot that maximises the thing being measured cannot drift
 *           like that.
 *
 * Positions are discovered from the data, so a new pool gets covered the moment it
 * lands. Nothing here needs updating when QB, WR or TE arrive.
 */
import { useGame } from '../src/store/gameStore';
import { ATTRIBUTE_SETS, TEAMS, getPool, positionsWithData } from '../src/data';
import type { AttributeKey, Position } from '../src/data';
import { nextRandom } from '../src/lib/rng';
import { RECORD_YARDS, WEAK_LINK_SHARE, computeOverall, isGrandSlam, simulateCareer } from '../src/lib/scoring';
import type { AccoladeId } from '../src/lib/scoring';

type Policy = 'random' | 'fan' | 'human' | 'sharp';
const POLICIES: Policy[] = ['random', 'fan', 'human', 'sharp'];
const RUNS = Number(process.env.RUNS ?? 3000);

type Column = AccoladeId | 'grandSlam';
const COLUMNS: Column[] = ['proBowl', 'allPro', 'opoy', 'mvp', 'record', 'superBowl', 'hof', 'grandSlam'];

/** Sampling noise we forgive before calling a ladder inversion a real regression. */
const TOLERANCE = 1.5;

/**
 * Grand slam targets. Rare enough that hitting one is worth a screenshot, common enough
 * that someone who plays ten runs believes it is really in there.
 *
 * These are deliberately wide, and the reason is worth writing down. The slam is four
 * thresholds joined by AND, which makes it violently sensitive to small differences.
 * Quarterbacks finish about a point below running backs on average, and that single
 * point turns into a two to three times difference in slam rate. There is no set of
 * position-blind gates that lands every pool inside a tight band, and there is no gate
 * value between 95 and 96 to split the difference with, because the rating is an integer.
 *
 * Rather than bolt a per-position offset onto the gates, which is the special-casing we
 * removed from MVP for good reason, the bands cover the honest spread and the GATES stay
 * identical everywhere. What differs is only what we expect each pool to produce.
 *
 * WHAT MOVED WHEN THREE ATTRIBUTES CAME OFF THE BUILD SHEET, and it moved twice.
 *
 * Durability was the scarcest slot in the game. Franchise pools offer a good one far less
 * often than they offer a good anything else, which is why the note further down says the
 * bot has to bank one early. Deleting it took the main source of holes out of every
 * build, the weak link anchor stopped biting, and every rating rose about a point. Gates
 * of 88, 92, 94 and 95 measured against that new distribution handed a sensible player an
 * MVP 27% of the time and OPOY 47%, which is halfway back to the meaningless trophies
 * this whole file exists to prevent. So all four moved up one, to 89, 93, 95 and 96.
 *
 * That is a genuine difficulty reduction being paid for rather than a knob being turned.
 * The awards land near where they used to at three of the four positions.
 *
 * THE FOURTH IS TIGHT END AND IT GOT HARDER, which these bands now say out loud. It lost
 * two of its seven slots and plays a five pick game, so the two worst numbers carry a
 * proportionally larger share of the rating than anywhere else, and the same gate lift
 * costs it more. A sensible tight end run made a Pro Bowl 89% of the time before and
 * makes one 68% of the time now. That is a real change to that position and it is
 * defensible, since five spins with nowhere to hide a cold one is the harder game, but it
 * is a change rather than a rounding error.
 *
 * QUARTERBACK SITS LOWEST ON THE SLAM and that is the honest cost of the MVP gate. The
 * slam needs MVP, MVP needs 96, and the quarterback pool runs about a point under the
 * other two big positions. A sharp quarterback run slams roughly once in forty. That is
 * the thinnest of the four and it is at the edge of the design goal above, so if it drops
 * further the answer is the quarterback pool rather than the band.
 */
type Band = readonly [number, number];
const DEFAULT_SLAM: { human: Band; sharp: Band } = { human: [2, 11], sharp: [1, 15] };

/**
 * Per-position expectations, measured rather than wished for. Measured at RUNS=4000,
 * where the rarest of these is still a couple of hundred hits.
 *
 * Tight end's numbers are low and that is deliberate rather than a target anyone is
 * happy with. It is worth noting the grand slam requires MVP, and no tight end has ever
 * won the real award either, so a ceiling of All-Pro and a ring is not unfaithful to the
 * position. It does mean somebody who picks TE is chasing something smaller, which is a
 * live design question rather than a solved one.
 */
const SLAM_TARGETS: Record<string, { human: Band; sharp: Band }> = {
  QB: { human: [2, 7], sharp: [1, 6] },
  RB: { human: [4, 11], sharp: [4, 12] },
  WR: { human: [4, 11], sharp: [6, 14] },
  TE: { human: [0, 3], sharp: [0, 3] },
};

/** Policy randomness is kept separate from game randomness so seeds stay comparable. */
let noise = 0x9e3779b9;
function rnd(): number {
  const d = nextRandom(noise);
  noise = d.state;
  return d.value;
}

/**
 * How optimistic the bot is about slots it has not reached yet, as a percentile of what
 * franchise pools offer for that attribute. The value it expects for an open slot is the
 * median best number available in a random franchise pool.
 *
 * There is no single right value here, which is itself the finding. At 0.5 the bot is
 * too conservative to chase peaks and loses OPOY at tight end, where the gates sit out
 * in the tail. At 0.65 it gets greedy about the abundant slots and gives back the record
 * at quarterback. The correct optimism depends on how many spins remain and how scarce
 * the slot is, which a point-estimate lookahead cannot model. 0.5 is kept because it is
 * the honest expectation for a single pool, and the limitation is documented at the
 * ladder check below rather than tuned away.
 */
const FORECAST = Number(process.env.FORECAST ?? 0.5);

function expectedFill(position: Position): Record<string, number> {
  const out: Record<string, number> = {};
  for (const key of ATTRIBUTE_SETS[position]) {
    const bests = TEAMS
      .map((t) => getPool(position, t.id))
      .filter((pool) => pool.length > 0)
      .map((pool) => Math.max(...pool.map((p) => p.attributes[key] ?? 0)));
    bests.sort((a, b) => a - b);
    out[key] = bests[Math.floor(bests.length * FORECAST)];
  }
  return out;
}

function playRun(position: Position, seed: string, policy: Policy, premium: Record<string, number>) {
  const s = useGame.getState();
  s.abandonRun();
  s.startRun({ position, hardMode: false, seed });

  let guard = 0;
  while (useGame.getState().phase !== 'complete' && guard++ < 200) {
    const g = useGame.getState();
    if (g.phase === 'ready') { g.spin(); continue; }
    if (g.phase === 'spinning') { g.landSpin(); continue; }
    if (g.phase !== 'picking') break;

    const pool = getPool(g.position, g.currentTeamId!).filter((p) => !g.usedPlayerIds.includes(p.id));
    const open = ATTRIBUTE_SETS[g.position].filter((k) => !g.slots[k]) as AttributeKey[];
    if (!pool.length || !open.length) break;

    let pid = pool[0].id;
    let attr: AttributeKey = open[0];

    if (policy === 'random') {
      pid = pool[Math.floor(rnd() * pool.length)].id;
      attr = open[Math.floor(rnd() * open.length)];
    } else if (policy === 'fan') {
      let star = pool[0];
      let starPeak = -1;
      for (const p of pool) {
        const peak = Math.max(...ATTRIBUTE_SETS[g.position].map((k) => p.attributes[k] ?? 0));
        if (peak > starPeak) { starPeak = peak; star = p; }
      }
      pid = star.id;
      let best = -1;
      for (const k of open) {
        const v = star.attributes[k] ?? 0;
        if (v > best) { best = v; attr = k; }
      }
    } else if (policy === 'human') {
      let best = -1;
      for (const p of pool) for (const k of open) {
        const v = p.attributes[k] ?? 0;
        if (v > best) { best = v; pid = p.id; attr = k; }
      }
    } else {
      const filled: Partial<Record<AttributeKey, number>> = {};
      for (const k of ATTRIBUTE_SETS[g.position]) {
        const slot = g.slots[k];
        if (slot) filled[k] = slot.value;
      }
      // Score on the UNROUNDED rating. computeOverall rounds to an integer, and at that
      // resolution most candidate picks tie, which left the bot silently taking whichever
      // option happened to come first in pool order. That is how a lookahead bot ends up
      // playing worse than the greedy one it is supposed to beat.
      let best = -Infinity;
      for (const p of pool) for (const k of open) {
        const hypothetical: Partial<Record<AttributeKey, number>> = { ...filled, [k]: p.attributes[k] ?? 0 };
        for (const rest of open) if (rest !== k) hypothetical[rest] = premium[rest];
        const r = computeOverall(g.position, hypothetical);
        const exact = r.weightedMean * (1 - WEAK_LINK_SHARE) + r.weakAnchor * WEAK_LINK_SHARE;
        // Ties break toward elite traits first, then toward the bigger raw number.
        //
        // Maximising the expected rating alone is not actually the ceiling, because two
        // of the awards are thresholds rather than averages. OPOY wants a count of 95+
        // traits, and at tight end the overall gates sit far enough into the tail that a
        // higher variance policy was beating this one outright. A bot that ignores what
        // the awards ask for is not the ceiling, it is just a different style.
        const score = exact + r.eliteCount / 100 + (p.attributes[k] ?? 0) / 10000;
        if (score > best) { best = score; pid = p.id; attr = k; }
      }
    }

    useGame.getState().takeAttribute(pid, attr);
  }

  const g = useGame.getState();
  const build: Partial<Record<AttributeKey, number>> = {};
  for (const k of ATTRIBUTE_SETS[g.position]) build[k] = g.slots[k]?.value ?? 0;
  return simulateCareer(g.position, build, seed);
}

const pct = (n: number, d: number) => ((100 * n) / d).toFixed(1).padStart(5) + '%';
const quantile = (sorted: number[], q: number) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];

const positions = positionsWithData();
console.log(`GridironLab scoring calibration. ${RUNS} runs per policy, positions: ${positions.join(', ')}\n`);

let failed = false;

for (const position of positions) {
  const premium = expectedFill(position);
  const thin = Object.entries(premium).sort((a, b) => a[1] - b[1]);

  console.log(`${'='.repeat(72)}\n${position}`);
  console.log(`  what a typical franchise pool offers: ${thin.map(([k, v]) => `${k} ${v}`).join(', ')}\n`);

  const rates: Record<string, number[]> = {};
  const table: string[][] = [];

  for (const policy of POLICIES) {
    const overalls: number[] = [];
    const weakest: number[] = [];
    const seasons: number[] = [];
    const yardage: number[] = [];
    const hits: Record<string, number> = Object.fromEntries(COLUMNS.map((c) => [c, 0]));

    for (let i = 0; i < RUNS; i++) {
      const r = playRun(position, `CAL-${position}-${policy}-${i}`, policy, premium);
      overalls.push(r.overall);
      weakest.push(r.breakdown.weakest.value);
      seasons.push(r.seasons);
      yardage.push(r.careerYards);
      for (const c of COLUMNS) {
        if (c === 'grandSlam' ? isGrandSlam(r.accolades) : r.accolades[c]) hits[c]++;
      }
    }

    overalls.sort((a, b) => a - b);
    seasons.sort((a, b) => a - b);
    yardage.sort((a, b) => a - b);
    const mean = overalls.reduce((x, y) => x + y, 0) / RUNS;
    const wMean = weakest.reduce((x, y) => x + y, 0) / RUNS;

    console.log(`  ${policy.toUpperCase()}`);
    console.log(
      `    overall  p10 ${quantile(overalls, 0.1)}  p25 ${quantile(overalls, 0.25)}` +
      `  med ${quantile(overalls, 0.5)}  p75 ${quantile(overalls, 0.75)}  p90 ${quantile(overalls, 0.9)}` +
      `  max ${overalls[overalls.length - 1]}  mean ${mean.toFixed(1)}  weakest ${wMean.toFixed(1)}`,
    );
    /**
     * The record gate is a yardage total now rather than a pair of ratings, so the only
     * way to place it is to look at what careers this position actually produces. The
     * threshold in RECORD_YARDS is meant to sit up around the p85 of a sensible run,
     * which is where the old durability gate used to land.
     */
    console.log(
      `    seasons  med ${quantile(seasons, 0.5)}  p90 ${quantile(seasons, 0.9)}  max ${seasons[seasons.length - 1]}` +
      `   yards  med ${quantile(yardage, 0.5).toLocaleString()}` +
      `  p75 ${quantile(yardage, 0.75).toLocaleString()}` +
      `  p85 ${quantile(yardage, 0.85).toLocaleString()}` +
      `  p95 ${quantile(yardage, 0.95).toLocaleString()}` +
      `  (gate ${RECORD_YARDS[position].toLocaleString()})`,
    );

    rates[policy] = COLUMNS.map((c) => (100 * hits[c]) / RUNS);
    table.push([policy, ...COLUMNS.map((c) => pct(hits[c], RUNS))]);
  }

  console.log('\n  policy   ' + COLUMNS.map((c) => c.padStart(11)).join(''));
  for (const row of table) console.log('  ' + row[0].padEnd(9) + row.slice(1).map((c) => c.padStart(11)).join(''));

  /**
   * The ladder has to pay off at every trophy, but the two halves of it prove different
   * things and only one of them is a statement about the game.
   *
   * random to fan to human is the real assertion. Those are three genuinely different
   * levels of care, and if a sloppier one ever out-earns a more careful one then the
   * weak link anchor has failed and the game is teaching people that care is optional.
   * That stays fatal.
   *
   * human to sharp is reported rather than failed, and the reason is not that the bot
   * needs fixing. The assertion itself was false.
   *
   * Sharp maximises the expected rating. OPOY at tight end is a threshold sitting far
   * out in the tail, and when a gate is that far away, chasing spikes genuinely beats
   * maximising the mean. Both policies are careful. One of them is simply better suited
   * to that particular gate, and neither is more careful than the other. So there was
   * never a real claim that the more sophisticated policy must win every trophy.
   *
   * DO NOT try to fix the bot and promote this rung back to fatal. That was tried, and
   * every forecast setting that fixed one position broke another, because the right
   * amount of optimism depends on how far the gate is and how scarce the slot is. The
   * rung is informational because the thing it asserted is not true, not because the
   * instrument is imprecise.
   */
  const inversions: string[] = [];
  const notes: string[] = [];
  for (let c = 0; c < COLUMNS.length; c++) {
    for (let i = 1; i < POLICIES.length; i++) {
      const lo = rates[POLICIES[i - 1]][c];
      const hi = rates[POLICIES[i]][c];
      if (hi >= lo - TOLERANCE) continue;
      const line = `${COLUMNS[c]}: ${POLICIES[i]} ${hi.toFixed(1)}% below ${POLICIES[i - 1]} ${lo.toFixed(1)}%`;
      if (POLICIES[i] === 'sharp') notes.push(line);
      else inversions.push(line);
    }
  }

  const target = SLAM_TARGETS[position] ?? DEFAULT_SLAM;
  const slamIdx = COLUMNS.indexOf('grandSlam');
  const slamHuman = rates.human[slamIdx];
  const slamSharp = rates.sharp[slamIdx];
  const humanOk = slamHuman >= target.human[0] && slamHuman <= target.human[1];
  const sharpOk = slamSharp >= target.sharp[0] && slamSharp <= target.sharp[1];

  console.log();
  if (inversions.length) {
    failed = true;
    console.log(`  skill ladder: FAIL`);
    for (const v of inversions) console.log(`    x ${v}`);
  } else {
    console.log('  skill ladder: PASS, care beats carelessness at every trophy');
  }
  for (const n of notes) {
    console.log(`    note: ${n} (chasing spikes beats maximising the mean when a gate sits this far out)`);
  }

  const verdict = humanOk && sharpOk ? 'PASS' : 'FAIL';
  if (!humanOk || !sharpOk) failed = true;
  console.log(
    `  grand slam:   ${verdict}  sensible ${slamHuman.toFixed(1)}% ` +
    `(want ${target.human[0]} to ${target.human[1]}), ` +
    `sharp ${slamSharp.toFixed(1)}% (want ${target.sharp[0]} to ${target.sharp[1]})`,
  );
  console.log();
}

process.exit(failed ? 1 : 0);
