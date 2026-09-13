# BUILD A 99

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

YOUR BUILDS needs no account, database or environment variables. Builds stay on the
device that saved them.

On wide desktop screens the layout reserves left and right advertisement rails. Ad code can
mount into `#ad-slot-left` and `#ad-slot-right` without changing the game layout.

## What works right now

Solo build mode is playable end to end. Pick a league, pick a position, spin, steal
attributes, and simulate a career. The wheel, the build sheet, the scoring engine, the
accolades and the Super Bowl roll are all in.

**Two leagues, and they are two separate datasets rather than one with a filter on it.**
All-time gives you everybody a franchise has ever had, rated against everybody who has
ever played the position. Current is the separate 2026 Week 1 snapshot. Its card values
start with Madden NFL 27, while its derived categories compare active players at the same
position. A player can therefore have a different all-time card and current card without
either dataset pretending to be the other. The switch is the first thing on the start
screen, above the position, because it decides what everything after it means.

A run picks its league at the start and keeps it. That is stored on the run rather than as
a preference, since a career is scored against the supply of the pools it came out of and
a saved player whose league could drift would re-read his own All-Pro floor against the
wrong one.

Normal mode gives you two rerolls against seven spins, which is enough to walk away from
the two worst landings of a run and not enough to shop. It was one for a while and one
was too close to none. Hard mode gives you none, and it also hides every rating in the
pool: each number renders as a question mark, so you pick a player on his name and the
line under it and take whichever attribute you think is his best, and the number turns up
on your build sheet afterwards. Your own build is never hidden, because a run where you
cannot see what you already have is not harder, it is unplayable.

Every franchise stays in the wheel the whole way in both modes, so landing on the same
roster twice is a legal and fairly common outcome, and in hard mode you have no way to
talk your way out of it.

QUIT in the header walks out of a run from anywhere, including mid spin. Through four
filled slots it leaves immediately, because early in a run there is not much to lose.
From the fifth slot on it asks first, because late in a run there is. It deletes the build
and the autosave with it either way. One button whose caution follows the stakes is clearer
than two buttons that differ only by a dialog.

The start screen opens on whatever you were last playing, so there is no setup tax after
leaving a run or tapping BUILD ANOTHER PLAYER. The setting is stored beside the run rather
than on it, because a run's league is frozen onto the run for
scoring reasons and this is the opposite kind of thing: a preference that has to survive
the events that delete a run. The seed is deliberately not remembered, since a seed is one
specific run and refilling the box with it is the bug where deleting a seed did not delete
the seed.

Naming your player on the report saves him and puts the finished build in YOUR BUILDS.
The list keeps twenty players in that browser, newest first, and opening one replays the
report without sitting through the reveal again.

## The career report

The report opens on the story rather than the rating, and it reads in six numbered
sections: the career, the numbers, the uniforms, the build, the Super Bowl and the
trophy case. The one sentence that says what he actually won is held back until after
the Super Bowl reveal, because printing the ending above the reveal defeats the reveal.

Everything in it is a pure function of the seed. Nothing but the season count is stored,
so opening a player out of your hall next month rebuilds the identical draft slot,
uniforms and stat line without any of it having been written to disk. That is the same
promise the wheel makes: a `?seed=` link gives two people the same player, not merely
the same spins.

**Where he went in the draft** is on the badge under his name, as a round, a pick and an
overall number, or as UNDRAFTED. The board is deliberately a bad guess. It grades an
estimate of a career that has not happened yet, so a 96 usually goes early and sometimes
falls to the third round, and neither is a special case anybody wrote. Roughly a third
of the great ones go after round one, which is about the real rate. Quarterbacks get
reached for and running backs get pushed down, because both of those really happen.

**How long he lasted** is rolled from his overall against how long players at that level
really lasted, per position. Running backs get the shortest window and quarterbacks the
longest, and there is a flameout chance that never quite reaches zero, so a great player
occasionally gets four years and a knee. That is the whole reason durability is not an
attribute any more. See `src/lib/career.ts`.

The curve is centred on 94 and it used to be 91, which was the same mistake in a smaller
size. A sensible run finishes at 95, so a centre of 91 put the entire population above the
middle of the curve and handed a typical build fourteen seasons. Nobody's typical anything
gets fourteen seasons, and the report was quietly using that length to reach believable
career totals out of unremarkable years. A median quarterback lasts eleven now, a back
nine, and the totals barely moved because the seasons underneath them grew.

**What he put up** is simulated season by season, with a rookie ramp, a peak about a
third of the way in and a decline. The bar chart is coloured by whichever uniform he was
in that year, and his best season is called out, because that is the line people
actually quote at each other. The positional record is now the yardage total rather than
a rating threshold, so a player who owns it is holding a number you can see him owning
it with.

