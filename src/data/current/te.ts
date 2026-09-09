import type { Player } from '../types';

/**
 * TIGHT END ROOMS AS THEY STAND NOW. Rules are in ./qb.ts and they apply here.
 *
 * This is the thin one and it is thin honestly. A roster carries three or four tight ends
 * and most of them are there to block, so a room here is three or four men and one of them
 * usually cannot run a route. Nobody has been added to pad it out.
 *
 * THE SCALE IS TODAY'S LEAGUE, so George Kittle sets the top of blocking and yards after
 * catch rather than sitting behind fifty years of predecessors.
 *
 * Row format:
 *   [id, name, years, blurb, HND, BLK, SPD, RTE, YAC, TGH, SZE]
 */

type Row = [string, string, string, string, number, number, number, number, number, number, number];

const POOLS: Record<string, Row[]> = {
  ari: [
    ['now-ari-mcbride', 'Trey McBride', '2022–', 'Catches 110 passes a year and nobody outside the desert has noticed.', 99, 85, 84, 96, 90, 94, 88],
    ['now-ari-higgins', 'Elijah Higgins', '2023–', 'Was a receiver at Stanford until somebody handed him a tight end jersey.', 85, 75, 91, 81, 81, 78, 86],
    ['now-ari-long', 'Hunter Long', '2025–', 'Was drafted to catch passes and has been kept around to block instead.', 77, 92, 77, 75, 69, 87, 86],
  ],
  atl: [
    ['now-atl-pitts', 'Kyle Pitts', '2021–', 'Went fourth overall, had a 1,000 yard rookie year, and has chased it since.', 85, 66, 95, 92, 79, 76, 94],
    ['now-atl-woerner', 'Charlie Woerner', '2024–', 'Blocks for a living and has never been asked to run a real route.', 73, 96, 74, 60, 62, 91, 88],
    ['now-atl-hooper', 'Austin Hooper', '2026–', 'Made two Pro Bowls here a long time ago and came back at 31.', 89, 81, 74, 85, 71, 85, 88],
  ],
  bal: [
    ['now-bal-andrews', 'Mark Andrews', '2018–', 'Type one diabetic, and he is the leading touchdown scorer in club history.', 94, 75, 79, 94, 77, 89, 90],
    ['now-bal-smythe', 'Durham Smythe', '2026–', 'Ninth season of blocking down on ends for whoever will have him.', 83, 96, 72, 69, 64, 91, 88],
    ['now-bal-hibner', 'Matt Hibner', '2026–', 'SMU tight end who arrived undrafted and hits people on kick coverage.', 79, 85, 79, 73, 69, 85, 86],
    ['now-bal-cuevas', 'Josh Cuevas', '2025–', 'Went undrafted and made the roster on special teams and nothing else.', 78, 86, 76, 64, 66, 94, 84],
  ],
  buf: [
    ['now-buf-kincaid', 'Dalton Kincaid', '2023–', 'First round pick who runs routes like a slot receiver and drops too many.', 79, 66, 88, 94, 83, 76, 84],
    ['now-buf-knox', 'Dawson Knox', '2019–', 'Scored in January the week after his brother died and pointed at the sky.', 85, 94, 81, 79, 75, 96, 90],
    ['now-buf-hawes', 'Jackson Hawes', '2025–', 'Fifth round rookie brought in to block, and he is very good at it.', 77, 96, 74, 62, 62, 91, 90],
    ['now-buf-morrisx', 'Keleki Latu', '2025–', 'Rookie who has to beat out three players who would start almost anywhere else.', 73, 81, 77, 69, 64, 81, 86],
  ],
  car: [
    ['now-car-tremble', 'Tommy Tremble', '2021–', 'Drafted to block and he has quietly become good enough to leave on the field.', 79, 94, 88, 77, 79, 91, 86],
    ['now-car-evans', 'Mitchell Evans', '2025–', 'Notre Dame captain taken in the fifth to do the dirty work.', 79, 90, 77, 75, 69, 89, 90],
    ['now-car-granger', 'Darren Waller', '2026–', 'Retired at 31, sat out a whole year, and un-retired to score touchdowns at 33.', 92, 62, 88, 87, 81, 78, 92],
    ['now-car-jtsanders', 'Ja\'Tavion Sanders', '2024–', 'Catches everything thrown near him and puts a shoulder into nobody.', 92, 62, 91, 83, 85, 78, 86],
    ['now-car-franks', 'Feleipe Franks', '2024–', 'Carolina moved him from quarterback to tight end and it actually took.', 73, 85, 81, 69, 71, 87, 92],
  ],
  chi: [
    ['now-chi-loveland', 'Colston Loveland', '2025–', 'Tenth overall pick who was the best route runner in his draft.', 92, 73, 91, 96, 85, 81, 90],
    ['now-chi-kmet', 'Cole Kmet', '2020–', 'Does the unglamorous half of the job well and catches 60 balls doing it.', 89, 90, 79, 83, 73, 89, 90],
    ['now-chi-wilson', 'Sam Roush', '2026–', 'Stanford blocker taken in the third round to do the work nobody claps for.', 83, 87, 79, 75, 71, 89, 88],
  ],
  cin: [
    ['now-cin-sample', 'Drew Sample', '2019–', 'Second round pick used entirely as a blocker for seven seasons.', 81, 96, 72, 66, 64, 94, 88],
    ['now-cin-gesicki', 'Mike Gesicki', '2024–', 'Played basketball until he was 20 and blocking has never entered into it.', 89, 56, 88, 87, 75, 74, 92],
    ['now-cin-fannin', 'Erick All Jr.', '2024–', 'Tore the same knee at Michigan and again as a rookie, and he still plays like this.', 89, 77, 81, 85, 81, 85, 86],
    ['now-cin-endries', 'Jack Endries', '2026–', 'Led Cal in catches, transferred to Texas, and went in the fourth round.', 89, 75, 84, 87, 79, 78, 84],
  ],
  cle: [
    ['now-cle-fannin', 'Harold Fannin Jr.', '2025–', 'Set a college record for the position that had stood since the seventies.', 89, 69, 84, 92, 92, 85, 82],
    ['now-cle-whiteheart', 'Blake Whiteheart', '2024–', 'Wake Forest tight end who has never caught a professional pass.', 73, 87, 77, 71, 64, 87, 88],
    ['now-cle-ryan', 'Carsen Ryan', '2026–', 'Was a fullback at BYU and they are still working out what he is.', 81, 90, 77, 71, 69, 89, 84],
  ],
  dal: [
    ['now-dal-ferguson', 'Jake Ferguson', '2022–', 'Fourth round pick whose grandfather coached the Packers to a Super Bowl.', 92, 81, 77, 90, 75, 91, 88],
    ['now-dal-spannford', 'Brevyn Spann-Ford', '2024–', 'Six foot seven and undrafted, and he made the roster on blocking.', 75, 94, 72, 69, 62, 91, 97],
    ['now-dal-schoonmaker', 'Luke Schoonmaker', '2023–', 'Second round pick who has been the second tight end for three years.', 81, 87, 79, 77, 71, 85, 88],
  ],
  den: [
    ['now-den-trautman', 'Adam Trautman', '2023–', 'Third round pick who has settled into blocking and never complaining.', 83, 94, 74, 69, 66, 91, 90],
    ['now-den-engram', 'Evan Engram', '2025–', 'Signed at 31 to be a slot receiver wearing a tight end number.', 92, 62, 95, 92, 90, 76, 82],
    ['now-den-adkins', 'Nate Adkins', '2023–', 'Twelve snaps a game, all of them on first and second down.', 75, 90, 77, 71, 66, 89, 86],
    ['now-den-bentley', 'Dallen Bentley', '2026–', 'Undrafted out of BYU, and he is here because he blocks without complaining.', 73, 90, 72, 66, 62, 87, 88],
  ],
  det: [
    ['now-det-laporta', 'Sam LaPorta', '2023–', 'Broke the rookie tight end record and blocks like he was raised on a farm.', 96, 85, 88, 92, 90, 94, 86],
    ['now-det-wright', 'Brock Wright', '2021–', 'Nobody drafted him and he has started January games as an extra lineman.', 77, 94, 77, 73, 69, 91, 88],
    ['now-det-conklin', 'Tyler Conklin', '2026–', 'Has not missed a game in nine years and nobody has built an offense around him.', 89, 75, 79, 85, 73, 87, 86],
  ],
  gb: [
    ['now-gb-kraft', 'Tucker Kraft', '2023–', 'Finishes every catch by lowering a shoulder into whoever arrives first.', 92, 87, 86, 85, 96, 94, 88],
    ['now-gb-smith', 'Jonnu Smith', '2024–', 'Caught 88 passes at 29 after eight seasons of nobody knowing what he was.', 92, 79, 93, 85, 94, 89, 82],
    ['now-gb-whyle', 'Josh Whyle', '2023–', 'Blocks down on ends and turns up on kickoffs every single week.', 85, 92, 81, 71, 71, 89, 92],
    ['now-gb-redman', 'Mark Redman', '2026–', 'Six foot six out of San Diego State, and the hands are why he sticks.', 83, 81, 74, 77, 69, 83, 90],
  ],
  hou: [
    ['now-hou-schultz', 'Dalton Schultz', '2023–', 'Third franchise doing the identical job, and he never drops third and seven.', 92, 83, 74, 87, 71, 89, 88],
    ['now-hou-moreau', 'Foster Moreau', '2026–', 'Signed at 29 to block on first down and catch a touchdown a month.', 85, 85, 77, 81, 71, 96, 90],
    ['now-hou-klein', 'Marlin Klein', '2026–', 'German, played basketball until he was 18, and now blocks defensive ends.', 79, 90, 81, 73, 71, 87, 92],
    ['now-hou-stover', 'Cade Stover', '2024–', 'Played linebacker at Ohio State, moved to tight end, and blocks like it.', 79, 92, 81, 75, 75, 96, 88],
    ['now-hou-jordan', 'Brevin Jordan', '2021–', 'Enormous talent that has never once made it through a whole October.', 89, 62, 86, 81, 81, 74, 82],
  ],
  ind: [
    ['now-ind-warren', 'Tyler Warren', '2025–', 'Took a direct snap, ran it in, and then caught one in the same afternoon.', 94, 87, 84, 90, 92, 98, 92],
    ['now-ind-aliecox', 'Mo Alie-Cox', '2018–', 'Never played college football and has caught 150 professional passes.', 83, 92, 77, 69, 71, 89, 96],
    ['now-ind-ogletree', 'Drew Ogletree', '2022–', 'Youngstown State to here, and he has hardly been on the field since.', 79, 85, 77, 75, 69, 85, 88],
  ],
  jax: [
    ['now-jax-strange', 'Brenton Strange', '2023–', 'Waited two entire years for a chance and then caught all of it.', 89, 85, 81, 85, 83, 89, 86],
    ['now-jax-boerkircher', 'Nate Boerkircher', '2026–', 'Nebraska tight end who caught nine passes in college and blocks like this.', 75, 92, 77, 69, 64, 89, 88],
    ['now-jax-morris', 'Quintin Morris', '2025–', 'Fourth franchise in six years, and he covers kicks better than he runs routes.', 75, 90, 79, 71, 66, 91, 84],
    ['now-jax-koziol', 'Tanner Koziol', '2026–', 'Caught 84 passes at Ball State and moved to Houston to be seen.', 89, 69, 79, 85, 77, 76, 86],
  ],
  kc: [
    ['now-kc-kelce', 'Travis Kelce', '2013–', 'The best route running tight end there has ever been, at 36.', 99, 75, 77, 99, 85, 94, 90],
    ['now-kc-gray', 'Noah Gray', '2021–', 'Fifth round pick who blocks, catches touchdowns, and never says a word.', 89, 92, 84, 75, 77, 89, 84],
    ['now-kc-wiley', 'Jared Wiley', '2024–', 'Fourth round pick who tore a knee before anybody saw him play.', 81, 83, 88, 77, 73, 81, 92],
    ['now-kc-briningstool', 'Jake Briningstool', '2025–', 'Clemson record holder who went undrafted and made the roster.', 83, 75, 81, 79, 75, 78, 88],
  ],
  lv: [
    ['now-lv-bowers', 'Brock Bowers', '2024–', 'No rookie at the position had ever caught as many as he did in year one.', 99, 79, 91, 98, 98, 94, 88],
    ['now-lv-mayer', 'Michael Mayer', '2023–', 'Second round pick who would start anywhere that did not already have Bowers.', 89, 90, 74, 79, 73, 91, 92],
    ['now-lv-thomas', 'Ian Thomas', '2025–', 'Eighth season of blocking on the edge for whoever will have him.', 73, 94, 77, 71, 66, 89, 88],
  ],
  lac: [
    ['now-lac-kolar', 'Charlie Kolar', '2026–', 'Iowa State record holder who waited four years and then got handed a job.', 85, 90, 74, 71, 66, 89, 94],
    ['now-lac-gadsden', 'Oronde Gadsden II', '2025–', 'His father caught passes here too, and he was a receiver until last year.', 85, 62, 86, 90, 85, 78, 86],
    ['now-lac-njoku', 'David Njoku', '2026–', 'Went into a burning house to pull a child out, and he plays like that too.', 94, 75, 93, 85, 90, 96, 88],
  ],
  lar: [
    ['now-lar-parkinson', 'Colby Parkinson', '2024–', 'Six foot seven, and the money says star while the usage says blocker.', 83, 85, 77, 79, 71, 83, 96],
    ['now-lar-higbee', 'Tyler Higbee', '2016–', 'Ten seasons here, and he blocks on first down and disappears on third.', 89, 92, 72, 77, 71, 94, 88],
    ['now-lar-ferguson', 'Terrance Ferguson', '2025–', 'Second round rookie from Oregon who runs like a receiver.', 81, 71, 93, 87, 83, 78, 86],
    ['now-lar-allen', 'Davis Allen', '2023–', 'Fifth round pick from Clemson who plays when somebody gets hurt.', 81, 85, 77, 77, 71, 85, 88],
    ['now-lar-klare', 'Max Klare', '2026–', 'Caught 51 passes at Purdue, transferred to Ohio State, and can actually run.', 89, 75, 88, 87, 81, 78, 84],
  ],
  mia: [
    ['now-mia-dulcich', 'Greg Dulcich', '2026–', 'Was a walk on receiver at UCLA and has been hurt in every season since.', 85, 71, 91, 79, 79, 72, 86],
    ['now-mia-kacmarek', 'Will Kacmarek', '2026–', 'Ohio kid who arrived undrafted and has hands nobody expected him to have.', 83, 87, 77, 75, 69, 87, 90],
    ['now-mia-traore', 'Seydou Traore', '2026–', 'Grew up in France playing basketball and had never seen a football at 17.', 87, 62, 88, 79, 79, 76, 84],
    ['now-mia-joly', 'Justin Joly', '2026–', 'Nobody drafted him out of NC State because he runs a 4.8, and he still catches it.', 89, 71, 81, 83, 81, 78, 84],
  ],
  min: [
    ['now-min-hockenson', 'T.J. Hockenson', '2022–', 'Caught 95 passes in a season and rebuilt a knee to do it again.', 94, 83, 79, 92, 79, 89, 88],
    ['now-min-oliver', 'Josh Oliver', '2023–', 'Nobody in the sport moves a defensive end sideways the way he does.', 83, 99, 74, 71, 69, 96, 90],
    ['now-min-bartholomew', 'Gavin Bartholomew', '2025–', 'Sixth round pick from Pittsburgh who is on the practice squad.', 77, 83, 79, 73, 69, 83, 88],
  ],
  ne: [
    ['now-ne-henry', 'Hunter Henry', '2021–', 'Nine hundred yards at 30 for a team nobody expected anything from.', 92, 85, 74, 90, 73, 91, 90],
    ['now-ne-westover', 'Eli Raridon', '2026–', 'Two knee reconstructions at Notre Dame, and he is still only 23 years old.', 83, 81, 81, 77, 71, 87, 90],
    ['now-ne-arkin', 'Tanner Arkin', '2026–', 'Nobody drafted him and he has yet to dress for a game that counted.', 77, 85, 77, 71, 66, 85, 86],
    ['now-ne-latu', 'Cameron Latu', '2026–', 'Was a pass rusher at Alabama until they moved him and he got drafted.', 79, 83, 79, 75, 71, 83, 86],
  ],
  no: [
    ['now-no-johnson', 'Juwan Johnson', '2020–', 'Was a receiver at Penn State and needed three years to learn this job.', 89, 75, 84, 85, 83, 89, 88],
    ['now-no-fant', 'Noah Fant', '2026–', 'New Orleans signed him to run seams, which is all he has ever wanted.', 77, 62, 98, 83, 85, 72, 88],
    ['now-no-delp', 'Oscar Delp', '2026–', 'Blocked for two national titles at Georgia and caught very little.', 79, 92, 81, 77, 71, 89, 88],
  ],
  nyg: [
    ['now-nyg-likely', 'Isaiah Likely', '2026–', 'Would have started for twenty other teams and finally went to one of them.', 92, 77, 91, 87, 90, 85, 88],
    ['now-nyg-johnson', 'Theo Johnson', '2024–', 'Fourth round pick with 4.57 speed at 259 pounds and a rebuilt foot.', 89, 87, 88, 81, 79, 87, 92],
    ['now-nyg-manhertz', 'Chris Manhertz', '2024–', 'Played college basketball and has blocked for eleven professional seasons.', 70, 98, 72, 58, 58, 96, 90],
    ['now-nyg-fidone', 'Thomas Fidone II', '2025–', 'Two ruined knees at Nebraska and somebody spent a late pick on him anyway.', 85, 75, 86, 79, 77, 85, 88],
  ],
  nyj: [
    ['now-nyj-taylor', 'Mason Taylor', '2025–', 'His father is in the Hall of Fame for chasing quarterbacks, not catching passes.', 92, 81, 84, 87, 83, 87, 88],
    ['now-nyj-sadiq', 'Kenyon Sadiq', '2026–', 'They spent a first round pick on a tight end, which teams have stopped doing.', 87, 79, 99, 81, 85, 85, 86],
    ['now-nyj-ruckert', 'Jeremy Ruckert', '2022–', 'Grew up twenty miles away and blocks a great deal more than he catches.', 85, 92, 79, 71, 71, 89, 88],
    ['now-nyj-woods', 'Jelani Woods', '2026–', 'Fourth franchise for a man who has been injured in all four of his seasons.', 83, 83, 88, 77, 77, 76, 99],
  ],
  phi: [
    ['now-phi-goedert', 'Dallas Goedert', '2018–', 'Played second fiddle for six years and would start on most other rosters.', 94, 85, 77, 87, 87, 91, 92],
    ['now-phi-mundt', 'Johnny Mundt', '2026–', 'Scored the first touchdown of his career in year seven and they mobbed him.', 79, 85, 74, 75, 69, 85, 84],
    ['now-phi-stowers', 'Eli Stowers', '2026–', 'Was a quarterback at Texas A&M and is a receiving tight end at Vanderbilt.', 87, 69, 88, 81, 81, 78, 84],
    ['now-phi-jenkins', 'E.J. Jenkins', '2026–', 'Six foot seven, played basketball at South Carolina, and is 27 years old.', 81, 75, 86, 75, 75, 81, 94],
  ],
  pit: [
    ['now-pit-freiermuth', 'Pat Freiermuth', '2021–', 'Muth. Nothing thrown at him inside the twenty has ever hit the grass.', 92, 85, 74, 85, 75, 91, 90],
    ['now-pit-washington', 'Darnell Washington', '2023–', 'Six foot seven and 264 pounds, and he blocks like an extra tackle.', 85, 99, 77, 69, 77, 96, 99],
    ['now-pit-tonyan', 'Robert Tonyan', '2026–', 'Ninth season, and the eleven touchdown year is still what people say first.', 85, 79, 77, 81, 71, 81, 86],
  ],
  sf: [
    ['now-sf-kittle', 'George Kittle', '2017–', 'Blocks like a tackle, runs like a receiver, and enjoys it more than anybody.', 98, 99, 93, 94, 99, 99, 90],
    ['now-sf-tonges', 'Jake Tonges', '2024–', 'Nobody drafted him at 22 and he scored his first at 26.', 77, 90, 79, 77, 75, 83, 86],
    ['now-sf-farrell', 'Luke Farrell', '2025–', 'Signed for blocking money, which is a genuinely strange sentence.', 70, 96, 77, 69, 64, 91, 90],
  ],
  sea: [
    ['now-sea-barner', 'AJ Barner', '2024–', 'Fourth round pick who blocks properly and scored four touchdowns as a rookie.', 87, 92, 77, 79, 73, 91, 88],
    ['now-sea-saubert', 'Eric Saubert', '2024–', 'Nine years and seven franchises later he is still blocking on the edge.', 73, 90, 77, 69, 64, 87, 88],
    ['now-sea-arroyo', 'Elijah Arroyo', '2025–', 'Second round rookie who missed two college seasons with a knee.', 81, 75, 88, 87, 83, 78, 88],
    ['now-sea-kallerup', 'Nick Kallerup', '2025–', 'Went unsigned out of Minnesota and lives one injury from a game day.', 75, 83, 79, 71, 69, 83, 86],
  ],
  tb: [
    ['now-tb-otton', 'Cade Otton', '2022–', 'Fourth round pick who caught 90 passes when everybody else got hurt.', 92, 83, 74, 85, 75, 89, 88],
    ['now-tb-durham', 'Payne Durham', '2023–', 'Gets two throws a month and both of them come on third and short.', 81, 85, 74, 77, 69, 85, 90],
    ['now-tb-kieft', 'Ko Kieft', '2022–', 'Blocks on 95 percent of his snaps and looks like he grew up on a farm.', 62, 99, 74, 58, 60, 98, 92],
    ['now-tb-sinnott', 'Bauer Sharp', '2026–', 'Was a fullback at Oklahoma and they drafted him to go and hit people.', 83, 85, 81, 77, 75, 91, 84],
  ],
  ten: [
    ['now-ten-helm', 'Gunnar Helm', '2025–', 'Fourth round rookie from Texas who caught 60 passes in his last year.', 87, 79, 79, 83, 77, 83, 88],
    ['now-ten-bellinger', 'Daniel Bellinger', '2026–', 'Blocks properly, and 25 catches a season is exactly what they wanted.', 79, 90, 79, 75, 71, 89, 88],
    ['now-ten-granson', 'Kylen Granson', '2026–', 'Arrived at 28 to catch the ball on third down and nothing else at all.', 83, 62, 93, 81, 77, 81, 82],
    ['now-ten-martinrobinson', 'David Martin-Robinson', '2026–', 'Temple tight end this team has cut and signed again twice.', 77, 83, 79, 73, 69, 83, 86],
  ],
  was: [
    ['now-was-okonkwo', 'Chig Okonkwo', '2026–', 'Runs like a receiver, and Tennessee never worked out what to do with him.', 87, 77, 95, 85, 92, 81, 76],
    ['now-was-bates', 'John Bates', '2021–', 'Five years of blocking down on ends for 40 catches in total.', 81, 94, 77, 66, 66, 91, 88],
    ['now-was-sinnott', 'Ben Sinnott', '2024–', 'Kansas State captain who hits people on kick coverage for fun.', 83, 87, 84, 79, 75, 91, 86],
    ['now-was-yankoff', 'Colson Yankoff', '2026–', 'Was a quarterback at Washington and a receiver at UCLA before this.', 79, 71, 91, 75, 77, 81, 84],
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
