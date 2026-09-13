/**
 * Proves that the name of the game is an attainable, genuinely rare outcome.
 *
 * This check is exact rather than a Monte Carlo sweep. It explores every legal pick that
 * can still finish at 99, applies the one-card-per-run rule, and averages the best decision
 * over the same uniform 32-team wheel the store uses. A reroll is also treated as a choice,
 * so the reported chance is an upper bound for an omniscient player deliberately chasing
 * 99 -- ordinary human play can only be rarer.
 */
import { ATTRIBUTE_SETS, ERAS, ROSTERS, TEAMS, getPool, positionsWithData } from '../src/data';
import type { AttributeKey, Era, Player, Position } from '../src/data';
import { computeOverall } from '../src/lib/scoring';

const NORMAL_REROLLS = 2;
const MAX_OPTIMAL_CHANCE = 0.005;

type Path = Partial<Record<AttributeKey, Player>>;

function optimisticBuild(
  position: Position,
  build: readonly number[],
  maxima: readonly number[],
): Partial<Record<AttributeKey, number>> {
  return Object.fromEntries(
    ATTRIBUTE_SETS[position].map((key, index) => [key, build[index] < 0 ? maxima[index] : build[index]]),
  );
}

function canStillReach99(
  position: Position,
  era: Era,
  build: readonly number[],
  maxima: readonly number[],
): boolean {
  return computeOverall(position, optimisticBuild(position, build, maxima), era).overall === 99;
}

/** A concrete seven-card witness, independent of how unlikely its team sequence is. */
function findLegalPath(position: Position, era: Era): Path | null {
  const keys = ATTRIBUTE_SETS[position];
  const players = ROSTERS[era].filter((player) => player.position === position);
  const maxima = keys.map((key) => Math.max(...players.map((player) => player.attributes[key] ?? 0)));

  if (!canStillReach99(position, era, keys.map(() => -1), maxima)) return null;

  const candidates = new Map<AttributeKey, Player[]>();
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    candidates.set(key, players
      .filter((player) => {
        const trial = keys.map(() => -1);
        trial[index] = player.attributes[key] ?? 0;
        return canStillReach99(position, era, trial, maxima);
      })
      .sort((a, b) => (b.attributes[key] ?? 0) - (a.attributes[key] ?? 0)));
  }

  // Start with the scarcest slot. This makes the proof quick and makes a failed position
  // explain itself at the actual bottleneck instead of walking thousands of dead branches.
  const order = [...keys].sort(
    (a, b) => (candidates.get(a)?.length ?? 0) - (candidates.get(b)?.length ?? 0),
  );
  const build = keys.map(() => -1);
  const used = new Set<string>();
  const path: Path = {};

  function search(depth: number): boolean {
    if (!canStillReach99(position, era, build, maxima)) return false;
    if (depth === order.length) {
      return computeOverall(position, optimisticBuild(position, build, build), era).overall === 99;
    }

    const key = order[depth];
    const index = keys.indexOf(key);
    for (const player of candidates.get(key) ?? []) {
      if (used.has(player.id)) continue;
      used.add(player.id);
      build[index] = player.attributes[key] ?? 0;
      path[key] = player;
      if (search(depth + 1)) return true;
      used.delete(player.id);
      build[index] = -1;
      delete path[key];
    }
    return false;
  }

  return search(0) ? path : null;
}

/**
 * Exact probability under optimal play.
 *
 * State is small because a pick that makes 99 impossible is discarded immediately. The
 * exhausted-roster branch mirrors gameStore's free respin: an exhausted first draw spreads
 * its probability uniformly over the teams that still contain an unused card.
 */
