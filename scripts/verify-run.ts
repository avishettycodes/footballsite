/**
 * Drives the real Zustand store through complete runs and asserts the rules:
 * player-used-once, slot-filled-once, hard-mode no-repeat, and determinism by seed.
 */
import { useGame } from '../src/store/gameStore';
import { ATTRIBUTE_SETS, getPool } from '../src/data';
import type { AttributeKey } from '../src/data';

type Result = { picks: string[]; teams: string[]; ok: boolean; notes: string[] };

function playRun(seed: string, hardMode: boolean): Result {
  const s = useGame.getState();
  s.abandonRun();
  s.startRun({ position: 'RB', hardMode, seed });

  const notes: string[] = [];
  const picks: string[] = [];
  const teams: string[] = [];
  let guard = 0;

  while (useGame.getState().phase !== 'complete' && guard++ < 100) {
    const g = useGame.getState();
    if (g.phase === 'ready') { g.spin(); continue; }
    if (g.phase === 'spinning') { g.landSpin(); continue; }
    if (g.phase === 'picking') {
      const state = useGame.getState();
      teams.push(state.currentTeamId!);
      const pool = getPool(state.position, state.currentTeamId!).filter(
        (p) => !state.usedPlayerIds.includes(p.id),
      );
      if (pool.length === 0) { notes.push('LANDED ON AN EXHAUSTED POOL — deadlock rule failed'); break; }
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
  const uniquePlayers = new Set(g.usedPlayerIds).size === g.usedPlayerIds.length;
  const noRepeatTeams = !hardMode || new Set(teams).size === teams.length;

  if (!allFilled) notes.push('not all slots filled');
  if (!uniquePlayers) notes.push('a player was used twice');
  if (!noRepeatTeams) notes.push('hard mode repeated a franchise');

  return { picks, teams, ok: allFilled && uniquePlayers && noRepeatTeams && notes.length === 0, notes };
}

console.log('MEGATRON — run simulation\n');

const a = playRun('GRIDIRON-7QX3', false);
const b = playRun('GRIDIRON-7QX3', false);
const hard = playRun('BLITZ-M4KP', true);

console.log('normal  GRIDIRON-7QX3 teams:', a.teams.join(' '));
console.log('replay  GRIDIRON-7QX3 teams:', b.teams.join(' '));
console.log('hard    BLITZ-M4KP    teams:', hard.teams.join(' '));
console.log('\nhard-mode build:', hard.picks.join('  '));

const deterministic = a.teams.join() === b.teams.join() && a.picks.join() === b.picks.join();

// 400 random seeds, both modes — the deadlock rule must never strand a run.
let stranded = 0;
for (let i = 0; i < 400; i++) {
  const r = playRun(`FUZZ-${i}`, i % 2 === 0);
  if (!r.ok) { stranded++; if (stranded < 4) console.log('  FAIL', i, r.notes.join('; ')); }
}

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
  useGame.getState().startRun({ position: 'RB', hardMode: false, seed });
  let guard = 0;
  while (useGame.getState().phase !== 'complete' && guard++ < 100) {
    const g = useGame.getState();
    if (g.phase === 'ready') { g.spin(); continue; }
    if (g.phase === 'spinning') { g.landSpin(); continue; }
    if (g.phase !== 'picking') break;
    const pool = getPool(g.position, g.currentTeamId!).filter((p) => !g.usedPlayerIds.includes(p.id));
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

console.log(`\nnormal run completes:   ${a.ok ? 'PASS' : 'FAIL — ' + a.notes.join('; ')}`);
console.log(`hard run completes:     ${hard.ok ? 'PASS' : 'FAIL — ' + hard.notes.join('; ')}`);
console.log(`same seed, same run:    ${deterministic ? 'PASS' : 'FAIL'}`);
console.log(`400 fuzz runs, 0 stuck: ${stranded === 0 ? 'PASS' : `FAIL (${stranded} stranded)`}`);
console.log(`SB roll idempotent:     ${idempotent ? 'PASS' : 'FAIL — refreshing re-rolls the ring'}`);
console.log(`SB coin shared by seed: ${sameCoin ? 'PASS' : 'FAIL'} (roll ${good.superBowl.roll.toFixed(4)})`);
console.log(`  best build ${good.overall} OVR, ${(good.superBowl.odds * 100).toFixed(0)}% -> ${good.superBowl.won ? 'RING' : 'no ring'}`);
console.log(`  worst build ${bad.overall} OVR, ${(bad.superBowl.odds * 100).toFixed(0)}% -> ${bad.superBowl.won ? 'RING' : 'no ring'}`);
console.log(`better build, better odds: ${betterBuildBetterOdds ? 'PASS' : 'FAIL'}`);

process.exit(a.ok && hard.ok && deterministic && stranded === 0 && idempotent && sameCoin && betterBuildBetterOdds ? 0 : 1);
