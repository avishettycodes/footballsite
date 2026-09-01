/**
 * Voice check on player-facing text only.
 *
 * Scope matters here. Terminal diagnostics and code comments want to be dense and
 * scannable, so they are deliberately not checked. This looks at what someone reading
 * the site actually sees: the screens, the trophy descriptions, and the blurbs.
 *
 * Rules:
 *   1. No em dashes.
 *   2. No blurb built on the "x, y, and z" stacked-descriptor formula, where the first
 *      two items are bare one or two word descriptors. Longer clauses joined with "and"
 *      are fine, because those read as a real sentence rather than a list.
 *   3. Blurbs stay punchy, and no two say the same thing. Exact duplicates are the easy
 *      case. The real risk at a thousand one-liners about catching footballs is forty
 *      near-identical variations on "great hands, no speed", so this compares meaning
 *      rather than characters.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { PLAYERS } from '../src/data';

const SCREEN_DIRS = ['src/components'];
const SCREEN_FILES = ['src/App.tsx', 'src/DataInspector.tsx', 'src/lib/narrative.ts'];
/** Only the strings players read, not the calibration commentary around them. */
const PARTIAL_FILES: Record<string, RegExp> = { 'src/lib/scoring.ts': /\b(label|requirement):/ };

const MAX_BLURB = 96;
const SHOW = 20;

function screens(): string[] {
  const out = [...SCREEN_FILES];
  for (const dir of SCREEN_DIRS) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isFile() && /\.tsx?$/.test(entry.name)) out.push(join(dir, entry.name));
    }
  }
  return out;
}

type Problem = { where: string; what: string };
const emDash: Problem[] = [];
const listy: Problem[] = [];
const longBlurb: Problem[] = [];
const dupes: Problem[] = [];

function scan(file: string, only?: RegExp) {
  const lines = readFileSync(file, 'utf8').split('\n');
  let inBlock = false;
  lines.forEach((line, i) => {
    const t = line.trim();
    if (t.startsWith('/*')) inBlock = true;
    const isComment = inBlock || t.startsWith('//') || t.startsWith('*');
    if (t.includes('*/')) inBlock = false;
    if (isComment) return;
    if (only && !only.test(line)) return;
    if (line.includes('—')) emDash.push({ where: `${file}:${i + 1}`, what: t.slice(0, 88) });
  });
}

for (const file of screens()) scan(file);
for (const [file, only] of Object.entries(PARTIAL_FILES)) scan(file, only);

/**
 * The stacked-descriptor test. "Small, slippery, and gone to the USFL" is the shape we
 * do not want. "He could run it, catch it and kick it, and he bet on it too" is fine,
 * because those are clauses rather than piled-up adjectives.
 */
function isStackedList(text: string): boolean {
  const m = text.match(/([^.,;!?]+),\s*([^.,;!?]+),\s*and\s/i);
  if (!m) return false;
  const words = (s: string) => s.trim().split(/\s+/).length;
  return words(m[1]) <= 2 && words(m[2]) <= 2;
}

/** Words too common in football writing to count as evidence two lines are the same. */
const NOISE = new Set([
  'a','an','the','and','or','but','of','to','in','on','for','with','at','by','from','as',
  'he','him','his','it','its','they','them','was','were','is','are','be','been','had','has',
  'have','who','that','this','then','than','never','not','one','two','three','you','your',
  'yards','yard','season','seasons','year','years','game','games','football','league','nfl',
]);

function meaningWords(blurb: string): Set<string> {
  return new Set(
    blurb.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/)
      .filter((w) => w.length > 2 && !NOISE.has(w)),
  );
}

/**
 * Jaccard, not overlap-over-the-smaller-set. The smaller-set version makes any two short
 * blurbs look alike the moment they share three ordinary words, which flagged "cried on
 * national television" against "ran Shawne Merriman over on national television". Those
 * are different jokes that happen to share a stock phrase.
 */
function similarity(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let shared = 0;
  for (const w of a) if (b.has(w)) shared++;
  return shared / (a.size + b.size - shared);
}

const NEAR_DUPLICATE = 0.4;
/**
 * Below this, an overlap is a coincidence of vocabulary rather than a repeated idea.
 * Three is deliberate. At four, "great hands and no speed to speak of" slipped past
 * "tremendous hands, but no speed at all to speak of", which is precisely the thing
 * this check exists to catch.
 */
const MIN_SHARED_WORDS = 3;
const nearDupes: Problem[] = [];

const seen = new Map<string, string>();
for (const p of PLAYERS) {
  if (p.blurb.includes('—')) emDash.push({ where: `blurb ${p.id}`, what: p.blurb });
  if (isStackedList(p.blurb)) listy.push({ where: `${p.name} (${p.id})`, what: p.blurb });
  if (p.blurb.length > MAX_BLURB) {
    longBlurb.push({ where: `${p.name} (${p.id})`, what: `${p.blurb.length} chars: ${p.blurb}` });
  }
  const prior = seen.get(p.blurb.toLowerCase());
  if (prior) dupes.push({ where: `${p.name} (${p.id})`, what: `same blurb as ${prior}` });
  else seen.set(p.blurb.toLowerCase(), p.name);
}

const words = PLAYERS.map((p) => ({ p, w: meaningWords(p.blurb) }));
for (let i = 0; i < words.length; i++) {
  for (let j = i + 1; j < words.length; j++) {
    if (words[i].p.blurb === words[j].p.blurb) continue; // already an exact duplicate
    let shared = 0;
    for (const w of words[i].w) if (words[j].w.has(w)) shared++;
    if (shared < MIN_SHARED_WORDS) continue;
    const score = similarity(words[i].w, words[j].w);
    if (score >= NEAR_DUPLICATE) {
      nearDupes.push({
        where: `${words[i].p.name} and ${words[j].p.name} (${Math.round(score * 100)}% shared)`,
        what: `"${words[i].p.blurb}"\n    "${words[j].p.blurb}"`,
      });
    }
  }
}

function report(title: string, hint: string, items: Problem[]): boolean {
  if (!items.length) return false;
  console.log(`\n${title} (${items.length})`);
  console.log(`  fix: ${hint}`);
  for (const it of items.slice(0, SHOW)) console.log(`  ${it.where}\n    ${it.what}`);
  if (items.length > SHOW) console.log(`  ...and ${items.length - SHOW} more of the same`);
  return true;
}

console.log(`checked ${screens().length} screens and ${PLAYERS.length} blurbs`);

const failed = [
  report('em dashes', 'replace with a comma, a full stop, or rewrite the sentence', emDash),
  report('stacked descriptors', 'rewrite as one full sentence instead of "x, y, and z"', listy),
  report(`blurbs over ${MAX_BLURB} characters`, 'trim to one punchy line', longBlurb),
  report('duplicate blurbs', 'every player needs his own line', dupes),
  report('near-duplicate blurbs', 'these two are making the same joke, rewrite one', nearDupes),
].some(Boolean);

if (failed) process.exit(1);
console.log('copy voice: PASS');
