/**
 * Drives the real Zustand store through complete runs and asserts the rules:
 * player-used-once, slot-filled-once, zero rerolls in hard mode, and determinism by
 * seed.
 *
 * THE FUZZ GOT BIGGER BECAUSE HARD MODE CHANGED SHAPE. Hard mode used to strike each
 * visited franchise off the wheel, which made an exhausted pool almost unreachable: you
 * could not land on the same roster twice, so you could not drain one. Repeats are now
 * legal in both modes, so the free-respin rule in drawTeam() is the only thing standing
 * between a run and a deadlock. That deserves more than 400 seeds on one position, so
 * this now fuzzes every position in both modes and counts how often the free respin
 * actually fires. Tight end is the one to watch, since it has seven slots and the
 * thinnest pools, which is the shortest path to draining a roster.
 */
import { quitNeedsConfirmation, useGame } from '../src/store/gameStore';
import { ATTRIBUTE_SETS, ERAS, ROSTERS, TEAMS, getPool, positionsWithData } from '../src/data';
import type { AttributeKey, Era, Position } from '../src/data';

type Result = { picks: string[]; teams: string[]; ok: boolean; notes: string[]; freeRespins: number };

function playRun(seed: string, hardMode: boolean, position: Position = 'RB', era: Era = 'alltime'): Result {
  const s = useGame.getState();
  s.abandonRun();
  s.startRun({ position, hardMode, era, seed });

  const notes: string[] = [];
  const picks: string[] = [];
  const teams: string[] = [];
  let freeRespins = 0;
  let guard = 0;

  while (useGame.getState().phase !== 'complete' && guard++ < 100) {
    const g = useGame.getState();
    if (g.phase === 'ready') {
      g.spin();
      if (useGame.getState().lastEventMessage) freeRespins++;
      continue;
    }
    if (g.phase === 'spinning') { g.landSpin(); continue; }
    if (g.phase === 'picking') {
      const state = useGame.getState();
      teams.push(state.currentTeamId!);
      const pool = getPool(state.position, state.currentTeamId!, state.era).filter(
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
  // Repeating a franchise is legal now, in both modes. What hard mode owes you is
  // nothing: no rerolls, and no way to talk your way out of a roster you do not like.
  const noRerollsInHardMode = !hardMode || g.rerollsLeft === 0;

  if (!allFilled) notes.push('not all slots filled');
  if (!uniquePlayers) notes.push('a player was used twice');
  if (!noRerollsInHardMode) notes.push(`hard mode handed out ${g.rerollsLeft} rerolls`);

  return {
    picks, teams, freeRespins, notes,
    ok: allFilled && uniquePlayers && noRerollsInHardMode && notes.length === 0,
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

// Every position, both modes, 1500 seeds each. The deadlock rule must never strand a
// run now that a franchise can come up as many times as the wheel feels like.
/*
  BOTH LEAGUES GET FUZZED, and the current one is where a strand is actually plausible.
  Its pools are six deep against seven to nine, so a run of seven picks can drain a
  roster in seven landings rather than needing eight, and the free respin is the only
  thing between that and a dead run.
*/
const FUZZ = 1500;
let stranded = 0;
let freeRespins = 0;
let repeatedRuns = 0;
let fuzzed = 0;
const perPosition: string[] = [];
for (const era of ERAS) {
  for (const position of positionsWithData(era)) {
    let positionStranded = 0;
    let positionRespins = 0;
    let positionRepeats = 0;
    for (let i = 0; i < FUZZ; i++) {
      const hard = i % 2 === 0;
      const r = playRun(`FUZZ-${era}-${position}-${i}`, hard, position, era);
      fuzzed++;
      positionRespins += r.freeRespins;
      if (new Set(r.teams).size !== r.teams.length) positionRepeats++;
      if (!r.ok) {
        positionStranded++;
        if (stranded + positionStranded < 4) {
          console.log(`  FAIL ${era} ${position} ${hard ? 'hard' : 'normal'} seed ${i}: ${r.notes.join('; ')}`);
        }
      }
    }
    stranded += positionStranded;
    freeRespins += positionRespins;
    repeatedRuns += positionRepeats;
    perPosition.push(
      `  ${era} ${position}: ${positionRepeats}/${FUZZ} runs hit the same franchise twice, ` +
      `${positionRespins} free respins, ${positionStranded} stranded`,
    );
  }
}

// --- the deadlock rule, forced ---------------------------------------------------
/**
 * The fuzz above never drains a roster, because a player who takes the best number on
 * the board spreads his picks across the league. Six thousand runs produced zero free
 * respins, which means the branch that stops a deadlock went completely untested by it.
 * So provoke it directly.
 *
 * This marks every player at every franchise but one as already used, then spins a few
 * hundred times. The wheel still draws from all 32, so almost every draw lands on a
 * drained roster and the free respin is the only reason the game can carry on. Every
 * landing must have somebody left on it, and none of them may cost a reroll.
 */
function forcedDeadlock(position: Position, era: Era) {
  const survivor = TEAMS[0].id;
  const drained = ROSTERS[era]
    .filter((p) => p.position === position && p.teamId !== survivor)
    .map((p) => p.id);

  useGame.getState().abandonRun();
  useGame.getState().startRun({ position, hardMode: true, era, seed: `DEADLOCK-${era}-${position}` });
  useGame.setState({ usedPlayerIds: drained });

  let frees = 0;
  let landedEmpty = 0;
  let gotStuck = 0;
  let rerollsSpent = 0;
  for (let i = 0; i < 300; i++) {
    useGame.setState({ phase: 'ready', lastEventMessage: null });
    useGame.getState().spin();
    const st = useGame.getState();
    if (st.phase === 'stuck') { gotStuck++; break; }
    if (st.lastEventMessage) frees++;
    if (st.rerollsLeft !== 0) rerollsSpent++;
    const left = getPool(position, st.currentTeamId!, era).filter(
      (p) => !st.usedPlayerIds.includes(p.id),
    );
    if (left.length === 0) landedEmpty++;
  }
  return { frees, landedEmpty, gotStuck, rerollsSpent, survivor };
}

const forced = ERAS.flatMap((era) =>
  positionsWithData(era).map((pos) => ({ pos: `${era} ${pos}`, r: forcedDeadlock(pos, era) })),
);
const deadlockHolds = forced.every(
  ({ r }) => r.landedEmpty === 0 && r.gotStuck === 0 && r.frees > 0,
);

/**
 * And the last resort. With NOTHING left anywhere the game cannot invent a roster, so it
 * has to say so rather than hand back a null franchise. This is the one case that is
 * supposed to be unreachable in a real run, which is exactly why it gets asserted.
 */
useGame.getState().abandonRun();
useGame.getState().startRun({ position: 'RB', hardMode: true, era: 'alltime', seed: 'NOBODY-LEFT' });
useGame.setState({ usedPlayerIds: ROSTERS.alltime.filter((p) => p.position === 'RB').map((p) => p.id) });
useGame.getState().spin();
const everythingGone = useGame.getState();
const failsLoudly = everythingGone.phase === 'stuck' && Boolean(everythingGone.lastEventMessage);

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
    const pool = getPool(g.position, g.currentTeamId!, g.era).filter((p) => !g.usedPlayerIds.includes(p.id));
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
console.log(`  ${repeatedRuns} of ${fuzzed} runs landed on a franchise more than once, and ${freeRespins} spins came back free`);
console.log(`forced deadlock survived: ${deadlockHolds ? 'PASS' : 'FAIL'}`);
for (const { pos, r } of forced) {
  console.log(
    `  ${pos}: only ${r.survivor} has anybody left, ${r.frees}/300 spins came back free, ` +
    `${r.landedEmpty} landed on an empty roster, ${r.rerollsSpent} cost a reroll`,
  );
}
console.log(`empty league fails loudly: ${failsLoudly ? 'PASS' : 'FAIL'}`);
console.log(`SB roll idempotent:     ${idempotent ? 'PASS' : 'FAIL — refreshing re-rolls the ring'}`);
console.log(`SB coin shared by seed: ${sameCoin ? 'PASS' : 'FAIL'} (roll ${good.superBowl.roll.toFixed(4)})`);
console.log(`  best build ${good.overall} OVR, ${(good.superBowl.odds * 100).toFixed(0)}% -> ${good.superBowl.won ? 'RING' : 'no ring'}`);
console.log(`  worst build ${bad.overall} OVR, ${(bad.superBowl.odds * 100).toFixed(0)}% -> ${bad.superBowl.won ? 'RING' : 'no ring'}`);
console.log(`better build, better odds: ${betterBuildBetterOdds ? 'PASS' : 'FAIL'}`);
console.log(`QUIT protects a late run: ${quitThresholdHolds ? 'PASS' : 'FAIL'} (immediate at 4 slots, asks at 5)`);

process.exit(
  a.ok && hard.ok && deterministic && stranded === 0 && deadlockHolds && failsLoudly &&
  idempotent && sameCoin && betterBuildBetterOdds && quitThresholdHolds ? 0 : 1,
);
