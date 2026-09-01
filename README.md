# GRIDIRONLAB

Build a Frankenstein football player by spinning a wheel of NFL teams. Each spin lands
on a franchise, you look at every notable player at your position in that team's history,
and you steal exactly one attribute from one of them. Repeat until every slot is full,
then find out what your creation actually did with his career.

Take Derrick Henry's power, Chris Johnson's speed and Le'Veon Bell's vision, then
discover on the last spin that you have nobody left who can catch.

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:5173. There is a debug view of the raw data at `?debug`.

## What works right now

Solo build mode is playable end to end. Pick a position, spin, steal attributes, and
simulate a career. The wheel, the build sheet, the scoring engine, the accolades and the
Super Bowl roll are all in.

Hard mode means no rerolls. Every franchise stays in the wheel the whole way in both
modes, so landing on the same roster twice is a legal and fairly common outcome, and in
hard mode you have no way to talk your way out of it.

QUIT in the header walks out of a run from anywhere, including mid spin, and asks first.
It deletes the build and the autosave with it, which is why it asks.

Naming your player on the report saves him. He goes into YOUR HALL at the bottom of the
start screen, where opening him replays the whole report as it came out, fully revealed
and without sitting through the reveal a second time. Clearing the name takes him back
out, which is also the undo. Twenty players are kept, newest first.

The report opens on the story rather than the rating. It says which franchise drafted
him, how many seasons he lasted and which badges he wore on the way, all of it derived
from the run that already happened rather than rolled. The one sentence that says what
he actually won is held back until after the Super Bowl reveal, because printing the
ending above the reveal defeats the reveal.

## On a phone

Test the layout at 390px with the display font FORCED to `system-ui`, not with whatever
your Mac happens to have. Nothing here loads a webfont, so `--font-display` falls through
Archivo Black and Haettenschweiler to Arial Narrow, and macOS has Arial Narrow while iOS
does not. A phone therefore renders the whole game in San Francisco, roughly 13% wider,
and that is entirely why NAME YOUR PLAYER came off a tester's iPhone reading NAME YOUR
PLAY while it fit on the machine it was built on. Anything sized so that the narrow
fallback just barely fits is already broken on the device most people are holding.

The results screen never tells you what a trophy required. It says how close he came in
words instead. Learning the shape of the thresholds by playing is the point, and 17-0
does not print its own rulebook either.

Full offense mode, the share card and the admin editor are not built yet.

## The voice

Write like a person explaining something to a smart friend over coffee. Professional but
natural, clear and direct, with a bit of warmth. No buzzwords, nothing stiff, nothing
that sounds like a press release.

Two habits are worth naming because they are the ones that creep back in. Do not use em
dashes. And do not pile up short descriptors inside a sentence, the "x, y, and z" shape
where the items are bare things with no verb in them. "Six foot three, 220 pounds, and
ran a 4.39" is a spec sheet. "Threw it sidearm, ran like a statue, and outthought
everybody on the field" is somebody talking, and that one is fine, so the test is
whether there is a verb in the things being listed rather than how short they are.

`npm run verify:copy` enforces all of this on anything a player can read, which now
includes the two lines the store says out loud when a run deadlocks or a spin comes back
free. Those went unchecked for months because they live in the store rather than a
component. If you write a sentence somebody will see on screen, put the file it lives in
on one of the lists at the top of `scripts/verify-copy.ts`.

## The name, and the storage keys

The game was called MEGATRON and is now called GridironLab, because Megatron reads as a
receiver game and this one has four positions in it.

The localStorage keys did NOT move. They are `megatron.run.v1` for the autosaved run and
`megatron.hall.v1` for saved players. A key is the address of somebody's data rather
than player-facing copy, so renaming it strands every half finished run and every saved
player currently sitting in a browser. Calvin Johnson's blurb still says Megatron too,
since that is his name.

## The data

Every rating is hand written and completely subjective. Nothing is scraped, no sports
API is called, and no licensed dataset is involved. There are 1000 players across four
positions, seven to nine per franchise per position.

