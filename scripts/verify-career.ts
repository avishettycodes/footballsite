/**
 * WHAT HAPPENED TO HIM, CHECKED. Run with `npm run verify:career`.
 *
 * Career length, draft slot, uniforms and the stat line all used to be one attribute
 * called durability and a list of every franchise you spun. They are now a model, and a
 * model with nothing pointed at it is a rumour. This drives the real functions the game
 * calls, tens of thousands of times each, and asserts the things that would actually be
 * wrong if it broke.
 *
 * There are three kinds of assertion in here and they are worth telling apart.
 *
 * STRUCTURAL ones cannot be argued with. Stints have to add up to the career, a draft
 * pick has to land in a round that exists, a best season has to be one of the seasons. If
 * one of these fails, something is broken rather than mistuned.
 *
 * DIRECTIONAL ones are the design. A better player lasts longer, goes earlier, produces
 * more and moves teams less. These are what make the model a model rather than noise
 * wearing a hat.
 *
 * And the TAILS, which are the ones worth writing a check for at all, because they are
 * the ones a plausible looking model quietly loses. A draft where every good player goes
 * early is not a draft. A league where nobody's knee ever goes is not a league. Both of
 * those pass every directional check ever written, so the tails get asserted from BOTH
 * ends: they have to exist, and they have to stay rare.
 */
import { ATTRIBUTE_SETS, TEAMS, positionsWithData } from '../src/data';
import type { AttributeKey, Position } from '../src/data';
import {
  CAREER_SHAPE, LAST_PICK, MAX_SEASONS, PICKS_PER_ROUND, ROUNDS,
  careerLength, careerPath, careerStats, draftSlot, positionalNeed,
} from '../src/lib/career';
import { RECORD_YARDS, computeOverall, superBowlOdds } from '../src/lib/scoring';
import { emptyCaseLine, missedBecause, recordMissLine, ringMissLine } from '../src/lib/narrative';

const SEEDS = Number(process.env.SEEDS ?? 4000);

