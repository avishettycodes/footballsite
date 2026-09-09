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
    ['now-ari-beck', 'Carson Beck', '2026–', 'Threw for 3,900 at Georgia and then transferred to Miami for a lot of money.', 88, 84, 84, 70, 62, 80, 66],
  ],
  atl: [
    ['now-atl-penix', 'Michael Penix Jr.', '2024–', 'That left arm is a whip, and both knees have already been rebuilt once.', 92, 88, 97, 88, 58, 88, 78],
    ['now-atl-tua', 'Tua Tagovailoa', '2026–', 'Fastest release in football, and everybody holds their breath when he goes down.', 78, 97, 92, 70, 62, 90, 78],
    ['now-atl-rush', 'Cooper Rush', '2026–', 'Won nine of fourteen as an emergency starter and got paid for it.', 78, 82, 72, 78, 46, 84, 82],
    ['now-atl-strand', 'Jack Strand', '2026–', 'Small school arm who spent the summer taking the last reps of every practice.', 78, 74, 74, 62, 72, 72, 54],
  ],
  bal: [
    ['now-bal-lamar', 'Lamar Jackson', '2018–', 'Nobody has ever run this position like him, and now he throws it better too.', 94, 90, 92, 88, 99, 92, 92],
    ['now-bal-huntley', 'Tyler Huntley', '2020–', 'Made a Pro Bowl as an alternate without throwing a touchdown that season.', 78, 76, 72, 66, 86, 70, 66],
    ['now-bal-fagnano', 'Joe Fagnano', '2025–', 'Threw for 9,000 yards at Maine and Connecticut, which nobody was watching.', 80, 76, 74, 66, 70, 74, 56],
  ],
  buf: [
    ['now-buf-allen', 'Josh Allen', '2018–', 'An MVP built like a tight end who has never once considered sliding.', 99, 90, 97, 90, 94, 90, 97],
    ['now-buf-kallen', 'Kyle Allen', '2023–', 'Started 22 games for three bad teams and lost eighteen of them.', 82, 72, 78, 74, 56, 70, 54],
  ],
  car: [
    ['now-car-young', 'Bryce Young', '2023–', 'Benched in September and playing the best football of his life by December.', 80, 90, 84, 84, 84, 92, 90],
    ['now-car-pickett', 'Kenny Pickett', '2026–', 'A first round pick with famously small hands, now on his fourth team.', 82, 78, 76, 86, 72, 76, 62],
    ['now-car-king', 'Haynes King', '2026–', 'Ran for 700 yards at Georgia Tech and lowers a shoulder on purpose.', 84, 76, 80, 64, 88, 74, 72],
  ],
  chi: [
    ['now-chi-caleb', 'Caleb Williams', '2024–', 'Paints his nails before games and throws ropes off his back foot when it breaks down.', 93, 88, 92, 78, 90, 86, 88],
    ['now-chi-bagent', 'Tyson Bagent', '2023–', 'Came out of Division II, and his father wrestles arms for a living.', 72, 84, 68, 74, 76, 80, 70],
    ['now-chi-keenum', 'Case Keenum', '2025–', 'Has started for seven franchises and won a playoff game on a miracle.', 80, 86, 76, 90, 54, 84, 84],
  ],
  cin: [
    ['now-cin-burrow', 'Joe Burrow', '2020–', 'Puts it on the numbers from 40 yards while a defensive end lands on him.', 90, 99, 92, 97, 62, 97, 96],
    ['now-cin-flacco', 'Joe Flacco', '2026–', 'Won a Super Bowl MVP thirteen years ago and is still standing in there at 41.', 92, 80, 92, 88, 30, 86, 88],
    ['now-cin-clifford', 'Sean Clifford', '2026–', 'Started 50 games at Penn State and has yet to throw a pass that counted.', 80, 70, 76, 60, 70, 68, 50],
    ['now-cin-jjohnson', 'Josh Johnson', '2024–', 'Has signed with fifteen franchises and still throws a lovely spiral at 39.', 82, 74, 78, 68, 68, 78, 62],
  ],
  cle: [
    ['now-cle-watson', 'Deshaun Watson', '2022–', 'Carries the biggest guaranteed contract in the sport into a backup role.', 90, 76, 90, 76, 84, 74, 64],
    ['now-cle-sanders', 'Shedeur Sanders', '2025–', 'Slid to the fifth round on live television and took it extremely personally.', 84, 88, 80, 66, 70, 82, 84],
    ['now-cle-green', 'Taylen Green', '2026–', 'Six foot six and runs a 4.6, and nobody knows yet whether he can read a defense.', 90, 70, 86, 62, 92, 66, 60],
  ],
  dal: [
    ['now-dal-dak', 'Dak Prescott', '2016–', 'A fourth round pick who has outlasted every doubt except the January ones.', 88, 92, 88, 90, 68, 92, 88],
    ['now-dal-howell', 'Sam Howell', '2026–', 'Was sacked 65 times in one season and kept getting back up.', 86, 76, 84, 58, 76, 72, 60],
    ['now-dal-milton', 'Joe Milton III', '2025–', 'Throws it 80 yards in warmups and has one career start to show for it.', 98, 66, 90, 58, 78, 62, 54],
  ],
  den: [
    ['now-den-nix', 'Bo Nix', '2024–', 'Started 61 college games and looked bored by the middle of his rookie year.', 88, 90, 86, 88, 84, 88, 88],
    ['now-den-stidham', 'Jarrett Stidham', '2023–', 'Has now backed up Brady, Carr and Nix, and enjoys the view.', 84, 76, 80, 78, 66, 74, 62],
    ['now-den-ehlinger', 'Sam Ehlinger', '2025–', 'Runs like a fullback and throws like a man who should stick to running.', 78, 70, 72, 62, 90, 68, 60],
  ],
  det: [
    ['now-det-goff', 'Jared Goff', '2021–', 'Throws the prettiest ball in the sport from inside a perfectly clean pocket.', 86, 97, 92, 74, 38, 92, 88],
    ['now-det-dobbs', 'Joshua Dobbs', '2026–', 'An aerospace engineer who keeps getting hired to learn playbooks fast.', 86, 76, 82, 68, 82, 80, 74],
    ['now-det-altmyer', 'Luke Altmyer', '2026–', 'Started three years at Illinois and not one team called his name.', 82, 80, 80, 66, 74, 76, 64],
  ],
  gb: [
    ['now-gb-love', 'Jordan Love', '2020–', 'Sat behind a legend for three seasons, then looked like a natural.', 92, 88, 92, 86, 76, 88, 86],
    ['now-gb-tyrod', 'Tyrod Taylor', '2026–', 'Fifteen seasons of being quietly better than whoever is starting ahead of him.', 84, 80, 76, 78, 88, 78, 70],
    ['now-gb-slovis', 'Kedon Slovis', '2026–', 'Played for four colleges in five years and is somebody\'s arm in camp now.', 78, 70, 74, 56, 60, 66, 46],
  ],
  hou: [
    ['now-hou-stroud', 'C.J. Stroud', '2023–', 'Threw 470 yards on a Sunday as a rookie and has not thrown a bad ball since.', 90, 96, 90, 92, 74, 92, 90],
    ['now-hou-mills', 'Davis Mills', '2021–', 'Third round pick who kept the seat warm and has stayed useful doing it.', 84, 80, 80, 78, 54, 78, 68],
    ['now-hou-gronowski', 'Mark Gronowski', '2025–', 'Won two national titles at South Dakota State and throws it like a linebacker.', 82, 74, 78, 66, 84, 76, 72],
  ],
  ind: [
    ['now-ind-djones', 'Daniel Jones', '2025–', 'Danny Dimes got run out of New York and is winning games in blue again.', 82, 88, 82, 64, 84, 80, 68],
    ['now-ind-richardson', 'Anthony Richardson', '2023–', 'Ran for 200 yards in a game and completed 47 percent in the same month.', 97, 62, 84, 66, 93, 66, 68],
    ['now-ind-leonard', 'Riley Leonard', '2025–', 'Ran Notre Dame to a title game on his legs and a lot of nerve.', 80, 72, 76, 62, 88, 72, 70],
  ],
  jax: [
    ['now-jax-lawrence', 'Trevor Lawrence', '2021–', 'Generational everything, and 28 points down at halftime he actually delivered.', 92, 88, 90, 90, 88, 90, 90],
    ['now-jax-ewers', 'Quinn Ewers', '2026–', 'Was the number one recruit in America before he had a driving licence.', 88, 82, 84, 80, 66, 74, 60],
    ['now-jax-mullens', 'Nick Mullens', '2025–', 'Threw for 400 yards in a game once and has been a backup ever since.', 80, 80, 78, 74, 46, 78, 60],
    ['now-jax-aguilar', 'Joey Aguilar', '2026–', 'Three colleges in three years, and he threw it deep at all of them.', 86, 76, 84, 62, 70, 72, 60],
  ],
  kc: [
    ['now-kc-mahomes', 'Patrick Mahomes', '2017–', 'Has won three rings before turning 30 and finds something when the play is dead.', 94, 94, 96, 98, 86, 97, 99],
    ['now-kc-fields', 'Justin Fields', '2026–', 'Still the fastest quarterback alive and still nobody knows where the ball is going.', 90, 70, 86, 58, 97, 68, 66],
    ['now-kc-nussmeier', 'Garrett Nussmeier', '2026–', 'His father coached quarterbacks for twenty years and you can see it in the feet.', 88, 80, 86, 68, 62, 78, 66],
  ],
  lv: [
    ['now-lv-cousins', 'Kirk Cousins', '2026–', 'Third franchise in three years, and somebody keeps guaranteeing him the money.', 82, 92, 78, 82, 40, 86, 56],
    ['now-lv-oconnell', 'Aidan O\'Connell', '2023–', 'A fourth round pick from Purdue who keeps being the answer nobody wanted.', 82, 80, 78, 80, 50, 76, 68],
    ['now-lv-mendoza', 'Fernando Mendoza', '2026–', 'Went from Berkeley to Indiana to the first round in about eighteen months.', 90, 88, 86, 78, 74, 86, 76],
  ],
  lac: [
    ['now-lac-herbert', 'Justin Herbert', '2020–', 'Six foot six with a cannon, and he threw for 400 with broken rib cartilage.', 96, 90, 96, 90, 80, 90, 88],
    ['now-lac-lance', 'Trey Lance', '2025–', 'Fourth franchise before his 26th birthday, and the arm still looks the part.', 90, 66, 78, 58, 86, 62, 50],
    ['now-lac-uiagalelei', 'DJ Uiagalelei', '2026–', 'Six foot four with a cannon, and four colleges could not fix the rest.', 92, 68, 86, 64, 66, 66, 56],
  ],
  lar: [
    ['now-lar-stafford', 'Matthew Stafford', '2021–', 'Fires it into windows nobody else sees and won a ring at 34 doing it.', 92, 90, 97, 96, 50, 92, 90],
    ['now-lar-bennett', 'Stetson Bennett', '2023–', 'Won two national titles as a walk on and then vanished for a whole season.', 82, 74, 80, 60, 78, 70, 66],
    ['now-lar-simpson', 'Ty Simpson', '2026–', 'Waited three years behind two starters at Alabama and then looked ready.', 88, 84, 84, 72, 76, 80, 70],
  ],
  mia: [
    ['now-mia-willis', 'Malik Willis', '2026–', 'Won two starts nobody expected in Green Bay and got handed a job for it.', 92, 72, 86, 62, 92, 68, 74],
    ['now-mia-mccord', 'Kyle McCord', '2026–', 'Threw for 4,779 yards at Syracuse and slid to the sixth round for it.', 86, 82, 84, 70, 58, 78, 70],
    ['now-mia-cook', 'Brady Cook', '2026–', 'Played a whole season at Missouri on a shoulder nobody thought would hold.', 84, 78, 80, 66, 80, 74, 66],
  ],
  min: [
    ['now-min-murray', 'Kyler Murray', '2026–', 'Gone the moment you blink, and the throws come out sideways when he is bored.', 92, 90, 90, 80, 96, 86, 88],
    ['now-min-wentz', 'Carson Wentz', '2026–', 'Nearly won an MVP in 2017 and has been somebody\'s backup every year since.', 90, 74, 88, 64, 74, 72, 62],
    ['now-min-mccarthy', 'J.J. McCarthy', '2024–', 'Won 27 of 28 at Michigan and lost his rookie season to a knee.', 90, 86, 90, 82, 80, 84, 86],
    ['now-min-brosmer', 'Max Brosmer', '2025–', 'Undrafted local kid who talked his way onto the roster in August.', 78, 74, 74, 62, 62, 80, 54],
  ],
  ne: [
    ['now-ne-maye', 'Drake Maye', '2024–', 'Third overall, and by year two he was throwing people open all over the field.', 92, 90, 90, 90, 90, 90, 90],
    ['now-ne-devito', 'Tommy DeVito', '2026–', 'Undrafted kid from New Jersey who won three straight and became a folk hero.', 80, 74, 76, 60, 74, 70, 80],
    ['now-ne-morton', 'Behren Morton', '2026–', 'Texas Tech gunslinger who played through about nine separate injuries.', 86, 80, 84, 66, 66, 76, 68],
  ],
  no: [
    ['now-no-shough', 'Tyler Shough', '2025–', 'Played seven seasons of college football and broke a bone in three of them.', 88, 80, 86, 68, 74, 76, 66],
    ['now-no-rattler', 'Spencer Rattler', '2024–', 'Was a Netflix villain in high school and has been proving people wrong since.', 88, 80, 84, 74, 76, 78, 72],
    ['now-no-zwilson', 'Zach Wilson', '2026–', 'Fifth stop for a second overall pick who is somehow still only 27.', 92, 70, 84, 58, 80, 64, 48],
  ],
  nyg: [
    ['now-nyg-dart', 'Jaxson Dart', '2025–', 'Took the job in week four and ran somebody over on his first drive.', 88, 86, 86, 78, 90, 84, 86],
    ['now-nyg-winston', 'Jameis Winston', '2025–', 'The best pregame speech in football, attached to the wildest arm in it.', 92, 68, 90, 84, 68, 76, 74],
    ['now-nyg-haener', 'Jake Haener', '2026–', 'Fourth round pick out of Fresno who competes for every rep he gets.', 78, 78, 74, 64, 62, 76, 62],
  ],
  nyj: [
    ['now-nyj-geno', 'Geno Smith', '2026–', 'Nobody wanted him for the better part of a decade and he starts at 35.', 90, 92, 86, 88, 72, 90, 86],
    ['now-nyj-klubnik', 'Cade Klubnik', '2026–', 'Won an ACC title at Clemson and arrived to hold a clipboard for a 35 year old.', 86, 82, 84, 70, 82, 80, 74],
    ['now-nyj-zappe', 'Bailey Zappe', '2026–', 'Fourth franchise for a man who set every record Western Kentucky keeps.', 80, 74, 76, 60, 58, 72, 56],
  ],
  phi: [
    ['now-phi-hurts', 'Jalen Hurts', '2020–', 'Squats 600 pounds, scores from the one every time, and won the big one.', 90, 86, 90, 88, 94, 88, 96],
    ['now-phi-mckee', 'Tanner McKee', '2023–', 'Sixth round pick who threw for 300 yards the first time they let him.', 88, 90, 88, 74, 52, 74, 66],
    ['now-phi-dalton', 'Andy Dalton', '2026–', 'The Red Rifle at 38, still good for one clean afternoon a month.', 82, 88, 80, 90, 42, 84, 80],
    ['now-phi-payton', 'Cole Payton', '2026–', 'Won a title at North Dakota State and they line him up like a fullback.', 80, 76, 78, 64, 84, 74, 66],
  ],
  pit: [
    ['now-pit-rodgers', 'Aaron Rodgers', '2025–', 'Turned 42 in a town that only wants to know whether you can still play.', 88, 90, 88, 90, 52, 94, 88],
    ['now-pit-rudolph', 'Mason Rudolph', '2024–', 'Got in a helmet swinging brawl once and has been rehabilitating it ever since.', 84, 76, 82, 76, 52, 74, 64],
    ['now-pit-howard', 'Will Howard', '2025–', 'Won a national title at Ohio State and went in the sixth round anyway.', 86, 78, 82, 64, 76, 74, 70],
    ['now-pit-allar', 'Drew Allar', '2026–', 'Six foot five with an enormous arm and a college career people argued about.', 94, 76, 88, 70, 70, 78, 62],
  ],
  sf: [
    ['now-sf-purdy', 'Brock Purdy', '2022–', 'Went last in the entire draft and reached a Super Bowl fourteen months later.', 82, 92, 90, 92, 74, 90, 90],
    ['now-sf-macjones', 'Mac Jones', '2025–', 'Came off the bench in September and threw for 300 in three straight.', 80, 88, 82, 74, 46, 84, 66],
    ['now-sf-rourke', 'Kurtis Rourke', '2026–', 'Played a whole season at Indiana on a torn knee and told almost nobody.', 84, 84, 82, 68, 58, 80, 64],
  ],
  sea: [
    ['now-sea-darnold', 'Sam Darnold', '2025–', 'Fifth franchise, and he finally landed somewhere that wanted him to be himself.', 90, 86, 90, 80, 78, 82, 74],
    ['now-sea-lock', 'Drew Lock', '2023–', 'Won a Sunday night game in relief and it was the highlight of his career.', 88, 70, 88, 58, 74, 66, 68],
    ['now-sea-milroe', 'Jalen Milroe', '2025–', 'The fastest man in the draft played quarterback, and they took him anyway.', 92, 66, 88, 58, 97, 64, 60],
  ],
  tb: [
    ['now-tb-mayfield', 'Baker Mayfield', '2023–', 'Nobody wanted him at all in 2023 and he throws for 4,000 yards a season now.', 90, 90, 90, 80, 86, 88, 92],
    ['now-tb-stick', 'Easton Stick', '2026–', 'Watched Herbert throw for five seasons and it did not rub off.', 80, 80, 74, 66, 68, 70, 60],
    ['now-tb-jdaniels', 'Jalon Daniels', '2026–', 'Kansas quarterback whose back kept taking whole seasons away from him.', 86, 78, 84, 66, 88, 74, 70],
  ],
  ten: [
    ['now-ten-ward', 'Cam Ward', '2025–', 'Went from no scholarship offers to first overall in five years.', 96, 88, 92, 84, 82, 84, 88],
    ['now-ten-trubisky', 'Mitchell Trubisky', '2026–', 'Went second overall in 2017 and has been a career backup for most of the decade.', 84, 74, 78, 70, 80, 66, 58],
    ['now-ten-hooker', 'Hendon Hooker', '2023–', 'Tore a knee in November, went in the third round, and has barely played since.', 90, 74, 84, 62, 78, 70, 58],
  ],
  was: [
    ['now-was-daniels', 'Jayden Daniels', '2024–', 'Won Rookie of the Year and threw a Hail Mary that beat Chicago at the gun.', 88, 92, 92, 90, 97, 90, 92],
    ['now-was-mariota', 'Marcus Mariota', '2024–', 'Came in twice for an injured starter and won both games without any fuss.', 84, 84, 80, 80, 88, 74, 78],
    ['now-was-kaliakmanis', 'Athan Kaliakmanis', '2026–', 'Rutgers arm who went undrafted and survived every cut this summer.', 86, 72, 82, 64, 76, 70, 58],
    ['now-was-hartman', 'Sam Hartman', '2026–', 'Threw 110 touchdowns in college and has yet to throw one that counted.', 82, 78, 80, 66, 68, 78, 62],
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
