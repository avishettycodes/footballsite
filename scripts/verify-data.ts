/**
 * Data integrity check. Run with `npm run verify:data`.
 * Fails the process on errors so a bad hand-edit can't reach the wheel.
 */
import { ATTRIBUTE_SETS, DATA_STATS, ERAS, ERA_LABELS, ROSTERS, TEAMS, getPool, positionsWithData, validateData } from '../src/data';
import type { Era } from '../src/data';

const issues = validateData();
const errors = issues.filter((i) => i.level === 'error');
const warnings = issues.filter((i) => i.level === 'warn');

console.log('Build a 99 — data check\n');
console.log(`teams:   ${DATA_STATS.teams}`);
console.log(`players: ${DATA_STATS.players}`);
for (const era of ERAS) {
  console.log(`  ${ERA_LABELS[era]}: ${ROSTERS[era].length}`);
  for (const [pos, count] of Object.entries(DATA_STATS.byEra[era])) {
    console.log(`    ${pos}: ${count}`);
  }
}

for (const era of ERAS) {
  for (const position of positionsWithData(era)) {
    const sizes = TEAMS.map((t) => getPool(position, t.id, era).length);
    const min = Math.min(...sizes);
    const max = Math.max(...sizes);
    console.log(`\n${ERA_LABELS[era]} ${position} pools across 32 franchises: min ${min}, max ${max}`);
    console.log(
      TEAMS.map((t, i) => `${t.abbr}:${sizes[i]}`).join('  '),
    );
  }
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
 * ONE PAIR CAME OFF THIS LIST BY BEING DELETED INSTEAD. Power and contact balance sat at
 * 0.93 for months under a note saying mass and balance are close to the same physics.
 * They are, which is the point: two slots that were really one pick. Contact balance is
 * gone from the running back card now rather than still being excused here, and that is
 * the right end of the problem to fix an entangled pair from.
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
    { a: 'speed', b: 'burst', ceiling: 0.92, why: 'related but not the same, and the pool has gliders and short-area guys to prove it' },
  ],
};

function expectationFor(position: string, a: string, b: string) {
  return (EXPECTED[position] ?? []).find(
    (e) => (e.a === a && e.b === b) || (e.a === b && e.b === a),
  );
}

/**
 * BOTH ERAS GO THROUGH THIS, and the second one is the more likely to fail it.
 *
 * A pool written in one sitting about players everybody has just watched is exactly where
 * two traits quietly collapse into one, because the same handful of adjectives get reached
 * for all afternoon. The all-time pools were written over months about players from six
 * decades, which spread them out for free.
 */
console.log('\nattribute independence');
for (const { era, position } of ERAS.flatMap((era: Era) =>
  positionsWithData(era).map((position) => ({ era, position })),
)) {
  const players = TEAMS.flatMap((t) => getPool(position, t.id, era));
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
  console.log(`  ${ERA_LABELS[era]} ${position}`);
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
          message: `${era} ${position} ${p.a}/${p.b} at ${p.r.toFixed(2)} is past its ${expected.ceiling} ceiling`,
        });
      }
    } else if (p.r >= 0.85) {
      warnings.push({
        level: 'warn',
        message: `${era} ${position} ${p.a} and ${p.b} correlate at ${p.r.toFixed(2)}, so they are effectively one pick`,
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
