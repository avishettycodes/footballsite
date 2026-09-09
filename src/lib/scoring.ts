import { ATTRIBUTE_SETS, TEAMS, getPool } from '../data';
import type { AttributeKey, Era, Position } from '../data';
import { careerLength, careerStats } from './career';
import { hashSeed, nextRandom } from './rng';

/**
 * FENCED FILE. Do not retune anything in here while adding a position's data.
 *
 * The weights, the weak link share and every gate below are calibrated against measured
 * run distributions, a monotonic skill ladder assertion and a grand slam target band.
 * They are not guesses and they are not adjustable knobs. If `npm run verify:scoring`
 * fails after new data lands, the new data is wrong, not the scoring. Two things this
 * file has already learned the hard way, both of which cost a full recalibration:
 * overall gates must never share a number, and the weak link anchor must respect the
 * same weights the mean does.
 *
 * RATE THE PLAYER, THEN MEASURE. This is a project rule, not a suggestion, and it was
 * learned by breaking it. While adding quarterbacks a supply check said the important
 * traits were thin, so thirty players got raised. Every raise had a real football reason
 * behind it and the numbers still came out wrong: 33 of the 37 changed values landed on
 * exactly 92, 93 or 94, which were the thresholds being measured against rather than
 * anything to do with the players. Re-deriving each one from the player alone, ignoring
 * supply completely, spread them from 70 to 97 and improved the metric anyway.
 *
 * So when a check says supply is thin, fix it by rating individual players honestly and
 * then measuring again. Never move a batch of them onto whatever number clears the bar.
 * A tally of where your changed values landed will tell you which one you just did.
 *
 * SCORING ENGINE — pure functions, no React, no store. The calibration script
 * (`npm run verify:scoring`) imports exactly this code, so the numbers it reports
 * are the numbers the game uses.
 */

export type Build = Partial<Record<AttributeKey, number>>;

/**
 * Positional weights. Higher = this trait defines the position.
 * RB leans on vision and burst; QB on accuracy and processing.
 *
 * SIZE IS WEIGHTED LOW EVERYWHERE IT APPEARS, and that is the honest answer rather than
 * a cautious one. Barry Sanders was 203 pounds and Darren Sproles was 190, so a
 * position that punished a small back the way it punishes a blind one would be arguing
 * with its own pool. It matters most at tight end, where a small one really is a
 * different job, and least at running back.
 *
 * Toughness sits just above blocking at tight end. It is the trait that makes the other
 * six survive contact, and unlike blocking it is not something a scheme can hide.
 */
export const WEIGHTS: Record<Position, Partial<Record<AttributeKey, number>>> = {
  RB: { vision: 1.50, speed: 1.15, burst: 1.15, power: 1.10, juke: 1.05, size: 0.80, hands: 0.70 },
  QB: { accuracy: 1.55, processing: 1.45, pocketPresence: 1.15, deepBall: 1.05, armStrength: 1.00, clutch: 0.95, mobility: 0.80 },
  WR: { hands: 1.40, routeRunning: 1.35, speed: 1.15, release: 1.05, contestedCatch: 1.00, yac: 1.00, size: 0.85 },
  TE: { hands: 1.45, routeRunning: 1.15, toughness: 1.05, blocking: 1.05, size: 0.95, yac: 0.95, speed: 0.90 },
};

/**
 * How much the two worst traits drag the whole player down.
 *
 * A plain weighted mean is far too forgiving when you can cherry-pick maxima from 32
 * franchises. A 99 speed and 38 hands freak would grade like a superstar. Blending the
 * mean against a weak link anchor makes the real decision of the game explicit: grab
 * the shiny 99, or go patch the hole you left three spins ago.
 */
export const WEAK_LINK_SHARE = 0.50;

/**
 * The anchor has to respect the same weights the mean does, or the formula argues with
 * itself. An unweighted anchor tells you mobility barely counts for a quarterback and
 * then punishes a hole there exactly as hard as a hole in accuracy. Pocket passers all
 * carry a low mobility number, so that bug dragged the entire position down about a
 * point and a half. Tight ends would have been worse, since blocking and speed pull
 * against each other and half that pool is deliberately bad at one of them.
 *
 * So each value gets pulled toward 100 in proportion to how much the position cares
 * about it, and the anchor then looks for the two lowest ADJUSTED values, which are the
 * holes that actually matter. Weights are normalised against the position's own average
 * so this stays a reweighting rather than a general softening.
 *
 * A low weight still has to sting. Marino's 18 mobility comes out around 41, which is a
 * real dent rather than a crater, and a 30 in a low weight trait still lands near 50.
 * If a bad number in a trait you do not need were free, Vick against Marino would stop
 * being a decision.
 */
