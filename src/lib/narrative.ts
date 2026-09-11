import { ATTRIBUTE_LABELS, ATTRIBUTE_SETS } from '../data';
import type { AttributeKey, Position, Team } from '../data';
import { STAT_LABELS, commas } from './career';
import type { CareerPath, CareerStats, DraftSlot, Stint } from './career';
import { GATES, RECORD_YARDS, superBowlOdds } from './scoring';
import type { AccoladeId, CareerResult } from './scoring';

/**
 * THE WORDS. Every sentence on the career report comes out of this file whole.
 *
 * A tester said the results screen opens on a rating when it should open on a story:
 * who took him, how long he lasted, where he turned up, what he put up and what he
 * actually won. It now does, in that order.
 *
 * Nothing in here rolls anything. The story is assembled from a career that has already
 * happened, and every number in it is a pure function of the seed, which is what lets a
 * shared `?seed=` link promise two people the same player rather than the same wheel.
 *
 * The sentences live here rather than in the JSX because a sentence assembled out of
 * fragments in a component is a sentence in two places, and the voice checker would then
 * be reading the wrong half of it.
 */

type SlotLike = { value: number; teamId: string };
type Slots = Partial<Record<AttributeKey, SlotLike>>;

/** Every franchise he was built out of, in the order you raided them. */
export function franchisesRaided(position: Position, pickOrder: AttributeKey[], slots: Slots): string[] {
  const order = pickOrder.length ? pickOrder : ATTRIBUTE_SETS[position];
  const seen: string[] = [];
  for (const key of order) {
    const slot = slots[key];
    if (slot && !seen.includes(slot.teamId)) seen.push(slot.teamId);
  }
  return seen;
}

const ROUND_WORDS = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'];

