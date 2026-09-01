/**
 * Voice check on player-facing text only.
 *
 * Scope matters here. Terminal diagnostics and code comments want to be dense and
 * scannable, so they are deliberately not checked. This looks at what someone reading
 * the site actually sees: the screens, the trophy descriptions, and the blurbs.
 *
 * The voice, in one line: write like a person explaining something to a smart friend,
 * not like a press release. Clear, direct, warm, and never stiff.
 *
 * Rules:
 *   1. No em dashes.
 *   2. Nothing built on the "x, y, and z" stacked-descriptor formula, where the items
 *      being piled up are bare short descriptors with no verb in them. Real clauses
 *      joined with "and" are fine, because those read as somebody talking rather than
 *      as a list. This applies to the screens as well as the blurbs now. It used to
 *      only look at blurbs, and it only fired when the pile-up started the sentence, so
 *      "a second round pick who was quick, small, and never quite trusted" walked past
 *      it for months.
 *   3. No corporate vocabulary. There is no honest reason for a game about stealing
 *      Barry Sanders' vision to say "seamless" or "curated" or "elevate your".
 *   4. Blurbs stay punchy, and no two say the same thing. Exact duplicates are the easy
 *      case. The real risk at a thousand one-liners about catching footballs is forty
 *      near-identical variations on "great hands, no speed", so this compares meaning
 *      rather than characters.
 *
 * SCOPE IS THE THING THIS FILE KEEPS GETTING WRONG. Twice now a player-facing string
 * has lived somewhere the scan did not look: the deadlock and free-respin messages sit
 * in the store, and the career summary sentences sit in a lib. Both are read out loud
 * to a player and neither was covered. If you write a sentence somebody will read on
 * screen, the file it lives in belongs in one of the lists below.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { PLAYERS } from '../src/data';

const SCREEN_DIRS = ['src/components'];
const SCREEN_FILES = ['src/App.tsx', 'src/DataInspector.tsx', 'src/lib/narrative.ts', 'src/lib/career.ts'];
/** Only the strings players read, not the calibration commentary around them. */
const PARTIAL_FILES: Record<string, RegExp> = {
  'src/lib/scoring.ts': /\b(label|requirement):/,
  // The store speaks to the player twice, when a run deadlocks and when a spin comes
  // back free. Both go straight onto the screen and neither was ever checked.
  // Any single-quoted sentence: a capital letter and enough length to be prose. The
  // free-respin line sits on the far side of a ternary, so keying on the property name
  // missed it entirely.
  'src/store/gameStore.ts': /'[A-Z][^']{15,}'/,
};

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
const jargon: Problem[] = [];

/**
 * Words that belong to a product launch rather than to somebody talking about football.
 * Deliberately a short list of the obvious tells rather than a thesaurus. A checker that
 * fights you over ordinary words gets switched off.
 */
const JARGON = [
  'leverage', 'utilize', 'seamless', 'seamlessly', 'robust', 'delve', 'furthermore',
  'moreover', 'facilitate', 'optimize', 'streamline', 'cutting-edge', 'best-in-class',
  'empower', 'holistic', 'synergy', 'comprehensive', 'effortless', 'game-changing',
  'curated', 'bespoke', 'unleash', 'supercharge', 'next-level', 'world-class',
  'state-of-the-art', 'elevate', 'embark', 'kindly',
];

/**
 * A rough verb detector. It only has to tell "ran a 4.39" from "220 pounds", so an
 * exhaustive conjugation table would be a waste; this is the vocabulary a football
 * one-liner actually uses.
 */
const HAS_VERB = /\b(threw|throws|throw|ran|runs|run|caught|catches|catch|blocked|blocks|block|won|wins|win|made|makes|make|played|plays|play|went|goes|go|got|gets|get|had|has|have|came|comes|come|took|takes|take|taken|left|leaves|leave|beat|beats|hit|hits|started|starts|start|returned|returns|return|followed|follows|drafted|drafts|paid|pays|does|did|do|stayed|stays|stay|found|finds|find|looked|looks|look|swore|danced|dances|retired|retires|signed|signs|traded|trades|lost|loses|lose|said|says|say|scored|scores|score|holds|held|hold|wore|wears|wear|threw|quit|quits|vanished|rolled|rolls|booed|boos|walked|walks|talked|talks|hung|hangs|gave|gives|give)\b/i;

/** Linking words that introduce a pile-up rather than being part of one. */
const LEAD_IN = /^.*\b(?:who|which|that|and)?\s*\b(?:was|were|is|are|be|been|being)\b\s*/i;

