import type { Player } from '../types';

/**
 * RECEIVER ROOMS AS THEY STAND NOW. Rules are in ./qb.ts and they apply here.
 *
 * Receiver is the deepest room on a real roster and it is the deepest one here, five and
 * six men at most franchises. Everybody is on the active roster, nobody is on a practice
 * squad, and nobody used to play here.
 *
 * THE SCALE IS TODAY'S LEAGUE. Justin Jefferson runs routes at 99 in both files, because
 * he would have in any era. Everybody underneath him moves: a 90 here means one of the
 * thirty best at it playing this season, which is not the same 90 the all-time file hands
 * out. Size is judged the same way it always is, off how big he plays rather than how big
 * the programme lists him.
 *
 * A CARD MUST NOT CONTRADICT ITS OWN BLURB, which is how CeeDee Lamb got caught.
 *
 * `npm run leaders` prints the top five at every trait and then asks the question
 * backwards: which of the highest rated cards at this position are top five in nothing?
 * Lamb came out of that list. His line says he caught 135 passes in a season and does
 * whatever he likes after the catch, and the numbers beside it had him eighth in catching
 * and eighth in YAC. The blurb and the card were describing two different receivers.
 *
 * He reads 97 catching and 96 YAC now, which is level with Chase and Nacua rather than
 * ahead of Jefferson. DJ Moore came out of the same list and did NOT move: he is a very
 * good complete receiver with no elite trait, and a card saying exactly that is a correct
 * card rather than a missing 99.
 *
 * Row format:
 *   [id, name, years, blurb, SPD, HND, RTE, RLS, CTC, YAC, SZE]
 */

type Row = [string, string, string, string, number, number, number, number, number, number, number];

