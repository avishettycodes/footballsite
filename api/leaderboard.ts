import { createHash } from 'node:crypto';
import { Redis } from '@upstash/redis';
import type { Era, Position } from '../src/data/index';
import type { LeaderboardEntry } from '../src/lib/leaderboard';
import {
  LEADERBOARD_ENTRIES_KEY,
  leaderboardKey,
  leaderboardScore,
  verifySubmission,
} from './_leaderboard';
import type { StoredLeaderboardEntry } from './_leaderboard';

const MAX_BOARD_SIZE = 1000;

function client(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error('Leaderboard storage is not configured');
  return new Redis({ url, token, enableTelemetry: false });
}

function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: { 'cache-control': 'no-store' },
  });
}

function validPosition(value: string | null): value is Position {
  return value === 'QB' || value === 'RB' || value === 'WR' || value === 'TE';
}

function validEra(value: string | null): value is Era {
  return value === 'alltime' || value === 'current';
}

function publicEntry(entry: StoredLeaderboardEntry): LeaderboardEntry {
  const visible = { ...entry } as Partial<StoredLeaderboardEntry>;
  delete visible.id;
  return visible as LeaderboardEntry;
}

async function getLeaderboard(request: Request, redis: Redis): Promise<Response> {
  const url = new URL(request.url);
  const position = url.searchParams.get('position');
  const era = url.searchParams.get('era');
  if (!validPosition(position) || !validEra(era)) return json({ error: 'Bad filters' }, 400);
  const asked = Number(url.searchParams.get('limit') ?? 10);
  const limit = Number.isFinite(asked) ? Math.max(1, Math.min(25, Math.floor(asked))) : 10;
  const ids = await redis.zrange<string[]>(leaderboardKey(era, position), 0, limit - 1, { rev: true });
  if (ids.length === 0) return json({ entries: [] });

  const rows = await redis.hmget<Record<string, StoredLeaderboardEntry | string | null>>(
    LEADERBOARD_ENTRIES_KEY,
    ...ids,
  );
  const entries = ids.flatMap((id) => {
    const raw = rows?.[id];
    if (!raw) return [];
    try {
      const entry = typeof raw === 'string' ? JSON.parse(raw) as StoredLeaderboardEntry : raw;
      return [publicEntry(entry)];
    } catch {
      return [];
    }
  });
  return json({ entries });
}

async function rateLimit(request: Request, redis: Redis): Promise<boolean> {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const fingerprint = createHash('sha256').update(forwarded).digest('hex').slice(0, 20);
  const key = `gridironlab:leaderboard:rate:${fingerprint}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 60);
  return count <= 12;
}

async function postLeaderboard(request: Request, redis: Redis): Promise<Response> {
  if (!(await rateLimit(request, redis))) return json({ error: 'Slow down' }, 429);
  const size = Number(request.headers.get('content-length') ?? 0);
  if (size > 20_000) return json({ error: 'Submission too large' }, 413);

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return json({ error: 'Bad JSON' }, 400);
  }

  let entry: StoredLeaderboardEntry;
  try {
    entry = verifySubmission(input);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Bad submission' }, 400);
  }

  const board = leaderboardKey(entry.era, entry.position);
  const transaction = redis.multi();
  transaction.hset(LEADERBOARD_ENTRIES_KEY, { [entry.id]: JSON.stringify(entry) });
  transaction.zadd(board, { score: leaderboardScore(entry), member: entry.id });
  await transaction.exec();

  const overflow = await redis.zcard(board) - MAX_BOARD_SIZE;
  if (overflow > 0) {
    const oldIds = await redis.zrange<string[]>(board, 0, overflow - 1);
    if (oldIds.length) {
      const cleanup = redis.multi();
      cleanup.zrem(board, ...oldIds);
      cleanup.hdel(LEADERBOARD_ENTRIES_KEY, ...oldIds);
      await cleanup.exec();
    }
  }

  return json({ entry: publicEntry(entry) }, 201);
}

export default {
  async fetch(request: Request): Promise<Response> {
    let redis: Redis;
    try {
      redis = client();
    } catch {
      return json({ error: 'Leaderboard storage is not configured' }, 503);
    }

    if (request.method === 'GET') return getLeaderboard(request, redis);
    if (request.method === 'POST') return postLeaderboard(request, redis);
    return json({ error: 'Method not allowed' }, 405);
  },
};
