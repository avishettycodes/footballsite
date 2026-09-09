/**
 * Who is at the top of each trait, and who is a star with nothing at the top.
 *
 * THIS IS A READING TOOL, NOT A CHECK. Nothing in here passes or fails, because the thing
 * it is looking for cannot be asserted: whether the five names under SPEED are the five
 * names a person would actually say. `npm run verify:data` already proves these pools are
 * spiky, uncorrelated and in range, and it proved all three while a receiver was filed at
 * tight end and five players on injured reserve were still in the file. A leaderboard is
 * how you catch the class of mistake a check cannot see.
 *
 * TWO PASSES, AND THE SECOND ONE IS THE USEFUL ONE.
 *
 * Forwards is the obvious question: print the top five at every trait and read the names.
 * A wrong name at the top of a list is easy to spot and easy to argue about, which is the
 * whole point.
 *
 * Backwards is the question that found the bug this file was written for. A player was
 * sitting on a very high card with no trait above 98 while a rookie at the same position
 * held two 99s, and the tell was not that any single number was wrong. It was that a
 * player everybody would name in the first breath had nothing he was best at. So the
 * second pass takes the highest rated cards in the league and asks which of them appear in
 * nobody's top five. Every name it prints is one of two things: a player rated too low, or
 * a player whose actual best quality has no slot on the card. Those want different fixes
 * and the tool cannot tell them apart, so it says so rather than guessing.
 *
 *   npm run leaders              current league, every position
 *   npm run leaders -- TE        one position
 *   npm run leaders -- alltime   the other league
 */
import { ATTRIBUTE_LABELS, ATTRIBUTE_SETS, ERAS, ROSTERS, getTeam, positionsWithData } from '../src/data';
import type { Era, Player } from '../src/data';
import { WEIGHTS } from '../src/lib/scoring';

const args = process.argv.slice(2).map((a) => a.toLowerCase());
const era: Era = (ERAS.find((e) => args.includes(e)) ?? 'current') as Era;
const asked = args.map((a) => a.toUpperCase()).filter((a) => a in ATTRIBUTE_SETS);
const positions = positionsWithData(era).filter((p) => !asked.length || asked.includes(p));

/** How many names deep each trait list runs. */
const TOP = 5;
/**
 * How far into the position the star check reaches.
 *
 * The weighted mean is used rather than the game's overall, on purpose. Overall blends in
 * the weak link anchor, which is exactly the thing a spiky pool is built to punish, so a
 * genuine star with one deliberate hole in him drops out of the list and takes the
 * question with him. The mean asks the simpler thing this pass wants: how good is this
 * card, ignoring where it is soft.
 */
const STARS = 12;

const mean = (p: Player) => {
  const keys = ATTRIBUTE_SETS[p.position];
  const weights = WEIGHTS[p.position];
  let num = 0;
  let den = 0;
  for (const key of keys) {
    const w = weights[key] ?? 1;
    num += (p.attributes[key] ?? 0) * w;
    den += w;
  }
  return num / den;
};

const pad = (s: string, n: number) => s.padEnd(n);

for (const position of positions) {
  const pool = ROSTERS[era].filter((p) => p.position === position);
  console.log(`\n${'='.repeat(72)}`);
  console.log(`${era.toUpperCase()} ${position}  ${pool.length} cards`);

  /** Everybody who lands in somebody's top five, so the reverse pass can ask who did not. */
  const onABoard = new Set<string>();

  for (const key of ATTRIBUTE_SETS[position]) {
    const ranked = [...pool].sort(
      (a, b) => (b.attributes[key] ?? 0) - (a.attributes[key] ?? 0),
    );
    /*
      Ties at the cut are kept rather than sliced off. Six players on 99 speed is itself
      the finding, and a list that silently drops the sixth hides it.
    */
    const cut = ranked[TOP - 1]?.attributes[key] ?? 0;
    const leaders = ranked.filter((p) => (p.attributes[key] ?? 0) >= cut);
    for (const p of leaders) onABoard.add(p.id);
    console.log(
      `\n  ${pad(ATTRIBUTE_LABELS[key], 16)}` +
      leaders
        .map((p) => `${p.attributes[key]} ${p.name} (${getTeam(p.teamId)?.abbr ?? '???'})`)
        .join('   '),
    );
  }

  const stars = [...pool].sort((a, b) => mean(b) - mean(a)).slice(0, STARS);
  console.log(`\n  the ${STARS} best cards in the league, by weighted mean:`);
  for (const p of stars) {
    const best = ATTRIBUTE_SETS[position].reduce(
      (hi, k) => ((p.attributes[k] ?? 0) > (p.attributes[hi] ?? 0) ? k : hi),
      ATTRIBUTE_SETS[position][0],
    );
    console.log(
      `    ${pad(p.name, 22)} ${mean(p).toFixed(1)}  best is ${ATTRIBUTE_LABELS[best]} ${p.attributes[best]}` +
      (onABoard.has(p.id) ? '' : '   <-- TOP FIVE IN NOTHING'),
    );
  }

  const invisible = stars.filter((p) => !onABoard.has(p.id));
  if (invisible.length) {
    console.log(
      `\n  ${invisible.length} of the top ${STARS} are top five in nothing: ` +
      `${invisible.map((p) => p.name).join(', ')}.`,
    );
    console.log(
      '  Each one is either rated too low or best at something this card has no slot for.',
    );
  } else {
    console.log(`\n  every one of the top ${STARS} is top five in something.`);
  }
}
