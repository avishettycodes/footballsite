/**
 * Rebuild the checked-in current-player card values from the audited fixture.
 *
 * This deliberately does not fetch or alter roster membership. Use it after changing
 * the documented Madden-to-card model, then run verify:current to prove every generated
 * value still agrees with the frozen Week 1 source snapshot.
 */
import fs from 'node:fs';
import path from 'node:path';
import { ATTRIBUTE_SETS } from '../src/data/types';
import type { CurrentRatingSource } from './current-rating-model';
import { calculateCurrentRatings } from './current-rating-model';

type Fixture = { players: CurrentRatingSource[] };

const fixture = JSON.parse(
  fs.readFileSync(new URL('./fixtures/current-week-1.json', import.meta.url), 'utf8'),
) as Fixture;
const ratings = calculateCurrentRatings(fixture.players);
const sources = new Map(fixture.players.map((source) => [source.id, source]));

for (const position of ['qb', 'rb', 'wr', 'te'] as const) {
  const filename = path.resolve(`src/data/current/${position}.ts`);
  const rewritten = fs.readFileSync(filename, 'utf8').split('\n').map((line) => {
    const id = line.match(/^\s*\['(now-[^']+)'/)?.[1];
    if (!id) return line;
    const source = sources.get(id);
    const attributes = ratings.get(id);
    if (!source || !attributes) throw new Error(`No audited source found for ${id}`);
    const values = ATTRIBUTE_SETS[source.position].map((key) => attributes[key]);
    return line.replace(/(?:\d+, ){6}\d+(\],)$/, `${values.join(', ')}$1`);
  }).join('\n');
  fs.writeFileSync(filename, rewritten);
}

console.log(`Applied Madden-derived ratings to ${fixture.players.length} current-player cards.`);
