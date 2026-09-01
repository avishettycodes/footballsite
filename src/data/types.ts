/**
 * GridironLab data layer.
 *
 * Every rating in this app is hand-authored, subjective, and made up for fun.
 * No licensed dataset, no scraped source, no API. If you disagree with a number,
 * you are probably right and we do not care.
 */

export type Position = 'QB' | 'RB' | 'WR' | 'TE';

/** Offensive line positions get their own simplified set (Full Eleven mode, later). */
export type OLPosition = 'OL';

export type AttributeKey =
  // QB
  | 'armStrength' | 'accuracy' | 'deepBall' | 'pocketPresence' | 'mobility'
  | 'processing' | 'clutch'
  // RB
  | 'speed' | 'burst' | 'juke' | 'power' | 'vision' | 'hands'
  // WR
  | 'routeRunning' | 'release' | 'contestedCatch' | 'yac' | 'deepThreat'
  // TE
  | 'blocking'
  // OL
  | 'passBlock' | 'runBlock' | 'strength' | 'agility';

export type Team = {
  id: string;
  name: string;
  city: string;
  abbr: string;
  primary: string;
  secondary: string;
};

export type Player = {
  id: string;
  name: string;
  teamId: string;
  position: Position;
  /** Years catalogued under this franchise, e.g. "1998–2009". */
  era: string;
  /** One punchy line of sports-bar trash talk. */
  blurb: string;
  /** Only the keys in this position's ATTRIBUTE_SETS entry are present. */
  attributes: Partial<Record<AttributeKey, number>>;
};

/**
 * Ordered attribute slots per position. This is the build sheet, and it is also how many
 * spins a run takes.
 *
 * THREE ATTRIBUTES CAME OUT OF HERE and none of them is coming back.
 *
 * Contact balance and catch radius were both saying something the card already said.
 * Balance moved with power at 0.93 correlation, which the independence check had been
 * warning about for months, and catch radius is what a tight end's hands and his
 * contested work already describe between them. Two slots that were really one pick each
 * are worse than no slot.
 *
 * Durability is the interesting one, because it did not merge into anything. It left
 * because it was the wrong shape for what it was doing. Availability is not a trait you
 * shop for off somebody else's career, it is what happens to yours, so how long a player
 * lasts is now rolled at the end from his overall against how long players at that level
 * really lasted. See src/lib/career.ts.
 *
 * Positions are deliberately uneven now. A quarterback build is seven picks, a receiver
 * seven, a running back six and a tight end five, and a shorter build is a harder build
 * because there is nowhere to hide a cold spin.
 */
export const ATTRIBUTE_SETS: Record<Position, AttributeKey[]> = {
  QB: ['armStrength', 'accuracy', 'deepBall', 'pocketPresence', 'mobility', 'processing', 'clutch'],
  RB: ['speed', 'burst', 'juke', 'power', 'vision', 'hands'],
  WR: ['speed', 'hands', 'routeRunning', 'release', 'contestedCatch', 'yac', 'deepThreat'],
  TE: ['hands', 'blocking', 'speed', 'routeRunning', 'yac'],
};

export const OL_ATTRIBUTES: AttributeKey[] = ['passBlock', 'runBlock', 'strength', 'agility'];

/**
 * Short broadcast-style labels. DISPLAY ONLY.
 *
 * These are the words on screen and nothing else. The attribute KEYS underneath are
 * load-bearing across a thousand player rows, the scoring weights and every verification
 * suite, so a label that reads wrong gets fixed here rather than by renaming a key.
 * "hands" is CATCHING, "processing" is READS and "burst" is ACCELERATION because that is
 * what football people actually say, and not one of those keys moved an inch.
 */
export const ATTRIBUTE_LABELS: Record<AttributeKey, string> = {
  armStrength: 'ARM STRENGTH',
  accuracy: 'ACCURACY',
  deepBall: 'DEEP BALL',
  pocketPresence: 'POCKET PRESENCE',
  mobility: 'MOBILITY',
  processing: 'READS',
  clutch: 'CLUTCH',
  speed: 'SPEED',
  burst: 'ACCELERATION',
  juke: 'JUKE',
  power: 'POWER',
  vision: 'VISION',
  hands: 'CATCHING',
  routeRunning: 'ROUTE RUNNING',
  release: 'RELEASE',
  contestedCatch: 'CONTESTED CATCH',
  yac: 'YAC',
  deepThreat: 'DEEP THREAT',
  blocking: 'BLOCKING',
  passBlock: 'PASS BLOCK',
  runBlock: 'RUN BLOCK',
  strength: 'STRENGTH',
  agility: 'AGILITY',
};

/**
 * Short labels for tight spaces. Display only, same as the table above.
 *
 * ACC appears twice, for accuracy and for acceleration, and that is deliberate rather
 * than an oversight. Both are what a football card calls them, and no screen can show
 * the two together: accuracy only exists on a quarterback and acceleration only on a
 * running back, so nothing ever renders both sets at once.
 */
export const ATTRIBUTE_ABBR: Record<AttributeKey, string> = {
  armStrength: 'ARM', accuracy: 'ACC', deepBall: 'DEEP', pocketPresence: 'PKT',
  mobility: 'MOB', processing: 'RDS', clutch: 'CLT', speed: 'SPD', burst: 'ACC',
  juke: 'JKE', power: 'PWR', vision: 'VIS', hands: 'CAT',
  routeRunning: 'RTE', release: 'RLS', contestedCatch: 'CTC', yac: 'YAC',
  deepThreat: 'DPT', blocking: 'BLK', passBlock: 'PBK',
  runBlock: 'RBK', strength: 'STR', agility: 'AGI',
};
