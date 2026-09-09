import type { Era, Position } from '../data';
import type { SavedPlayer } from './hall';

/** The public part of a finished build. The server derives every number except the name. */
export type LeaderboardEntry = {
  name: string;
  position: Position;
  era: Era;
  hardMode: boolean;
  overall: number;
  trophies: number;
  seasons: number;
  careerYards: number;
  submittedAt: number;
};

/** Enough of the run for the server to verify the picks and reproduce the career. */
export type LeaderboardSubmission = Pick<
  SavedPlayer,
  'id' | 'name' | 'position' | 'hardMode' | 'era' | 'seed' | 'slots'
>;

export type LeaderboardSaveState = 'idle' | 'saving' | 'saved' | 'error';

export async function loadLeaderboard(
  position: Position,
  era: Era,
  signal?: AbortSignal,
): Promise<LeaderboardEntry[]> {
  const query = new URLSearchParams({ position, era, limit: '10' });
  const response = await fetch(`/api/leaderboard?${query}`, {
    cache: 'no-store',
    signal,
  });
  if (!response.ok) throw new Error('Leaderboard unavailable');
  const body = await response.json() as { entries?: LeaderboardEntry[] };
  return Array.isArray(body.entries) ? body.entries : [];
}

export async function submitLeaderboard(entry: LeaderboardSubmission): Promise<void> {
  const response = await fetch('/api/leaderboard', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(entry),
  });
  if (!response.ok) throw new Error('Leaderboard submission failed');
}
