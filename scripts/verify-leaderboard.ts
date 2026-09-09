import type { Position } from '../src/data';
import type { SavedPlayer } from '../src/lib/hall';
import { rankLeaderboard } from '../src/lib/leaderboard';

function build(
  id: string,
  position: Position,
  overall: number,
  trophies: number,
  era: 'alltime' | 'current' = 'current',
): SavedPlayer {
  return {
    id,
    name: id,
    position,
    era,
    hardMode: false,
    seed: 'TEST-SEED',
    savedAt: Number(id.replace(/\D/g, '')) || 1,
    pickOrder: [],
    slots: {},
    career: {
      overall,
      seasons: 8,
      careerYards: overall * 100,
      accolades: {
        allPro: trophies > 0,
        opoy: trophies > 1,
        mvp: trophies > 2,
        record: trophies > 3,
        superBowl: trophies > 4,
        hof: trophies > 5,
      },
    } as SavedPlayer['career'],
  };
}

const hall = [
  build('rb90', 'RB', 90, 1),
  build('qb95', 'QB', 95, 1),
  build('rb95-low', 'RB', 95, 1),
  build('rb95-high', 'RB', 95, 3),
  build('old-rb99', 'RB', 99, 6, 'alltime'),
];

const runningBacks = rankLeaderboard(hall, 'current', 'RB');
const quarterbacks = rankLeaderboard(hall, 'current', 'QB');
const limited = rankLeaderboard(hall, 'current', 'RB', 1);

const positionFiltered = runningBacks.length === 3 && quarterbacks.length === 1;
const overallFirst = runningBacks.map((entry) => entry.id).join(',') === 'rb95-high,rb95-low,rb90';
const eraFiltered = !runningBacks.some((entry) => entry.id === 'old-rb99');
const limitWorks = limited.length === 1 && limited[0]?.id === 'rb95-high';

console.log('\nGridironLab — local leaderboard');
console.log(`  separated by position: ${positionFiltered ? 'PASS' : 'FAIL'}`);
console.log(`  ranked by overall:     ${overallFirst ? 'PASS' : 'FAIL'}`);
console.log(`  separated by league:   ${eraFiltered ? 'PASS' : 'FAIL'}`);
console.log(`  display limit works:   ${limitWorks ? 'PASS' : 'FAIL'}`);

process.exit(positionFiltered && overallFirst && eraFiltered && limitWorks ? 0 : 1);
