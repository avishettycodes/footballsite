import { QB_PLAYERS } from './qb';
import { RB_PLAYERS } from './rb';
import { TE_PLAYERS } from './te';
import { WR_PLAYERS } from './wr';
import { QB_CURRENT } from './current/qb';
import { RB_CURRENT } from './current/rb';
import { TE_CURRENT } from './current/te';
import { WR_CURRENT } from './current/wr';
import { TEAMS, TEAMS_BY_ID, getTeam } from './teams';
import { ATTRIBUTE_SETS, ATTRIBUTE_ABBR, ATTRIBUTE_LABELS, ERAS, ERA_LABELS } from './types';
import type { AttributeKey, Era, Player, Position, Team } from './types';

export {
  TEAMS, TEAMS_BY_ID, getTeam,
  ATTRIBUTE_SETS, ATTRIBUTE_ABBR, ATTRIBUTE_LABELS,
  ERAS, ERA_LABELS,
};
export type { AttributeKey, Era, Player, Position, Team };

/**
 * The two datasets, whole and separate.
 *
 * Nothing in the game ever reads across them. A run picks an era on the start screen and
 * every pool, every supply statistic and every derived gate reads that one for the rest
 * of the run. The reason they are separate rather than one list with a flag is written on
 * the Era type: the same man is rated against different company in each, so he is two
 * different cards rather than one card with a filter over it.
 */
export const ROSTERS: Record<Era, Player[]> = {
  alltime: [...QB_PLAYERS, ...RB_PLAYERS, ...TE_PLAYERS, ...WR_PLAYERS],
  current: [...QB_CURRENT, ...RB_CURRENT, ...TE_CURRENT, ...WR_CURRENT],
};

/**
 * Every catalogued player in both eras.
 *
 * This exists for the checks that are about the WRITING rather than about a run: the
 * blurb voice pass reads it, and so does the id uniqueness check. Nothing that deals a
 * card should use it, because a list holding both eras at once is the one thing a run
 * must never see.
 */
export const PLAYERS: Player[] = [...ROSTERS.alltime, ...ROSTERS.current];

export const PLAYERS_BY_ID: Record<string, Player> = Object.fromEntries(
  PLAYERS.map((p) => [p.id, p]),
);

/** era -> position -> teamId -> players. The spin flow reads straight out of this. */
export const POOL_INDEX: Record<Era, Record<Position, Record<string, Player[]>>> = (() => {
  const index = {} as Record<Era, Record<Position, Record<string, Player[]>>>;
  for (const era of ERAS) {
    index[era] = { QB: {}, RB: {}, WR: {}, TE: {} } as Record<Position, Record<string, Player[]>>;
    for (const player of ROSTERS[era]) {
      (index[era][player.position][player.teamId] ||= []).push(player);
    }
  }
  return index;
})();

/**
 * ERA IS A REQUIRED ARGUMENT AND HAS NO DEFAULT, which is deliberate and mildly
 * annoying. A default would mean any call site that forgot about the second dataset
 * silently kept dealing all-time cards inside a current run, and it would compile, ship
 * and look completely normal until somebody noticed Jim Brown on a 2026 roster.
 */
export function getPool(position: Position, teamId: string, era: Era): Player[] {
  return POOL_INDEX[era]?.[position]?.[teamId] ?? [];
}

/** Franchises that actually have a usable pool — the wheel only spins on these. */
export function teamsWithPool(position: Position, era: Era, minSize = 1): Team[] {
  return TEAMS.filter((t) => getPool(position, t.id, era).length >= minSize);
}

export function positionsWithData(era: Era): Position[] {
  return (Object.keys(POOL_INDEX[era]) as Position[]).filter(
    (pos) => Object.keys(POOL_INDEX[era][pos]).length > 0,
  );
}

export type DataIssue = { level: 'error' | 'warn'; message: string };

/**
 * Integrity pass over the seed data. Runs in dev so a bad hand-edit is loud
 * instead of a silent empty wheel at spin time.
 *
 * SIX PER FRANCHISE IN BOTH LEAGUES, and the current pools reach back a few seasons to get
 * there rather than padding with anybody invented.
 *
 * That was briefly relaxed, on 2026-09-08, while the current pools held only the men on a
 * depth chart that morning. Rooms fell to three and the mode stopped working: a hole-free
 * quarterback build came out under the All-Pro line and half of runs won nothing. Six is
 * back because six is what the game needs, and the years on each card say who is here now
 * and who held the job last season.
 *
 * What no check here can do is tell you a name is wrong. That is a person reading the pools
 * against a depth chart. See the refresh section in the README.
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

  /** Six per franchise per position, in both leagues. See the note above. */
  const THIN_POOL: Partial<Record<Era, number>> = { alltime: 6, current: 6 };

  for (const era of ERAS) {
    for (const position of positionsWithData(era)) {
      // Every slot must be fillable at an elite level somewhere in the league,
      // or a perfect run is arithmetically impossible.
      for (const key of ATTRIBUTE_SETS[position]) {
        const best = Math.max(
          ...ROSTERS[era].filter((p) => p.position === position).map((p) => p.attributes[key] ?? 0),
        );
        if (best < 95) {
          issues.push({
            level: 'warn',
            message: `${era} ${position} "${key}" league max ${best}, no 95+ option exists`,
          });
        }
      }

      for (const team of TEAMS) {
        const size = getPool(position, team.id, era).length;
        if (size === 0) {
          issues.push({ level: 'error', message: `${era}: ${team.abbr} has no ${position} pool` });
        } else if (size < (THIN_POOL[era] ?? 0)) {
          issues.push({
            level: 'warn',
            message: `${era}: ${team.abbr} ${position} pool is thin (${size}/${THIN_POOL[era]})`,
          });
        }
      }
    }
  }

  return issues;
}

export const DATA_STATS = {
  teams: TEAMS.length,
  players: PLAYERS.length,
  byEra: Object.fromEntries(
    ERAS.map((era) => [
      era,
      Object.fromEntries(
        (Object.keys(POOL_INDEX[era]) as Position[]).map((pos) => [
          pos,
          ROSTERS[era].filter((p) => p.position === pos).length,
        ]),
      ) as Record<Position, number>,
    ]),
  ) as Record<Era, Record<Position, number>>,
};