/** 1st, 2nd, 3rd, 4th. Broadcast always says the pick this way and never says pick 7. */
export function ordinal(n: number): string {
  const rest = n % 100;
  if (rest >= 11 && rest <= 13) return `${n}th`;
  return `${n}${['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
}

/**
 * The badge above the report, short enough to sit on one line of a phone.
 *
 * Uppercased here rather than in CSS, because the ordinal suffix is the only lowercase
 * thing in a line of capitals and it read as a typo sitting inside the badge.
 */
export function draftBadge(draft: DraftSlot): string {
  if (draft.undrafted) return 'UNDRAFTED';
  return `RD ${draft.round} · PICK ${draft.pick} · ${ordinal(draft.overallPick).toUpperCase()} OVERALL`;
}

export function draftLine(
  draft: DraftSlot,
  team: Team | null,
  story: CareerPath['draftStory'] = null,
): string {
  const who = team ? `${team.city} ${team.name}` : 'Somebody';
  let line: string;
  if (draft.undrafted) {
    line = `Nobody drafted him. ${who} signed him for nothing and found out later.`;
  } else if (draft.overallPick === 1) {
    line = `${who} took him first overall.`;
  } else if (draft.round === 1) {
    line = `${who} spent the ${ordinal(draft.pick)} pick of the first round on him.`;
  } else {
    line = `${who} got him in the ${ROUND_WORDS[draft.round]} round, ${ordinal(draft.overallPick)} overall.`;
  }

  if (story === 'camp-injury') {
    return `${line} Their starter went down in camp, and the depth chart changed overnight.`;
  }
  if (story === 'succession-plan') {
    return `${line} The room looked settled, but this was the succession plan from day one.`;
  }
  return line;
}

/**
 * How long it lasted, and whether it ended or was ended.
 *
 * The number of uniforms is a real number now rather than however many franchises you
 * happened to spin. Nobody plays for seven teams, so the report no longer says he did.
 */
export function tenureLine(seasons: number, stints: Stint[], cutShort: boolean): string {
  const years = `${seasons} season${seasons === 1 ? '' : 's'}`;

  if (cutShort) {
    const home = stints[0]?.team.city;
    return home
      ? `It was over after ${years}, which is not how anybody in ${home} saw it going.`
      : `It was over after ${years}, well before anybody expected it to be.`;
  }

  if (stints.length <= 1) {
    const home = stints[0]?.team.city;
    return home
      ? `He gave ${home} ${years} and never wore anything else.`
      : `He lasted ${years}.`;
  }

  const opener = seasons >= 14 ? 'He hung around for' : seasons <= 6 ? 'He was gone in' : 'He lasted';
  return `${opener} ${years} and wore ${stints.length} different uniforms doing it.`;
}

/**
 * The line people screenshot. One sentence of counting numbers, nothing else in it.
 *
 * IT USED TO LEAVE A WHOLE PICK OUT. A back who spent one of his six spins on catching
 * finished with 703 receptions and a sentence saying he ran for some yards and scored
 * some touchdowns, so the report read as though he never caught anything. Quarterbacks
 * had the same hole around mobility, where a 99 produced nothing you could point at. If
 * a slot on the build sheet cannot change a number on this screen, it is not a decision.
 */
export function productionLine(position: Position, stats: CareerStats): string {
  const labels = STAT_LABELS[position];
  const yards = `${commas(stats.yards)} ${labels.yards.toLowerCase()}`;

  if (position === 'QB') {
    const ran = stats.secondaryYards >= 1500
      ? ` He ran for another ${commas(stats.secondaryYards)}.`
      : '';
    return `He finished with ${yards} and threw ${commas(stats.touchdowns)} touchdowns.${ran}`;
  }
  if (position === 'RB') {
    return `He finished with ${yards} on ${commas(stats.volume)} carries, caught ${commas(stats.secondary)} passes for another ${commas(stats.secondaryYards)} and scored ${commas(stats.touchdowns)} times.`;
  }
  return `He finished with ${commas(stats.volume)} catches for ${commas(stats.yards)} yards and ${commas(stats.touchdowns)} touchdowns.`;
}

/** His best year, which is the one anybody arguing about him reaches for first. */
export function bestSeasonLine(position: Position, stats: CareerStats): string {
  const best = stats.best;
  const where = `In year ${best.season}`;
  if (position === 'QB') {
    return `${where} he threw for ${commas(best.yards)} and ${best.touchdowns} touchdowns.`;
  }
  if (position === 'RB') {
    return `${where} he ran for ${commas(best.yards)} and scored ${best.touchdowns} times.`;
  }
  return `${where} he caught ${best.volume} balls for ${commas(best.yards)} and ${best.touchdowns} touchdowns.`;
}

/** How the career actually went. The record miss is the only line that needs it. */
export type RunShape = { seasons: number; expected: number; cutShort: boolean };

/**
 * WHY HE DID NOT GET THE RECORD, and the rate and the years are two different stories.
 *
 * This lives here rather than in the component with the other near-miss lines, because
 * it is the one of them that can be WRONG rather than merely blunt, so it is the one
 * worth being able to assert on. `npm run verify:career` drives it.
 *
 * The gate is a career total now, which puts it downstream of two rolls rather than one
 * attribute you picked: how long he lasted, then what he did per season. That makes
 * losing it more dramatic and it also makes it much easier to describe wrongly. A
 * quarterback who averaged 4,095 yards a year for seven seasons and then blew a knee was
 * being told he was never producing at the rate the record asks for. He was producing at
 * almost exactly that rate. What he did not get was the fourteen years his rating said he
 * had coming, and telling a player he was not good enough when the game is the thing that
 * took the years off him reads as the game cheating rather than as a story.
 *
 * So his pace is projected over the career his rating expected, and that decides which
 * sentence he gets. It is the same arithmetic the stat block already shows him, so
 * nothing here is inventing a consolation he did not earn.
 */
export function recordMissLine(position: Position, careerYards: number, run: RunShape): string {
  const gate = RECORD_YARDS[position];
  const short = gate - careerYards;
  if (short <= gate * 0.05) return 'He finished just short of it.';

  const pace = careerYards / Math.max(1, run.seasons);
  const projected = pace * run.expected;
  if (projected >= gate) {
    return run.cutShort
      ? 'He was on pace for it until his career ended.'
      : 'The rate was there. The seasons were not.';
  }
  if (projected >= gate * 0.85) {
    return 'A full career at that rate and he would have been close.';
  }

  if (short <= gate * 0.25 && pace > 0) {
    const seasonsNeeded = Math.ceil(short / pace);
    return seasonsNeeded === 1
      ? 'One more season at that pace and he would have had it.'
      : `${seasonsNeeded} more seasons at that pace and he would have had it.`;
  }
  return 'He never produced at the rate that record needs.';
}

/**
 * WHY HE HAS NO RING, and it has to respect the odds he actually had.
 *
 * This was two branches on a rating, and the lower one told a player with a 49% shot at
 * a Super Bowl that he was never really in it. He was a coin flip away from it. Reading
 * the odds instead of the rating costs nothing and stops the report calling a near miss
 * a non event.
 */
export function ringMissLine(overall: number): string {
  const odds = superBowlOdds(overall);
  if (overall >= 92) return 'A career that good and no ring. That is the one that stings.';
  // This branch used to say the ring came down to a coin he did not call, which is a
  // sentence about how the game works rather than about his career, and the first person
  // to read it asked what it meant. He was about as likely to win one as not. Say that.
  if (odds >= 0.4) return 'He was as likely to win one as not, and it never happened.';
  if (odds >= 0.18) return 'He had his chances. None of them fell his way.';
  return 'He was never really in it.';
}

/**
 * AN EMPTY TROPHY CASE IS NOT THE SAME STORY EVERY TIME, and this is the second place on
 * the report caught blaming a player for what the dice did.
 *
 * It used to branch on elite traits alone, so a man who rated 86, started for four years
 * and ran for 3,269 yards was told that somebody has to play the other games. He was a
 * real NFL starter. What he was not was an All-Pro, and those are different sentences.
 *
 * IT COUNTS SPIKES NOW RATHER THAN TRAITS AT 95. The old count called almost every
 * finished player elite, so the robbery line fired on builds that had simply been
 * ordinary, which is the same complaint one paragraph up wearing the other hat.
 *
 * The short career case matters more again. A player whose years were taken off him has
 * an empty case because he ran out of time rather than because he was not good enough,
 * and telling him otherwise is exactly the thing that was fixed one screen down on the
 * record. Same bug, same fix, same reason it is worth a check.
 */
export function emptyCaseLine(overall: number, spikeCount: number, run: RunShape): string {
  if (spikeCount >= 3) {
    return `${spikeCount} traits at the very top of the league and nothing to show for it.`;
  }
  if (overall >= 84 && run.seasons < run.expected * 0.75) {
    return run.cutShort
      ? 'His career ended before he had the time to win anything.'
      : 'He was good enough to win something and did not last long enough.';
  }
  if (spikeCount >= 1) return 'One elite trait in there and nothing to show for it.';
  if (overall >= 84) return 'A real NFL starter who never won anything. Most of them never do.';
  return 'The trophy case is empty.';
}

/**
 * ONE sentence, and only ever the capstone. The trophy case sits directly underneath
 * and lists every award he won, so a summary that reads them all out first makes the
 * reader scroll past the same information twice.
 */
export function honorsLine(career: CareerResult): string {
  const a = career.accolades;
  if (a.hof) return 'He made the Hall of Fame.';
  if (a.mvp && a.superBowl) return 'He won an MVP and a ring and the Hall of Fame still said no.';
  if (a.mvp) return 'He won an MVP and never won a ring.';
  if (a.superBowl) return 'He won a Super Bowl.';
  if (a.record) return 'He retired holding a record.';
  if (a.allPro) return 'He made first team All-Pro and that was as high as it went.';
  return 'He retired with an empty trophy case.';
}

/**
 * WHY HE DID NOT WIN EACH ONE, which is the list under the trophy case.
 *
 * These lived in the results component until the day two of them came out identical on
 * screen. They are sentences a player reads, so they belong here with the rest of the
 * report's words, and being here means `npm run verify:career` can drive every branch of
 * them and assert no two awards ever say the same thing.
 */
/**
 * How close he came, in words, never in numbers.
 *
 * This screen used to print the requirement straight off the accolade definition, so
 * "WHAT HE MISSED OUT ON" read "Offensive Player of the Year: Overall 94+ with 4 traits
 * at 95 or better". That turns a game into a spec sheet. Nobody tells you what 17-0 or
 * 82-0 needs either, and finding out by playing is the whole appeal.
 *
 * The gates are still READ here to work out how near he was. They are simply never
 * shown. The requirement strings on the definitions stay where they are, unused by the
 * UI, because they are what the calibration script reports against.
 *
 * EACH AWARD GETS ITS OWN WORDS, and it is worth saying why that is not decoration. One
 * shared ladder served three awards, and All-Pro, OPOY and MVP are usually missed by a
 * similar margin, so the list read "Offensive Player of the Year: close enough to argue
 * about at the bar" and then "MVP: close enough to argue about at the bar" directly
 * underneath. Two awards, one sentence, printed twice. A reader takes that as a bug in
 * the game rather than as a coincidence of thresholds, and they are more or less right.
 *
 * THEY ARE ALSO FLAT NOW. The first rewrite fixed the repetition and kept the jokes, and
 * the whole block came back circled a second time. Arguing about it at the bar and
 * having nothing on the mantelpiece are somebody being funny at a reader who wanted to
 * know why he did not win. Each line says how near he came and stops. The wording still
 * has to differ per award, which is what the check in verify:career enforces, but that
 * difference now comes from what each award was asking for rather than from a punchline.
 */
type Nearly = readonly [hair: string, close: string, distant: string, never: string];

const NEARLY: Record<'allPro' | 'opoy' | 'mvp', Nearly> = {
  allPro: [
    'He came up a hair short.',
    'He came up short.',
    'He was not one of the best at his position.',
    'He was never close to this one.',
  ],
  opoy: [
    'Somebody else edged him out.',
    'Somebody else had the better season.',
    'He had a good year in a league with better ones.',
    'Nobody put his name forward.',
  ],
  mvp: [
    'He finished second.',
    'He was in the argument and lost it.',
    'He was not the best player in the league.',
    'He was never in the running.',
  ],
};

function nearness(award: keyof typeof NEARLY, gap: number): string {
  const lines = NEARLY[award];
  if (gap <= 1) return lines[0];
  if (gap <= 3) return lines[1];
  if (gap <= 7) return lines[2];
  return lines[3];
}

export function missedBecause(
  id: AccoladeId,
  position: Position,
  career: CareerResult,
  /** How the career actually went, which the record needs and nothing else does. */
  run: RunShape,
): string {
  switch (id) {
    /*
      The two awards with a floor can be missed two different ways, and saying which is
      most of the value of this line. A build that grades 95 and carries an 88 did not
      come up short on rating, it came up short on one number, and telling him he was
      close would be answering a question he did not ask.
    */
    case 'allPro':
      return career.overall >= GATES.allPro
        // The label goes in as a bare object, with no article in front of it and no verb
        // after it. The first draft read "a man with an ${label} that low", which produced
        // "an juke", and the fix for that produced "whose reads is that low". No single
        // article or verb is right across a list holding arm strength, juke and reads, so
        // the sentence stopped asking the label to agree with anything.
        ? `His rating was high enough. The ${ATTRIBUTE_LABELS[career.breakdown.weakest.attribute].toLowerCase()} was not.`
        : nearness('allPro', GATES.allPro - career.overall);
    case 'mvp':
      return career.overall >= GATES.mvp
        ? 'His rating was high enough. The best player in the league does not carry a number that low.'
        : nearness('mvp', GATES.mvp - career.overall);
    case 'opoy':
      return career.overall >= GATES.opoy
        ? 'His rating was high enough. He did not have enough elite numbers.'
        : nearness('opoy', GATES.opoy - career.overall);
    // The only one of these that can be WRONG rather than merely blunt, which is why it
    // is a function of the career rather than of the rating.
    case 'record':
      return recordMissLine(position, career.careerYards, run);
    case 'superBowl':
      // Not "you cannot build for this one", which was both a shrug and untrue. A better
      // player really does get better odds here. See superBowlOdds in scoring.ts.
      return 'Better players get better odds at this one and his did not come in.';
    case 'hof':
      return hallMissLine(career.hofPoints);
  }
}

/**
 * WHY THE HALL SAID NO, WHICH IS NOT THE SAME AS SAYING HE NEVER WON ANYTHING.
 *
 * The old line was "He did not win enough to get in", and it was printed under the
 * trophy case of a player who had just made first team All-Pro and been named the best
 * offensive player in the league. Read against those two trophies sitting an inch above
 * it, it does not say he fell short. It says the case is empty, which the case itself
 * plainly contradicts, and a reader takes a screen arguing with itself as a bug.
 *
 * So it counts. The Hall wants four of the five and he has however many he has, and the
 * line names that number before it says it was not enough. A man told "two is not
 * enough" has been told what he won, what the standard is and what is missing, in the
 * same breath, and none of it reads as an insult.
 */
export function hallMissLine(hofPoints: number): string {
  switch (Math.max(0, Math.min(GATES.hofPoints - 1, hofPoints))) {
    case 0:
      return 'He had nothing on the shelf to make the case with.';
    case 1:
      return 'One trophy. They are looking for a career of them.';
    case 2:
      return 'Two is not enough. They want more than that.';
    default:
      return 'Three of them, and they wanted one more.';
  }
}
