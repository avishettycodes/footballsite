import { ATTRIBUTE_SETS, TEAMS, TEAMS_BY_ID, getPool } from '../data';
import type { AttributeKey, Position, Team } from '../data';
import { hashSeed, nextRandom } from './rng';

/**
 * WHAT HAPPENED TO HIM. Career length, where he got drafted, whose uniforms he wore,
 * and the numbers he put up doing it.
 *
 * This file exists because durability used to be a slot on the build sheet, and that was
 * the wrong shape for the idea. Availability is not a trait you shop for off somebody
 * else's career. It is what happens to yours. So nobody picks it any more: how long a
 * player lasts is rolled at the end, weighted by how good he turned out to be, against
 * how long players at that level really lasted.
 *
 * EVERYTHING IN HERE IS A PURE FUNCTION OF (position, build, overall, seed).
 *
 * That is not a style preference, it is the seed contract. A `?seed=` link promises two
 * people the identical run, and a career that rolled off live state would quietly break
 * it, because one of them rerolled twice and the other did not. Every draw below comes
 * out of a sub-stream keyed on the seed and a fixed tag, exactly like the Super Bowl
 * roll, so the same build always gets the same career and the report can be rebuilt from
 * a saved player without storing any of it.
 *
 * The numbers are anchored on real careers rather than picked to feel good. Where a
 * constant is a real record or a real career length, the name is written next to it.
 */

