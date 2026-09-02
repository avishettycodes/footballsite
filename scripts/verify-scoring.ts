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
 *
 * WHAT THESE FOUR DO NOT MODEL, WRITTEN DOWN BECAUSE IT USED TO BE INVISIBLE.
 *
 * All four play NORMAL mode with every rating on screen, and not one of them has ever
 * called reroll. That was fine while it was the only mode, and it silently stopped being
 * fine twice.
 *
 * Rerolls first. The ladder above has always described a run played with zero rerolls,
 * while a person on normal mode had three of them. So the harness was not measuring
 * normal mode, it was measuring the hardest possible version of it, and a tester saying
 * the game is too easy was not contradicted by anything printed here. Normal mode is one
 * reroll now, and the honest thing to say about that change is that NOTHING BELOW MOVES,
 * because the policies still do not reroll. That is not the change failing, it is the
 * harness never having had that number in it.
 *
 * Then hard mode, which now hides every rating in the pool. A bot that reads numbers off
 * the cards is not playing it at all, so `blind` below exists to stop this file quietly
 * reporting normal-mode rates under a heading a hard mode player would read as his own.
 *
 *   blind   plays HARD mode: no rerolls, and no numbers. It picks the famous name in the
 *           pool the way `fan` does, and then takes a slot off him AT RANDOM, because
 *           which of his traits is the good one is exactly what the mode hides.
 *
 * Blind is a FLOOR rather than a ceiling and the gap is real, so do not read its row as
 * what a good player scores in hard mode. A person picking blind knows Jerry Rice caught
 * everything and Randy Moss ran past people, and that knowledge is most of the game once
 * the numbers are gone. The bot has none of it and guesses uniformly. What the row does
 * prove is the direction: hard mode has to cost you something against sighted play, and
 * the assertion at the bottom of each position is that it does.
 */
import { REROLLS_NORMAL, useGame } from '../src/store/gameStore';
import { ATTRIBUTE_SETS, TEAMS, getPool, positionsWithData } from '../src/data';
import type { AttributeKey, Position } from '../src/data';
import { hashSeed, nextRandom } from '../src/lib/rng';
import { GATES, RECORD_YARDS, WEAK_LINK_SHARE, WEIGHTS, computeOverall, isGrandSlam, simulateCareer } from '../src/lib/scoring';
import type { AccoladeId } from '../src/lib/scoring';

type Policy = 'random' | 'fan' | 'human' | 'sharp' | 'blind';
/** The skill ladder, in order. `blind` is deliberately not on it; see LADDER below. */
const POLICIES: Policy[] = ['random', 'fan', 'human', 'sharp'];
/** Everything that gets played and printed, ladder or not. */
const ALL_POLICIES: Policy[] = [...POLICIES, 'blind'];
const RUNS = Number(process.env.RUNS ?? 3000);

type Column = AccoladeId | 'grandSlam';
const COLUMNS: Column[] = ['allPro', 'opoy', 'mvp', 'record', 'superBowl', 'hof', 'grandSlam'];

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
 * THESE WERE RE-MEASURED TWICE OVER. Once because the policies now spend the reroll, and
 * once because the whole accolade set moved underneath them. Both changes push the same
 * way: the reroll made every trophy commoner and the new gates made them rarer again, so
 * a band that survived either change on its own would have been a coincidence.
 *
 * TIGHT END IS LOWEST AND STAYS LOWEST. It plays seven slots out of the thinnest pool in
 * the dataset, and the grand slam needs MVP, which needs an overall of 96 with nothing
 * under 95. A tight end reaches that about once in a hundred runs. A ceiling of All-Pro
 * and a ring is not unfaithful to the position, since no tight end has won the real MVP
 * either, but it does mean somebody who picks TE is chasing something smaller.
 */
type Band = readonly [number, number];
const DEFAULT_SLAM: { human: Band; sharp: Band } = { human: [2, 11], sharp: [1, 12] };

