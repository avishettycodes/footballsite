import type { Player } from '../types';

/**
 * 2026 Week 1 active quarterback rooms. Ratings are generated from Madden NFL 27 by
 * scripts/sync-current-ratings.ts and checked against the frozen source fixture.
 *
 * Row format:
 *   [id, name, years, blurb, ARM, ACC, DEEP, PKT, MOB, PRO, CLT]
 */

type Row = [string, string, string, string, number, number, number, number, number, number, number];

const POOLS: Record<string, Row[]> = {
  ari: [
    ['now-ari-brissett', 'Jacoby Brissett', '2025–', 'Has backed up half the league and never once lost a locker room.', 90, 87, 88, 72, 79, 74, 79],
    ['now-ari-minshew', 'Gardner Minshew', '2026–', 'The mustache arrived in the desert to hold a clipboard for a while.', 86, 84, 84, 83, 82, 77, 83],
    ['now-ari-beck', 'Carson Beck', '2026–', 'Threw for 3,900 at Georgia and then transferred to Miami for a lot of money.', 89, 84, 86, 72, 81, 74, 76],
  ],
  atl: [
    ['now-atl-penix', 'Michael Penix Jr.', '2024–', 'That left arm is a whip, and both knees have already been rebuilt once.', 92, 86, 86, 76, 85, 78, 77],
    ['now-atl-tua', 'Tua Tagovailoa', '2026–', 'Fastest release in football, and everybody holds their breath when he goes down.', 87, 87, 88, 83, 83, 80, 83],
    ['now-atl-rush', 'Cooper Rush', '2026–', 'Won nine of fourteen as an emergency starter and got paid for it.', 85, 82, 82, 67, 73, 74, 78],
    ['now-atl-strand', 'Jack Strand', '2026–', 'Small school arm who spent the summer taking the last reps of every practice.', 88, 79, 83, 75, 82, 60, 70],
  ],
  bal: [
    ['now-bal-lamar', 'Lamar Jackson', '2018–', 'Nobody has ever run this position like him, and now he throws it better too.', 93, 93, 90, 99, 99, 97, 95],
    ['now-bal-huntley', 'Tyler Huntley', '2020–', 'Made a Pro Bowl as an alternate without throwing a touchdown that season.', 86, 82, 81, 81, 89, 73, 78],
    ['now-bal-fagnano', 'Joe Fagnano', '2025–', 'Threw for 9,000 yards at Maine and Connecticut, which nobody was watching.', 86, 78, 81, 71, 83, 66, 72],
  ],
  buf: [
    ['now-buf-allen', 'Josh Allen', '2018–', 'An MVP built like a tight end who has never once considered sliding.', 98, 94, 99, 97, 90, 99, 97],
    ['now-buf-kallen', 'Kyle Allen', '2023–', 'Started 22 games for three bad teams and lost eighteen of them.', 84, 80, 81, 68, 79, 69, 73],
  ],
  car: [
    ['now-car-young', 'Bryce Young', '2023–', 'Benched in September and playing the best football of his life by December.', 87, 86, 89, 86, 91, 80, 84],
    ['now-car-pickett', 'Kenny Pickett', '2026–', 'A first round pick with famously small hands, now on his fourth team.', 86, 82, 83, 78, 85, 72, 77],
    ['now-car-king', 'Haynes King', '2026–', 'Played six college seasons, rebuilt both knees, and stayed mobile enough to keep a roster spot.', 87, 82, 83, 75, 93, 61, 71],
  ],
  chi: [
    ['now-chi-caleb', 'Caleb Williams', '2024–', 'Paints his nails before games and throws ropes off his back foot when it breaks down.', 97, 86, 96, 94, 95, 86, 89],
    ['now-chi-bagent', 'Tyson Bagent', '2023–', 'Came out of Division II, and his father wrestles arms for a living.', 86, 77, 79, 71, 86, 69, 75],
    ['now-chi-keenum', 'Case Keenum', '2025–', 'Has started for seven franchises and won a playoff game on a miracle.', 85, 80, 82, 79, 75, 72, 73],
  ],
  cin: [
    ['now-cin-burrow', 'Joe Burrow', '2020–', 'Puts it on the numbers from 40 yards while a defensive end lands on him.', 88, 99, 95, 97, 86, 95, 99],
    ['now-cin-flacco', 'Joe Flacco', '2026–', 'Won a Super Bowl MVP thirteen years ago and is still standing in there at 41.', 89, 85, 86, 61, 71, 79, 83],
  ],
  cle: [
    ['now-cle-watson', 'Deshaun Watson', '2022–', 'Carries the biggest guaranteed contract in the sport into a backup role.', 88, 80, 83, 83, 89, 72, 76],
    ['now-cle-sanders', 'Shedeur Sanders', '2025–', 'Slid to the fifth round on live television and took it extremely personally.', 88, 83, 86, 80, 83, 74, 80],
    ['now-cle-green', 'Taylen Green', '2026–', 'Six foot six and runs a 4.6, and nobody knows yet whether he can read a defense.', 91, 79, 85, 80, 92, 52, 66],
  ],
  dal: [
    ['now-dal-dak', 'Dak Prescott', '2016–', 'A fourth round pick who has outlasted every doubt except the January ones.', 92, 92, 94, 93, 86, 93, 95],
    ['now-dal-howell', 'Sam Howell', '2026–', 'Was sacked 65 times in one season and kept getting back up.', 90, 80, 85, 75, 85, 66, 72],
  ],
  den: [
    ['now-den-nix', 'Bo Nix', '2024–', 'Started 61 college games and looked bored by the middle of his rookie year.', 93, 86, 92, 82, 86, 83, 89],
    ['now-den-stidham', 'Jarrett Stidham', '2023–', 'Has now backed up Brady, Carr and Nix, and enjoys the view.', 86, 79, 81, 69, 80, 73, 79],
    ['now-den-ehlinger', 'Sam Ehlinger', '2025–', 'Runs like a fullback and throws like a man who should stick to running.', 83, 74, 78, 72, 83, 66, 71],
  ],
  det: [
    ['now-det-goff', 'Jared Goff', '2021–', 'Throws the prettiest ball in the sport from inside a perfectly clean pocket.', 90, 96, 87, 82, 77, 94, 90],
    ['now-det-dobbs', 'Joshua Dobbs', '2026–', 'An aerospace engineer who keeps getting hired to learn playbooks fast.', 85, 82, 83, 81, 87, 71, 75],
  ],
  gb: [
    ['now-gb-love', 'Jordan Love', '2020–', 'Sat behind a legend for three seasons, then looked like a natural.', 92, 91, 92, 84, 83, 88, 89],
    ['now-gb-tyrod', 'Tyrod Taylor', '2026–', 'Fifteen seasons of being quietly better than whoever is starting ahead of him.', 87, 81, 84, 80, 89, 74, 77],
  ],
  hou: [
    ['now-hou-stroud', 'C.J. Stroud', '2023–', 'Threw 470 yards on a Sunday as a rookie and has not thrown a bad ball since.', 91, 85, 89, 79, 85, 81, 82],
    ['now-hou-mills', 'Davis Mills', '2021–', 'Third round pick who kept the seat warm and has stayed useful doing it.', 87, 82, 83, 65, 80, 75, 78],
  ],
  ind: [
    ['now-ind-djones', 'Daniel Jones', '2025–', 'Danny Dimes got run out of New York and is winning games in blue again.', 87, 89, 86, 83, 87, 83, 88],
    ['now-ind-richardson', 'Anthony Richardson', '2023–', 'Ran for 200 yards in a game and completed 47 percent in the same month.', 96, 78, 86, 81, 95, 69, 72],
    ['now-ind-leonard', 'Riley Leonard', '2025–', 'Ran Notre Dame to a title game on his legs and a lot of nerve.', 89, 80, 84, 77, 88, 73, 73],
  ],
  jax: [
    ['now-jax-lawrence', 'Trevor Lawrence', '2021–', 'Generational everything, and 28 points down at halftime he actually delivered.', 92, 90, 89, 86, 91, 88, 90],
    ['now-jax-ewers', 'Quinn Ewers', '2026–', 'Was the number one recruit in America before he had a driving licence.', 86, 80, 81, 68, 79, 77, 77],
  ],
  kc: [
    ['now-kc-mahomes', 'Patrick Mahomes', '2017–', 'Has won three rings before turning 30 and finds something when the play is dead.', 97, 92, 93, 93, 90, 99, 96],
    ['now-kc-fields', 'Justin Fields', '2026–', 'Still the fastest quarterback alive and still nobody knows where the ball is going.', 91, 82, 86, 81, 97, 66, 72],
    ['now-kc-nussmeier', 'Garrett Nussmeier', '2026–', 'His father coached quarterbacks for twenty years and you can see it in the feet.', 88, 80, 83, 72, 79, 70, 78],
  ],
  lv: [
    ['now-lv-cousins', 'Kirk Cousins', '2026–', 'Third franchise in three years, and somebody keeps guaranteeing him the money.', 85, 85, 84, 63, 70, 84, 85],
    ['now-lv-mendoza', 'Fernando Mendoza', '2026–', 'Went from Berkeley to Indiana to the first round in about eighteen months.', 91, 84, 87, 83, 87, 81, 84],
    ['now-lv-oconnell', 'Aidan O\'Connell', '2023–', 'A fourth round pick from Purdue who keeps being the answer nobody wanted.', 86, 82, 83, 70, 79, 75, 78],
  ],
  lac: [
    ['now-lac-herbert', 'Justin Herbert', '2020–', 'Six foot six with a cannon, and he threw for 400 with broken rib cartilage.', 96, 92, 93, 88, 86, 93, 92],
    ['now-lac-lance', 'Trey Lance', '2025–', 'Fourth franchise before his 26th birthday, and the arm still looks the part.', 91, 79, 85, 77, 92, 58, 65],
  ],
  lar: [
    ['now-lar-stafford', 'Matthew Stafford', '2021–', 'Fires it into windows nobody else sees and won a ring at 34 doing it.', 95, 98, 98, 81, 75, 97, 95],
    ['now-lar-bennett', 'Stetson Bennett', '2023–', 'Won two national titles as a walk on and then vanished for a whole season.', 87, 79, 82, 72, 90, 74, 76],
    ['now-lar-simpson', 'Ty Simpson', '2026–', 'Waited three years behind two starters at Alabama and then looked ready.', 90, 84, 86, 82, 86, 78, 81],
  ],
  mia: [
    ['now-mia-willis', 'Malik Willis', '2026–', 'Won two starts nobody expected in Green Bay and got handed a job for it.', 93, 80, 86, 82, 96, 78, 82],
    ['now-mia-mccord', 'Kyle McCord', '2026–', 'Threw for 4,779 yards at Syracuse and slid to the sixth round for it.', 87, 80, 84, 65, 78, 76, 79],
    ['now-mia-cook', 'Brady Cook', '2026–', 'Played a whole season at Missouri on a shoulder nobody thought would hold.', 88, 78, 82, 72, 89, 66, 70],
  ],
  min: [
    ['now-min-murray', 'Kyler Murray', '2026–', 'Gone the moment you blink, and the throws come out sideways when he is bored.', 90, 85, 87, 86, 93, 70, 75],
    ['now-min-wentz', 'Carson Wentz', '2026–', 'Nearly won an MVP in 2017 and has been somebody\'s backup every year since.', 89, 80, 85, 77, 83, 77, 80],
    ['now-min-mccarthy', 'J.J. McCarthy', '2024–', 'Won 27 of 28 at Michigan and lost his rookie season to a knee.', 91, 84, 88, 80, 90, 69, 72],
  ],
  ne: [
    ['now-ne-maye', 'Drake Maye', '2024–', 'Third overall, and by year two he was throwing people open all over the field.', 94, 93, 96, 89, 89, 90, 93],
    ['now-ne-devito', 'Tommy DeVito', '2026–', 'Undrafted kid from New Jersey who won three straight and became a folk hero.', 83, 78, 78, 72, 87, 70, 73],
    ['now-ne-morton', 'Behren Morton', '2026–', 'Texas Tech gunslinger who played through about nine separate injuries.', 86, 80, 81, 72, 81, 64, 71],
  ],
  no: [
    ['now-no-shough', 'Tyler Shough', '2025–', 'Played seven seasons of college football and broke a bone in three of them.', 92, 90, 87, 71, 85, 79, 78],
    ['now-no-rattler', 'Spencer Rattler', '2024–', 'Was a Netflix villain in high school and has been proving people wrong since.', 90, 84, 85, 82, 85, 66, 77],
    ['now-no-zwilson', 'Zach Wilson', '2026–', 'Fifth stop for a second overall pick who is somehow still only 27.', 93, 80, 87, 76, 87, 71, 75],
  ],
  nyg: [
    ['now-nyg-dart', 'Jaxson Dart', '2025–', 'Took the job in week four and ran somebody over on his first drive.', 88, 88, 86, 85, 88, 82, 85],
    ['now-nyg-winston', 'Jameis Winston', '2025–', 'The best pregame speech in football, attached to the wildest arm in it.', 90, 84, 87, 84, 77, 74, 80],
  ],
  nyj: [
    ['now-nyj-geno', 'Geno Smith', '2026–', 'Nobody wanted him for the better part of a decade and he starts at 35.', 88, 85, 86, 79, 83, 80, 80],
    ['now-nyj-klubnik', 'Cade Klubnik', '2026–', 'Won an ACC title at Clemson and arrived to hold a clipboard for a 35 year old.', 92, 82, 87, 81, 89, 66, 71],
  ],
  phi: [
    ['now-phi-hurts', 'Jalen Hurts', '2020–', 'Squats 600 pounds, scores from the one every time, and won the big one.', 86, 89, 87, 92, 93, 89, 87],
    ['now-phi-mckee', 'Tanner McKee', '2023–', 'Sixth round pick who threw for 300 yards the first time they let him.', 87, 81, 83, 62, 81, 73, 78],
    ['now-phi-dalton', 'Andy Dalton', '2026–', 'The Red Rifle at 38, still good for one clean afternoon a month.', 87, 84, 84, 69, 72, 78, 83],
    ['now-phi-payton', 'Cole Payton', '2026–', 'Won a title at North Dakota State and they line him up like a fullback.', 85, 83, 83, 82, 87, 63, 71],
  ],
  pit: [
    ['now-pit-rodgers', 'Aaron Rodgers', '2025–', 'Turned 42 in a town that only wants to know whether you can still play.', 93, 86, 88, 80, 77, 88, 87],
    ['now-pit-rudolph', 'Mason Rudolph', '2024–', 'Got in a helmet swinging brawl once and has been rehabilitating it ever since.', 86, 83, 83, 72, 72, 74, 79],
    ['now-pit-howard', 'Will Howard', '2025–', 'Won a national title at Ohio State and went in the sixth round anyway.', 86, 80, 84, 69, 83, 73, 78],
    ['now-pit-allar', 'Drew Allar', '2026–', 'Six foot five with an enormous arm and a college career people argued about.', 91, 82, 85, 78, 81, 76, 79],
  ],
  sf: [
    ['now-sf-purdy', 'Brock Purdy', '2022–', 'Went last in the entire draft and reached a Super Bowl fourteen months later.', 87, 93, 88, 86, 86, 89, 88],
    ['now-sf-macjones', 'Mac Jones', '2025–', 'Came off the bench in September and threw for 300 in three straight.', 86, 88, 84, 69, 83, 82, 85],
    ['now-sf-rourke', 'Kurtis Rourke', '2026–', 'Played a whole season at Indiana on a torn knee and told almost nobody.', 90, 78, 83, 67, 78, 72, 73],
  ],
  sea: [
    ['now-sea-darnold', 'Sam Darnold', '2025–', 'Fifth franchise, and he finally landed somewhere that wanted him to be himself.', 91, 92, 97, 83, 83, 85, 89],
    ['now-sea-lock', 'Drew Lock', '2023–', 'Won a Sunday night game in relief and it was the highlight of his career.', 89, 81, 83, 72, 85, 73, 79],
    ['now-sea-milroe', 'Jalen Milroe', '2025–', 'The fastest man in the draft played quarterback, and they took him anyway.', 92, 76, 86, 76, 96, 65, 71],
  ],
  tb: [
    ['now-tb-mayfield', 'Baker Mayfield', '2023–', 'Nobody wanted him at all in 2023 and he throws for 4,000 yards a season now.', 95, 88, 92, 86, 87, 88, 90],
    ['now-tb-jdaniels', 'Jalon Daniels', '2026–', 'Kansas quarterback whose back kept taking whole seasons away from him.', 87, 78, 83, 78, 88, 58, 66],
  ],
  ten: [
    ['now-ten-ward', 'Cam Ward', '2025–', 'Went from no scholarship offers to first overall in five years.', 91, 83, 87, 87, 87, 77, 82],
    ['now-ten-trubisky', 'Mitchell Trubisky', '2026–', 'Went second overall in 2017 and has been a career backup for most of the decade.', 89, 79, 84, 77, 88, 67, 71],
  ],
  was: [
    ['now-was-daniels', 'Jayden Daniels', '2024–', 'Won Rookie of the Year and threw a Hail Mary that beat Chicago at the gun.', 92, 87, 89, 87, 95, 74, 83],
    ['now-was-mariota', 'Marcus Mariota', '2024–', 'Came in twice for an injured starter and won both games without any fuss.', 86, 85, 82, 81, 89, 78, 82],
    ['now-was-kaliakmanis', 'Athan Kaliakmanis', '2026–', 'Rutgers arm who went undrafted and survived every cut this summer.', 87, 77, 83, 75, 81, 69, 78],
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