Playing time saturates rather than scaling all the way up, and that is what makes the best
season read like a real one. An elite quarterback and a merely good starting quarterback
throw roughly the same number of passes, because there are only so many plays in a season
and both of them are on the field for all of them. What collapses is the bottom, where
backups and rotational pieces get a fraction of the snaps or none. So the volume lines are
anchored on a full season's work for somebody who never comes off the field, a player
reaches that at 95 overall and everything below him loses snaps steeply, and the
difference between a 95 and a 99 shows up in efficiency, touchdowns and years rather than
in six hundred attempts.

**Whose uniforms he wore** is one to four franchises rather than every one you spun,
weighted by which teams actually need the position. Need is read off their own history: a
franchise whose best players at the spot are journeymen is desperate, while one with a
great room is not. That still matters for a 99 because being the best player in the class
does not make a full depth chart disappear.

The team that drafts him usually comes from outside the run. A franchise whose player
supplied one of your traits is only selected as a rare story beat, and the report explains
the exception with a camp injury or a succession plan. Every later stop is selected from
the remaining league by the same positional-need model, so a career is not just the spin
history read back in a different font.

The star rule moved with it. "A player good enough gets extended, so he moves less" was
written at 92, and nine sensible runs in ten finish above 92, so it fired on virtually
everybody and the answer to how many uniforms he wore was one, over and over. It reads 96
now, which is an outlier again.

## The numbers have to be believable

Every stat on the report is simulated, and the whole point of it is that somebody can
read the line and recognise it as a career. So the model is checked against real ones.

It was not, for a while. Production ran off a curve that saturated at an overall of 96,
which meant everything from 92 up produced within a few percent of the same season, and
that season was the best anybody has ever had. A merely good 94 build retired with the
sixth most rushing yards in history. A 96 threw for 5,561 in its best year, which is
eighty yards past the real single season record, and it did that every single time.

Production is convex in rating now and it runs to 99 rather than 96, because the gap
between a good starter and a great one is much bigger than the gap between a replacement
and a bad starter. That pulls the middle of the range down to where real careers sit and
leaves the very top alone. Efficiency is capped at real career averages WITH the trait
bonuses included rather than without them, since that is where the old model went past
what anybody has done: 7.65 yards an attempt at 99 becomes 8.6 once you have stolen the
best deep ball and the best arm in the league, and 8.6 is Otto Graham. A back at 4.6
becomes 5.2 with the best vision and the best burst, and 5.2 is Jim Brown.

A quarterback's rushing was the one number that had no such anchor, and it went exactly
where you would expect a number with no ceiling to go. A build that stole a 99 mobility
retired with a median 8,253 rushing yards against Michael Vick's record 6,109, and a long
career could clear ten thousand. Two things were wrong. The scale had no top, so the
constant was not describing anybody, and the career arc that governs an arm was governing
a pair of legs, which is not how legs work: a passer can throw at 40 and several have, and
nobody runs at 40. Rushing now decays on the absolute season number rather than on the
fraction of a career, so the decline arrives at the same age whether he plays twelve years
or twenty and a long career stops compounding. A 99 mobility sits at exactly the top of
the scale and a maximum build lands a shade under Vick, the same deal the passing record
gets.

THE SEASONS WERE NEVER ANCHORED, ONLY THE CAREERS, and that is the second thing that went
wrong here. Career totals were checked against real ones and passed, so the model looked
finished. Nobody checked a single season. The game reached those believable totals by
handing everybody thirteen to sixteen years of unremarkable football, and the report ended
up printing two different scales on one page: a trophy case saying all-time great and a
stat line saying dependable starter.

Measured, a receiver who won MVP peaked at 85 catches for 1,360. A receiver who passed
Terrell Owens for the all-time record peaked at 88 for 1,408 and got there on sixteen
seasons averaging 1,031. A tight end who made first-team All-Pro caught 60 balls for 840.
Those are good seasons. None of them is the season the trophy beside it is describing.

The fix is the same size in both directions. Careers are about a fifth shorter and prime
seasons about a quarter bigger, so every career total stays where it was and the line on
the screen starts matching the player. Where it lands now, by rating:

```
                overall 90      overall 94       overall 96        overall 99
   QB career    16,319 yds      32,916           42,835            55,146
      best       3,146/23        4,318/33         4,765/38          5,066/43
   RB career     4,377           9,333           11,972            15,737
      best       1,131/11        1,575/16         1,773/19          1,940/23
   WR career     5,155          10,646           14,177            18,204
      best       1,014/7         1,445/11         1,623/13          1,770/15
   TE career     3,246           7,324            9,833            12,859
      best         711/5         1,066/8          1,205/9           1,328/10
```

The second row of each pair is his best season and the touchdowns in it. A 94 receiver
peaks at 95 catches for 1,445 and eleven scores, which is a first-team All-Pro year, and he
does it in a ten season career rather than a thirteen season one.

