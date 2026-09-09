/**
 * Prints the current-era rooms, one line per franchise per position.
 *
 * THIS EXISTS FOR THE REFRESH. The current pools claim to hold the men on a roster now,
 * and rosters move, so somebody has to sit down with a depth chart a few times a season
 * and reconcile. That job is only cheap if the file can be read in the same shape the
 * depth chart is in, which is what this prints.
 *
 * The rule the reconciliation follows is on the Era type in src/data/types.ts: the top of a
 * room is whoever is on the depth chart today, and the rest are the men who held the job
 * over the last few seasons, with the years saying which is which. Six a room, because
 * three does not play. A man who signs elsewhere gets a card at his new franchise and keeps
 * a closed one where he was.
 *
 *   npm run rosters            every position
 *   npm run rosters -- QB TE   just those
 */
import { TEAMS, getPool, positionsWithData } from '../src/data';
import type { Position } from '../src/data';

const asked = process.argv.slice(2).map((a) => a.toUpperCase());
const positions = positionsWithData('current').filter((p) => !asked.length || asked.includes(p));

for (const team of TEAMS) {
  console.log(`\n${team.abbr}  ${team.city} ${team.name}`);
  for (const position of positions) {
    const pool = getPool(position, team.id, 'current');
    console.log(
      `  ${position}  ` +
      pool.map((p, i) => `${i + 1}. ${p.name} (${p.years})`).join('   '),
    );
  }
}

const total = positions.reduce(
  (n, p) => n + TEAMS.reduce((m, t) => m + getPool(p, t.id, 'current').length, 0),
  0,
);
console.log(
  `\n${total} cards across ${positions.join(', ')}. Six a room: the men there now, ` +
  'and the ones who held the job over the last few seasons.',
);
