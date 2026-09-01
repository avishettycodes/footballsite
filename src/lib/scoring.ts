import { ATTRIBUTE_SETS } from '../data';
import type { AttributeKey, Position } from '../data';
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
 */
export const WEIGHTS: Record<Position, Partial<Record<AttributeKey, number>>> = {
  RB: { vision: 1.50, speed: 1.15, burst: 1.15, power: 1.10, juke: 1.05, hands: 0.70 },
  QB: { accuracy: 1.55, processing: 1.45, pocketPresence: 1.15, deepBall: 1.05, armStrength: 1.00, clutch: 0.95, mobility: 0.80 },
  WR: { hands: 1.40, routeRunning: 1.35, speed: 1.15, release: 1.05, contestedCatch: 1.00, yac: 1.00, deepThreat: 0.95 },
  TE: { hands: 1.45, routeRunning: 1.15, blocking: 1.05, yac: 0.95, speed: 0.90 },
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

export type OverallBreakdown = {
  overall: number;
  weightedMean: number;
  weakAnchor: number;
  weakest: { attribute: AttributeKey; value: number };
  eliteCount: number;
};

export function computeOverall(position: Position, build: Build): OverallBreakdown {
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
  };
}

export type AccoladeId =
  | 'proBowl' | 'allPro' | 'opoy' | 'mvp' | 'record' | 'superBowl' | 'hof';

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

/** How many 95+ traits OPOY asks for at this position. See opoyEliteShare. */
export function eliteTraitsRequired(position: Position): number {
  return Math.floor(ATTRIBUTE_SETS[position].length * GATES.opoyEliteShare);
}

export function recordLabel(position: Position): string {
  if (position === 'QB') return 'Passing Record';
  if (position === 'RB') return 'Rushing Record';
  return 'Receiving Record';
}

/**
 * Gates are CALIBRATED, not guessed — see `npm run verify:scoring`.
 *
 * The spec's original numbers (80/86/88/91) were written before anyone knew what a
 * typical run actually scores. Measured against the real data they were far too low:
 * a naive-but-sensible player cleared MVP 74% of the time and made the Hall 97%, which
 * makes every trophy meaningless. The cause is supply — the best available number in
 * ANY franchise's pool is ~94 for every attribute, so a handful of competent picks land
 * near the ceiling by construction.
 *
 * THEY MOVED UP ONE AGAIN when durability, contact balance and catch radius came off the
 * build sheet. Durability was the scarcest slot in the game and therefore the main source
 * of holes, so deleting it stopped the weak link anchor biting and lifted every rating
 * about a point. At the old numbers a sensible player was back to an MVP 27% of the time.
 * These are 89, 93, 95 and 96 because that is what it took to put the trophies back where
 * they were, not because bigger numbers look harder.
 *
 * These values sit on the measured distribution instead, and are re-checked against a
 * SKILL LADDER of four bot policies whose accolade rates must rise monotonically. If a
 * careless policy ever out-earns a careful one, the weak link anchor has failed its job.
 *
 * Reference medians for a finished build, by position and policy:
 *
 *            random  fan  sensible  sharp
 *     QB         70   87        93     94
 *     RB         77   89        94     94
 *     WR         79   90        94     95
 *     TE         73   80        90     90
 */
