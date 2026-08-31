/**
 * Proves the `?seed=` contract: identical seeds produce identical spin sequences,
 * different seeds diverge, and the PRNG state is fully serializable mid-run.
 */
import { hashSeed, nextPick, nextRandom } from '../src/lib/rng';
import { TEAMS } from '../src/data';

const ids = TEAMS.map((t) => t.id);

function spins(seed: string, n: number): string[] {
  let state = hashSeed(seed);
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const draw = nextPick(state, ids);
    state = draw.state;
    out.push(draw.value);
  }
  return out;
}

const a = spins('GRIDIRON-7QX3', 8);
const b = spins('GRIDIRON-7QX3', 8);
const c = spins('GRIDIRON-7QX4', 8);

console.log('seed GRIDIRON-7QX3 ->', a.join(' '));
console.log('seed GRIDIRON-7QX3 ->', b.join(' '), '(replay)');
console.log('seed GRIDIRON-7QX4 ->', c.join(' '));

const same = a.join() === b.join();
const differs = a.join() !== c.join();

// Serialize mid-run and continue from the restored state — this is the autosave path.
let state = hashSeed('TURF-ABCD');
for (let i = 0; i < 4; i++) state = nextPick(state, ids).state;
const frozen = JSON.parse(JSON.stringify({ state })).state;
const contA = [0, 1, 2].map(() => (state = nextPick(state, ids).state));
let restored = frozen;
const contB = [0, 1, 2].map(() => (restored = nextPick(restored, ids).state));
const resumeOk = contA.join() === contB.join();

// Distribution sanity: 32 buckets over 320k draws should sit near 10000 each.
let s = hashSeed('DIST');
const buckets = new Array(32).fill(0);
for (let i = 0; i < 320_000; i++) {
  const d = nextRandom(s);
  s = d.state;
  buckets[Math.floor(d.value * 32)]++;
}
const min = Math.min(...buckets);
const max = Math.max(...buckets);
const flat = min > 9300 && max < 10700;

console.log(`\nreplay identical:      ${same ? 'PASS' : 'FAIL'}`);
console.log(`different seed differs: ${differs ? 'PASS' : 'FAIL'}`);
console.log(`resume from savefile:   ${resumeOk ? 'PASS' : 'FAIL'}`);
console.log(`uniform (min ${min}, max ${max}): ${flat ? 'PASS' : 'FAIL'}`);

process.exit(same && differs && resumeOk && flat ? 0 : 1);