A 94 is Jim Kelly or Clinton Portis or Michael Irvin. A 96 is Joe Montana or Edgerrin
James or Torry Holt. A 99 lands in the top ten passers and the top five at every other
position, and that is the ONE place this model is allowed to be unrealistic, because you
had to build a perfect player to get there. The single season records are set where real people set them, so 5,477 passing
yards, 2,105 rushing, 1,964 receiving and 1,416 for a tight end are reachable at 99 and
nowhere else.

The record trophies are real career totals now, to the yard, rather than a percentile of
whatever the game happened to produce. You have to pass Warren Moon, Curtis Martin,
Terrell Owens or Shannon Sharpe. That is what makes a seed worth sending somebody.

## On a phone

Test the layout at 390px. You no longer have to force the font first, and that is worth
explaining because the instruction used to be the opposite.

Nothing here loaded a webfont, so `--font-display` fell through Archivo Black and
Haettenschweiler to Arial Narrow. macOS has Arial Narrow and iOS does not, so a phone
rendered the whole game in San Francisco, roughly 13% wider than the machine it was built
on. That is entirely why NAME YOUR PLAYER came off a tester's iPhone reading NAME YOUR
PLAY while it fit fine on the laptop. Every width in the app was quietly a bet on which
font turned up.

Anton is now bundled with the site from `node_modules`, so every device gets the same
letters at the same widths and that whole class of bug is gone rather than worked around.
It is also the right face for this, since a heavy condensed grotesque is what a
scoreboard and a jersey number and a broadcast lower third are all set in.

## Icons

There are no emoji anywhere. Every trophy, the ring, the sound toggle and the little
carets on a player card are hand-drawn SVG in `src/components/Icons.tsx`.

Emoji are somebody else's artwork. Apple, Google and Microsoft each draw them
differently, they carry a glossy style that fights everything around them, and they
cannot take a colour, so a gold trophy sitting on a gold card stayed whatever colour
Apple decided. The icons here are one path each and inherit their colour through
`currentColor`, which is why the same trophy is gold in the case and grey in the missed
list without a second asset existing.

They are drawn on a 24 unit grid and they have to survive being rendered at 14px. Two of
them failed that on the first pass and are worth remembering: a laurel wreath read as an
insect, and a helmet in profile read as a hook. Both got redrawn as the duller, more
obvious shape, which is usually the right answer at this size.

The results screen never tells you what a trophy required. It says how close he came in
words instead. Learning the shape of the thresholds by playing is the point, and 17-0
does not print its own rulebook either.

## The trophies

Five awards and a Hall of Fame, and each one asks a different question.

First-team All-Pro wants a complete player: a high overall with no hole in him. It is the
entry award, and it is the one the whole game is about, because the way you lose it is by
chasing a big number and leaving a hole three spins back.

Where a hole starts is read off the position and the league rather than fixed at one
number. See the tight end section below for why, and `allProFloor` in
`src/lib/scoring.ts` for the argument in full.

Offensive Player of the Year wants peaks instead. It asks for a high overall and a number
of traits at the top of the league, scaled to how many slots your position has. That bar
is 97 in the all-time pools and reads off the supply in any shallower league, which is
`spikeAt` in the same file.

MVP wants both at once, with a harder floor. The record wants a career rather than a
rating, since it is a yardage total and yardage takes years. The Super Bowl is a weighted
coin you cannot build for. The Hall of Fame is any four of those five.

What a sensible player actually walks away with in the all-time pools, measured over 3,000
runs a position. The current league has its own table further down:

```
           All-Pro   OPOY    MVP  record   ring    HoF   slam   nothing at all
    QB        87%     40%    12%    1.5%    65%   8.8%    1.0%      6.2%
    RB        86%     57%    21%    4.1%    68%    16%    2.2%      5.3%
    WR        89%     73%    23%    7.8%    68%    19%    5.3%      4.1%
    TE        67%    8.3%   1.3%    1.7%    56%   1.8%    0.3%     17.5%
```

Quarterback moved when size came OFF its card and it went back to seven picks. The table
above is the seven pick version. All-Pro went 86% to 87%, OPOY 44% to 40%, MVP 13% to 12%
and the Hall of Fame 9.7% to 8.8%, and nothing was retuned to cancel any of it out.

OPOY getting harder is the interesting one, since the award asks for half the card's slots
as spikes and half of seven is three where half of eight was four. Losing a slot should
have made it easier. It did not, because size was the cheapest spike on the quarterback
card: a typical all-time roster offered 97 for it, better than any other slot, so it was
very close to a free one. Dropping the requirement by one and the supply by more than one
nets out harder. That is a good argument for the slot having been weak rather than against
removing it.

