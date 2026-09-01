import { ATTRIBUTE_SETS, TEAMS_BY_ID } from '../data';
import type { AttributeKey, Position, Team } from '../data';
import type { CareerResult } from './scoring';

/**
 * THE CAREER SUMMARY. Two or three sentences at the top of the report.
 *
 * A tester said the results screen opens on a rating when it should open on a story:
 * who drafted him, how long he lasted, where he turned up and what he actually won.
 *
 * Every one of those is DERIVED from the run that already happened. Nothing new is
 * rolled, nothing new is stored, and the same build always tells the same story. That
 * matters more than it sounds: a seed link promises two people the identical run, so a
 * narrative with any randomness of its own would quietly break that promise. It also
 * means this is a line of flavour rather than a draft phase, which is what the tester
 * who asked for it explicitly did not want.
 *
 * The mapping:
 *   drafted by   -> the franchise you took his FIRST attribute from
 *   seasons      -> durability, because that is already what durability means
 *   uniforms     -> every franchise you stole from
 *   what he won  -> the accolades already on the frozen career
 */

type SlotLike = { value: number; teamId: string };
type Slots = Partial<Record<AttributeKey, SlotLike>>;

export const MIN_SEASONS = 4;
export const MAX_SEASONS = 18;

/**
 * Career length off durability, on the same 40 to 99 span the ratings actually occupy.
 *
 * The fallback matters. Durability is the attribute most likely to be cut from a
 * position, and a summary that says "he played 4 seasons" for a 97 overall because a
 * slot no longer exists would be worse than no summary at all. With no durability in
 * the build the overall stands in, which reads sensibly: good players last longer.
 */
export function seasonsPlayed(durability: number | undefined, overall: number): number {
  const basis = typeof durability === 'number' ? durability : overall;
  const t = (basis - 40) / 59;
  const seasons = Math.round(MIN_SEASONS + t * (MAX_SEASONS - MIN_SEASONS));
  return Math.max(MIN_SEASONS, Math.min(MAX_SEASONS, seasons));
}

/** The franchise the first stolen attribute came from. */
export function draftedBy(position: Position, pickOrder: AttributeKey[], slots: Slots): Team | null {
  const order = pickOrder.length ? pickOrder : ATTRIBUTE_SETS[position];
  for (const key of order) {
    const slot = slots[key];
    if (slot) return TEAMS_BY_ID[slot.teamId] ?? null;
  }
  return null;
}

/** Every franchise he was built out of, in the order you raided them. */
export function franchisesUsed(position: Position, pickOrder: AttributeKey[], slots: Slots): Team[] {
  const order = pickOrder.length ? pickOrder : ATTRIBUTE_SETS[position];
  const seen = new Set<string>();
  const teams: Team[] = [];
  for (const key of order) {
    const slot = slots[key];
    if (!slot || seen.has(slot.teamId)) continue;
    seen.add(slot.teamId);
    const team = TEAMS_BY_ID[slot.teamId];
    if (team) teams.push(team);
  }
  return teams;
}

export function draftLine(team: Team | null): string {
  if (!team) return 'Nobody can agree on who drafted him.';
  return `The ${team.city} ${team.name} drafted him.`;
}

export function tenureLine(seasons: number, teams: Team[], drafted: Team | null): string {
  if (teams.length <= 1) {
    const home = drafted?.city ?? teams[0]?.city;
    return home
      ? `He gave them ${seasons} seasons and never wore anything but ${home}.`
      : `He lasted ${seasons} seasons.`;
  }
  const long = seasons >= 14 ? 'He hung around for' : seasons <= 6 ? 'He was gone in' : 'He lasted';
  return `${long} ${seasons} seasons and wore ${teams.length} different uniforms doing it.`;
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
