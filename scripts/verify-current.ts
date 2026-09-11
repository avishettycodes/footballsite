/**
 * Locks the current-mode roster and every displayed attribute to the audited 2026 Week 1
 * source snapshot. Roster changes require a deliberate fixture refresh; rating drift from
 * a hand edit fails immediately.
 */
import fs from 'node:fs';
import { ROSTERS } from '../src/data';
import { ATTRIBUTE_SETS } from '../src/data/types';
import type { AttributeKey, Player, Position } from '../src/data/types';
import { computeOverall, current99Cutoff } from '../src/lib/scoring';
import {
  calculateCurrentRatings,
  type CurrentRatingSource,
} from './current-rating-model';

type Fixture = {
  season: number;
  week: number;
  snapshotDate: string;
  explicitExclusions: { name: string; reason: string }[];
  players: CurrentRatingSource[];
};

const fixture = JSON.parse(
  fs.readFileSync(new URL('./fixtures/current-week-1.json', import.meta.url), 'utf8'),
) as Fixture;
const players = ROSTERS.current;
const expectedRatings = calculateCurrentRatings(fixture.players);
const actualById = new Map(players.map((player) => [player.id, player]));
const sourceById = new Map(fixture.players.map((player) => [player.id, player]));
const errors: string[] = [];

function findPlayable99(position: Position) {
  const positionPlayers = players.filter((player) => player.position === position);
  const candidates = new Map(ATTRIBUTE_SETS[position].map((key) => [
    key,
    positionPlayers
      .filter((player) => (player.attributes[key] ?? 0) >= current99Cutoff(position, key))
      .sort((a, b) => (b.attributes[key] ?? 0) - (a.attributes[key] ?? 0)),
  ]));
  const keys = [...ATTRIBUTE_SETS[position]].sort(
    (a, b) => (candidates.get(a)?.length ?? 0) - (candidates.get(b)?.length ?? 0),
  );
  const used = new Set<string>();
  const build: Partial<Record<AttributeKey, number>> = {};
  const picks: Partial<Record<AttributeKey, Player>> = {};

  const search = (index: number): boolean => {
    if (index === keys.length) return computeOverall(position, build, 'current').overall === 99;
    const key = keys[index];
    for (const player of candidates.get(key) ?? []) {
      if (used.has(player.id)) continue;
      used.add(player.id);
      build[key] = player.attributes[key];
      picks[key] = player;
      if (search(index + 1)) return true;
      used.delete(player.id);
      delete build[key];
      delete picks[key];
    }
    return false;
  };

  return search(0) ? { build, picks } : null;
}

if (players.length !== fixture.players.length) {
  errors.push(`roster count is ${players.length}; source snapshot has ${fixture.players.length}`);
}

for (const source of fixture.players) {
  const actual = actualById.get(source.id);
  if (!actual) {
    errors.push(`missing source player ${source.name} (${source.id})`);
    continue;
  }
  for (const key of ['name', 'teamId', 'position'] as const) {
    if (actual[key] !== source[key]) {
      errors.push(`${source.id} ${key} is ${actual[key]}; expected ${source[key]}`);
    }
  }
  const ratings = expectedRatings.get(source.id);
  for (const key of ATTRIBUTE_SETS[source.position]) {
    if (actual.attributes[key] !== ratings?.[key]) {
      errors.push(
        `${source.name} ${key} is ${actual.attributes[key]}; Madden model says ${ratings?.[key]}`,
      );
    }
  }
  for (const [key, value] of Object.entries(source.madden.stats)) {
    if (!Number.isInteger(value) || value < 0 || value > 99) {
      errors.push(`${source.name} has invalid source stat ${key}: ${value}`);
    }
  }
}

for (const player of players) {
  if (!sourceById.has(player.id)) errors.push(`unsourced current player ${player.name} (${player.id})`);
}

for (const exclusion of fixture.explicitExclusions) {
  if (players.some((player) => player.name === exclusion.name)) {
    errors.push(`${exclusion.name} must be excluded: ${exclusion.reason}`);
  }
}

const playable99s = new Map<Position, ReturnType<typeof findPlayable99>>();
for (const position of ['QB', 'RB', 'WR', 'TE'] as const) {
  const path = findPlayable99(position);
  playable99s.set(position, path);
  if (!path) errors.push(`${position} has no legal unique-player path to a 99 overall`);
}

console.log(`Current-mode source check — ${fixture.season} Week ${fixture.week} (${fixture.snapshotDate})`);
console.log(`${players.length} active players, ${fixture.explicitExclusions.length} explicit reserve/PS exclusions`);
for (const [position, path] of playable99s) {
  if (!path) continue;
  console.log(
    `${position} playable 99: ` + ATTRIBUTE_SETS[position]
      .map((key) => `${key} ${path.build[key]} (${path.picks[key]?.name})`)
      .join(', '),
  );
}

if (errors.length) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  process.exit(1);
}

console.log('Roster and all Madden-derived ratings match the audited snapshot.');