function weightedShortfalls(position: Position, build: Build): { key: AttributeKey; adjusted: number }[] {
  const keys = ATTRIBUTE_SETS[position];
  const weights = WEIGHTS[position];
  const average = keys.reduce((sum, k) => sum + (weights[k] ?? 1), 0) / keys.length;

  return keys
    .map((key) => {
      const relative = (weights[key] ?? 1) / average;
      const value = build[key] ?? 0;
      return { key, adjusted: Math.max(0, Math.min(100, 100 - relative * (100 - value))) };
    })
    .sort((a, b) => a.adjusted - b.adjusted);
}

/**
 * What counts as a spike, as opposed to merely a good number.
 *
 * 95 used to be the bar and it stopped meaning anything. A sensible run takes the
 * biggest number on the board every spin and franchise pools offer 94 to 96 for most
 * traits, so three traits at 95 turned up in 97% of finished players. An award asking
 * for that was not asking for anything. 97 is the number a build has to go out of its
 * way for: a sensible run gets three of them about half the time at quarterback and
 * running back, and a tight end almost never does.
 */
export const SPIKE_AT = 97;

export type OverallBreakdown = {
  overall: number;
  weightedMean: number;
  weakAnchor: number;
  weakest: { attribute: AttributeKey; value: number };
  /** Traits at 95 or better. Kept for the lookahead bot's tiebreak and nothing else. */
  eliteCount: number;
  /** Traits at SPIKE_AT or better. This is what OPOY asks for. */
  spikeCount: number;
};

export function computeOverall(position: Position, build: Build, era: Era = 'alltime'): OverallBreakdown {
  const keys = ATTRIBUTE_SETS[position];
  const weights = WEIGHTS[position];

  let num = 0;
  let den = 0;
  for (const key of keys) {
    const w = weights[key] ?? 1;
    num += (build[key] ?? 0) * w;
    den += w;
  }
  const weightedMean = num / den;

  const shortfalls = weightedShortfalls(position, build);

  // Worst hole counts double against the second worst.
  const weakAnchor = (shortfalls[0].adjusted * 2 + shortfalls[1].adjusted) / 3;

  const overall = Math.round(
    weightedMean * (1 - WEAK_LINK_SHARE) + weakAnchor * WEAK_LINK_SHARE,
  );

  return {
    overall: Math.max(0, Math.min(99, overall)),
    weightedMean: Math.round(weightedMean * 10) / 10,
    weakAnchor: Math.round(weakAnchor * 10) / 10,
    // Reported as the raw number, since that is what the player actually picked.
    weakest: { attribute: shortfalls[0].key, value: build[shortfalls[0].key] ?? 0 },
    eliteCount: keys.filter((k) => (build[k] ?? 0) >= 95).length,
    spikeCount: keys.filter((k) => (build[k] ?? 0) >= spikeAt(position, era)).length,
  };
}

/**
 * THE LOWEST NUMBER ACTUALLY ON THE CARD, which is not the same thing as `weakest`.
 *
 * `weakest` is the lowest WEIGHT-ADJUSTED value, and that is the right answer for the
 * gates: a 92 clutch is a smaller hole in a quarterback than a 92 accuracy, and every
 * trophy here is supposed to know that. It is the wrong answer for a sentence that says
 * what his softest number is, because the reader is looking at the raw numbers.
 *
 * The two disagree constantly. A build reading arm 96, accuracy 95, deep 99, pocket 99,
 * mobility 97, reads 98, clutch 92 has `weakest` of accuracy 95, and the weak link box
 * told that player nothing on him dropped below 95 with the 92 printed three rows above
 * it. That is the page contradicting itself in one screenful, which is the exact
 * complaint that got the All-Pro floor wired into this box in the first place.
 *
 * Reading the true minimum here also keeps that earlier fix intact rather than undoing
 * it, because the true minimum is never above `weakest`: if the softest number on the
 * card clears the All-Pro floor then the gate's own floor is clear too, so the box can
 * still never say there is no hole in a player All-Pro turned down over one.
 */
