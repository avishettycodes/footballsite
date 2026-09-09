import type { Player } from '../types';

/**
 * QUARTERBACK ROOMS AS THEY STAND NOW. Hand written, subjective, argue away.
 *
 * THE NUMBERS HERE ARE NOT THE ALL-TIME NUMBERS SCALED DOWN. They are a fresh reading of
 * the same men against different company, which is the entire reason this file exists.
 * Josh Allen's arm is a 99 in the all-time pool because nobody has ever thrown it harder,
 * and it is still a 99 here because that is also true of the men playing today. Accuracy
 * is where the two datasets part company: 84 is the right number for Allen against Brees
 * and Montana, and it is far too harsh against the quarterbacks he actually lines up
 * opposite, so he reads 88 in this file. A scale factor could never have produced that,
 * since a scale factor keeps every ranking exactly where it was.
 *
 * WHO COUNTS AS CURRENT. Everybody in this file is playing now or was on this franchise's
 * roster during the 2020s and is still in the league. A real quarterback room holds three
 * men, and a six card pool needs six, so the back half of each roster reaches to the guys
 * who most recently held the clipboard. That is the point rather than a compromise: the
 * fourth quarterback on a bad roster is exactly the card that should hurt to land on.
 *
 * A well travelled backup shows up for two or three franchises with different years on
 * each card, the same way the all-time pools carry Kerry Collins twice. That is not a
 * duplicate, it is the job.
 *
 * Ratings stay SPIKY, same as everywhere else here. A backup is in the pool because of one
 * number, so Joe Milton throws it through a wall and completes nothing, and Cooper Rush
 * has never missed a meeting and cannot run ten yards.
 *
 * Row format:
 *   [id, name, years, blurb, ARM, ACC, DEEP, PKT, MOB, PRO, CLT]
 */
type Row = [string, string, string, string, number, number, number, number, number, number, number];

