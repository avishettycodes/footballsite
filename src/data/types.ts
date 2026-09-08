/**
 * GridironLab data layer.
 *
 * Every rating in this app is hand-authored, subjective, and made up for fun.
 * No licensed dataset, no scraped source, no API. If you disagree with a number,
 * you are probably right and we do not care.
 */

export type Position = 'QB' | 'RB' | 'WR' | 'TE';

/**
 * WHICH LEAGUE YOU ARE DIGGING THROUGH.
 *
 * Two complete datasets, not one dataset with a filter on it, and that is the whole
 * design. All-time is every player in a franchise's history rated against everybody who
 * has ever played the position, so Jerry Rice sets the top of the receiver scale and a
 * good player today sits below him. Current is only the men on a roster right now, rated
 * against each other, so the best receiver playing this season gets the 99.
 *
 * The same man therefore has two different cards, and both are correct. Lamar Jackson's
 * arm against Elway and Marino is not his arm against the quarterbacks he lines up
 * opposite on Sunday. A single set of numbers cannot answer both questions, which is why
 * `src/data/current/` is written by hand rather than derived by scaling the all-time
 * rows. A scale factor would keep every ranking exactly as it was and just move the
 * decimal, and the rankings are the part that actually changes.
 *
 * Player ids are unique ACROSS both sets, since a run stores the ids it has used and a
 * saved player keeps them forever. Current rows carry a `now-` prefix for that reason.
 */
export type Era = 'alltime' | 'current';

export const ERAS: Era[] = ['alltime', 'current'];

/** What the switch on the start screen calls each one. */
export const ERA_LABELS: Record<Era, string> = {
  alltime: 'All-time',
  current: 'Current',
};

/** Offensive line positions get their own simplified set (Full Eleven mode, later). */
export type OLPosition = 'OL';

export type AttributeKey =
  // QB
  | 'armStrength' | 'accuracy' | 'deepBall' | 'pocketPresence' | 'mobility'
  | 'processing' | 'clutch'
  // RB
  | 'speed' | 'burst' | 'juke' | 'power' | 'vision' | 'hands'
  // WR
  | 'routeRunning' | 'release' | 'contestedCatch' | 'yac'
  // TE
  | 'blocking' | 'toughness'
  // RB, WR and TE all share this one
  | 'size'
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
  /**
   * Years catalogued under this franchise, e.g. "1998–2009".
   *
   * This used to be called `era` and had to give the name up. The dataset a player
   * belongs to is an era now, so a field meaning "the years he played here" could not go
   * on holding the word. Three components read it and they all read `years` instead.
   */
  years: string;
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
 * SIZE ARRIVED AND DEEP THREAT LEFT, and the second half of that is the interesting one.
 *
 * Deep threat was too narrow to be one of seven picks. Most of the receivers anybody
 * actually wants are not deep threats, and most of the players who are get picked for
 * that and nothing else, so the slot kept handing out a trait that described a niche
 * rather than a receiver. Size does the job the position really wants: it is the first
 * thing anybody says about a receiver, it separates cleanly from speed, and it is what
 * you are giving up when you take the burner.
 *
 * Size is on the running back and the tight end for the same reason. A back who is 250
 * pounds and a back who is 190 are not the same player even when they run the same
 * speed, and that difference had no slot to live in.
 *
 * Positions are even now at seven picks each, and tight end got the two it was short:
 * size and toughness. It stays the hard one because its pool is genuinely thinner, not
 * because it plays a shorter build.
 */
export const ATTRIBUTE_SETS: Record<Position, AttributeKey[]> = {
  QB: ['armStrength', 'accuracy', 'deepBall', 'pocketPresence', 'mobility', 'processing', 'clutch'],
  RB: ['speed', 'burst', 'juke', 'power', 'vision', 'hands', 'size'],
  WR: ['speed', 'hands', 'routeRunning', 'release', 'contestedCatch', 'yac', 'size'],
  TE: ['hands', 'blocking', 'speed', 'routeRunning', 'yac', 'toughness', 'size'],
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
  blocking: 'BLOCKING',
  toughness: 'TOUGHNESS',
  size: 'SIZE',
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
  blocking: 'BLK', toughness: 'TGH', size: 'SZE', passBlock: 'PBK',
  runBlock: 'RBK', strength: 'STR', agility: 'AGI',
};
