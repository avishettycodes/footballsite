/** The public board accepts real finished cards and rejects ratings invented by a client. */
import { ATTRIBUTE_SETS, ROSTERS } from '../src/data';
import type { AttributeKey } from '../src/data';
import type { LeaderboardSubmission } from '../src/lib/leaderboard';
import { cleanPlayerName, leaderboardScore, verifySubmission } from '../api/_leaderboard';

const position = 'RB' as const;
const era = 'alltime' as const;
const used = new Set<string>();
const slots: LeaderboardSubmission['slots'] = {};

for (const key of ATTRIBUTE_SETS[position]) {
  const player = ROSTERS[era].find((candidate) =>
    candidate.position === position && !used.has(candidate.id) && typeof candidate.attributes[key] === 'number',
  );
  if (!player) throw new Error(`No player for ${key}`);
  used.add(player.id);
  slots[key] = {
    attribute: key,
    value: player.attributes[key]!,
    playerId: player.id,
    playerName: player.name,
    teamId: player.teamId,
  };
}

const submission: LeaderboardSubmission = {
  id: 'test-run-GRIDIRON-7QX3',
  name: '  The   Bus  ',
  position,
  hardMode: false,
  era,
  seed: 'GRIDIRON-7QX3',
  slots,
};

const verified = verifySubmission(submission, 1234);
const acceptsRealBuild = verified.name === 'The Bus'
  && verified.submittedAt === 1234
  && Number.isInteger(verified.overall);

const fake = structuredClone(submission);
const first = ATTRIBUTE_SETS[position][0] as AttributeKey;
fake.slots[first]!.value++;
let rejectsFakeRating = false;
try {
  verifySubmission(fake);
} catch {
  rejectsFakeRating = true;
}

const hard = { ...verified, hardMode: true };
const scoreOrder = leaderboardScore({ ...verified, overall: verified.overall + 1 })
  > leaderboardScore({ ...hard, trophies: 6 });
const nameClean = cleanPlayerName(' A\u0000   Name ') === 'A Name';

console.log('\nGridironLab — leaderboard');
console.log(`  real build accepted: ${acceptsRealBuild ? 'PASS' : 'FAIL'}`);
console.log(`  fake rating rejected: ${rejectsFakeRating ? 'PASS' : 'FAIL'}`);
console.log(`  overall ranks first:  ${scoreOrder ? 'PASS' : 'FAIL'}`);
console.log(`  names cleaned:        ${nameClean ? 'PASS' : 'FAIL'}`);

process.exit(acceptsRealBuild && rejectsFakeRating && scoreOrder && nameClean ? 0 : 1);
