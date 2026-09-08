import type { Player } from '../types';

/**
 * TIGHT END ROOMS AS THEY STAND NOW. Rules are in ./qb.ts.
 *
 * TIGHT END IS THE HARD ONE IN BOTH LEAGUES, and for slightly different reasons. The
 * all-time pool is thin because the position has produced very few great players in
 * seventy years. This one is thin because a real roster carries three of them and the
 * third is a blocker who catches four passes a season.
 *
 * What it is NOT short of any more is the top end. Brock Bowers, Trey McBride and George
 * Kittle are rated here the way the all-time file rates Gonzalez and Gates, because
 * against the men playing now that is exactly where they sit.
 *
 * Row format:
 *   [id, name, years, blurb, HND, BLK, SPD, RTE, YAC, TGH, SZE]
 */
type Row = [string, string, string, string, number, number, number, number, number, number, number];

const POOLS: Record<string, Row[]> = {
  ari: [
    ['now-ari-mcbride', 'Trey McBride', '2022–', 'Catches 110 passes a year and nobody outside the desert has noticed.', 97, 84, 82, 94, 88, 92, 88],
    ['now-ari-higgins', 'Elijah Higgins', '2023–', 'Was a receiver at Stanford until somebody handed him a tight end jersey.', 84, 74, 88, 80, 80, 78, 86],
    ['now-ari-reiman', 'Tip Reiman', '2024–', 'Third round pick who was drafted to block and does nothing else.', 74, 94, 78, 62, 62, 92, 92],
    ['now-ari-vokolek', 'Travis Vokolek', '2024–', 'Plays eight snaps a game and every one of them is a running play.', 74, 86, 74, 70, 64, 84, 90],
    ['now-ari-seikovits', 'Bernhard Seikovits', '2021–', 'Austrian who had never played football and made an NFL roster.', 76, 82, 78, 60, 66, 82, 88],
    ['now-ari-ertz', 'Zach Ertz', '2021–2022', 'Two seasons here in the middle of a career that belongs elsewhere.', 92, 76, 74, 90, 70, 84, 88],
  ],
  atl: [
    ['now-atl-pitts', 'Kyle Pitts', '2021–', 'Went fourth overall, had a 1,000 yard rookie year, and has chased it since.', 84, 66, 92, 90, 78, 76, 94],
    ['now-atl-woerner', 'Charlie Woerner', '2024–', 'Blocks for a living and has never been asked to run a real route.', 72, 94, 74, 60, 62, 90, 88],
    ['now-atl-dwelley', 'Ross Dwelley', '2024–', 'Seven years as the third tight end, which is a career nobody plans.', 76, 84, 72, 72, 66, 82, 86],
    ['now-atl-franks', 'Feleipe Franks', '2021–2023', 'Was a starting quarterback in the SEC and converted at 24.', 72, 84, 80, 68, 70, 86, 92],
    ['now-atl-kalinic', 'Nikola Kalinic', '2025–', 'Made this roster on kick coverage, which is a real career if you can do it.', 70, 84, 76, 68, 64, 84, 88],
    ['now-atl-hurst', 'Hayden Hurst', '2020', 'Had the best year of his career in Atlanta and left for the money anyway.', 90, 66, 82, 82, 76, 80, 86],
  ],
  bal: [
    ['now-bal-andrews', 'Mark Andrews', '2018–', 'Type one diabetic, and he is the leading touchdown scorer in club history.', 92, 74, 78, 92, 76, 88, 90],
    ['now-bal-likely', 'Isaiah Likely', '2022–', 'Fourth round pick who would start for about twenty other teams.', 90, 76, 88, 86, 88, 84, 88],
    ['now-bal-kolar', 'Charlie Kolar', '2022–', 'Iowa State record holder who blocks on the goal line and plays special teams.', 84, 88, 74, 70, 66, 88, 94],
    ['now-bal-ricard', 'Patrick Ricard', '2017–', 'Plays fullback and defensive tackle, and has made five Pro Bowls doing it.', 68, 97, 66, 58, 60, 97, 97],
    ['now-bal-mitchellpaden', 'Zaire Mitchell-Paden', '2024–', 'Six foot five, and he has lived on the practice squad for two years.', 74, 84, 76, 70, 64, 82, 92],
    ['now-bal-boyle', 'Nick Boyle', '2015–2022', 'Eighteen catches a year for eight years, and the city adored him for it.', 74, 96, 66, 66, 60, 94, 92],
  ],
  buf: [
    ['now-buf-knox', 'Dawson Knox', '2019–', 'Scored in January the week after his brother died and pointed at the sky.', 84, 92, 80, 78, 74, 94, 90],
    ['now-buf-kincaid', 'Dalton Kincaid', '2023–', 'First round pick who runs routes like a slot receiver and drops too many.', 78, 66, 86, 92, 82, 76, 84],
    ['now-buf-hawes', 'Jackson Hawes', '2025–', 'Fifth round rookie brought in to block, and he is very good at it.', 76, 94, 74, 62, 62, 90, 90],
    ['now-buf-davidson', 'Zach Davidson', '2024–', 'Was a punter in college who is now six foot seven and catching passes.', 74, 82, 80, 70, 66, 82, 96],
    ['now-buf-morris', 'Quintin Morris', '2021–', 'Undrafted from Bowling Green who has made five rosters on toughness.', 76, 88, 78, 72, 68, 92, 86],
    ['now-buf-morrisx', 'Quintin Morris Jr.', '2025–', 'A camp body who spends August catching passes from the third quarterback.', 72, 80, 76, 68, 64, 80, 86],
  ],
  car: [
    ['now-car-jtsanders', 'Ja\'Tavion Sanders', '2024–', 'Catches everything thrown near him and puts a shoulder into nobody.', 90, 62, 88, 82, 84, 78, 86],
    ['now-car-granger', 'Tommy Tremble', '2021–', 'Drafted for the run game alone, and he has been excellent at it.', 80, 92, 82, 62, 74, 90, 86],
    ['now-car-evans', 'Mitchell Evans', '2025–', 'Notre Dame captain taken in the fifth to do the dirty work.', 78, 88, 76, 74, 68, 88, 90],
    ['now-car-mitchell', 'James Mitchell', '2024–', 'Eleven catches in four years, and he keeps making the team anyway.', 76, 84, 78, 72, 70, 84, 86],
    ['now-car-tremble', 'Colin Granger', '2025–', 'Played college basketball until 2023 and is learning this in public.', 80, 76, 84, 66, 70, 78, 94],
    ['now-car-thomas', 'Ian Thomas', '2018–2023', 'Six seasons here as the blocking tight end nobody ever threw to.', 72, 92, 78, 70, 66, 88, 88],
  ],
  chi: [
    ['now-chi-kmet', 'Cole Kmet', '2020–', 'Does the unglamorous half of the job well and catches 60 balls doing it.', 88, 88, 78, 82, 72, 88, 90],
    ['now-chi-loveland', 'Colston Loveland', '2025–', 'Tenth overall pick who was the best route runner in his draft.', 90, 72, 88, 94, 84, 80, 90],
    ['now-chi-smythe', 'Durham Smythe', '2025–', 'Has never had 40 catches in a year and has never needed to.', 82, 94, 72, 68, 64, 90, 88],
    ['now-chi-carlson', 'Stephen Carlson', '2024–', 'Undrafted, tore a knee, came back, and is still on a roster.', 76, 84, 76, 72, 68, 88, 86],
    ['now-chi-wilson', 'Joel Wilson', '2025–', 'Central Michigan tight end who is here to block on kickoffs.', 72, 86, 74, 68, 64, 86, 86],
    ['now-chi-graham', 'Jimmy Graham', '2020–2021', 'Arrived at 34 and still got open in the corner of the end zone.', 86, 58, 76, 78, 66, 66, 97],
  ],
  cin: [
    ['now-cin-gesicki', 'Mike Gesicki', '2024–', 'Played basketball until he was 20 and blocking has never entered into it.', 88, 56, 86, 86, 74, 74, 92],
    ['now-cin-fannin', 'Mike Fannin', '2025–', 'Broke the record for catches by a tight end in college and went in the third.', 90, 70, 82, 86, 88, 82, 84],
    ['now-cin-sample', 'Drew Sample', '2019–', 'Second round pick used entirely as a blocker for seven seasons.', 80, 94, 72, 66, 64, 92, 88],
    ['now-cin-hudson', 'Tanner Hudson', '2023–', 'Undrafted, played in three other leagues, and turned up here at 29.', 88, 64, 78, 80, 78, 80, 84],
    ['now-cin-grandy', 'Cam Grandy', '2025–', 'Illinois State tight end who is here to catch passes in August.', 78, 78, 76, 74, 70, 80, 88],
    ['now-cin-uzomah', 'C.J. Uzomah', '2015–2021', 'Took six years to become useful and then got paid by somebody else.', 80, 88, 74, 72, 72, 82, 94],
  ],
  cle: [
    ['now-cle-njoku', 'David Njoku', '2017–', 'Ran into a burning house to save a child, and he catches everything now.', 92, 74, 90, 84, 88, 94, 88],
    ['now-cle-fannin', 'Harold Fannin Jr.', '2025–', 'Set a college record for the position that had stood since the seventies.', 88, 68, 82, 90, 90, 84, 82],
    ['now-cle-whiteheart', 'Blake Whiteheart', '2024–', 'Wake Forest tight end who has never caught a professional pass.', 72, 86, 76, 70, 64, 86, 88],
    ['now-cle-bates', 'Brenden Bates', '2025–', 'Kentucky blocker signed off the street in September.', 70, 90, 74, 66, 62, 88, 86],
    ['now-cle-hooper', 'Austin Hooper', '2020–2021', 'Was paid to be a star here and quietly went back to being useful.', 88, 80, 76, 84, 72, 84, 88],
    ['now-cle-akins', 'Jordan Akins', '2023–2024', 'Hit .217 in the minor leagues for six years and then tried this instead.', 84, 66, 88, 78, 76, 78, 84],
  ],
  dal: [
    ['now-dal-ferguson', 'Jake Ferguson', '2022–', 'Fourth round pick whose grandfather coached the Packers to a Super Bowl.', 90, 80, 76, 88, 74, 90, 88],
    ['now-dal-schoonmaker', 'Luke Schoonmaker', '2023–', 'Second round pick who has been the second tight end for three years.', 80, 86, 78, 76, 70, 84, 88],
    ['now-dal-spannford', 'Brevyn Spann-Ford', '2024–', 'Six foot seven and undrafted, and he made the roster on blocking.', 74, 92, 72, 68, 62, 90, 97],
    ['now-dal-fant', 'Princeton Fant', '2025–', 'Played four positions at Tennessee and none of them especially well.', 74, 84, 78, 70, 68, 84, 84],
    ['now-dal-stephens', 'John Stephens Jr.', '2024–', 'Louisiana Tech receiver who was moved to tight end and back again.', 80, 64, 88, 74, 76, 78, 84],
    ['now-dal-schultz', 'Dalton Schultz', '2018–2022', 'Nobody wanted him out of Stanford and he has started for a decade.', 88, 82, 74, 84, 70, 86, 88],
  ],
  den: [
    ['now-den-engram', 'Evan Engram', '2025–', 'Signed at 31 to be a slot receiver wearing a tight end number.', 90, 62, 92, 90, 88, 76, 82],
    ['now-den-trautman', 'Adam Trautman', '2023–', 'Third round pick who has settled into blocking and never complaining.', 82, 92, 74, 68, 66, 90, 90],
    ['now-den-krull', 'Lucas Krull', '2023–', 'Played two other sports at Florida before anybody handed him this one.', 80, 78, 82, 76, 74, 82, 92],
    ['now-den-adkins', 'Nate Adkins', '2023–', 'Twelve snaps a game, all of them on first and second down.', 74, 88, 76, 70, 66, 88, 86],
    ['now-den-lohner', 'Caleb Lohner', '2025–', 'Played four seasons of college basketball and caught his first pass at 24.', 82, 74, 84, 64, 70, 78, 92],
    ['now-den-fant', 'Noah Fant', '2019–2021', 'Twentieth overall pick who ran a 4.5 and blocked absolutely nobody.', 76, 62, 94, 82, 84, 72, 88],
  ],
  det: [
    ['now-det-laporta', 'Sam LaPorta', '2023–', 'Broke the rookie tight end record and blocks like he was raised on a farm.', 94, 84, 86, 90, 88, 92, 86],
    ['now-det-wright', 'Brock Wright', '2021–', 'Nobody drafted him and he has started January games as an extra lineman.', 76, 92, 76, 72, 68, 90, 88],
    ['now-det-zylstra', 'Shane Zylstra', '2021–', 'Was a receiver at a Division II school and caught three touchdowns one day.', 80, 80, 78, 74, 70, 82, 86],
    ['now-det-yeboah', 'Kenny Yeboah', '2025–', 'Fifth year on a practice squad somewhere, and he keeps getting calls.', 78, 82, 80, 74, 70, 82, 86],
    ['now-det-hockenson', 'T.J. Hockenson', '2019–2022', 'Eighth overall pick who was very good here and traded inside the division.', 90, 82, 80, 88, 76, 86, 88],
    ['now-det-dwelley', 'Ross Dwelley Jr.', '2025–', 'A camp arm target who has never been active on a Sunday.', 72, 80, 74, 68, 64, 80, 84],
  ],
  gb: [
    ['now-gb-kraft', 'Tucker Kraft', '2023–', 'Finishes every catch by lowering a shoulder into whoever arrives first.', 90, 86, 84, 84, 94, 92, 88],
    ['now-gb-musgrave', 'Luke Musgrave', '2023–', 'The training room has seen a great deal more of him than the field has.', 76, 74, 90, 86, 80, 74, 88],
    ['now-gb-deguara', 'Josiah Deguara', '2020–2022', 'Lined up in three different places on the same drive, most weeks.', 76, 88, 78, 72, 72, 88, 80],
    ['now-gb-sims', 'Ben Sims', '2023–', 'Undrafted from Baylor and blocks well enough to keep dressing.', 74, 90, 76, 70, 66, 88, 86],
    ['now-gb-fitzpatrick', 'John FitzPatrick', '2024–', 'Georgia blocker who has caught two passes in three seasons.', 70, 88, 74, 66, 62, 86, 90],
    ['now-gb-lewis', 'Marcedes Lewis', '2018–2022', 'Blocked for eighteen professional seasons and made a Pro Bowl at 24.', 78, 97, 62, 68, 58, 96, 97],
  ],
  hou: [
    ['now-hou-schultz', 'Dalton Schultz', '2023–', 'Third franchise doing the identical job, and he never drops third and seven.', 90, 82, 74, 86, 70, 88, 88],
    ['now-hou-stover', 'Cade Stover', '2024–', 'Played linebacker at Ohio State, moved to tight end, and blocks like it.', 78, 90, 80, 74, 74, 94, 88],
    ['now-hou-smith', 'Irv Smith Jr.', '2024–', 'Has been hurt in five of his six years and is still only 27.', 82, 66, 88, 80, 76, 74, 84],
    ['now-hou-bryant', 'Harrison Bryant', '2025–', 'Won the Mackey Award in college and has been a backup ever since.', 76, 88, 78, 78, 72, 82, 86],
    ['now-hou-jordan', 'Brevin Jordan', '2021–', 'Enormous talent that has never once made it through a whole October.', 88, 62, 84, 80, 80, 74, 82],
    ['now-hou-akins', 'Jordan Akins', '2018–2021', 'Was 26 years old by the time he played his first professional down.', 84, 68, 90, 78, 76, 78, 84],
  ],
  ind: [
    ['now-ind-warren', 'Tyler Warren', '2025–', 'Took a direct snap, ran it in, and then caught one in the same afternoon.', 92, 86, 82, 88, 90, 96, 92],
    ['now-ind-ogletree', 'Drew Ogletree', '2022–', 'Youngstown State to here, and he has hardly been on the field since.', 78, 84, 76, 74, 68, 84, 88],
    ['now-ind-aliecox', 'Mo Alie-Cox', '2018–', 'Never played college football and has caught 150 professional passes.', 82, 90, 76, 68, 70, 88, 96],
    ['now-ind-mallory', 'Will Mallory', '2023–', 'Runs a 4.6 and covers kicks, which is how a late pick stays employed.', 78, 80, 90, 76, 76, 80, 84],
    ['now-ind-mckeon', 'Sean McKeon', '2025–', 'Signed off the street to block, which is the whole of the job.', 72, 90, 74, 68, 64, 88, 86],
    ['now-ind-woods', 'Jelani Woods', '2022–2024', 'Six foot seven, ran a 4.61, and has been hurt for three straight years.', 82, 82, 86, 76, 76, 76, 99],
  ],
  jax: [
    ['now-jax-strange', 'Brenton Strange', '2023–', 'Waited two entire years for a chance and then caught all of it.', 88, 84, 80, 84, 82, 88, 86],
    ['now-jax-long', 'Hunter Long', '2025–', 'Was drafted to catch passes and has been kept around to block instead.', 76, 90, 76, 74, 68, 86, 86],
    ['now-jax-mundt', 'Johnny Mundt', '2025–', 'Nine years in the league and 60 catches for the whole of it.', 78, 84, 74, 74, 68, 84, 84],
    ['now-jax-morris', 'Quintin Morris', '2025–', 'Fourth franchise in six years, and he covers kicks better than he runs routes.', 74, 88, 78, 70, 66, 90, 84],
    ['now-jax-herbert', 'Patrick Herbert', '2025–', 'His brother throws for a living and he blocks for one.', 72, 86, 76, 68, 64, 86, 88],
    ['now-jax-engram', 'Evan Engram', '2022–2024', 'Put up a reception total here that nobody at the position had reached.', 90, 62, 92, 90, 86, 76, 82],
  ],
  kc: [
    ['now-kc-kelce', 'Travis Kelce', '2013–', 'The best route running tight end there has ever been, at 36.', 97, 74, 76, 97, 84, 92, 90],
    ['now-kc-gray', 'Noah Gray', '2021–', 'Fifth round pick who blocks, catches touchdowns, and never says a word.', 88, 90, 82, 74, 76, 88, 84],
    ['now-kc-wiley', 'Jared Wiley', '2024–', 'Fourth round pick who tore a knee before anybody saw him play.', 80, 82, 86, 76, 72, 80, 92],
    ['now-kc-tonyan', 'Robert Tonyan', '2024–', 'Caught eleven touchdowns in a season once and has been a spare part since.', 84, 78, 76, 80, 70, 80, 86],
    ['now-kc-briningstool', 'Jake Briningstool', '2025–', 'Clemson record holder who went undrafted and made the roster.', 82, 74, 80, 78, 74, 78, 88],
    ['now-kc-yelder', 'Deon Yelder', '2018–2020', 'Undrafted, and he hung around three seasons blocking on the edge.', 74, 86, 76, 70, 66, 84, 86],
  ],
  lv: [
    ['now-lv-bowers', 'Brock Bowers', '2024–', 'No rookie at the position had ever caught as many as he did in year one.', 97, 78, 88, 96, 96, 92, 88],
    ['now-lv-mayer', 'Michael Mayer', '2023–', 'Second round pick who would start anywhere that did not already have Bowers.', 88, 88, 74, 78, 72, 90, 92],
    ['now-lv-thomas', 'Ian Thomas', '2025–', 'Eighth season of blocking on the edge for whoever will have him.', 72, 92, 76, 70, 66, 88, 88],
    ['now-lv-shorter', 'Justin Shorter', '2025–', 'Was a receiver at Florida and they are trying him at tight end now.', 78, 72, 84, 72, 72, 78, 92],
    ['now-lv-okwuegbunam', 'Albert Okwuegbunam', '2024–', 'Ran a 4.49 at 258 pounds and has never learned to block.', 80, 62, 96, 74, 78, 70, 94],
    ['now-lv-waller', 'Darren Waller', '2018–2022', 'Beat an addiction that nearly ended everything and made a Pro Bowl after it.', 92, 66, 90, 88, 82, 84, 92],
  ],
  lac: [
    ['now-lac-dissly', 'Will Dissly', '2024–', 'Blocks better than anybody at the position and catches it in the flat.', 82, 94, 70, 76, 66, 92, 88],
    ['now-lac-gadsden', 'Oronde Gadsden II', '2025–', 'His father caught passes here too, and he was a receiver until last year.', 84, 62, 84, 88, 84, 78, 86],
    ['now-lac-conklin', 'Tyler Conklin', '2025–', 'Eight seasons of 50 catches and no fuss whatsoever.', 90, 76, 76, 82, 72, 86, 86],
    ['now-lac-fisk', 'Tucker Fisk', '2024–', 'Was a defensive lineman at Stanford and blocks like one now.', 66, 94, 74, 62, 60, 92, 90],
    ['now-lac-smartt', 'Stone Smartt', '2023–', 'Threw for 2,000 yards at Old Dominion and changed position at 24.', 82, 62, 90, 78, 78, 80, 84],
    ['now-lac-everett', 'Gerald Everett', '2022–2023', 'Two seasons of being exactly good enough and no more than that.', 88, 64, 82, 82, 80, 80, 84],
  ],
  lar: [
    ['now-lar-higbee', 'Tyler Higbee', '2016–', 'Ten seasons here, and he blocks on first down and disappears on third.', 88, 90, 72, 76, 70, 92, 88],
    ['now-lar-parkinson', 'Colby Parkinson', '2024–', 'Six foot seven, and the money says star while the usage says blocker.', 82, 84, 76, 78, 70, 82, 96],
    ['now-lar-ferguson', 'Terrance Ferguson', '2025–', 'Second round rookie from Oregon who runs like a receiver.', 80, 70, 90, 86, 82, 78, 86],
    ['now-lar-allen', 'Davis Allen', '2023–', 'Fifth round pick from Clemson who plays when somebody gets hurt.', 80, 84, 76, 76, 70, 84, 88],
    ['now-lar-kroft', 'Tyler Kroft', '2024–', 'Tenth season, and he has spent nine of them as somebody backup.', 76, 86, 74, 72, 66, 84, 86],
    ['now-lar-hopkins', 'Brycen Hopkins', '2020–2023', 'One meaningful catch in four years, which is a hard way to earn a living.', 78, 72, 80, 76, 70, 74, 86],
  ],
  mia: [
    ['now-mia-smith', 'Jonnu Smith', '2024–', 'Caught 88 passes at 29 after eight seasons of nobody knowing what he was.', 90, 78, 90, 84, 92, 88, 82],
    ['now-mia-smythe', 'Julian Hill', '2023–', 'Undrafted from Campbell and blocks on 90 percent of his snaps.', 68, 92, 76, 66, 62, 90, 88],
    ['now-mia-conner', 'Tanner Conner', '2022–', 'Was a receiver at Idaho State and is 250 pounds now.', 76, 80, 84, 72, 74, 82, 88],
    ['now-mia-brown', 'Pharaoh Brown', '2025–', 'Eight years and five franchises of blocking, fighting and blocking again.', 72, 92, 74, 68, 66, 94, 92],
    ['now-mia-gesicki', 'Mike Gesicki', '2018–2022', 'Dunked for a living in high school and puts a shoulder into nobody now.', 88, 54, 84, 84, 72, 72, 92],
    ['now-mia-julianhill', 'Durham Smythe', '2018–2024', 'Seven seasons of blocking here and never more than 35 catches.', 74, 92, 72, 72, 64, 90, 88],
  ],
  min: [
    ['now-min-hockenson', 'T.J. Hockenson', '2022–', 'Caught 95 passes in a season and rebuilt a knee to do it again.', 92, 82, 78, 90, 78, 88, 88],
    ['now-min-oliver', 'Josh Oliver', '2023–', 'Nobody in the sport moves a defensive end sideways the way he does.', 82, 97, 74, 70, 68, 94, 90],
    ['now-min-mundt', 'Johnny Mundt', '2022–2024', 'Scored for the first time in year seven and the bench emptied for him.', 78, 84, 74, 74, 68, 84, 84],
    ['now-min-yurosek', 'Ben Yurosek', '2025–', 'Stanford tight end who went undrafted and made this roster in August.', 88, 66, 80, 76, 72, 80, 86],
    ['now-min-bartholomew', 'Gavin Bartholomew', '2025–', 'Sixth round pick from Pittsburgh who is on the practice squad.', 76, 82, 78, 72, 68, 82, 88],
    ['now-min-smith', 'Irv Smith Jr.', '2019–2022', 'Missed two whole seasons out of four and is still only 27 years old.', 82, 64, 90, 80, 76, 72, 84],
  ],
  ne: [
    ['now-ne-henry', 'Hunter Henry', '2021–', 'Nine hundred yards at 30 for a team nobody expected anything from.', 90, 84, 74, 88, 72, 90, 90],
    ['now-ne-hooper', 'Austin Hooper', '2024–', 'Two Pro Bowls a long time ago, and he still catches everything short.', 88, 80, 74, 84, 70, 84, 88],
    ['now-ne-bell', 'Jaheim Bell', '2024–', 'Carried the ball at South Carolina and weighs 240 pounds now.', 80, 74, 90, 74, 82, 80, 80],
    ['now-ne-dippre', 'CJ Dippre', '2025–', 'Alabama blocker taken in the seventh round to play on kicks.', 72, 90, 76, 68, 64, 88, 88],
    ['now-ne-westover', 'Jack Westover', '2025–', 'Spends Sundays on the practice squad and Wednesdays in full pads.', 74, 82, 76, 70, 66, 82, 84],
    ['now-ne-smith', 'Jonnu Smith', '2021–2022', 'The contract said centrepiece and the offense used him as a decoy.', 86, 76, 88, 80, 90, 86, 82],
  ],
  no: [
    ['now-no-johnson', 'Juwan Johnson', '2020–', 'Was a receiver at Penn State and needed three years to learn this job.', 88, 74, 82, 84, 82, 88, 88],
    ['now-no-moreau', 'Foster Moreau', '2023–', 'Was diagnosed with cancer at a free agency physical and played that year.', 84, 84, 76, 80, 70, 94, 90],
    ['now-no-taysomhill', 'Taysom Hill', '2017–', 'Takes snaps under center and then hits somebody on the next play.', 84, 84, 88, 74, 88, 97, 88],
    ['now-no-mayer', 'Michael Mayer', '2025–', 'Traded here for a pair of picks after two seasons behind a superstar.', 86, 90, 74, 82, 72, 88, 92],
    ['now-no-welch', 'Treyton Welch', '2025–', 'August is the only football he has ever played in this uniform.', 74, 80, 76, 70, 66, 80, 86],
    ['now-no-graham', 'Jimmy Graham', '2010–2014', 'Dunked on the goalposts until they made it a penalty.', 92, 56, 84, 86, 74, 72, 97],
  ],
  nyg: [
    ['now-nyg-johnson', 'Theo Johnson', '2024–', 'Fourth round pick with 4.57 speed at 259 pounds and a rebuilt foot.', 88, 86, 86, 80, 78, 86, 92],
    ['now-nyg-bellinger', 'Daniel Bellinger', '2022–', 'Moves people in the run game and quietly gets you 25 catches.', 78, 88, 78, 74, 70, 88, 88],
    ['now-nyg-manhertz', 'Chris Manhertz', '2024–', 'Played college basketball and has blocked for eleven professional seasons.', 70, 96, 72, 58, 58, 94, 90],
    ['now-nyg-fidone', 'Thomas Fidone II', '2025–', 'Two ruined knees at Nebraska and somebody spent a late pick on him anyway.', 84, 74, 84, 78, 76, 84, 88],
    ['now-nyg-dulcich', 'Greg Dulcich', '2025–', 'Was a walk on receiver at UCLA and has been hurt ever since he arrived.', 82, 70, 88, 78, 78, 72, 86],
    ['now-nyg-engram', 'Evan Engram', '2017–2021', 'Ran a 4.42 as a rookie and dropped a lot of important passes here.', 78, 60, 92, 86, 82, 76, 82],
  ],
  nyj: [
    ['now-nyj-taylor', 'Mason Taylor', '2025–', 'His father is in the Hall of Fame for chasing quarterbacks, not catching passes.', 90, 80, 82, 86, 82, 86, 88],
    ['now-nyj-ruckert', 'Jeremy Ruckert', '2022–', 'Grew up twenty miles away and blocks a great deal more than he catches.', 84, 90, 78, 70, 70, 88, 88],
    ['now-nyj-smartt', 'Stone Smartt', '2025–', 'A converted quarterback who is somehow the second tight end here.', 82, 62, 90, 78, 78, 80, 84],
    ['now-nyj-nealjohnson', 'Neal Johnson', '2025–', 'A full year in the building without ever dressing for a game.', 74, 80, 78, 70, 66, 80, 86],
    ['now-nyj-kuntz', 'Zack Kuntz', '2023–', 'Six foot seven, ran a 4.55, and tore a knee before anybody saw it.', 84, 76, 88, 68, 72, 74, 97],
    ['now-nyj-uzomah', 'C.J. Uzomah', '2022–2023', 'They paid him like a starter and got 21 catches out of the year.', 80, 84, 74, 76, 70, 82, 92],
  ],
  phi: [
    ['now-phi-goedert', 'Dallas Goedert', '2018–', 'Played second fiddle for six years and would start on most other rosters.', 92, 84, 76, 86, 86, 90, 92],
    ['now-phi-calcaterra', 'Grant Calcaterra', '2022–', 'Walked away from the sport over his head at 21 and un-retired at 23.', 88, 64, 82, 80, 78, 86, 84],
    ['now-phi-granson', 'Kylen Granson', '2025–', 'Fifth season, and he runs routes better than he blocks anybody.', 82, 62, 90, 80, 76, 80, 82],
    ['now-phi-latu', 'Cameron Latu', '2024–', 'Three years in and he has yet to be thrown to in a real game.', 76, 82, 78, 72, 68, 82, 86],
    ['now-phi-stoll', 'Jack Stoll', '2021–2023', 'Undrafted from Nebraska who started a Super Bowl at blocking tight end.', 72, 90, 74, 68, 64, 90, 88],
    ['now-phi-ertz', 'Zach Ertz', '2013–2021', 'Scored the winning points in a Super Bowl and got moved on regardless.', 94, 74, 74, 92, 70, 88, 88],
  ],
  pit: [
    ['now-pit-freiermuth', 'Pat Freiermuth', '2021–', 'Muth. Nothing thrown at him inside the twenty has ever hit the grass.', 90, 84, 74, 84, 74, 90, 90],
    ['now-pit-washington', 'Darnell Washington', '2023–', 'Six foot seven and 264 pounds, and he blocks like an extra tackle.', 84, 97, 76, 68, 76, 94, 99],
    ['now-pit-heyward', 'Connor Heyward', '2022–', 'His brother is a legend on the other side and he plays four positions.', 80, 84, 80, 74, 76, 88, 80],
    ['now-pit-parham', 'Donald Parham Jr.', '2025–', 'Six foot eight, and he has been carted off a field on live television.', 78, 78, 74, 72, 66, 84, 99],
    ['now-pit-gentry', 'Zach Gentry', '2019–2023', 'Was a quarterback at Michigan and left as a blocking tight end.', 70, 90, 74, 66, 62, 88, 96],
    ['now-pit-smith', 'Jonnu Smith', '2025–', 'Third team in three years for a man who catches 80 passes when asked.', 88, 78, 88, 82, 90, 86, 82],
  ],
  sf: [
    ['now-sf-kittle', 'George Kittle', '2017–', 'Blocks like a tackle, runs like a receiver, and enjoys it more than anybody.', 96, 97, 90, 92, 97, 97, 90],
    ['now-sf-farrell', 'Luke Farrell', '2025–', 'Signed for blocking money, which is a genuinely strange sentence.', 70, 94, 76, 68, 64, 90, 90],
    ['now-sf-tonges', 'Jake Tonges', '2024–', 'Nobody drafted him at 22 and he scored his first at 26.', 76, 88, 78, 76, 74, 82, 86],
    ['now-sf-willis', 'Brayden Willis', '2023–', 'Seventh round pick from Oklahoma who plays on all four special teams.', 70, 90, 80, 74, 72, 84, 84],
    ['now-sf-dwelley', 'Ross Dwelley', '2018–2023', 'Undrafted, and he started playoff games when the starter was hurt.', 80, 82, 74, 76, 70, 82, 86],
    ['now-sf-juszczyk', 'Kyle Juszczyk', '2017–', 'A fullback who has made nine Pro Bowls, which should not be possible now.', 88, 94, 78, 78, 78, 94, 82],
  ],
  sea: [
    ['now-sea-barner', 'AJ Barner', '2024–', 'Fourth round pick who blocks properly and scored four touchdowns as a rookie.', 86, 90, 76, 78, 72, 90, 88],
    ['now-sea-arroyo', 'Elijah Arroyo', '2025–', 'Second round rookie who missed two college seasons with a knee.', 80, 74, 86, 86, 82, 78, 88],
    ['now-sea-fant', 'Noah Fant', '2022–2024', 'Ran a 4.50 at 250 pounds and has never wanted to block anybody.', 76, 62, 92, 82, 84, 72, 88],
    ['now-sea-saubert', 'Eric Saubert', '2024–', 'Nine years and seven franchises later he is still blocking on the edge.', 72, 88, 76, 68, 64, 86, 88],
    ['now-sea-kallerup', 'Nick Kallerup', '2025–', 'Went unsigned out of Minnesota and lives one injury from a game day.', 74, 82, 78, 70, 68, 82, 86],
    ['now-sea-dissly', 'Will Dissly', '2018–2022', 'Moved people better than anybody here and could never stay upright.', 78, 94, 70, 74, 64, 92, 88],
  ],
  tb: [
    ['now-tb-otton', 'Cade Otton', '2022–', 'Fourth round pick who caught 90 passes when everybody else got hurt.', 90, 82, 74, 84, 74, 88, 88],
    ['now-tb-kieft', 'Ko Kieft', '2022–', 'Blocks on 95 percent of his snaps and looks like he grew up on a farm.', 62, 97, 74, 58, 60, 96, 92],
    ['now-tb-durham', 'Payne Durham', '2023–', 'Gets two throws a month and both of them come on third and short.', 80, 84, 74, 76, 68, 84, 90],
    ['now-tb-culp', 'Devin Culp', '2024–', 'Ran a 4.47 at the combine and has hardly been active since.', 78, 76, 90, 72, 76, 78, 84],
    ['now-tb-brate', 'Cameron Brate', '2014–2022', 'Harvard degree, and he scored eight times in a season nobody saw coming.', 88, 72, 72, 82, 66, 84, 86],
    ['now-tb-sinnott', 'Ben Sinnott', '2025–', 'Walked on in Manhattan and left as the best blocker in his draft class.', 82, 84, 80, 76, 74, 90, 84],
  ],
  ten: [
    ['now-ten-okonkwo', 'Chigoziem Okonkwo', '2022–', 'Ran past two linebackers a game as a rookie and then got forgotten about.', 90, 74, 90, 82, 90, 84, 82],
    ['now-ten-whyle', 'Josh Whyle', '2023–', 'Blocks down on ends and turns up on kickoffs every single week.', 84, 90, 80, 70, 70, 88, 92],
    ['now-ten-helm', 'Gunnar Helm', '2025–', 'Fourth round rookie from Texas who caught 60 passes in his last year.', 86, 78, 78, 82, 76, 82, 88],
    ['now-ten-martinrobinson', 'David Martin-Robinson', '2024–', 'Undrafted from Temple and has been on and off this roster for two years.', 76, 82, 78, 72, 68, 82, 86],
    ['now-ten-odukoya', 'Thomas Odukoya', '2025–', 'Dutch, played basketball, and had never seen a football until 2019.', 78, 82, 78, 62, 66, 82, 90],
    ['now-ten-firkser', 'Anthony Firkser', '2018–2021', 'Has an economics degree from Harvard and runs a lovely seam route.', 86, 68, 74, 84, 70, 78, 80],
  ],
  was: [
    ['now-was-ertz', 'Zach Ertz', '2023–', 'Turned 35, caught seven touchdowns, and looked twenty five doing it.', 92, 76, 72, 94, 70, 86, 88],
    ['now-was-sinnott', 'Ben Sinnott', '2024–', 'Kansas State captain who hits people on kick coverage for fun.', 82, 86, 82, 78, 74, 90, 86],
    ['now-was-bates', 'John Bates', '2021–', 'Five years of blocking down on ends for 40 catches in total.', 80, 92, 76, 66, 66, 90, 88],
    ['now-was-yankoff', 'Colson Yankoff', '2024–', 'Was a quarterback at Washington and a receiver at UCLA before this.', 78, 64, 90, 74, 74, 82, 84],
    ['now-was-jackson', 'Tyree Jackson', '2023–', 'Six foot seven, threw passes at Buffalo, and tore an Achilles catching one here.', 76, 80, 82, 70, 70, 80, 97],
    ['now-was-thomas', 'Logan Thomas', '2020–2023', 'Was a starting quarterback in college and caught six touchdowns at 29.', 84, 78, 78, 80, 72, 84, 94],
  ],
};

export const TE_CURRENT: Player[] = Object.entries(POOLS).flatMap(([teamId, rows]) =>
  rows.map(([id, name, years, blurb, hands, blocking, speed, routeRunning, yac, toughness, size]) => ({
    id,
    name,
    teamId,
    position: 'TE' as const,
    years,
    blurb,
    attributes: { hands, blocking, speed, routeRunning, yac, toughness, size },
  })),
);