function optimalChance(position: Position, era: Era, rerolls: number): number {
  const keys = ATTRIBUTE_SETS[position];
  const players = ROSTERS[era].filter((player) => player.position === position);
  const playerIndex = new Map(players.map((player, index) => [player.id, index]));
  const maxima = keys.map((key) => Math.max(...players.map((player) => player.attributes[key] ?? 0)));
  const fullMask = (1 << keys.length) - 1;
  const memo = new Map<string, number>();

  // A rating that fails with every other slot set to its league maximum can never belong
  // to a 99. Removing those edges up front cuts hundreds of irrelevant card/slot checks
  // from every state without changing the answer.
  const minimumViable = keys.map((_, attributeIndex) => {
    for (let value = 0; value <= 99; value++) {
      const trial = [...maxima];
      trial[attributeIndex] = value;
      if (computeOverall(position, optimisticBuild(position, trial, trial), era).overall === 99) return value;
    }
    return 100;
  });

  // Collapse numeric builds into a set of still-possible winning rating patterns. Picking
  // a value only intersects this bitset. That gives the same exact result as carrying seven
  // numbers through the tree, but merges equivalent states and avoids recalculating the
  // scoring formula millions of times.
  const valuesByAttribute = keys.map((key, attributeIndex) => [...new Set(
    players
      .map((player) => player.attributes[key] ?? 0)
      .filter((value) => value >= minimumViable[attributeIndex]),
  )]);
  const winningPatterns: number[][] = [];
  const candidateBuild = keys.map(() => 0);
  function enumeratePatterns(attributeIndex: number) {
    if (attributeIndex === keys.length) {
      if (computeOverall(position, optimisticBuild(position, candidateBuild, candidateBuild), era).overall === 99) {
        winningPatterns.push([...candidateBuild]);
      }
      return;
    }
    for (const value of valuesByAttribute[attributeIndex]) {
      candidateBuild[attributeIndex] = value;
      enumeratePatterns(attributeIndex + 1);
    }
  }
  enumeratePatterns(0);
  if (winningPatterns.length === 0) return 0;

  const valuePatternMasks = keys.map(() => new Map<number, bigint>());
  for (let patternIndex = 0; patternIndex < winningPatterns.length; patternIndex++) {
    const bit = 1n << BigInt(patternIndex);
    for (let attributeIndex = 0; attributeIndex < keys.length; attributeIndex++) {
      const value = winningPatterns[patternIndex][attributeIndex];
      const masks = valuePatternMasks[attributeIndex];
      masks.set(value, (masks.get(value) ?? 0n) | bit);
    }
  }
  const everyWinningPattern = (1n << BigInt(winningPatterns.length)) - 1n;
  const teams = TEAMS.map((team) => {
    const pool = getPool(position, team.id, era);
    let poolMask = 0n;
    const actions: { playerBit: bigint; attributeIndex: number; value: number }[] = [];
    for (const player of pool) {
      const index = playerIndex.get(player.id)!;
      const playerBit = 1n << BigInt(index);
      poolMask |= playerBit;
      for (let attributeIndex = 0; attributeIndex < keys.length; attributeIndex++) {
        const value = player.attributes[keys[attributeIndex]] ?? 0;
        if (value >= minimumViable[attributeIndex]) {
          actions.push({ playerBit, attributeIndex, value });
        }
      }
    }
    return { poolMask, actions };
  });

  function chance(filledMask: number, patterns: bigint, used: bigint, rolls: number): number {
    if (filledMask === fullMask) return 1;

    const memoKey = `${filledMask}|${patterns.toString(36)}|${used.toString(36)}|${rolls}`;
    const cached = memo.get(memoKey);
    if (cached !== undefined) return cached;

    const eligible = teams.filter(({ poolMask }) => (used & poolMask) !== poolMask);
    if (eligible.length === 0) return 0;

    const exhausted = TEAMS.length - eligible.length;
    const directWeight = 1 / TEAMS.length;
    const respinWeight = exhausted / (TEAMS.length * eligible.length);
    let total = 0;

    for (const { actions } of eligible) {
      // Once a team is visible, an optimal player either takes its best viable path or
      // spends a reroll. They cannot skip a live roster for free.
      let best = rolls > 0 ? chance(filledMask, patterns, used, rolls - 1) : 0;

      for (const { playerBit, attributeIndex, value } of actions) {
        if ((used & playerBit) !== 0n || (filledMask & (1 << attributeIndex)) !== 0) continue;
        const nextPatterns = patterns & (valuePatternMasks[attributeIndex].get(value) ?? 0n);
        if (nextPatterns === 0n) continue;
        best = Math.max(
          best,
          chance(filledMask | (1 << attributeIndex), nextPatterns, used | playerBit, rolls),
        );
      }

      total += (directWeight + respinWeight) * best;
    }

    memo.set(memoKey, total);
    return total;
  }

  return chance(0, everyWinningPattern, 0n, rerolls);
}

const failures: string[] = [];
console.log('Build a 99 -- exact reachability and rarity');

for (const era of ERAS) {
  for (const position of positionsWithData(era)) {
    const path = findLegalPath(position, era);
    if (!path) {
      failures.push(`${era} ${position} has no legal unique-card path to 99 overall`);
      console.log(`  ${era.padEnd(7)} ${position}: IMPOSSIBLE`);
      continue;
    }

    for (const key of ATTRIBUTE_SETS[position]) {
      const player = path[key]!;
      if (player.attributes[key] !== 99) {
        failures.push(
          `${era} ${position} reaches a rounded 99 without a literal 99 card at ${key}`,
        );
      }
    }

    const chance0 = optimalChance(position, era, 0);
    const chance2 = optimalChance(position, era, NORMAL_REROLLS);
    if (!(chance0 > 0)) failures.push(`${era} ${position} has zero exact chance with no rerolls`);
    if (!(chance2 > 0)) failures.push(`${era} ${position} has zero exact chance with two rerolls`);
    if (chance2 > MAX_OPTIMAL_CHANCE) {
      failures.push(
        `${era} ${position} optimal 99 chance ${(chance2 * 100).toFixed(4)}% exceeds ${(MAX_OPTIMAL_CHANCE * 100).toFixed(1)}%`,
      );
    }

    const format = (value: number) => `${(value * 100).toFixed(5)}% (about 1 in ${Math.round(1 / value).toLocaleString()})`;
    console.log(
      `  ${era.padEnd(7)} ${position}: no rerolls ${format(chance0)}; two rerolls ${format(chance2)}`,
    );
    console.log('    ' + keysFor(position).map((key) => {
      const player = path[key]!;
      return `${key} ${player.attributes[key]} ${player.name}`;
    }).join(' | '));
  }
}

function keysFor(position: Position): readonly AttributeKey[] {
  return ATTRIBUTE_SETS[position];
}

if (failures.length) {
  for (const failure of failures) console.error(`ERROR: ${failure}`);
  process.exit(1);
}

console.log('Every position has a legal 99 path, and even optimal normal-mode play stays at or below 0.5%.');
