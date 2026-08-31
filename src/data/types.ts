/**
 * MEGATRON data layer.
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
  | 'speed' | 'burst' | 'juke' | 'power' | 'vision' | 'contactBalance' | 'hands'
  // WR
  | 'routeRunning' | 'release' | 'contestedCatch' | 'yac' | 'deepThreat'
  // TE
  | 'blocking' | 'catchRadius'
  // OL
  | 'passBlock' | 'runBlock' | 'strength' | 'agility'
  // shared
  | 'durability';

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

/** Ordered attribute slots per position — this is the build sheet. */
export const ATTRIBUTE_SETS: Record<Position, AttributeKey[]> = {
  QB: ['armStrength', 'accuracy', 'deepBall', 'pocketPresence', 'mobility', 'processing', 'clutch', 'durability'],
  RB: ['speed', 'burst', 'juke', 'power', 'vision', 'contactBalance', 'hands', 'durability'],
  WR: ['speed', 'hands', 'routeRunning', 'release', 'contestedCatch', 'yac', 'deepThreat', 'durability'],
  TE: ['hands', 'blocking', 'speed', 'catchRadius', 'routeRunning', 'yac', 'durability'],
};

export const OL_ATTRIBUTES: AttributeKey[] = ['passBlock', 'runBlock', 'strength', 'agility', 'durability'];

/**
 * Short broadcast-style labels. DISPLAY ONLY.
 *
 * These are the words on screen and nothing else. The attribute KEYS underneath are
 * load-bearing across a thousand player rows, the scoring weights and every verification
 * suite, so a label that reads wrong gets fixed here rather than by renaming a key.
 * "hands" is CATCHING and "processing" is READS because that is what football people
 * actually say, and neither key moved an inch.
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
  burst: 'BURST',
  juke: 'JUKE',
  power: 'POWER',
  vision: 'VISION',
  contactBalance: 'CONTACT BALANCE',
  hands: 'CATCHING',
  routeRunning: 'ROUTE RUNNING',
  release: 'RELEASE',
  contestedCatch: 'CONTESTED CATCH',
  yac: 'YAC',
  deepThreat: 'DEEP THREAT',
  blocking: 'BLOCKING',
  catchRadius: 'CATCH RADIUS',
  passBlock: 'PASS BLOCK',
  runBlock: 'RUN BLOCK',
  strength: 'STRENGTH',
  agility: 'AGILITY',
  durability: 'DURABILITY',
};

/** Three-letter labels for tight spaces. */
export const ATTRIBUTE_ABBR: Record<AttributeKey, string> = {
  armStrength: 'ARM', accuracy: 'ACC', deepBall: 'DEEP', pocketPresence: 'PKT',
  mobility: 'MOB', processing: 'RDS', clutch: 'CLT', speed: 'SPD', burst: 'BRS',
  juke: 'JKE', power: 'PWR', vision: 'VIS', contactBalance: 'BAL', hands: 'CAT',
  routeRunning: 'RTE', release: 'RLS', contestedCatch: 'CTC', yac: 'YAC',
  deepThreat: 'DPT', blocking: 'BLK', catchRadius: 'RAD', passBlock: 'PBK',
  runBlock: 'RBK', strength: 'STR', agility: 'AGI', durability: 'DUR',
};
