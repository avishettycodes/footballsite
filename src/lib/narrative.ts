import { ATTRIBUTE_SETS } from '../data';
import type { AttributeKey, Position, Team } from '../data';
import { STAT_LABELS, commas } from './career';
import type { CareerStats, DraftSlot, Stint } from './career';
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

/** The line people screenshot. One sentence of counting numbers, nothing else in it. */
export function productionLine(position: Position, stats: CareerStats): string {
  const labels = STAT_LABELS[position];
  const yards = `${commas(stats.yards)} ${labels.yards.toLowerCase()}`;

  if (position === 'QB') {
    return `He finished with ${yards} and threw ${commas(stats.touchdowns)} touchdowns.`;
  }
  if (position === 'RB') {
    return `He finished with ${yards} on ${commas(stats.volume)} carries and scored ${commas(stats.touchdowns)} times.`;
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
