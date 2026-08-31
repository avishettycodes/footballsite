import { QB_PLAYERS } from './qb';
import { RB_PLAYERS } from './rb';
import { TE_PLAYERS } from './te';
import { WR_PLAYERS } from './wr';
import { TEAMS, TEAMS_BY_ID, getTeam } from './teams';
import { ATTRIBUTE_SETS, ATTRIBUTE_ABBR, ATTRIBUTE_LABELS } from './types';
import type { AttributeKey, Player, Position, Team } from './types';

export { TEAMS, TEAMS_BY_ID, getTeam, ATTRIBUTE_SETS, ATTRIBUTE_ABBR, ATTRIBUTE_LABELS };
export type { AttributeKey, Player, Position, Team };

/** Every catalogued player, all four positions. */
export const PLAYERS: Player[] = [...QB_PLAYERS, ...RB_PLAYERS, ...TE_PLAYERS, ...WR_PLAYERS];

export const PLAYERS_BY_ID: Record<string, Player> = Object.fromEntries(
  PLAYERS.map((p) => [p.id, p]),
);

/** position -> teamId -> players. The spin flow reads straight out of this. */
export const POOL_INDEX: Record<Position, Record<string, Player[]>> = (() => {
  const index = { QB: {}, RB: {}, WR: {}, TE: {} } as Record<Position, Record<string, Player[]>>;
  for (const player of PLAYERS) {
    (index[player.position][player.teamId] ||= []).push(player);
  }
  return index;
})();

export function getPool(position: Position, teamId: string): Player[] {
  return POOL_INDEX[position]?.[teamId] ?? [];
}

/** Franchises that actually have a usable pool — the wheel only spins on these. */
export function teamsWithPool(position: Position, minSize = 1): Team[] {
  return TEAMS.filter((t) => getPool(position, t.id).length >= minSize);
}

export function positionsWithData(): Position[] {
  return (Object.keys(POOL_INDEX) as Position[]).filter(
    (pos) => Object.keys(POOL_INDEX[pos]).length > 0,
  );
}

export type DataIssue = { level: 'error' | 'warn'; message: string };

/**
 * Integrity pass over the seed data. Runs in dev so a bad hand-edit is loud
 * instead of a silent empty wheel at spin time.
 */
export function validateData(): DataIssue[] {
  const issues: DataIssue[] = [];
  const seenIds = new Set<string>();

  for (const player of PLAYERS) {
    const where = `${player.name} (${player.id})`;
    if (seenIds.has(player.id)) issues.push({ level: 'error', message: `Duplicate player id: ${player.id}` });
    seenIds.add(player.id);

    if (!TEAMS_BY_ID[player.teamId]) {
      issues.push({ level: 'error', message: `${where} has unknown teamId "${player.teamId}"` });
    }

    const expected = ATTRIBUTE_SETS[player.position];
    for (const key of expected) {
      const value = player.attributes[key];
      if (typeof value !== 'number') {
        issues.push({ level: 'error', message: `${where} is missing attribute "${key}"` });
      } else if (value < 0 || value > 99) {
        issues.push({ level: 'error', message: `${where} has out-of-range ${key}: ${value}` });
      }
    }
    for (const key of Object.keys(player.attributes) as AttributeKey[]) {
      if (!expected.includes(key)) {
        issues.push({ level: 'warn', message: `${where} has stray attribute "${key}" for a ${player.position}` });
      }
    }

    // The whole game is spiky ratings. A card earns its place by having either an
    // elite trait worth stealing or a weakness funny enough to hurt. Neither = dead card.
    const values = expected.map((k) => player.attributes[k] ?? 0);
    const spread = Math.max(...values) - Math.min(...values);
    if (spread < 15 && Math.max(...values) < 88 && Math.min(...values) > 55) {
      issues.push({
        level: 'warn',
        message: `${where} dead card: spread ${spread}, peak ${Math.max(...values)}, no draftable trait`,
      });
    }
  }

  for (const position of positionsWithData()) {
    // Every slot must be fillable at an elite level somewhere in the league,
    // or a perfect run is arithmetically impossible.
    for (const key of ATTRIBUTE_SETS[position]) {
      const best = Math.max(
        ...PLAYERS.filter((p) => p.position === position).map((p) => p.attributes[key] ?? 0),
      );
      if (best < 95) {
        issues.push({
          level: 'warn',
          message: `${position} "${key}" league max ${best}, no 95+ option exists`,
        });
      }
    }

    for (const team of TEAMS) {
      const size = getPool(position, team.id).length;
      if (size === 0) {
        issues.push({ level: 'error', message: `${team.abbr} has no ${position} pool` });
      } else if (size < 6) {
        issues.push({ level: 'warn', message: `${team.abbr} ${position} pool is thin (${size}/6)` });
      }
    }
  }

  return issues;
}

export const DATA_STATS = {
  teams: TEAMS.length,
  players: PLAYERS.length,
  byPosition: Object.fromEntries(
    (Object.keys(POOL_INDEX) as Position[]).map((pos) => [
      pos,
      PLAYERS.filter((p) => p.position === pos).length,
    ]),
  ) as Record<Position, number>,
};
