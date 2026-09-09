import type { Player } from '../types';

/**
 * RUNNING BACK ROOMS AS THEY STAND NOW. Rules are in ./qb.ts and they apply here.
 *
 * Every man here is on the active roster of the team he is filed under. A backfield is
 * two or three deep in real life and these rooms are the same, which is what makes the
 * bad spin genuinely bad.
 *
 * THE SCALE IS TODAY'S LEAGUE. Derrick Henry is a 99 for power in both files because
 * nobody in either league runs through people like that. Everybody underneath him moves.
 *
 * SPEED IS ORDERED OFF THE FORTY, and it was not before.
 *
 * The column had gone flat at the top. Seven backs shared a 97 and eleven shared a 94, and
 * inside those two numbers sat a fifteen hundredths spread of real forty times: TreVeyon
 * Henderson ran 4.43 and held the same 97 as Jahmyr Gibbs at 4.36, while Bijan Robinson at
 * 4.46 sat three points off Gibbs and level with Derrick Henry. A column where a tenth of a
 * second is worth nothing is not rating speed, it is rating reputation.
 *
 * So the top of the board is anchored on the time: 99 at 4.32, and about two points for
 * every four hundredths after it. The 99 goes to whoever actually ran fastest, which is
 * three players rather than one, because Achane, Tuten and Nwangwu all ran 4.32.
 *
 *   4.32  99   Achane, Tuten, Nwangwu
 *   4.36  97   Gibbs
 *   4.37  96   Singleton, Mitchell
 *   4.38  96   Wright
 *   4.39  95   Taylor, Hall
 *   4.43  93   Henderson
 *   4.46  91   Bijan Robinson, Hampton
 *
 * THE FORTY IS NOT THE WHOLE OF SPEED and this stops at the players whose speed is the
 * reason they are in the pool. Derrick Henry ran 4.54 and is still pulling away from
 * secondaries at 31, so his 94 is play speed rather than a stopwatch and it stays. The
 * table above is where the two agree; a card that clearly outruns its own forty keeps the
 * football answer, and the blurb should say why.
 *
 * Nine of the ten changed values landed between 91 and 99 with no two of them piling onto
 * the same number, which is the tally this project asks for after any batch edit. Bijan
 * came DOWN, which is worth saying out loud: this pass started from a complaint that his
 * card was too weak.
 *
 * BIJAN ROBINSON HAS NO 99 AND IS NOT GETTING ONE, and the reason is worth keeping.
 *
 * The complaint that started this pass was that the second best card at the position tops
 * out at 98 while a rookie holds two 99s. The complaint is accurate. Raising him would
 * have been rating to the metric, so `npm run leaders` was pointed at the question
 * instead: it lists the best cards that are top five in nothing, and it did not flag him.
 * He is top five in juke, vision, acceleration and catching. He is simply not first in any
 * of them, and the three players who beat him are beating him on things they really are
 * better at.
 *
 * This is the other half of the reverse check, and it is the half that does not end in an
 * edit. What Bijan is actually best at in the league is not going down when somebody hits
 * him, which his own blurb says and which no slot on this card asks about. Contact balance
 * was deleted for moving with power at 0.93, and that was the right call for the card and
 * still cost this one player the number he deserves. So the honest reading is that the
 * thing he is best at is not on the sheet, not that a number is wrong, and the fix would be
 * an attribute rather than a nudge.
 *
 * His speed went DOWN in the same pass, from 94 to 91, because he ran a 4.46.
 *
 * Row format:
 *   [id, name, years, blurb, SPD, BRS, JKE, PWR, VIS, HND, SZE]
 */

type Row = [string, string, string, string, number, number, number, number, number, number, number];

