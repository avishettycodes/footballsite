import { ATTRIBUTE_SETS } from '../data';
import type { AttributeKey, Position, Team } from '../data';
import { STAT_LABELS, commas } from './career';
import type { CareerStats, DraftSlot, Stint } from './career';
import { RECORD_YARDS, superBowlOdds } from './scoring';
import type { CareerResult } from './scoring';

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
  if (odds >= 0.4) return 'It came down to a coin he did not call. That is all it ever is.';
  if (odds >= 0.18) return 'He had his chances. None of them fell his way.';
  return 'He was never really in it.';
}

/**
 * AN EMPTY TROPHY CASE IS NOT THE SAME STORY EVERY TIME, and this is the second place on
 * the report caught blaming a player for what the dice did.
 *
 * It used to branch on elite traits alone, so a man who rated 86, started for four years
 * and ran for 3,269 yards was told that somebody has to play the other games. He was a
 * real NFL starter. What he was not was a Pro Bowler, and those are different sentences.
 *
 * The short career case matters more again. A player whose years were taken off him has
 * an empty case because he ran out of time rather than because he was not good enough,
 * and telling him otherwise is exactly the thing that was fixed one screen down on the
 * record. Same bug, same fix, same reason it is worth a check.
 */
export function emptyCaseLine(overall: number, eliteCount: number, run: RunShape): string {
  if (eliteCount >= 3) {
    return `${eliteCount} traits at the very top of the league and an empty case. This one was a robbery.`;
  }
  if (overall >= 84 && run.seasons < run.expected * 0.75) {
    return run.cutShort
      ? 'He was on his way and the league took the years back. There was never time to win anything.'
      : 'Good enough to win something, and gone before he could.';
  }
  if (eliteCount >= 1) return 'A real weapon in there and nothing to show for it.';
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
  if (a.superBowl) return 'He got his ring out of it, whatever else the voters thought.';
  if (a.record) return 'He owns a record, which is the kind of thing they read out at funerals.';
  if (a.allPro) return 'First team All-Pro, and that was as high as it went.';
  if (a.proBowl) return 'He made a Pro Bowl. Nobody is naming a street after him.';
  return 'He retired with an empty trophy case.';
}