export function softestSlot(position: Position, build: Build): { attribute: AttributeKey; value: number } {
  const keys = ATTRIBUTE_SETS[position];
  return keys.reduce(
    (low, key) => ((build[key] ?? 0) < low.value ? { attribute: key, value: build[key] ?? 0 } : low),
    { attribute: keys[0], value: build[keys[0]] ?? 0 },
  );
}

export type AccoladeId =
  | 'allPro' | 'opoy' | 'mvp' | 'record' | 'superBowl' | 'hof';

export type AccoladeDef = {
  id: AccoladeId;
  label: string;
  /**
   * Which icon to draw. These used to be emoji sitting right here in the string, which
   * meant Apple, Google and Microsoft each drew the trophy case differently and none of
   * them could take the colour of the card they sat on. Scoring still owns WHICH
   * trophies exist; src/components/Icons.tsx owns what they look like.
   */
  trophy: string;
  requirement: string;
};

/** How many spikes OPOY asks for at this position. See opoySpikeShare. */
export function spikeTraitsRequired(position: Position): number {
  return Math.floor(ATTRIBUTE_SETS[position].length * GATES.opoySpikeShare);
}

export function recordLabel(position: Position): string {
  if (position === 'QB') return 'Passing Record';
  if (position === 'RB') return 'Rushing Record';
  return 'Receiving Record';
}

