/**
 * Data integrity check. Run with `npm run verify:data`.
 * Fails the process on errors so a bad hand-edit can't reach the wheel.
 */
import { ATTRIBUTE_SETS, DATA_STATS, TEAMS, getPool, positionsWithData, validateData } from '../src/data';

const issues = validateData();
const errors = issues.filter((i) => i.level === 'error');
const warnings = issues.filter((i) => i.level === 'warn');

console.log('MEGATRON — data check\n');
console.log(`teams:   ${DATA_STATS.teams}`);
console.log(`players: ${DATA_STATS.players}`);
for (const [pos, count] of Object.entries(DATA_STATS.byPosition)) {
  console.log(`  ${pos}: ${count}`);
}

for (const position of positionsWithData()) {
  const sizes = TEAMS.map((t) => getPool(position, t.id).length);
  const min = Math.min(...sizes);
  const max = Math.max(...sizes);
  console.log(`\n${position} pools across 32 franchises: min ${min}, max ${max}`);
  console.log(
    TEAMS.map((t, i) => `${t.abbr}:${sizes[i]}`).join('  '),
  );
}

/**
 * ATTRIBUTE COLLINEARITY.
 *
 * If two traits move together across a whole pool then the position effectively has one
 * fewer attribute, and every build gets less interesting because two of your eight picks
 * were really the same pick. Receivers are the obvious risk, since it is very easy to
 * make every fast man a deep threat, but tight ends will feel it too if blocking simply
 * becomes the inverse of speed.
 *
 * The cards worth having are the ones that break the pattern. A burner who could never
 * track the deep ball, or a slow one who lived on timing and body control.
 */
/**
 * Some pairs are entangled because football is genuinely like that, and forcing them
 * apart would mean inventing players who never existed. Accurate quarterbacks really do
 * tend to be the smart ones. Each of these carries a ceiling anyway, so "expected" is
 * never a blanket excuse: drift past the ceiling and it warns like anything else.
 *
 * A pair NOT listed here that correlates highly is the other kind of entangled, where
 * the pool got lazy and two picks stopped being two decisions.
 */
const EXPECTED: Record<string, { a: string; b: string; ceiling: number; why: string }[]> = {
  QB: [
    { a: 'accuracy', b: 'processing', ceiling: 0.95, why: 'accurate passers really are usually the smart ones' },
    { a: 'pocketPresence', b: 'processing', ceiling: 0.94, why: 'both are the same feel for what is about to happen' },
    { a: 'armStrength', b: 'deepBall', ceiling: 0.92, why: 'the deep ball is mostly arm talent' },
  ],
  RB: [
    { a: 'power', b: 'contactBalance', ceiling: 0.93, why: 'mass and balance are close to the same physics' },
    { a: 'speed', b: 'burst', ceiling: 0.92, why: 'related but not the same, and the pool has gliders and short-area guys to prove it' },
  ],
};

function expectationFor(position: string, a: string, b: string) {
  return (EXPECTED[position] ?? []).find(
    (e) => (e.a === a && e.b === b) || (e.a === b && e.b === a),
  );
}

console.log('\nattribute independence');
for (const position of positionsWithData()) {
  const players = TEAMS.flatMap((t) => getPool(position, t.id));
  const keys = ATTRIBUTE_SETS[position];
  const pairs: { a: string; b: string; r: number }[] = [];

  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const xs = players.map((p) => p.attributes[keys[i]] ?? 0);
      const ys = players.map((p) => p.attributes[keys[j]] ?? 0);
      const mx = xs.reduce((s, v) => s + v, 0) / xs.length;
      const my = ys.reduce((s, v) => s + v, 0) / ys.length;
      let num = 0, dx = 0, dy = 0;
      for (let k = 0; k < xs.length; k++) {
        num += (xs[k] - mx) * (ys[k] - my);
        dx += (xs[k] - mx) ** 2;
        dy += (ys[k] - my) ** 2;
      }
      const r = num / Math.sqrt(dx * dy || 1);
      pairs.push({ a: keys[i], b: keys[j], r });
    }
  }

  pairs.sort((x, y) => y.r - x.r);
  console.log(`  ${position}`);
  for (const p of pairs.slice(0, 3)) {
    const expected = expectationFor(position, p.a, p.b);
    const note = expected
      ? p.r <= expected.ceiling
        ? `expected, ${expected.why}`
        : `OVER its ${expected.ceiling} ceiling, this has drifted`
      : p.r >= 0.85
        ? 'not expected, these two have stopped being separate picks'
        : 'fine';
    console.log(`    ${p.a}/${p.b} ${p.r.toFixed(2)}  ${note}`);
  }
  for (const p of pairs) {
    const expected = expectationFor(position, p.a, p.b);
    if (expected) {
      if (p.r > expected.ceiling) {
        warnings.push({
          level: 'warn',
          message: `${position} ${p.a}/${p.b} at ${p.r.toFixed(2)} is past its ${expected.ceiling} ceiling`,
        });
      }
    } else if (p.r >= 0.85) {
      warnings.push({
        level: 'warn',
        message: `${position} ${p.a} and ${p.b} correlate at ${p.r.toFixed(2)}, so they are effectively one pick`,
      });
    }
  }
}

if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  for (const w of warnings) console.log(`  ! ${w.message}`);
}

if (errors.length) {
  console.log(`\n${errors.length} error(s):`);
  for (const e of errors) console.log(`  x ${e.message}`);
  process.exit(1);
}

console.log('\nOK — no errors.');