/**
 * Per-position expectations, measured rather than wished for. Measured at RUNS=4000
 * against the current gates, with the policies spending the reroll.
 *
 * What was actually measured, and each band is that number with room either side for
 * sampling noise and for a pool growing by a few players. Re-measured at 3,000 runs after
 * size and toughness landed and normal mode went to two rerolls, and every band survived
 * both changes without being touched:
 *
 *              human  sharp
 *     QB        4.6%   2.0%
 *     RB        5.7%   4.4%
 *     WR        7.2%   7.3%
 *     TE        0.7%   0.3%
 *
 * SHARP NOW SITS UNDER HUMAN AT THE SLAM at three of four positions, and that is the
 * ladder note below rather than a regression. The slam needs MVP and OPOY, which are a
 * threshold and a spike count. Sharp maximises the expected rating, and maximising a
 * mean is the wrong way to clear two gates sitting out in the tail. The previous WR band
 * assumed the opposite and its lower bound was 6% against a policy that now lands at
 * 5.8%, which is how a stale expectation fails a healthy game.
 *
 * Tight end's numbers are low and that is deliberate rather than a target anyone is
 * happy with. It is worth noting the grand slam requires MVP, and no tight end has ever
 * won the real award either, so a ceiling of All-Pro and a ring is not unfaithful to the
 * position. It does mean somebody who picks TE is chasing something smaller, which is a
 * live design question rather than a solved one.
 */
const SLAM_TARGETS: Record<string, { human: Band; sharp: Band }> = {
  QB: { human: [2, 8], sharp: [1, 6] },
  RB: { human: [4, 11], sharp: [3, 10] },
  WR: { human: [3, 10], sharp: [3, 11] },
  TE: { human: [0, 3], sharp: [0, 3] },
};

/**
 * Policy randomness is kept separate from game randomness so seeds stay comparable, and
 * it is now RESEEDED PER POSITION AND POLICY rather than run as one long stream.
 *
 * The stream version made the output depend on what else was in the run list. Adding
 * `blind`, which draws from here, silently moved the `random` rows at every position
 * after the first, because those two share the generator and blind had shifted it along.
 * Three numbers changed in a diff that was supposed to prove nothing changed, which is
 * exactly the noise you do not want when the question is whether a rule change moved the
 * game. Each policy now starts from its own fixed point and cannot disturb any other.
 */
let noise = 0x9e3779b9;
function seedNoise(position: Position, policy: Policy) {
  noise = hashSeed(`NOISE-${position}-${policy}`);
}
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

/**
 * What the best player in a typical franchise pool peaks at. The fan's yardstick for
 * whether he recognises anybody on this roster, and nothing else uses it.
 */
function typicalStar(position: Position): number {
  const peaks = TEAMS
    .map((t) => getPool(position, t.id))
    .filter((pool) => pool.length > 0)
    .map((pool) => Math.max(...pool.map((p) => Math.max(...ATTRIBUTE_SETS[position].map((k) => p.attributes[k] ?? 0)))));
  peaks.sort((a, b) => a - b);
  return peaks[Math.floor(peaks.length / 2)];
}

/**
 * THE REROLL IS PART OF THE GAME AND THE POLICIES NOW SPEND IT.
 *
 * For most of this file's life not one of them called reroll(), so every rate it printed
 * described a run played with zero while a person on normal mode had three. The gates,
 * the slam bands and the whole skill ladder were calibrated against a strictly harder
 * game than anybody was playing, and it took a tester saying the game felt too easy to
 * find it. Nothing here is trustworthy unless the bots hold the same resources the
 * player does.
 *
 * What each policy does with one, which is itself a rung of the ladder, because noticing
 * you have a resource is part of care:
 *
 *   random  never rerolls. It does not know it has one.
 *   fan     rerolls when he does not recognise anybody, meaning this roster's best
 *           player peaks below what a typical roster's best player peaks at.
 *   human   rerolls when the biggest number on the board is below what a typical pool
 *           offers for that same slot. "There is nothing here for me."
 *   sharp   rerolls when the best finished player it can reach through this pool grades
 *           below the one it would expect from typical pools alone. That is the same
 *           objective it already maximises, asked one question further out.
 *   blind   cannot. Hard mode has no rerolls, which is the point of hard mode.
 *
 * All of them are GREEDY: they spend it on the first landing that fails the test rather
 * than holding it for a worse one later. A person holds. This makes the bots slightly
 * worse than a careful human with the same resource, so read these rates as the floor of
 * what one reroll buys rather than the ceiling.
 */