Only the record column moved when the seasons were rebalanced, and every other number in
that table came back byte identical, which is the evidence that the change reached the
career model and nothing else. The record is a career total, careers got shorter, so
passing Warren Moon or Shannon Sharpe got harder and passing Terrell Owens got easier,
since the receiver slope had to widen to keep that trophy telling a 95 and a 97 apart at
all. The thresholds themselves were not touched. They are still four real careers.

All-Pro sitting near 90% is not a broken gate. You built a player out of the best trait on
seven different rosters, so of course he is good. What should be rare is being the best
there has ever been, and that is the bottom half of the table: a record one run in twenty,
a Hall of Fame call one in six, a grand slam one in thirty.

Every one of those went up when normal mode went to two rerolls, and none of the overall
gates was moved to pull them back down. A second reroll was asked for in order to make
the game kinder, and quietly raising the bar to cancel it out is a way of refusing while
looking like agreement. The record thresholds are the exception and they moved for a
different reason: 40% of backs owning the all-time rushing record is not a difficulty
setting, it is a factual absurdity.

THERE USED TO BE A PRO BOWL AND IT WAS DELETED. It fired on 99.9% of sensible running
back runs, which makes it a participation line rather than an award, and once the entry
trophy is free nothing above it means anything either. Five trophies that mean something
beat six where one is free.

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

Two more, both asked for by the same player. Nothing on screen calls the pool "the men"
any more, it says players, because "only the men on the current roster" is a sentence
somebody quoted back twice. And the league switch no longer says ratings are "judged
against the league today", which named a comparison without ever saying where the names
come from. Current mode is tied to an explicit roster snapshot instead: 2026 Week 1. A
later week requires a deliberate roster reconciliation and a new dated release; the
static app does not promise an automatic weekly feed.

`npm run verify:copy` enforces all of this on anything a player can read, which now
includes the two lines the store says out loud when a run deadlocks or a spin comes back
free. Those went unchecked for months because they live in the store rather than a
component. If you write a sentence somebody will see on screen, put the file it lives in
on one of the lists at the top of `scripts/verify-copy.ts`.

## The name, and the storage keys

The game was called MEGATRON, then GridironLab, and is now called Build a 99. Megatron
reads as a receiver game and this one has four positions in it.

The localStorage keys did NOT move. They are `megatron.run.v1` for the autosaved run and
`megatron.hall.v1` for saved players. A key is the address of somebody's data rather
than player-facing copy, so renaming it strands every half finished run and every saved
player currently sitting in a browser. Calvin Johnson's blurb still says Megatron too,
since that is his name.

## The data

The 1000 all-time ratings are hand written and subjective. The current-player cards are a
separate, source-backed dataset: the names come from the 2026 Week 1 active depth charts
and the ratings come from EA SPORTS Madden NFL 27 launch ratings.

**A current room is the active 53-man depth chart and nothing else.** Practice squad,
injured reserve, PUP, NFI, reserve and suspended players are excluded. A one-game injury
designation does not erase an active roster spot, so an active player listed Out for Week
1 remains in the pool unless he was moved to a reserve list.

**Padding to six was tried and the padding is what broke it.** Filling every room meant
reaching back a few seasons, and reaching back put Aaron Rodgers on the Packers in a league
where he plays for Pittsburgh. A mode whose entire promise is "the men on a roster now"
cannot ship a card that says otherwise, whatever it does for the pool sizes.

Direct Madden fields keep their source value below the elite tier. Categories that do not
exist as one Madden field use documented averages. For example, contested catch averages
Catch in Traffic, Spectacular Catch and Jumping, then translates the result onto the
game's shared scale with 50 held as the neutral point. Madden determines every ordering.

At the very top, the best three distinct source tiers at quarterback and the best two at
running back, receiver and tight end display as 99. That small position-relative tier is
what makes a literal seven-99 Current build possible without inventing players or changing
who leads a category. There is no scoring shortcut: Current and All-Time both go through
the same weighted-mean and weak-link formula, and every qualifying card shows the number
it contributes. The complete card formula is in `scripts/current-rating-model.ts`;
`npm run verify:current` proves each position has a legal seven-player path, and
`npm run verify:99` proves the real wheel keeps it rare.

Player ids are unique across BOTH datasets, since a run stores the ids it has spent and a
saved player keeps them forever. Current rows carry a `now-` prefix for that reason, and
where two men on one roster share a surname the id carries the first name too.

### Refreshing the current pools

Rosters move, so each current-mode release is tied to a dated snapshot. The present one
is 2026 Week 1, reconciled between ESPN's roster/depth-chart feeds and PFN's all-team depth
charts. `npm run rosters` prints every room in the same shape a depth chart is in:

```bash
npm run rosters -- QB     # one position at a time reads best
```

Three rules make the reconciliation almost mechanical:

