/**
 * Drives the real Zustand store through complete runs and asserts the rules:
 * slot-filled-once, repeat-player donations, zero rerolls in hard mode, and determinism
 * by seed.
 *
 * THE FUZZ GOT BIGGER BECAUSE HARD MODE CHANGED SHAPE. Hard mode used to strike each
 * visited franchise off the wheel. Repeats are now legal in both modes, and a repeated
 * player may donate another open trait. That is essential when the same real Madden
 * leader tops multiple categories.
 */
import { quitNeedsConfirmation, useGame } from '../src/store/gameStore';
import { ATTRIBUTE_SETS, ERAS, getPool, positionsWithData } from '../src/data';
import type { AttributeKey, Era, Position } from '../src/data';

type Result = { picks: string[]; teams: string[]; ok: boolean; notes: string[] };

function playRun(seed: string, hardMode: boolean, position: Position = 'RB', era: Era = 'alltime'): Result {
  const s = useGame.getState();
  s.abandonRun();
  s.startRun({ position, hardMode, era, seed });

  const notes: string[] = [];
  const picks: string[] = [];
  const teams: string[] = [];
  let guard = 0;

  while (useGame.getState().phase !== 'complete' && guard++ < 100) {
    const g = useGame.getState();
    if (g.phase === 'ready') {
      g.spin();
      continue;
    }
    if (g.phase === 'spinning') { g.landSpin(); continue; }
    if (g.phase === 'picking') {
      const state = useGame.getState();
      teams.push(state.currentTeamId!);
      const pool = getPool(state.position, state.currentTeamId!, state.era);
      if (pool.length === 0) { notes.push('LANDED ON AN EMPTY POOL'); break; }
      const open = ATTRIBUTE_SETS[state.position].filter((k) => !state.slots[k]);
      // Greedy: take the best available number for any open slot.
      let best = { pid: '', attr: open[0], val: -1 };
      for (const p of pool) {
        for (const k of open) {
          const v = p.attributes[k] ?? 0;
          if (v > best.val) best = { pid: p.id, attr: k as AttributeKey, val: v };
        }
      }
      picks.push(`${best.attr}=${best.val}`);
      state.takeAttribute(best.pid, best.attr);
      continue;
    }
    notes.push(`unexpected phase: ${g.phase}`); break;
  }

  const g = useGame.getState();
  const keys = ATTRIBUTE_SETS[g.position];
  const allFilled = keys.every((k) => g.slots[k]);
  // Repeating a franchise is legal now, in both modes. What hard mode owes you is
  // nothing: no rerolls, and no way to talk your way out of a roster you do not like.
  const noRerollsInHardMode = !hardMode || g.rerollsLeft === 0;

  if (!allFilled) notes.push('not all slots filled');
  if (!noRerollsInHardMode) notes.push(`hard mode handed out ${g.rerollsLeft} rerolls`);

  return {
    picks, teams, notes,
    ok: allFilled && noRerollsInHardMode && notes.length === 0,
  };
}

console.log('Build a 99 — run simulation\n');

const a = playRun('GRIDIRON-7QX3', false);
const b = playRun('GRIDIRON-7QX3', false);
const hard = playRun('BLITZ-M4KP', true);

console.log('normal  GRIDIRON-7QX3 teams:', a.teams.join(' '));
console.log('replay  GRIDIRON-7QX3 teams:', b.teams.join(' '));
console.log('hard    BLITZ-M4KP    teams:', hard.teams.join(' '));
console.log('\nhard-mode build:', hard.picks.join('  '));

const deterministic = a.teams.join() === b.teams.join() && a.picks.join() === b.picks.join();

// Every position, both modes, 1500 seeds each. Repeated franchises and players remain
// legal, but every run must still fill exactly seven different attribute slots.
const FUZZ = 1500;
let stranded = 0;
let repeatedRuns = 0;
let fuzzed = 0;
const perPosition: string[] = [];
for (const era of ERAS) {
  for (const position of positionsWithData(era)) {
    let positionStranded = 0;
    let positionRepeats = 0;
    for (let i = 0; i < FUZZ; i++) {
      const hard = i % 2 === 0;
      const r = playRun(`FUZZ-${era}-${position}-${i}`, hard, position, era);
      fuzzed++;
      if (new Set(r.teams).size !== r.teams.length) positionRepeats++;
      if (!r.ok) {
        positionStranded++;
        if (stranded + positionStranded < 4) {
          console.log(`  FAIL ${era} ${position} ${hard ? 'hard' : 'normal'} seed ${i}: ${r.notes.join('; ')}`);
        }
      }
    }
    stranded += positionStranded;
    repeatedRuns += positionRepeats;
    perPosition.push(
      `  ${era} ${position}: ${positionRepeats}/${FUZZ} runs hit the same franchise twice, ` +
      `${positionStranded} stranded`,
    );
  }
}

