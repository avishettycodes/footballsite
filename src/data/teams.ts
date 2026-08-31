import type { Team } from './types';

/**
 * All 32 franchises. Team names are used descriptively to identify the historical
 * player pools; this project is not affiliated with or endorsed by any of them.
 * Colors are approximations of each club's primary palette, for theming only.
 */
export const TEAMS: Team[] = [
  { id: 'ari', city: 'Arizona',      name: 'Cardinals',  abbr: 'ARI', primary: '#97233f', secondary: '#ffb612' },
  { id: 'atl', city: 'Atlanta',      name: 'Falcons',    abbr: 'ATL', primary: '#a71930', secondary: '#a5acaf' },
  { id: 'bal', city: 'Baltimore',    name: 'Ravens',     abbr: 'BAL', primary: '#241773', secondary: '#9e7c0c' },
  { id: 'buf', city: 'Buffalo',      name: 'Bills',      abbr: 'BUF', primary: '#00338d', secondary: '#c60c30' },
  { id: 'car', city: 'Carolina',     name: 'Panthers',   abbr: 'CAR', primary: '#0085ca', secondary: '#101820' },
  { id: 'chi', city: 'Chicago',      name: 'Bears',      abbr: 'CHI', primary: '#0b162a', secondary: '#c83803' },
  { id: 'cin', city: 'Cincinnati',   name: 'Bengals',    abbr: 'CIN', primary: '#fb4f14', secondary: '#101820' },
  { id: 'cle', city: 'Cleveland',    name: 'Browns',     abbr: 'CLE', primary: '#311d00', secondary: '#ff3c00' },
  { id: 'dal', city: 'Dallas',       name: 'Cowboys',    abbr: 'DAL', primary: '#003594', secondary: '#869397' },
  { id: 'den', city: 'Denver',       name: 'Broncos',    abbr: 'DEN', primary: '#fb4f14', secondary: '#002244' },
  { id: 'det', city: 'Detroit',      name: 'Lions',      abbr: 'DET', primary: '#0076b6', secondary: '#b0b7bc' },
  { id: 'gb',  city: 'Green Bay',    name: 'Packers',    abbr: 'GB',  primary: '#203731', secondary: '#ffb612' },
  { id: 'hou', city: 'Houston',      name: 'Texans',     abbr: 'HOU', primary: '#03202f', secondary: '#a71930' },
  { id: 'ind', city: 'Indianapolis', name: 'Colts',      abbr: 'IND', primary: '#002c5f', secondary: '#a2aaad' },
  { id: 'jax', city: 'Jacksonville', name: 'Jaguars',    abbr: 'JAX', primary: '#006778', secondary: '#d7a22a' },
  { id: 'kc',  city: 'Kansas City',  name: 'Chiefs',     abbr: 'KC',  primary: '#e31837', secondary: '#ffb81c' },
  { id: 'lv',  city: 'Las Vegas',    name: 'Raiders',    abbr: 'LV',  primary: '#101820', secondary: '#a5acaf' },
  { id: 'lac', city: 'Los Angeles',  name: 'Chargers',   abbr: 'LAC', primary: '#0080c6', secondary: '#ffc20e' },
  { id: 'lar', city: 'Los Angeles',  name: 'Rams',       abbr: 'LAR', primary: '#003594', secondary: '#ffa300' },
  { id: 'mia', city: 'Miami',        name: 'Dolphins',   abbr: 'MIA', primary: '#008e97', secondary: '#fc4c02' },
  { id: 'min', city: 'Minnesota',    name: 'Vikings',    abbr: 'MIN', primary: '#4f2683', secondary: '#ffc62f' },
  { id: 'ne',  city: 'New England',  name: 'Patriots',   abbr: 'NE',  primary: '#002a5e', secondary: '#c60c30' },
  { id: 'no',  city: 'New Orleans',  name: 'Saints',     abbr: 'NO',  primary: '#d3bc8d', secondary: '#101820' },
  { id: 'nyg', city: 'New York',     name: 'Giants',     abbr: 'NYG', primary: '#0b2265', secondary: '#a71930' },
  { id: 'nyj', city: 'New York',     name: 'Jets',       abbr: 'NYJ', primary: '#125740', secondary: '#ffffff' },
  { id: 'phi', city: 'Philadelphia', name: 'Eagles',     abbr: 'PHI', primary: '#004c54', secondary: '#a5acaf' },
  { id: 'pit', city: 'Pittsburgh',   name: 'Steelers',   abbr: 'PIT', primary: '#ffb612', secondary: '#101820' },
  { id: 'sf',  city: 'San Francisco',name: '49ers',      abbr: 'SF',  primary: '#aa0000', secondary: '#b3995d' },
  { id: 'sea', city: 'Seattle',      name: 'Seahawks',   abbr: 'SEA', primary: '#002244', secondary: '#69be28' },
  { id: 'tb',  city: 'Tampa Bay',    name: 'Buccaneers', abbr: 'TB',  primary: '#d50a0a', secondary: '#0a0a08' },
  { id: 'ten', city: 'Tennessee',    name: 'Titans',     abbr: 'TEN', primary: '#0c2340', secondary: '#4b92db' },
  { id: 'was', city: 'Washington',   name: 'Commanders', abbr: 'WAS', primary: '#5a1414', secondary: '#ffb612' },
];

export const TEAMS_BY_ID: Record<string, Team> = Object.fromEntries(
  TEAMS.map((t) => [t.id, t]),
);

export function getTeam(id: string): Team {
  const team = TEAMS_BY_ID[id];
  if (!team) throw new Error(`Unknown team id: ${id}`);
  return team;
}