**A card is the man, not the slot.** When somebody signs elsewhere his ratings travel with
him, so a transfer is a card moving between rooms rather than a rewrite. There is no card
left behind, because a pool that holds only current players has nowhere to put one.

**A room is as deep as the depth chart says**, and that is a hard rule rather than a target.
Two quarterbacks is a room of two. A man who signs elsewhere is deleted rather than demoted,
nobody on the practice squad is in the file, and nobody is ever added to round a room up.
`npm run verify:data` asks all-time for six per franchise and current for one, for exactly
this reason.

**Reserve status, not a one-week game designation, decides eligibility.** Injured reserve,
PUP, NFI, Reserve/Left Squad, suspension and the practice squad are out. Players who still
hold an active-roster spot remain in even when the Week 1 injury report says Out. That is
why Josh Jacobs is included, Brandon Aiyuk is excluded, and a temporary practice-squad
elevation such as Lan Larison is not treated as a 53-man roster spot.

**Read the depth chart twice, from two sources.** The first sweep put seven men in the file
who should not have been there: five on injured reserve, one on a practice squad, and a
receiver filed at tight end. Every one of them came from a page reader folding the Reserves
block into the active list, and none of them tripped a single check, because a card for a
man on IR is numerically ordinary. Cross-checking PFN against ESPN caught the category
errors, and official club roster pages resolve any disagreement.

**A blurb travels with the card, so read it after a move.** The checks will catch two cards
making the same joke and cannot catch a line about the wrong building, which is how Kirk
Cousins arrived in Las Vegas still talking about Atlanta.

`scripts/fixtures/current-week-1.json` freezes the roster and the Madden inputs used for
every card. `npm run verify:current` rebuilds every displayed value from that fixture and
fails on any roster or rating drift. To intentionally update a newly audited roster,
download the official EA pages and run:

```bash
npm run sync:current-ratings -- /path/to/madden-html
```

### Reading the boards, which is the check no check can do

`npm run leaders` prints the top five at every trait for a position and then asks the same
question backwards: which of the highest rated cards at this position are top five in
nothing? It passes and fails nothing. It exists because `npm run verify:data` proved these
pools were spiky, uncorrelated and correctly scaled while a receiver was filed at tight end
and five players on injured reserve were still in the file. A wrong name at the top of a
list is obvious to a person and invisible to an assertion.

The backwards pass is the useful half, and it comes with a rule: **a name it prints is
either underrated by the source model or best at something the card has no slot for, and
you have to say which.** It is an audit prompt, not permission to hand-edit a favorite into
the leaders. If the source data and formula support the order, the card stays. If the card
contradicts them, the source mapping or the category formula changes and the fixture check
records the consequence.

Every position is seven picks now. They were uneven for a while, on the theory that a
shorter build is a harder build, and tight end drew the short straw twice over: five
slots out of the thinnest pool in the game.

**Size went on and deep threat came off.** Deep threat was too narrow to be one of seven
picks at receiver. Most of the receivers anybody wants are not deep threats and most of
the ones who are get picked for that alone, so the slot kept handing out a niche instead
of a receiver. Size is the first thing anybody says about a receiver, it separates
cleanly from speed, and it is what you give up when you take the burner. It went on the
running back and the tight end for the same reason: a 250 pound back and a 190 pound
back are not the same player even when they run the same speed.

**Size also went on the quarterback and has now come back off.** A player put it in one
line: you do not need size for a quarterback. He is right, and the argument for it does
not survive being read again. A six foot six pocket passer and a five foot ten one are
already separated by pocket presence and mobility, which are two picks people genuinely
spend a spin on, so size was a slot with no decision in it. Nobody ever weighed a 99 frame
against a 99 arm.

Two things that looked like defences turned out to be the case against it. It correlated
with nothing else on the card, which is what a slot has to do to earn its place, and it
also moved nothing on the report, which `npm run verify:career` says out loud: what a big
passer actually buys is the sneak and the hit he gets up from, and this game tracks
neither. A number that moves with nothing and moves nothing is a spin somebody spent for
no reason.

It stays on the other three, where it is a real trade against speed. Quarterback plays
seven picks again and so does everybody else.

**Tight end also got toughness**, which took it from five slots to seven. It is the one
position where being willing to get hit is a skill rather than a compliment, and it is
not blocking wearing a different hat. Antonio Gates played on a torn plantar fascia and
never blocked anybody. Across the pool the two correlate at 0.67, which is entangled the
way football is entangled rather than the way a lazy pool is.

Tight end is still the hardest position and the seven slot pass is not what fixed it. See
the tight end section below.

**Three attributes were deleted and none of them is coming back.** Contact balance moved
with power at 0.93 correlation and catch radius said what hands and contested work
already say between them, so both were slots that were really one pick. The independence
check had been warning about the first one for months, and deleting the attribute is the
right end of that problem to fix it from rather than raising the ceiling in the check.