const POOLS: Record<string, Row[]> = {
  ari: [
    ['now-ari-brissett', 'Jacoby Brissett', '2025–', 'Has backed up half the league and never once lost a locker room.', 84, 78, 78, 90, 60, 90, 74],
    ['now-ari-minshew', 'Gardner Minshew', '2026–', 'The mustache arrived in the desert to hold a clipboard for a while.', 80, 78, 78, 64, 68, 76, 66],
    ['now-ari-tune', 'Clayton Tune', '2023–', 'Threw 62 passes as a rookie and completed fewer than half of them.', 82, 60, 74, 56, 74, 62, 46],
    ['now-ari-dobbs', 'Joshua Dobbs', '2023', 'Signed on a Wednesday and won that Sunday before he had learned the playbook.', 86, 76, 82, 68, 84, 80, 84],
    ['now-ari-mcsorley', 'Trace McSorley', '2022–2023', 'Won everything at Penn State and has thrown more picks than scores since.', 78, 60, 72, 56, 80, 60, 50],
    ['now-ari-streveler', 'Chris Streveler', '2019–2021', 'Won a Grey Cup up north and is built more like a linebacker than a passer.', 82, 62, 76, 58, 86, 60, 62],
  ],
  atl: [
    ['now-atl-penix', 'Michael Penix Jr.', '2024–', 'That left arm is a whip, and both knees have already been rebuilt once.', 92, 88, 97, 88, 58, 88, 78],
    ['now-atl-tua', 'Tua Tagovailoa', '2026–', 'Fastest release in football, and everybody holds their breath when he goes down.', 78, 97, 92, 70, 62, 90, 78],
    ['now-atl-rush', 'Cooper Rush', '2026–', 'Won nine of fourteen as an emergency starter and got paid for it.', 78, 82, 72, 78, 46, 84, 82],
    ['now-atl-heinicke', 'Taylor Heinicke', '2023–2024', 'Plays every snap like a man who has already been cut twice, because he has.', 80, 74, 78, 64, 80, 72, 86],
    ['now-atl-ridder', 'Desmond Ridder', '2022–2023', 'Cut loose after two seasons and has been somebody\'s third string since.', 80, 68, 74, 58, 90, 64, 50],
    ['now-atl-paddock', 'John Paddock', '2024–', 'Undrafted arm out of Illinois who has yet to take a regular season snap.', 80, 70, 76, 60, 62, 66, 48],
  ],
  bal: [
    ['now-bal-lamar', 'Lamar Jackson', '2018–', 'Nobody has ever run this position like him, and now he throws it better too.', 94, 90, 92, 88, 99, 92, 92],
    ['now-bal-huntley', 'Tyler Huntley', '2020–2023', 'Made a Pro Bowl as an alternate without throwing a touchdown that season.', 78, 76, 72, 66, 86, 70, 66],
    ['now-bal-fagnano', 'Joe Fagnano', '2025–', 'Threw for 9,000 yards at Maine and Connecticut, which nobody was watching.', 80, 76, 74, 66, 70, 74, 56],
    ['now-bal-jjohnson', 'Josh Johnson', '2024–2025', 'Has signed with fifteen franchises and still throws a lovely spiral at 39.', 82, 74, 78, 68, 68, 78, 62],
    ['now-bal-leary', 'Devin Leary', '2024–', 'Sixth round arm who has spent two seasons holding a clipboard in the cold.', 86, 66, 82, 56, 66, 62, 48],
    ['now-bal-cunningham', 'Malik Cunningham', '2024–', 'A college quarterback the league keeps trying to turn into a receiver.', 76, 58, 62, 54, 92, 56, 46],
  ],
  buf: [
    ['now-buf-allen', 'Josh Allen', '2018–', 'An MVP built like a tight end who has never once considered sliding.', 99, 90, 97, 90, 94, 90, 97],
    ['now-buf-trubisky', 'Mitchell Trubisky', '2023–2025', 'Went second overall and has settled quite happily into carrying a tablet.', 84, 74, 78, 70, 80, 66, 58],
    ['now-buf-white', 'Mike White', '2024–2025', 'Beat Cincinnati in his second career start and never got another one.', 82, 78, 80, 62, 44, 74, 66],
    ['now-buf-buechele', 'Shane Buechele', '2023–', 'Started at Texas, transferred to SMU, and has thrown eleven pro passes.', 78, 72, 74, 58, 62, 68, 50],
    ['now-buf-kallen', 'Kyle Allen', '2023–', 'Started 22 games for three bad teams and lost eighteen of them.', 82, 72, 78, 74, 56, 70, 54],
    ['now-buf-fromm', 'Jake Fromm', '2021–2022', 'Ran Georgia to a title game and the arm never turned up in the pros.', 70, 80, 72, 62, 52, 80, 52],
  ],
  car: [
    ['now-car-young', 'Bryce Young', '2023–', 'Benched in September and playing the best football of his life by December.', 80, 90, 84, 84, 84, 92, 90],
    ['now-car-pickett', 'Kenny Pickett', '2026–', 'A first round pick with famously small hands, now on his fourth team.', 82, 78, 76, 86, 72, 76, 62],
    ['now-car-plummer', 'Jack Plummer', '2024–', 'Undrafted out of Louisville and has never been active on a game day.', 76, 70, 72, 56, 60, 66, 46],
    ['now-car-corral', 'Matt Corral', '2022–2023', 'Third round pick who tore his foot up in August and disappeared.', 88, 66, 78, 58, 86, 62, 48],
    ['now-car-darnold', 'Sam Darnold', '2021–2022', 'Saw ghosts here too, in front of the smallest crowds of his career.', 90, 78, 90, 62, 76, 72, 58],
    ['now-car-pjwalker', 'P.J. Walker', '2020–2022', 'Was the best passer in the XFL, which turned out not to travel well.', 78, 68, 74, 60, 76, 66, 62],
  ],
  chi: [
    ['now-chi-caleb', 'Caleb Williams', '2024–', 'Paints his nails before games and throws ropes off his back foot when it breaks down.', 93, 88, 92, 78, 90, 86, 88],
    ['now-chi-bagent', 'Tyson Bagent', '2023–', 'Came out of Division II, and his father wrestles arms for a living.', 72, 84, 68, 74, 76, 80, 70],
    ['now-chi-keenum', 'Case Keenum', '2025–', 'Has started for seven franchises and won a playoff game on a miracle.', 80, 86, 76, 90, 54, 84, 84],
    ['now-chi-peterman', 'Nathan Peterman', '2023–2024', 'Threw five interceptions in one half and the league has not let it go.', 78, 56, 72, 54, 62, 58, 40],
    ['now-chi-pjwalker', 'P.J. Walker', '2024–', 'Signed to hold the ball for kicks and take the last drive of August.', 76, 68, 72, 58, 74, 66, 58],
    ['now-chi-fields', 'Justin Fields', '2021–2023', 'Ran for 1,143 yards in a season here and they drafted over him anyway.', 92, 70, 88, 58, 96, 68, 68],
  ],
  cin: [
    ['now-cin-burrow', 'Joe Burrow', '2020–', 'Puts it on the numbers from 40 yards while a defensive end lands on him.', 90, 99, 92, 97, 62, 97, 96],
    ['now-cin-flacco', 'Joe Flacco', '2026–', 'Won a Super Bowl MVP thirteen years ago and is still standing in there at 41.', 92, 80, 92, 88, 30, 86, 88],
    ['now-cin-browning', 'Jake Browning', '2023–2025', 'Went undrafted, sat for four seasons, then threw for 300 on a Monday night.', 78, 88, 80, 82, 60, 82, 76],
    ['now-cin-clifford', 'Sean Clifford', '2026–', 'Started 50 games at Penn State and has yet to throw a pass that counted.', 80, 70, 76, 60, 70, 68, 50],
    ['now-cin-ballen', 'Brandon Allen', '2020–2022', 'Beat Kansas City on an afternoon when absolutely nobody expected it.', 82, 74, 80, 64, 56, 72, 80],
    ['now-cin-siemian', 'Trevor Siemian', '2023–2024', 'Started a playoff game in Denver once and has been spare parts since.', 80, 74, 76, 72, 54, 76, 60],
  ],
  cle: [
    ['now-cle-watson', 'Deshaun Watson', '2022–', 'Carries the biggest guaranteed contract in the sport into a backup role.', 90, 76, 90, 76, 84, 74, 64],
    ['now-cle-gabriel', 'Dillon Gabriel', '2025', 'Left handed, six feet even, and he beat out a much louder rookie.', 80, 90, 78, 78, 78, 88, 76],
    ['now-cle-sanders', 'Shedeur Sanders', '2025–', 'Slid to the fifth round on live television and took it extremely personally.', 84, 88, 80, 66, 70, 82, 84],
    ['now-cle-green', 'Taylen Green', '2026–', 'Six foot six and runs a 4.6, and nobody knows yet whether he can read a defense.', 90, 70, 86, 62, 92, 66, 60],
    ['now-cle-zappe', 'Bailey Zappe', '2025', 'Broke every record Western Kentucky had and could not hold a job here.', 80, 74, 76, 60, 58, 72, 56],
    ['now-cle-dtr', 'Dorian Thompson-Robinson', '2023–', 'A fifth round athlete asked to start before he was ready, twice.', 84, 64, 72, 58, 90, 62, 50],
  ],
  dal: [
    ['now-dal-dak', 'Dak Prescott', '2016–', 'A fourth round pick who has outlasted every doubt except the January ones.', 88, 92, 88, 90, 68, 92, 88],
    ['now-dal-howell', 'Sam Howell', '2026–', 'Was sacked 65 times in one season and kept getting back up.', 86, 76, 84, 58, 76, 72, 60],
    ['now-dal-milton', 'Joe Milton III', '2025–', 'Throws it 80 yards in warmups and has one career start to show for it.', 98, 66, 90, 58, 78, 62, 54],
    ['now-dal-lance', 'Trey Lance', '2023–2024', 'Went third overall with 318 college throws behind him, and it showed.', 90, 66, 78, 58, 90, 62, 48],
    ['now-dal-rush', 'Cooper Rush', '2017–2024', 'Went 4 and 1 filling in and the whole city argued about him for a month.', 78, 76, 72, 80, 44, 76, 84],
    ['now-dal-dinucci', 'Ben DiNucci', '2020–2021', 'Started on Thanksgiving in front of everybody, and it went how you remember.', 76, 70, 70, 58, 70, 66, 46],
  ],
  den: [
    ['now-den-nix', 'Bo Nix', '2024–', 'Started 61 college games and looked bored by the middle of his rookie year.', 88, 90, 86, 88, 84, 88, 88],
    ['now-den-stidham', 'Jarrett Stidham', '2023–', 'Has now backed up Brady, Carr and Nix, and enjoys the view.', 84, 76, 80, 78, 66, 74, 62],
    ['now-den-ehlinger', 'Sam Ehlinger', '2025–', 'Runs like a fullback and throws like a man who should stick to running.', 78, 70, 72, 62, 90, 68, 60],
    ['now-den-rwilson', 'Russell Wilson', '2022–2023', 'Cost two first round picks and 85 million dollars to make go away.', 86, 78, 92, 62, 72, 76, 82],
    ['now-den-rypien', 'Brett Rypien', '2019–2022', 'His uncle won a Super Bowl MVP and the arm did not come down the family line.', 74, 72, 68, 60, 54, 70, 52],
    ['now-den-zwilson', 'Zach Wilson', '2024', 'Second overall, and he once said out loud that he owed nobody an apology.', 92, 68, 72, 56, 80, 62, 46],
  ],
  det: [
    ['now-det-goff', 'Jared Goff', '2021–', 'Throws the prettiest ball in the sport from inside a perfectly clean pocket.', 86, 97, 92, 74, 38, 92, 88],
    ['now-det-dobbs', 'Joshua Dobbs', '2026–', 'An aerospace engineer who keeps getting hired to learn playbooks fast.', 86, 76, 82, 68, 82, 80, 74],
    ['now-det-hooker', 'Hendon Hooker', '2023–2025', 'Tore a knee in November, went in the third round, and has barely played since.', 90, 74, 84, 62, 78, 70, 58],
    ['now-det-teddy', 'Teddy Bridgewater', '2023', 'Won a state title coaching a Miami high school in the middle of his career.', 80, 88, 74, 90, 60, 88, 66],
    ['now-det-boyle', 'Tim Boyle', '2021–2022', 'Started three games here and threw zero touchdowns in all of them.', 82, 66, 76, 58, 58, 64, 42],
    ['now-det-martinez', 'Adrian Martinez', '2024–', 'Ran for 1,000 yards at Nebraska and is a practice squad arm now.', 78, 64, 72, 56, 90, 60, 46],
  ],
  gb: [
    ['now-gb-love', 'Jordan Love', '2020–', 'Sat behind a legend for three seasons, then looked like a natural.', 92, 88, 92, 86, 76, 88, 86],
    ['now-gb-tyrod', 'Tyrod Taylor', '2026–', 'Fifteen seasons of being quietly better than whoever is starting ahead of him.', 84, 80, 76, 78, 88, 78, 70],
    ['now-gb-slovis', 'Kedon Slovis', '2026–', 'Played for four colleges in five years and is somebody\'s arm in camp now.', 78, 70, 74, 56, 60, 66, 46],
    ['now-gb-rodgers', 'Aaron Rodgers', '2005–2022', 'Won four MVPs here and made an entire state hold its breath every offseason.', 92, 94, 92, 90, 62, 97, 90],
    ['now-gb-pratt', 'Michael Pratt', '2024', 'Seventh round pick out of Tulane who lasted one training camp.', 80, 68, 74, 56, 68, 66, 46],
    ['now-gb-etling', 'Danny Etling', '2022–2023', 'They tried him at receiver for a while because the arm alone was not enough.', 84, 62, 66, 54, 76, 58, 44],
  ],
  hou: [
    ['now-hou-stroud', 'C.J. Stroud', '2023–', 'Threw 470 yards on a Sunday as a rookie and has not thrown a bad ball since.', 90, 96, 90, 92, 74, 92, 90],
    ['now-hou-mills', 'Davis Mills', '2021–', 'Third round pick who kept the seat warm and has stayed useful doing it.', 84, 80, 80, 78, 54, 78, 68],
    ['now-hou-gronowski', 'Mark Gronowski', '2025–', 'Won two national titles at South Dakota State and throws it like a linebacker.', 82, 74, 78, 66, 84, 76, 72],
    ['now-hou-keenum', 'Case Keenum', '2024', 'Signed to teach a young starter and to be entirely unbothered by that.', 78, 82, 74, 82, 52, 74, 68],
    ['now-hou-driskel', 'Jeff Driskel', '2023–', 'Has played quarterback, tight end and special teams for money.', 82, 68, 78, 60, 86, 64, 52],
    ['now-hou-kallen', 'Kyle Allen', '2022', 'Went undrafted, won his first four starts years ago, and coasted since.', 80, 72, 76, 74, 54, 70, 52],
  ],
  ind: [
    ['now-ind-djones', 'Daniel Jones', '2025–', 'Danny Dimes got run out of New York and is winning games in blue again.', 82, 88, 82, 64, 84, 80, 68],
    ['now-ind-richardson', 'Anthony Richardson', '2023–', 'Ran for 200 yards in a game and completed 47 percent in the same month.', 97, 62, 84, 66, 93, 66, 68],
    ['now-ind-leonard', 'Riley Leonard', '2025–', 'Ran Notre Dame to a title game on his legs and a lot of nerve.', 80, 72, 76, 62, 88, 72, 70],
    ['now-ind-minshew', 'Gardner Minshew', '2023–', 'The mustache is the point, and a photograph of him in jorts lives online forever.', 82, 84, 82, 66, 70, 84, 84],
    ['now-ind-ehlinger', 'Sam Ehlinger', '2021–2023', 'Got three starts on a lost season and gave everything he had to them.', 78, 68, 72, 60, 80, 68, 62],
    ['now-ind-brissett', 'Jacoby Brissett', '2017–2020', 'Took over a week after Luck walked away and held it together anyway.', 84, 76, 78, 90, 62, 88, 78],
  ],
  jax: [
    ['now-jax-lawrence', 'Trevor Lawrence', '2021–', 'Generational everything, and 28 points down at halftime he actually delivered.', 92, 88, 90, 90, 88, 90, 90],
    ['now-jax-ewers', 'Quinn Ewers', '2026–', 'Was the number one recruit in America before he had a driving licence.', 88, 82, 84, 80, 66, 74, 60],
    ['now-jax-mullens', 'Nick Mullens', '2025–', 'Threw for 400 yards in a game once and has been a backup ever since.', 80, 80, 78, 74, 46, 78, 60],
    ['now-jax-macjones', 'Mac Jones', '2024', 'Made a Pro Bowl as a rookie and spent three seasons falling out of favour.', 80, 90, 82, 72, 46, 86, 60],
    ['now-jax-beathard', 'C.J. Beathard', '2021–', 'Son and grandson of football men, and a career spent holding the ball.', 82, 74, 78, 74, 66, 74, 58],
    ['now-jax-rourke', 'Nathan Rourke', '2023', 'Was the best passer in Canada and got two weeks to prove it here.', 78, 72, 74, 58, 80, 70, 54],
  ],
  kc: [
    ['now-kc-mahomes', 'Patrick Mahomes', '2017–', 'Has won three rings before turning 30 and finds something when the play is dead.', 94, 94, 96, 98, 86, 97, 99],
    ['now-kc-fields', 'Justin Fields', '2026–', 'Still the fastest quarterback alive and still nobody knows where the ball is going.', 90, 70, 86, 58, 97, 68, 66],
    ['now-kc-nussmeier', 'Garrett Nussmeier', '2026–', 'His father coached quarterbacks for twenty years and you can see it in the feet.', 88, 80, 86, 68, 62, 78, 66],
    ['now-kc-oladokun', 'Chris Oladokun', '2022–', 'Four colleges and three practice squads later, he has never given the dream up.', 84, 66, 80, 56, 86, 62, 46],
    ['now-kc-gabbert', 'Blaine Gabbert', '2023', 'Tenth overall pick who found a second career catching Super Bowl rings.', 82, 72, 78, 62, 60, 70, 54],
    ['now-kc-buechele', 'Shane Buechele', '2021–2022', 'Held the third spot for two title runs and never saw the field.', 78, 70, 74, 56, 62, 66, 48],
  ],
  lv: [
    ['now-lv-cousins', 'Kirk Cousins', '2026–', 'Third franchise in three years, and somebody keeps guaranteeing him the money.', 82, 92, 78, 82, 40, 86, 56],
    ['now-lv-oconnell', 'Aidan O\'Connell', '2023–', 'A fourth round pick from Purdue who keeps being the answer nobody wanted.', 82, 80, 78, 80, 50, 76, 68],
    ['now-lv-miller', 'Cam Miller', '2025–', 'Won a title at North Dakota State, which is where they keep finding them.', 88, 72, 90, 60, 86, 70, 58],
    ['now-lv-minshew', 'Gardner Minshew', '2024', 'Started nine here, broke a collarbone, and the beard stayed magnificent.', 80, 78, 78, 62, 70, 76, 64],
    ['now-lv-garoppolo', 'Jimmy Garoppolo', '2023', 'Won a lot of games he never had to carry, then a foot injury ended this one.', 82, 88, 74, 84, 50, 78, 80],
    ['now-lv-ridder', 'Desmond Ridder', '2024', 'Third team in two years, and he is still only somebody\'s emergency plan.', 80, 66, 74, 56, 76, 62, 48],
  ],
  lac: [
    ['now-lac-herbert', 'Justin Herbert', '2020–', 'Six foot six with a cannon, and he threw for 400 with broken rib cartilage.', 96, 90, 96, 90, 80, 90, 88],
    ['now-lac-lance', 'Trey Lance', '2025–', 'Fourth franchise before his 26th birthday, and the arm still looks the part.', 90, 66, 78, 58, 86, 62, 50],
    ['now-lac-heinicke', 'Taylor Heinicke', '2024', 'Slid into a playoff game on one knee once and nearly stole it.', 80, 72, 78, 62, 78, 72, 84],
    ['now-lac-stick', 'Easton Stick', '2019–2024', 'Waited five seasons for four starts and lost every one of them.', 80, 74, 74, 64, 70, 72, 58],
    ['now-lac-duggan', 'Max Duggan', '2023–2024', 'Dragged TCU to a title game on pure stubbornness and has not thrown since.', 78, 68, 74, 56, 82, 66, 62],
    ['now-lac-tyrod', 'Tyrod Taylor', '2019–2020', 'Lost the job to a rookie because a team doctor punctured his lung.', 84, 80, 80, 72, 86, 76, 70],
  ],
  lar: [
    ['now-lar-stafford', 'Matthew Stafford', '2021–', 'Fires it into windows nobody else sees and won a ring at 34 doing it.', 92, 90, 97, 96, 50, 92, 90],
    ['now-lar-garoppolo', 'Jimmy Garoppolo', '2024–', 'Handsome enough for a razor advert and permanently one bad week from the bench.', 82, 84, 74, 82, 52, 78, 74],
    ['now-lar-bennett', 'Stetson Bennett', '2023–', 'Won two national titles as a walk on and then vanished for a whole season.', 82, 74, 80, 60, 78, 70, 66],
    ['now-lar-mayfield', 'Baker Mayfield', '2022', 'Signed on a Tuesday, learned nothing, and won a Thursday game on the last play.', 84, 78, 82, 64, 76, 74, 92],
    ['now-lar-perkins', 'Bryce Perkins', '2020–2023', 'Was a running back in a quarterback jersey for four seasons here.', 76, 62, 60, 54, 90, 58, 48],
    ['now-lar-rypien', 'Brett Rypien', '2023', 'Started one game in October, threw two interceptions, and was cut in November.', 74, 70, 68, 58, 54, 68, 48],
  ],
  mia: [
    ['now-mia-willis', 'Malik Willis', '2026–', 'Won two starts nobody expected in Green Bay and got handed a job for it.', 92, 72, 86, 62, 92, 68, 74],
    ['now-mia-mccord', 'Kyle McCord', '2026–', 'Threw for 4,779 yards at Syracuse and slid to the sixth round for it.', 86, 82, 84, 70, 58, 78, 70],
    ['now-mia-cook', 'Brady Cook', '2026–', 'Played a whole season at Missouri on a shoulder nobody thought would hold.', 84, 78, 80, 66, 80, 74, 66],
    ['now-mia-huntley', 'Tyler Huntley', '2024', 'Came off the street in October and started five games in a row.', 78, 74, 72, 64, 86, 70, 74],
    ['now-mia-thompson', 'Skylar Thompson', '2022–2024', 'Started a playoff game as a seventh round rookie, which tells its own story.', 76, 70, 72, 58, 68, 68, 54],
    ['now-mia-white', 'Mike White', '2023', 'Cult hero in New York for one weekend and a spare arm everywhere else.', 82, 76, 78, 70, 44, 74, 68],
  ],
  min: [
    ['now-min-murray', 'Kyler Murray', '2026–', 'Gone the moment you blink, and the throws come out sideways when he is bored.', 92, 90, 90, 80, 96, 86, 88],
    ['now-min-wentz', 'Carson Wentz', '2026–', 'Nearly won an MVP in 2017 and has been somebody\'s backup every year since.', 90, 74, 88, 64, 74, 72, 62],
    ['now-min-mccarthy', 'J.J. McCarthy', '2024–', 'Won 27 of 28 at Michigan and lost his rookie season to a knee.', 90, 86, 90, 82, 80, 84, 86],
    ['now-min-brosmer', 'Max Brosmer', '2025–', 'Undrafted local kid who talked his way onto the roster in August.', 78, 74, 74, 62, 62, 80, 54],
    ['now-min-cousins', 'Kirk Cousins', '2018–2023', 'Six seasons, one playoff win, and an enormous amount of guaranteed money.', 84, 92, 80, 90, 44, 88, 62],
    ['now-min-dobbs', 'Joshua Dobbs', '2023', 'The Passtronaut arrived mid season and won two before the magic wore off.', 86, 74, 82, 66, 90, 78, 80],
  ],
  ne: [
    ['now-ne-maye', 'Drake Maye', '2024–', 'Third overall, and by year two he was throwing people open all over the field.', 92, 90, 90, 90, 90, 90, 90],
    ['now-ne-devito', 'Tommy DeVito', '2026–', 'Undrafted kid from New Jersey who won three straight and became a folk hero.', 80, 74, 76, 60, 74, 70, 80],
    ['now-ne-macjones', 'Mac Jones', '2021–2023', 'Went to a Pro Bowl as a rookie and got benched by his third season.', 80, 86, 82, 72, 46, 82, 62],
    ['now-ne-zappe', 'Bailey Zappe', '2022–2024', 'Beat two teams as a rookie and the whole region briefly lost its mind.', 80, 76, 76, 62, 56, 72, 62],
    ['now-ne-brissett', 'Jacoby Brissett', '2024', 'Took the hits for a rookie all September so the kid could learn from the bench.', 84, 78, 78, 86, 60, 86, 72],
    ['now-ne-stidham', 'Jarrett Stidham', '2019–2021', 'Was going to be the answer after Brady left, for about one preseason.', 84, 74, 80, 72, 66, 72, 56],
  ],
  no: [
    ['now-no-shough', 'Tyler Shough', '2025–', 'Played seven seasons of college football and broke a bone in three of them.', 88, 80, 86, 68, 74, 76, 66],
    ['now-no-rattler', 'Spencer Rattler', '2024–', 'Was a Netflix villain in high school and has been proving people wrong since.', 88, 80, 84, 74, 76, 78, 72],
    ['now-no-zwilson', 'Zach Wilson', '2026–', 'Fifth stop for a second overall pick who is somehow still only 27.', 92, 70, 84, 58, 80, 64, 48],
    ['now-no-carr', 'Derek Carr', '2023–2024', 'Threw for a lot of yards, took the money, and retired rather than be traded.', 86, 90, 82, 80, 58, 88, 66],
    ['now-no-winston', 'Jameis Winston', '2020–2023', 'Will throw for five touchdowns or five picks and does not care which.', 94, 68, 92, 86, 72, 74, 86],
    ['now-no-hill', 'Taysom Hill', '2017–', 'Plays quarterback, tight end, and returns kicks, all in the same afternoon.', 88, 66, 82, 62, 96, 62, 76],
  ],
  nyg: [
    ['now-nyg-dart', 'Jaxson Dart', '2025–', 'Took the job in week four and ran somebody over on his first drive.', 88, 86, 86, 78, 90, 84, 86],
    ['now-nyg-rwilson', 'Russell Wilson', '2025–', 'Threw for 450 yards in September and lost the job by Halloween.', 84, 82, 88, 62, 66, 80, 74],
    ['now-nyg-haener', 'Jake Haener', '2026–', 'Fourth round pick out of Fresno who competes for every rep he gets.', 78, 78, 74, 64, 62, 76, 62],
    ['now-nyg-winston', 'Jameis Winston', '2025–', 'The best pregame speech in football, attached to the wildest arm in it.', 92, 68, 90, 84, 68, 76, 74],
    ['now-nyg-djones', 'Daniel Jones', '2019–2024', 'Ran for 700 yards one season and never got a line that could block.', 84, 82, 80, 66, 84, 78, 66],
    ['now-nyg-lock', 'Drew Lock', '2024', 'Threw four touchdowns in a game here and could not keep the job a week.', 88, 70, 84, 58, 74, 66, 56],
  ],
  nyj: [
    ['now-nyj-geno', 'Geno Smith', '2026–', 'Nobody wanted him for the better part of a decade and he starts at 35.', 90, 92, 86, 88, 72, 90, 86],
    ['now-nyj-klubnik', 'Cade Klubnik', '2026–', 'Won an ACC title at Clemson and arrived to hold a clipboard for a 35 year old.', 86, 82, 84, 70, 82, 80, 74],
    ['now-nyj-zappe', 'Bailey Zappe', '2026–', 'Fourth franchise for a man who set every record Western Kentucky keeps.', 80, 74, 76, 60, 58, 72, 56],
    ['now-nyj-rodgers', 'Aaron Rodgers', '2023–2024', 'Four snaps into the whole thing, his Achilles went and took the year with it.', 90, 90, 90, 90, 56, 94, 88],
    ['now-nyj-zwilson', 'Zach Wilson', '2021–2023', 'Two picks after Trevor Lawrence, and the tape got worse every season.', 88, 68, 84, 56, 80, 62, 46],
    ['now-nyj-travis', 'Jordan Travis', '2024–', 'Had Florida State unbeaten until his leg snapped on national television.', 80, 74, 76, 60, 82, 72, 62],
  ],
  phi: [
    ['now-phi-hurts', 'Jalen Hurts', '2020–', 'Squats 600 pounds, scores from the one every time, and won the big one.', 90, 86, 90, 88, 94, 88, 96],
    ['now-phi-mckee', 'Tanner McKee', '2023–', 'Sixth round pick who threw for 300 yards the first time they let him.', 88, 90, 88, 74, 52, 74, 66],
    ['now-phi-dalton', 'Andy Dalton', '2026–', 'The Red Rifle at 38, still good for one clean afternoon a month.', 82, 88, 80, 90, 42, 84, 80],
    ['now-phi-pickett', 'Kenny Pickett', '2024', 'Won a playoff game in relief and got shipped out for a fourth rounder.', 82, 78, 76, 82, 68, 76, 84],
    ['now-phi-mariota', 'Marcus Mariota', '2023', 'Second overall a decade ago, and now the most reliable spare arm going.', 84, 84, 80, 76, 84, 74, 66],
    ['now-phi-minshew', 'Gardner Minshew', '2021–2022', 'Started two December games for a contender and won them both.', 80, 80, 78, 64, 70, 82, 70],
  ],
  pit: [
    ['now-pit-rodgers', 'Aaron Rodgers', '2025–', 'Turned 42 in a town that only wants to know whether you can still play.', 88, 90, 88, 90, 52, 94, 88],
    ['now-pit-rudolph', 'Mason Rudolph', '2024–', 'Got in a helmet swinging brawl once and has been rehabilitating it ever since.', 84, 76, 82, 76, 52, 74, 64],
    ['now-pit-howard', 'Will Howard', '2025–', 'Won a national title at Ohio State and went in the sixth round anyway.', 86, 78, 82, 64, 76, 74, 70],
    ['now-pit-rwilson', 'Russell Wilson', '2024', 'Ran the offense out of a phone booth and still threw four deep touchdowns.', 84, 78, 90, 62, 68, 76, 80],
    ['now-pit-fields', 'Justin Fields', '2024', 'Went 4 and 2 as the starter and got benched the week the other guy was healthy.', 90, 72, 86, 58, 94, 68, 66],
    ['now-pit-pickett', 'Kenny Pickett', '2022–2023', 'A local kid taken in the first round who threw thirteen scores in two seasons.', 82, 78, 76, 66, 72, 76, 64],
  ],
  sf: [
    ['now-sf-purdy', 'Brock Purdy', '2022–', 'Went last in the entire draft and reached a Super Bowl fourteen months later.', 82, 92, 90, 92, 74, 90, 90],
    ['now-sf-macjones', 'Mac Jones', '2025–', 'Came off the bench in September and threw for 300 in three straight.', 80, 88, 82, 74, 46, 84, 66],
    ['now-sf-darnold', 'Sam Darnold', '2023', 'Spent a year learning the system from the bench and it changed his career.', 86, 78, 88, 62, 76, 74, 60],
    ['now-sf-lance', 'Trey Lance', '2021–2023', 'Cost three first round picks and threw 102 passes for the franchise.', 90, 64, 78, 56, 90, 62, 46],
    ['now-sf-ballen', 'Brandon Allen', '2024–', 'Has been the third quarterback in six different buildings and knows every job.', 82, 72, 78, 76, 56, 72, 58],
    ['now-sf-mordecai', 'Tanner Mordecai', '2024–', 'Undrafted out of Wisconsin, and August is the only football he has played here.', 82, 66, 78, 56, 76, 62, 46],
  ],
  sea: [
    ['now-sea-darnold', 'Sam Darnold', '2025–', 'Fifth franchise, and he finally landed somewhere that wanted him to be himself.', 90, 86, 90, 80, 78, 82, 74],
    ['now-sea-milroe', 'Jalen Milroe', '2025–', 'The fastest man in the draft played quarterback, and they took him anyway.', 92, 66, 88, 58, 97, 64, 60],
    ['now-sea-lock', 'Drew Lock', '2023', 'Won a Sunday night game in relief and it was the highlight of his career.', 88, 70, 88, 58, 74, 66, 68],
    ['now-sea-geno', 'Geno Smith', '2022–2024', 'They asked what he had left and he led the league in completion percentage.', 86, 94, 84, 88, 72, 88, 88],
    ['now-sea-howell', 'Sam Howell', '2024', 'Threw more passes than anybody one season and it did not go well.', 86, 74, 84, 56, 76, 70, 56],
    ['now-sea-eason', 'Jacob Eason', '2022–2023', 'The strongest arm nobody has ever seen throw a meaningful pass.', 97, 58, 74, 52, 54, 56, 40],
  ],
  tb: [
    ['now-tb-mayfield', 'Baker Mayfield', '2023–', 'Nobody wanted him at all in 2023 and he throws for 4,000 yards a season now.', 90, 90, 90, 80, 86, 88, 92],
    ['now-tb-stick', 'Easton Stick', '2026–', 'Watched Herbert throw for five seasons and it did not rub off.', 80, 80, 74, 66, 68, 70, 60],
    ['now-tb-trask', 'Kyle Trask', '2021–', 'A second round pick who has waited five seasons for somebody to say go.', 86, 82, 78, 76, 50, 74, 62],
    ['now-tb-teddy', 'Teddy Bridgewater', '2023', 'Signed here to start and had lost the job before the leaves turned.', 78, 88, 74, 88, 58, 86, 64],
    ['now-tb-gabbert', 'Blaine Gabbert', '2021–2022', 'Held a clipboard behind the greatest of all time and enjoyed every minute.', 84, 72, 84, 62, 62, 70, 56],
    ['now-tb-pratt', 'Michael Pratt', '2025–', 'Second practice squad in as many years for a kid who won a lot at Tulane.', 80, 70, 76, 58, 80, 68, 48],
  ],
  ten: [
    ['now-ten-ward', 'Cam Ward', '2025–', 'Went from no scholarship offers to first overall in five years.', 96, 88, 92, 84, 82, 84, 88],
    ['now-ten-trubisky', 'Mitchell Trubisky', '2026–', 'Went second overall in 2017 and has been a career backup for most of the decade.', 84, 74, 78, 70, 80, 66, 58],
    ['now-ten-levis', 'Will Levis', '2023–', 'Six foot four with a cannon, and the mayonnaise in his coffee is what people repeat.', 97, 64, 76, 56, 72, 60, 58],
    ['now-ten-rudolph', 'Mason Rudolph', '2024', 'Started six games on a lost season and threw it deep more than anybody.', 84, 80, 84, 72, 52, 78, 62],
    ['now-ten-willis', 'Malik Willis', '2022–2023', 'Third round athlete who was not close to ready and got thrown in anyway.', 92, 66, 86, 58, 90, 62, 56],
    ['now-ten-ballen', 'Brandon Allen', '2025', 'Arrived in August to be the veteran voice in a very young room.', 80, 80, 78, 78, 54, 82, 58],
  ],
  was: [
    ['now-was-daniels', 'Jayden Daniels', '2024–', 'Won Rookie of the Year and threw a Hail Mary that beat Chicago at the gun.', 88, 92, 92, 90, 97, 90, 92],
    ['now-was-mariota', 'Marcus Mariota', '2024–', 'Came in twice for an injured starter and won both games without any fuss.', 84, 84, 80, 80, 88, 74, 78],
    ['now-was-howell', 'Sam Howell', '2022–2023', 'Fifth round pick who started all seventeen and was sacked more than anyone alive.', 86, 76, 84, 58, 76, 72, 58],
    ['now-was-heinicke', 'Taylor Heinicke', '2020–2022', 'Came off his couch, nearly beat Brady in January, and got a tattoo of it.', 80, 74, 78, 64, 78, 72, 84],
    ['now-was-wentz', 'Carson Wentz', '2022', 'Cost a third round pick, started eight games, and got moved on again.', 90, 74, 88, 64, 74, 72, 56],
    ['now-was-jjohnson', 'Josh Johnson', '2021–2022', 'Came out of the XFL at 35 and won a start on national television.', 82, 74, 78, 68, 70, 76, 64],
  ],
};

export const QB_CURRENT: Player[] = Object.entries(POOLS).flatMap(([teamId, rows]) =>
  rows.map(([id, name, years, blurb, armStrength, accuracy, deepBall, pocketPresence, mobility, processing, clutch]) => ({
    id,
    name,
    teamId,
    position: 'QB' as const,
    years,
    blurb,
    attributes: { armStrength, accuracy, deepBall, pocketPresence, mobility, processing, clutch },
  })),
);