/**
 * Gates are CALIBRATED, not guessed. See `npm run verify:scoring`.
 *
 * THE WHOLE SET MOVED, AND THE REASON IS WORTH THE SPACE.
 *
 * Every number in here used to be measured against a harness whose bot policies never
 * called reroll(), while a person on normal mode had three of them. So the gates were
 * calibrated against a strictly harder game than anybody was playing. One reroll is
 * worth about a point of overall, and on a distribution this steep a point roughly
 * doubles the top awards. The bots hold the reroll now, and measured against the real
 * game the old gates produced this, for a sensible player:
 *
 *   Pro Bowl 97 to 100% at three positions, All-Pro 77 to 94%, MVP 13 to 35%, and a
 *   grand slam once every seven runs at running back.
 *
 * The bottom of that is not an accolade, it is a participation line, and once the entry
 * trophy is free nothing above it means anything either. So:
 *
 * PRO BOWL IS GONE. Not retuned, deleted. It fired on 99.9% of sensible running back
 * runs. There is no threshold that makes an award which everybody wins interesting, and
 * five trophies that mean something beat six where one is free. All-Pro is the entry
 * award now.
 *
 * ALL-PRO AND MVP EACH GAINED A FLOOR, and that is the important structural change. A
 * lone overall threshold could not be lifted far enough to gate quarterbacks, backs and
 * receivers without taking tight end to nearly zero, because tight end sits three to
 * four points below everyone else. Asking for a whole player instead of a high average
 * fixes that: "92 or better with nothing under 92" costs the big three positions about
 * what a straight 94 would have cost them. It also puts the game's actual decision,
 * chase the spike or patch the hole, directly on the entry trophy.
 *
 * ALL-PRO'S FLOOR IS THEN READ PER POSITION off what that position's pools can supply,
 * and that is the single exception to the paragraph below about gates staying blind. It
 * is derived rather than chosen, it is asserted in `npm run verify:scoring`, and the
 * whole argument for it lives on allProFloor() further down this file. Read that before
 * you touch it, because from a distance it looks exactly like the MVP offset that was
 * removed for good reasons and it is not the same thing.
 *
 * OPOY ASKS FOR SPIKES AND NOW ACTUALLY DOES. Its old requirement was traits at 95 or
 * better, which a sensible run cleared 97% of the time, so the award was really just its
 * overall gate wearing a second condition that never bit. At SPIKE_AT it separates a
 * player with genuine peaks from a merely well-rounded one, which is what the award is
 * supposed to say.
 *
 * THE GATES DID NOT MOVE FOR THE SECOND REROLL, AND THAT WAS A CHOICE. Normal mode gives
 * two now instead of one, which is worth about a point of overall, and a point on this
 * distribution is worth a lot at the top. Every rate below went up and none of them was
 * pulled back down, because the second reroll was asked for in order to make the game
 * kinder and quietly raising the bar to cancel it out would have been a way of refusing
 * while looking like agreement. The record gates are the exception and they moved for a
 * different reason: 40% of backs owning the all-time rushing record is not a difficulty
 * setting, it is a factual absurdity.
 *
 * Measured rates for a sensible player at 3,000 runs a position, with both rerolls spent:
 *
 *            All-Pro   OPOY    MVP  record   ring    HoF   slam   nothing at all
 *     QB        79%     40%    12%     15%    65%    14%    4.6%      8.7%
 *     RB        86%     57%    21%     16%    68%    21%    5.7%      5.3%
 *     WR        89%     73%    23%     16%    68%    24%    7.2%      4.1%
 *     TE        39%      8%     1%     16%    56%     5%    0.7%     27.9%
 *
 * THE LAST COLUMN IS THE ONE TO READ. Six rates in the 20s look like a game with plenty
 * going on until you ask how often all six miss at once, and at tight end that is more
 * than a quarter of every run against one in twenty at receiver.
 *
 * TIGHT END WAS THE OUTLIER AND HALF OF IT WAS OUR FAULT. The seven slot pass moved it
 * from 37% empty to 28% and no further, because a typical tight end pool offers 86 for
 * YAC and 88 for route running while All-Pro asked for nothing under 92. Two slots on the
 * card could not be filled to the bar off a normal roster, so the position lost the entry
 * award for a reason that had nothing to do with how well anybody played. Reading that
 * floor off the supply instead takes tight end to 67% All-Pro and 17.5% empty.
 *
 * What is left at tight end is real. OPOY at 8% and MVP at 1% are the position producing
 * 0.04 traits at 97 or better per player against 0.27 at receiver, and no gate should
 * paper over that. Those two stay blind.
 *
 * Measured after the floor was derived and the career model was made honest, sensible
 * player, 3,000 runs a position:
 *
 *            All-Pro   OPOY    MVP  record   ring    HoF   slam   nothing at all
 *     QB        87%     40%    12%    2.6%    65%     9%    1.8%      6.2%
 *     RB        86%     57%    21%    6.4%    68%    17%    3.7%      5.3%
 *     WR        89%     73%    23%    5.1%    68%    18%    3.8%      4.1%
 *     TE        67%      8%     1%    3.1%    56%     2%    0.4%     17.5%
 *
 * THE RECORD IS THE RARE ONE NOW and the Hall of Fame followed it down, which is the
 * shape this list should have had all along. Chasing a real man's career total is the
 * thing worth sending somebody a seed about. All-Pro sitting up near 90% is not a bug in
 * the gate: you built a player out of the best trait on seven different rosters, so of
 * course he is a good player. What should be rare is being the best there has ever been,
 * and that is what the bottom half of this table now measures.
 *
 * QUARTERBACK MOVED TOO, from 79% to 87%, and that is the rule working rather than a side
 * effect to be trimmed off. The median roster offers 90 mobility, so a 92 floor was
 * quietly asking every pocket passer to go and find a scrambler. Marino at 18 mobility is
 * a card this game is built around. Running back and receiver came back at exactly 92,
 * which is the evidence that 92 was this statistic all along rather than a number
 * somebody liked.
 */