Ratings are deliberately spiky. A player is in the pool because of one number, so Chris
Johnson has 99 speed and 60 power, Jimmy Graham has a 99 catch radius and 40 blocking,
and Gus Edwards catches at 38. Some cards are bad on purpose, because a cold spin should
hurt.

Attribute KEYS in the data files are load-bearing across every player row, the scoring
weights and the whole verification suite. The words on screen come from
`ATTRIBUTE_LABELS` in `src/data/types.ts`, so a label that reads wrong gets fixed there
rather than by renaming a key. That is why the key is still `hands` while the screen says
CATCHING, still `processing` while the screen says READS, and still `burst` while the
screen says ACCELERATION.

## Deploying

It is a static Vite build with no backend, so Vercel handles it with no configuration.
Point a project at this repo, take the detected settings, and every push to main
redeploys.

`npm run build` runs the full verification suite before it compiles, so a data or
calibration regression fails the deploy rather than shipping. That costs about three
seconds; the suite is deterministic, so it will never fail you at random. Use
`npm run build:only` to skip it locally.

Set `VITE_FEEDBACK_URL` to a form link and a feedback line appears in the footer.

## Verification

```bash
npm run verify
```

That runs six suites, and they check more than types.

- **data** looks for duplicate ids, out of range values and thin pools, and it flags
  dead cards, meaning players with no elite trait and no funny weakness. It also measures
  correlation between attributes, so if speed and deep threat ever collapse into the same
  pick, you hear about it.
- **rng** proves the `?seed=` contract on both sides of the generator. The same seed
  replays exactly, different seeds diverge, and a run serialized mid-game resumes on the
  same sequence. It also proves the round trip through a phone, because that is the half
  that actually broke: whatever the results screen copies has to come back out of the
  seed box as the same seed, and a paste with no seed in it has to be rejected out loud
  rather than filed down into a legal seed that plays a different game.
- **run** drives the real store through complete games and fuzzes 1500 seeds per
  position across both difficulty modes to prove no run can strand. Because a greedy
  player never actually drains a roster, it also forces the deadlock case on purpose,
  marking every franchise but one as spent and asserting the free respin carries the run
  every time. It proves the Super Bowl roll cannot be re-rolled by refreshing.
- **scoring** plays thousands of games with four bot policies of increasing skill and
  asserts that every accolade gets more likely as you move up that ladder. If careless
  play ever out-earns careful play, it fails.
- **audio** checks the sound without anybody having to hear it. A tester reported total
  silence on a phone with the toggle either way, and there turned out to be three
  separate causes. An AudioContext created or suspended without a user gesture behind it
  stays suspended with its clock frozen, so notes queue at zero instead of playing, and
  only a gesture can bring it back. A phone speaker gives you almost nothing under 500Hz,
  so the old 70Hz landing thud and 90Hz heartbeat were not quiet, they were absent. And
  an iPhone silences a page's audio when the ringer switch is off unless the page says
  its audio is the point, which is why the first two fixes both verified clean in desktop
  Chrome and the tester still heard nothing. This drives the real module against a fake
  WebAudio to prove the recovery path works, walks the voice table to prove every sound
  carries on a small speaker, and asserts the playback session is declared on the first
  gesture, never at import and never while the sound is switched off.
- **copy** reads only what a player sees, and it enforces the voice below. Em dashes
  fail. So does corporate vocabulary, because there is no honest reason for a game about
  stealing Barry Sanders' vision to say "seamless". And so does the "x, y, and z" shape
  when the piled-up items have no verb in them, though real clauses joined with "and"
  are fine because those read as somebody talking. It also catches overlong blurbs and
  two cards making the same joke.

`src/lib/scoring.ts` is fenced. The weights and gates in there are calibrated against
measured distributions, so if `verify:scoring` fails after new data lands, the data is
wrong rather than the scoring.

## Not affiliated with anybody

This is a fan project. It has nothing to do with the NFL and no team has endorsed it.
Team names are here so you know whose history you are digging through. Every rating was
written by hand for fun and none of it comes from a real scouting source. If you disagree
with a number, you are probably right.
