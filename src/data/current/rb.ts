import type { Player } from '../types';

/**
 * 2026 Week 1 active running back rooms. Ratings are generated from Madden NFL 27 by
 * scripts/sync-current-ratings.ts and checked against the frozen source fixture.
 *
 * Row format:
 *   [id, name, years, blurb, SPD, BRS, JKE, PWR, VIS, HND, SZE]
 */

type Row = [string, string, string, string, number, number, number, number, number, number, number];

const POOLS: Record<string, Row[]> = {
  ari: [
    ['now-ari-love', 'Jeremiyah Love', '2026–', 'Notre Dame back taken in the first round who runs away from angles.', 94, 94, 92, 83, 76, 77, 80],
    ['now-ari-allgeier', 'Tyler Allgeier', '2026–', 'Signed to be the thunder in a room built entirely out of rookies.', 85, 88, 82, 90, 83, 75, 82],
    ['now-ari-knight', 'Bam Knight', '2022–', 'Undrafted out of NC State and has started games nobody remembers.', 88, 88, 86, 78, 75, 74, 77],
  ],
  atl: [
    ['now-atl-bijan', 'Bijan Robinson', '2023–', 'Runs like a man who has never once been tackled by the first defender.', 93, 92, 99, 91, 91, 87, 81],
    ['now-atl-brobinson', 'Brian Robinson Jr.', '2026–', 'Third franchise in three years for a man who has never had a bad one.', 87, 90, 80, 90, 80, 72, 89],
  ],
  bal: [
    ['now-bal-henry', 'Derrick Henry', '2024–', 'Six foot three and 247 pounds, and he is still pulling away at 31.', 93, 87, 83, 99, 96, 74, 99],
    ['now-bal-jhill', 'Justice Hill', '2019–', 'Third down back who blocks better than most tight ends do.', 90, 90, 88, 75, 81, 90, 72],
    ['now-bal-rali', 'Rasheen Ali', '2024–', 'Scored 23 touchdowns in a season at Marshall and is fifth on this depth chart.', 92, 92, 83, 75, 74, 75, 77],
  ],
  buf: [
    ['now-buf-cook', 'James Cook', '2022–', 'Led the league in rushing touchdowns and asked to be paid like it.', 93, 94, 98, 76, 91, 80, 70],
    ['now-buf-tyjohnson', 'Ty Johnson', '2022–', 'Special teams captain who turns up with a 40 yard run twice a year.', 90, 89, 86, 72, 80, 75, 74],
    ['now-buf-rdavis', 'Ray Davis', '2024–', 'Went to four colleges, then ran for 97 yards on a Sunday night as a rookie.', 88, 88, 86, 84, 78, 81, 75],
  ],
  car: [
    ['now-car-hubbard', 'Chuba Hubbard', '2021–', 'Signed an extension nobody outside the building believed he would get.', 91, 92, 88, 83, 84, 84, 81],
    ['now-car-brooks', 'Jonathon Brooks', '2024–', 'First back taken in his draft and both knees have gone since.', 90, 91, 89, 82, 75, 72, 78],
    ['now-car-dillon', 'AJ Dillon', '2026–', 'Signed at 28 to be the biggest man in a room full of quick little backs.', 87, 85, 80, 90, 77, 77, 94],
  ],
  chi: [
    ['now-chi-swift', 'D\'Andre Swift', '2024–', 'Every team that trades for him decides within a year that they were wrong.', 90, 90, 90, 80, 90, 81, 70],
    ['now-chi-monangai', 'Kyle Monangai', '2025–', 'Seventh round pick who led the Big Ten in rushing and nobody noticed.', 86, 88, 82, 89, 82, 77, 72],
    ['now-chi-roschon', 'Roschon Johnson', '2023–', 'Blocks like a fullback and got buried behind better runners at Texas too.', 86, 89, 81, 83, 80, 74, 85],
  ],
  cin: [
    ['now-cin-cbrown', 'Chase Brown', '2023–', 'Went in the fifth round and outran a 1,000 yard veteran for the job.', 93, 95, 89, 77, 83, 78, 75],
    ['now-cin-perine', 'Samaje Perine', '2023–', 'Ran for 427 yards in one college game and blocks blitzers for a living.', 86, 90, 78, 89, 78, 84, 90],
    ['now-cin-tbrooks', 'Tahj Brooks', '2025–', 'Carried the ball 900 times at Texas Tech and went in the sixth round.', 88, 92, 85, 78, 73, 80, 76],
  ],
  cle: [
    ['now-cle-judkins', 'Quinshon Judkins', '2025–', 'Ran for 1,000 yards at two different blue blood programs.', 90, 91, 87, 87, 85, 81, 83],
    ['now-cle-sampson', 'Dylan Sampson', '2025–', 'Scored 22 touchdowns at Tennessee and catches everything they throw him.', 92, 91, 88, 77, 75, 77, 67],
    ['now-cle-rsanders', 'Raheim Sanders', '2026–', 'They call him Rocket, and at 227 pounds that is not really about the speed.', 90, 89, 83, 80, 74, 75, 85],
  ],
  dal: [
    ['now-dal-javonte', 'Javonte Williams', '2025–', 'Broke 20 tackles on one drive as a rookie, then rebuilt an entire knee.', 88, 90, 86, 94, 88, 78, 81],
    ['now-dal-mdavis', 'Malik Davis', '2026–', 'Undrafted in 2022 and he has outlasted four backs they drafted ahead of him.', 88, 92, 83, 73, 80, 78, 72],
    ['now-dal-demercado', 'Emari Demercado', '2026–', 'Went undrafted out of TCU and took a kick 90 yards on his first day.', 91, 91, 83, 79, 74, 75, 74],
  ],
  den: [
    ['now-den-dobbins', 'J.K. Dobbins', '2025–', 'Finally got a full season and ran for over a thousand in it.', 90, 91, 90, 85, 84, 74, 77],
    ['now-den-harvey', 'RJ Harvey', '2025–', 'Was a quarterback in high school and ran a 4.4 at the combine.', 92, 94, 87, 84, 82, 77, 71],
    ['now-den-coleman', 'Jonah Coleman', '2026–', 'Five foot nine and 229 pounds, which is a bowling ball with a jump cut.', 87, 90, 79, 86, 76, 81, 77],
    ['now-den-badie', 'Tyler Badie', '2023–', 'Ran for 1,600 yards at Missouri at 190 pounds and nobody drafted him high.', 89, 93, 81, 78, 74, 78, 69],
  ],
  det: [
    ['now-det-gibbs', 'Jahmyr Gibbs', '2023–', 'They took a running back twelfth overall and he made it look obvious.', 98, 95, 99, 83, 90, 86, 71],
    ['now-det-vaki', 'Sione Vaki', '2024–', 'Lined up at safety on Saturday and at running back the same afternoon.', 89, 91, 85, 79, 73, 78, 81],
    ['now-det-saylors', 'Jacob Saylors', '2026–', 'East Tennessee State back who has made this roster three summers running.', 88, 90, 79, 78, 75, 75, 73],
  ],
  gb: [
    ['now-gb-jacobs', 'Josh Jacobs', '2024–', 'The league rushing champion brought the same heavy workload north to Green Bay.', 90, 89, 88, 97, 93, 83, 81],
    ['now-gb-lloyd', 'MarShawn Lloyd', '2024–', 'Six carries in two seasons for a man they spent a third rounder on.', 90, 92, 87, 79, 75, 69, 76],
    ['now-gb-cbrooks', 'Chris Brooks', '2024–', 'Six foot one and 225 pounds, and he went undrafted out of BYU.', 89, 88, 81, 79, 74, 72, 84],
    ['now-gb-kjohnson', 'Kaleb Johnson', '2026–', 'Came back to the state where his father grew up, for a fourth round pick.', 88, 90, 88, 86, 74, 74, 86],
  ],
  hou: [
    ['now-hou-montgomery', 'David Montgomery', '2026–', 'Arrived at 29 to fall forward on every carry, which is the whole job.', 87, 88, 86, 89, 93, 86, 83],
    ['now-hou-marks', 'Woody Marks', '2025–', 'Caught 261 passes in college, which is a receiver number.', 88, 88, 88, 80, 87, 84, 76],
    ['now-hou-bbrooks', 'British Brooks', '2024–', 'A college tailback who earned an NFL job by turning himself into a fullback.', 86, 89, 73, 75, 65, 78, 83],
  ],
  ind: [
    ['now-ind-jtaylor', 'Jonathan Taylor', '2020–', 'Ran for 1,811 yards in a season and does it again whenever he is healthy.', 94, 93, 91, 97, 96, 81, 82],
    ['now-ind-mcgowan', 'Seth McGowan', '2026–', 'Left Oklahoma under a cloud, went to Cincinnati, and ran his way back.', 89, 90, 81, 78, 75, 69, 84],
    ['now-ind-giddens', 'DJ Giddens', '2025–', 'Second best back in the state of Kansas and they took him anyway.', 91, 92, 81, 83, 76, 69, 79],
  ],
  jax: [
    ['now-jax-tuten', 'Bhayshul Tuten', '2025–', 'Ran a 4.32 at 206 pounds, which is not supposed to be possible.', 95, 96, 89, 82, 73, 72, 73],
    ['now-jax-crodriguez', 'Chris Rodriguez', '2026–', 'Kentucky bruiser who finally got a room where somebody would use him.', 89, 91, 79, 84, 80, 65, 82],
    ['now-jax-lallen', 'LeQuint Allen', '2025–', 'Caught 64 passes at Syracuse and blocks like he means it.', 89, 92, 86, 82, 72, 78, 77],
    ['now-jax-abdullah', 'Ameer Abdullah', '2026–', 'Eleven seasons of third downs, and he has never once missed a blitz pickup.', 88, 91, 87, 70, 79, 83, 71],
  ],
  kc: [
    ['now-kc-kwalker', 'Kenneth Walker III', '2026–', 'Traded for a third rounder to give the best offense in football a runner.', 93, 93, 90, 92, 89, 75, 76],
    ['now-kc-ejohnson', 'Emmett Johnson', '2026–', 'Was the whole of Nebraska for a season and is the third man here.', 89, 90, 82, 75, 75, 83, 74],
    ['now-kc-bsmith', 'Brashard Smith', '2025–', 'Was a receiver at Miami and a running back at SMU, and got drafted as one.', 93, 93, 86, 69, 76, 78, 69],
  ],
  lv: [
    ['now-lv-jeanty', 'Ashton Jeanty', '2025–', 'Ran for 2,601 yards in one college season and went sixth overall.', 90, 92, 91, 92, 85, 80, 76],
    ['now-lv-mwashington', 'Mike Washington Jr.', '2026–', 'Fourth round rookie who arrived to take the carries nobody wants.', 94, 93, 81, 82, 78, 72, 85],
    ['now-lv-laube', 'Dylan Laube', '2024–', 'Caught 68 passes at New Hampshire and covers kicks here.', 88, 89, 86, 76, 72, 87, 74],
  ],
  lac: [
    ['now-lac-hampton', 'Omarion Hampton', '2025–', 'Two hundred and twenty pounds with a 4.46, taken 22nd overall.', 90, 93, 83, 92, 80, 84, 83],
    ['now-lac-kmitchell', 'Keaton Mitchell', '2026–', 'The knee held up, and he still runs like nobody has told him about it.', 94, 95, 86, 63, 76, 81, 61],
    ['now-lac-vidal', 'Kimani Vidal', '2024–', 'Ran for 1,661 yards at Troy and went in the sixth round for being short.', 90, 90, 87, 79, 82, 77, 73],
  ],
  lar: [
    ['now-lar-kyren', 'Kyren Williams', '2022–', 'Went in the fifth round and has led the league in carries since.', 88, 90, 87, 94, 93, 83, 74],
    ['now-lar-corum', 'Blake Corum', '2024–', 'Won a national title at Michigan and waits his turn without complaining.', 93, 91, 88, 84, 80, 74, 70],
    ['now-lar-rivers', 'Ronnie Rivers', '2022–', 'His father played here too, and neither of them ever got many carries.', 87, 91, 86, 61, 70, 78, 68],
  ],
  mia: [
    ['now-mia-achane', 'De\'Von Achane', '2023–', 'The fastest man in the sport, and he is listed at 188 pounds.', 96, 96, 92, 77, 84, 89, 66],
    ['now-mia-jwright', 'Jaylen Wright', '2024–', 'Ran a 4.38 at Tennessee and has 100 career carries to show for it.', 93, 93, 87, 82, 74, 74, 78],
    ['now-mia-gordon', 'Ollie Gordon', '2025–', 'Won the Doak Walker as a sophomore and slid to the sixth round.', 86, 88, 82, 86, 80, 78, 86],
  ],
  min: [
    ['now-min-ajones', 'Aaron Jones', '2024–', 'Signed for one year at 29 and ran for a thousand out of nowhere.', 88, 91, 89, 84, 85, 84, 73],
    ['now-min-jmason', 'Jordan Mason', '2025–', 'Went undrafted out of Georgia Tech and runs like he is still annoyed about it.', 89, 92, 80, 90, 85, 65, 85],
    ['now-min-claiborne', 'Demond Claiborne', '2026–', 'Wake Forest speed taken on day three to give this offense a jolt.', 93, 90, 89, 76, 70, 72, 69],
  ],
  ne: [
    ['now-ne-rhamondre', 'Rhamondre Stevenson', '2021–', 'Four hundred pound squat, and the ball keeps coming out at the worst moment.', 88, 87, 87, 92, 85, 83, 88],
    ['now-ne-henderson', 'TreVeyon Henderson', '2025–', 'Ran a 4.43 at 202 pounds and returned a kick 100 yards in his first month.', 95, 92, 89, 82, 81, 75, 73],
    ['now-ne-kiner', 'Corey Kiner', '2026–', 'Cincinnati back who runs angry and went undrafted for being short.', 88, 89, 81, 82, 74, 74, 74],
  ],
  no: [
    ['now-no-etienne', 'Travis Etienne', '2026–', 'Went home to Louisiana and got the ball twenty times a week again.', 92, 93, 90, 82, 90, 80, 77],
    ['now-no-kamara', 'Alvin Kamara', '2017–', 'Scored six touchdowns in one afternoon and has never dropped anything since.', 87, 91, 87, 89, 83, 89, 78],
    ['now-no-kmiller', 'Kendre Miller', '2023–', 'Has torn something in his leg in all three of his seasons here.', 90, 90, 86, 84, 81, 71, 83],
    ['now-no-estime', 'Audric Estime', '2026–', 'Two hundred and twenty pounds of short yardage on a one year deal.', 87, 90, 82, 82, 78, 75, 83],
  ],
  nyg: [
    ['now-nyg-skattebo', 'Cam Skattebo', '2025–', 'Broke 100 tackles in a college season and dares people to hit him.', 85, 90, 86, 93, 81, 83, 80],
    ['now-nyg-tracy', 'Tyrone Tracy', '2024–', 'Played receiver at Iowa, moved to running back at Purdue, and it worked.', 90, 91, 89, 78, 80, 75, 81],
    ['now-nyg-singletary', 'Devin Singletary', '2024–', 'Motor. That is the whole scouting report and it has lasted seven years.', 86, 88, 89, 82, 80, 80, 68],
    ['now-nyg-najee', 'Najee Harris', '2026–', 'Signed to run out the fourth quarter of games they are trying to win.', 87, 90, 86, 90, 78, 75, 93],
  ],
  nyj: [
    ['now-nyj-hall', 'Breece Hall', '2022–', 'Blew out a knee in October and ran a 4.39 the following August.', 92, 91, 95, 85, 87, 80, 81],
    ['now-nyj-ballen', 'Braelon Allen', '2024–', 'Started college at 17 and is now 235 pounds of very young man.', 88, 89, 85, 85, 78, 71, 95],
    ['now-nyj-idavis', 'Isaiah Davis', '2024–', 'South Dakota State bruiser who went in the fifth and blocks well.', 87, 90, 82, 80, 76, 75, 82],
    ['now-nyj-nwangwu', 'Kene Nwangwu', '2024–', 'Has returned four kickoffs for touchdowns and carried the ball eleven times.', 92, 94, 82, 69, 69, 66, 80],
  ],
  phi: [
    ['now-phi-saquon', 'Saquon Barkley', '2024–', 'Ran backwards over a defender on television and then ran for 2,000 yards.', 95, 94, 96, 90, 87, 86, 86],
    ['now-phi-bigsby', 'Tank Bigsby', '2025–', 'Traded for a pair of picks to be the thunder nobody else wanted.', 92, 92, 86, 86, 82, 68, 81],
    ['now-phi-shipley', 'Will Shipley', '2024–', 'Clemson back who returns kicks and waits behind the best in the league.', 91, 91, 87, 77, 76, 71, 77],
  ],
  pit: [
    ['now-pit-warren', 'Jaylen Warren', '2022–', 'Went undrafted, and he blocks 260 pound linebackers at 5 foot 8.', 90, 94, 87, 84, 87, 81, 74],
    ['now-pit-dowdle', 'Rico Dowdle', '2026–', 'Ran for a thousand yards last season and nobody offered him much for it.', 89, 90, 91, 85, 87, 77, 81],
    ['now-pit-heidenreich', 'Eli Heidenreich', '2026–', 'Played receiver at Navy and would have owed the service five years.', 91, 93, 86, 72, 65, 84, 75],
  ],
  sf: [
    ['now-sf-cmc', 'Christian McCaffrey', '2022–', 'The best receiver on the team is the running back, and it is not close.', 90, 92, 95, 84, 99, 99, 76],
    ['now-sf-black', 'Kaelon Black', '2026–', 'Split carries at Illinois for four years and never once complained.', 91, 93, 81, 84, 78, 71, 76],
    ['now-sf-james', 'Jordan James', '2026–', 'Oregon back who waited a year and then took the job in September.', 89, 92, 87, 78, 73, 68, 75],
  ],
  sea: [
    ['now-sea-price', 'Jadarian Price', '2026–', 'Tore an Achilles before he ever played at Notre Dame and still runs a 4.4.', 89, 90, 87, 75, 81, 74, 77],
    ['now-sea-holani', 'George Holani', '2024–', 'Boise State all time great who went undrafted and made the roster anyway.', 89, 92, 80, 76, 75, 78, 75],
    ['now-sea-ewilson', 'Emanuel Wilson', '2026–', 'Fort Valley State is not a place scouts visit and he keeps making rosters.', 90, 93, 82, 82, 79, 77, 82],
  ],
  tb: [
    ['now-tb-irving', 'Bucky Irving', '2024–', 'Fourth round pick who broke more tackles than backs twice his size.', 89, 91, 96, 77, 84, 80, 70],
    ['now-tb-gainwell', 'Kenny Gainwell', '2026–', 'Catches out of the backfield, and Philadelphia trusted him in January.', 89, 86, 90, 78, 84, 81, 70],
    ['now-tb-stucker', 'Sean Tucker', '2023–', 'A heart condition scared everybody off him and he went undrafted.', 92, 90, 81, 82, 79, 78, 76],
  ],
  ten: [
    ['now-ten-pollard', 'Tony Pollard', '2024–', 'Got the every down job at last and ran for a thousand quietly.', 90, 93, 89, 78, 87, 86, 78],
    ['now-ten-spears', 'Tyjae Spears', '2023–', 'Plays without an ACL in one knee and jukes people out of the stadium.', 88, 91, 88, 77, 77, 86, 72],
    ['now-ten-singleton', 'Nicholas Singleton', '2026–', 'Penn State back who runs a 4.37 and shared carries there for four years.', 93, 94, 82, 79, 70, 80, 83],
    ['now-ten-chestnut', 'Julius Chestnut', '2022–', 'Undrafted out of Sacred Heart and blocks his way onto the roster yearly.', 88, 90, 80, 84, 74, 77, 84],
  ],
  was: [
    ['now-was-croskey', 'Jacory Croskey-Merritt', '2025–', 'Played one college game in his final year and went in the seventh round.', 92, 95, 85, 80, 84, 68, 75],
    ['now-was-rwhite', 'Rachaad White', '2026–', 'Caught 64 passes in a season once and arrived to do it here.', 89, 91, 87, 82, 82, 89, 81],
    ['now-was-kallen', 'Kaytron Allen', '2026–', 'Ran for 3,000 yards at Penn State beside a man who went far higher.', 89, 91, 80, 85, 75, 74, 81],
  ],
};

export const RB_CURRENT: Player[] = Object.entries(POOLS).flatMap(([teamId, rows]) =>
  rows.map(([id, name, years, blurb, speed, burst, juke, power, vision, hands, size]) => ({
    id,
    name,
    teamId,
    position: 'RB' as const,
    years,
    blurb,
    attributes: { speed, burst, juke, power, vision, hands, size },
  })),
);