export const GATES = {
  /**
   * The overall gates must be strictly spaced apart. If two of them share a number they
   * stop being two awards, because every build that clears one clears the other. That
   * happened three times during calibration, and it happened again while picking these:
   * OPOY at 96 came back byte identical to MVP at 96 in every column. OPOY must also
   * stay strictly below MVP, since it is the lesser award.
   */
  allPro: 92,
  /**
   * No rating under this. An All-Pro has no hole in him, which is the whole point of
   * the award and the reason it can gate without a punishing overall number.
   *
   * THE LEAGUE STANDARD, and the only gate in this file a position can be measured
   * against instead. Read allProFloor() below before touching it, and read the note
   * above it before deleting that.
   */
  allProFloor: 92,
  opoy: 95,
  /**
   * OPOY's spike requirement, expressed as a SHARE of the position's attribute count
   * rather than a fixed number, so a shorter build asks for fewer.
   *
   * Half, floored: three spikes at quarterback, running back and receiver, two at tight
   * end. The share used to be 0.625 against a 95 bar, which asked for four of seven and
   * was free anyway. Half of a real bar beats five eighths of a fake one.
   */
  opoySpikeShare: 0.5,
  mvp: 96,
  /**
   * MVP's floor. Same idea as All-Pro's and a harder number, because the best player in
   * the league does not have a 91 sitting in his card.
   *
   * This is also what keeps quarterbacks in the conversation. Lifting MVP to 97 outright
   * would have put it at 1.3% for quarterbacks against 13.9% for receivers, which is not
   * one award. 96 with nothing under 95 lands at 9% and 19%, which is a spread rather
   * than a different game.
   */
  mvpFloor: 95,
  /**
   * 4 of 5, down from 5 of 6, because Pro Bowl left the list it counted from. The old
   * threshold against the new list would have been 5 of 5, which is not a capstone, it
   * is a second grand slam. Four of five keeps the Super Bowl roll in the path, so
   * losing the ring still costs you the gold jacket.
   */
  hofPoints: 4,
} as const;

/**
 * What a typical franchise can hand you for one slot: the median, across the 32 rosters,
 * of the best number that roster offers for that attribute. It is the same statistic
 * `npm run verify:scoring` prints as "what a typical franchise pool offers".
 */
function typicalSupply(position: Position, key: AttributeKey, era: Era): number {
  const bests = TEAMS
    .map((team) => getPool(position, team.id, era))
    .filter((pool) => pool.length > 0)
    .map((pool) => Math.max(...pool.map((p) => p.attributes[key] ?? 0)))
    .sort((a, b) => a - b);
  return bests[Math.floor(bests.length / 2)];
}

/**
 * Cached per ERA AND position, which is the whole of what the second dataset changed
 * here. A cache keyed on position alone would have answered the first question it was
 * ever asked and then given that answer to the other era forever, and since both eras
 * return plausible numbers in the high eighties nothing on screen would have looked
 * wrong. It would simply have been the wrong award.
 */
const FLOORS = new Map<string, number>();

/**
 * THE ONE GATE IN THIS FILE THAT KNOWS WHAT POSITION IT IS LOOKING AT, and the reason it
 * is not the special casing this file threw out of MVP.
 *
 * The rule everywhere else is that gates stay position blind and the expectations differ.
 * That rule is right, and the MVP offset broke it for a bad reason: it was a thumb on the
 * scale duplicating something the weights already said, so it added nothing and hid a
 * collision between two awards.
 *
 * This is a different thing. Measured across the current pools, the median franchise
 * offers a tight end 86 for YAC and 88 for route running. All-Pro asks for nothing under
 * 92. Those two slots on the card cannot be filled to the bar off a typical roster, so a
 * tight end loses the ENTRY award for a reason that has nothing to do with how he was
 * built or how well the player played. A gate you cannot clear by playing well is not
 * difficulty. It is a bug wearing a difficulty costume, and 28% of tight end runs were
 * ending with an empty case because of it.
 *
 * So the floor asks the same QUESTION at every position, "is there a hole in him", and
 * reads the answer off what the position can actually supply. It is the league standard
 * of 92 unless the thinnest slot on the card cannot reach 92, in which case it is what
 * that slot can reach. It never goes above 92: a rich pool does not earn a harder award.
 *
 * DERIVED, NOT PICKED. Nobody chose 86 because it made a rate look nice, and if the tight
 * end pool ever gets deeper this number rises on its own and the exception dissolves
 * without anybody editing it. The two positions where 92 was already right come back as
 * exactly 92, which is the evidence that 92 was this statistic all along:
 *
 *   QB  mobility     90   the statue is a real card and always has been
 *   RB  juke         92   unchanged
 *   WR  release      92   unchanged
 *   TE  yac          86
 *
 * The everything ABOVE this stays blind on purpose. OPOY and MVP are missed at tight end
 * because it produces 0.04 traits at 97 or better per player against 0.27 at receiver,
 * and that is the position genuinely being harder rather than a bar it cannot reach.
 */