function playRun(
  position: Position,
  seed: string,
  policy: Policy,
  premium: Record<string, number>,
  starFloor: number,
) {
  const s = useGame.getState();
  s.abandonRun();
  // The only policy that plays hard mode is the one that cannot see the numbers.
  s.startRun({ position, hardMode: policy === 'blind', seed });

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
    /** Set when the policy has looked at this pool and decided it can do better. */
    let wantsReroll = false;

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
      // Nobody on this roster is a name. That is the only reason a fan ever rerolls.
      wantsReroll = starPeak < starFloor;
    } else if (policy === 'blind') {
      // Fame is the only thing still legible on a card in hard mode, so the star gets
      // picked the same way `fan` picks him. Peak rating stands in for fame here, which
      // is a proxy the bot is allowed to use and the player is not, and it is the
      // closest thing in the data to a name somebody recognises.
      let star = pool[0];
      let starPeak = -1;
      for (const p of pool) {
        const peak = Math.max(...ATTRIBUTE_SETS[g.position].map((k) => p.attributes[k] ?? 0));
        if (peak > starPeak) { starPeak = peak; star = p; }
      }
      pid = star.id;
      // And then a coin flip, because which trait to take off him is the decision the
      // mode deletes. A person guesses better than this. A bot cannot guess at all.
      attr = open[Math.floor(rnd() * open.length)];
    } else if (policy === 'human') {
      let best = -1;
      for (const p of pool) for (const k of open) {
        const v = p.attributes[k] ?? 0;
        if (v > best) { best = v; pid = p.id; attr = k; }
      }
      // The biggest number here is smaller than what a typical pool hands you for that
      // same slot, so this landing is below average and the reroll is what it is for.
      wantsReroll = best < premium[attr];
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
        // Ties break toward SPIKES first, then toward the bigger raw number. It used to
        // break toward traits at 95, which stopped tracking anything once OPOY started
        // asking for 97s. A bot chasing the old bar is not playing the current game.
        //
        // Maximising the expected rating alone is not actually the ceiling, because two
        // of the awards are thresholds rather than averages. OPOY wants a count of 95+
        // traits, and at tight end the overall gates sit far enough into the tail that a
        // higher variance policy was beating this one outright. A bot that ignores what
        // the awards ask for is not the ceiling, it is just a different style.
        const score = exact + r.spikeCount / 100 + (p.attributes[k] ?? 0) / 10000;
        if (score > best) { best = score; pid = p.id; attr = k; }
      }

      // What this pool is worth against walking away from it. The baseline fills every
      // open slot with a typical pool's offering and takes nothing here, so if the best
      // reachable player through this roster grades below that, the roster is a net loss.
      const baseline: Partial<Record<AttributeKey, number>> = { ...filled };
      for (const rest of open) baseline[rest] = premium[rest];
      const b = computeOverall(g.position, baseline);
      const bExact = b.weightedMean * (1 - WEAK_LINK_SHARE) + b.weakAnchor * WEAK_LINK_SHARE;
      wantsReroll = best < bExact + b.spikeCount / 100;
    }

    // Spending it is the last decision, after the policy has seen what this pool offers.
    if (wantsReroll && g.rerollsLeft > 0) { useGame.getState().reroll(); continue; }

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

/**
 * THE FLOORS BITE. A deterministic check before any of the statistical work.
 *
 * All-Pro and MVP are the two awards made of an overall AND a floor, and a floor that
 * quietly did nothing would not show up in the tables below: the rates would simply look
 * like a slightly generous overall gate, which is exactly what the old OPOY spike
 * requirement was doing for months before anybody measured it. So this builds the same
 * player twice, once clean and once with a single rating one point under the floor, and
 * asserts the award turns off.
 *
 * The hole is put in the position's LOWEST WEIGHTED trait on purpose. That is the one a
 * weighted anchor forgives most, so if the floor bites there it bites everywhere.
 */
function floorsBite(): boolean {
  let ok = true;
  for (const position of positions) {
    const keys = ATTRIBUTE_SETS[position];
    const weights = WEIGHTS[position];
    const softest = [...keys].sort((a, b) => (weights[a] ?? 1) - (weights[b] ?? 1))[0];

    for (const [award, floor] of [['allPro', GATES.allProFloor], ['mvp', GATES.mvpFloor]] as const) {
      // Everything at 99 except the one trait, which sits on the floor and then under it.
      const clean: Partial<Record<AttributeKey, number>> = {};
      for (const k of keys) clean[k] = 99;
      clean[softest] = floor;
      const holed = { ...clean, [softest]: floor - 1 };

      const a = simulateCareer(position, clean, 'FLOORCHECK').accolades[award];
      const b = simulateCareer(position, holed, 'FLOORCHECK').accolades[award];
      if (a && !b) continue;
      ok = false;
      console.log(
        `  x ${position} ${award}: floor ${floor} on ${softest} did not bite ` +
        `(at the floor ${a ? 'won' : 'lost'}, one under ${b ? 'won' : 'lost'})`,
      );
    }
  }
  console.log(ok
    ? '  floors bite: PASS, a single rating under the floor loses All-Pro and MVP at every position'
    : '  floors bite: FAIL');
  return ok;
}