/**
 * The stacked-descriptor test. "Small, slippery, and gone to the USFL" is the shape we
 * do not want. "Threw it sidearm, ran like a statue, and outthought everybody" is fine,
 * because those are clauses rather than piled-up descriptors.
 *
 * THREE THINGS THIS USED TO MISS, all found by reading the blurbs rather than the code.
 *
 * It anchored on the start of the sentence, so the first item swallowed everything
 * before the first comma and a pile-up further in was invisible. It now works backwards
 * from every ", and" instead, which has no notion of where the sentence began.
 *
 * A lead-in hid the pile-up. "Second round pick who was quick, small, and never quite
 * trusted" put "who was" in the first item, and "was" is a verb, so the item read as a
 * clause. The items are really "quick", "small" and "never quite trusted", so anything
 * up to and including a linking verb is stripped before judging.
 *
 * And a word count is a poor proxy for what makes a list feel like a list. What grates
 * is piling up things with no verb in them. "Six foot three, 220 pounds, and ran a
 * 4.39" reads as a spec sheet; "Threw it sidearm, ran like a statue, and outthought
 * everybody" reads as somebody talking, and both have short items. So the test is
 * whether the piled-up items are verbless, not whether they are short.
 */
function isStackedList(text: string): boolean {
  for (const m of text.matchAll(/,\s*(?:and|or)\s/gi)) {
    const before = text.slice(0, m.index);
    const parts = before.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length < 2) continue;
    const last = parts[parts.length - 1];
    const prev = parts[parts.length - 2].replace(LEAD_IN, '');
    if (!HAS_VERB.test(last) && !HAS_VERB.test(prev)) return true;
  }
  return false;
}

function scan(file: string, only?: RegExp) {
  const seenHere = new Set<string>();
  const lines = readFileSync(file, 'utf8').split('\n');
  let inBlock = false;
  lines.forEach((line, i) => {
    const t = line.trim();
    // `{/*` is how a comment starts in JSX and it was not recognised, so every comment
    // inside a component was being graded as player-facing copy.
    if (t.startsWith('/*') || t.startsWith('{/*')) inBlock = true;
    const isComment = inBlock || t.startsWith('//') || t.startsWith('*');
    if (t.includes('*/')) inBlock = false;
    if (isComment) return;
    if (only && !only.test(line)) return;
    const where = `${file}:${i + 1}`;
    if (line.includes('—')) emDash.push({ where, what: t.slice(0, 88) });
    if (isStackedList(t)) listy.push({ where, what: t.slice(0, 100) });
    for (const word of JARGON) {
      if (new RegExp(`\\b${word}\\b`, 'i').test(t) && !seenHere.has(word)) {
        seenHere.add(word);
        jargon.push({ where, what: `"${word}" in: ${t.slice(0, 80)}` });
      }
    }
  });
}

for (const file of screens()) scan(file);
for (const [file, only] of Object.entries(PARTIAL_FILES)) scan(file, only);

/**
 * The stacked-descriptor test. "Small, slippery, and gone to the USFL" is the shape we
 * do not want. "He could run it, catch it and kick it, and he bet on it too" is fine,
 * because those are clauses rather than piled-up adjectives.
 *
 * TWO THINGS THIS USED TO MISS, both found by reading the blurbs rather than the code.
 *
 * It anchored on the start of the sentence, so the first item swallowed everything
 * before the first comma. "Second round pick who was quick, small, and never quite
 * trusted" measured its first item at six words and passed, when "quick, small, and
 * never quite trusted" is exactly the shape being banned. It now scans from any
 * sentence boundary as well as from the start.
 *
 * And a word count is a poor proxy for what makes a list feel like a list. What grates
 * is piling up things with no verb in them. "Six foot three, 220 pounds, and ran a
 * 4.39" reads as a spec sheet; "Threw it sidearm, ran like a statue, and outthought
 * everybody" reads as somebody talking, and both have short items. So the test is
 * whether the piled-up items are verbless, not whether they are short.
 */

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

/**
 * The old name, hunted through the RENDERED text rather than the source.
 *
 * The rename missed the data inspector's heading for two commits, because it was written
 * `Mega<span className="text-hazard">tron</span>` to colour half the word. Every grep for
 * "Megatron" came back clean while the page went on saying it in 48px type, and it was a
 * browser that eventually noticed rather than any check here. Stripping the tags first
 * puts the word back together, which is the only way a source scan can see what a reader
 * sees.
 *
 * The storage keys are deliberately still called megatron and are not affected, since
 * they live in string literals rather than in markup.
 */
const oldName: Problem[] = [];
for (const file of screens()) {
  const text = readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/.*/g, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/\{[^{}]*\}/g, ' ');
  if (/megatron/i.test(text)) {
    const line = text.split('\n').findIndex((l) => /megatron/i.test(l)) + 1;
    oldName.push({ where: `${file} (around line ${line})`, what: 'this screen still says Megatron' });
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
  report('corporate vocabulary', 'say it the way you would say it out loud', jargon),
  report(`blurbs over ${MAX_BLURB} characters`, 'trim to one punchy line', longBlurb),
  report('duplicate blurbs', 'every player needs his own line', dupes),
  report('near-duplicate blurbs', 'these two are making the same joke, rewrite one', nearDupes),
  report('the old name on a screen', 'the game is called GridironLab now', oldName),
].some(Boolean);

if (failed) process.exit(1);
console.log('copy voice: PASS');