/**
 * HOW FAR SHORT OF THE REFERENCE LEAGUE THIS ONE COMES, in points of supply.
 *
 * All-time is the reference and always returns 0, so every number in GATES stays exactly
 * the number it was calibrated to. Nothing above this line moves for the league it is in.
 *
 * The second dataset needed this the moment its rooms became honest. A current room is the
 * men on the depth chart, which is two or three quarterbacks rather than eight, so the
 * median franchise offers 90 for a slot where its all-time equivalent offers 94. Every
 * overall gate in this file was written against that 94. Handing the same 92 to a league
 * that cannot supply it is not a harder difficulty, it is the arithmetic deciding the
 * award before the player does: at 3,000 played runs the strict current pools produced
 * All-Pro 36% against 86%, and MVP, the record and the Hall of Fame at flat zero. A
 * quarterback with no hole anywhere finished under the entry trophy.
 *
 * So a gate drops by exactly the shortfall and by nothing else. It is measured off the
 * same statistic allProFloor reads, it is asserted in `npm run verify:scoring`, and it
 * dissolves on its own the day a league can supply the bar. It NEVER goes positive: a
 * league with a deep pool does not get a harder award, for the same reason the floor is
 * capped at the league standard.
 *
 * This is the second exception to gates staying position blind, and it is the same
 * exception as the first. The question asked is identical everywhere, "is this the best
 * player in the league", and only the answer to "what can this league hand you" differs.
 * QB and RB come back at 4, receiver at 3 and tight end at 0, and tight end returning
 * zero is the evidence the statistic is reading something real: it is the one position
 * whose rooms were already the size of a real one.
 */
const SHIFTS = new Map<string, number>();

export function gateShift(position: Position, era: Era): number {
  const cacheKey = `${era}:${position}`;
  const cached = SHIFTS.get(cacheKey);
  if (cached !== undefined) return cached;
  const supplyOf = (e: Era) => {
    const slots = ATTRIBUTE_SETS[position].map((key) => typicalSupply(position, key, e));
    return slots.reduce((sum, v) => sum + v, 0) / slots.length;
  };
  const shift = Math.min(0, Math.ceil(supplyOf(era) - supplyOf('alltime')));
  SHIFTS.set(cacheKey, shift);
  return shift;
}

export function allProFloor(position: Position, era: Era): number {
  const cacheKey = `${era}:${position}`;
  const cached = FLOORS.get(cacheKey);
  if (cached !== undefined) return cached;
  const thinnest = Math.min(
    ...ATTRIBUTE_SETS[position].map((key) => typicalSupply(position, key, era)),
  );
  const floor = Math.min(GATES.allProFloor, thinnest);
  FLOORS.set(cacheKey, floor);
  return floor;
}

/**
 * WHAT COUNTS AS A SPIKE IN THE LEAGUE YOU ARE PLAYING IN.
 *
 * SPIKE_AT is 97 and stays 97 for the league it was measured against, so all-time returns
 * it unchanged at every position and nothing there moves.
 *
 * OPOY broke in the current league for a reason that had nothing to do with the ratings.
 * The current pools are SPIKIER per man than the all-time ones, 0.30 traits at 97 or better
 * per quarterback against 0.19, and OPOY still fell to under one run in a hundred. The
 * statistic that explains it is not per player, it is per room: an all-time quarterback
 * room answers one slot of the card at 97, and a current room of two or three answers
 * none. You visit seven franchises in a run, so the all-time league lets you collect the
 * four spikes the award asks for and the current one hands you about one.
 *
 * So the bar drops to the highest number at which a typical room in THIS league answers as
 * many slots as a typical all-time room answers at 97. It is the same move allProFloor
 * makes, asking the same question of a different supply, and it lands where the pools put
 * it rather than where a rate looks nice. It stops at 88, because a league that cannot
 * offer a genuinely elite trait at 88 should lose the award rather than have it handed
 * down to it.
 */
function spikeSupply(position: Position, era: Era, bar: number): number {
  const counts = TEAMS
    .map((team) => getPool(position, team.id, era))
    .filter((pool) => pool.length > 0)
    .map((pool) => ATTRIBUTE_SETS[position].filter(
      (key) => Math.max(...pool.map((p) => p.attributes[key] ?? 0)) >= bar,
    ).length)
    .sort((a, b) => a - b);
  return counts[Math.floor(counts.length / 2)];
}

const SPIKE_BARS = new Map<string, number>();