console.log(`GridironLab scoring calibration. ${RUNS} runs per policy, positions: ${positions.join(', ')}`);
/**
 * Printed rather than left in a comment, because the person who needs it is reading the
 * table and not this file.
 */
console.log(
  '  random, fan, human and sharp play NORMAL mode with every rating visible and spend the\n' +
  '  two rerolls a person gets, greedily, on the first landing each one dislikes.\n' +
  '  blind plays HARD mode: no rerolls, no numbers, famous name and then a guess at which\n' +
  '  trait to take. It is the floor for hard mode rather than what a good player gets.\n',
);

let failed = !floorsBite();
console.log();

for (const position of positions) {
  const premium = expectedFill(position);
  const starFloor = typicalStar(position);
  const thin = Object.entries(premium).sort((a, b) => a[1] - b[1]);

  console.log(`${'='.repeat(72)}\n${position}`);
  console.log(`  what a typical franchise pool offers: ${thin.map(([k, v]) => `${k} ${v}`).join(', ')}\n`);

  const rates: Record<string, number[]> = {};
  const table: string[][] = [];

  for (const policy of ALL_POLICIES) {
    seedNoise(position, policy);
    const overalls: number[] = [];
    const weakest: number[] = [];
    const seasons: number[] = [];
    const yardage: number[] = [];
    const hits: Record<string, number> = Object.fromEntries(COLUMNS.map((c) => [c, 0]));
    /** Runs that spent the reroll. Printed so a policy that quietly never uses it shows. */
    let rerolled = 0;
    /**
     * Runs that finished with NOTHING in the trophy case.
     *
     * This is the number a player feels rather than any of the ones in the table. Six
     * separate rates in the 20s read as a game with plenty going on, right up until you
     * work out how often all six miss at once, and at tight end that used to be more
     * than a third of every run. It is printed here because it was measured by hand
     * three times before anybody thought to put it in the harness.
     */
    let emptyCase = 0;

    for (let i = 0; i < RUNS; i++) {
      const r = playRun(position, `CAL-${position}-${policy}-${i}`, policy, premium, starFloor);
      if (policy !== 'blind' && useGame.getState().rerollsLeft < REROLLS_NORMAL) rerolled++;
      overalls.push(r.overall);
      weakest.push(r.breakdown.weakest.value);
      seasons.push(r.seasons);
      yardage.push(r.careerYards);
      for (const c of COLUMNS) {
        if (c === 'grandSlam' ? isGrandSlam(r.accolades) : r.accolades[c]) hits[c]++;
      }
      if (!Object.values(r.accolades).some(Boolean)) emptyCase++;
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
      `    reroll   spent in ${((100 * rerolled) / RUNS).toFixed(1)}% of runs` +
      `${policy === 'blind' ? ' (hard mode has none)' : ''}`,
    );
    console.log(`    empty    ${((100 * emptyCase) / RUNS).toFixed(1)}% of runs won nothing at all`);
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

  /**
   * HARD MODE HAS TO COST SOMETHING, and this is the one claim about it worth failing on.
   *
   * Taking the numbers away and taking the reroll away must leave a player worse off than
   * playing sighted, at every trophy. If blind ever out-earns `human` then hard mode is
   * not a harder game, it is a different one that happens to pay better, and somebody
   * would work that out and farm it.
   *
   * The comparison is against `human` rather than `sharp` on purpose. `human` is how most
   * people play with the numbers up, so "worse than sighted play" means worse than what
   * the person turning the mode on was doing a minute ago.
   *
   * This is a floor-against-ceiling comparison and it should hold by a mile. If it ever
   * comes close, the interesting question is not the bot. It is whether picking at random
   * off the famous name is quietly a good strategy, which would mean the pools reward
   * fame more than they reward choosing well.
   */
  const beatsSighted: string[] = [];
  for (let c = 0; c < COLUMNS.length; c++) {
    const blind = rates.blind[c];
    const sighted = rates.human[c];
    if (blind > sighted + TOLERANCE) {
      beatsSighted.push(`${COLUMNS[c]}: blind ${blind.toFixed(1)}% above human ${sighted.toFixed(1)}%`);
    }
  }
  if (beatsSighted.length) {
    failed = true;
    console.log('  hard mode:    FAIL, blind picking is out-earning sighted picking');
    for (const v of beatsSighted) console.log(`    x ${v}`);
  } else {
    const worst = COLUMNS.map((c, i) => `${c} ${rates.blind[i].toFixed(1)}%`).join(', ');
    console.log(`  hard mode:    PASS, blind costs you at every trophy. ${worst}`);
  }
  console.log();
}

process.exit(failed ? 1 : 0);
