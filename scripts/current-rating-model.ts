import { ATTRIBUTE_SETS } from '../src/data/types';
import type { AttributeKey, Player, Position } from '../src/data/types';

/**
 * Current-mode ratings model, frozen for the 2026 Week 1 refresh.
 *
 * Madden supplies the baseline ordering. Composite traits average the skills named below
 * and are translated onto the game's scale with 50 held as the neutral point. Direct
 * traits retain their Madden number below 99. At the very top, a small explicit registry
 * names the one player judged best in the league at each trait and only that player gets
 * the 99.
 *
 * That last step is deliberately done here instead of in the scoring engine. A card that
 * helps build a 99 must show 99, and the same weighted/weak-link calculation must grade
 * Current and All-Time. The registry also guarantees seven different leaders at every
 * position, so a real 99 is possible without letting one card fill two slots. The choices
 * stay auditable below, and `verify:99` proves the wheel makes assembling all seven
 * genuinely rare.
 */

export type MaddenSource = {
  id: number;
  name: string;
  team: string | null;
  position: string;
  overall: number;
  height: number;
  weight: number;
  stats: Record<string, number>;
};

export type CurrentRatingSource = {
  id: string;
  name: string;
  teamId: string;
  position: Position;
  madden: MaddenSource;
};

/**
 * A 99 means BEST IN THE LEAGUE, not merely part of an elite band. These are deliberately
 * one player per trait and seven different players per position. Madden-derived values
 * establish the shortlist; the final choice resolves collisions where the same superstar
 * leads several columns and keeps the game's seven-card promise physically playable.
 */
export const CURRENT_99_LEADERS: Record<Position, Partial<Record<AttributeKey, string>>> = {
  QB: {
    armStrength: 'now-chi-caleb',
    accuracy: 'now-cin-burrow',
    deepBall: 'now-buf-allen',
    pocketPresence: 'now-bal-lamar',
    mobility: 'now-kc-fields',
    processing: 'now-lar-stafford',
    clutch: 'now-kc-mahomes',
  },
  RB: {
    speed: 'now-det-gibbs',
    burst: 'now-jax-tuten',
    juke: 'now-atl-bijan',
    power: 'now-gb-jacobs',
    vision: 'now-ind-jtaylor',
    hands: 'now-sf-cmc',
    size: 'now-bal-henry',
  },
  WR: {
    speed: 'now-kc-worthy',
    hands: 'now-det-brown',
    routeRunning: 'now-sea-smithnjigba',
    release: 'now-cin-chase',
    contestedCatch: 'now-lar-nacua',
    yac: 'now-dal-lamb',
    size: 'now-sf-evans',
  },
  TE: {
    hands: 'now-ari-mcbride',
    blocking: 'now-min-oliver',
    speed: 'now-nyj-sadiq',
    routeRunning: 'now-lv-bowers',
    yac: 'now-cle-fannin',
    toughness: 'now-sf-kittle',
    size: 'now-pit-washington',
  },
};

const mean = (...values: number[]) =>
  Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);

const stat = (player: MaddenSource, key: string) => {
  const value = player.stats[key];
  if (typeof value !== 'number') throw new Error(`${player.name} is missing Madden stat ${key}`);
  return value;
};

const frame = (player: MaddenSource, position: Exclude<Position, 'QB'>) => {
  let weightScore: number;
  let heightScore: number;

  if (position === 'RB') {
    weightScore = 45 + ((player.weight - 170) * 54) / 80;
    heightScore = 55 + ((player.height - 65) * 44) / 9;
  } else if (position === 'WR') {
    weightScore = 45 + ((player.weight - 165) * 54) / 70;
    heightScore = 45 + ((player.height - 66) * 54) / 12;
  } else {
    weightScore = 55 + ((player.weight - 225) * 44) / 60;
    heightScore = 60 + ((player.height - 72) * 39) / 8;
  }

  return Math.max(0, Math.min(99, Math.round(
    0.45 * weightScore + 0.35 * heightScore + 0.2 * stat(player, 'strength'),
  )));
};

