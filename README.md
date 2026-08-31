# MEGATRON

Build a Frankenstein football player by spinning a wheel of NFL teams. Each spin lands
on a franchise, you look at every notable player at your position in that team's history,
and you steal exactly one attribute from one of them. Repeat until every slot is full,
then find out what your creation actually did with his career.

Take Derrick Henry's power, Chris Johnson's speed, Le'Veon Bell's vision, and then
discover on the last spin that you have nobody left with hands.

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

Full offense mode, the Hall of Builds history, the share card and the admin editor are
not built yet.

## The data

Every rating is hand written and completely subjective. Nothing is scraped, no sports
API is called, and no licensed dataset is involved. There are 1000 players across four
positions, seven to nine per franchise per position.

Ratings are deliberately spiky. A player is in the pool because of one number, so Chris
Johnson has 99 speed and 60 power, Jimmy Graham has a 99 catch radius and 40 blocking,
and Gus Edwards has 38 hands. Some cards are bad on purpose, because a cold spin should
hurt.

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

That runs four suites, and they check more than types.

- **data** looks for duplicate ids, out of range values and thin pools, and it flags
  dead cards, meaning players with no elite trait and no funny weakness. It also measures
  correlation between attributes, so if speed and deep threat ever collapse into the same
  pick, you hear about it.
- **rng** proves the `?seed=` contract. The same seed replays exactly, different seeds
  diverge, and a run serialized mid-game resumes on the same sequence.
- **run** drives the real store through complete games and fuzzes 400 seeds across both
  difficulty modes to prove no run can strand. It also proves the Super Bowl roll cannot
  be re-rolled by refreshing.
- **scoring** plays thousands of games with four bot policies of increasing skill and
  asserts that every accolade gets more likely as you move up that ladder. If careless
  play ever out-earns careful play, it fails.

`src/lib/scoring.ts` is fenced. The weights and gates in there are calibrated against
measured distributions, so if `verify:scoring` fails after new data lands, the data is
wrong rather than the scoring.

## Not affiliated with anybody

This is a fan project. It has nothing to do with the NFL and no team has endorsed it.
Team names are here so you know whose history you are digging through. Every rating was
written by hand for fun and none of it comes from a real scouting source. If you disagree
with a number, you are probably right.