export function spikeAt(position: Position, era: Era): number {
  const cacheKey = `${era}:${position}`;
  const cached = SPIKE_BARS.get(cacheKey);
  if (cached !== undefined) return cached;
  const target = spikeSupply(position, 'alltime', SPIKE_AT);
  let bar = SPIKE_AT;
  while (bar > 88 && spikeSupply(position, era, bar) < target) bar -= 1;
  SPIKE_BARS.set(cacheKey, bar);
  return bar;
}

/**
 * MVP'S FLOOR, MOVED BY THE SAME SHORTFALL THE OVERALL GATES ARE.
 *
 * A flat 95 is right for the league it was measured in, and gateShift returns 0 there, so
 * all-time keeps exactly the number it was calibrated to at every position.
 *
 * It could not stay flat for a shallower league. MVP is an overall AND a floor, and the two
 * halves have to describe the same player: dropping the overall to 92 for the current
 * quarterback pools while still asking for nothing under 95 leaves an award nobody can win,
 * which is the failure this whole section exists to avoid. So the floor travels with the
 * gate it belongs to.
 *
 * DERIVING IT OFF THE SUPPLY DIRECTLY WAS TRIED FIRST and it is the more obvious idea,
 * allProFloor's rule applied one rung up. It fails a check that matters: at current tight
 * end it produced 88, and a player sitting on 88 with 99 everywhere else grades out at 95
 * against a 96 gate, so the floor could never turn an award off. A floor that cannot bite
 * is decoration, and `npm run verify:scoring` says so out loud.
 */
export function mvpFloor(position: Position, era: Era): number {
  return GATES.mvpFloor + gateShift(position, era);
}

/**
 * P(ring) as a function of overall. Capped at 85% so a 99 still loses sometimes, and
 * steep enough that a sub-80 build doesn't back into a ring often enough to matter.
 */
export function superBowlOdds(overall: number): number {
  const t = Math.max(0, Math.min(1, (overall - 62) / 37));
  return Math.max(0.01, Math.min(0.85, 0.85 * Math.pow(t, 2.0)));
}

/**
 * The Super Bowl roll is drawn from a sub-stream keyed ONLY on the seed —
 * `hashSeed(seed + '::SUPERBOWL')` — not from the run's live rngState.
 *
 * That matters for shared `?seed=` challenges. The live state advances with every
 * spin AND every reroll, so two people on the same seed who reroll a different
 * number of times would be drawing from different points in the sequence. Keying on
 * the seed alone fixes one coin flip for that day: everyone faces the identical
 * roll, and only their build quality decides who clears it. Better build, better
 * chance, same coin.
 */
export function superBowlRoll(seed: string): number {
  return nextRandom(hashSeed(`${seed}::SUPERBOWL`)).value;
}

/**
 * THE RECORD IS NOW THE ACTUAL NUMBER, which is the whole reason it moved.
 *
 * It used to read "overall 94 or better and durability 96 or better", which is a gate
 * made of two ratings standing in for a career nobody ever saw. Careers are simulated
 * season by season now, so the record can simply ask what it says on the trophy: did he
 * put up more yards than anyone should.
 *
 * They are CALIBRATED like every other gate here, against the measured distribution of
 * real play rather than picked because the number looked impressive, and each one lands
 * on a real name a few places down the all-time list. Careers here are shorter than the
 * twenty year outliers who own the actual records, so aiming at Brady would have made
 * this unreachable rather than hard.
 *
 *   QB  49,325  Warren Moon, to the yard
 *   RB  14,101  Curtis Martin, to the yard
 *   WR  15,934  Terrell Owens, to the yard
 *   TE  10,060  Shannon Sharpe, to the yard
 *
 * THEY ARE REAL CAREER TOTALS NOW, TO THE YARD, and that is a change of method rather
 * than of number. Every earlier version sat at the p85 of whatever a sensible run
 * produced, which meant the record moved every time the career model did and always
 * landed on a number that one run in seven owned. A record one player in seven owns is a
 * milestone, and it also made the tile stamped ALL-TIME RECORD faintly ridiculous.
 *
 * So the bar is a man's actual career now. You have to pass Barry Sanders. Once the
 * production curve was fixed these landed between the p95 and the p97 of sensible play
 * without being aimed there, which is the check that the two halves agree: a career
 * model that produces realistic numbers should put a real record just out of reach of a
 * good run and inside reach of a great one.
 *
 * If the career model changes again, re-read the yardage percentiles in
 * `npm run verify:scoring` and confirm these are still near p95. Do not move them to hit
 * a rate. Move them only if the game stops producing careers a real name belongs next to.
 */