export function rawCurrentRatings(player: MaddenSource, position: Position): Record<AttributeKey, number> {
  if (position === 'QB') {
    return {
      armStrength: stat(player, 'throwPower'),
      accuracy: mean(
        stat(player, 'throwAccuracyShort'),
        stat(player, 'throwAccuracyMid'),
      ),
      deepBall: mean(stat(player, 'throwAccuracyDeep'), stat(player, 'throwPower')),
      pocketPresence: mean(
        stat(player, 'throwUnderPressure'),
        stat(player, 'breakSack'),
      ),
      mobility: mean(
        stat(player, 'speed'),
        stat(player, 'acceleration'),
        stat(player, 'agility'),
        stat(player, 'changeOfDirection'),
      ),
      processing: mean(stat(player, 'awareness'), stat(player, 'playAction')),
      clutch: mean(
        stat(player, 'awareness'),
        stat(player, 'throwUnderPressure'),
        stat(player, 'toughness'),
      ),
    } as Record<AttributeKey, number>;
  }

  if (position === 'RB') {
    return {
      speed: stat(player, 'speed'),
      burst: stat(player, 'acceleration'),
      juke: mean(
        stat(player, 'jukeMove'),
        stat(player, 'spinMove'),
        stat(player, 'changeOfDirection'),
        stat(player, 'agility'),
      ),
      power: mean(
        stat(player, 'trucking'),
        stat(player, 'stiffArm'),
        stat(player, 'breakTackle'),
        stat(player, 'strength'),
      ),
      vision: mean(stat(player, 'bCVision'), stat(player, 'awareness')),
      hands: stat(player, 'catching'),
      size: frame(player, position),
    } as Record<AttributeKey, number>;
  }

  const receiving = {
    hands: stat(player, 'catching'),
    routeRunning: mean(
      stat(player, 'shortRouteRunning'),
      stat(player, 'mediumRouteRunning'),
      stat(player, 'deepRouteRunning'),
    ),
    yac: mean(
      stat(player, 'changeOfDirection'),
      stat(player, 'agility'),
      stat(player, 'breakTackle'),
      stat(player, 'jukeMove'),
      stat(player, 'spinMove'),
      stat(player, 'bCVision'),
    ),
  };

  if (position === 'WR') {
    return {
      speed: stat(player, 'speed'),
      ...receiving,
      release: stat(player, 'release'),
      contestedCatch: mean(
        stat(player, 'catchInTraffic'),
        stat(player, 'spectacularCatch'),
        stat(player, 'jumping'),
      ),
      size: frame(player, position),
    } as Record<AttributeKey, number>;
  }

  return {
    hands: receiving.hands,
    blocking: mean(
      stat(player, 'runBlock'),
      stat(player, 'passBlock'),
      stat(player, 'impactBlocking'),
      stat(player, 'leadBlock'),
    ),
    speed: stat(player, 'speed'),
    routeRunning: receiving.routeRunning,
    yac: receiving.yac,
    toughness: mean(
      stat(player, 'toughness'),
      stat(player, 'strength'),
      stat(player, 'breakTackle'),
    ),
    size: frame(player, position),
  } as Record<AttributeKey, number>;
}

export function calculateCurrentRatings(sources: CurrentRatingSource[]) {
  const raw = new Map(sources.map((source) => [
    source.id,
    rawCurrentRatings(source.madden, source.position),
  ]));
  const maxima = new Map<string, number>();

  for (const source of sources) {
    for (const key of ATTRIBUTE_SETS[source.position]) {
      maxima.set(`${source.position}:${key}`, Math.max(
        maxima.get(`${source.position}:${key}`) ?? 0,
        raw.get(source.id)?.[key] ?? 0,
      ));
    }
  }

  const scaled = new Map(sources.map((source) => {
    const attributes: Player['attributes'] = {};
    for (const key of ATTRIBUTE_SETS[source.position]) {
      const value = raw.get(source.id)?.[key] ?? 0;
      const maximum = maxima.get(`${source.position}:${key}`) ?? 99;
      const direct = (
        (source.position === 'QB' && key === 'armStrength') ||
        // RB hands is a position-relative game category, not a claim that Madden gives
        // McCaffrey literal 99 Catching. Direct physical fields stay exact below the
        // single league leader promoted to the game's displayed 99.
        (source.position === 'RB' && (key === 'speed' || key === 'burst')) ||
        (source.position === 'WR' && (key === 'speed' || key === 'release' || key === 'hands')) ||
        (source.position === 'TE' && (key === 'speed' || key === 'hands'))
      );
      attributes[key] = direct || maximum <= 50
        ? value
        : Math.max(0, Math.min(99, Math.round(50 + ((value - 50) * 49) / (maximum - 50))));
    }
    return [source.id, attributes];
  }));

  return new Map(sources.map((source) => {
    const attributes = { ...scaled.get(source.id) } as Player['attributes'];
    for (const key of ATTRIBUTE_SETS[source.position]) {
      attributes[key] = CURRENT_99_LEADERS[source.position][key] === source.id
        ? 99
        : Math.min(98, attributes[key] ?? 0);
    }
    return [source.id, attributes];
  }));
}

export const REQUIRED_MADDEN_STATS: Record<Position, string[]> = {
  QB: [
    'acceleration', 'agility', 'awareness', 'breakSack', 'changeOfDirection',
    'playAction', 'speed', 'throwAccuracyDeep', 'throwAccuracyMid',
    'throwAccuracyShort', 'throwPower', 'throwUnderPressure', 'toughness',
  ],
  RB: [
    'acceleration', 'agility', 'awareness', 'bCVision', 'breakTackle',
    'catching', 'changeOfDirection', 'jukeMove', 'speed', 'spinMove', 'stiffArm',
    'strength', 'trucking',
  ],
  WR: [
    'agility', 'bCVision', 'breakTackle', 'catchInTraffic', 'catching',
    'changeOfDirection', 'deepRouteRunning', 'jukeMove', 'jumping',
    'mediumRouteRunning', 'release', 'shortRouteRunning', 'spectacularCatch',
    'speed', 'spinMove', 'strength',
  ],
  TE: [
    'agility', 'bCVision', 'breakTackle', 'catching',
    'changeOfDirection', 'deepRouteRunning', 'impactBlocking', 'jukeMove',
    'leadBlock', 'mediumRouteRunning', 'passBlock', 'runBlock',
    'shortRouteRunning', 'speed', 'spinMove', 'strength', 'toughness',
  ],
};
