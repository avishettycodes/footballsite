/**
 * Proves the `?seed=` contract: identical seeds produce identical spin sequences,
 * different seeds diverge, and the PRNG state is fully serializable mid-run.
 *
 * It also proves the half of that contract that lives outside the generator. A tester
 * reported broken seeds while every check in here passed, because the generator was
 * never the broken part. The share button handed him a sentence, the seed box filed
 * that sentence down into a legal 32 character seed, and he got a different game with
 * nothing on screen admitting it. The round trip is now part of the contract: whatever
 * the share button copies has to come back out of the seed box as the same seed, and
 * anything with no seed in it has to be rejected rather than quietly accepted.
 */
import { hashSeed, nextPick, nextRandom, parseSeedInput } from '../src/lib/rng';
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

// THE ROUND TRIP. What the results screen copies must survive being pasted back in.
const SEED = 'GRIDIRON-7QX3';
const shared = `https://megatron.example/?seed=${SEED}`;
const boxCases: { name: string; input: string; seed: string; junk: boolean }[] = [
  { name: 'the copied link', input: shared, seed: SEED, junk: false },
  { name: 'a link inside a sentence', input: `beat this: ${shared} good luck`, seed: SEED, junk: false },
  { name: 'the bare code', input: SEED, seed: SEED, junk: false },
  { name: 'texted in lower case', input: 'gridiron-7qx3', seed: SEED, junk: false },
  { name: 'a query fragment on its own', input: `?seed=${SEED}`, seed: SEED, junk: false },
  { name: 'a home-made phrase', input: 'my cool seed', seed: 'MYCOOLSEED', junk: false },
  { name: 'the old share sentence, which has no seed in it', junk: true, seed: '',
    input: 'My player came out at 91 overall with 3 accolade(s). Same seed gives you the same spins.' },
  { name: 'nothing at all', input: '   ', seed: '', junk: false },
];

const boxResults = boxCases.map((c) => {
  const got = parseSeedInput(c.input);
  return { ...c, got, ok: got.seed === c.seed && got.junk === c.junk };
});
for (const r of boxResults) {
  console.log(`  ${r.ok ? 'PASS' : 'FAIL'}  seed box, ${r.name} -> ${r.got.junk ? 'rejected' : r.got.seed || '(random)'}`);
}
// The recovered seed has to deal the same wheel, not merely look the same.
const boxRoundTrip = spins(parseSeedInput(shared).seed, 8).join() === spins(SEED, 8).join();
const boxOk = boxResults.every((r) => r.ok) && boxRoundTrip;

console.log(`\nreplay identical:      ${same ? 'PASS' : 'FAIL'}`);
console.log(`seed box round trip:    ${boxOk ? 'PASS' : 'FAIL'}`);
console.log(`different seed differs: ${differs ? 'PASS' : 'FAIL'}`);
console.log(`resume from savefile:   ${resumeOk ? 'PASS' : 'FAIL'}`);
console.log(`uniform (min ${min}, max ${max}): ${flat ? 'PASS' : 'FAIL'}`);

process.exit(same && differs && resumeOk && flat && boxOk ? 0 : 1);