Durability left for a different reason. It was not redundant, it was the wrong shape:
availability is not a trait you shop for off somebody else's career, it is what happens
to yours. Removing it also removed the scarcest slot in the game and therefore the main
source of holes, which lifted every rating about a point and cost a full recalibration
of the gates. That is written up in `src/lib/scoring.ts`.

Attribute KEYS in the data files are load-bearing across every player row, the scoring
weights and the whole verification suite. The words on screen come from
`ATTRIBUTE_LABELS` in `src/data/types.ts`, so a label that reads wrong gets fixed there
rather than by renaming a key. That is why the key is still `hands` while the screen says
CATCHING, still `processing` while the screen says READS, and still `burst` while the
screen says ACCELERATION.

## The current league is a harder league, and the gates read that off the supply

The gates are written as one set of numbers and calibrated once, against the all-time
pools. What changes between leagues is what those pools can hand you, and by 2026-09-09
three things in `src/lib/scoring.ts` read that rather than assuming it: the All-Pro floor,
the overall gates, and OPOY's spike bar. All-time is the reference league and every one of
them returns it untouched.

The difference is structural rather than a rating anybody can fix. An all-time franchise
pool is the seven or eight most memorable players in seventy years at that position. A
current pool is the men on the depth chart this morning, which is two or three at
quarterback. Averaged across the card's slots, a typical all-time quarterback room offers
93.6 and a current one offers 90.1, so every gate written against the first number was
quietly asking the current league for something it does not stock.

`gateShift(position, era)` is that shortfall, rounded toward zero and never allowed to go
positive, and the three overall gates drop by exactly it. It comes back at 3 for
quarterback, 3 for running back, 1 for receiver and 0 for tight end, and tight end
returning zero is the evidence the statistic is reading something real: it is the one
position whose rooms were already the size of a real one.

Quarterback used to read 4 and reads 3 since size came off the card. Nobody touched this
function to do that: size was the thinnest slot the current quarterback rooms had, at 86
against 97 all-time, so it was contributing most of the shortfall on its own. Removing a
slot that one league stocks and the other does not narrows the gap between them, and the
number followed. The All-Pro floor moved with it, from 86 to 88, for the same reason and
by the same route.

OPOY needed the same treatment for a reason that is not obvious from the ratings. The
current pools are SPIKIER per player than the all-time ones, 0.26 traits at 97 or better per
quarterback against 0.12, and OPOY still fell under one run in a hundred. The statistic
that explains it is per room rather than per player: an all-time quarterback room answers
one slot of the card at 97 and a current room of two or three answers none, and you only
visit seven franchises. So `spikeAt` drops the bar to the highest number at which a typical
room in this league answers as many slots as a typical all-time room answers at 97. It
lands on 96 for current quarterback, receiver and tight end, and stays at 97 everywhere
else.

Measured over 3,000 sensible runs a position:

```
                 All-Pro   OPOY    MVP  record   ring    HoF   slam   nothing at all
    QB all-time     87%    40%     12%    1.5%    65%   8.8%   1.0%       6%
    QB now          72%    33%     10%      0%    49%   6.3%     0%      17%
    RB all-time     86%    57%     21%    4.1%    68%    16%   2.2%       5%
    RB now          83%    39%     25%    0.2%    56%    11%   0.2%       9%
    WR all-time     89%    73%     23%    7.8%    68%    19%   5.3%       4%
    WR now          75%    67%     30%    1.2%    65%    22%   0.9%       9%
    TE all-time     67%   8.3%    1.3%    1.7%    56%   1.8%   0.3%      18%
    TE now          61%   5.9%    0.5%    1.1%    56%   1.1%   0.2%      20%
```

**The record did not move and is not going to.** It is a real career total, the one number
on the report that is a claim about football rather than about this game, and a league two
or three men deep per room passing Warren Moon would be the game lying about something a
reader can check. That is why the record column reads 0% at quarterback and the grand slam
with it, and the trophy case being completable in one league and not the other is
information rather than a gap: it says all-time is where the ceiling lives, which is the
reason to reach for the switch at all. Everything else is within reach of a well-played run
in either league, which is the bar this project holds a mode to.

If that ever grates, the fix is not to lower the threshold. It is to make the record line on
the report say what the run would have needed instead of only showing a miss.

**MVP fires more often in the current league than in the all-time one at two positions**,
which is the part of this table that is not yet right. It used to be three, and quarterback
came off the list for a reason worth reading, because nobody fixed it on purpose.

The cause is that a shift is a translation and the two distributions are not translations of
each other. The current spread is wider at the bottom and shorter at the top, so when both
gates move down by the same amount the compressed top collapses the distance between them,
and the entry trophy ends up sitting a point or two under the best player in the league
instead of four. It wants a scale rather than an offset. Nothing has been nudged by hand to
hide it, because a number picked to make a rate look right is the failure this whole section
exists to avoid.