// A real Current TE 99 needs three different traits from Trey McBride. Prove the store
// accepts that only after three separate Arizona landings and still fills one slot each.
useGame.getState().abandonRun();
useGame.getState().startRun({ position: 'TE', hardMode: false, era: 'current', seed: 'REPEAT-LEADER' });
for (const attribute of ['hands', 'routeRunning', 'yac'] as const) {
  useGame.setState({ phase: 'picking', currentTeamId: 'ari' });
  useGame.getState().takeAttribute('now-ari-mcbride', attribute);
}
const repeatedLeaderState = useGame.getState();
const repeatedLeaderWorks = repeatedLeaderState.usedPlayerIds.filter(
  (id) => id === 'now-ari-mcbride',
).length === 3 && ['hands', 'routeRunning', 'yac'].every(
  (key) => repeatedLeaderState.slots[key]?.playerId === 'now-ari-mcbride',
);

// --- Super Bowl roll properties -------------------------------------------------
// 1. Rolling is idempotent: re-running the simulation cannot change the outcome,
//    so nobody can refresh the results screen until they win a ring.
useGame.getState().abandonRun();
playRun('RING-TEST', false);
useGame.getState().runSimulation();
const firstRoll = useGame.getState().career!.superBowl;
useGame.getState().runSimulation();
useGame.getState().runSimulation();
const afterRepeat = useGame.getState().career!.superBowl;
const idempotent = firstRoll.roll === afterRepeat.roll && firstRoll.won === afterRepeat.won;

// 2. The roll is keyed on the seed alone, so two people who make DIFFERENT picks on
//    the same shared seed face the identical coin — only build quality decides it.
function rollFor(seed: string, mode: 'greedy' | 'worst') {
  useGame.getState().abandonRun();
  useGame.getState().startRun({ position: 'RB', hardMode: false, era: 'alltime', seed });
  let guard = 0;
  while (useGame.getState().phase !== 'complete' && guard++ < 100) {
    const g = useGame.getState();
    if (g.phase === 'ready') { g.spin(); continue; }
    if (g.phase === 'spinning') { g.landSpin(); continue; }
    if (g.phase !== 'picking') break;
    const pool = getPool(g.position, g.currentTeamId!, g.era);
    const open = ATTRIBUTE_SETS[g.position].filter((k) => !g.slots[k]) as AttributeKey[];
    let pid = pool[0].id;
    let attr = open[0];
    let best = mode === 'greedy' ? -1 : 1e9;
    for (const p of pool) for (const k of open) {
      const v = p.attributes[k] ?? 0;
      if (mode === 'greedy' ? v > best : v < best) { best = v; pid = p.id; attr = k; }
    }
    useGame.getState().takeAttribute(pid, attr);
  }
  useGame.getState().runSimulation();
  return useGame.getState().career!;
}

const good = rollFor('SHARED-SEED-1', 'greedy');
const bad = rollFor('SHARED-SEED-1', 'worst');
const sameCoin = good.superBowl.roll === bad.superBowl.roll;
const betterBuildBetterOdds = good.superBowl.odds > bad.superBowl.odds;
const quitThresholdHolds = !quitNeedsConfirmation(4) && quitNeedsConfirmation(5);

console.log(`\nnormal run completes:   ${a.ok ? 'PASS' : 'FAIL — ' + a.notes.join('; ')}`);
console.log(`hard run completes:     ${hard.ok ? 'PASS' : 'FAIL — ' + hard.notes.join('; ')}`);
console.log(`same seed, same run:    ${deterministic ? 'PASS' : 'FAIL'}`);
console.log(`${fuzzed} fuzz runs, 0 stuck: ${stranded === 0 ? 'PASS' : `FAIL (${stranded} stranded)`}`);
console.log(perPosition.join('\n'));
console.log(`  ${repeatedRuns} of ${fuzzed} runs landed on a franchise more than once`);
console.log(`repeat leader can donate another open trait: ${repeatedLeaderWorks ? 'PASS' : 'FAIL'}`);
console.log(`SB roll idempotent:     ${idempotent ? 'PASS' : 'FAIL — refreshing re-rolls the ring'}`);
console.log(`SB coin shared by seed: ${sameCoin ? 'PASS' : 'FAIL'} (roll ${good.superBowl.roll.toFixed(4)})`);
console.log(`  best build ${good.overall} OVR, ${(good.superBowl.odds * 100).toFixed(0)}% -> ${good.superBowl.won ? 'RING' : 'no ring'}`);
console.log(`  worst build ${bad.overall} OVR, ${(bad.superBowl.odds * 100).toFixed(0)}% -> ${bad.superBowl.won ? 'RING' : 'no ring'}`);
console.log(`better build, better odds: ${betterBuildBetterOdds ? 'PASS' : 'FAIL'}`);
console.log(`QUIT protects a late run: ${quitThresholdHolds ? 'PASS' : 'FAIL'} (immediate at 4 slots, asks at 5)`);

process.exit(
  a.ok && hard.ok && deterministic && stranded === 0 && repeatedLeaderWorks &&
  idempotent && sameCoin && betterBuildBetterOdds && quitThresholdHolds ? 0 : 1,
);