const POOLS: Record<string, Row[]> = {
  ari: [
    ['now-ari-harrison', 'Marvin Harrison Jr.', '2024–', 'His father is in the Hall of Fame and the comparison started on day one.', 90, 88, 92, 87, 94, 76, 94],
    ['now-ari-jbrooks', 'Jalen Brooks', '2026–', 'Seventh round pick in Dallas who has caught a dozen passes and keeps surviving cuts.', 88, 82, 78, 76, 76, 76, 88],
    ['now-ari-wilson', 'Michael Wilson', '2023–', 'Third round pick who blocks like a tight end and catches everything short.', 84, 90, 84, 79, 80, 78, 88],
    ['now-ari-fehoko', 'Simi Fehoko', '2024–', 'Six foot four, runs a 4.4, and has fifteen career catches.', 94, 72, 70, 74, 66, 76, 96],
    ['now-ari-virgil', 'Reggie Virgil', '2025–', 'Came out of Miami of Ohio undrafted and is enormous in a jump ball drill.', 84, 80, 74, 72, 88, 72, 94],
    ['now-ari-bourne', 'Kendrick Bourne', '2026–', 'Tore a knee in New England and came back catching everything on third down.', 84, 90, 88, 83, 78, 82, 75],
    ['now-ari-duvernay', 'Devin Duvernay', '2024–', 'Made two Pro Bowls as a returner and cannot get on the field otherwise.', 94, 78, 74, 79, 68, 88, 71],
  ],
  atl: [
    ['now-atl-london', 'Drake London', '2022–', 'Six foot four, and he simply takes the ball off people in the air.', 84, 92, 90, 85, 97, 80, 99],
    ['now-atl-blair', 'Chris Blair', '2026–', 'Alcorn State receiver who has spent three years one injury from playing.', 90, 82, 78, 76, 84, 76, 86],
    ['now-atl-dotson', 'Jahan Dotson', '2026–', 'Sixteenth overall pick who is on his third franchise at 26.', 90, 82, 86, 83, 76, 80, 71],
    ['now-atl-zaccheaus', 'Olamide Zaccheaus', '2025–', 'Seven seasons in the league for a man nobody wanted out of Virginia.', 90, 84, 84, 83, 80, 84, 59],
    ['now-atl-branch', 'Zachariah Branch', '2026–', 'He was the fastest man on the field every Saturday and he weighs about 175 pounds.', 97, 80, 80, 87, 58, 94, 48],
  ],
  bal: [
    ['now-bal-bateman', 'Rashod Bateman', '2021–', 'First round pick who took four seasons to have one good one.', 88, 84, 88, 81, 86, 74, 86],
    ['now-bal-walker', 'Devontez Walker', '2024–', 'Runs a 4.36 and has been active for about nine games in two years.', 95, 74, 74, 76, 72, 76, 86],
    ['now-bal-flowers', 'Zay Flowers', '2023–', 'Five foot nine of pure trouble in space, and he never stops moving.', 94, 86, 90, 94, 84, 94, 59],
    ['now-bal-sarratt', 'Elijah Sarratt', '2026–', 'Went from Saint Francis to Indiana to a starting job in about three years.', 86, 88, 86, 81, 86, 80, 86],
    ['now-bal-lane', 'Ja\'Kobi Lane', '2026–', 'Six foot four at USC, and he wins any ball thrown near the back pylon.', 84, 86, 80, 76, 94, 72, 97],
    ['now-bal-wester', 'LaJohntay Wester', '2025–', 'Caught 100 passes at Florida Atlantic and returns punts because he is 165 pounds.', 94, 86, 84, 85, 56, 90, 44],
  ],
  buf: [
    ['now-buf-coleman', 'Keon Coleman', '2024–', 'Six foot four, and he came to his own press conference in a fur coat.', 84, 82, 78, 76, 94, 80, 96],
    ['now-buf-palmer', 'Joshua Palmer', '2025–', 'Ran the routes Herbert trusted and has never been anybody\'s first option.', 86, 86, 88, 83, 84, 74, 83],
    ['now-buf-moorex', 'DJ Moore', '2026–', 'Signed to be the man everybody has to account for on third down.', 90, 92, 92, 89, 88, 92, 86],
    ['now-buf-shakir', 'Khalil Shakir', '2022–', 'Led the entire league in yards after the catch per reception.', 88, 94, 90, 85, 82, 97, 69],
    ['now-buf-sbell', 'Skyler Bell', '2026–', 'Caught everything at UConn and nobody in the league had heard of him.', 86, 84, 82, 79, 68, 82, 61],
  ],
  car: [
    ['now-car-mcmillan', 'Tetairoa McMillan', '2025–', 'Six foot four out of Arizona, taken eighth overall to fix all of this.', 84, 92, 90, 81, 96, 78, 96],
    ['now-car-tremayne', 'Brycen Tremayne', '2026–', 'Broke a leg badly at Stanford and spent three years getting back to this.', 80, 84, 78, 72, 88, 70, 94],
    ['now-car-legette', 'Xavier Legette', '2024–', 'Ran a 4.39 at 221 pounds and drops it when he is wide open.', 94, 70, 78, 81, 76, 88, 94],
    ['now-car-metchie', 'John Metchie III', '2026–', 'Beat leukaemia at 22 and has spent four years trying to get a real chance.', 90, 84, 86, 83, 76, 82, 77],
    ['now-car-coker', 'Jalen Coker', '2024–', 'Undrafted out of Holy Cross and started by November of his rookie year.', 86, 88, 82, 76, 88, 78, 88],
  ],
  chi: [
    ['now-chi-odunze', 'Rome Odunze', '2024–', 'Ninth overall pick who wins everything thrown above his head.', 88, 88, 88, 83, 94, 78, 92],
    ['now-chi-jwalker', 'Jahdae Walker', '2026–', 'Six foot three out of Texas A&M, and he talked his way onto the roster.', 90, 84, 80, 81, 80, 80, 90],
    ['now-chi-burden', 'Luther Burden III', '2025–', 'Was the best player in the Big 12 as a sophomore and slid to the second round.', 92, 86, 84, 87, 84, 94, 79],
    ['now-chi-raymond', 'Kalif Raymond', '2026–', 'Five foot eight and he hits linebackers on running plays for a living.', 92, 84, 82, 81, 70, 88, 55],
    ['now-chi-zthomas', 'Zavion Thomas', '2026–', 'Returned punts at LSU, and that is still the whole of the job here.', 94, 78, 74, 81, 60, 90, 55],
  ],
  cin: [
    ['now-cin-chase', 'Ja\'Marr Chase', '2021–', 'Won the triple crown, and he has never once lost to a cornerback he knows.', 94, 97, 97, 99, 96, 96, 86],
    ['now-cin-higgins', 'Tee Higgins', '2020–', 'Would be the best man on almost any other roster in the league.', 86, 92, 90, 83, 97, 78, 96],
    ['now-cin-iosivas', 'Andrei Iosivas', '2023–', 'Was a decathlete at Princeton and scored nine touchdowns anyway.', 90, 82, 80, 76, 90, 74, 92],
    ['now-cin-cyoung', 'Colbie Young', '2025–', 'Six foot four out of Georgia, and he plays every snap like a power forward.', 80, 82, 76, 74, 92, 74, 97],
    ['now-cin-dmeyers', 'Dohnte Meyers', '2026–', 'Arkansas receiver who has never once put the ball on the ground.', 88, 86, 78, 76, 70, 80, 67],
    ['now-cin-kwilliams', 'Ke\'Shawn Williams', '2026–', 'Five foot nine, and he was the best player in Indiana for about a month.', 92, 84, 84, 85, 68, 88, 61],
  ],
  cle: [
    ['now-cle-boston', 'Denzel Boston', '2026–', 'Six foot four, and Cleveland finally has somebody worth throwing it up to.', 88, 86, 84, 81, 92, 76, 92],
    ['now-cle-corley', 'Malachi Corley', '2026–', 'Western Kentucky made him look unstoppable and the league has not agreed.', 90, 80, 78, 81, 74, 92, 75],
    ['now-cle-jeudy', 'Jerry Jeudy', '2024–', 'Runs the prettiest routes in football and catches about seven in ten.', 90, 80, 96, 94, 78, 84, 75],
    ['now-cle-wallace', 'Tylan Wallace', '2026–', 'Cleveland signed him for the special teams and he keeps making the roster.', 88, 78, 76, 74, 82, 82, 77],
    ['now-cle-concepcion', 'KC Concepcion', '2026–', 'Was the best freshman in the ACC and then went to the SEC for money.', 92, 86, 84, 89, 66, 92, 59],
  ],
  dal: [
    ['now-dal-pickens', 'George Pickens', '2025–', 'Makes a catch every week that nobody else in the sport could make.', 90, 84, 86, 83, 99, 80, 92],
    ['now-dal-lamb', 'CeeDee Lamb', '2020–', 'Caught 135 passes in a season and does whatever he likes after the catch.', 90, 97, 94, 91, 92, 96, 86],
    ['now-dal-mingo', 'Jonathan Mingo', '2025–', 'Carolina spent a second round pick on him and got a fourth back two years later.', 86, 76, 74, 79, 74, 78, 90],
    ['now-dal-flournoy', 'Ryan Flournoy', '2024–', 'Sixth round pick from Southeast Missouri State with two career catches.', 90, 78, 76, 76, 80, 78, 86],
    ['now-dal-turpin', 'KaVontae Turpin', '2022–', 'Was the MVP of a spring league and is the fastest man on this roster.', 97, 74, 72, 81, 66, 94, 55],
  ],
  den: [
    ['now-den-sutton', 'Courtland Sutton', '2018–', 'Goes up on the sideline against two defenders and comes down with it anyway.', 84, 86, 86, 79, 96, 74, 96],
    ['now-den-humphrey', 'Lil\'Jordan Humphrey', '2026–', 'Six foot four and built like a tight end, and he blocks like one too.', 78, 84, 76, 72, 90, 78, 98],
    ['now-den-waddle', 'Jaylen Waddle', '2026–', 'Cost a great deal to bring in and runs a 4.37 at 28 years old.', 97, 90, 90, 91, 76, 94, 59],
    ['now-den-mims', 'Marvin Mims Jr.', '2023–', 'Went to two Pro Bowls for returning kicks and hardly plays on offense.', 97, 84, 82, 85, 66, 92, 63],
    ['now-den-bryant', 'Pat Bryant', '2025–', 'Third round pick who blocks in the run game better than he separates.', 82, 84, 82, 72, 78, 72, 92],
    ['now-den-franklin', 'Troy Franklin', '2024–', 'Caught passes from Bo Nix in college and does it again now.', 94, 80, 84, 85, 68, 84, 71],
  ],
  det: [
    ['now-det-meeks', 'Jackson Meeks', '2026–', 'Six foot two and 235 pounds, and Syracuse got a thousand yards out of him.', 82, 86, 80, 74, 90, 74, 92],
    ['now-det-teslaa', 'Isaac TeSlaa', '2025–', 'Third round pick out of Arkansas who was a walk on at Hillsdale first.', 90, 82, 78, 76, 78, 78, 90],
    ['now-det-tmartin', 'Tay Martin', '2026–', 'Oklahoma State receiver who has been on five practice squads in four years.', 90, 84, 84, 81, 84, 80, 83],
    ['now-det-williams', 'Jameson Williams', '2022–', 'Twelfth overall pick with 4.3 speed who took three years to be trusted.', 97, 80, 84, 87, 76, 92, 73],
    ['now-det-brown', 'Amon-Ra St. Brown', '2021–', 'Fourth round pick who catches 115 passes a year out of the slot.', 86, 97, 96, 91, 88, 90, 75],
  ],
  gb: [
    ['now-gb-watson', 'Christian Watson', '2022–', 'Runs a 4.36 at six foot four, which is a physics problem for a cornerback.', 96, 78, 82, 83, 74, 88, 96],
    ['now-gb-golden', 'Matthew Golden', '2025–', 'Ran a 4.29 at the combine and went 23rd overall for it.', 97, 86, 86, 89, 80, 88, 73],
    ['now-gb-reed', 'Jayden Reed', '2023–', 'Second round pick who leads the team in yards after the catch every year.', 92, 86, 88, 87, 82, 94, 69],
    ['now-gb-melton', 'Bo Melton', '2026–', 'Runs a 4.34 and has bounced between three rosters looking for a role.', 96, 80, 78, 83, 62, 86, 59],
    ['now-gb-sturdivant', 'J. Michael Sturdivant', '2026–', 'Went to three colleges and every one of them threw him the deep ball.', 90, 82, 80, 79, 74, 78, 77],
    ['now-gb-moore', 'Skyy Moore', '2026–', 'Went to Green Bay for a late pick and gets to start over at 26.', 90, 76, 80, 81, 70, 82, 67],
  ],
  hou: [
    ['now-hou-collins', 'Nico Collins', '2021–', 'Six foot four, and he became the best receiver in the conference quietly.', 90, 94, 92, 85, 96, 88, 96],
    ['now-hou-wayne', 'Jared Wayne', '2024–', 'Caught passes at Pitt and has spent his whole career on the roster bubble.', 74, 92, 84, 74, 82, 70, 82],
    ['now-hou-boutte', 'Kayshon Boutte', '2026–', 'Was a five star recruit at 17 and is finally somebody starter at 24.', 88, 84, 82, 79, 84, 78, 81],
    ['now-hou-hutchinson', 'Xavier Hutchinson', '2026–', 'Holds records at Iowa State and plays about fifteen snaps a game.', 84, 86, 82, 74, 86, 72, 90],
    ['now-hou-noel', 'Jaylin Noel', '2025–', 'Third round slot receiver who was the other half of that Iowa State pair.', 94, 88, 88, 89, 82, 90, 63],
  ],
  ind: [
    ['now-ind-pierce', 'Alec Pierce', '2022–', 'Averaged 22 yards a grab one season and does nothing at all underneath.', 94, 76, 78, 79, 92, 70, 94],
    ['now-ind-treadwell', 'Laquon Treadwell', '2026–', 'Went 23rd overall in 2016 and has been proving people right ever since.', 76, 82, 78, 72, 88, 70, 92],
    ['now-ind-allen', 'Keenan Allen', '2026–', 'Thirty four years old and still nobody can cover him inside ten yards.', 76, 96, 97, 94, 86, 78, 83],
    ['now-ind-dulin', 'Ashton Dulin', '2019–', 'Came out of a Division II school in Ohio and has covered kicks for seven years.', 92, 78, 74, 79, 72, 80, 81],
    ['now-ind-downs', 'Josh Downs', '2023–', 'Nobody in the league wins on third and six from the slot more often.', 90, 92, 92, 91, 82, 88, 59],
    ['now-ind-burks', 'Deion Burks', '2025–', 'Scored seven touchdowns in a season at Purdue and then got hurt a lot.', 94, 82, 82, 87, 62, 88, 52],
  ],
  jax: [
    ['now-jax-thomas', 'Brian Thomas Jr.', '2024–', 'Went for 1,282 yards as a rookie while the rest of the offense fell apart.', 96, 88, 88, 87, 88, 90, 92],
    ['now-jax-cameron', 'Josh Cameron', '2026–', 'Went undrafted out of Baylor and catches everything nobody is covering.', 86, 86, 78, 74, 76, 78, 71],
    ['now-jax-meyers', 'Jakobi Meyers', '2026–', 'Went undrafted, and he has now been the reliable one for three franchises.', 84, 94, 92, 87, 84, 80, 83],
    ['now-jax-cjwilliams', 'CJ Williams', '2026–', 'Was a five star recruit at USC and has caught about 30 passes since.', 88, 82, 80, 76, 78, 76, 77],
    ['now-jax-washington', 'Parker Washington', '2023–', 'Took a punt 96 yards on a Sunday and has done very little since.', 88, 84, 82, 81, 70, 90, 67],
    ['now-jax-hunter', 'Travis Hunter', '2025–', 'Plays cornerback and receiver in the same game, which nobody has done in decades.', 94, 92, 90, 89, 92, 88, 73],
  ],
  kc: [
    ['now-kc-thornton', 'Tyquan Thornton', '2026–', 'Ran a 4.28 at the combine and took four years to catch anything with it.', 97, 74, 78, 83, 70, 84, 79],
    ['now-kc-callen', 'Cyrus Allen', '2026–', 'Ran a 4.35 at Texas A&M and is trying to outrun four other rookies.', 94, 78, 78, 83, 76, 84, 75],
    ['now-kc-worthy', 'Xavier Worthy', '2024–', 'Ran the fastest forty anybody has ever run at the combine.', 99, 82, 84, 89, 64, 94, 57],
    ['now-kc-remigio', 'Nikko Remigio', '2024–', 'Returns kicks in Kansas City and is listed generously at 5 foot 9.', 92, 84, 80, 83, 58, 88, 46],
    ['now-kc-rice', 'Rashee Rice', '2023–', 'Averaged 100 yards a game before the suspension and the knee.', 90, 90, 88, 85, 86, 97, 86],
    ['now-kc-royals', 'Jalen Royals', '2025–', 'Utah State receiver who runs after the catch like somebody stole from him.', 90, 86, 84, 83, 76, 92, 77],
  ],
  lv: [
    ['now-lv-tucker', 'Tre Tucker', '2023–', 'Ran a 4.32 and scored three touchdowns in one afternoon last season.', 97, 80, 80, 85, 70, 90, 57],
    ['now-lv-nailor', 'Jalen Nailor', '2026–', 'Signed for real money to be the man who takes the top off a defense.', 95, 80, 80, 83, 64, 86, 67],
    ['now-lv-benson', 'Malik Benson', '2026–', 'Junior college to Alabama to Florida State, and the speed never changed.', 95, 76, 78, 83, 78, 84, 77],
    ['now-lv-bech', 'Jack Bech', '2025–', 'Caught the winning touchdown in the Senior Bowl days after losing his brother.', 84, 90, 84, 76, 88, 78, 88],
    ['now-lv-dyoung', 'Dareke Young', '2026–', 'Built like a linebacker and he plays almost entirely on special teams.', 88, 76, 72, 74, 72, 80, 94],
  ],
  lac: [
    ['now-lac-johnston', 'Quentin Johnston', '2023–', 'First round pick who dropped everything for two years and then stopped.', 88, 78, 80, 76, 74, 82, 94],
    ['now-lac-lambertsmith', 'KeAndre Lambert-Smith', '2025–', 'Ran a 4.37 at Auburn, and the deep ball is most of what he does.', 95, 78, 78, 83, 70, 82, 67],
    ['now-lac-harris', 'Tre Harris', '2025–', 'Second round pick who averaged 20 yards a catch at Ole Miss.', 90, 84, 84, 79, 90, 78, 90],
    ['now-lac-bthompson', 'Brenen Thompson', '2026–', 'He might be the fastest man in the building and he weighs under 170 pounds.', 97, 74, 72, 81, 54, 84, 42],
    ['now-lac-mcconkey', 'Ladd McConkey', '2024–', 'Second round rookie who ran routes like a ten year veteran immediately.', 90, 94, 96, 94, 84, 92, 63],
    ['now-lac-davis', 'Derius Davis', '2023–', 'Might be the fastest man on the roster and touches it four times a month.', 97, 78, 74, 81, 66, 92, 52],
  ],
  lar: [
    ['now-lar-adams', 'Davante Adams', '2025–', 'Thirty two years old and still the best release anybody has seen.', 86, 94, 97, 99, 92, 80, 83],
    ['now-lar-mumpfield', 'Konata Mumpfield', '2025–', 'Fifth round rookie out of Pittsburgh with the surest hands on the roster.', 86, 90, 86, 79, 80, 78, 75],
    ['now-lar-nacua', 'Puka Nacua', '2023–', 'Broke the rookie receiving record as an afterthought on day three.', 88, 97, 94, 87, 94, 97, 90],
    ['now-lar-atwell', 'Tutu Atwell', '2021–', 'Weighs 165 pounds and they spent a second round pick on him anyway.', 97, 76, 78, 83, 56, 86, 48],
    ['now-lar-cjdaniels', 'CJ Daniels', '2026–', 'Played for three schools and caught touchdowns at every one of them.', 88, 86, 82, 79, 84, 78, 81],
    ['now-lar-whittington', 'Jordan Whittington', '2024–', 'Blocks like an extra lineman and catches enough to stay on the field.', 80, 86, 82, 74, 88, 78, 88],
    ['now-lar-xsmith', 'Xavier Smith', '2023–', 'Undrafted out of Florida A&M and he has been the fourth returner for years.', 92, 78, 74, 81, 56, 84, 44],
  ],
  mia: [
    ['now-mia-bell', 'Chris Bell', '2026–', 'Louisville rookie who weighs 220 pounds and plays a good deal bigger than that.', 86, 86, 82, 79, 90, 78, 90],
    ['now-mia-cdouglas', 'Caleb Douglas', '2026–', 'Texas Tech receiver taken on day three to run down the sideline.', 92, 82, 80, 79, 78, 78, 88],
    ['now-mia-washington', 'Malik Washington', '2024–', 'Led all of college football in receptions and went on day three anyway.', 88, 88, 86, 83, 82, 88, 59],
    ['now-mia-kcoleman', 'Kevin Coleman Jr.', '2026–', 'Caught 74 passes at Mississippi State and is barely 5 foot 11.', 90, 88, 84, 87, 62, 88, 55],
    ['now-mia-tolbert', 'Jalen Tolbert', '2026–', 'Five seasons in and he has never once pinned a starting job down.', 88, 82, 84, 79, 82, 76, 83],
    ['now-mia-rmiller', 'Ryan Miller', '2026–', 'Went undrafted, got cut twice, and he keeps turning up on somebody\'s roster.', 86, 82, 76, 74, 72, 78, 69],
  ],
  min: [
    ['now-min-jefferson', 'Justin Jefferson', '2020–', 'No cornerback alive has an answer, and every one of them has tried.', 94, 99, 99, 96, 96, 92, 88],
    ['now-min-felton', 'Tai Felton', '2025–', 'Was Maryland\'s leading receiver and has been thrown to twice so far.', 92, 84, 84, 81, 76, 84, 71],
    ['now-min-addison', 'Jordan Addison', '2023–', 'Runs the cleanest deep route in the league and weighs about 170 pounds.', 94, 86, 92, 89, 86, 84, 63],
    ['now-min-jennings', 'Jauan Jennings', '2026–', 'Blocks like a lineman and catches everything on a team that needed both.', 82, 92, 88, 79, 94, 82, 90],
    ['now-min-price', 'Myles Price', '2026–', 'Tiny slot receiver from Texas Tech who has never been tackled cleanly.', 92, 82, 82, 87, 56, 90, 44],
  ],
  ne: [
    ['now-ne-brown', 'A.J. Brown', '2026–', 'Two hundred and twenty six pounds arriving to make a young passer look right.', 90, 92, 92, 89, 96, 94, 99],
    ['now-ne-williams', 'Kyle Williams', '2025–', 'Third round rookie out of Washington State with a lot to prove.', 92, 84, 84, 83, 76, 86, 69],
    ['now-ne-doubs', 'Romeo Doubs', '2026–', 'Signed to be the second option and has always been better than that word.', 88, 80, 86, 81, 88, 76, 86],
    ['now-ne-hollins', 'Mack Hollins', '2026–', 'Six foot four, and he blocks downfield harder than most tight ends.', 84, 78, 74, 72, 76, 74, 96],
    ['now-ne-douglas', 'DeMario Douglas', '2023–', 'Was the only man in New England getting open for two entire seasons.', 92, 88, 90, 89, 72, 90, 55],
    ['now-ne-chism', 'Efton Chism III', '2025–', 'Caught 100 passes a year at Eastern Washington and nobody drafted him.', 82, 90, 88, 85, 62, 80, 55],
  ],
  no: [
    ['now-no-bbrown', 'Barion Brown', '2025–', 'Returned three kicks for touchdowns at Kentucky and runs a 4.34.', 97, 76, 76, 85, 58, 92, 57],
    ['now-no-lance', 'Bryce Lance', '2026–', 'His brother went third overall, and he went in the fourth to a better situation.', 88, 86, 84, 81, 84, 78, 86],
    ['now-no-olave', 'Chris Olave', '2022–', 'Runs a perfect route every time and has had four concussions doing it.', 92, 90, 96, 91, 82, 82, 75],
    ['now-no-vele', 'Devaughn Vele', '2025–', 'Six foot five and traded here for a pair of picks in the summer.', 82, 88, 82, 72, 86, 70, 98],
  ],
  nyg: [
    ['now-nyg-nabers', 'Malik Nabers', '2024–', 'Put up a rookie year nobody expected while the quarterback room burned down.', 94, 90, 94, 94, 88, 92, 77],
    ['now-nyg-obj', 'Odell Beckham Jr.', '2026–', 'Made the catch everybody has seen a thousand times, and that was twelve years ago.', 84, 88, 88, 85, 84, 78, 71],
    ['now-nyg-fields', 'Malachi Fields', '2026–', 'Six foot four out of Notre Dame, and he boxes people out like a center.', 82, 86, 80, 74, 92, 74, 96],
    ['now-nyg-mooney', 'Darnell Mooney', '2026–', 'Third franchise in three years for a man who can genuinely run past anybody.', 96, 76, 86, 89, 74, 84, 63],
  ],
  nyj: [
    ['now-nyj-mitchell', 'Adonai Mitchell', '2026–', 'Ran a 4.34 at 6 foot 2, and the drops have followed him everywhere.', 94, 70, 84, 85, 70, 82, 88],
    ['now-nyj-patrick', 'Tim Patrick', '2026–', 'Missed two entire seasons to his legs and turned up in New York at 32.', 82, 88, 84, 74, 90, 68, 92],
    ['now-nyj-wilson', 'Garrett Wilson', '2022–', 'Nine different quarterbacks have thrown him the ball and he is still open every week.', 92, 94, 94, 94, 90, 88, 77],
    ['now-nyj-smith', 'Arian Smith', '2025–', 'Ran a 4.36 at Georgia and dropped a lot of what came his way.', 97, 68, 76, 83, 70, 84, 67],
    ['now-nyj-iwilliams', 'Isaiah Williams', '2025–', 'Played quarterback at Illinois until they moved him, and then he caught 82.', 88, 88, 84, 87, 58, 88, 44],
    ['now-nyj-ocooper', 'Omar Cooper Jr.', '2026–', 'Spent a season at Indiana catching everything Mendoza threw at him.', 88, 86, 82, 79, 80, 80, 73],
  ],
  phi: [
    ['now-phi-wicks', 'Dontayvion Wicks', '2026–', 'Nobody separates like this, and the drops have cost him two jobs already.', 88, 66, 90, 87, 78, 82, 83],
    ['now-phi-dcooper', 'Darius Cooper', '2026–', 'Came out of Tarleton State and made the roster by beating everybody in camp.', 84, 88, 90, 66, 74, 78, 74],
    ['now-phi-smith', 'DeVonta Smith', '2021–', 'The Slim Reaper. Nothing thrown near him has touched the ground in years.', 90, 96, 97, 89, 92, 82, 63],
    ['now-phi-brownx', 'Hollywood Brown', '2026–', 'Signed in Philadelphia to chase the ring he did not get in Kansas City.', 96, 78, 84, 89, 62, 84, 55],
    ['now-phi-lemon', 'Makai Lemon', '2026–', 'Caught everything at USC and he is the smoothest route runner in the room.', 90, 92, 90, 89, 74, 88, 63],
    ['now-phi-moore', 'Elijah Moore', '2026–', 'Fourth franchise before 27 for a man with second round talent.', 90, 84, 88, 87, 74, 88, 61],
  ],
  pit: [
    ['now-pit-metcalf', 'DK Metcalf', '2025–', 'Weighs 235 pounds and ran down a defensive back from behind on television.', 97, 84, 84, 83, 96, 88, 99],
    ['now-pit-pittman', 'Michael Pittman Jr.', '2026–', 'Six foot four, and he arrived to catch the ball on third and seven again.', 82, 92, 88, 81, 94, 76, 96],
    ['now-pit-wilson', 'Roman Wilson', '2024–', 'Third round pick who missed his entire rookie season with an ankle.', 94, 82, 84, 85, 70, 86, 67],
    ['now-pit-skowronek', 'Ben Skowronek', '2024–', 'Blocks like an offensive lineman and catches about eight passes a year.', 82, 80, 74, 70, 70, 70, 90],
    ['now-pit-bernard', 'Germie Bernard', '2026–', 'Blocks like he means it, and Alabama trusted him on every third down.', 88, 86, 84, 81, 78, 84, 77],
    ['now-pit-wetjen', 'Kaden Wetjen', '2026–', 'Returned kicks at Iowa, and that is exactly what he does here.', 92, 78, 74, 79, 58, 88, 52],
  ],
  sf: [
    ['now-sf-evans', 'Mike Evans', '2026–', 'Eleven straight thousand yard seasons, and he moved for the first time at 33.', 84, 92, 92, 83, 97, 78, 99],
    ['now-sf-robinson', 'Demarcus Robinson', '2025–', 'Ten seasons in the league and he still wins one jump ball a week.', 86, 82, 82, 76, 88, 74, 86],
    ['now-sf-samuel', 'Deebo Samuel', '2019–', 'A receiver who ran for eight touchdowns in a season, which nobody does.', 90, 84, 82, 81, 80, 99, 94],
    ['now-sf-watkins', 'Jordan Watkins', '2025–', 'Caught five touchdowns in one game at Ole Miss and nobody believed it.', 88, 86, 84, 81, 70, 86, 59],
    ['now-sf-stribling', 'De\'Zhaun Stribling', '2026–', 'Six foot two, and Ole Miss threw it up to him whenever the down was long.', 84, 84, 80, 74, 88, 74, 90],
    ['now-sf-cowing', 'Jacob Cowing', '2024–', 'Weighs 168 pounds and is the quickest man in the building over ten yards.', 96, 80, 80, 83, 60, 88, 52],
  ],
  sea: [
    ['now-sea-smithnjigba', 'Jaxon Smith-Njigba', '2022–', 'Broke the Big Ten record in one game and now leads the league in yards.', 90, 96, 96, 94, 88, 92, 77],
    ['now-sea-foster', 'Montorie Foster Jr.', '2025–', 'Went undrafted out of Missouri and has caught a handful of meaningful passes.', 88, 82, 80, 76, 70, 80, 69],
    ['now-sea-shaheed', 'Rashid Shaheed', '2026–', 'Arrived in Seattle at 27 as the fastest man on a roster full of them.', 97, 84, 82, 87, 74, 94, 67],
    ['now-sea-horton', 'Tory Horton', '2025–', 'Fifth round rookie who returned two punts for touchdowns before October.', 94, 84, 84, 83, 74, 90, 75],
    ['now-sea-kupp', 'Cooper Kupp', '2025–', 'Came home to the northwest at 32 with the routes still perfectly intact.', 78, 96, 96, 87, 86, 84, 86],
  ],
  tb: [
    ['now-tb-mcmillan', 'Jalen McMillan', '2024–', 'Third round pick who scored five touchdowns in three December games.', 90, 86, 84, 81, 82, 82, 79],
    ['now-tb-hurst', 'Ted Hurst III', '2026–', 'Georgia State receiver who caught everything while nobody was watching.', 92, 84, 82, 81, 82, 82, 79],
    ['now-tb-egbuka', 'Emeka Egbuka', '2025–', 'Rookie who caught touchdowns in his first three games and never looked new.', 90, 90, 90, 85, 84, 88, 81],
    ['now-tb-tjohnson', 'Tez Johnson', '2025–', 'He weighs about 155 pounds and Bo Nix threw it to him anyway.', 94, 84, 88, 89, 52, 88, 38],
    ['now-tb-godwin', 'Chris Godwin', '2017–', 'Catches everything over the middle and has rebuilt two different legs.', 84, 94, 94, 87, 88, 90, 86],
    ['now-tb-kjohnson', 'Kameron Johnson', '2025–', 'Came out of Barton College, which nobody has heard of, and he returns kicks.', 94, 76, 72, 81, 58, 88, 55],
  ],
  ten: [
    ['now-ten-ridley', 'Calvin Ridley', '2024–', 'Sat out a whole season for betting on his own team and came back good.', 90, 86, 94, 91, 84, 80, 79],
    ['now-ten-ayomanor', 'Elic Ayomanor', '2025–', 'Fourth round rookie who put up 294 yards against Travis Hunter in college.', 88, 86, 84, 79, 92, 84, 92],
    ['now-ten-tate', 'Carnell Tate', '2026–', 'Ohio State receivers go in the first round now, and he is the latest of them.', 90, 90, 90, 87, 86, 80, 83],
    ['now-ten-robinson', 'Wan\'Dale Robinson', '2026–', 'Five foot eight, and everything he catches happens within nine yards.', 88, 92, 88, 85, 78, 84, 52],
    ['now-ten-dike', 'Chimere Dike', '2025–', 'Runs a genuine 4.34 and has to prove he can do more than return kicks.', 96, 80, 80, 83, 68, 88, 67],
  ],
  was: [
    ['now-was-mclaurin', 'Terry McLaurin', '2019–', 'Scary Terry got open for six years before anybody could throw it to him.', 92, 90, 94, 91, 90, 82, 77],
    ['now-was-brown', 'Dyami Brown', '2026–', 'Had three enormous playoff games once and has been chasing them since.', 94, 82, 84, 85, 80, 82, 75],
    ['now-was-burks', 'Treylon Burks', '2026–', 'Went 18th overall out of Arkansas and has spent four years hurt.', 84, 80, 74, 72, 90, 84, 94],
    ['now-was-awilliams', 'Antonio Williams', '2025–', 'Clemson slot receiver who has quietly become somebody Daniels looks for.', 88, 86, 84, 83, 70, 82, 63],
    ['now-was-diggs', 'Stefon Diggs', '2026–', 'Fourth franchise, and every one of them has been better with him in it.', 88, 94, 97, 94, 86, 86, 77],
    ['now-was-mccaffrey', 'Luke McCaffrey', '2024–', 'Was a quarterback at Nebraska, and the last name comes up every single week.', 88, 84, 84, 81, 72, 84, 71],
    ['now-was-lane', 'Jaylin Lane', '2025–', 'Fourth round rookie who ran a 4.34 and returns punts.', 96, 80, 78, 81, 62, 88, 59],
  ],
};

export const WR_CURRENT: Player[] = Object.entries(POOLS).flatMap(([teamId, rows]) =>
  rows.map(([id, name, years, blurb, speed, hands, routeRunning, release, contestedCatch, yac, size]) => ({
    id,
    name,
    teamId,
    position: 'WR' as const,
    years,
    blurb,
    attributes: { speed, hands, routeRunning, release, contestedCatch, yac, size },
  })),
);