Quarterback stopped showing it when size came off the card and the shift went from 4 to 3.
All-Pro and MVP now sit 4 apart at 89 and 93, which is the same distance they sit apart in
the all-time pools, and current quarterback MVP fell from 25% to 10% against all-time's 12%.
That is the shift being smaller, not the compression being solved: running back is still
shifted by 3 and still inverted, 25% against 21%, and receiver is inverted at 30% against
23% on a shift of only 1. The scale is still the fix. The quarterback case is now evidence
of what causes it rather than an example of it.

**Receiver holds up best**, because six receivers who actually play is a normal roster.
The start screen leaves these differences to the game instead of labeling positions in
advance.

## Tight end, and the one gate that reads the position

Tight end used to end a sensible run with an empty trophy case 28% of the time against 4
to 9% everywhere else. Half of that was the game's fault and it is fixed. The rest is the
position being genuinely harder and it is staying.

The seven slot pass was supposed to fix it and did not, moving 37% to 28%, most of which
was really the second reroll. The cause was in the supply. A typical tight end roster
offers 86 for YAC and 88 for route running, while first-team All-Pro asked for nothing
under 92. Two slots on the card could not be filled to the bar off a normal roster, so the
position lost the entry award for a reason that had nothing to do with how well you
played. A gate you cannot clear by playing well is not difficulty. It is a bug wearing a
difficulty costume.

So the All-Pro floor is read per position now. It is the league standard of 92 unless the
thinnest slot on that position's card cannot supply 92, in which case it is what that slot
supplies. Nothing here was picked:

```
    QB  mobility     90   the statue is a real card and always has been
    RB  juke         92   unchanged, and this is why 92 was right in the first place
    WR  release      92   unchanged
    TE  yac          86
```

Running back and receiver coming back at exactly 92 is the evidence that 92 was this
statistic all along rather than a number somebody liked. Quarterback moved from 92 to 90
and its All-Pro rate went 79% to 87%, because the median roster offers 90 mobility and a
92 floor was quietly asking every pocket passer to go and find a scrambler. Tight end goes
to 67% All-Pro and 17.5% empty.

`npm run verify:scoring` asserts each floor equals that derivation and fails if one is
ever hand-picked, so if the tight end pool gets deeper the floor rises on its own and the
exception dissolves without anybody editing it.

**Everything above All-Pro stays position blind**, and that is not an oversight. OPOY at
8% and MVP at 1% for tight end come from the position producing 0.15 traits at 97 or
better per player against 0.26 at receiver, counting every card in the all-time pool. That
is a real fact about tight end history, and no gate should paper over it.

### What a nearly perfect current tight end actually earns

A player posted a seven for seven current tight end, 99 catching, 98 route running, 99
YAC, 98 toughness, 97 size, 96 blocking and 93 speed, which averages 97.1. It missed the
Hall of Fame and he asked what more he was supposed to do. That is a fair question and the
results screen is never going to answer it, so `npm run ceiling` does. MEASURED, NOT FIXED:
nothing below has been adjusted.

```
  overall 96, six traits at the spike bar
  All-Pro 100%   OPOY 100%   MVP 0%   record 37%   ring 73%   Hall of Fame 27%
```

**MVP was lost on the floor and not on the overall.** MVP asks for 96 with nothing under
95, and he finished on exactly 96. The 93 speed is the whole of it. Raising that one number
to 95 and changing nothing else takes him to overall 97, MVP 100% and the Hall of Fame 93%,
because the Hall counts four of five and MVP is the fourth. Without it he has to win both
the record and the ring, which is a 27% parlay.

**Two points of speed is not a small ask at this position.** Five of the 32 current tight
end rooms carry a 95 anywhere, and one carries a 99. So the honest answer to what he has to
do is: land on one of five specific rooms and spend his speed pick there.

**The gate shift did not reach tight end the way it reached quarterback, and that is
correct arithmetic rather than a bug.** `gateShift` measures a league against the SAME
position in the reference league, and current tight end supplies 90.9 where all-time tight
end supplies 91.1, so it returns 0 and every gate keeps its calibrated number. It is saying
the true thing: current tight end is no thinner than all-time tight end. What it structurally
cannot say is that tight end sits below the other positions in BOTH leagues, because the
reference it reads is per position by design.

The measurable consequence is worth writing down even though nothing was changed for it.
Counting rooms that can fill a slot to the MVP floor, the median position by slot is:

```
    QB   11 of 32 rooms      RB   12 of 32
    WR   15 of 32            TE    5 of 32
```

