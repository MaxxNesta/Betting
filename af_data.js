// ─── API-FOOTBALL ENRICHMENT DATA ────────────────────────────────────────────
// Source: api-football.com · League ID 1 · Season 2026
// Last updated: 2026-06-12
// API key is server-side only — all requests proxied through /api/*
// ─────────────────────────────────────────────────────────────────────────────

// Maps football-data.org team names → API-Football IDs (for logo CDN)
const AF_TEAM_IDS = {
  'Mexico': 11,          'South Africa': 1569,   'South Korea': 17,
  'Czech Republic': 770, 'Czechia': 770,          'Canada': 5529,
  'Bosnia & Herzegovina': 1113, 'Bosnia-Herzegovina': 1113,
  'United States': 2363, 'USA': 2363,             'Paraguay': 18,
  'Qatar': 2382,         'Switzerland': 15,       'Brazil': 6,
  'Morocco': 38,         'France': 2,             'England': 10,
  'Germany': 25,         'Spain': 9,              'Argentina': 26,
  'Portugal': 27,        'Netherlands': 1543,     'Belgium': 1,
  'Croatia': 3,          'Uruguay': 13,           'Senegal': 212,
  'Japan': 20,           'Colombia': 31,          'Ecuador': 16,
  'Sweden': 16,          'Australia': 26,         'Turkey': 21,
  'Austria': 775,        'Scotland': 1108,        'Norway': 1509,
  'Iran': 2381,          'Ghana': 22,             'Egypt': 23,
  'Saudi Arabia': 2372,  'Tunisia': 202,          'Algeria': 200,
  'Ivory Coast': 30,     'Congo DR': 1497,        'Senegal': 212,
  'Haiti': 6347,         'New Zealand': 74,       'Uzbekistan': 2373,
  'Iraq': 2373,          'Jordan': 2379,          'Cape Verde Islands': 2385,
  'Curaçao': 11931,
};

// API-Football fixture IDs for WC2026 matches
const AF_FIXTURES = [
  {
    afId: 1489369,
    homeName: 'Mexico', awayName: 'South Africa',
    date: '2026-06-11T19:00:00+00:00',
    venue: 'Estadio Azteca', city: 'Mexico City',
    status: 'FT', elapsed: 90,
    goals: { home: 2, away: 0 },
    round: 'Group Stage - 1',
  },
  {
    afId: 1538999,
    homeName: 'South Korea', awayName: 'Czech Republic',
    date: '2026-06-12T02:00:00+00:00',
    venue: 'Estadio Akron', city: 'Guadalajara',
    status: 'FT', elapsed: 90,
    goals: { home: 2, away: 1 },
    round: 'Group Stage - 1',
  },
  {
    afId: 1539000,
    homeName: 'Canada', awayName: 'Bosnia & Herzegovina',
    date: '2026-06-12T19:00:00+00:00',
    venue: 'BMO Field', city: 'Toronto',
    status: 'NS', elapsed: null,
    goals: { home: null, away: null },
    round: 'Group Stage - 1',
  },
  {
    afId: 1489370,
    homeName: 'USA', awayName: 'Paraguay',
    date: '2026-06-13T01:00:00+00:00',
    venue: 'Rose Bowl', city: 'Los Angeles',
    status: 'NS', elapsed: null,
    goals: { home: null, away: null },
    round: 'Group Stage - 1',
  },
  {
    afId: 1489373,
    homeName: 'Qatar', awayName: 'Switzerland',
    date: '2026-06-13T19:00:00+00:00',
    venue: 'Levi\'s Stadium', city: 'San Francisco',
    status: 'NS', elapsed: null,
    goals: { home: null, away: null },
    round: 'Group Stage - 1',
  },
  {
    afId: 1489371,
    homeName: 'Brazil', awayName: 'Morocco',
    date: '2026-06-13T22:00:00+00:00',
    venue: 'MetLife Stadium', city: 'New York',
    status: 'NS', elapsed: null,
    goals: { home: null, away: null },
    round: 'Group Stage - 1',
  },
];

// Real Bet365 odds (fetched from API-Football)
const AF_ODDS = {
  1539000: { home: 1.85, draw: 3.50, away: 4.50, bk: 'Bet365' }, // Canada vs Bosnia
  1489370: { home: 2.05, draw: 3.25, away: 3.90, bk: 'Bet365' }, // USA vs Paraguay
  1489373: { home: 12.00, draw: 6.50, away: 1.22, bk: 'Bet365'}, // Qatar vs Switzerland
  1489371: { home: 1.62, draw: 3.90, away: 5.50, bk: 'Bet365' }, // Brazil vs Morocco
};

