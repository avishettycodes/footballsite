import type { Era, Position } from '../data';
import { savedEra } from './hall';
import type { SavedPlayer } from './hall';

export const LEADERBOARD_POSITIONS: Position[] = ['QB', 'RB', 'WR', 'TE'];

export type LeaderboardEntry = {
  id: string;
  name: string;
  position: Position;
  hardMode: boolean;
  overall: number;
  trophies: number;
  seasons: number;
  careerYards: number;
  savedAt: number;
};

/**
 * The leaderboard is another view of YOUR HALL, not another copy of its data. Naming a
 * finished player already saves him there, so he cannot wind up in one list but not the
 * other. Each position ranks overall first, then uses the career as the tie-breaker.
 */
export function rankLeaderboard(
  hall: SavedPlayer[],
  era: Era,
  position: Position,
  limit = 10,
): LeaderboardEntry[] {
  return hall
    .filter((player) => player.position === position && savedEra(player) === era && player.name.trim())
    .map((player) => ({
      id: player.id,
      name: player.name.trim(),
      position: player.position,
      hardMode: player.hardMode,
      overall: player.career.overall,
      trophies: Object.values(player.career.accolades).filter(Boolean).length,
      seasons: player.career.seasons,
      careerYards: player.career.careerYards,
      savedAt: player.savedAt,
    }))
    .sort((a, b) =>
      b.overall - a.overall
      || b.trophies - a.trophies
      || b.careerYards - a.careerYards
      || b.savedAt - a.savedAt)
    .slice(0, Math.max(0, limit));
}
