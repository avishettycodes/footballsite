import type { Player } from '../types';

/**
 * RUNNING BACK ROOMS AS THEY STAND NOW. Same rules as ./qb.ts, and read the note there
 * about what "current" means before adding anybody.
 *
 * THE SCALE IS THE CURRENT LEAGUE AND NOTHING ELSE. Derrick Henry is a 99 for power here
 * because nobody playing hits like that, and he is a 99 in the all-time file for the same
 * reason. Josh Jacobs is a 94 here and an 88 there, because the company changed. Where the
 * two files disagree, they are answering two different questions and both answers stand.
 *
 * A back is in the pool for ONE number. The spikes are spread across the room on purpose,
 * so a franchise can answer some slots and not others: Cincinnati cannot hand you power,
 * Detroit cannot hand you size, and landing there with those slots still open is meant to
 * hurt.
 *
 * Row format:
 *   [id, name, years, blurb, SPD, BRS, JKE, PWR, VIS, HND, SZE]
 */
type Row = [string, string, string, string, number, number, number, number, number, number, number];

const POOLS: Record<string, Row[]> = {
  ari: [
    ['now-ari-love', 'Jeremiyah Love', '2026–', 'Notre Dame back taken in the first round who runs away from angles.', 95, 94, 90, 84, 88, 82, 82],
    ['now-ari-allgeier', 'Tyler Allgeier', '2026–', 'Signed to be the thunder in a room built entirely out of rookies.', 80, 84, 70, 92, 86, 68, 80],
    ['now-ari-knight', 'Bam Knight', '2022–', 'Undrafted out of NC State and has started games nobody remembers.', 86, 84, 78, 80, 78, 68, 76],
  ],
  atl: [
    ['now-atl-bijan', 'Bijan Robinson', '2023–', 'Runs like a man who has never once been tackled by the first defender.', 94, 94, 96, 88, 94, 92, 86],
    ['now-atl-brobinson', 'Brian Robinson Jr.', '2026–', 'Third franchise in three years for a man who has never had a bad one.', 82, 84, 74, 86, 82, 74, 90],
    ['now-atl-goodson', 'Tyler Goodson', '2026–', 'Has been on three practice squads and keeps getting called back up.', 90, 88, 82, 64, 76, 72, 62],
    ['now-atl-cjones', 'Cash Jones', '2026–', 'Caught more than he carried at Tennessee, which is the job here too.', 88, 86, 84, 66, 74, 88, 62],
  ],
  bal: [
    ['now-bal-henry', 'Derrick Henry', '2024–', 'Six foot three and 247 pounds, and he is still pulling away at 31.', 94, 88, 66, 99, 92, 60, 99],
    ['now-bal-jhill', 'Justice Hill', '2019–', 'Third down back who blocks better than most tight ends do.', 90, 88, 80, 70, 78, 88, 66],
    ['now-bal-rali', 'Rasheen Ali', '2024–', 'Scored 23 touchdowns in a season at Marshall and is fifth on this depth chart.', 88, 86, 80, 72, 74, 76, 72],
  ],
  buf: [
    ['now-buf-cook', 'James Cook', '2022–', 'Led the league in rushing touchdowns and asked to be paid like it.', 95, 92, 88, 74, 88, 86, 70],
    ['now-buf-tyjohnson', 'Ty Johnson', '2022–', 'Special teams captain who turns up with a 40 yard run twice a year.', 92, 88, 80, 66, 74, 84, 66],
    ['now-buf-rdavis', 'Ray Davis', '2024–', 'Went to four colleges, then ran for 97 yards on a Sunday night as a rookie.', 84, 86, 78, 90, 82, 82, 78],
    ['now-buf-goreJr', 'Frank Gore Jr.', '2024–', 'His father ran for 16,000 yards, and the name is the easy part.', 88, 88, 82, 82, 80, 74, 68],
  ],
  car: [
    ['now-car-hubbard', 'Chuba Hubbard', '2021–', 'Signed an extension nobody outside the building believed he would get.', 86, 84, 80, 84, 88, 70, 76],
    ['now-car-brooks', 'Jonathon Brooks', '2024–', 'First back taken in his draft and both knees have gone since.', 90, 90, 86, 78, 84, 80, 78],
    ['now-car-dillon', 'AJ Dillon', '2026–', 'Signed at 28 to be the biggest man in a room full of quick little backs.', 76, 80, 64, 96, 78, 70, 97],
    ['now-car-tyus', 'Anthony Tyus III', '2026–', 'Northwestern to Ohio, and he runs like the pile is a personal insult.', 86, 84, 76, 86, 78, 70, 84],
  ],
  chi: [
    ['now-chi-swift', 'D\'Andre Swift', '2024–', 'Every team that trades for him decides within a year that they were wrong.', 92, 92, 90, 70, 78, 88, 70],
    ['now-chi-monangai', 'Kyle Monangai', '2025–', 'Seventh round pick who led the Big Ten in rushing and nobody noticed.', 84, 88, 80, 86, 86, 72, 76],
    ['now-chi-roschon', 'Roschon Johnson', '2023–', 'Blocks like a fullback and got buried behind better runners at Texas too.', 82, 82, 70, 90, 78, 78, 88],
    ['now-chi-xscott', 'Zavier Scott', '2024–', 'Played quarterback at Maine and now picks up blitzers on third down.', 84, 82, 74, 74, 70, 88, 74],
  ],
  cin: [
    ['now-cin-cbrown', 'Chase Brown', '2023–', 'Went in the fifth round and outran a 1,000 yard veteran for the job.', 94, 92, 84, 76, 86, 88, 74],
    ['now-cin-perine', 'Samaje Perine', '2023–', 'Ran for 427 yards in one college game and blocks blitzers for a living.', 78, 80, 68, 88, 80, 90, 88],
    ['now-cin-tbrooks', 'Tahj Brooks', '2025–', 'Carried the ball 900 times at Texas Tech and went in the sixth round.', 82, 86, 76, 88, 84, 70, 78],
    ['now-cin-milton', 'Kendall Milton', '2026–', 'Two hundred and twenty pounds of Georgia running back on a practice squad.', 84, 86, 74, 90, 78, 68, 90],
  ],
  cle: [
    ['now-cle-judkins', 'Quinshon Judkins', '2025–', 'Ran for 1,000 yards at two different blue blood programs.', 90, 90, 78, 92, 88, 76, 82],
    ['now-cle-sampson', 'Dylan Sampson', '2025–', 'Scored 22 touchdowns at Tennessee and catches everything they throw him.', 92, 92, 88, 68, 80, 90, 72],
    ['now-cle-rsanders', 'Raheim Sanders', '2026–', 'They call him Rocket, and at 227 pounds that is not really about the speed.', 90, 90, 82, 88, 82, 78, 88],
  ],
  dal: [
    ['now-dal-javonte', 'Javonte Williams', '2025–', 'Broke 20 tackles on one drive as a rookie, then rebuilt an entire knee.', 84, 86, 84, 92, 88, 80, 84],
    ['now-dal-mdavis', 'Malik Davis', '2026–', 'Undrafted in 2022 and he has outlasted four backs they drafted ahead of him.', 86, 86, 82, 70, 82, 88, 74],
    ['now-dal-demercado', 'Emari Demercado', '2026–', 'Went undrafted out of TCU and took a kick 90 yards on his first day.', 90, 88, 82, 70, 76, 84, 72],
    ['now-dal-abanikanda', 'Israel Abanikanda', '2026–', 'Ran for 1,431 yards at Pitt in one season and has 200 as a professional.', 94, 90, 82, 74, 74, 72, 76],
  ],
  den: [
    ['now-den-dobbins', 'J.K. Dobbins', '2025–', 'Finally got a full season and ran for over a thousand in it.', 92, 92, 88, 80, 88, 78, 78],
    ['now-den-harvey', 'RJ Harvey', '2025–', 'Was a quarterback in high school and ran a 4.4 at the combine.', 94, 94, 90, 80, 80, 82, 66],
    ['now-den-coleman', 'Jonah Coleman', '2026–', 'Five foot nine and 229 pounds, which is a bowling ball with a jump cut.', 86, 90, 88, 90, 84, 78, 80],
    ['now-den-badie', 'Tyler Badie', '2023–', 'Ran for 1,600 yards at Missouri at 190 pounds and nobody drafted him high.', 90, 90, 86, 58, 76, 84, 56],
  ],
  det: [
    ['now-det-gibbs', 'Jahmyr Gibbs', '2023–', 'They took a running back twelfth overall and he made it look obvious.', 97, 97, 94, 74, 90, 92, 70],
    ['now-det-vaki', 'Sione Vaki', '2024–', 'Lined up at safety on Saturday and at running back the same afternoon.', 88, 88, 78, 82, 72, 78, 76],
    ['now-det-saylors', 'Jacob Saylors', '2026–', 'East Tennessee State back who has made this roster three summers running.', 90, 88, 82, 74, 74, 76, 70],
    ['now-det-small', 'Jabari Small', '2026–', 'Scored the touchdown that beat Alabama and Tennessee still sings about it.', 86, 86, 76, 88, 76, 64, 80],
  ],
  gb: [
    ['now-gb-lloyd', 'MarShawn Lloyd', '2024–', 'Six carries in two seasons for a man they spent a third rounder on.', 94, 92, 86, 70, 74, 78, 70],
    ['now-gb-cbrooks', 'Chris Brooks', '2024–', 'Six foot one and 225 pounds, and he went undrafted out of BYU.', 80, 82, 70, 80, 76, 78, 90],
    ['now-gb-kjohnson', 'Kaleb Johnson', '2026–', 'Came back to the state where his father grew up, for a fourth round pick.', 88, 90, 80, 88, 86, 72, 86],
    ['now-gb-strong', 'Pierre Strong', '2026–', 'Fourth franchise in five years, and the 4.37 is still on the tape.', 92, 88, 80, 70, 72, 78, 68],
  ],
  hou: [
    ['now-hou-montgomery', 'David Montgomery', '2026–', 'Arrived at 29 to fall forward on every carry, which is the whole job.', 78, 82, 74, 94, 88, 78, 90],
    ['now-hou-marks', 'Woody Marks', '2025–', 'Caught 261 passes in college, which is a receiver number.', 88, 88, 84, 72, 80, 94, 70],
    ['now-hou-jjordan', 'Jawhar Jordan', '2026–', 'Louisville speed at 190 pounds, which is exactly why he is on a squad.', 94, 90, 86, 62, 76, 74, 60],
    ['now-hou-whittington', 'Noah Whittington', '2026–', 'Quicker than everybody at Oregon and smaller than everybody here.', 92, 90, 84, 68, 76, 78, 66],
  ],
  ind: [
    ['now-ind-jtaylor', 'Jonathan Taylor', '2020–', 'Ran for 1,811 yards in a season and does it again whenever he is healthy.', 97, 94, 86, 92, 94, 76, 88],
    ['now-ind-giddens', 'DJ Giddens', '2025–', 'Second best back in the state of Kansas and they took him anyway.', 90, 90, 84, 76, 82, 80, 84],
    ['now-ind-mcgowan', 'Seth McGowan', '2026–', 'Left Oklahoma under a cloud, went to Cincinnati, and ran his way back.', 88, 86, 78, 84, 76, 72, 82],
  ],
  jax: [
    ['now-jax-tuten', 'Bhayshul Tuten', '2025–', 'Ran a 4.32 at 206 pounds, which is not supposed to be possible.', 97, 94, 78, 80, 74, 72, 76],
    ['now-jax-crodriguez', 'Chris Rodriguez', '2026–', 'Kentucky bruiser who finally got a room where somebody would use him.', 80, 82, 70, 88, 76, 66, 86],
    ['now-jax-lallen', 'LeQuint Allen', '2025–', 'Caught 64 passes at Syracuse and blocks like he means it.', 86, 86, 82, 76, 78, 90, 76],
    ['now-jax-abdullah', 'Ameer Abdullah', '2026–', 'Eleven seasons of third downs, and he has never once missed a blitz pickup.', 88, 88, 86, 66, 80, 92, 62],
  ],
  kc: [
    ['now-kc-kwalker', 'Kenneth Walker III', '2026–', 'Traded for a third rounder to give the best offense in football a runner.', 94, 94, 96, 82, 84, 76, 78],
    ['now-kc-bsmith', 'Brashard Smith', '2025–', 'Was a receiver at Miami and a running back at SMU, and got drafted as one.', 95, 92, 86, 62, 74, 92, 60],
    ['now-kc-ejohnson', 'Emmett Johnson', '2026–', 'Was the whole of Nebraska for a season and is the third man here.', 88, 88, 84, 78, 84, 86, 74],
    ['now-kc-ott', 'Jaydn Ott', '2026–', 'Was the best back in his conference at 19 and never got back to it.', 92, 90, 86, 72, 80, 80, 72],
  ],
  lv: [
    ['now-lv-jeanty', 'Ashton Jeanty', '2025–', 'Ran for 2,601 yards in one college season and went sixth overall.', 92, 94, 97, 92, 96, 82, 84],
    ['now-lv-laube', 'Dylan Laube', '2024–', 'Caught 68 passes at New Hampshire and covers kicks here.', 86, 86, 82, 66, 72, 90, 64],
    ['now-lv-mwashington', 'Mike Washington Jr.', '2026–', 'Fourth round rookie who arrived to take the carries nobody wants.', 88, 88, 78, 86, 78, 70, 86],
  ],
  lac: [
    ['now-lac-hampton', 'Omarion Hampton', '2025–', 'Two hundred and twenty pounds with a 4.46, taken 22nd overall.', 92, 92, 84, 96, 88, 80, 90],
    ['now-lac-kmitchell', 'Keaton Mitchell', '2026–', 'The knee held up, and he still runs like nobody has told him about it.', 97, 94, 88, 58, 74, 74, 54],
    ['now-lac-vidal', 'Kimani Vidal', '2024–', 'Ran for 1,661 yards at Troy and went in the sixth round for being short.', 88, 90, 84, 82, 84, 78, 68],
    ['now-lac-desrosiers', 'Gregory Desrosiers', '2026–', 'Two hundred and thirty pounds that nobody drafted, hitting the pile in August.', 88, 86, 78, 82, 74, 74, 82],
  ],
  lar: [
    ['now-lar-kyren', 'Kyren Williams', '2022–', 'Went in the fifth round and has led the league in carries since.', 88, 90, 84, 82, 96, 82, 72],
    ['now-lar-corum', 'Blake Corum', '2024–', 'Won a national title at Michigan and waits his turn without complaining.', 88, 90, 86, 86, 86, 78, 70],
    ['now-lar-rivers', 'Ronnie Rivers', '2022–', 'His father played here too, and neither of them ever got many carries.', 88, 86, 82, 64, 74, 82, 62],
    ['now-lar-connors', 'Dean Connors', '2026–', 'Rice back who catches everything and has never been the biggest anywhere.', 88, 88, 84, 70, 78, 90, 68],
  ],
  mia: [
    ['now-mia-achane', 'De\'Von Achane', '2023–', 'The fastest man in the sport, and he is listed at 188 pounds.', 99, 97, 92, 56, 84, 92, 54],
    ['now-mia-jwright', 'Jaylen Wright', '2024–', 'Ran a 4.38 at Tennessee and has 100 career carries to show for it.', 95, 92, 78, 76, 76, 72, 72],
    ['now-mia-gordon', 'Ollie Gordon', '2025–', 'Won the Doak Walker as a sophomore and slid to the sixth round.', 82, 84, 74, 82, 82, 76, 90],
    ['now-mia-jhunter', 'Jarquez Hunter', '2025–', 'Ran for 1,200 yards at Auburn and went in the fourth round.', 92, 92, 78, 82, 80, 74, 76],
  ],
  min: [
    ['now-min-ajones', 'Aaron Jones', '2024–', 'Signed for one year at 29 and ran for a thousand out of nowhere.', 90, 90, 88, 76, 92, 90, 68],
    ['now-min-jmason', 'Jordan Mason', '2025–', 'Went undrafted out of Georgia Tech and runs like he is still annoyed about it.', 84, 88, 76, 92, 86, 70, 78],
    ['now-min-dallas', 'DeeJay Dallas', '2026–', 'Covers kicks first and takes a handful of carries when somebody limps off.', 88, 86, 76, 74, 70, 78, 78],
    ['now-min-claiborne', 'Demond Claiborne', '2026–', 'Wake Forest speed taken on day three to give this offense a jolt.', 94, 92, 86, 70, 78, 78, 68],
  ],
  ne: [
    ['now-ne-rhamondre', 'Rhamondre Stevenson', '2021–', 'Four hundred pound squat, and the ball keeps coming out at the worst moment.', 82, 86, 84, 92, 86, 88, 88],
    ['now-ne-henderson', 'TreVeyon Henderson', '2025–', 'Ran a 4.43 at 202 pounds and returned a kick 100 yards in his first month.', 97, 95, 80, 74, 82, 84, 70],
    ['now-ne-kiner', 'Corey Kiner', '2026–', 'Cincinnati back who runs angry and went undrafted for being short.', 86, 88, 82, 84, 82, 72, 78],
    ['now-ne-haskins', 'Hassan Haskins', '2026–', 'Played linebacker for a season and then came back to running back.', 78, 80, 66, 90, 74, 66, 88],
  ],
  no: [
    ['now-no-etienne', 'Travis Etienne', '2026–', 'Went home to Louisiana and got the ball twenty times a week again.', 94, 92, 86, 70, 82, 84, 74],
    ['now-no-kamara', 'Alvin Kamara', '2017–', 'Scored six touchdowns in one afternoon and has never dropped anything since.', 88, 92, 94, 80, 90, 97, 78],
    ['now-no-kmiller', 'Kendre Miller', '2023–', 'Has torn something in his leg in all three of his seasons here.', 90, 90, 84, 84, 80, 74, 76],
    ['now-no-estime', 'Audric Estime', '2026–', 'Two hundred and twenty pounds of short yardage on a one year deal.', 72, 80, 64, 86, 82, 66, 90],
    ['now-no-zwhite', 'Zamir White', '2022–', 'Two torn ACLs in high school and he still ran a 4.4 at Georgia.', 92, 90, 78, 86, 78, 66, 78],
  ],
  nyg: [
    ['now-nyg-skattebo', 'Cam Skattebo', '2025–', 'Broke 100 tackles in a college season and dares people to hit him.', 82, 88, 82, 96, 88, 84, 86],
    ['now-nyg-tracy', 'Tyrone Tracy', '2024–', 'Played receiver at Iowa, moved to running back at Purdue, and it worked.', 92, 90, 86, 72, 82, 90, 72],
    ['now-nyg-singletary', 'Devin Singletary', '2024–', 'Motor. That is the whole scouting report and it has lasted seven years.', 84, 86, 82, 78, 84, 78, 70],
    ['now-nyg-najee', 'Najee Harris', '2026–', 'Signed to run out the fourth quarter of games they are trying to win.', 80, 82, 72, 86, 84, 82, 88],
  ],
  nyj: [
    ['now-nyj-hall', 'Breece Hall', '2022–', 'Blew out a knee in October and ran a 4.39 the following August.', 94, 92, 90, 82, 86, 90, 80],
    ['now-nyj-ballen', 'Braelon Allen', '2024–', 'Started college at 17 and is now 235 pounds of very young man.', 84, 84, 72, 88, 76, 76, 97],
    ['now-nyj-idavis', 'Isaiah Davis', '2024–', 'South Dakota State bruiser who went in the fifth and blocks well.', 84, 86, 76, 90, 78, 78, 84],
    ['now-nyj-nwangwu', 'Kene Nwangwu', '2024–', 'Has returned four kickoffs for touchdowns and carried the ball eleven times.', 97, 94, 70, 68, 66, 70, 70],
  ],
  phi: [
    ['now-phi-saquon', 'Saquon Barkley', '2024–', 'Ran backwards over a defender on television and then ran for 2,000 yards.', 95, 97, 97, 88, 96, 88, 84],
    ['now-phi-bigsby', 'Tank Bigsby', '2025–', 'Traded for a pair of picks to be the thunder nobody else wanted.', 86, 88, 76, 90, 78, 60, 84],
    ['now-phi-shipley', 'Will Shipley', '2024–', 'Clemson back who returns kicks and waits behind the best in the league.', 90, 90, 86, 74, 78, 84, 72],
    ['now-phi-pierce', 'Dameon Pierce', '2022–', 'Ran for 939 yards as a rookie and has been fourth in line since.', 84, 86, 78, 88, 80, 72, 78],
    ['now-phi-steele', 'Carson Steele', '2024–', 'Undrafted 225 pound battering ram who plays fullback when they ask.', 76, 80, 64, 90, 76, 68, 94],
    ['now-phi-blue', 'Jaydon Blue', '2025–', 'Ran a 4.38 at Texas and drops the ball more than anybody would like.', 96, 94, 86, 62, 74, 62, 62],
  ],
  pit: [
    ['now-pit-warren', 'Jaylen Warren', '2022–', 'Went undrafted, and he blocks 260 pound linebackers at 5 foot 8.', 90, 92, 88, 84, 84, 88, 62],
    ['now-pit-dowdle', 'Rico Dowdle', '2026–', 'Ran for a thousand yards last season and nobody offered him much for it.', 88, 88, 86, 80, 88, 80, 80],
    ['now-pit-homer', 'Travis Homer', '2023–', 'Has made a career entirely out of covering kicks.', 90, 86, 74, 66, 68, 78, 66],
    ['now-pit-heidenreich', 'Eli Heidenreich', '2026–', 'Played receiver at Navy and would have owed the service five years.', 90, 88, 82, 72, 74, 84, 66],
  ],
  sf: [
    ['now-sf-cmc', 'Christian McCaffrey', '2022–', 'The best receiver on the team is the running back, and it is not close.', 92, 94, 92, 80, 94, 99, 78],
    ['now-sf-james', 'Jordan James', '2026–', 'Oregon back who waited a year and then took the job in September.', 90, 92, 86, 84, 84, 80, 78],
    ['now-sf-mccormick', 'Sincere McCormick', '2024–', 'Undrafted and five foot nine, and he has broken off long runs anyway.', 90, 90, 88, 78, 82, 74, 60],
    ['now-sf-black', 'Kaelon Black', '2026–', 'Split carries at Illinois for four years and never once complained.', 88, 86, 80, 80, 76, 78, 78],
  ],
  sea: [
    ['now-sea-price', 'Jadarian Price', '2026–', 'Tore an Achilles before he ever played at Notre Dame and still runs a 4.4.', 94, 92, 86, 80, 82, 76, 78],
    ['now-sea-holani', 'George Holani', '2024–', 'Boise State all time great who went undrafted and made the roster anyway.', 86, 86, 78, 82, 84, 68, 78],
    ['now-sea-ewilson', 'Emanuel Wilson', '2026–', 'Fort Valley State is not a place scouts visit and he keeps making rosters.', 86, 88, 78, 84, 78, 74, 80],
    ['now-sea-vjones', 'Velus Jones Jr.', '2026–', 'Went in the third round as a receiver and muffed his way to a new position.', 96, 92, 80, 66, 68, 72, 70],
  ],
  tb: [
    ['now-tb-irving', 'Bucky Irving', '2024–', 'Fourth round pick who broke more tackles than backs twice his size.', 90, 92, 96, 84, 92, 88, 66],
    ['now-tb-gainwell', 'Kenneth Gainwell', '2026–', 'Third down back who turns up in January and does not drop anything.', 88, 88, 84, 68, 78, 88, 66],
    ['now-tb-stucker', 'Sean Tucker', '2023–', 'A heart condition scared everybody off him and he went undrafted.', 92, 92, 86, 76, 80, 80, 74],
    ['now-tb-jwilliams', 'Josh Williams', '2024–', 'Undrafted from Lawrence Tech, which is not a place scouts visit.', 86, 84, 70, 78, 72, 76, 76],
  ],
  ten: [
    ['now-ten-pollard', 'Tony Pollard', '2024–', 'Got the every down job at last and ran for a thousand quietly.', 94, 92, 86, 70, 84, 84, 76],
    ['now-ten-spears', 'Tyjae Spears', '2023–', 'Plays without an ACL in one knee and jukes people out of the stadium.', 92, 86, 96, 76, 82, 84, 66],
    ['now-ten-chestnut', 'Julius Chestnut', '2022–', 'Undrafted out of Sacred Heart and blocks his way onto the roster yearly.', 82, 82, 72, 90, 74, 72, 84],
    ['now-ten-mcarter', 'Michael Carter', '2026–', 'Has landed on four rosters in six years because he catches everything.', 88, 90, 88, 62, 80, 86, 62],
    ['now-ten-mullings', 'Kalel Mullings', '2025–', 'Played linebacker at Michigan until they needed a 226 pound back.', 80, 82, 68, 92, 78, 66, 94],
  ],
  was: [
    ['now-was-croskey', 'Jacory Croskey-Merritt', '2025–', 'Played one college game in his final year and went in the seventh round.', 92, 92, 88, 82, 84, 76, 78],
    ['now-was-rwhite', 'Rachaad White', '2026–', 'Caught 64 passes in a season once and arrived to do it here.', 86, 86, 84, 78, 80, 90, 80],
    ['now-was-reynolds', 'Craig Reynolds', '2021–', 'Was working at a bank when Detroit called, and he has never been cut since.', 86, 84, 76, 88, 78, 76, 80],
    ['now-was-kallen', 'Kaytron Allen', '2026–', 'Ran for 3,000 yards at Penn State beside a man who went far higher.', 84, 86, 76, 90, 84, 70, 86],
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
