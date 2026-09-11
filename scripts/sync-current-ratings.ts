/**
 * Rebuild current-mode ratings from downloaded official EA Madden ratings pages.
 *
 * Usage: npm run sync:current-ratings -- /path/to/madden-html
 * The directory must contain every QB, HB, WR and TE ratings result page plus any
 * individual rating pages needed for cross-position players such as Travis Hunter.
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROSTERS } from '../src/data';
import { ATTRIBUTE_SETS } from '../src/data/types';
import {
  REQUIRED_MADDEN_STATS,
  calculateCurrentRatings,
  type CurrentRatingSource,
  type MaddenSource,
} from './current-rating-model';

const sourceDirectory = process.argv[2];
if (!sourceDirectory) throw new Error('Pass the directory containing downloaded EA ratings HTML.');

const normalizeName = (name: string) => name
  .normalize('NFKD')
  .replace(/[’']/g, '')
  .replace(/\./g, '')
  .replace(/\b(jr|sr|ii|iii|iv|v)\b/gi, '')
  .replace(/\s+/g, '')
  .toLowerCase();

const NAME_ALIASES: Record<string, string> = {
  'Hollywood Brown': 'Marquise Brown',
  'Nicholas Singleton': 'Nick Singleton',
  'Chig Okonkwo': 'Chigoziem Okonkwo',
  'J. Michael Sturdivant': 'J.Michael Sturdivant',
};

type EaPlayer = {
  id: number;
  firstName: string;
  lastName: string;
  height: number;
  weight: number;
  overallRating: number;
  team: { label: string } | null;
  position: { shortLabel: string };
  stats: Record<string, { value: number }>;
};

const eaPlayers = new Map<string, EaPlayer>();
for (const filename of fs.readdirSync(sourceDirectory).filter((name) => name.endsWith('.html')).sort()) {
  const html = fs.readFileSync(path.join(sourceDirectory, filename), 'utf8');
  const payload = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/)?.[1];
  if (!payload) continue;
  const page = JSON.parse(payload).props.pageProps;
  const players: EaPlayer[] = page.ratingDetails?.items ?? page.ratingsEntries?.items ?? [];
  for (const player of players) {
    eaPlayers.set(normalizeName(`${player.firstName} ${player.lastName}`), player);
  }
}

const sources: CurrentRatingSource[] = ROSTERS.current.map((player) => {
  const sourceName = NAME_ALIASES[player.name] ?? player.name;
  const ea = eaPlayers.get(normalizeName(sourceName));
  if (!ea) throw new Error(`No Madden source found for ${player.name}`);
  const stats = Object.fromEntries(REQUIRED_MADDEN_STATS[player.position].map((key) => {
    const value = ea.stats[key]?.value;
    if (typeof value !== 'number') throw new Error(`${sourceName} is missing ${key}`);
    return [key, value];
  }));
  const madden: MaddenSource = {
    id: ea.id,
    name: `${ea.firstName} ${ea.lastName}`,
    team: ea.team?.label ?? null,
    position: ea.position.shortLabel,
    overall: ea.overallRating,
    height: ea.height,
    weight: ea.weight,
    stats,
  };
  return { id: player.id, name: player.name, teamId: player.teamId, position: player.position, madden };
});

const ratings = calculateCurrentRatings(sources);
for (const position of ['qb', 'rb', 'wr', 'te']) {
  const filename = path.resolve(`src/data/current/${position}.ts`);
  const rewritten = fs.readFileSync(filename, 'utf8').split('\n').map((line) => {
    const id = line.match(/^\s*\['(now-[^']+)'/)?.[1];
    if (!id) return line;
    const source = sources.find((entry) => entry.id === id);
    const attributes = ratings.get(id);
    if (!source || !attributes) throw new Error(`No calculated ratings for ${id}`);
    const values = ATTRIBUTE_SETS[source.position].map((key) => attributes[key]);
    return line.replace(/(?:\d+, ){6}\d+(\],)$/, `${values.join(', ')}$1`);
  }).join('\n');
  fs.writeFileSync(filename, rewritten);
}

const fixture = {
  season: 2026,
  week: 1,
  snapshotDate: '2026-09-10',
  ratingSource: 'EA SPORTS Madden NFL 27 launch ratings',
  ratingSourceUrl: 'https://www.ea.com/games/madden-nfl/ratings',
  rosterSources: [
    'https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/{team}/depthcharts',
    'https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/{team}/roster',
    'https://www.profootballnetwork.com/nfl-hq/depth-charts',
    'https://www.seahawks.com/news/seahawks-sign-17-to-practice-squad-including-veterans-trevon-diggs-aj-finley-velus-jones-jr-rodney-thomas-ii',
    'https://www.seahawks.com/news/seahawks-make-roster-moves-ahead-of-season-opener-vs-patriots',
  ],
  eligibility: 'Week 1 offensive depth chart and active 53-man roster; excludes practice squad, IR, PUP, NFI, reserve and suspended lists',
  explicitExclusions: [
    { name: 'Brandon Aiyuk', reason: 'Reserve/Left Squad' },
    { name: 'Jeshaun Jones', reason: 'Suspended list' },
    { name: 'Lan Larison', reason: 'Practice-squad elevation, not on the 53-man roster' },
    { name: 'Velus Jones Jr.', reason: 'Seattle practice squad; temporary Week 1 elevation, not on the 53-man roster' },
  ],
  players: sources,
};

fs.mkdirSync(path.resolve('scripts/fixtures'), { recursive: true });
fs.writeFileSync(
  path.resolve('scripts/fixtures/current-week-1.json'),
  `${JSON.stringify(fixture, null, 2)}\n`,
);

console.log(`Updated ${sources.length} current-player cards from Madden NFL 27.`);