Tight end clears its own MVP floor in a third as many rooms as anywhere else. Whether that
is the position being hard or a gate being wrong is a design decision rather than a
measurement, and this project has already made it once: everything above All-Pro stays
position blind. This section is here so that the next person to reopen it argues with the
numbers rather than with a rate.

### Is a 99 overall reachable?

Yes at all four positions, and Current mode now requires a genuine scoring path rather
than a special 99 override. The source-led elite tier displays as 99 on its cards: the top
three distinct source values for a quarterback trait and the top two for every other
position. A perfect Current build therefore shows seven 99 picks from seven different
players, has a raw and weighted average of 99, and reaches 99 through the ordinary overall
formula used by All-Time mode. Its weak-link score is 99 too; the scale has no hidden
hundredth point above what the cards can show.

Reachable is not the same as common. A run must land on a qualifying room and spend the
right pick there seven separate times without reusing a player. `npm run verify:current`
constructs one seven-99 legal path for each position, while `npm run verify:99` calculates
the exact odds and keeps them rare enough for a leaderboard result to mean something.

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

That runs seven suites, and they check more than types.

Everything below runs over BOTH leagues. That is not a formality: the current pools were
written in one sitting about players everybody has just watched, which is exactly where two
traits quietly collapse into one pick because the same handful of adjectives get reached
for all afternoon. The check caught it three times, on power and size at running back, on
contested catch and size at receiver, and on hands and route running at tight end.

- **data** looks for duplicate ids, out of range values and thin pools, and it flags
  dead cards, meaning players with no elite trait and no funny weakness. It also measures
  correlation between attributes, so if speed and size ever collapse into the same
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
  play ever out-earns careful play, it fails. It also reports what careers this pool
  actually produces, which is what the record thresholds are placed against. The policies
  spend both rerolls, and that is load bearing rather than a detail: for most of this
  project's life they spent none, so every gate in the game was calibrated against a run
  played with zero rerolls while a person had three. A fifth policy plays hard mode blind,
  so the harness cannot report normal mode rates under a heading a hard mode player would
  read as his own. It also prints how often each policy finishes with NOTHING in the
  trophy case, which is the number a player feels and the one no per-award rate shows
  you. It runs every position in BOTH leagues, which makes it the instrument that says
  whether the current ratings were written on the same scale as the all-time ones: the
  gates are identical in both, so anything that moves a rate is the data rather than the
  scoring. The all-time seeds are deliberately left exactly as they were, since a seed is
  the whole run and putting a league into them resampled every number this file documents.
- **career** drives the length, draft, uniform and stat models tens of thousands of times
  each, and since the near-miss sentences moved into `src/lib/narrative.ts` it drives
  those too. The trophy case printed the same excuse under two different awards, because
  three of them shared one ladder of phrases and their thresholds sit close enough
  together that most builds miss them by a similar margin. The check sweeps every overall
  and asserts no two awards ever hand the same player the same reason. Three kinds of assertion, and the third is the one worth having. Structural ones
  cannot be argued with: stints have to add up to the career, a pick has to land in a
  round that exists, a best season has to be one of the seasons. Directional ones are the
  design: a better player lasts longer, goes earlier, produces more and moves teams less.
  And the tails, which are what a plausible looking model quietly loses, so they are
  asserted from both ends. A draft where every good player goes early is not a draft, and
  a league where nobody's knee ever goes is not a league. Both of those pass every
  directional check ever written.

  Six deliberate mutations were run against this suite and two of them walked straight
  through it, which is the only reason it is worth trusting now. A monotonicity check
  written with `<` accepted a career length that ignored the rating entirely, because a
  flat line is not less than a flat line. And a check on interceptions compared them
  across ratings when the claim was about one man's own seasons, so it never touched the
  thing it was named after. Both are fixed and both mutations now fail it.
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

### Two tools that check nothing

`npm run leaders` and `npm run ceiling` print rather than assert, and that is the point of
them. The suite above proves the pools are internally consistent and it cannot tell you a
name is wrong or a bar is unreachable, which are the two ways this project has actually
shipped bugs.

```bash
npm run leaders            # top five at every trait, then who is top five in nothing
npm run leaders -- TE      # one position
npm run leaders -- alltime # the other league
npm run ceiling            # what a perfect build earns, and whether 99 is reachable
```

`npm run rosters` is the third of these and it is for the weekly depth chart reconciliation.

`src/lib/scoring.ts` is fenced. The weights and gates in there are calibrated against
measured distributions, so if `verify:scoring` fails after new data lands, the data is
wrong rather than the scoring.

## Not affiliated with anybody

This is a fan project. It has nothing to do with the NFL and no team has endorsed it.
Team names are here so you know whose history you are digging through. All-Time ratings
were written by hand for fun; Current ratings are derived from the source model documented
above. None of it is a real scouting source. If you disagree with a number, you are
probably right.
