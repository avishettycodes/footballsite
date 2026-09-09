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
    ['now-ari-long', 'Hunter Long', '2025–', 'Was drafted to catch passes and has been kept around to block instead.', 76, 90, 76, 74, 68, 86, 86],
    ['now-ari-quitoriano', 'Teagan Quitoriano', '2026–', 'Blocks on the edge and has caught eleven passes in four seasons.', 74, 88, 76, 68, 64, 86, 90],
  ],
  atl: [
    ['now-atl-pitts', 'Kyle Pitts', '2021–', 'Went fourth overall, had a 1,000 yard rookie year, and has chased it since.', 84, 66, 92, 90, 78, 76, 94],
    ['now-atl-woerner', 'Charlie Woerner', '2024–', 'Blocks for a living and has never been asked to run a real route.', 72, 94, 74, 60, 62, 90, 88],
    ['now-atl-hooper', 'Austin Hooper', '2026–', 'Made two Pro Bowls here a long time ago and came back at 31.', 88, 80, 74, 84, 70, 84, 88],
    ['now-atl-kalinic', 'Nick Muse', '2026–', 'Went in the seventh round out of South Carolina and has caught three passes.', 70, 84, 76, 68, 64, 84, 88],
  ],
  bal: [
    ['now-bal-andrews', 'Mark Andrews', '2018–', 'Type one diabetic, and he is the leading touchdown scorer in club history.', 92, 74, 78, 92, 76, 88, 90],
    ['now-bal-smythe', 'Durham Smythe', '2026–', 'Ninth season of blocking down on ends for whoever will have him.', 82, 94, 72, 68, 64, 90, 88],
    ['now-bal-vannett', 'Nick Vannett', '2026–', 'Eleven seasons on six teams, and every one of them wanted the same thing.', 76, 90, 72, 70, 64, 88, 90],
    ['now-bal-hibner', 'Matt Hibner', '2026–', 'SMU tight end who arrived undrafted and hits people on kick coverage.', 78, 84, 78, 72, 68, 84, 86],
  ],
  buf: [
    ['now-buf-kincaid', 'Dalton Kincaid', '2023–', 'First round pick who runs routes like a slot receiver and drops too many.', 78, 66, 86, 92, 82, 76, 84],
    ['now-buf-knox', 'Dawson Knox', '2019–', 'Scored in January the week after his brother died and pointed at the sky.', 84, 92, 80, 78, 74, 94, 90],
    ['now-buf-hawes', 'Jackson Hawes', '2025–', 'Fifth round rookie brought in to block, and he is very good at it.', 76, 94, 74, 62, 62, 90, 90],
    ['now-buf-morrisx', 'Keleki Latu', '2025–', 'Rookie who has to beat out three men who would start almost anywhere else.', 72, 80, 76, 68, 64, 80, 86],
  ],
  car: [
    ['now-car-evans', 'Mitchell Evans', '2025–', 'Notre Dame captain taken in the fifth to do the dirty work.', 78, 88, 76, 74, 68, 88, 90],
    ['now-car-granger', 'Darren Waller', '2026–', 'Retired at 31, sat out a whole year, and un-retired to score touchdowns at 33.', 90, 62, 86, 86, 80, 78, 92],
    ['now-car-jtsanders', 'Ja\'Tavion Sanders', '2024–', 'Catches everything thrown near him and puts a shoulder into nobody.', 90, 62, 88, 82, 84, 78, 86],
    ['now-car-franks', 'Feleipe Franks', '2021–', 'Was a starting quarterback in the SEC and converted at 24.', 72, 84, 80, 68, 70, 86, 92],
  ],
  chi: [
    ['now-chi-loveland', 'Colston Loveland', '2025–', 'Tenth overall pick who was the best route runner in his draft.', 90, 72, 88, 94, 84, 80, 90],
    ['now-chi-kmet', 'Cole Kmet', '2020–', 'Does the unglamorous half of the job well and catches 60 balls doing it.', 88, 88, 78, 82, 72, 88, 90],
    ['now-chi-wilson', 'Sam Roush', '2026–', 'Stanford blocker taken in the third round to do the work nobody claps for.', 82, 86, 78, 74, 70, 88, 88],
    ['now-chi-carlson', 'Stephen Carlson', '2024–', 'Undrafted, tore a knee, came back, and is still on a roster.', 76, 84, 76, 72, 68, 88, 86],
  ],
  cin: [
    ['now-cin-sample', 'Drew Sample', '2019–', 'Second round pick used entirely as a blocker for seven seasons.', 80, 94, 72, 66, 64, 92, 88],
    ['now-cin-gesicki', 'Mike Gesicki', '2024–', 'Played basketball until he was 20 and blocking has never entered into it.', 88, 56, 86, 86, 74, 74, 92],
    ['now-cin-fannin', 'Erick All Jr.', '2024–', 'Tore the same knee at Michigan and again as a rookie, and he still plays like this.', 88, 76, 80, 84, 80, 84, 86],
    ['now-cin-hudson', 'Tanner Hudson', '2023–', 'Undrafted, played in three other leagues, and turned up here at 29.', 88, 64, 78, 80, 78, 80, 84],
  ],
  cle: [
    ['now-cle-fannin', 'Harold Fannin Jr.', '2025–', 'Set a college record for the position that had stood since the seventies.', 88, 68, 82, 90, 90, 84, 82],
    ['now-cle-whiteheart', 'Blake Whiteheart', '2024–', 'Wake Forest tight end who has never caught a professional pass.', 72, 86, 76, 70, 64, 86, 88],
    ['now-cle-ryan', 'Carsen Ryan', '2026–', 'Was a fullback at BYU and they are still working out what he is.', 80, 88, 76, 70, 68, 88, 84],
    ['now-cle-swinson', 'Messiah Swinson', '2026–', 'Six foot seven and on his fourth college, and blocking is the whole job.', 72, 88, 74, 66, 62, 86, 94],
  ],
  dal: [
    ['now-dal-ferguson', 'Jake Ferguson', '2022–', 'Fourth round pick whose grandfather coached the Packers to a Super Bowl.', 90, 80, 76, 88, 74, 90, 88],
    ['now-dal-spannford', 'Brevyn Spann-Ford', '2024–', 'Six foot seven and undrafted, and he made the roster on blocking.', 74, 92, 72, 68, 62, 90, 97],
    ['now-dal-schoonmaker', 'Luke Schoonmaker', '2023–', 'Second round pick who has been the second tight end for three years.', 80, 86, 78, 76, 70, 84, 88],
    ['now-dal-mitchell', 'James Mitchell', '2024–', 'Eleven catches in four years, and he keeps making the team anyway.', 76, 84, 78, 72, 70, 84, 86],
  ],
  den: [
    ['now-den-trautman', 'Adam Trautman', '2023–', 'Third round pick who has settled into blocking and never complaining.', 82, 92, 74, 68, 66, 90, 90],
    ['now-den-engram', 'Evan Engram', '2025–', 'Signed at 31 to be a slot receiver wearing a tight end number.', 90, 62, 92, 90, 88, 76, 82],
    ['now-den-adkins', 'Nate Adkins', '2023–', 'Twelve snaps a game, all of them on first and second down.', 74, 88, 76, 70, 66, 88, 86],
    ['now-den-krull', 'Lucas Krull', '2023–', 'Played two other sports at Florida before anybody handed him this one.', 80, 78, 82, 76, 74, 82, 92],
  ],
  det: [
    ['now-det-laporta', 'Sam LaPorta', '2023–', 'Broke the rookie tight end record and blocks like he was raised on a farm.', 94, 84, 86, 90, 88, 92, 86],
    ['now-det-wright', 'Brock Wright', '2021–', 'Nobody drafted him and he has started January games as an extra lineman.', 76, 92, 76, 72, 68, 90, 88],
    ['now-det-conklin', 'Tyler Conklin', '2026–', 'Has not missed a game in nine years and nobody has built an offense around him.', 88, 74, 78, 84, 72, 86, 86],
    ['now-det-meeks', 'Jackson Meeks', '2026–', 'Was a receiver at Georgia and Syracuse before anybody called him this.', 86, 70, 82, 80, 76, 78, 84],
  ],
  gb: [
    ['now-gb-kraft', 'Tucker Kraft', '2023–', 'Finishes every catch by lowering a shoulder into whoever arrives first.', 90, 86, 84, 84, 94, 92, 88],
    ['now-gb-smith', 'Jonnu Smith', '2024–', 'Caught 88 passes at 29 after eight seasons of nobody knowing what he was.', 90, 78, 90, 84, 92, 88, 82],
    ['now-gb-whyle', 'Josh Whyle', '2023–', 'Blocks down on ends and turns up on kickoffs every single week.', 84, 90, 80, 70, 70, 88, 92],
    ['now-gb-redman', 'Mark Redman', '2026–', 'Six foot six out of San Diego State, and the hands are why he sticks.', 82, 80, 74, 76, 68, 82, 90],
  ],
  hou: [
    ['now-hou-schultz', 'Dalton Schultz', '2023–', 'Third franchise doing the identical job, and he never drops third and seven.', 90, 82, 74, 86, 70, 88, 88],
    ['now-hou-moreau', 'Foster Moreau', '2026–', 'Signed at 29 to block on first down and catch a touchdown a month.', 84, 84, 76, 80, 70, 94, 90],
    ['now-hou-klein', 'Marlin Klein', '2026–', 'German, played basketball until he was 18, and now blocks defensive ends.', 78, 88, 80, 72, 70, 86, 92],
    ['now-hou-stover', 'Cade Stover', '2024–', 'Played linebacker at Ohio State, moved to tight end, and blocks like it.', 78, 90, 80, 74, 74, 94, 88],
    ['now-hou-jordan', 'Brevin Jordan', '2021–', 'Enormous talent that has never once made it through a whole October.', 88, 62, 84, 80, 80, 74, 82],
  ],
  ind: [
    ['now-ind-warren', 'Tyler Warren', '2025–', 'Took a direct snap, ran it in, and then caught one in the same afternoon.', 92, 86, 82, 88, 90, 96, 92],
    ['now-ind-aliecox', 'Mo Alie-Cox', '2018–', 'Never played college football and has caught 150 professional passes.', 82, 90, 76, 68, 70, 88, 96],
    ['now-ind-ogletree', 'Drew Ogletree', '2022–', 'Youngstown State to here, and he has hardly been on the field since.', 78, 84, 76, 74, 68, 84, 88],
    ['now-ind-pbrown', 'Pharaoh Brown', '2026–', 'Blocks, fights, blocks again, and six teams have paid him to do exactly that.', 72, 90, 74, 66, 64, 92, 92],
  ],
  jax: [
    ['now-jax-strange', 'Brenton Strange', '2023–', 'Waited two entire years for a chance and then caught all of it.', 88, 84, 80, 84, 82, 88, 86],
    ['now-jax-boerkircher', 'Nate Boerkircher', '2026–', 'Nebraska tight end who caught nine passes in college and blocks like this.', 74, 90, 76, 68, 64, 88, 88],
    ['now-jax-morris', 'Quintin Morris', '2025–', 'Fourth franchise in six years, and he covers kicks better than he runs routes.', 74, 88, 78, 70, 66, 90, 84],
    ['now-jax-koziol', 'Tanner Koziol', '2026–', 'Caught 84 passes at Ball State and moved to Houston to be seen.', 88, 68, 78, 84, 76, 76, 86],
  ],
  kc: [
    ['now-kc-kelce', 'Travis Kelce', '2013–', 'The best route running tight end there has ever been, at 36.', 97, 74, 76, 97, 84, 92, 90],
    ['now-kc-gray', 'Noah Gray', '2021–', 'Fifth round pick who blocks, catches touchdowns, and never says a word.', 88, 90, 82, 74, 76, 88, 84],
    ['now-kc-wiley', 'Jared Wiley', '2024–', 'Fourth round pick who tore a knee before anybody saw him play.', 80, 82, 86, 76, 72, 80, 92],
    ['now-kc-briningstool', 'Jake Briningstool', '2025–', 'Clemson record holder who went undrafted and made the roster.', 82, 74, 80, 78, 74, 78, 88],
  ],
  lv: [
    ['now-lv-bowers', 'Brock Bowers', '2024–', 'No rookie at the position had ever caught as many as he did in year one.', 97, 78, 88, 96, 96, 92, 88],
    ['now-lv-mayer', 'Michael Mayer', '2023–', 'Second round pick who would start anywhere that did not already have Bowers.', 88, 88, 74, 78, 72, 90, 92],
    ['now-lv-thomas', 'Ian Thomas', '2025–', 'Eighth season of blocking on the edge for whoever will have him.', 72, 92, 76, 70, 66, 88, 88],
    ['now-lv-shorter', 'Chris Myarick', '2026–', 'Has been signed and released by six teams and keeps turning up in September.', 72, 88, 74, 68, 64, 88, 90],
  ],
  lac: [
    ['now-lac-kolar', 'Charlie Kolar', '2026–', 'Iowa State record holder who waited four years and then got handed a job.', 84, 88, 74, 70, 66, 88, 94],
    ['now-lac-gadsden', 'Oronde Gadsden II', '2025–', 'His father caught passes here too, and he was a receiver until last year.', 84, 62, 84, 88, 84, 78, 86],
    ['now-lac-njoku', 'David Njoku', '2026–', 'Went into a burning house to pull a child out, and he plays like that too.', 92, 74, 90, 84, 88, 94, 88],
    ['now-lac-svoboda', 'Evan Svoboda', '2026–', 'Was Wyoming\'s quarterback, and at six foot five somebody had an idea.', 74, 82, 78, 70, 68, 84, 88],
  ],
  lar: [
    ['now-lar-parkinson', 'Colby Parkinson', '2024–', 'Six foot seven, and the money says star while the usage says blocker.', 82, 84, 76, 78, 70, 82, 96],
    ['now-lar-higbee', 'Tyler Higbee', '2016–', 'Ten seasons here, and he blocks on first down and disappears on third.', 88, 90, 72, 76, 70, 92, 88],
    ['now-lar-ferguson', 'Terrance Ferguson', '2025–', 'Second round rookie from Oregon who runs like a receiver.', 80, 70, 90, 86, 82, 78, 86],
    ['now-lar-allen', 'Davis Allen', '2023–', 'Fifth round pick from Clemson who plays when somebody gets hurt.', 80, 84, 76, 76, 70, 84, 88],
  ],
  mia: [
    ['now-mia-dulcich', 'Greg Dulcich', '2026–', 'Was a walk on receiver at UCLA and has been hurt in every season since.', 84, 70, 88, 78, 78, 72, 86],
    ['now-mia-kacmarek', 'Will Kacmarek', '2026–', 'Ohio kid who arrived undrafted and has hands nobody expected him to have.', 82, 86, 76, 74, 68, 86, 90],
    ['now-mia-traore', 'Seydou Traore', '2026–', 'Grew up in France playing basketball and had never seen a football at 17.', 86, 62, 86, 78, 78, 76, 84],
    ['now-mia-joly', 'Justin Joly', '2026–', 'Nobody drafted him out of NC State because he runs a 4.8, and he still catches it.', 88, 70, 80, 82, 80, 78, 84],
  ],
  min: [
    ['now-min-hockenson', 'T.J. Hockenson', '2022–', 'Caught 95 passes in a season and rebuilt a knee to do it again.', 92, 82, 78, 90, 78, 88, 88],
    ['now-min-oliver', 'Josh Oliver', '2023–', 'Nobody in the sport moves a defensive end sideways the way he does.', 82, 97, 74, 70, 68, 94, 90],
    ['now-min-bartholomew', 'Gavin Bartholomew', '2025–', 'Sixth round pick from Pittsburgh who is on the practice squad.', 76, 82, 78, 72, 68, 82, 88],
    ['now-min-grandy', 'Cam Grandy', '2025–', 'Illinois State tight end who is here to catch passes in August.', 78, 78, 76, 74, 70, 80, 88],
  ],
  ne: [
    ['now-ne-henry', 'Hunter Henry', '2021–', 'Nine hundred yards at 30 for a team nobody expected anything from.', 90, 84, 74, 88, 72, 90, 90],
    ['now-ne-westover', 'Eli Raridon', '2026–', 'Two knee reconstructions at Notre Dame, and he is still only 23 years old.', 82, 80, 80, 76, 70, 86, 90],
    ['now-ne-arkin', 'Tanner Arkin', '2026–', 'Undrafted, and the only football he has played here happened in August.', 76, 84, 76, 70, 66, 84, 86],
    ['now-ne-latu', 'Cameron Latu', '2026–', 'Was a pass rusher at Alabama until they moved him and he got drafted.', 78, 82, 78, 74, 70, 82, 86],
  ],
  no: [
    ['now-no-johnson', 'Juwan Johnson', '2020–', 'Was a receiver at Penn State and needed three years to learn this job.', 88, 74, 82, 84, 82, 88, 88],
    ['now-no-fant', 'Noah Fant', '2019–', 'Twentieth overall pick who ran a 4.5 and blocked absolutely nobody.', 76, 62, 94, 82, 84, 72, 88],
    ['now-no-smartt', 'Stone Smartt', '2025–', 'A converted quarterback who is somehow the second tight end here.', 82, 62, 90, 78, 78, 80, 84],
    ['now-no-welch', 'Treyton Welch', '2025–', 'August is the only football he has ever played in this uniform.', 74, 80, 76, 70, 66, 80, 86],
  ],
  nyg: [
    ['now-nyg-likely', 'Isaiah Likely', '2026–', 'Would have started for twenty other teams and finally went to one of them.', 90, 76, 88, 86, 88, 84, 88],
    ['now-nyg-johnson', 'Theo Johnson', '2024–', 'Fourth round pick with 4.57 speed at 259 pounds and a rebuilt foot.', 88, 86, 86, 80, 78, 86, 92],
    ['now-nyg-manhertz', 'Chris Manhertz', '2024–', 'Played college basketball and has blocked for eleven professional seasons.', 70, 96, 72, 58, 58, 94, 90],
    ['now-nyg-fidone', 'Thomas Fidone II', '2025–', 'Two ruined knees at Nebraska and somebody spent a late pick on him anyway.', 84, 74, 84, 78, 76, 84, 88],
  ],
  nyj: [
    ['now-nyj-taylor', 'Mason Taylor', '2025–', 'His father is in the Hall of Fame for chasing quarterbacks, not catching passes.', 90, 80, 82, 86, 82, 86, 88],
    ['now-nyj-sadiq', 'Kenyon Sadiq', '2026–', 'They spent a first round pick on a tight end, which teams have stopped doing.', 86, 78, 95, 80, 84, 84, 86],
    ['now-nyj-ruckert', 'Jeremy Ruckert', '2022–', 'Grew up twenty miles away and blocks a great deal more than he catches.', 84, 90, 78, 70, 70, 88, 88],
    ['now-nyj-woods', 'Jelani Woods', '2026–', 'Fourth franchise for a man who has been injured in all four of his seasons.', 82, 82, 86, 76, 76, 76, 99],
  ],
  phi: [
    ['now-phi-goedert', 'Dallas Goedert', '2018–', 'Played second fiddle for six years and would start on most other rosters.', 92, 84, 76, 86, 86, 90, 92],
    ['now-phi-mundt', 'Johnny Mundt', '2026–', 'Scored the first touchdown of his career in year seven and they mobbed him.', 78, 84, 74, 74, 68, 84, 84],
    ['now-phi-stowers', 'Eli Stowers', '2026–', 'Was a quarterback at Texas A&M and is a receiving tight end at Vanderbilt.', 86, 68, 86, 80, 80, 78, 84],
    ['now-phi-jenkins', 'E.J. Jenkins', '2026–', 'Six foot seven, played basketball at South Carolina, and is 27 years old.', 80, 74, 84, 74, 74, 80, 94],
  ],
  pit: [
    ['now-pit-freiermuth', 'Pat Freiermuth', '2021–', 'Muth. Nothing thrown at him inside the twenty has ever hit the grass.', 90, 84, 74, 84, 74, 90, 90],
    ['now-pit-washington', 'Darnell Washington', '2023–', 'Six foot seven and 264 pounds, and he blocks like an extra tackle.', 84, 97, 76, 68, 76, 94, 99],
    ['now-pit-tonyan', 'Robert Tonyan', '2026–', 'Ninth season, and the eleven touchdown year is still what people say first.', 84, 78, 76, 80, 70, 80, 86],
    ['now-pit-mcree', 'Lake McRee', '2026–', 'Blocked for two first round backs at Texas and caught what was left over.', 84, 76, 78, 78, 70, 82, 88],
  ],
  sf: [
    ['now-sf-kittle', 'George Kittle', '2017–', 'Blocks like a tackle, runs like a receiver, and enjoys it more than anybody.', 96, 97, 90, 92, 97, 97, 90],
    ['now-sf-tonges', 'Jake Tonges', '2024–', 'Nobody drafted him at 22 and he scored his first at 26.', 76, 88, 78, 76, 74, 82, 86],
    ['now-sf-farrell', 'Luke Farrell', '2025–', 'Signed for blocking money, which is a genuinely strange sentence.', 70, 94, 76, 68, 64, 90, 90],
    ['now-sf-willis', 'Brayden Willis', '2023–', 'Seventh round pick from Oklahoma who plays on all four special teams.', 70, 90, 80, 74, 72, 84, 84],
  ],
  sea: [
    ['now-sea-barner', 'AJ Barner', '2024–', 'Fourth round pick who blocks properly and scored four touchdowns as a rookie.', 86, 90, 76, 78, 72, 90, 88],
    ['now-sea-saubert', 'Eric Saubert', '2024–', 'Nine years and seven franchises later he is still blocking on the edge.', 72, 88, 76, 68, 64, 86, 88],
    ['now-sea-arroyo', 'Elijah Arroyo', '2025–', 'Second round rookie who missed two college seasons with a knee.', 80, 74, 86, 86, 82, 78, 88],
    ['now-sea-kallerup', 'Nick Kallerup', '2025–', 'Went unsigned out of Minnesota and lives one injury from a game day.', 74, 82, 78, 70, 68, 82, 86],
  ],
  tb: [
    ['now-tb-otton', 'Cade Otton', '2022–', 'Fourth round pick who caught 90 passes when everybody else got hurt.', 90, 82, 74, 84, 74, 88, 88],
    ['now-tb-durham', 'Payne Durham', '2023–', 'Gets two throws a month and both of them come on third and short.', 80, 84, 74, 76, 68, 84, 90],
    ['now-tb-kieft', 'Ko Kieft', '2022–', 'Blocks on 95 percent of his snaps and looks like he grew up on a farm.', 62, 97, 74, 58, 60, 96, 92],
    ['now-tb-sinnott', 'Bauer Sharp', '2026–', 'Was a fullback at Oklahoma and they drafted him to go and hit people.', 82, 84, 80, 76, 74, 90, 84],
    ['now-tb-dippre', 'CJ Dippre', '2025–', 'Alabama blocker taken in the seventh round to play on kicks.', 72, 90, 76, 68, 64, 88, 88],
  ],
  ten: [
    ['now-ten-helm', 'Gunnar Helm', '2025–', 'Fourth round rookie from Texas who caught 60 passes in his last year.', 86, 78, 78, 82, 76, 82, 88],
    ['now-ten-bellinger', 'Daniel Bellinger', '2026–', 'Blocks properly, and 25 catches a season is exactly what they wanted.', 78, 88, 78, 74, 70, 88, 88],
    ['now-ten-granson', 'Kylen Granson', '2026–', 'Arrived at 28 to catch the ball on third down and nothing else at all.', 82, 62, 90, 80, 76, 80, 82],
    ['now-ten-martinrobinson', 'David Martin-Robinson', '2026–', 'Temple tight end this team has cut and signed again twice.', 76, 82, 78, 72, 68, 82, 86],
  ],
  was: [
    ['now-was-okonkwo', 'Chigoziem Okonkwo', '2026–', 'Averaged 15 yards a catch as a rookie and got paid for it four years later.', 90, 74, 90, 82, 90, 84, 82],
    ['now-was-bates', 'John Bates', '2021–', 'Five years of blocking down on ends for 40 catches in total.', 80, 92, 76, 66, 66, 90, 88],
    ['now-was-sinnott', 'Ben Sinnott', '2024–', 'Kansas State captain who hits people on kick coverage for fun.', 82, 86, 82, 78, 74, 90, 86],
    ['now-was-yankoff', 'Colson Yankoff', '2026–', 'Was a quarterback at Washington and a receiver at UCLA before this.', 78, 70, 88, 74, 76, 80, 84],
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