export const GATES = {
  /**
   * The four overall gates must be strictly spaced apart. If two of them share a number
   * they stop being two awards, because in practice every build that clears one clears
   * the other. That happened three times during calibration: through the old quarterback
   * MVP bonus where 96 minus 1.5 rounded onto OPOY's 95, then when MVP dropped to 95 and
   * met OPOY, then when OPOY dropped to 94 and met All-Pro. Each time the rates came back
   * byte identical. OPOY must also stay strictly below MVP, since it is the lesser award. It is the lesser award, so if the two gates meet
   * they stop being two awards. That happened twice during calibration: first through
   * the old quarterback MVP bonus, where 96 minus 1.5 rounded onto OPOY's 95, and again
   * when MVP was lowered to 95 outright. Both times the rates came back byte identical.
   */
  proBowl: 89,
  allPro: 93,
  opoy: 95,
  /**
   * OPOY's elite-trait requirement, expressed as a SHARE of the position's attribute
   * count rather than a fixed number.
   *
   * The share comes from the eight-attribute positions, where five of eight was the
   * calibrated answer, so 5/8 = 0.625. That fraction is the thing being carried across,
   * not the number five.
   *
   * Rounding is FLOOR, and the reason is principle rather than outcome. A position with
   * fewer slots should need fewer elite traits, not the same number. Seven times 0.625
   * is 4.375, and rounding that up would land back on five, which would mean tight ends
   * needing five of seven at the position with by far the fewest elite traits in the
   * dataset. That is not a hard mode, it is arithmetically close to impossible, and it
   * produced a grand slam rate of one run in a thousand.
   */
  opoyEliteShare: 0.625,
  mvp: 96,
  /**
   * 5 of 6, not the spec's 3. At 3 a mediocre run walked into Canton, and at 4 a
   * perfect run made it two thirds of the time. At 5 the Hall is the capstone it
   * should be, and it puts the Super Bowl roll directly in the path, so losing the
   * ring at 94 overall costs you the gold jacket. Which is rather the point.
   */
  hofPoints: 5,
} as const;

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
 *   QB  57,000  between Warren Moon at 49,325 and Eli Manning at 57,023
 *   RB  14,500  around Curtis Martin at 14,101, under Barry Sanders at 15,269
 *   WR  16,900  between Randy Moss at 15,292 and Larry Fitzgerald at 17,492
 *   TE  10,600  around Shannon Sharpe at 10,060, under Antonio Gates at 11,841
 *
 * These land the trophy between OPOY and MVP in rarity, which is the right place for it.
 * A record is a bigger deal than a good season and a smaller one than being the best
 * player alive.
 */
export const RECORD_YARDS: Record<Position, number> = {
  QB: 57000,
  RB: 14500,
  WR: 16900,
  TE: 10600,
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
): CareerResult {
  const breakdown = computeOverall(position, build);
  const { overall, eliteCount } = breakdown;

  // How long he lasted, then what he did with the time. Both are pure functions of the
  // seed, so a shared run gives two people the same career and not merely the same wheel.
  const { seasons } = careerLength(position, overall, seed);
  const stats = careerStats(position, build, overall, seasons, seed);

  const proBowl = overall >= GATES.proBowl;
  const allPro = overall >= GATES.allPro;
  const opoy = overall >= GATES.opoy && eliteCount >= eliteTraitsRequired(position);
  const mvp = overall >= GATES.mvp;
  const record = stats.yards >= RECORD_YARDS[position];

  const odds = superBowlOdds(overall);
  const roll = superBowlRoll(seed);
  const superBowl = roll < odds;

  const hofPoints = [proBowl, allPro, opoy, mvp, record, superBowl].filter(Boolean).length;
  const hof = hofPoints >= GATES.hofPoints;

  return {
    overall,
    breakdown,
    accolades: { proBowl, allPro, opoy, mvp, record, superBowl, hof },
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

export function accoladeDefs(position: Position): AccoladeDef[] {
  return [
    { id: 'proBowl', label: 'Pro Bowl', trophy: 'football', requirement: `Overall ${GATES.proBowl}+` },
    { id: 'allPro', label: 'First-Team All-Pro', trophy: 'star', requirement: `Overall ${GATES.allPro}+` },
    { id: 'opoy', label: 'Offensive Player of the Year', trophy: 'helmet', requirement: `Overall ${GATES.opoy}+ with ${eliteTraitsRequired(position)} traits at 95 or better` },
    { id: 'mvp', label: 'MVP', trophy: 'trophy', requirement: `Overall ${GATES.mvp}+` },
    { id: 'record', label: recordLabel(position), trophy: 'stopwatch', requirement: `${RECORD_YARDS[position].toLocaleString()} career yards, which takes both a long career and a good one` },
    { id: 'superBowl', label: 'Super Bowl', trophy: 'ring', requirement: 'Down to the roll' },
    { id: 'hof', label: 'Hall of Fame', trophy: 'laurel', requirement: `Any ${GATES.hofPoints} of the ones above` },
  ];
}