/** One sub-stream, keyed on the seed and a tag. Same idea as the Super Bowl roll. */
function stream(seed: string, tag: string): () => number {
  let state = hashSeed(`${seed}::${tag}`);
  return () => {
    const draw = nextRandom(state);
    state = draw.state;
    return draw.value;
  };
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * A bell out of three flat draws. Averaging uniforms is the cheapest way to get
 * something that clusters in the middle and still has tails, which is what almost every
 * quantity down this file wants. A flat roll would give as many 22 year careers as 9
 * year ones, and that is not what a league looks like.
 */
function bell(roll: () => number): number {
  return (roll() + roll() + roll()) / 3;
}

/** Where a rating sits on its own scale, as 0 to 1. 58 is replacement, 96 is the ceiling. */
function grade(overall: number): number {
  return clamp((overall - 58) / 38, 0, 1);
}

/**
 * THE SAME RATING, ON THE CURVE PRODUCTION ACTUALLY FOLLOWS, and this is the fix for the
 * stat line reading like a list of all-time records.
 *
 * grade() above saturates at 96, which is fine for deciding how long somebody lasts and
 * wrong for deciding what he puts up. Everything from 96 to 99 produced an identical
 * season, and everything from 92 to 96 produced very nearly one, so the whole band this
 * game actually deals landed within a few percent of the ceiling. Measured, a merely good
 * 94 build was retiring with the sixth most rushing yards in history and a 96 was putting
 * up a 5,561 yard passing season, which is eighty yards past the real record. Not once.
 * Every time.
 *
 * Production is convex in rating, unlike availability. The gap between a good starter and
 * a great one is much bigger than the gap between a replacement and a bad starter,
 * because the great one gets the volume AND the efficiency AND the whole season. So this
 * runs to 99 rather than 96 and it curves, which pulls the middle of the range down to
 * where real careers sit while leaving the very top alone.
 *
 * The exponent is what makes the top of the game feel like the top. At 99 you get the
 * numbers that break records, and that is the one place this model is allowed to be
 * unrealistic, because you had to build a perfect player to get there.
 */
const PRODUCTION_CURVE = 2.2;
function production(overall: number): number {
  return Math.pow(clamp((overall - 58) / 41, 0, 1), PRODUCTION_CURVE);
}

/**
 * The production grade at which a player holds the job outright and stops losing snaps.
 *
 * 0.80 is an overall of 95, which is not a coincidence and is not tuned to flatter
 * anybody: 95 is the median sensible run at three of the four positions. So the player
 * this game typically builds is exactly the player who never comes off the field, every
 * build above him is already there, and everything below him loses snaps at a rate that
 * bites hard. Setting it lower was measured and it was wrong in an obvious way, because
 * an 88 overall came out throwing 448 passes for 3,363 yards, which is a season a real
 * starter would be pleased with handed to a build the game considers a bad run.
 */
const STARTER_GRADE = 0.80;

/**
 * PLAYING TIME SATURATES, AND THAT IS THE WHOLE FIX FOR THE STAT LINE READING LIKE
 * SOMEBODY ELSE'S CAREER.
 *
 * The old version of this was `0.42 + 0.58 * p`, a straight line, and it existed for a
 * good reason: the first model scaled only the rate stats, so a 71 overall quarterback
 * threw for 3,887 yards in the single season he lasted, because nothing in the model knew
 * what a backup was. Volume is still what separates a bad career from a good one.
 *
 * What the straight line got wrong is the top. It kept taking snaps away from players who
 * would never lose one. A 95 came out at 88% of a full workload and a 92 at 85%, so every
 * build the game actually deals was quietly a part time player, and the report made up the
 * difference by handing everybody a fourteen year career. The trophy case said all-time
 * great and the stat line said dependable starter, which is two different scales printed
 * on the same page.
 *
 * Real football does not work that way. An elite quarterback and a merely good starting
 * one throw roughly the same number of passes, because there are only so many plays in a
 * season and both of them are on the field for all of them. Rodgers threw 531 in an MVP
 * year and Cousins threw 561 the same season. What actually collapses is the bottom:
 * backups, spot starters and rotational pieces get a fraction of the snaps or none.
 *
 * So playing time climbs steeply and then stops. By the time a player is good enough to
 * hold the job outright he is getting the whole job, and everything above that shows up as
 * efficiency and touchdowns rather than as six hundred attempts.
 */
function playingTime(p: number): number {
  return Math.pow(clamp(p / STARTER_GRADE, 0, 1), 0.8);
}

/**
 * A FULL SEASON'S WORK AT THE POSITION, for somebody who never comes off the field.
 *
 * These are the numbers the volume lines are anchored on, and they are real full time
 * workloads rather than a curve's midpoint: around 500 to 550 throws, 270 to 310 carries,
 * 70 to 82 catches for a first receiver and 52 to 64 for a tight end. The small slope
 * added to each below is the difference between holding the job and being the reason the
 * offence exists, and it is small on purpose, because the plays in a season are finite.
 */
const STARTER_LOAD = { QB: 490, RB: 270, WR: 74, TE: 52 } as const;

/** How far a single trait leans from an ordinary one, as roughly -1 to 1. */
function lean(build: Partial<Record<AttributeKey, number>>, key: AttributeKey): number {
  return clamp(((build[key] ?? 76) - 76) / 20, -1.2, 1.2);
}

// ---------------------------------------------------------------------------
// HOW LONG HE LASTED
// ---------------------------------------------------------------------------

/**
 * The ceiling is the long career at the position, not the freak. Brady got 23 years and
 * Rice got 20, and building the model around either one would hand a merely great player
 * two decades. These are the numbers a genuine all-time great at the position actually
 * gets, and the noise below reaches past them from time to time, which is where the
 * freaks come from.
 *
 * Running back is the short one and it is short by a long way. Emmitt Smith got 15 years
 * and Barry Sanders got 10, while the average back in the league is gone inside three.
 * The position eats people, so a running back build is playing for a shorter window than
 * a quarterback build with the same rating, and it should feel that way.
 *
 * FLAMEOUT is the chance the career simply ends early: a knee, a neck, a suspension, or
 * a team that stopped calling. It is scaled down hard by how good he is, because a great
 * player gets another chance and a marginal one does not, but it never reaches zero.
 * Gale Sayers was the best back alive and got seven years.
 */
export const CAREER_SHAPE: Record<Position, { floor: number; ceiling: number; flameout: number }> = {
  QB: { floor: 2, ceiling: 19, flameout: 0.17 },
  RB: { floor: 2, ceiling: 14, flameout: 0.28 },
  WR: { floor: 2, ceiling: 18, flameout: 0.20 },
  TE: { floor: 2, ceiling: 17, flameout: 0.19 },
};

export const MAX_SEASONS = 23;

/**
 * THE CURVE IS CENTRED ON 94, WHICH IS NOT WHERE YOU WOULD PUT IT FROM FIRST PRINCIPLES.
 *
 * The obvious version spreads career length evenly from a replacement player to a
 * perfect one, and it was measured doing exactly the wrong thing: a median build came out
 * at seventeen seasons and put up the second most passing yards in history, every single
 * time. The reason is that this game's ratings are not spread out. You cherry-pick from
 * 32 franchises, so a sensible run lands between 90 and 96 almost always, and a curve
 * built for the full 40 to 99 range hands that whole cluster the top of its ceiling.
 *
 * So the S bends where the players actually are. Below 85 it falls away fast, which is
 * the honest answer: a replacement player gets two or three years and a phone call.
 *
 * IT WAS CENTRED ON 91 FIRST AND THAT WAS THE SAME MISTAKE, JUST SMALLER. The median
 * sensible run rates 95, so a centre of 91 still put the entire population above the
 * midpoint of the curve and handed it 71% of the way to an all-time great's career. A
 * typical quarterback build was getting fourteen years. Nobody's typical anything gets
 * fourteen years, and the report was quietly using that length to reach believable career
 * totals out of unremarkable seasons, which is the bug the production model below was
 * really carrying. The centre belongs at the median of what the game deals, and that is
 * 95 at three positions and 92 at tight end. 94 splits them.
 */
const CENTRE = 94;
const STEEPNESS = 4.5;

export type CareerLength = {
  seasons: number;
  /** What his rating alone said he should get, before the dice. */
  expected: number;
  /** True when something ended it early rather than age doing it. */
  cutShort: boolean;
};

export function careerLength(position: Position, overall: number, seed: string): CareerLength {
  const shape = CAREER_SHAPE[position];
  const t = grade(overall);
  const roll = stream(seed, 'CAREER');

  const share = 1 / (1 + Math.exp(-(overall - CENTRE) / STEEPNESS));
  const expected = shape.floor + share * (shape.ceiling - shape.floor);

  const spread = 0.72 + 0.56 * bell(roll);
  let seasons = Math.round(expected * spread);

  const cutShort = roll() < shape.flameout * (1 - 0.8 * t);
  if (cutShort) seasons = Math.round(seasons * (0.2 + 0.3 * roll()));

  return {
    seasons: clamp(seasons, 1, MAX_SEASONS),
    expected: Math.round(expected * 10) / 10,
    cutShort,
  };
}

// ---------------------------------------------------------------------------
// WHERE HE WENT IN THE DRAFT
// ---------------------------------------------------------------------------

export const ROUNDS = 7;
export const PICKS_PER_ROUND = 32;
export const LAST_PICK = ROUNDS * PICKS_PER_ROUND;

export type DraftSlot = {
  undrafted: boolean;
  /** 1 to 7. Zero when he went undrafted. */
  round: number;
  /** Pick within the round. Zero when he went undrafted. */
  pick: number;
  /** 1 to 224. Zero when he went undrafted. */
  overallPick: number;
};

/**
 * Quarterbacks get reached for and running backs get pushed down, and both of those are
 * real. Teams talk themselves into a quarterback every April, and no running back went
 * in the first round at all in 2013 or 2014. This is applied to how he was SEEN coming
 * out, not to how he turned out, which is the whole point of the next comment.
 */
const DRAFT_LIFT: Record<Position, number> = { QB: 6, RB: -5, WR: 0, TE: -3 };

/**
 * THE DRAFT IS A GUESS, AND IT IS A BAD ONE. That is the entire model here.
 *
 * The obvious version of this maps overall straight onto a pick number, and it produces
 * a league where every great player went in the top five and every bust went late. No
 * draft has ever looked like that. Tom Brady went 199th, Kurt Warner was stocking
 * shelves, and Ryan Leaf went second. What teams are actually drafting is their estimate
 * of a career that has not happened yet, so what sets the slot is the ESTIMATE.
 *
 * The scale below is the part that took two attempts, and the failure is worth keeping
 * because it is invisible from the inside. The first version squashed the estimate onto
 * a 0 to 1 board and squared it, and the board saturated: two thirds of 96 overall
 * players came out pinned at the top of it, so 99% of them went in the first round and
 * exactly nobody slid. Meanwhile half of the 76 overall players were going in the first
 * round too, because the same squashing pushed the middle of the range up against the
 * top. It looked fine. It was a draft with no tail at either end.
 *
 * This one is an exponential on the estimate with no ceiling in it, anchored on two
 * points a person can argue with: an estimate of 97 goes tenth, and every six or so
 * points below that roughly doubles the wait. Around 30% of the great ones now go after
 * round one, which is about the real rate, and it is not a special case anybody wrote.
 * It falls out of the guess being wrong.
 */
const ANCHOR_ESTIMATE = 97;
const ANCHOR_PICK = 10;
const ESTIMATE_DECAY = 0.16;
/** Spread of the board's error, as the full width of the bell. About ten points of sd. */
const ESTIMATE_NOISE = 63;

export function draftSlot(position: Position, overall: number, seed: string): DraftSlot {
  const roll = stream(seed, 'DRAFT');

  const estimate = overall + (bell(roll) - 0.5) * ESTIMATE_NOISE + DRAFT_LIFT[position];
  const expected = ANCHOR_PICK * Math.exp(-ESTIMATE_DECAY * (estimate - ANCHOR_ESTIMATE));
  const overallPick = Math.round(expected * (0.85 + 0.3 * roll()));

  if (!Number.isFinite(overallPick) || overallPick > LAST_PICK) {
    return { undrafted: true, round: 0, pick: 0, overallPick: 0 };
  }

  const at = Math.max(1, overallPick);
  return {
    undrafted: false,
    round: Math.ceil(at / PICKS_PER_ROUND),
    pick: ((at - 1) % PICKS_PER_ROUND) + 1,
    overallPick: at,
  };
}

// ---------------------------------------------------------------------------
// WHO WANTED HIM
// ---------------------------------------------------------------------------

/**
 * WHICH FRANCHISE NEEDS THIS POSITION, read straight off their own history.
 *
 * A team that has had an all-time great at the spot is not desperate for another one,
 * and a team whose best ever is a competent journeyman is. That is a fact already
 * sitting in the data, so nothing new has to be invented or stored: it is the mean of
 * the two best cards in that franchise's pool at that position.
 *
 * It comes out as a RANK rather than a raw score, on purpose. A raw cutoff would need a
 * magic number per position, and the positions do not share a scale, so the score is
 * turned into "how needy is this franchise compared to the other 31", which is what the
 * word need actually means and which recalibrates itself when the data changes.
 */
function poolStrength(position: Position, teamId: string): number {
  const pool = getPool(position, teamId);
  if (!pool.length) return 0;
  const keys = ATTRIBUTE_SETS[position];
  const means = pool
    .map((p) => keys.reduce((sum, k) => sum + (p.attributes[k] ?? 0), 0) / keys.length)
    .sort((a, b) => b - a);
  return means.length === 1 ? means[0] : (means[0] + means[1]) / 2;
}

const NEED: Record<Position, Record<string, number>> = (() => {
  const out = {} as Record<Position, Record<string, number>>;
  for (const position of Object.keys(ATTRIBUTE_SETS) as Position[]) {
    const ranked = TEAMS
      .map((t) => ({ id: t.id, strength: poolStrength(position, t.id) }))
      .filter((row) => row.strength > 0)
      .sort((a, b) => b.strength - a.strength);
    const table: Record<string, number> = {};
    ranked.forEach((row, i) => {
      table[row.id] = ranked.length > 1 ? i / (ranked.length - 1) : 0.5;
    });
    out[position] = table;
  }
  return out;
})();

/** 0 for the franchise with the deepest history here, 1 for the one with nothing. */
export function positionalNeed(position: Position, teamId: string): number {
  return NEED[position]?.[teamId] ?? 0.5;
}

/**
 * How much need actually decides it, which falls away at the top of the board.
 *
 * This is the Ty Simpson case. A team sitting on a settled depth chart does not pass on
 * a player everyone in the building thinks is the best in the class, so at the very top
 * need stops mattering and whoever is picking takes him. Below that it matters a lot,
 * because a team with an all-time great already on the wall is not spending a high pick
 * on his understudy.
 */
function needBlend(overall: number): number {
  return clamp((overall - 88) / 10, 0, 1);
}

function weightedIndex(weights: number[], r: number): number {
  const total = weights.reduce((a, b) => a + b, 0);
  let target = r * total;
  for (let i = 0; i < weights.length; i++) {
    target -= weights[i];
    if (target <= 0) return i;
  }
  return weights.length - 1;
}

export type Stint = {
  team: Team;
  seasons: number;
  /** Season numbers of his career, one-based and inclusive. */
  from: number;
  to: number;
};

export type CareerPath = {
  drafted: Team | null;
  stints: Stint[];
};

/**
 * HOW MANY UNIFORMS, which used to be every franchise you stole from and was therefore
 * sometimes seven.
 *
 * Nobody plays for seven teams. Rice played for three in twenty years, Manning for two
 * in eighteen, and the players who really do bounce around are the ones nobody wants to
 * keep. So the number falls out of the two things that drive it in real life: how long
 * he was around, and whether he was worth re-signing. A star gets extended and a fringe
 * player gets replaced.
 */
function stintCount(overall: number, seasons: number, available: number, r: number): number {
  let cap = seasons <= 4 ? 1 : seasons <= 8 ? 2 : seasons <= 13 ? 3 : 4;
  /*
    THE STAR THRESHOLD USED TO BE 92 AND IT HAD STOPPED SAYING ANYTHING, which is the same
    shape of bug as an award gate sitting under the supply. Nine sensible runs in ten
    finish at 92 or better, so "a star gets extended" fired on virtually every player the
    game builds and the answer to how many uniforms he wore was one, over and over. At 96
    it is an outlier again, and the rule distinguishes the people it was written about.
  */
  if (overall >= 96) cap -= 1;
  if (overall < 78) cap += 1;
  // `seasons` is the ceiling that matters and it used to be missing. A one season career
  // with the journeyman bonus applied came back as two stints of one season each, which
  // is three seasons of timeline on a man who played one, and the report printed both.
  cap = clamp(cap, 1, Math.min(4, available, seasons));
  // Skewed toward the low end, because one team and two teams are the common answers.
  return 1 + Math.floor(Math.pow(r, 1.4) * cap);
}

/**
 * How often a stop after the first is a franchise he was never built from.
 *
 * Set so that a bit under a third of careers contain one. Much lower and it is a rounding
 * error nobody ever sees, much higher and the raid stops feeling like it decided
 * anything. It only ever applies from the second stint on, and most careers do not have a
 * second stint, which is why the number itself is larger than the share it produces.
 */
const WANDER = 0.45;

/**
 * THE FRANCHISE THAT DRAFTED HIM IS ALWAYS ONE YOU RAIDED. Everything after that is not.
 *
 * The tie back to the run is the point of the whole game, so the first uniform is not
 * negotiable: he comes into the league belonging to a team you actually stole from, and
 * for most players that is the only team there is.
 *
 * It used to be the rule for every stop, and a tester noticed inside one session and
 * asked whether it was a coincidence. It was not a coincidence and it was not really a
 * career either. You raid a median of seven franchises out of 32, so a rule that says
 * every stop comes from those seven is a rule somebody works out immediately, and once
 * they have worked it out the uniforms section is just your spin history read back.
 *
 * Real players get signed by teams that were never in the conversation. Emmitt Smith
 * finished in Arizona, Joe Montana in Kansas City, and nobody drafted either of them
 * there. So the stops after the first can come from anywhere in the league, which costs
 * nothing structurally and turns the tie back into a pattern rather than a law.
 */
export function careerPath(
  position: Position,
  overall: number,
  seasons: number,
  raidedTeamIds: string[],
  seed: string,
): CareerPath {
  const pool = raidedTeamIds.map((id) => TEAMS_BY_ID[id]).filter(Boolean);
  if (!pool.length) return { drafted: null, stints: [] };

  const roll = stream(seed, 'PATH');
  const blend = needBlend(overall);

  const remaining = [...pool];
  const elsewhere = TEAMS.filter((t) => !raidedTeamIds.includes(t.id));
  const chosen: Team[] = [];
  const count = stintCount(overall, seasons, TEAMS.length, roll());

  for (let i = 0; i < count; i++) {
    // The first stop is the one that has to come out of the run. After that the rest of
    // the league can sign him, and it does so on the same read of who needs the position.
    const wander = i > 0 && elsewhere.length > 0 && roll() < WANDER;
    const from = wander ? elsewhere : remaining;
    if (!from.length) break;
    const weights = from.map((t) => {
      const need = positionalNeed(position, t.id);
      // 0.15 keeps a settled franchise in play rather than ruling it out. Teams do sign
      // a second one, they just do not pay a premium for him.
      const byNeed = 0.15 + need * need * 2;
      return byNeed * (1 - blend) + blend;
    });
    chosen.push(...from.splice(weightedIndex(weights, roll()), 1));
  }

  // Seasons per stop. The first one gets the most, because that is where the rookie deal
  // and the extension both are, and the noise is there so it is not always the most.
  const shares = chosen.map((_, i) => (chosen.length - i) + roll() * 1.6);
  const total = shares.reduce((a, b) => a + b, 0);

  const lengths = chosen.map(() => 1);
  let left = Math.max(0, seasons - chosen.length);
  for (let i = 0; i < chosen.length && left > 0; i++) {
    const take = i === chosen.length - 1 ? left : Math.min(left, Math.round((seasons - chosen.length) * (shares[i] / total)));
    lengths[i] += take;
    left -= take;
  }

  let cursor = 1;
  const stints = chosen.map((team, i) => {
    const from = cursor;
    cursor += lengths[i];
    return { team, seasons: lengths[i], from, to: cursor - 1 };
  });

  return { drafted: stints[0]?.team ?? null, stints };
}

// ---------------------------------------------------------------------------
// WHAT HE PUT UP
// ---------------------------------------------------------------------------

export type SeasonLine = {
  season: number;
  /** The number the position is judged on. Passing yards, rushing yards, receiving yards. */
  yards: number;
  touchdowns: number;
  /** Attempts for a passer, carries for a back, catches for a receiver. */
  volume: number;
  /** Interceptions for a passer, receptions for a back, and unused elsewhere. */
  secondary: number;
  /**
   * THE OTHER WAY HE MOVED THE BALL, and it exists because a whole pick was invisible
   * without it.
   *
   * A back who spent a spin on catching came out of the report with a reception count and
   * no yards next to it, and the career sentence never mentioned him catching anything at
   * all, so the screen said he only ever ran. A quarterback who spent a spin on mobility
   * had it worse: nothing on the report moved at all. Both picks now show up as yards.
   *
   * Rushing yards for a passer, receiving yards for a back. Receivers and tight ends have
   * nothing here, because their `yards` already is the receiving number and a gadget
   * carry once a year is not a stat.
   */
  secondaryYards: number;
};

export type CareerStats = {
  seasons: SeasonLine[];
  yards: number;
  touchdowns: number;
  volume: number;
  secondary: number;
  secondaryYards: number;
  /** His single best year, which is the line people actually quote at each other. */
  best: SeasonLine;
};

/**
 * THE CAREER ARC, normalised so the peak is worth exactly one prime season.
 *
 * A rookie year is not a prime year and neither is year fourteen. Without this, a long
 * career is just a short career times a bigger number, and every all-time total comes
 * out absurd. The curve peaks about a third of the way in, which is where football
 * players actually peak, and the tails are the ramp and the decline.
 */
const ARC_PEAK = 1.4;
function arc(index: number, seasons: number): number {
  const x = seasons === 1 ? 0.35 : index / (seasons - 1);
  return (0.55 + 0.85 * Math.exp(-Math.pow((x - 0.35) / 0.42, 2))) / ARC_PEAK;
}

/**
 * What a prime season looks like at this rating, before the arc and before the dice.
 *
 * Anchored on real prime seasons rather than on what felt generous. An elite passer year
 * is around 4,300 and 34, a replacement one is around 2,200 and 11. An elite back is
 * around 1,500 on 300 carries, while the league is full of 700 yard seasons. The single
 * season records are deliberately OUT of reach of everything except a near perfect build:
 * 5,477 passing yards, 2,105 rushing, 1,964 receiving and 1,416 for a tight end are real
 * numbers set by real people having the best year anybody has ever had. Traits push these around the edges, so a build with a 96 deep ball
 * scores more than one that dinks it, and a passer who cannot read a defence throws it
 * to the wrong team more often.
 *
 * THE TRAIT MULTIPLIERS ARE SMALL ON PURPOSE, and receivers are why. They started at
 * double these and they COMPOUND, because receiving yards are catches times yards per
 * catch and both ends were being pushed. A sensible build came out at 116 catches for
 * 1,998 every prime year, which is the best season Randy Moss ever had, repeated twelve
 * times, and a career total that beat Jerry Rice. A trait should tilt a season, not
 * rewrite it.
 */
function primeSeason(
  position: Position,
  build: Partial<Record<AttributeKey, number>>,
  overall: number,
): { yards: number; touchdowns: number; volume: number; secondary: number; secondaryYards: number } {
  const p = production(overall);
  const snaps = playingTime(p);

  if (position === 'QB') {
    const attempts = (STARTER_LOAD.QB + 60 * p) * snaps;
    /*
      THE CEILING HERE IS A REAL CAREER AVERAGE, and it has to be checked WITH the traits
      rather than without them. The base is 7.65 yards an attempt at 99, which is about
      Aaron Rodgers, and a build that also steals the best deep ball and the best arm in
      the league pushes it to 8.6, which is Otto Graham and the highest anybody has ever
      sustained. It used to be 8.7 before the traits and 9.4 after them, a number no
      quarterback in history has come near.
    */
    const perAttempt = (5.9 + 1.75 * p) * (1 + 0.09 * lean(build, 'deepBall') + 0.04 * lean(build, 'armStrength'));
    const touchdowns = attempts * (0.030 + 0.030 * p) * (1 + 0.14 * lean(build, 'deepBall') + 0.08 * lean(build, 'clutch'));
    // Absolute interceptions RISE with playing time even as the rate falls, and that is
    // correct rather than a bug. Brees threw 243 of them and your backup threw four.
    const picks = attempts * (0.048 - 0.022 * p) * (1 - 0.18 * lean(build, 'processing') - 0.12 * lean(build, 'accuracy'));
    /**
     * Scrambling, off mobility alone rather than off the rating.
     *
     * It has to be steep, because the gap it is modelling is enormous and real. Marino
     * ran for 87 yards in seventeen seasons and Lamar Jackson has cleared a thousand in
     * one, so a linear slope from an 18 mobility to a 99 would flatter the statue and rob
     * the runner. The exponent is what makes the pick worth spending a spin on.
     */
    const scramble = clamp(((build.mobility ?? 55) - 40) / 55, 0, 1.1);
    const rushing = (30 + 620 * Math.pow(scramble, 1.6)) * snaps;
    return {
      yards: attempts * perAttempt, touchdowns, volume: attempts,
      secondary: Math.max(1, picks), secondaryYards: rushing,
    };
  }

  if (position === 'RB') {
    const carries = (STARTER_LOAD.RB + 40 * p) * snaps * (1 + 0.08 * lean(build, 'power') + 0.06 * lean(build, 'size'));
    // Same check as the passer above, done with the traits included. 4.6 at 99 becomes 5.2
    // once you have stolen the best vision and the best burst in the league, and 5.2 is
    // Jim Brown, who has the highest career average anybody has ever managed.
    const perCarry = (3.6 + 1.0 * p) * (1 + 0.07 * lean(build, 'vision') + 0.05 * lean(build, 'burst'));
    // Size shows up at the goal line, which is the one place a 250 pound back is a
    // different player from a 190 pound one who runs the same speed.
    const touchdowns = carries * (0.020 + 0.026 * p) * (1 + 0.20 * lean(build, 'power') + 0.10 * lean(build, 'size'));
    /**
     * Catching swings this hard on purpose. At the old 0.25 a back with 38 hands still
     * came out with 40 catches a year, which is not what a man nobody throws to looks
     * like. Third down work is the most all-or-nothing thing a running back does.
     */
    const catches = (20 + 42 * p) * snaps * (1 + 0.40 * lean(build, 'hands'));
    const perCatch = (7.0 + 2.5 * p) * (1 + 0.08 * lean(build, 'hands'));
    return {
      yards: carries * perCarry, touchdowns, volume: carries,
      secondary: catches, secondaryYards: catches * perCatch,
    };
  }

  if (position === 'WR') {
    // The receiver slope is the widest of the four, and it had to be. Receiving is the
    // most longevity driven record in the game, so shortening careers bit hardest here:
    // at the first pass a 97 cleared Terrell Owens 11% of the time against 0% for a 95,
    // which is not enough daylight for the trophy to be telling those two apart.
    const catches = (STARTER_LOAD.WR + 16 * p) * snaps * (1 + 0.07 * lean(build, 'hands') + 0.05 * lean(build, 'routeRunning'));
    // Yards per catch used to run off deep threat. Speed took that job when deep threat
    // left the card, which is most of what deep threat was measuring anyway.
    const perCatch = (11 + 4.0 * p) * (1 + 0.06 * lean(build, 'speed') + 0.03 * lean(build, 'yac'));
    const touchdowns = catches * (0.055 + 0.055 * p) * (1 + 0.12 * lean(build, 'contestedCatch') + 0.10 * lean(build, 'size'));
    return { yards: catches * perCatch, touchdowns, volume: catches, secondary: 0, secondaryYards: 0 };
  }

  // Toughness is volume at tight end. It is the trait that keeps him on the field for
  // the third down and the goal line rather than coming off for a blocker.
  const catches = (STARTER_LOAD.TE + 12 * p) * snaps * (1 + 0.16 * lean(build, 'hands') + 0.06 * lean(build, 'toughness'));
  const perCatch = (9.5 + 3.8 * p) * (1 + 0.10 * lean(build, 'speed') + 0.07 * lean(build, 'yac'));
  const touchdowns = catches * (0.050 + 0.045 * p) * (1 + 0.14 * lean(build, 'hands') + 0.12 * lean(build, 'size'));
  return { yards: catches * perCatch, touchdowns, volume: catches, secondary: 0, secondaryYards: 0 };
}

export function careerStats(
  position: Position,
  build: Partial<Record<AttributeKey, number>>,
  overall: number,
  seasons: number,
  seed: string,
): CareerStats {
  const prime = primeSeason(position, build, overall);
  const roll = stream(seed, 'STATS');

  const lines: SeasonLine[] = [];
  for (let i = 0; i < seasons; i++) {
    // Year to year noise, so a career has a season in it worth remembering rather than
    // the same line printed fourteen times.
    const swing = 0.80 + 0.40 * bell(roll);
    const share = arc(i, seasons) * swing;
    lines.push({
      season: i + 1,
      yards: Math.round(prime.yards * share),
      touchdowns: Math.round(prime.touchdowns * share),
      volume: Math.round(prime.volume * share),
      // A passer throws MORE picks when he is worse, so the swing runs the other way.
      secondary: Math.round(prime.secondary * (position === 'QB' ? 2 - share : share)),
      secondaryYards: Math.round(prime.secondaryYards * share),
    });
  }

  const sum = (pick: (line: SeasonLine) => number) => lines.reduce((total, line) => total + pick(line), 0);
  const best = lines.reduce((a, b) => (b.yards > a.yards ? b : a), lines[0]);

  return {
    seasons: lines,
    yards: sum((l) => l.yards),
    touchdowns: sum((l) => l.touchdowns),
    volume: sum((l) => l.volume),
    secondary: sum((l) => l.secondary),
    secondaryYards: sum((l) => l.secondaryYards),
    best,
  };
}

/** What each of the four numbers above is called at this position. */
export const STAT_LABELS: Record<Position, {
  yards: string; touchdowns: string; volume: string;
  secondary: string | null; secondaryYards: string | null;
}> = {
  QB: { yards: 'PASSING YARDS', touchdowns: 'PASSING TDS', volume: 'ATTEMPTS', secondary: 'INTERCEPTIONS', secondaryYards: 'RUSHING YARDS' },
  RB: { yards: 'RUSHING YARDS', touchdowns: 'TOUCHDOWNS', volume: 'CARRIES', secondary: 'RECEPTIONS', secondaryYards: 'RECEIVING YARDS' },
  WR: { yards: 'RECEIVING YARDS', touchdowns: 'TOUCHDOWNS', volume: 'RECEPTIONS', secondary: null, secondaryYards: null },
  TE: { yards: 'RECEIVING YARDS', touchdowns: 'TOUCHDOWNS', volume: 'RECEPTIONS', secondary: null, secondaryYards: null },
};

export function commas(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