// Match events for completed fixtures
const AF_EVENTS = {
  1489369: [ // Mexico 2-0 South Africa
    { min: 9,  type: 'Goal',  team: 'Mexico',       player: 'Julián Quiñones',  detail: 'Normal Goal' },
    { min: 17, type: 'Card',  team: 'South Africa',  player: 'Teboho Mokoena',  detail: 'Yellow Card' },
    { min: 23, type: 'Card',  team: 'Mexico',        player: 'Brian Gutiérrez', detail: 'Yellow Card' },
    { min: 49, type: 'Card',  team: 'South Africa',  player: 'Siphephelo Sithole', detail: 'Red Card' },
    { min: 56, type: 'Sub',   team: 'South Africa',  player: 'Lyle Foster',     detail: 'Substitution 1' },
    { min: 61, type: 'Sub',   team: 'South Africa',  player: 'Jayden Adams',    detail: 'Substitution 2' },
    { min: 66, type: 'Sub',   team: 'Mexico',        player: 'Álvaro Fidalgo',  detail: 'Substitution 1' },
    { min: 66, type: 'Sub',   team: 'Mexico',        player: 'Brian Gutiérrez', detail: 'Substitution 2' },
    { min: 67, type: 'Goal',  team: 'Mexico',        player: 'Raúl Jiménez',    detail: 'Normal Goal' },
    { min: 74, type: 'Card',  team: 'South Africa',  player: 'Nkosinathi Sibisi', detail: 'Yellow Card' },
    { min: 76, type: 'Sub',   team: 'Mexico',        player: 'Raúl Jiménez',    detail: 'Substitution 3' },
    { min: 76, type: 'Sub',   team: 'Mexico',        player: 'Erik Lira',        detail: 'Substitution 4' },
    { min: 77, type: 'Sub',   team: 'South Africa',  player: 'Aubrey Modiba',   detail: 'Substitution 3' },
    { min: 77, type: 'Sub',   team: 'South Africa',  player: 'Iqraam Rayners',  detail: 'Substitution 4' },
    { min: 79, type: 'Sub',   team: 'Mexico',        player: 'Julián Quiñones', detail: 'Substitution 5' },
    { min: 82, type: 'Card',  team: 'South Africa',  player: 'Themba Zwane',    detail: 'VAR upgrade' },
    { min: 84, type: 'Card',  team: 'South Africa',  player: 'Themba Zwane',    detail: 'Red Card' },
    { min: 90, type: 'Card',  team: 'Mexico',        player: 'César Montes',    detail: 'Red Card' },
  ],
  1538999: [ // South Korea 2-1 Czech Republic
    { min: 59, type: 'Goal',  team: 'Czech Republic', player: 'L. Krejci',        detail: 'Normal Goal' },
    { min: 67, type: 'Goal',  team: 'South Korea',    player: 'Hwang In-Beom',   detail: 'Normal Goal' },
    { min: 80, type: 'Goal',  team: 'South Korea',    player: 'Oh Hyeon-Gyu',    detail: 'Normal Goal' },
  ],
};

// Lineups for completed fixtures
const AF_LINEUPS = {
  1489369: { // Mexico vs South Africa
    home: { name: 'Mexico',       formation: '4-1-4-1' },
    away: { name: 'South Africa', formation: '5-3-2'   },
  },
  1538999: { // South Korea vs Czech Republic
    home: { name: 'South Korea',    formation: '3-4-2-1' },
    away: { name: 'Czech Republic', formation: '3-4-2-1' },
  },
};

// ─── LIVE REFRESH — proxied through Vercel /api/* (key stays server-side) ────

async function fetchLiveOdds(afId) {
  try {
    const d = await fetch(`/api/odds?fixture=${afId}`).then(r => r.json());
    if (!d.response?.length) return null;
    const bet365 = d.response[0].bookmakers.find(b => b.name === 'Bet365');
    if (!bet365) return null;
    const mw = bet365.bets.find(b => b.name === 'Match Winner');
    if (!mw) return null;
    return {
      home: parseFloat(mw.values.find(v => v.value === 'Home')?.odd),
      draw: parseFloat(mw.values.find(v => v.value === 'Draw')?.odd),
      away: parseFloat(mw.values.find(v => v.value === 'Away')?.odd),
      bk: 'Bet365',
    };
  } catch { return null; }
}

async function fetchLiveEvents(afId) {
  try {
    const d = await fetch(`/api/events?fixture=${afId}`).then(r => r.json());
    return d.response || [];
  } catch { return []; }
}

async function fetchLiveFixture(afId) {
  try {
    const d = await fetch(`/api/fixture?id=${afId}`).then(r => r.json());
    return d.response?.[0] || null;
  } catch { return null; }
}

// Map football-data.org team names to AF fixture IDs (for live lookup)
function findAfFixture(homeName, awayName) {
  return AF_FIXTURES.find(f =>
    (f.homeName === homeName || f.homeName.includes(homeName) || homeName.includes(f.homeName)) &&
    (f.awayName === awayName || f.awayName.includes(awayName) || awayName.includes(f.awayName))
  ) || null;
}

function getAfOdds(afId) {
  return AF_ODDS[afId] || null;
}

function getAfEvents(afId) {
  return AF_EVENTS[afId] || null;
}

function getAfLineup(afId) {
  return AF_LINEUPS[afId] || null;
}