export const RECORD_YARDS: Record<Position, number> = {
  QB: 49325,
  RB: 14101,
  WR: 15934,
  TE: 10060,
};

export type CareerResult = {
  overall: number;
  breakdown: OverallBreakdown;
  accolades: Record<AccoladeId, boolean>;
  superBowl: { odds: number; roll: number; won: boolean };
  hofPoints: number;
  /**
   * How many years he got. Rolled here rather than picked on the build sheet, and stored
   * because the record gate below reads it and a saved player has to keep the answer he
   * got. Everything else about the career report is rebuilt from the seed on demand,
   * since it is a pure function of one, so nothing else needs keeping.
   */
  seasons: number;
  /** The number the position is judged on. Passing, rushing or receiving yards. */
  careerYards: number;
};

export function simulateCareer(
  position: Position,
  build: Build,
  seed: string,
  era: Era,
): CareerResult {
  const breakdown = computeOverall(position, build, era);
  const { overall, spikeCount } = breakdown;
  const floor = breakdown.weakest.value;

  // How long he lasted, then what he did with the time. Both are pure functions of the
  // seed, so a shared run gives two people the same career and not merely the same wheel.
  const { seasons } = careerLength(position, overall, seed);
  const stats = careerStats(position, build, overall, seasons, seed);

  // Each award asks a different question on purpose. All-Pro wants a complete player,
  // OPOY wants peaks, MVP wants both at the top end, the record wants a career.
  const shift = gateShift(position, era);
  const allPro = overall >= GATES.allPro + shift && floor >= allProFloor(position, era);
  const opoy = overall >= GATES.opoy + shift && spikeCount >= spikeTraitsRequired(position);
  const mvp = overall >= GATES.mvp + shift && floor >= mvpFloor(position, era);
  const record = stats.yards >= RECORD_YARDS[position];

  const odds = superBowlOdds(overall);
  const roll = superBowlRoll(seed);
  const superBowl = roll < odds;

  const hofPoints = [allPro, opoy, mvp, record, superBowl].filter(Boolean).length;
  const hof = hofPoints >= GATES.hofPoints;

  return {
    overall,
    breakdown,
    accolades: { allPro, opoy, mvp, record, superBowl, hof },
    superBowl: { odds, roll, won: superBowl },
    hofPoints,
    seasons,
    careerYards: stats.yards,
  };
}

/**
 * The thing people are actually chasing: MVP and OPOY and the record and a ring,
 * all in one career. Every other trophy is a consolation prize on the way here.
 */
export function isGrandSlam(accolades: Record<AccoladeId, boolean>): boolean {
  return accolades.mvp && accolades.opoy && accolades.record && accolades.superBowl;
}

export function accoladeDefs(position: Position, era: Era): AccoladeDef[] {
  const shift = gateShift(position, era);
  return [
    { id: 'allPro', label: 'First-Team All-Pro', trophy: 'star', requirement: `Overall ${GATES.allPro + shift}+ with nothing under ${allProFloor(position, era)}` },
    { id: 'opoy', label: 'Offensive Player of the Year', trophy: 'helmet', requirement: `Overall ${GATES.opoy + shift}+ with ${spikeTraitsRequired(position)} traits at ${spikeAt(position, era)} or better` },
    { id: 'mvp', label: 'MVP', trophy: 'trophy', requirement: `Overall ${GATES.mvp + shift}+ with nothing under ${mvpFloor(position, era)}` },
    { id: 'record', label: recordLabel(position), trophy: 'stopwatch', requirement: `${RECORD_YARDS[position].toLocaleString()} career yards, which takes both a long career and a good one` },
    { id: 'superBowl', label: 'Super Bowl', trophy: 'ring', requirement: 'Down to the roll' },
    { id: 'hof', label: 'Hall of Fame', trophy: 'laurel', requirement: `Any ${GATES.hofPoints} of the ones above` },
  ];
}
