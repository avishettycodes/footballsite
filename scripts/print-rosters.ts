/**
 * Prints the current-era rooms, one line per franchise per position.
 *
 * THIS EXISTS FOR THE REFRESH. The current pools claim to hold the players on a roster
 * now, and rosters move, so somebody has to sit down with a depth chart every few weeks
 * and reconcile. That job is only cheap if the file can be read in the same shape the
 * depth chart is in, which is what this prints.
 *
 * The rule the reconciliation follows is on the Era type in src/data/types.ts, and this
 * comment used to describe the older, looser version of it. A room is exactly as deep as
 * the depth chart says. Nobody is added to round a room up, injured reserve and the exempt
 * list both count as out, and a player who signs elsewhere moves rather than leaving a
 * card behind.
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
  `\n${total} cards across ${positions.join(', ')}. A room is as deep as the depth ` +
  'chart says, so some hold two and some hold six.',
);
