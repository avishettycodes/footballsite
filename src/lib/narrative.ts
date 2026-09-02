import { ATTRIBUTE_LABELS, ATTRIBUTE_SETS } from '../data';
import type { AttributeKey, Position, Team } from '../data';
import { STAT_LABELS, commas } from './career';
import type { CareerStats, DraftSlot, Stint } from './career';
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

export function draftLine(draft: DraftSlot, team: Team | null): string {
  const who = team ? team.city : 'Somebody';
  if (draft.undrafted) {
    return `Nobody drafted him. ${who} signed him for nothing and found out later.`;
  }
  if (draft.overallPick === 1) return `${who} took him first overall.`;
  if (draft.round === 1) {
    return `${who} spent the ${ordinal(draft.pick)} pick of the first round on him.`;
  }
  return `${who} got him in the ${ROUND_WORDS[draft.round]} round, ${ordinal(draft.overallPick)} overall.`;
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
  if (short <= gate * 0.05) return 'He finished within touching distance of it.';

  const projected = (careerYards / Math.max(1, run.seasons)) * run.expected;
  if (projected >= gate) {
    return run.cutShort
      ? 'He was on pace for it right up until it ended. Nobody gets those years back.'
      : 'The rate was there. The seasons were not.';
  }
  if (projected >= gate * 0.85) {
    return 'A full career at that rate and he would have been in the argument.';
  }

  if (short <= gate * 0.25) return 'A couple more healthy years and it was his.';
  return 'He was never producing at the rate that record asks for.';
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
    return `${spikeCount} traits at the very top of the league and an empty case. This one was a robbery.`;
  }
  if (overall >= 84 && run.seasons < run.expected * 0.75) {
    return run.cutShort
      ? 'He was on his way and the league took the years back. There was never time to win anything.'
      : 'Good enough to win something, and gone before he could.';
  }
  if (spikeCount >= 1) return 'A real weapon in there and nothing to show for it.';
  if (overall >= 84) return 'A real NFL starter who never got a trophy for it. Most of them never do.';
  return 'The trophy case is empty. Somebody has to play the other games.';
}

/**
 * ONE sentence, and only ever the capstone. The trophy case sits directly underneath
 * and lists every award he won, so a summary that reads them all out first makes the
 * reader scroll past the same information twice.
 */
export function honorsLine(career: CareerResult): string {
  const a = career.accolades;
  if (a.hof) return 'They put him in Canton.';
  if (a.mvp && a.superBowl) return 'He won an MVP and a ring, and the Hall still said no.';
  if (a.mvp) return 'There is an MVP on the mantelpiece and no ring next to it.';
  // "Whatever else the voters thought" read as a shrug at an award nobody had mentioned,
  // on a line that is supposed to be the happy ending. The ring is the point of it.
  if (a.superBowl) return 'He has a ring, which is more than almost anybody gets.';
  if (a.record) return 'He owns a record, which is the kind of thing they read out at funerals.';
  if (a.allPro) return 'First team All-Pro, and that was as high as it went.';
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
 */
type Nearly = readonly [hair: string, close: string, distant: string, never: string];

const NEARLY: Record<'allPro' | 'opoy' | 'mvp', Nearly> = {
  allPro: [
    'He missed it by a hair.',
    'He was close, and close is not what the voters reward.',
    'A good player in a league that had three better ones at his spot.',
    'He was never in that conversation.',
  ],
  opoy: [
    'One more big afternoon and it was his.',
    'Somebody else had the season everybody ended up talking about.',
    'A fine year. Not the year of the year.',
    'Nobody outside his own building brought his name up.',
  ],
  mvp: [
    'He finished second, and second is nobody.',
    'He was in the argument until the last week of it.',
    'Very good is a long way from best in the league.',
    'That award was for other people.',
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
        ? `The rating was there. They kept coming back to the ${ATTRIBUTE_LABELS[career.breakdown.weakest.attribute].toLowerCase()}.`
        : nearness('allPro', GATES.allPro - career.overall);
    case 'mvp':
      return career.overall >= GATES.mvp
        ? 'The rating was there and the hole in him was not something the best player alive gets to have.'
        : nearness('mvp', GATES.mvp - career.overall);
    case 'opoy':
      return career.overall >= GATES.opoy
        ? 'The rating was there. They wanted more of him at the very top of the league.'
        : nearness('opoy', GATES.opoy - career.overall);
    // The only one of these that can be WRONG rather than merely blunt, which is why it
    // is a function of the career rather than of the rating.
    case 'record':
      return recordMissLine(position, career.careerYards, run);
    case 'superBowl':
      return 'A ring is the one thing you cannot build for him.';
    case 'hof':
      return 'Not enough on the mantelpiece to get him in.';
  }
}
