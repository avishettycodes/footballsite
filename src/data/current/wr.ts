import type { Player } from '../types';

/**
 * RECEIVER ROOMS AS THEY STAND NOW. Rules are in ./qb.ts and they apply here.
 *
 * Receiver is the one position where a real roster genuinely carries six of them, so this
 * is the file that needed the least reaching back. Almost every card here is a man on the
 * roster right now.
 *
 * THE SCALE IS TODAY'S LEAGUE. Justin Jefferson runs routes at 99 in both files, because
 * he would have in any era. Everybody underneath him moves: a 90 here means one of the
 * thirty best at it playing this season, which is not the same 90 the all-time file hands
 * out. Size is judged the same way it always is, off how big he plays rather than how big
 * the programme lists him.
 *
 * Row format:
 *   [id, name, years, blurb, SPD, HND, RTE, RLS, CTC, YAC, SZE]
 */
type Row = [string, string, string, string, number, number, number, number, number, number, number];

const POOLS: Record<string, Row[]> = {
  ari: [
    ['now-ari-harrison', 'Marvin Harrison Jr.', '2024–', 'His father is in the Hall of Fame and the comparison started on day one.', 90, 88, 92, 86, 94, 76, 92],
    ['now-ari-wilson', 'Michael Wilson', '2023–', 'Third round pick who blocks like a tight end and catches everything short.', 84, 90, 84, 78, 86, 78, 86],
    ['now-ari-fehoko', 'Simi Fehoko', '2024–', 'Six foot four, runs a 4.4, and has fifteen career catches.', 94, 72, 70, 74, 76, 76, 94],
    ['now-ari-duvernay', 'Devin Duvernay', '2024–', 'Made two Pro Bowls as a returner and cannot get on the field otherwise.', 94, 78, 74, 78, 68, 88, 70],
    ['now-ari-weaver', 'Xavier Weaver', '2024–2025', 'Undrafted out of Colorado and has spent two years on the practice squad.', 92, 78, 76, 74, 70, 80, 68],
    ['now-ari-jones', 'Zay Jones', '2025–2025', 'Caught 88 passes in a season once and has been a fourth option since.', 80, 88, 86, 76, 80, 72, 82],
  ],
  atl: [
    ['now-atl-london', 'Drake London', '2022–', 'Six foot four, and he simply takes the ball off people in the air.', 84, 92, 90, 84, 97, 80, 97],
    ['now-atl-dotson', 'Jahan Dotson', '2026–', 'Sixteenth overall pick who is on his third franchise at 26.', 90, 82, 86, 82, 76, 80, 70],
    ['now-atl-zaccheaus', 'Olamide Zaccheaus', '2025–', 'Seven seasons in the league for a man nobody wanted out of Virginia.', 90, 84, 84, 82, 74, 84, 58],
    ['now-atl-blair', 'Chris Blair', '2026–', 'Alcorn State receiver who has spent three years one injury from playing.', 90, 82, 78, 76, 84, 76, 84],
    ['now-atl-agnew', 'Jamal Agnew', '2024–2025', 'Has returned five kicks for touchdowns and lines up wide on Sundays.', 95, 78, 74, 82, 60, 92, 56],
    ['now-atl-mccloud', 'Ray-Ray McCloud', '2024–2025', 'On his fifth franchise and has returned kicks for all of them.', 92, 84, 82, 84, 66, 88, 58],
  ],
  bal: [
    ['now-bal-bateman', 'Rashod Bateman', '2021–', 'First round pick who took four seasons to have one good one.', 88, 84, 88, 80, 86, 74, 84],
    ['now-bal-walker', 'Devontez Walker', '2024–', 'Runs a 4.36 and has been active for about nine games in two years.', 95, 74, 74, 76, 72, 76, 84],
    ['now-bal-flowers', 'Zay Flowers', '2023–', 'Five foot nine of pure trouble in space, and he never stops moving.', 94, 86, 90, 92, 78, 94, 58],
    ['now-bal-sarratt', 'Elijah Sarratt', '2026–', 'Went from Saint Francis to Indiana to a starting job in about three years.', 86, 88, 86, 80, 86, 80, 84],
    ['now-bal-hopkins', 'DeAndre Hopkins', '2025–2025', 'Made a one handed catch in a playoff game that people still talk about.', 78, 96, 94, 82, 96, 70, 90],
    ['now-bal-wallace', 'Tylan Wallace', '2021–2025', 'Won a game with a punt return in overtime and does nothing else.', 88, 78, 76, 74, 82, 82, 76],
  ],
  buf: [
    ['now-buf-coleman', 'Keon Coleman', '2024–', 'Six foot four, and he came to his own press conference in a fur coat.', 84, 82, 78, 76, 94, 80, 94],
    ['now-buf-palmer', 'Josh Palmer', '2025–', 'Signed for real money to be the deep threat nobody else wanted.', 90, 82, 84, 80, 86, 72, 86],
    ['now-buf-moorex', 'DJ Moore', '2026–', 'Signed to be the man everybody has to account for on third down.', 90, 92, 92, 88, 88, 92, 84],
    ['now-buf-shakir', 'Khalil Shakir', '2022–', 'Led the entire league in yards after the catch per reception.', 88, 94, 90, 84, 82, 97, 68],
    ['now-buf-dortch', 'Greg Dortch', '2026–', 'Five foot seven, and he has made a career out of being available.', 92, 86, 84, 82, 70, 88, 54],
    ['now-buf-moore', 'Elijah Moore', '2025', 'Second round talent who has been traded twice for very little.', 90, 84, 88, 86, 68, 88, 60],
  ],
  car: [
    ['now-car-mcmillan', 'Tetairoa McMillan', '2025–', 'Six foot four out of Arizona, taken eighth overall to fix all of this.', 84, 92, 90, 80, 96, 78, 94],
    ['now-car-legette', 'Xavier Legette', '2024–', 'Ran a 4.39 at 221 pounds and drops it when he is wide open.', 94, 70, 78, 80, 82, 88, 92],
    ['now-car-metchie', 'John Metchie III', '2026–', 'Beat leukaemia at 22 and has spent four years trying to get a real chance.', 90, 84, 86, 82, 76, 82, 76],
    ['now-car-coker', 'Jalen Coker', '2024–', 'Undrafted out of Holy Cross and started by November of his rookie year.', 86, 88, 82, 76, 88, 78, 86],
    ['now-car-thielen', 'Adam Thielen', '2023–2025', 'Went undrafted, paid to attend a tryout, and made two Pro Bowls.', 76, 94, 96, 82, 84, 72, 80],
    ['now-car-renfrow', 'Hunter Renfrow', '2025–2025', 'Was out of football for a year, and nobody has ever run a better option route.', 74, 92, 94, 88, 62, 76, 58],
  ],
  chi: [
    ['now-chi-odunze', 'Rome Odunze', '2024–', 'Ninth overall pick who wins everything thrown above his head.', 88, 88, 88, 82, 94, 78, 90],
    ['now-chi-burden', 'Luther Burden III', '2025–', 'Was the best player in the Big 12 as a sophomore and slid to the second round.', 92, 86, 84, 86, 84, 94, 78],
    ['now-chi-raymond', 'Kalif Raymond', '2026–', 'Five foot eight and he hits linebackers on running plays for a living.', 92, 84, 82, 80, 70, 88, 54],
    ['now-chi-jwalker', 'Jahdae Walker', '2026–', 'Six foot three out of Texas A&M, and he talked his way onto the roster.', 90, 84, 80, 80, 88, 80, 88],
    ['now-chi-duvernay', 'Devin Duvernay', '2024–2025', 'Two seasons in Chicago returning kicks and almost never lining up wide.', 94, 78, 74, 78, 68, 88, 70],
    ['now-chi-moore', 'DJ Moore', '2023–2025', 'Has caught 80 passes a year for five quarterbacks who could not throw.', 90, 92, 92, 88, 88, 92, 84],
  ],
  cin: [
    ['now-cin-chase', 'Ja\'Marr Chase', '2021–', 'Won the triple crown, and he has never once lost to a cornerback he knows.', 94, 97, 97, 97, 96, 96, 84],
    ['now-cin-higgins', 'Tee Higgins', '2020–', 'Would be the best man on almost any other roster in the league.', 86, 92, 90, 82, 97, 78, 94],
    ['now-cin-iosivas', 'Andrei Iosivas', '2023–', 'Was a decathlete at Princeton and scored nine touchdowns anyway.', 90, 82, 80, 76, 90, 74, 90],
    ['now-cin-kwilliams', 'Ke\'Shawn Williams', '2026–', 'Five foot nine, and he was the best player in Indiana for about a month.', 92, 84, 84, 84, 68, 88, 60],
    ['now-cin-burton', 'Jermaine Burton', '2024–2025', 'Enormous talent, and every team that has had him has grown tired of him.', 92, 78, 82, 82, 84, 78, 78],
    ['now-cin-boyd', 'Tyler Boyd', '2016–2023', 'Eight years of moving the chains on third down without any fuss at all.', 80, 92, 90, 78, 80, 82, 82],
  ],
  cle: [
    ['now-cle-boston', 'Denzel Boston', '2026–', 'Six foot four, and Cleveland finally has somebody worth throwing it up to.', 88, 86, 84, 80, 92, 76, 90],
    ['now-cle-corley', 'Malachi Corley', '2026–', 'Western Kentucky made him look unstoppable and the league has not agreed.', 90, 80, 78, 80, 74, 92, 74],
    ['now-cle-jeudy', 'Jerry Jeudy', '2024–', 'Runs the prettiest routes in football and catches about seven in ten.', 90, 80, 96, 92, 78, 84, 74],
    ['now-cle-wallace', 'Tylan Wallace', '2026–', 'Cleveland signed him for the special teams and he keeps making the roster.', 88, 78, 76, 74, 82, 82, 76],
    ['now-cle-bond', 'Isaiah Bond', '2025–', 'Ran a 4.39 and arrived with more off field noise than catches.', 96, 74, 78, 82, 70, 86, 62],
    ['now-cle-cooper', 'Amari Cooper', '2022–2024', 'The smoothest release in the league, and he disappears for whole months.', 88, 88, 96, 96, 86, 78, 84],
  ],
  dal: [
    ['now-dal-pickens', 'George Pickens', '2025–', 'Makes a catch every week that nobody else in the sport could make.', 90, 84, 86, 82, 99, 80, 90],
    ['now-dal-lamb', 'CeeDee Lamb', '2020–', 'Caught 135 passes in a season and does whatever he likes after the catch.', 90, 94, 94, 90, 92, 94, 84],
    ['now-dal-flournoy', 'Ryan Flournoy', '2024–', 'Sixth round pick from Southeast Missouri State with two career catches.', 90, 78, 76, 76, 80, 78, 84],
    ['now-dal-turpin', 'KaVontae Turpin', '2022–', 'Was the MVP of a spring league and is the fastest man on this roster.', 97, 74, 72, 80, 66, 94, 54],
    ['now-dal-gallup', 'Michael Gallup', '2018–2023', 'Went for 1,100 yards and then tore a knee that took the rest of it.', 86, 84, 88, 78, 88, 72, 84],
    ['now-dal-tolbert', 'Jalen Tolbert', '2022–2025', 'Third round pick who took three seasons to catch 50 passes.', 88, 82, 84, 78, 82, 76, 82],
  ],
  den: [
    ['now-den-sutton', 'Courtland Sutton', '2018–', 'Goes up on the sideline against two men and comes down with it anyway.', 84, 86, 86, 78, 96, 74, 94],
    ['now-den-waddle', 'Jaylen Waddle', '2026–', 'Cost a great deal to bring in and runs a 4.37 at 28 years old.', 97, 90, 90, 90, 76, 94, 58],
    ['now-den-mims', 'Marvin Mims Jr.', '2023–', 'Went to two Pro Bowls for returning kicks and hardly plays on offense.', 97, 84, 82, 84, 70, 92, 62],
    ['now-den-bryant', 'Pat Bryant', '2025–', 'Third round pick who blocks in the run game better than he separates.', 82, 84, 82, 72, 84, 72, 90],
    ['now-den-franklin', 'Troy Franklin', '2024–', 'Caught passes from Bo Nix in college and does it again now.', 94, 80, 84, 84, 68, 84, 70],
    ['now-den-patrick', 'Tim Patrick', '2018–2023', 'Undrafted, then 700 yards a season, then two straight years of injuries.', 84, 86, 84, 76, 90, 70, 90],
  ],
  det: [
    ['now-det-williams', 'Jameson Williams', '2022–', 'Twelfth overall pick with 4.3 speed who took three years to be trusted.', 97, 80, 84, 86, 76, 92, 72],
    ['now-det-brown', 'Amon-Ra St. Brown', '2021–', 'Fourth round pick who catches 115 passes a year out of the slot.', 86, 97, 96, 90, 88, 90, 74],
    ['now-det-teslaa', 'Isaac TeSlaa', '2025–', 'Third round pick out of Arkansas who was a walk on at Hillsdale first.', 90, 82, 78, 76, 86, 78, 88],
    ['now-det-tmartin', 'Tay Martin', '2026–', 'Oklahoma State receiver who has been on five practice squads in four years.', 90, 84, 84, 80, 84, 80, 82],
    ['now-det-jreynolds', 'Josh Reynolds', '2021–2023', 'Six foot three, and he caught a touchdown in every big game they won.', 84, 82, 84, 76, 88, 70, 90],
    ['now-det-raymond', 'Kalif Raymond', '2021–2025', 'Throws himself at linebackers twice his size on every running play.', 92, 84, 82, 80, 70, 88, 54],
  ],
  gb: [
    ['now-gb-watson', 'Christian Watson', '2022–', 'Runs a 4.36 at six foot four, which is a physics problem for a cornerback.', 96, 78, 82, 82, 84, 88, 94],
    ['now-gb-golden', 'Matthew Golden', '2025–', 'Ran a 4.29 at the combine and went 23rd overall for it.', 97, 86, 86, 88, 80, 88, 72],
    ['now-gb-reed', 'Jayden Reed', '2023–', 'Second round pick who leads the team in yards after the catch every year.', 92, 86, 88, 86, 82, 94, 68],
    ['now-gb-moore', 'Skyy Moore', '2026–', 'Went to Green Bay for a late pick and gets to start over at 26.', 90, 76, 80, 80, 70, 82, 66],
    ['now-gb-wicks', 'Dontayvion Wicks', '2023–2025', 'Gets open more than anybody on the roster and cannot catch it.', 88, 66, 90, 86, 78, 82, 82],
    ['now-gb-doubs', 'Romeo Doubs', '2022–2025', 'Fourth round pick who catches touchdowns and drops third downs.', 88, 80, 86, 80, 88, 76, 84],
  ],
  hou: [
    ['now-hou-collins', 'Nico Collins', '2021–', 'Six foot four, and he became the best receiver in the conference quietly.', 90, 94, 92, 84, 96, 88, 94],
    ['now-hou-boutte', 'Kayshon Boutte', '2026–', 'Was a five star recruit at 17 and is finally somebody starter at 24.', 88, 84, 82, 78, 84, 78, 80],
    ['now-hou-noel', 'Jaylin Noel', '2025–', 'Third round slot receiver who was the other half of that Iowa State pair.', 94, 88, 88, 88, 70, 90, 62],
    ['now-hou-hutchinson', 'Xavier Hutchinson', '2026–', 'Holds records at Iowa State and plays about fifteen snaps a game.', 84, 86, 82, 74, 86, 72, 88],
    ['now-hou-dell', 'Tank Dell', '2023–2025', 'Was the most exciting man in Texas until his leg gave way in December.', 96, 86, 90, 90, 68, 92, 52],
    ['now-hou-higgins', 'Jayden Higgins', '2025–2025', 'Second round pick from Iowa State who is six foot four and runs a 4.47.', 90, 88, 84, 78, 86, 76, 92],
  ],
  ind: [
    ['now-ind-pierce', 'Alec Pierce', '2022–', 'Averaged 22 yards a grab one season and does nothing at all underneath.', 94, 76, 78, 78, 92, 70, 92],
    ['now-ind-allen', 'Keenan Allen', '2026–', 'Thirty four years old and still nobody can cover him inside ten yards.', 76, 96, 97, 92, 86, 78, 82],
    ['now-ind-downs', 'Josh Downs', '2023–', 'Nobody in the league wins on third and six from the slot more often.', 90, 92, 92, 90, 74, 88, 58],
    ['now-ind-gould', 'Anthony Gould', '2024–', 'Weighs 175 pounds and is out there to make people miss in space.', 95, 78, 76, 78, 66, 88, 54],
    ['now-ind-westbrookikhine', 'Nick Westbrook-Ikhine', '2025–', 'Caught nine touchdowns in a season and nobody outside the building noticed.', 88, 82, 82, 76, 88, 72, 90],
    ['now-ind-mitchell', 'AD Mitchell', '2024–2025', 'Second round pick with 4.34 speed and hands made of stone.', 96, 68, 80, 84, 74, 82, 84],
  ],
  jax: [
    ['now-jax-thomas', 'Brian Thomas Jr.', '2024–', 'Went for 1,282 yards as a rookie while the rest of the offense fell apart.', 96, 88, 88, 86, 88, 90, 90],
    ['now-jax-meyers', 'Jakobi Meyers', '2026–', 'Went undrafted, and he has now been the reliable one for three franchises.', 84, 94, 92, 86, 84, 80, 82],
    ['now-jax-washington', 'Parker Washington', '2023–', 'Took a punt 96 yards on a Sunday and has done very little since.', 88, 84, 82, 80, 70, 90, 66],
    ['now-jax-hunter', 'Travis Hunter', '2025–', 'Plays cornerback and receiver in the same game, which nobody has done in decades.', 94, 92, 90, 88, 92, 88, 72],
    ['now-jax-kirk', 'Christian Kirk', '2022–2024', 'Was paid like the best in the league and played like the fortieth.', 88, 86, 88, 84, 74, 84, 68],
    ['now-jax-brown', 'Dyami Brown', '2025', 'Had three enormous playoff games and then signed somewhere quieter.', 94, 82, 84, 84, 80, 82, 74],
  ],
  kc: [
    ['now-kc-thornton', 'Tyquan Thornton', '2026–', 'Ran a 4.28 at the combine and took four years to catch anything with it.', 97, 74, 78, 82, 70, 84, 78],
    ['now-kc-worthy', 'Xavier Worthy', '2024–', 'Ran the fastest forty anybody has ever run at the combine.', 99, 82, 84, 88, 72, 94, 56],
    ['now-kc-rice', 'Rashee Rice', '2023–', 'Averaged 100 yards a game before the suspension and the knee.', 90, 90, 88, 84, 86, 97, 84],
    ['now-kc-callen', 'Cyrus Allen', '2026–', 'Ran a 4.35 at Texas A&M and is trying to outrun four other rookies.', 94, 78, 78, 82, 76, 84, 74],
    ['now-kc-smithschuster', 'JuJu Smith-Schuster', '2022–2025', 'Was a 1,400 yard receiver at 22 and a fourth option by 26.', 80, 90, 84, 76, 84, 84, 84],
    ['now-kc-brown', 'Hollywood Brown', '2024–2025', 'Went in the first round at five foot nine, and the deep shot is the whole card.', 96, 78, 84, 88, 68, 84, 54],
  ],
  lv: [
    ['now-lv-tucker', 'Tre Tucker', '2023–', 'Ran a 4.32 and scored three touchdowns in one afternoon last season.', 97, 80, 80, 84, 70, 90, 56],
    ['now-lv-nailor', 'Jalen Nailor', '2026–', 'Signed for real money to be the man who takes the top off a defense.', 95, 80, 80, 82, 64, 86, 66],
    ['now-lv-bech', 'Jack Bech', '2025–', 'Caught the winning touchdown in the Senior Bowl days after losing his brother.', 84, 90, 84, 76, 88, 78, 86],
    ['now-lv-benson', 'Malik Benson', '2026–', 'Junior college to Alabama to Florida State, and the speed never changed.', 95, 76, 78, 82, 78, 84, 76],
    ['now-lv-lockett', 'Tyler Lockett', '2025–2025', 'A decade of enormous catches in Seattle, and the burst has finally gone.', 86, 94, 94, 86, 76, 82, 62],
    ['now-lv-adams', 'Davante Adams', '2014–2021', 'The best release in football, and he got open whenever he decided to.', 90, 94, 97, 99, 92, 84, 82],
  ],
  lac: [
    ['now-lac-johnston', 'Quentin Johnston', '2023–', 'First round pick who dropped everything for two years and then stopped.', 88, 78, 80, 76, 86, 82, 92],
    ['now-lac-harris', 'Tre Harris', '2025–', 'Second round pick who averaged 20 yards a catch at Ole Miss.', 90, 84, 84, 78, 90, 78, 88],
    ['now-lac-mcconkey', 'Ladd McConkey', '2024–', 'Second round rookie who ran routes like a ten year veteran immediately.', 90, 94, 96, 92, 80, 92, 62],
    ['now-lac-davis', 'Derius Davis', '2023–', 'Might be the fastest man on the roster and touches it four times a month.', 97, 78, 74, 80, 66, 92, 52],
    ['now-lac-williams', 'Mike Williams', '2017–2023', 'Six foot four, and the sideline jump ball was the entire offense some weeks.', 84, 82, 78, 76, 97, 72, 96],
    ['now-lac-allen', 'Keenan Allen', '2013–2023', 'Never ran a 4.4 in his life and got open on everybody for a decade.', 76, 96, 97, 92, 86, 78, 82],
  ],
  lar: [
    ['now-lar-adams', 'Davante Adams', '2025–', 'Thirty two years old and still the best release anybody has seen.', 86, 94, 97, 97, 92, 80, 82],
    ['now-lar-mumpfield', 'Konata Mumpfield', '2025–', 'Fifth round rookie out of Pittsburgh with the surest hands on the roster.', 86, 90, 86, 78, 80, 78, 74],
    ['now-lar-nacua', 'Puka Nacua', '2023–', 'Broke the rookie receiving record as an afterthought on day three.', 88, 97, 94, 86, 94, 97, 88],
    ['now-lar-atwell', 'Tutu Atwell', '2021–', 'Weighs 165 pounds and they spent a second round pick on him anyway.', 97, 76, 78, 82, 56, 86, 48],
    ['now-lar-whittington', 'Jordan Whittington', '2024–', 'Blocks like an extra lineman and catches enough to stay on the field.', 80, 86, 82, 74, 88, 78, 86],
    ['now-lar-kupp', 'Cooper Kupp', '2017–2024', 'Caught 145 balls the year they won it all and was the best man on the field.', 80, 97, 97, 88, 88, 90, 84],
  ],
  mia: [
    ['now-mia-bell', 'Chris Bell', '2026–', 'Louisville rookie who weighs 220 pounds and plays a good deal bigger than that.', 86, 86, 82, 78, 90, 78, 88],
    ['now-mia-washington', 'Malik Washington', '2024–', 'Led all of college football in receptions and went on day three anyway.', 88, 88, 86, 82, 76, 88, 58],
    ['now-mia-tolbert', 'Jalen Tolbert', '2026–', 'Five seasons in and he has never once pinned a starting job down.', 88, 82, 84, 78, 82, 76, 82],
    ['now-mia-cdouglas', 'Caleb Douglas', '2026–', 'Texas Tech receiver taken on day three to run down the sideline.', 92, 82, 80, 78, 86, 78, 86],
    ['now-mia-hill', 'Tyreek Hill', '2022–2025', 'The Cheetah. Ran a 4.29 at 28 years old and nobody ever caught him.', 99, 90, 92, 94, 66, 97, 54],
    ['now-mia-waddle', 'Jaylen Waddle', '2021–2025', 'Sixth overall pick who is somehow the second fastest man on his own team.', 97, 90, 90, 90, 76, 94, 58],
  ],
  min: [
    ['now-min-jefferson', 'Justin Jefferson', '2020–', 'No cornerback alive has an answer, and every one of them has tried.', 94, 99, 99, 94, 96, 92, 86],
    ['now-min-addison', 'Jordan Addison', '2023–', 'Runs the cleanest deep route in the league and weighs about 170 pounds.', 94, 86, 92, 88, 80, 84, 62],
    ['now-min-jennings', 'Jauan Jennings', '2026–', 'Blocks like a lineman and catches everything on a team that needed both.', 82, 92, 88, 78, 94, 82, 88],
    ['now-min-felton', 'Tai Felton', '2025–', 'Was Maryland\'s leading receiver and has been thrown to twice so far.', 92, 84, 84, 80, 76, 84, 70],
    ['now-min-thielen', 'Adam Thielen', '2014–2022', 'Paid to attend his own tryout and left as the best route runner in the building.', 76, 94, 96, 84, 86, 74, 80],
    ['now-min-nailor', 'Jalen Nailor', '2022–2025', 'Turns up once a month with a 60 yard touchdown and then disappears.', 95, 80, 80, 82, 64, 86, 66],
  ],
  ne: [
    ['now-ne-brown', 'A.J. Brown', '2026–', 'Two hundred and twenty six pounds arriving to make a young passer look right.', 90, 92, 92, 88, 96, 94, 97],
    ['now-ne-williams', 'Kyle Williams', '2025–', 'Third round rookie out of Washington State with a lot to prove.', 92, 84, 84, 82, 76, 86, 68],
    ['now-ne-doubs', 'Romeo Doubs', '2026–', 'Signed to be the second option and has always been better than that word.', 88, 80, 86, 80, 88, 76, 84],
    ['now-ne-douglas', 'DeMario Douglas', '2023–', 'Was the only man in New England getting open for two entire seasons.', 92, 88, 90, 88, 72, 90, 54],
    ['now-ne-diggs', 'Stefon Diggs', '2025', 'Has 1,000 yard seasons for three franchises and has left all of them angry.', 88, 94, 97, 92, 86, 86, 76],
    ['now-ne-boutte', 'Kayshon Boutte', '2023–2025', 'Was a five star recruit and went in the sixth round for good reasons.', 88, 84, 82, 78, 84, 78, 80],
  ],
  no: [
    ['now-no-lance', 'Bryce Lance', '2026–', 'His brother went third overall, and he went in the fourth to a better situation.', 88, 86, 84, 80, 84, 78, 84],
    ['now-no-olave', 'Chris Olave', '2022–', 'Runs a perfect route every time and has had four concussions doing it.', 92, 90, 96, 90, 82, 82, 74],
    ['now-no-vele', 'Devaughn Vele', '2025–', 'Six foot five and traded here for a pair of picks in the summer.', 82, 88, 82, 72, 86, 70, 96],
    ['now-no-palmer', 'Trey Palmer', '2023–', 'Sixth round pick with 4.33 speed who has not held a job down yet.', 96, 76, 78, 82, 68, 84, 66],
    ['now-no-tillman', 'Cedric Tillman', '2023–', 'Six foot three, and he had one three week stretch where he was unstoppable.', 84, 84, 82, 76, 86, 76, 92],
    ['now-no-thomas', 'Michael Thomas', '2016–2023', 'Set the single season reception record and then his ankle ended everything.', 80, 97, 96, 82, 90, 78, 88],
  ],
  nyg: [
    ['now-nyg-nabers', 'Malik Nabers', '2024–', 'Put up a rookie year nobody expected while the quarterback room burned down.', 94, 90, 94, 92, 88, 92, 76],
    ['now-nyg-obj', 'Odell Beckham Jr.', '2026–', 'Made the catch everybody has seen a thousand times, and that was twelve years ago.', 84, 88, 88, 84, 84, 78, 70],
    ['now-nyg-mooney', 'Darnell Mooney', '2026–', 'Third franchise in three years for a man who can genuinely run past anybody.', 96, 76, 86, 88, 74, 84, 62],
    ['now-nyg-hyatt', 'Jalin Hyatt', '2023–', 'Won the Biletnikoff, ran a 4.4, and has 30 career catches.', 96, 76, 80, 82, 74, 82, 70],
    ['now-nyg-jones', 'Charlie Jones', '2023–', 'Fourth round pick who returns punts and plays about ten snaps.', 90, 84, 84, 80, 64, 88, 62],
    ['now-nyg-slayton', 'Darius Slayton', '2019–2025', 'Four times the leading receiver here, and nobody outside New Jersey knows him.', 94, 82, 84, 80, 84, 78, 80],
  ],
  nyj: [
    ['now-nyj-wilson', 'Garrett Wilson', '2022–', 'Nine different men have thrown him the ball and he is still open every week.', 92, 94, 94, 92, 90, 88, 76],
    ['now-nyj-mitchell', 'AD Mitchell', '2026–', 'Ran a 4.34 and arrived somewhere they will throw it to him.', 96, 68, 80, 84, 74, 82, 84],
    ['now-nyj-smith', 'Arian Smith', '2025–', 'Ran a 4.36 at Georgia and dropped a lot of what came his way.', 97, 68, 76, 82, 70, 84, 66],
    ['now-nyj-patrick', 'Tim Patrick', '2026–', 'Missed two entire seasons to his legs and turned up in New York at 32.', 82, 88, 84, 74, 90, 68, 90],
    ['now-nyj-corley', 'Malachi Corley', '2024–2025', 'They called him the YAC king in college and he has not played much since.', 90, 80, 78, 80, 74, 92, 74],
    ['now-nyj-reynolds', 'Josh Reynolds', '2025–2025', 'Nine seasons in and nobody runs a prettier comeback route on third down.', 84, 84, 88, 78, 86, 72, 86],
  ],
  phi: [
    ['now-phi-wicks', 'Dontayvion Wicks', '2026–', 'Nobody separates like this, and the drops have cost him two jobs already.', 88, 66, 90, 86, 78, 82, 82],
    ['now-phi-smith', 'DeVonta Smith', '2021–', 'The Slim Reaper. Nothing thrown near him has touched the ground in years.', 90, 96, 97, 88, 88, 82, 62],
    ['now-phi-brownx', 'Hollywood Brown', '2026–', 'Signed in Philadelphia to chase the ring he did not get in Kansas City.', 96, 78, 84, 88, 68, 84, 54],
    ['now-phi-moore', 'Elijah Moore', '2026–', 'Fourth franchise before 27 for a man with second round talent.', 90, 84, 88, 86, 68, 88, 60],
    ['now-phi-brown', 'A.J. Brown', '2022–2025', 'Two hundred and twenty six pounds, and cornerbacks bounce off him.', 90, 92, 92, 88, 96, 94, 97],
    ['now-phi-dotson', 'Jahan Dotson', '2024–2025', 'First round pick who was traded for very little and plays 20 snaps.', 90, 82, 86, 82, 76, 80, 70],
  ],
  pit: [
    ['now-pit-metcalf', 'DK Metcalf', '2025–', 'Weighs 235 pounds and ran down a defensive back from behind on television.', 97, 84, 84, 82, 96, 88, 97],
    ['now-pit-pittman', 'Michael Pittman Jr.', '2026–', 'Six foot four, and he arrived to catch the ball on third and seven again.', 82, 92, 88, 80, 94, 76, 94],
    ['now-pit-wilson', 'Roman Wilson', '2024–', 'Third round pick who missed his entire rookie season with an ankle.', 94, 82, 84, 84, 70, 86, 66],
    ['now-pit-skowronek', 'Ben Skowronek', '2024–', 'Blocks like an offensive lineman and catches about eight passes a year.', 82, 80, 74, 70, 78, 70, 88],
    ['now-pit-austin', 'Calvin Austin III', '2022–2025', 'Ran a 4.32 and then spent two seasons hurt before anybody saw it.', 96, 82, 82, 84, 70, 88, 52],
    ['now-pit-johnson', 'Diontae Johnson', '2019–2023', 'Got open more than anybody in football and led the league in drops.', 90, 66, 96, 94, 70, 82, 66],
  ],
  sf: [
    ['now-sf-evans', 'Mike Evans', '2026–', 'Eleven straight thousand yard seasons, and he moved for the first time at 33.', 84, 92, 92, 82, 97, 78, 97],
    ['now-sf-robinson', 'Demarcus Robinson', '2025–', 'Ten seasons in the league and he still wins one jump ball a week.', 86, 82, 82, 76, 88, 74, 84],
    ['now-sf-samuel', 'Deebo Samuel', '2019–', 'A receiver who ran for eight touchdowns in a season, which nobody does.', 90, 84, 82, 80, 88, 99, 92],
    ['now-sf-cowing', 'Jacob Cowing', '2024–', 'Weighs 168 pounds and is the quickest man in the building over ten yards.', 96, 80, 80, 82, 68, 88, 52],
    ['now-sf-hodge', 'KhaDarel Hodge', '2023–', 'Special teams captain who caught 30 passes in a season by accident.', 88, 82, 76, 76, 78, 74, 84],
    ['now-sf-pearsall', 'Ricky Pearsall', '2024–2025', 'Was shot in the chest in August and played that same season.', 92, 88, 90, 86, 82, 84, 76],
  ],
  sea: [
    ['now-sea-smithnjigba', 'Jaxon Smith-Njigba', '2022–', 'Broke the Big Ten record in one game and now leads the league in yards.', 90, 96, 96, 92, 88, 92, 76],
    ['now-sea-shaheed', 'Rashid Shaheed', '2026–', 'Arrived in Seattle at 27 as the fastest man on a roster full of them.', 97, 84, 82, 86, 74, 94, 66],
    ['now-sea-horton', 'Tory Horton', '2025–', 'Fifth round rookie who returned two punts for touchdowns before October.', 94, 84, 84, 82, 74, 90, 74],
    ['now-sea-kupp', 'Cooper Kupp', '2025–', 'Came home to the northwest at 32 with the routes still perfectly intact.', 78, 96, 96, 86, 86, 84, 84],
    ['now-sea-bobo', 'Jake Bobo', '2023–2025', 'Nobody drafted him and he catches everything thrown at the back pylon.', 76, 90, 82, 70, 92, 66, 92],
    ['now-sea-metcalf', 'DK Metcalf', '2019–2024', 'Six seasons of being the biggest and the fastest man on the field at once.', 97, 84, 82, 80, 96, 86, 97],
  ],
  tb: [
    ['now-tb-mcmillan', 'Jalen McMillan', '2024–', 'Third round pick who scored five touchdowns in three December games.', 90, 86, 84, 80, 82, 82, 78],
    ['now-tb-egbuka', 'Emeka Egbuka', '2025–', 'Rookie who caught touchdowns in his first three games and never looked new.', 90, 90, 90, 84, 84, 88, 80],
    ['now-tb-godwin', 'Chris Godwin', '2017–', 'Catches everything over the middle and has rebuilt two different legs.', 84, 94, 94, 86, 88, 90, 84],
    ['now-tb-hurst', 'Ted Hurst III', '2026–', 'Georgia State receiver who caught everything while nobody was watching.', 92, 84, 82, 80, 82, 82, 78],
    ['now-tb-shepard', 'Sterling Shepard', '2024–2025', 'Ninth season, and he found a role here after New York gave up on him.', 86, 88, 86, 82, 66, 84, 58],
    ['now-tb-evans', 'Mike Evans', '2014–2025', 'Has gone over a thousand yards every single year he has been in the league.', 84, 92, 92, 82, 97, 78, 97],
  ],
  ten: [
    ['now-ten-ridley', 'Calvin Ridley', '2024–', 'Sat out a whole season for betting on his own team and came back good.', 90, 86, 94, 90, 84, 80, 78],
    ['now-ten-tate', 'Carnell Tate', '2026–', 'Ohio State receivers go in the first round now, and he is the latest of them.', 90, 90, 90, 86, 86, 80, 82],
    ['now-ten-robinson', 'Wan\'Dale Robinson', '2026–', 'Five foot eight, and everything he catches happens within nine yards.', 88, 92, 88, 84, 70, 84, 52],
    ['now-ten-ayomanor', 'Elic Ayomanor', '2025–', 'Fourth round rookie who put up 294 yards against Travis Hunter in college.', 88, 86, 84, 78, 92, 84, 90],
    ['now-ten-dike', 'Chimere Dike', '2025–', 'Runs a genuine 4.34 and has to prove he can do more than return kicks.', 96, 80, 80, 82, 68, 88, 66],
    ['now-ten-hopkins', 'DeAndre Hopkins', '2023–2024', 'Made the catch of the year at 31 on a knee that had been rebuilt.', 78, 96, 94, 82, 97, 70, 92],
  ],
  was: [
    ['now-was-mclaurin', 'Terry McLaurin', '2019–', 'Scary Terry got open for six years before anybody could throw it to him.', 92, 90, 94, 90, 90, 82, 76],
    ['now-was-diggs', 'Stefon Diggs', '2026–', 'Fourth franchise, and every one of them has been better with him in it.', 88, 94, 97, 92, 86, 86, 76],
    ['now-was-brown', 'Dyami Brown', '2026–', 'Had three enormous playoff games once and has been chasing them since.', 94, 82, 84, 84, 80, 82, 74],
    ['now-was-lane', 'Jaylin Lane', '2025–', 'Fourth round rookie who ran a 4.34 and returns punts.', 96, 80, 78, 80, 62, 88, 58],
    ['now-was-samuel', 'Deebo Samuel', '2025–2025', 'Still runs it out of the backfield and still runs people over doing it.', 88, 84, 82, 80, 88, 96, 92],
    ['now-was-dotson', 'Jahan Dotson', '2022–2023', 'Sixteenth overall pick who caught seven touchdowns as a rookie and then faded.', 90, 84, 86, 82, 78, 80, 70],
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