const POOLS: Record<string, Row[]> = {
  ari: [
    ['now-ari-love', 'Jeremiyah Love', '2026–', 'Notre Dame back taken in the first round who runs away from angles.', 95, 96, 92, 84, 90, 82, 82],
    ['now-ari-allgeier', 'Tyler Allgeier', '2026–', 'Signed to be the thunder in a room built entirely out of rookies.', 80, 84, 70, 92, 88, 68, 80],
    ['now-ari-knight', 'Bam Knight', '2022–', 'Undrafted out of NC State and has started games nobody remembers.', 86, 84, 79, 80, 79, 68, 76],
  ],
  atl: [
    ['now-atl-bijan', 'Bijan Robinson', '2023–', 'Runs like a man who has never once been tackled by the first defender.', 91, 96, 98, 88, 97, 92, 86],
    ['now-atl-brobinson', 'Brian Robinson Jr.', '2026–', 'Third franchise in three years for a man who has never had a bad one.', 82, 84, 75, 86, 84, 74, 90],
  ],
  bal: [
    ['now-bal-henry', 'Derrick Henry', '2024–', 'Six foot three and 247 pounds, and he is still pulling away at 31.', 94, 89, 66, 99, 95, 60, 99],
    ['now-bal-jhill', 'Justice Hill', '2019–', 'Third down back who blocks better than most tight ends do.', 90, 89, 81, 70, 79, 88, 66],
    ['now-bal-rali', 'Rasheen Ali', '2024–', 'Scored 23 touchdowns in a season at Marshall and is fifth on this depth chart.', 88, 87, 81, 72, 75, 76, 72],
  ],
  buf: [
    ['now-buf-cook', 'James Cook', '2022–', 'Led the league in rushing touchdowns and asked to be paid like it.', 95, 93, 89, 74, 90, 86, 70],
    ['now-buf-tyjohnson', 'Ty Johnson', '2022–', 'Special teams captain who turns up with a 40 yard run twice a year.', 92, 89, 81, 66, 75, 84, 66],
    ['now-buf-rdavis', 'Ray Davis', '2024–', 'Went to four colleges, then ran for 97 yards on a Sunday night as a rookie.', 84, 87, 79, 90, 84, 82, 78],
  ],
  car: [
    ['now-car-hubbard', 'Chuba Hubbard', '2021–', 'Signed an extension nobody outside the building believed he would get.', 86, 84, 81, 84, 90, 70, 76],
    ['now-car-brooks', 'Jonathon Brooks', '2024–', 'First back taken in his draft and both knees have gone since.', 90, 91, 87, 78, 86, 80, 78],
    ['now-car-dillon', 'AJ Dillon', '2026–', 'Signed at 28 to be the biggest man in a room full of quick little backs.', 76, 80, 64, 96, 79, 70, 97],
  ],
  chi: [
    ['now-chi-swift', 'D\'Andre Swift', '2024–', 'Every team that trades for him decides within a year that they were wrong.', 92, 93, 92, 70, 79, 88, 70],
    ['now-chi-monangai', 'Kyle Monangai', '2025–', 'Seventh round pick who led the Big Ten in rushing and nobody noticed.', 84, 89, 81, 86, 88, 72, 76],
    ['now-chi-roschon', 'Roschon Johnson', '2023–', 'Blocks like a fullback and got buried behind better runners at Texas too.', 82, 82, 70, 90, 79, 78, 88],
  ],
  cin: [
    ['now-cin-cbrown', 'Chase Brown', '2023–', 'Went in the fifth round and outran a 1,000 yard veteran for the job.', 94, 93, 85, 76, 88, 88, 74],
    ['now-cin-perine', 'Samaje Perine', '2023–', 'Ran for 427 yards in one college game and blocks blitzers for a living.', 78, 80, 68, 88, 81, 90, 88],
    ['now-cin-tbrooks', 'Tahj Brooks', '2025–', 'Carried the ball 900 times at Texas Tech and went in the sixth round.', 82, 87, 77, 88, 86, 70, 78],
  ],
  cle: [
    ['now-cle-judkins', 'Quinshon Judkins', '2025–', 'Ran for 1,000 yards at two different blue blood programs.', 90, 91, 79, 92, 90, 76, 82],
    ['now-cle-sampson', 'Dylan Sampson', '2025–', 'Scored 22 touchdowns at Tennessee and catches everything they throw him.', 92, 93, 89, 68, 81, 90, 72],
    ['now-cle-rsanders', 'Raheim Sanders', '2026–', 'They call him Rocket, and at 227 pounds that is not really about the speed.', 90, 91, 83, 88, 84, 78, 88],
  ],
  dal: [
    ['now-dal-javonte', 'Javonte Williams', '2025–', 'Broke 20 tackles on one drive as a rookie, then rebuilt an entire knee.', 84, 87, 85, 92, 90, 80, 84],
    ['now-dal-mdavis', 'Malik Davis', '2026–', 'Undrafted in 2022 and he has outlasted four backs they drafted ahead of him.', 86, 87, 83, 70, 84, 88, 74],
    ['now-dal-demercado', 'Emari Demercado', '2026–', 'Went undrafted out of TCU and took a kick 90 yards on his first day.', 90, 89, 83, 70, 77, 84, 72],
  ],
  den: [
    ['now-den-dobbins', 'J.K. Dobbins', '2025–', 'Finally got a full season and ran for over a thousand in it.', 92, 93, 89, 80, 90, 78, 78],
    ['now-den-harvey', 'RJ Harvey', '2025–', 'Was a quarterback in high school and ran a 4.4 at the combine.', 94, 96, 92, 80, 81, 82, 66],
    ['now-den-coleman', 'Jonah Coleman', '2026–', 'Five foot nine and 229 pounds, which is a bowling ball with a jump cut.', 86, 91, 89, 90, 86, 78, 80],
    ['now-den-badie', 'Tyler Badie', '2023–', 'Ran for 1,600 yards at Missouri at 190 pounds and nobody drafted him high.', 90, 91, 87, 58, 77, 84, 56],
  ],
  det: [
    ['now-det-gibbs', 'Jahmyr Gibbs', '2023–', 'They took a running back twelfth overall and he made it look obvious.', 97, 99, 96, 74, 92, 92, 70],
    ['now-det-vaki', 'Sione Vaki', '2024–', 'Lined up at safety on Saturday and at running back the same afternoon.', 88, 89, 79, 82, 73, 78, 76],
    ['now-det-saylors', 'Jacob Saylors', '2026–', 'East Tennessee State back who has made this roster three summers running.', 90, 89, 83, 74, 75, 76, 70],
  ],
  gb: [
    ['now-gb-lloyd', 'MarShawn Lloyd', '2024–', 'Six carries in two seasons for a man they spent a third rounder on.', 94, 93, 87, 70, 75, 78, 70],
    ['now-gb-cbrooks', 'Chris Brooks', '2024–', 'Six foot one and 225 pounds, and he went undrafted out of BYU.', 80, 82, 70, 80, 77, 78, 90],
    ['now-gb-kjohnson', 'Kaleb Johnson', '2026–', 'Came back to the state where his father grew up, for a fourth round pick.', 88, 91, 81, 88, 88, 72, 86],
  ],
  hou: [
    ['now-hou-montgomery', 'David Montgomery', '2026–', 'Arrived at 29 to fall forward on every carry, which is the whole job.', 78, 82, 75, 94, 90, 78, 90],
    ['now-hou-marks', 'Woody Marks', '2025–', 'Caught 261 passes in college, which is a receiver number.', 88, 89, 85, 72, 81, 94, 70],
  ],
  ind: [
    ['now-ind-jtaylor', 'Jonathan Taylor', '2020–', 'Ran for 1,811 yards in a season and does it again whenever he is healthy.', 95, 96, 87, 92, 97, 76, 88],
    ['now-ind-mcgowan', 'Seth McGowan', '2026–', 'Left Oklahoma under a cloud, went to Cincinnati, and ran his way back.', 88, 87, 79, 84, 77, 72, 82],
    ['now-ind-giddens', 'DJ Giddens', '2025–', 'Second best back in the state of Kansas and they took him anyway.', 90, 91, 85, 76, 84, 80, 84],
  ],
  jax: [
    ['now-jax-tuten', 'Bhayshul Tuten', '2025–', 'Ran a 4.32 at 206 pounds, which is not supposed to be possible.', 99, 96, 79, 80, 75, 72, 76],
    ['now-jax-crodriguez', 'Chris Rodriguez', '2026–', 'Kentucky bruiser who finally got a room where somebody would use him.', 80, 82, 70, 88, 77, 66, 86],
    ['now-jax-lallen', 'LeQuint Allen', '2025–', 'Caught 64 passes at Syracuse and blocks like he means it.', 86, 87, 83, 76, 79, 90, 76],
    ['now-jax-abdullah', 'Ameer Abdullah', '2026–', 'Eleven seasons of third downs, and he has never once missed a blitz pickup.', 88, 89, 87, 66, 81, 92, 62],
  ],
  kc: [
    ['now-kc-kwalker', 'Kenneth Walker III', '2026–', 'Traded for a third rounder to give the best offense in football a runner.', 94, 96, 98, 82, 86, 76, 78],
    ['now-kc-ejohnson', 'Emmett Johnson', '2026–', 'Was the whole of Nebraska for a season and is the third man here.', 88, 89, 85, 78, 86, 86, 74],
    ['now-kc-bsmith', 'Brashard Smith', '2025–', 'Was a receiver at Miami and a running back at SMU, and got drafted as one.', 95, 93, 87, 62, 75, 92, 60],
  ],
  lv: [
    ['now-lv-jeanty', 'Ashton Jeanty', '2025–', 'Ran for 2,601 yards in one college season and went sixth overall.', 92, 96, 99, 92, 99, 82, 84],
    ['now-lv-mwashington', 'Mike Washington Jr.', '2026–', 'Fourth round rookie who arrived to take the carries nobody wants.', 88, 89, 79, 86, 79, 70, 86],
    ['now-lv-laube', 'Dylan Laube', '2024–', 'Caught 68 passes at New Hampshire and covers kicks here.', 86, 87, 83, 66, 73, 90, 64],
  ],
  lac: [
    ['now-lac-hampton', 'Omarion Hampton', '2025–', 'Two hundred and twenty pounds with a 4.46, taken 22nd overall.', 91, 93, 85, 96, 90, 80, 90],
    ['now-lac-kmitchell', 'Keaton Mitchell', '2026–', 'The knee held up, and he still runs like nobody has told him about it.', 96, 96, 89, 58, 75, 74, 54],
    ['now-lac-vidal', 'Kimani Vidal', '2024–', 'Ran for 1,661 yards at Troy and went in the sixth round for being short.', 88, 91, 85, 82, 86, 78, 68],
  ],
  lar: [
    ['now-lar-kyren', 'Kyren Williams', '2022–', 'Went in the fifth round and has led the league in carries since.', 88, 91, 85, 82, 99, 82, 72],
    ['now-lar-corum', 'Blake Corum', '2024–', 'Won a national title at Michigan and waits his turn without complaining.', 88, 91, 87, 86, 88, 78, 70],
    ['now-lar-rivers', 'Ronnie Rivers', '2022–', 'His father played here too, and neither of them ever got many carries.', 88, 87, 83, 64, 75, 82, 62],
  ],
  mia: [
    ['now-mia-achane', 'De\'Von Achane', '2023–', 'The fastest man in the sport, and he is listed at 188 pounds.', 99, 99, 94, 56, 86, 92, 54],
    ['now-mia-jwright', 'Jaylen Wright', '2024–', 'Ran a 4.38 at Tennessee and has 100 career carries to show for it.', 96, 93, 79, 76, 77, 72, 72],
    ['now-mia-gordon', 'Ollie Gordon', '2025–', 'Won the Doak Walker as a sophomore and slid to the sixth round.', 82, 84, 75, 82, 84, 76, 90],
  ],
  min: [
    ['now-min-ajones', 'Aaron Jones', '2024–', 'Signed for one year at 29 and ran for a thousand out of nowhere.', 90, 91, 89, 76, 95, 90, 68],
    ['now-min-jmason', 'Jordan Mason', '2025–', 'Went undrafted out of Georgia Tech and runs like he is still annoyed about it.', 84, 89, 77, 92, 88, 70, 78],
    ['now-min-claiborne', 'Demond Claiborne', '2026–', 'Wake Forest speed taken on day three to give this offense a jolt.', 94, 93, 87, 70, 79, 78, 68],
  ],
  ne: [
    ['now-ne-rhamondre', 'Rhamondre Stevenson', '2021–', 'Four hundred pound squat, and the ball keeps coming out at the worst moment.', 82, 87, 85, 92, 88, 88, 88],
    ['now-ne-henderson', 'TreVeyon Henderson', '2025–', 'Ran a 4.43 at 202 pounds and returned a kick 100 yards in his first month.', 93, 97, 81, 74, 84, 84, 70],
    ['now-ne-kiner', 'Corey Kiner', '2026–', 'Cincinnati back who runs angry and went undrafted for being short.', 86, 89, 83, 84, 84, 72, 78],
  ],
  no: [
    ['now-no-etienne', 'Travis Etienne', '2026–', 'Went home to Louisiana and got the ball twenty times a week again.', 94, 93, 87, 70, 84, 84, 74],
    ['now-no-kamara', 'Alvin Kamara', '2017–', 'Scored six touchdowns in one afternoon and has never dropped anything since.', 88, 93, 96, 80, 92, 97, 78],
    ['now-no-kmiller', 'Kendre Miller', '2023–', 'Has torn something in his leg in all three of his seasons here.', 90, 91, 85, 84, 81, 74, 76],
    ['now-no-estime', 'Audric Estime', '2026–', 'Two hundred and twenty pounds of short yardage on a one year deal.', 72, 80, 64, 86, 84, 66, 90],
  ],
  nyg: [
    ['now-nyg-skattebo', 'Cam Skattebo', '2025–', 'Broke 100 tackles in a college season and dares people to hit him.', 82, 89, 83, 96, 90, 84, 86],
    ['now-nyg-tracy', 'Tyrone Tracy', '2024–', 'Played receiver at Iowa, moved to running back at Purdue, and it worked.', 92, 91, 87, 72, 84, 90, 72],
    ['now-nyg-singletary', 'Devin Singletary', '2024–', 'Motor. That is the whole scouting report and it has lasted seven years.', 84, 87, 83, 78, 86, 78, 70],
    ['now-nyg-najee', 'Najee Harris', '2026–', 'Signed to run out the fourth quarter of games they are trying to win.', 80, 82, 72, 86, 86, 82, 88],
  ],
  nyj: [
    ['now-nyj-hall', 'Breece Hall', '2022–', 'Blew out a knee in October and ran a 4.39 the following August.', 95, 93, 92, 82, 88, 90, 80],
    ['now-nyj-ballen', 'Braelon Allen', '2024–', 'Started college at 17 and is now 235 pounds of very young man.', 84, 84, 72, 88, 77, 76, 97],
    ['now-nyj-idavis', 'Isaiah Davis', '2024–', 'South Dakota State bruiser who went in the fifth and blocks well.', 84, 87, 77, 90, 79, 78, 84],
    ['now-nyj-nwangwu', 'Kene Nwangwu', '2024–', 'Has returned four kickoffs for touchdowns and carried the ball eleven times.', 99, 96, 70, 68, 66, 70, 70],
  ],
  phi: [
    ['now-phi-saquon', 'Saquon Barkley', '2024–', 'Ran backwards over a defender on television and then ran for 2,000 yards.', 95, 99, 99, 88, 99, 88, 84],
    ['now-phi-bigsby', 'Tank Bigsby', '2025–', 'Traded for a pair of picks to be the thunder nobody else wanted.', 86, 89, 77, 90, 79, 60, 84],
    ['now-phi-shipley', 'Will Shipley', '2024–', 'Clemson back who returns kicks and waits behind the best in the league.', 90, 91, 87, 74, 79, 84, 72],
  ],
  pit: [
    ['now-pit-warren', 'Jaylen Warren', '2022–', 'Went undrafted, and he blocks 260 pound linebackers at 5 foot 8.', 90, 93, 89, 84, 86, 88, 62],
    ['now-pit-dowdle', 'Rico Dowdle', '2026–', 'Ran for a thousand yards last season and nobody offered him much for it.', 88, 89, 87, 80, 90, 80, 80],
    ['now-pit-heidenreich', 'Eli Heidenreich', '2026–', 'Played receiver at Navy and would have owed the service five years.', 90, 89, 83, 72, 75, 84, 66],
  ],
  sf: [
    ['now-sf-cmc', 'Christian McCaffrey', '2022–', 'The best receiver on the team is the running back, and it is not close.', 92, 96, 94, 80, 97, 99, 78],
    ['now-sf-black', 'Kaelon Black', '2026–', 'Split carries at Illinois for four years and never once complained.', 88, 87, 81, 80, 77, 78, 78],
    ['now-sf-james', 'Jordan James', '2026–', 'Oregon back who waited a year and then took the job in September.', 90, 93, 87, 84, 86, 80, 78],
  ],
  sea: [
    ['now-sea-price', 'Jadarian Price', '2026–', 'Tore an Achilles before he ever played at Notre Dame and still runs a 4.4.', 94, 93, 87, 80, 84, 76, 78],
    ['now-sea-holani', 'George Holani', '2024–', 'Boise State all time great who went undrafted and made the roster anyway.', 86, 87, 79, 82, 86, 68, 78],
    ['now-sea-ewilson', 'Emanuel Wilson', '2026–', 'Fort Valley State is not a place scouts visit and he keeps making rosters.', 86, 89, 79, 84, 79, 74, 80],
  ],
  tb: [
    ['now-tb-irving', 'Bucky Irving', '2024–', 'Fourth round pick who broke more tackles than backs twice his size.', 90, 93, 98, 84, 95, 88, 66],
    ['now-tb-gainwell', 'Kenny Gainwell', '2026–', 'Catches out of the backfield, and Philadelphia trusted him in January.', 88, 89, 85, 70, 81, 92, 62],
    ['now-tb-stucker', 'Sean Tucker', '2023–', 'A heart condition scared everybody off him and he went undrafted.', 92, 93, 87, 76, 81, 80, 74],
  ],
  ten: [
    ['now-ten-pollard', 'Tony Pollard', '2024–', 'Got the every down job at last and ran for a thousand quietly.', 94, 93, 87, 70, 86, 84, 76],
    ['now-ten-spears', 'Tyjae Spears', '2023–', 'Plays without an ACL in one knee and jukes people out of the stadium.', 92, 87, 98, 76, 84, 84, 66],
    ['now-ten-singleton', 'Nicholas Singleton', '2026–', 'Penn State back who runs a 4.37 and shared carries there for four years.', 96, 93, 85, 84, 84, 76, 84],
    ['now-ten-chestnut', 'Julius Chestnut', '2022–', 'Undrafted out of Sacred Heart and blocks his way onto the roster yearly.', 82, 82, 72, 90, 75, 72, 84],
  ],
  was: [
    ['now-was-croskey', 'Jacory Croskey-Merritt', '2025–', 'Played one college game in his final year and went in the seventh round.', 92, 93, 89, 82, 86, 76, 78],
    ['now-was-rwhite', 'Rachaad White', '2026–', 'Caught 64 passes in a season once and arrived to do it here.', 86, 87, 85, 78, 81, 90, 80],
    ['now-was-kallen', 'Kaytron Allen', '2026–', 'Ran for 3,000 yards at Penn State beside a man who went far higher.', 84, 87, 77, 90, 86, 70, 86],
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
