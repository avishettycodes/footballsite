import { ATTRIBUTE_SETS, PLAYERS_BY_ID, ROSTERS } from '../src/data/index';
import type { AttributeKey, Era, Position } from '../src/data/index';
import type { LeaderboardEntry, LeaderboardSubmission } from '../src/lib/leaderboard';
import { simulateCareer } from '../src/lib/scoring';

const POSITIONS: Position[] = ['QB', 'RB', 'WR', 'TE'];
const ERAS: Era[] = ['alltime', 'current'];

export type StoredLeaderboardEntry = LeaderboardEntry & { id: string };

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function cleanPlayerName(value: unknown): string {
  if (typeof value !== 'string') return '';
  const printable = [...value].filter((character) => {
    const code = character.charCodeAt(0);
    return code >= 32 && code !== 127;
  }).join('');
  return printable.replace(/\s+/g, ' ').trim().slice(0, 28);
}

/** Reject made-up ratings, incomplete cards and players submitted from the wrong league. */
export function verifySubmission(value: unknown, submittedAt = Date.now()): StoredLeaderboardEntry {
  if (!isObject(value)) throw new Error('Bad submission');
  const input = value as unknown as LeaderboardSubmission;
  const name = cleanPlayerName(input.name);
  if (!name) throw new Error('Name required');
  if (typeof input.id !== 'string' || !/^[a-z0-9-]{5,80}$/i.test(input.id)) throw new Error('Bad run');
  if (!POSITIONS.includes(input.position)) throw new Error('Bad position');
  const era = input.era ?? 'alltime';
  if (!ERAS.includes(era)) throw new Error('Bad league');
  if (typeof input.hardMode !== 'boolean') throw new Error('Bad mode');
  if (typeof input.seed !== 'string' || !/^[A-Z0-9-]{1,32}$/.test(input.seed)) throw new Error('Bad seed');
  if (!isObject(input.slots)) throw new Error('Bad build');

  const allowed = new Set(ROSTERS[era].map((player) => player.id));
  const used = new Set<string>();
  const build: Partial<Record<AttributeKey, number>> = {};
  const keys = ATTRIBUTE_SETS[input.position];

  for (const key of keys) {
    const slot = input.slots[key];
    if (!slot || slot.attribute !== key || typeof slot.playerId !== 'string') {
      throw new Error(`Missing ${key}`);
    }
    const player = PLAYERS_BY_ID[slot.playerId];
    if (!player || !allowed.has(player.id) || player.position !== input.position) {
      throw new Error(`Bad player for ${key}`);
    }
    if (used.has(player.id)) throw new Error('Player used twice');
    used.add(player.id);
    const rating = player.attributes[key];
    if (typeof rating !== 'number' || slot.value !== rating || slot.teamId !== player.teamId) {
      throw new Error(`Bad rating for ${key}`);
    }
    build[key] = rating;
  }

  if (Object.keys(input.slots).length !== keys.length) throw new Error('Wrong number of slots');

  const career = simulateCareer(input.position, build, input.seed, era);
  return {
    id: input.id,
    name,
    position: input.position,
    era,
    hardMode: input.hardMode,
    overall: career.overall,
    trophies: Object.values(career.accolades).filter(Boolean).length,
    seasons: career.seasons,
    careerYards: career.careerYards,
    submittedAt,
  };
}

/** Overall decides the board; trophies and hard mode only break ties. */
export function leaderboardScore(entry: LeaderboardEntry): number {
  return entry.overall * 100 + entry.trophies * 2 + (entry.hardMode ? 1 : 0);
}

export function leaderboardKey(era: Era, position: Position): string {
  return `gridironlab:leaderboard:${era}:${position}:scores`;
}

export const LEADERBOARD_ENTRIES_KEY = 'gridironlab:leaderboard:entries';