let failed = false;
function check(name: string, ok: boolean, detail: string) {
  if (!ok) failed = true;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}  (${detail})`);
}

const seed = (i: number, tag = 'CAR') => `${tag}-${i}`;
const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / (xs.length || 1);

/**
 * A build that really rates at the target, for the stat side, which is the only part
 * that reads individual traits.
 *
 * A FLAT CARD IS NOT A PLAYER and using one here quietly broke this whole section. Every
 * trait at 97 makes every production multiplier hit its ceiling at once, so the synthetic
 * player outproduced anything the game can actually build and the record looked trivially
 * easy at 78% when a real sensible run clears it about one time in six.
 *
 * So the shape comes off the measured runs instead: a good build has a couple of numbers
 * above the rating and one soft spot a few points under it, which is exactly what the
 * weak link anchor leaves you with. The offset is solved so computeOverall lands on the
 * target, which means the overall being passed to the career model and the traits being
 * passed to the stat model are describing the same man.
 */
const SHAPE = [4, 3, 2, 1, 0, -2, -3, -5];

function buildFor(position: Position, target: number): Partial<Record<AttributeKey, number>> {
  const keys = ATTRIBUTE_SETS[position];
  const make = (base: number) => {
    const build: Partial<Record<AttributeKey, number>> = {};
    keys.forEach((key, i) => { build[key] = Math.max(1, Math.min(99, Math.round(base + SHAPE[i % SHAPE.length]))); });
    return build;
  };
  let base = target;
  for (let i = 0; i < 40; i++) {
    const gap = target - computeOverall(position, make(base)).overall;
    if (gap === 0) break;
    base += gap > 0 ? Math.max(0.5, gap / 2) : Math.min(-0.5, gap / 2);
  }
  return make(base);
}

const positions = positionsWithData();
console.log(`GridironLab career model. ${SEEDS} seeds per position.\n`);

// ---------------------------------------------------------------------------
console.log('the same seed gives the same career');
// ---------------------------------------------------------------------------
{
  let stable = true;
  let diverged = false;
  for (const position of positions) {
    for (let i = 0; i < 200; i++) {
      const s = seed(i);
      const a = careerLength(position, 92, s);
      const b = careerLength(position, 92, s);
      if (a.seasons !== b.seasons || a.cutShort !== b.cutShort) stable = false;
      const d1 = draftSlot(position, 92, s);
      const d2 = draftSlot(position, 92, s);
      if (d1.overallPick !== d2.overallPick || d1.undrafted !== d2.undrafted) stable = false;
      if (careerLength(position, 92, s).seasons !== careerLength(position, 92, seed(i + 1)).seasons) {
        diverged = true;
      }
    }
  }
  check('a seed replays exactly', stable, 'length and draft both reproduced');
  // Without this the first assertion passes on a constant, which is the classic way a
  // determinism check ends up proving nothing at all.
  check('different seeds do not', diverged, 'the stream is keyed on the seed, not fixed');
}

// ---------------------------------------------------------------------------
console.log('\nhow long he lasted');
// ---------------------------------------------------------------------------
for (const position of positions) {
  const shape = CAREER_SHAPE[position];
  const at = (overall: number) =>
    Array.from({ length: SEEDS }, (_, i) => careerLength(position, overall, seed(i)).seasons);

  const bands = [65, 75, 85, 90, 93, 96, 99].map((overall) => ({ overall, seasons: at(overall) }));
  const line = bands.map((b) => `${b.overall}:${median(b.seasons)}`).join('  ');
  console.log(`  ${position}  median seasons by overall   ${line}`);

  const all = bands.flatMap((b) => b.seasons);
  check(
    `${position} every career is a legal length`,
    all.every((s) => s >= 1 && s <= MAX_SEASONS),
    `min ${Math.min(...all)}, max ${Math.max(...all)}, cap ${MAX_SEASONS}`,
  );

  /**
   * STRICTLY longer, and the word is load-bearing. This read `<` and therefore accepted
   * equality, so a mutation that made career length ignore the rating entirely walked
   * straight past it. Every band came back with the identical mean and the check called
   * that a rising curve. A monotonicity test that tolerates a flat line is testing
   * nothing, since a flat line is the exact failure it exists to catch.
   */
  let rising = true;
  for (let i = 1; i < bands.length; i++) {
    if (mean(bands[i].seasons) <= mean(bands[i - 1].seasons)) rising = false;
  }
  check(
    `${position} a better player lasts longer`,
    rising,
    bands.map((b) => mean(b.seasons).toFixed(1)).join(' -> '),
  );

  // The ceiling is the long career at the position, so a typical great one has to land
  // under it. If the median at 96 is brushing the ceiling, the curve is too generous and
  // every good build is an all-time great, which is exactly the bug this was written for.
  const great = median(at(96));
  check(
    `${position} a great career sits under the ceiling`,
    great < shape.ceiling && great > shape.ceiling * 0.5,
    `median at 96 is ${great}, ceiling ${shape.ceiling}`,
  );

  // Both ends of the tail. Careers have to end early sometimes even at the top, and it
  // has to stay the exception rather than the rule.
  const elite = Array.from({ length: SEEDS }, (_, i) => careerLength(position, 96, seed(i)));
  const short = elite.filter((c) => c.seasons <= 6).length / elite.length;
  check(
    `${position} even the great ones sometimes end early`,
    short > 0.01 && short < 0.15,
    `${(short * 100).toFixed(1)}% of 96 overall careers were 6 seasons or fewer`,
  );
}

{
  // Position matters, and it has to matter in the right direction. The league eats
  // running backs and it does not eat quarterbacks.
  if (positions.includes('RB') && positions.includes('QB')) {
    const rb = median(Array.from({ length: SEEDS }, (_, i) => careerLength('RB', 94, seed(i)).seasons));
    const qb = median(Array.from({ length: SEEDS }, (_, i) => careerLength('QB', 94, seed(i)).seasons));
    check('the same rating lasts longer at quarterback', qb > rb, `QB ${qb} seasons, RB ${rb}`);
  }
}

// ---------------------------------------------------------------------------
console.log('\nwhere he went in the draft');
// ---------------------------------------------------------------------------
for (const position of positions) {
  const at = (overall: number) =>
    Array.from({ length: SEEDS }, (_, i) => draftSlot(position, overall, seed(i)));

  const bands = [70, 80, 88, 93, 97].map((overall) => ({ overall, slots: at(overall) }));
  console.log(
    `  ${position}  median pick by overall   ` +
    bands.map((b) => {
      const drafted = b.slots.filter((s) => !s.undrafted).map((s) => s.overallPick);
      const udfa = (100 * b.slots.filter((s) => s.undrafted).length) / b.slots.length;
      return `${b.overall}:${drafted.length ? median(drafted) : '--'} (${udfa.toFixed(0)}% udfa)`;
    }).join('  '),
  );

  const all = bands.flatMap((b) => b.slots);
  check(
    `${position} every pick lands in a round that exists`,
    all.every((s) => s.undrafted
      ? s.round === 0 && s.pick === 0 && s.overallPick === 0
      : s.round >= 1 && s.round <= ROUNDS
        && s.pick >= 1 && s.pick <= PICKS_PER_ROUND
        && s.overallPick >= 1 && s.overallPick <= LAST_PICK
        && s.overallPick === (s.round - 1) * PICKS_PER_ROUND + s.pick),
    `${ROUNDS} rounds of ${PICKS_PER_ROUND}, last pick ${LAST_PICK}`,
  );

  const undraftedRate = bands.map((b) => b.slots.filter((s) => s.undrafted).length / b.slots.length);
  check(
    `${position} better players go undrafted less`,
    undraftedRate.every((r, i) => i === 0 || r <= undraftedRate[i - 1]),
    undraftedRate.map((r) => `${(r * 100).toFixed(0)}%`).join(' -> '),
  );

  const earlier = bands.map((b) => mean(b.slots.map((s) => (s.undrafted ? LAST_PICK + 40 : s.overallPick))));
  check(
    `${position} better players go earlier`,
    earlier.every((p, i) => i === 0 || p <= earlier[i - 1]),
    earlier.map((p) => Math.round(p)).join(' -> '),
  );

  /**
   * THE PART THAT IS ACTUALLY WORTH CHECKING. A draft where the board is always right is
   * not a draft, and it is what you get for free from any sane looking model, so it has
   * to be asserted against from both ends.
   */
  const elite = at(96);
  const slid = elite.filter((s) => s.undrafted || s.round > 1).length / elite.length;
  check(
    `${position} great players still slide`,
    slid > 0.10 && slid < 0.75,
    `${(slid * 100).toFixed(0)}% of 96 overall players went after round one`,
  );

  const journeyman = at(76);
  const reached = journeyman.filter((s) => !s.undrafted && s.round === 1).length / journeyman.length;
  check(
    `${position} teams still reach on the wrong ones`,
    reached > 0.01 && reached < 0.35,
    `${(reached * 100).toFixed(0)}% of 76 overall players went in round one`,
  );
}

if (positions.includes('QB') && positions.includes('RB')) {
  const pick = (position: Position) =>
    mean(Array.from({ length: SEEDS }, (_, i) => {
      const s = draftSlot(position, 90, seed(i));
      return s.undrafted ? LAST_PICK + 40 : s.overallPick;
    }));
  check('quarterbacks get reached for over running backs', pick('QB') < pick('RB'),
    `QB averages pick ${Math.round(pick('QB'))}, RB ${Math.round(pick('RB'))}`);
}

// ---------------------------------------------------------------------------
console.log('\nwhose uniforms he wore');
// ---------------------------------------------------------------------------
for (const position of positions) {
  const raided = TEAMS.slice(0, 6).map((t) => t.id);

  let addsUp = true;
  let contiguous = true;
  let draftedFromTheRun = true;
  let noRepeats = true;
  /** Careers containing at least one franchise he was never built from. */
  let wandered = 0;
  const counts: number[] = [];

  for (let i = 0; i < SEEDS; i++) {
    const overall = 70 + (i % 30);
    const seasons = careerLength(position, overall, seed(i)).seasons;
    const path = careerPath(position, overall, seasons, raided, seed(i));

    if (path.stints.reduce((sum, s) => sum + s.seasons, 0) !== seasons) addsUp = false;
    let cursor = 1;
    let left = false;
    for (const stint of path.stints) {
      if (stint.from !== cursor || stint.to !== cursor + stint.seasons - 1 || stint.seasons < 1) contiguous = false;
      cursor = stint.to + 1;
      if (!raided.includes(stint.team.id)) left = true;
    }
    if (left) wandered++;
    if (cursor !== seasons + 1) contiguous = false;
    if (new Set(path.stints.map((s) => s.team.id)).size !== path.stints.length) noRepeats = false;
    if (path.drafted?.id !== path.stints[0]?.team.id) draftedFromTheRun = false;
    // The first uniform is the tie back to the run and it is not negotiable.
    if (path.drafted && !raided.includes(path.drafted.id)) draftedFromTheRun = false;
    counts.push(path.stints.length);
  }

  check(`${position} the stints add up to the career`, addsUp, 'every season is accounted for');
  check(`${position} the timeline has no gaps`, contiguous, 'stints run 1 to the last season');
  check(`${position} the team that drafted him came out of the run`, draftedFromTheRun,
    `${raided.length} franchises were raided, and he starts at one of them every time`);
  check(`${position} he never rejoins a team`, noRepeats, 'no franchise appears twice');

  /**
   * BOTH ENDS, like every other tail in this file. A tester asked whether it was a
   * coincidence that his player always signed with a team he had stolen from, and it was
   * not, because it used to be a rule. Now the stops after the first can come from
   * anywhere, so the check is that the rest of the league really does turn up AND that
   * the raid still decides most of the career. Either one alone passes on a broken model.
   *
   * IT IS SAMPLED AT 93 TO 97 RATHER THAN OFF THE SWEEP ABOVE, and that is the whole
   * reason it works. Measured on the wide sweep this check could not fail at the top: it
   * runs from 70 overall, most of those careers are too short to have a second stint at
   * all, and a second stint is the only place wandering can happen. Setting the constant
   * to 1, which means every stop after the first is a franchise from outside the run,
   * still only reached 29% and passed an upper bound of 50%. Half the check was decoration.
   * This band is what a sensible run actually produces, so both ends of it bite.
   */
  let wanderedForReal = 0;
  const REAL_RUNS = 4000;
  for (let i = 0; i < REAL_RUNS; i++) {
    const overall = 93 + (i % 5);
    const seasons = careerLength(position, overall, seed(i, 'REAL')).seasons;
    const path = careerPath(position, overall, seasons, raided, seed(i, 'REAL'));
    if (path.stints.some((st) => !raided.includes(st.team.id))) wanderedForReal++;
  }
  const wanderRate = wanderedForReal / REAL_RUNS;
  check(
    `${position} some careers take him somewhere he was never built from`,
    // 0.35 rather than something roomier, because the roomier version was decoration at
    // running back. Backs get the shortest careers and therefore the fewest second
    // stints, so even with the constant pinned at 1 the rate there tops out around 37%.
    // An upper bound above that cannot fail at the position it most needs to.
    wanderRate > 0.15 && wanderRate < 0.35,
    `${(wanderRate * 100).toFixed(0)}% of careers at 93 to 97 include a franchise outside the run ` +
    `(${((wandered / SEEDS) * 100).toFixed(0)}% across the whole rating sweep)`,
  );

  const share = (n: number) => counts.filter((c) => c === n).length / counts.length;
  console.log(
    `  ${position}  uniforms   ` +
    [1, 2, 3, 4].map((n) => `${n}:${(share(n) * 100).toFixed(0)}%`).join('  '),
  );
  check(
    `${position} most careers are one or two teams`,
    share(1) + share(2) > 0.6,
    `${((share(1) + share(2)) * 100).toFixed(0)}% wore one or two`,
  );
  check(
    `${position} nobody plays for five franchises`,
    Math.max(...counts) <= 4,
    `the most anybody wore was ${Math.max(...counts)}`,
  );
}

// ---------------------------------------------------------------------------
console.log('\nwho wanted him');
// ---------------------------------------------------------------------------
for (const position of positions) {
  const needs = TEAMS.map((t) => positionalNeed(position, t.id));
  check(
    `${position} need is a rank across the league`,
    Math.min(...needs) === 0 && Math.max(...needs) === 1,
    `${TEAMS.length} franchises ranked from 0 to 1`,
  );

  // Six franchises spanning the whole need range, so there is something to prefer.
  const spread = [...TEAMS].sort((a, b) => positionalNeed(position, a.id) - positionalNeed(position, b.id));
  const raided = [spread[0], spread[6], spread[12], spread[19], spread[25], spread[31]].map((t) => t.id);

  const drawnNeed = (overall: number) =>
    mean(Array.from({ length: SEEDS }, (_, i) => {
      const seasons = careerLength(position, overall, seed(i));
      const path = careerPath(position, overall, seasons.seasons, raided, seed(i));
      return path.drafted ? positionalNeed(position, path.drafted.id) : 0.5;
    }));

  const ordinary = drawnNeed(84);
  const superstar = drawnNeed(98);
  console.log(`  ${position}  mean need of the drafting team   ordinary ${ordinary.toFixed(2)}, superstar ${superstar.toFixed(2)}`);

  check(
    `${position} a needy franchise is likelier to take him`,
    ordinary > 0.55,
    `mean need ${ordinary.toFixed(2)} against 0.50 for a coin`,
  );
  /**
   * The Ty Simpson case. Nobody passes on the best player in the class over a depth
   * chart, so at the top the board flattens back toward whoever is picking. Without this
   * the model says a settled franchise never drafts a superstar, which is the opposite of
   * what actually happens every April.
   */
  check(
    `${position} nobody passes on a superstar over a depth chart`,
    superstar < ordinary - 0.03,
    `need drops from ${ordinary.toFixed(2)} to ${superstar.toFixed(2)} at 98 overall`,
  );
}

// ---------------------------------------------------------------------------
console.log('\nwhat he put up');
// ---------------------------------------------------------------------------
for (const position of positions) {
  let sums = true;
  let bestIsReal = true;
  let counted = true;

  for (let i = 0; i < SEEDS; i++) {
    const overall = 70 + (i % 30);
    const seasons = careerLength(position, overall, seed(i)).seasons;
    const stats = careerStats(position, buildFor(position, overall), overall, seasons, seed(i));

    if (stats.seasons.length !== seasons) counted = false;
    if (stats.yards !== stats.seasons.reduce((t, s) => t + s.yards, 0)) sums = false;
    if (stats.touchdowns !== stats.seasons.reduce((t, s) => t + s.touchdowns, 0)) sums = false;
    if (!stats.seasons.includes(stats.best)) bestIsReal = false;
    if (stats.best.yards !== Math.max(...stats.seasons.map((s) => s.yards))) bestIsReal = false;
  }

  check(`${position} one line per season`, counted, 'the stat table matches the career length');
  check(`${position} the totals are the seasons added up`, sums, 'nothing is invented at the bottom');
  check(`${position} the best season is one he played`, bestIsReal, 'and it is the biggest one');

  const at = (overall: number) => {
    const build = buildFor(position, overall);
    return Array.from({ length: SEEDS }, (_, i) => {
      const seasons = careerLength(position, overall, seed(i)).seasons;
      return careerStats(position, build, overall, seasons, seed(i));
    });
  };

  const bands = [80, 88, 93, 97].map((overall) => ({ overall, stats: at(overall) }));
  console.log(
    `  ${position}  median career yards by overall   ` +
    bands.map((b) => `${b.overall}:${median(b.stats.map((s) => s.yards)).toLocaleString()}`).join('  ') +
    `   (record ${RECORD_YARDS[position].toLocaleString()})`,
  );

  const yards = bands.map((b) => mean(b.stats.map((s) => s.yards)));
  check(
    `${position} a better player produces more`,
    yards.every((y, i) => i === 0 || y > yards[i - 1]),
    yards.map((y) => Math.round(y).toLocaleString()).join(' -> '),
  );

  /**
   * The record has to DISCRIMINATE, which is a sharper question than whether it is rare.
   *
   * A good build is a 93 and a great one is a 97, and the whole trophy is worthless
   * unless those two things get different answers. So it is asserted at both ends: a
   * merely good career mostly does not get there, and a genuinely great one mostly does.
   * How rare the trophy is overall then falls out of how rare a 97 is, which is what
   * `npm run verify:scoring` measures against real play.
   */
  // Sampled fresh rather than read off `bands`, so the ratings this asks about are the
  // ones the record cares about instead of whichever ones the row above happens to print.
  const rate = (overall: number) => {
    const runs = at(overall);
    return runs.filter((s) => s.yards >= RECORD_YARDS[position]).length / runs.length;
  };
  /*
    THE SHAPE OF THIS CHANGED WHEN THE RECORD BECAME A REAL CAREER TOTAL, and the check
    had to change with it rather than the gate being softened to keep the check happy.

    It used to ask a 97 to clear the record most of the time, which was the right question
    while the bar sat at the p85 of ordinary play. It is Barry Sanders' actual career now,
    so the transition happens later and much more sharply: nobody at 95 gets near it,
    somewhere between a fifth and a half of 97s do, and a near perfect build usually does.
    That is the discrimination the trophy needs. Asking a 97 to own the all-time record
    most of the time would be asking for the old inflation back.
  */
  const ordinary = rate(95);
  const great = rate(97);
  const perfect = rate(99);
  check(
    `${position} an ordinary good career does not walk into the record`,
    ordinary < 0.3,
    `${(ordinary * 100).toFixed(0)}% of 95 overall careers cleared ${RECORD_YARDS[position].toLocaleString()}`,
  );
  check(
    `${position} a near perfect one usually does`,
    perfect > 0.5 && great > ordinary + 0.15,
    `95 -> ${(ordinary * 100).toFixed(0)}%, 97 -> ${(great * 100).toFixed(0)}%, ` +
    `99 -> ${(perfect * 100).toFixed(0)}%`,
  );

  if (position === 'QB') {
    /**
     * Interceptions are the one number that runs BACKWARDS INSIDE A CAREER, and this is
     * the check that has to prove it rather than the one that looks like it does.
     *
     * The first version compared interceptions per season across ratings and passed on a
     * mutation that deleted the inversion outright. Of course it did: the base rate
     * already falls as the rating rises, so a better passer throws fewer either way and
     * the comparison never touched the thing being claimed. The claim is about one man's
     * own seasons, so it is measured inside one career: his worst year has to be the
     * year he threw it to the wrong team most.
     */
    const careers = bands[bands.length - 1].stats;
    const inverted = careers.filter((s) => s.seasons.length >= 4).filter((s) => {
      const worst = s.seasons.reduce((a, b) => (b.yards < a.yards ? b : a), s.seasons[0]);
      return worst.secondary > s.best.secondary;
    });
    const rate = inverted.length / careers.filter((s) => s.seasons.length >= 4).length;
    check(
      'his worst season is the one he threw the most interceptions in',
      rate > 0.9,
      `${(rate * 100).toFixed(0)}% of careers put the picks in the bad years`,
    );
  }
}

// ---------------------------------------------------------------------------
console.log('\nwhich picks actually move the stat line');
// ---------------------------------------------------------------------------
/**
 * A SLOT THAT CANNOT CHANGE A NUMBER ON THE REPORT IS NOT A DECISION.
 *
 * This is the general form of a bug that shipped. A running back who spent one of his six
 * spins on catching came out with a reception count and no yards beside it, and a
 * quarterback who spent one on mobility got nothing at all: he could steal a 99 off
 * Michael Vick and the report would not move a pixel.
 *
 * Every trait still moves the report through the OVERALL, which drives how long he lasts
 * and therefore every total on the page, so nothing here is truly inert. What this checks
 * is the direct effect, with the overall pinned so only the trait varies. The traits that
 * legitimately have no direct effect are listed rather than inferred, because the whole
 * failure was one of them being missing by accident and nobody noticing.
 */
const RATING_ONLY: Record<Position, AttributeKey[]> = {
  // The pocket is the reason the other numbers happen rather than a number of its own.
  QB: ['pocketPresence'],
  // Breaking a tackle and outrunning the angle both land in yards per carry, which vision
  // and burst already carry. Worth revisiting; it is a gap rather than a principle.
  RB: ['speed', 'juke'],
  // Getting off the line is release, and it ends up in the catch count that route running
  // already moves. Speed came off this list when deep threat left the card: yards per
  // catch runs off speed now, so a receiver's fastest pick finally shows up in his yards.
  WR: ['release'],
  // Blocking genuinely has no stat. Nobody has ever been handed a trophy for it, which is
  // most of why a blocking tight end is a hard card to love.
  TE: ['blocking', 'routeRunning'],
};

for (const position of positions) {
  const overall = 90;
  const seasons = 12;
  const base = buildFor(position, overall);
  const line = (build: Partial<Record<AttributeKey, number>>) => {
    const st = careerStats(position, build, overall, seasons, 'MOVES');
    return [st.yards, st.touchdowns, st.volume, st.secondary, st.secondaryYards];
  };
  const flat = line(base);

  const inert: AttributeKey[] = [];
  const moves: AttributeKey[] = [];
  for (const key of ATTRIBUTE_SETS[position]) {
    // Same overall, same seed, same seasons. Only this one trait differs.
    const low = line({ ...base, [key]: 40 });
    const high = line({ ...base, [key]: 96 });
    const shifted = low.some((v, i) => Math.abs(v - high[i]) > Math.max(1, Math.abs(flat[i]) * 0.01));
    (shifted ? moves : inert).push(key);
  }

  console.log(`  ${position}  moves the stat line: ${moves.join(', ') || 'nothing'}`);
  const expected = [...RATING_ONLY[position]].sort().join(',');
  check(
    `${position} every pick that should move a number does`,
    [...inert].sort().join(',') === expected,
    inert.length ? `rating only: ${[...inert].sort().join(', ')}` : 'every trait moves a stat',
  );
}

// ---------------------------------------------------------------------------
console.log('\nwhat it tells him about the record he missed');
// ---------------------------------------------------------------------------
/**
 * THE ONE LINE ON THIS REPORT THAT CAN BE WRONG RATHER THAN JUST BLUNT.
 *
 * The record is a career total, so it sits downstream of two rolls: how long he lasted,
 * then what he did per season. A player can now do everything right, produce at a record
 * rate, and lose it because his knee went in year four. What the report says to him in
 * that moment is the difference between a story and the game cheating.
 *
 * Asserted from both ends, like the tails. Nobody who was on record pace may be told he
 * was never producing at that rate, and somebody who genuinely was not may not be handed
 * the consolation. The first is the bug that was actually there. The second is what a fix
 * for it turns into if you only check one side, since a line that never blames the player
 * is as useless as one that always does.
 */
const NEVER = 'He never produced at the rate that record needs.';
const ON_PACE = ['He was on pace for it until his career ended.',
  'The rate was there. The seasons were not.'];

/** Every career at this rating that missed the record, with what it was told about it. */
function misses(position: Position, overall: number) {
  const build = buildFor(position, overall);
  const out: { projected: number; gate: number; line: string }[] = [];
  for (let i = 0; i < SEEDS; i++) {
    const s = seed(i, 'MISS');
    const len = careerLength(position, overall, s);
    const stats = careerStats(position, build, overall, len.seasons, s);
    if (stats.yards >= RECORD_YARDS[position]) continue;
    out.push({
      projected: (stats.yards / Math.max(1, len.seasons)) * len.expected,
      gate: RECORD_YARDS[position],
      line: recordMissLine(position, stats.yards, {
        seasons: len.seasons, expected: len.expected, cutShort: len.cutShort,
      }),
    });
  }
  return out;
}

let onPaceAnywhere = 0;
for (const position of positions) {
  /*
    The build that can be ON PACE for the record, which is now a much better player than
    it was. The record is a real man's career total rather than a percentile of whatever
    the game produces, so the only careers whose rate projects past it belong to builds
    up near the top. Sampling this at 95 used to work and now reports zero of zero, which
    is the vacuous shape this section has already been caught in once at the other end.
  */
  const good = misses(position, 98);
  const onPace = good.filter((m) => m.projected >= m.gate);
  onPaceAnywhere += onPace.length;
  check(
    `${position} a man on record pace is never told he was too slow`,
    onPace.every((m) => m.line !== NEVER),
    `${onPace.length} of ${good.length} misses were on pace, ` +
    `${onPace.filter((m) => m.line === NEVER).length} got the wrong sentence`,
  );

  /**
   * The other end, and it needs a different player. Sampling this at 95 was vacuous:
   * there are no slow careers at 95, so the check reported zero of zero and passed
   * without ever running. A line that never blames anybody is as useless as one that
   * always does, so the man who genuinely was not good enough has to be told.
   */
  const poor = misses(position, 74);
  const slow = poor.filter((m) => m.projected < m.gate * 0.6);
  check(
    `${position} a man who really was too slow is told so`,
    slow.length > 0 && slow.every((m) => m.line === NEVER),
    `${slow.length} of ${poor.length} misses were nowhere near the pace, ` +
    `${slow.filter((m) => m.line !== NEVER).length} got let off`,
  );
  check(
    `${position} and he is never handed the consolation`,
    poor.every((m) => !ON_PACE.includes(m.line)),
    `${poor.filter((m) => ON_PACE.includes(m.line)).length} of ${poor.length} were told the years were the problem`,
  );
}

/**
 * The on-pace assertion above passes trivially at any position that cannot produce such
 * a career, and receivers cannot: their record needs a long career rather than a hot
 * rate, so the projection never clears it. That is a real property rather than a gap,
 * but it means the check has to be proved non-vacuous somewhere or the whole section
 * could quietly stop running.
 */
check(
  'the on-pace case exists at all',
  onPaceAnywhere > 0,
  `${onPaceAnywhere} careers across every position were on record pace and still missed`,
);

// ---------------------------------------------------------------------------
console.log('\nwhat it tells him when he won nothing');
// ---------------------------------------------------------------------------
/**
 * THE REPORT MUST NOT BLAME HIM FOR WHAT THE DICE DID. Same rule as the record line, and
 * these two were caught breaking it in the same reading.
 *
 * A player with a 49% shot at a ring was told he was never really in it, and a man who
 * rated 86, started four years and ran for 3,269 yards was told that somebody has to play
 * the other games. Both are the game calling its own coin flip a verdict on the player.
 *
 * The bar is not that the report has to be kind. A genuinely poor career should be told
 * so, which is the second half of each check, because a report that never says anything
 * hard is not worth reading either.
 */
const NEVER_IN_IT = 'He was never really in it.';
const NOBODY = 'The trophy case is empty.';

{
  const wrong: string[] = [];
  const soft: string[] = [];
  for (let overall = 60; overall <= 99; overall++) {
    const odds = superBowlOdds(overall);
    const line = ringMissLine(overall);
    // A third of the time or better is a real chance, whatever the rating says.
    if (odds >= 0.3 && line === NEVER_IN_IT) wrong.push(`${overall} (${Math.round(odds * 100)}%)`);
    // And a one-in-twenty shot is not a near miss.
    if (odds <= 0.05 && line !== NEVER_IN_IT) soft.push(`${overall} (${Math.round(odds * 100)}%)`);
  }
  check('a real shot at a ring is never called a non event', wrong.length === 0,
    wrong.length ? `told he was never in it at ${wrong.join(', ')}` : 'every rating reads its own odds');
  check('and a long shot is still called one', soft.length === 0,
    soft.length ? `given a near miss at ${soft.join(', ')}` : 'the bottom of the range is told the truth');
}

for (const position of positions) {
  const shape = CAREER_SHAPE[position];
  let starterInsulted = 0;
  let cutShortInsulted = 0;
  let checkedShort = 0;

  for (let i = 0; i < SEEDS; i++) {
    const overall = 84 + (i % 12);
    const len = careerLength(position, overall, seed(i, 'CASE'));
    const run = { seasons: len.seasons, expected: len.expected, cutShort: len.cutShort };
    const line = emptyCaseLine(overall, 0, run);
    if (line === NOBODY) starterInsulted++;
    if (len.cutShort && len.seasons < len.expected * 0.75) {
      checkedShort++;
      if (line === NOBODY) cutShortInsulted++;
    }
  }

  check(
    `${position} a real starter is never told he was nobody`,
    starterInsulted === 0,
    `${SEEDS} careers from 84 to 95 overall, ${starterInsulted} got the nobody line`,
  );
  check(
    `${position} and a career the league ended says so`,
    checkedShort > 0 && cutShortInsulted === 0,
    `${checkedShort} were cut short, ${cutShortInsulted} were blamed for it`,
  );

  // The other end. A genuinely poor player at this position does get told.
  const poor = emptyCaseLine(70, 0, { seasons: 3, expected: shape.floor + 2, cutShort: false });
  check(`${position} a poor career is still told the truth`, poor === NOBODY, `"${poor}"`);
}

// ---------------------------------------------------------------------------
console.log('\nno two awards give the same excuse');
// ---------------------------------------------------------------------------
/**
 * THE TROPHY CASE READ OUT THE SAME SENTENCE TWICE, and nothing here noticed.
 *
 * "What he missed out on" listed Offensive Player of the Year and then MVP with the
 * identical line under both, because three awards shared one ladder of near-miss phrases
 * and their thresholds sit close enough together that a build usually misses them by a
 * similar margin. It is not a rare case. It is what most of the list looked like.
 *
 * So the assertion is per BUILD rather than per award: whatever he missed, no two of the
 * reasons he was given may be the same string. Sweeping the whole range of overalls also
 * walks every rung of every ladder, which is what makes this a check on the words rather
 * than on one lucky player.
 */
for (const position of positions) {
  let repeats = 0;
  let worst = '';
  for (let overall = 60; overall <= 99; overall++) {
    for (const weakest of [40, 70, 88, 91, 94, 99] as const) {
      const career = {
        overall,
        breakdown: {
          overall,
          weightedMean: overall,
          weakAnchor: weakest,
          weakest: { attribute: ATTRIBUTE_SETS[position][0], value: weakest },
          eliteCount: 0,
          spikeCount: 0,
        },
        accolades: { allPro: false, opoy: false, mvp: false, record: false, superBowl: false, hof: false },
        superBowl: { odds: 0.3, roll: 0.9, won: false },
        hofPoints: 0,
        seasons: 10,
        careerYards: Math.round(RECORD_YARDS[position] * 0.6),
      };
      const run = { seasons: 10, expected: 12, cutShort: false };
      const lines = (['allPro', 'opoy', 'mvp', 'record', 'superBowl', 'hof'] as const)
        .map((id) => missedBecause(id, position, career, run));
      const seen = new Set(lines);
      if (seen.size !== lines.length) {
        repeats++;
        const dupe = lines.find((l, i) => lines.indexOf(l) !== i) ?? '';
        worst = `overall ${overall}, weakest ${weakest}: "${dupe}"`;
      }
    }
  }
  check(
    `${position} never gives two awards the same reason`,
    repeats === 0,
    repeats === 0 ? '240 builds swept, every reason distinct' : `${repeats} builds repeat themselves, e.g. ${worst}`,
  );
}

console.log();
if (failed) {
  console.log('career model: FAIL');
  process.exit(1);
}
console.log('career model: PASS');
