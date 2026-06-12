// ─── TEAM RATINGS (FIFA ranking-based, mid-2026) ─────────────────────────────
const RATINGS = {
  762: { r: 94, name: 'Argentina',          flag: '🇦🇷' },
  773: { r: 92, name: 'France',             flag: '🇫🇷' },
  764: { r: 91, name: 'Brazil',             flag: '🇧🇷' },
  760: { r: 90, name: 'Spain',              flag: '🇪🇸' },
  770: { r: 89, name: 'England',            flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  765: { r: 87, name: 'Portugal',           flag: '🇵🇹' },
  8601:{ r: 85, name: 'Netherlands',        flag: '🇳🇱' },
  759: { r: 84, name: 'Germany',            flag: '🇩🇪' },
  805: { r: 83, name: 'Belgium',            flag: '🇧🇪' },
  799: { r: 81, name: 'Croatia',            flag: '🇭🇷' },
  815: { r: 80, name: 'Morocco',            flag: '🇲🇦' },
  758: { r: 79, name: 'Uruguay',            flag: '🇺🇾' },
  788: { r: 78, name: 'Switzerland',        flag: '🇨🇭' },
  818: { r: 77, name: 'Colombia',           flag: '🇨🇴' },
  803: { r: 76, name: 'Turkey',             flag: '🇹🇷' },
  816: { r: 75, name: 'Austria',            flag: '🇦🇹' },
  771: { r: 75, name: 'United States',      flag: '🇺🇸' },
  769: { r: 74, name: 'Mexico',             flag: '🇲🇽' },
  804: { r: 74, name: 'Senegal',            flag: '🇸🇳' },
  792: { r: 73, name: 'Sweden',             flag: '🇸🇪' },
  766: { r: 72, name: 'Japan',              flag: '🇯🇵' },
  8872:{ r: 72, name: 'Norway',             flag: '🇳🇴' },
  772: { r: 71, name: 'South Korea',        flag: '🇰🇷' },
  828: { r: 71, name: 'Canada',             flag: '🇨🇦' },
  791: { r: 70, name: 'Ecuador',            flag: '🇪🇨' },
  802: { r: 68, name: 'Tunisia',            flag: '🇹🇳' },
  779: { r: 68, name: 'Australia',          flag: '🇦🇺' },
  8873:{ r: 67, name: 'Scotland',           flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  825: { r: 66, name: 'Egypt',              flag: '🇪🇬' },
  840: { r: 65, name: 'Iran',               flag: '🇮🇷' },
  1935:{ r: 65, name: 'Ivory Coast',        flag: '🇨🇮' },
  763: { r: 64, name: 'Ghana',              flag: '🇬🇭' },
  761: { r: 63, name: 'Paraguay',           flag: '🇵🇾' },
  778: { r: 63, name: 'Algeria',            flag: '🇩🇿' },
  798: { r: 62, name: 'Czechia',            flag: '🇨🇿' },
  1060:{ r: 62, name: 'Bosnia-Herzegovina', flag: '🇧🇦' },
  801: { r: 61, name: 'Saudi Arabia',       flag: '🇸🇦' },
  1836:{ r: 60, name: 'Panama',             flag: '🇵🇦' },
  1934:{ r: 59, name: 'Congo DR',           flag: '🇨🇩' },
  8062:{ r: 58, name: 'Iraq',               flag: '🇮🇶' },
  8049:{ r: 57, name: 'Jordan',             flag: '🇯🇴' },
  8030:{ r: 56, name: 'Qatar',              flag: '🇶🇦' },
  774: { r: 55, name: 'South Africa',       flag: '🇿🇦' },
  8070:{ r: 54, name: 'Uzbekistan',         flag: '🇺🇿' },
  1930:{ r: 53, name: 'Cape Verde Islands', flag: '🇨🇻' },
  783: { r: 52, name: 'New Zealand',        flag: '🇳🇿' },
  836: { r: 51, name: 'Haiti',              flag: '🇭🇹' },
  802: { r: 50, name: 'Tunisia',            flag: '🇹🇳' },
  9460:{ r: 49, name: 'Curaçao',            flag: '🏝️' },
};

// WC win probability weights (bookmaker-derived, roughly)
const WIN_ODDS = {
  762: 4.0, 773: 5.5, 764: 5.5, 760: 6.0, 770: 7.0, 765: 9.0,
  8601:10.0, 759:11.0, 815:15.0, 818:18.0, 771:20.0, 758:22.0,
  805:22.0, 799:25.0, 769:30.0, 788:30.0, 803:35.0, 816:40.0,
  772:45.0, 804:50.0, 792:60.0, 766:60.0, 828:65.0, 8872:80.0,
  8873:100.0,
};

// ─── GROUP ASSIGNMENTS (derived from API data) ────────────────────────────────
// Built from competition/matches GROUP_X fields
const GROUP_MAP = {}; // teamId → group letter

// ─── BETTING ENGINE ───────────────────────────────────────────────────────────

function getTeamRating(id) {
  const r = RATINGS[id];
  return r ? r.r : 55;
}

function calcTrueProb(homeId, awayId) {
  const h = getTeamRating(homeId);
  const a = getTeamRating(awayId);
  const diff = (h - a) / 100;
  const homeProb = Math.min(0.85, Math.max(0.10, 0.46 + diff));
  const drawProb = Math.max(0.06, 0.26 - Math.abs(diff) * 0.55);
  const awayProb = Math.max(0.05, 1 - homeProb - drawProb);
  return { home: homeProb, draw: drawProb, away: awayProb };
}

// Get real Bet365 odds if available via af_data.js, else generate model odds
function getMatchOdds(m) {
  const af = findAfFixture(m.homeName, m.awayName);
  if (af) {
    const real = getAfOdds(af.afId);
    if (real) return { ...real, isReal: true, afId: af.afId };
  }
  if (!m.homeId || !m.awayId) return null;
  const p = calcTrueProb(m.homeId, m.awayId);
  const mg = 1.065;
  return {
    home: parseFloat((mg / p.home).toFixed(2)),
    draw: parseFloat((mg / p.draw).toFixed(2)),
    away: parseFloat((mg / p.away).toFixed(2)),
    bk: 'Model', isReal: false,
  };
}

// Keep genOdds for internal use
function genOdds(homeId, awayId) {
  const p = calcTrueProb(homeId, awayId);
  const mg = 1.065;
  return {
    home: parseFloat((mg / p.home).toFixed(2)),
    draw: parseFloat((mg / p.draw).toFixed(2)),
    away: parseFloat((mg / p.away).toFixed(2)),
  };
}

function calcEdge(trueProb, bookOdds) {
  const implied = 1 / bookOdds;
  return (trueProb - implied) / implied;
}

function getValueLabel(edge) {
  if (edge > 0.18) return { label: 'STRONG VALUE', cls: 'val-strong' };
  if (edge > 0.07) return { label: 'VALUE',         cls: 'val-good' };
  if (edge > 0.01) return { label: 'SLIGHT EDGE',   cls: 'val-slight' };
  if (edge > -0.08)return { label: 'FAIR',           cls: 'val-fair' };
  return               { label: 'OVERPRICED',        cls: 'val-bad' };
}

// ─── STANDINGS CALCULATOR ─────────────────────────────────────────────────────

function buildStandings() {
  const table = {}; // teamId → { name, tla, crest, W, D, L, GF, GA, P, group }

  WC_MATCHES.forEach(m => {
    if (!m.group || !m.group.startsWith('GROUP_')) return;
    const grp = m.group.replace('GROUP_', '');

    [m.homeId, m.awayId].forEach(id => {
      if (!table[id]) {
        const rt = RATINGS[id] || {};
        table[id] = {
          id, name: rt.name || (id === m.homeId ? m.homeName : m.awayName),
          tla: id === m.homeId ? m.homeTla : m.awayTla,
          crest: id === m.homeId ? m.homeCrest : m.awayCrest,
          group: grp, W: 0, D: 0, L: 0, GF: 0, GA: 0, P: 0, played: 0,
        };
      }
      GROUP_MAP[id] = grp;
    });

    if (m.status !== 'FINISHED' || m.scoreHome === null) return;

    const h = table[m.homeId], a = table[m.awayId];
    h.played++; a.played++;
    h.GF += m.scoreHome; h.GA += m.scoreAway;
    a.GF += m.scoreAway; a.GA += m.scoreHome;

    if (m.winner === 'HOME_TEAM')     { h.W++; h.P += 3; a.L++; }
    else if (m.winner === 'AWAY_TEAM'){ a.W++; a.P += 3; h.L++; }
    else                              { h.D++; a.D++; h.P++; a.P++; }
  });

  // Group by letter
  const groups = {};
  Object.values(table).forEach(t => {
    if (!groups[t.group]) groups[t.group] = [];
    groups[t.group].push(t);
  });
  Object.keys(groups).forEach(g => {
    groups[g].sort((a, b) => b.P - a.P || (b.GF - b.GA) - (a.GF - a.GA) || b.GF - a.GF);
  });
  return groups;
}

// ─── FORMATTERS ──────────────────────────────────────────────────────────────

function fmtDate(utcStr) {
  const d = new Date(utcStr);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
}

function fmtTime(utcStr) {
  const d = new Date(utcStr);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York' });
}

function stageLabel(stage) {
  const m = { GROUP_STAGE: 'GRP', LAST_32: 'R32', LAST_16: 'R16',
               QUARTER_FINALS: 'QF', SEMI_FINALS: 'SF', THIRD_PLACE: '3RD', FINAL: 'FINAL' };
  return m[stage] || stage;
}

function groupLabel(g) {
  return g ? g.replace('GROUP_', 'Grp ') : '';
}

function scoreBlock(m) {
  if (m.status === 'FINISHED') {
    return `<div class="score-box finished">
      <span class="score-num">${m.scoreHome}</span>
      <span class="score-sep">–</span>
      <span class="score-num">${m.scoreAway}</span>
    </div>`;
  }
  if (m.status === 'IN_PLAY' || m.status === 'PAUSED') {
    return `<div class="score-box live">LIVE</div>`;
  }
  return `<div class="score-box upcoming">${fmtTime(m.utcDate)} <span class="tz">ET</span></div>`;
}

function valueTag(edge) {
  const v = getValueLabel(edge);
  return `<span class="val-tag ${v.cls}">${v.label}</span>`;
}

// ─── SQUAD LOOKUP ─────────────────────────────────────────────────────────────

function getSquad(teamId) {
  return WC_SQUADS.find(s => s.id === teamId) || null;
}

function calcAge(dob) {
  if (!dob) return '?';
  const y = new Date().getFullYear() - new Date(dob).getFullYear();
  return y;
}

// ─── UI STATE ─────────────────────────────────────────────────────────────────

let activeTab = 'fixtures';
let filterStage = 'all';
let filterGroup = 'all';
let selectedTeamId = null;
let standings = null;

// ─── RENDER: FIXTURES ─────────────────────────────────────────────────────────

function renderFixtures() {
  let matches = [...WC_MATCHES];
  if (filterStage !== 'all')  matches = matches.filter(m => m.stage === filterStage);
  if (filterGroup !== 'all')  matches = matches.filter(m => m.group === filterGroup);

  // Group by date
  const byDate = {};
  matches.forEach(m => {
    const d = new Date(m.utcDate).toDateString();
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(m);
  });

  const finishedCount  = WC_MATCHES.filter(m => m.status === 'FINISHED').length;
  const upcomingCount  = WC_MATCHES.filter(m => m.status === 'TIMED').length;

  let html = `
    <div class="fixture-summary">
      <div class="sum-item"><span class="sum-num">${WC_MATCHES.length}</span><span class="sum-label">Total Matches</span></div>
      <div class="sum-item"><span class="sum-num played">${finishedCount}</span><span class="sum-label">Played</span></div>
      <div class="sum-item"><span class="sum-num upcoming">${upcomingCount}</span><span class="sum-label">Remaining</span></div>
      <div class="sum-item"><span class="sum-num">48</span><span class="sum-label">Teams</span></div>
    </div>`;

  Object.entries(byDate).sort(([a],[b]) => new Date(a)-new Date(b)).forEach(([date, ms]) => {
    html += `<div class="date-block">
      <div class="date-header"><span>${new Date(date).toLocaleDateString('en-GB',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})}</span><span class="date-line"></span></div>`;
    ms.forEach(m => {
      const odds  = getMatchOdds(m);
      const probs = (m.homeId && m.awayId) ? calcTrueProb(m.homeId, m.awayId) : null;
      const homeEdge = (odds && probs) ? calcEdge(probs.home, odds.home) : null;
      const awayEdge = (odds && probs) ? calcEdge(probs.away, odds.away) : null;
      const hv = homeEdge !== null ? getValueLabel(homeEdge) : null;
      const av = awayEdge !== null ? getValueLabel(awayEdge) : null;
      const isKO = m.stage !== 'GROUP_STAGE';
      const isFinished = m.status === 'FINISHED';

      // AF enrichment
      const af = findAfFixture(m.homeName, m.awayName);
      const afEvents = af ? getAfEvents(af.afId) : null;
      const afLineup = af ? getAfLineup(af.afId) : null;

      // Goal events for finished matches
      const goals = afEvents ? afEvents.filter(e => e.type === 'Goal') : [];
      const cards = afEvents ? afEvents.filter(e => e.type === 'Card' && (e.detail === 'Red Card' || e.detail === 'Yellow Card')) : [];

      html += `
        <div class="fixture-wrap">
          <div class="fixture-row ${isKO ? 'knockout' : ''} ${isFinished ? 'result' : ''}" onclick="toggleMatchDetail('match-${m.id}')">
            <div class="fix-meta">
              <span class="fix-stage">${stageLabel(m.stage)}</span>
              ${m.group ? `<span class="fix-group">${groupLabel(m.group)}</span>` : ''}
            </div>
            <div class="fix-teams">
              <div class="team-cell home">
                ${hv && !isFinished ? `<span class="val-dot ${hv.cls}"></span>` : ''}
                ${m.homeCrest ? `<img src="${m.homeCrest}" class="team-crest" onerror="this.style.display='none'">` : ''}
                <span class="team-name">${m.homeName || '?'}</span>
                ${isFinished && m.winner === 'HOME_TEAM' ? '<span class="winner-mark">W</span>' : ''}
              </div>
              ${scoreBlock(m)}
              <div class="team-cell away">
                ${isFinished && m.winner === 'AWAY_TEAM' ? '<span class="winner-mark">W</span>' : ''}
                <span class="team-name">${m.awayName || '?'}</span>
                ${m.awayCrest ? `<img src="${m.awayCrest}" class="team-crest" onerror="this.style.display='none'">` : ''}
                ${av && !isFinished ? `<span class="val-dot ${av.cls}"></span>` : ''}
              </div>
            </div>
            ${odds && !isFinished ? `
            <div class="fix-odds">
              ${odds.isReal ? `<span class="odds-source">${odds.bk}</span>` : `<span class="odds-source model">Model</span>`}
              <div class="odds-block">
                <span class="odds-label">1</span>
                <span class="odds-num ${odds.isReal ? 'real' : ''}">${odds.home.toFixed(2)}</span>
                ${probs ? valueTag(homeEdge) : ''}
              </div>
              <div class="odds-block">
                <span class="odds-label">X</span>
                <span class="odds-num ${odds.isReal ? 'real' : ''}">${odds.draw.toFixed(2)}</span>
              </div>
              <div class="odds-block">
                <span class="odds-label">2</span>
                <span class="odds-num ${odds.isReal ? 'real' : ''}">${odds.away.toFixed(2)}</span>
                ${probs ? valueTag(awayEdge) : ''}
              </div>
            </div>` : `<div class="fix-odds">${isFinished && afLineup ? `<span class="formation-tag">${afLineup.home.formation} v ${afLineup.away.formation}</span>` : ''}</div>`}
          </div>
          ${(isFinished && (goals.length || cards.length)) || (!isFinished && odds) ? `
          <div class="match-detail" id="match-${m.id}" style="display:none">
            ${isFinished && goals.length ? `
              <div class="event-timeline">
                <div class="etl-label">GOALS</div>
                ${goals.map(g => `
                  <div class="event-item goal">
                    <span class="ev-min">${g.min}'</span>
                    <span class="ev-icon">⚽</span>
                    <span class="ev-team">${g.team}</span>
                    <span class="ev-player">${g.player}</span>
                  </div>`).join('')}
              </div>` : ''}
            ${isFinished && cards.filter(c => c.detail === 'Red Card').length ? `
              <div class="event-timeline">
                <div class="etl-label">RED CARDS</div>
                ${cards.filter(c => c.detail === 'Red Card').map(c => `
                  <div class="event-item red-card">
                    <span class="ev-min">${c.min}'</span>
                    <span class="ev-icon">🟥</span>
                    <span class="ev-team">${c.team}</span>
                    <span class="ev-player">${c.player}</span>
                  </div>`).join('')}
              </div>` : ''}
            ${!isFinished && odds && probs ? `
              <div class="prob-bars">
                <div class="etl-label">WIN PROBABILITY (Model)</div>
                <div class="pb-row">
                  <span class="pb-label">${m.homeName}</span>
                  <div class="pb-track"><div class="pb-fill home" style="width:${(probs.home*100).toFixed(0)}%"></div></div>
                  <span class="pb-pct">${(probs.home*100).toFixed(0)}%</span>
                </div>
                <div class="pb-row">
                  <span class="pb-label">Draw</span>
                  <div class="pb-track"><div class="pb-fill draw" style="width:${(probs.draw*100).toFixed(0)}%"></div></div>
                  <span class="pb-pct">${(probs.draw*100).toFixed(0)}%</span>
                </div>
                <div class="pb-row">
                  <span class="pb-label">${m.awayName}</span>
                  <div class="pb-track"><div class="pb-fill away" style="width:${(probs.away*100).toFixed(0)}%"></div></div>
                  <span class="pb-pct">${(probs.away*100).toFixed(0)}%</span>
                </div>
              </div>` : ''}
          </div>` : ''}
        </div>`;
    });
    html += `</div>`;
  });

  document.getElementById('fixtures-content').innerHTML = html;
}

// ─── RENDER: STANDINGS ────────────────────────────────────────────────────────

function renderStandings() {
  if (!standings) standings = buildStandings();
  const sortedGroups = Object.keys(standings).sort();

  let html = `<div class="standings-grid">`;
  sortedGroups.forEach(g => {
    const rows = standings[g];
    html += `
      <div class="standings-group">
        <div class="sg-header">GROUP ${g}</div>
        <table class="sg-table">
          <thead><tr><th></th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th></tr></thead>
          <tbody>`;
    rows.forEach((t, i) => {
      const gd = t.GF - t.GA;
      const qualify = i < 2 ? 'q-direct' : i < 3 ? 'q-third' : '';
      html += `<tr class="${qualify}" onclick="showTeamPanel(${t.id})">
        <td class="sg-pos">${i+1}</td>
        <td class="sg-team">
          <img src="${t.crest}" class="sg-crest" onerror="this.style.display='none'">
          <span>${t.name}</span>
        </td>
        <td>${t.played}</td><td>${t.W}</td><td>${t.D}</td><td>${t.L}</td>
        <td>${t.GF}</td><td>${t.GA}</td>
        <td class="${gd>0?'gd-pos':gd<0?'gd-neg':''}">${gd>0?'+':''}${gd}</td>
        <td class="sg-pts">${t.P}</td>
      </tr>`;
    });
    html += `</tbody></table></div>`;
  });
  html += `</div>`;

  document.getElementById('standings-content').innerHTML = html;
}

// ─── RENDER: BETTING ENGINE ───────────────────────────────────────────────────

function renderBettingEngine() {
  const teamsSorted = Object.entries(RATINGS).sort((a, b) => b[1].r - a[1].r);

  let html = `
    <div class="engine-header">
      <h2 class="engine-title">VALUE BETTING ENGINE</h2>
      <p class="engine-sub">Model odds vs market odds · Edge = (True prob − Implied prob) / Implied prob · Ratings based on FIFA rankings</p>
    </div>
    <div class="team-selector">
      <button class="team-btn ${!selectedTeamId ? 'active' : ''}" onclick="selectTeam(null)">All Value Bets</button>
      ${teamsSorted.map(([id, t]) => `<button class="team-btn ${selectedTeamId==id?'active':''}" onclick="selectTeam(${id})">${t.flag} ${t.name}</button>`).join('')}
    </div>`;

  if (selectedTeamId) {
    html += renderTeamBettingReport(parseInt(selectedTeamId));
  } else {
    html += renderAllValueBets();
  }

  document.getElementById('betting-content').innerHTML = html;
}

function renderTeamBettingReport(teamId) {
  const team = RATINGS[teamId];
  if (!team) return '';

  const fixtures = WC_MATCHES.filter(m =>
    (m.homeId === teamId || m.awayId === teamId) && m.homeId && m.awayId
  );

  const squad = getSquad(teamId);
  const winOdds = WIN_ODDS[teamId] || '?';

  let bestEdge = -999, bestBet = null;
  const rows = fixtures.map(m => {
    const isHome = m.homeId === teamId;
    const oppName = isHome ? m.awayName : m.homeName;
    const odds = getMatchOdds(m);
    const probs = calcTrueProb(m.homeId, m.awayId);
    const bookOdds = odds ? (isHome ? odds.home : odds.away) : null;
    const trueProb = isHome ? probs.home : probs.away;
    const edge = bookOdds ? calcEdge(trueProb, bookOdds) : null;
    if (edge !== null && edge > bestEdge && m.status !== 'FINISHED') { bestEdge = edge; bestBet = { m, odds: bookOdds, edge, side: isHome ? 'HOME' : 'AWAY' }; }
    return { m, isHome, oppName, bookOdds, trueProb, edge, odds, probs };
  });

  let html = `
    <div class="team-report">
      <div class="report-header">
        <span class="report-flag">${team.flag}</span>
        <div class="report-meta">
          <h3>${team.name}</h3>
          <div class="report-stats">
            <span class="stat-pill">Rating <strong>${team.r}</strong></span>
            <span class="stat-pill">Group <strong>${GROUP_MAP[teamId] || '?'}</strong></span>
            <span class="stat-pill">WC Win <strong>${winOdds}x</strong></span>
            ${squad ? `<span class="stat-pill">Squad <strong>${squad.squad.length} players</strong></span>` : ''}
          </div>
        </div>
        ${bestBet ? `<div class="best-bet-badge">
          <div class="bb-label">BEST BET</div>
          <div class="bb-odds">${bestBet.odds.toFixed(2)}</div>
          <div class="bb-edge">${bestBet.side} · ${bestEdge > 0 ? '+' : ''}${(bestEdge * 100).toFixed(1)}% edge</div>
        </div>` : ''}
      </div>`;

  // Squad panel
  if (squad && squad.squad.length) {
    const byPos = {};
    squad.squad.forEach(p => {
      const pos = p.position || 'Unknown';
      if (!byPos[pos]) byPos[pos] = [];
      byPos[pos].push(p);
    });
    const posOrder = ['Goalkeeper','Defence','Midfield','Offence','Unknown'];
    html += `<div class="squad-panel">
      <div class="squad-title">SQUAD · ${squad.name.toUpperCase()}</div>
      <div class="squad-positions">`;
    posOrder.forEach(pos => {
      if (!byPos[pos]) return;
      html += `<div class="squad-pos-group">
        <div class="squad-pos-label">${pos.toUpperCase()}</div>
        <div class="squad-players">
          ${byPos[pos].map(p => `
            <div class="player-chip">
              <span class="p-name">${p.name}</span>
              <span class="p-age">${calcAge(p.dob)}</span>
            </div>`).join('')}
        </div>
      </div>`;
    });
    html += `</div></div>`;
  }

  // Value table
  html += `
    <table class="value-table">
      <thead><tr>
        <th>Match</th><th>Date</th><th>Side</th><th>Status</th>
        <th>Mkt Odds</th><th>True Odds</th><th>True %</th><th>Mkt %</th><th>Edge</th><th>Rating</th>
      </tr></thead><tbody>`;

  rows.forEach(({ m, isHome, oppName, bookOdds, trueProb, edge, odds }) => {
    if (!bookOdds) return;
    const { label, cls } = getValueLabel(edge);
    const trueOdds = (1 / trueProb).toFixed(2);
    const oddsSource = odds?.isReal ? `<span class="odds-src-tag">${odds.bk}</span>` : `<span class="odds-src-tag model">Model</span>`;
    html += `<tr class="${cls}-row">
      <td class="match-cell">${isHome ? '🏠' : '✈️'} vs ${oppName}</td>
      <td>${fmtDate(m.utcDate)}</td>
      <td>${isHome ? 'HOME' : 'AWAY'}</td>
      <td><span class="status-badge ${m.status.toLowerCase()}">${m.status}</span></td>
      <td class="num">${bookOdds.toFixed(2)} ${oddsSource}</td>
      <td class="num">${trueOdds}</td>
      <td class="num">${(trueProb * 100).toFixed(1)}%</td>
      <td class="num">${((1/bookOdds) * 100).toFixed(1)}%</td>
      <td class="num edge-cell ${cls}">${edge >= 0 ? '+' : ''}${(edge * 100).toFixed(1)}%</td>
      <td><span class="val-tag ${cls}">${label}</span></td>
    </tr>`;
  });

  html += `</tbody></table></div>`;
  return html;
}

function renderAllValueBets() {
  const bets = [];
  WC_MATCHES.filter(m => m.homeId && m.awayId && m.status !== 'FINISHED').forEach(m => {
    const odds  = getMatchOdds(m);
    if (!odds) return;
    const probs = calcTrueProb(m.homeId, m.awayId);
    [['home', probs.home, odds.home, m.homeName], ['away', probs.away, odds.away, m.awayName]].forEach(([side, prob, odd, nm]) => {
      const edge = calcEdge(prob, odd);
      if (edge > 0.04) bets.push({ m, side, prob, odd, edge, teamName: nm, isReal: odds.isReal, bk: odds.bk });
    });
  });
  bets.sort((a, b) => b.edge - a.edge);

  let html = `
    <div class="all-value-header">
      <h3>ALL VALUE BETS <span class="count-badge">${bets.length} picks</span></h3>
      <p>Upcoming matches only · Model edge &gt;4% · Click a team button above to drill in</p>
    </div>
    <table class="value-table">
      <thead><tr>
        <th>Pick</th><th>Match</th><th>Date / Time</th><th>Stage</th>
        <th>Mkt Odds</th><th>True Odds</th><th>Edge</th><th>Rating</th>
      </tr></thead><tbody>`;

  bets.forEach(({ m, side, prob, odd, edge, teamName, isReal, bk }) => {
    const { label, cls } = getValueLabel(edge);
    const srcTag = isReal
      ? `<span class="odds-src-tag">${bk}</span>`
      : `<span class="odds-src-tag model">Model</span>`;
    html += `<tr>
      <td class="match-cell"><strong>${teamName}</strong></td>
      <td>${m.homeName} vs ${m.awayName}</td>
      <td>${fmtDate(m.utcDate)} · ${fmtTime(m.utcDate)} ET</td>
      <td>${stageLabel(m.stage)} ${groupLabel(m.group)}</td>
      <td class="num">${odd.toFixed(2)} ${srcTag}</td>
      <td class="num">${(1/prob).toFixed(2)}</td>
      <td class="num edge-cell ${cls}">${edge >= 0 ? '+' : ''}${(edge * 100).toFixed(1)}%</td>
      <td><span class="val-tag ${cls}">${label}</span></td>
    </tr>`;
  });

  html += `</tbody></table>`;
  return html;
}

// ─── RENDER: TEAMS ────────────────────────────────────────────────────────────

function renderTeams() {
  const sorted = Object.entries(RATINGS).sort((a, b) => b[1].r - a[1].r);
  let html = `<div class="teams-grid">`;
  sorted.forEach(([id, t], i) => {
    const squad = getSquad(parseInt(id));
    const wcOdds = WIN_ODDS[id];
    const fixtures = WC_MATCHES.filter(m => m.homeId == id || m.awayId == id);
    const played = fixtures.filter(m => m.status === 'FINISHED');
    const wins = played.filter(m => (m.homeId == id && m.winner === 'HOME_TEAM') || (m.awayId == id && m.winner === 'AWAY_TEAM')).length;
    const teamSquad = WC_SQUADS.find(s => s.id == id);

    html += `
      <div class="team-card" onclick="goToBetting(${id})">
        <div class="tc-rank">#${i+1}</div>
        ${teamSquad ? `<img src="${teamSquad.crest}" class="tc-crest" onerror="this.style.display='none'">` : `<span class="tc-flag">${t.flag}</span>`}
        <div class="tc-info">
          <div class="tc-name">${t.name}</div>
          <div class="tc-group">Group ${GROUP_MAP[id] || '?'}</div>
        </div>
        <div class="tc-rating">
          <div class="rating-track"><div class="rating-fill" style="width:${t.r}%"></div></div>
          <span class="rating-num">${t.r}</span>
        </div>
        <div class="tc-stats">
          <div class="tc-stat"><span class="ts-v">${played.length}/${fixtures.length}</span><span class="ts-l">Played</span></div>
          <div class="tc-stat"><span class="ts-v">${wins}</span><span class="ts-l">Wins</span></div>
          ${wcOdds ? `<div class="tc-stat"><span class="ts-v">${wcOdds}x</span><span class="ts-l">Win WC</span></div>` : ''}
        </div>
      </div>`;
  });
  html += `</div>`;
  document.getElementById('teams-content').innerHTML = html;
}

// ─── RENDER: SQUADS ───────────────────────────────────────────────────────────

function renderSquads() {
  const search = (document.getElementById('squad-search')?.value || '').toLowerCase();
  const sorted = [...WC_SQUADS].sort((a, b) => {
    const ra = RATINGS[a.id]?.r ?? 50;
    const rb = RATINGS[b.id]?.r ?? 50;
    return rb - ra;
  });

  let html = '';
  sorted.forEach(team => {
    const players = search
      ? team.squad.filter(p => p.name.toLowerCase().includes(search) || (p.nationality || '').toLowerCase().includes(search))
      : team.squad;
    if (!players.length) return;

    const rt = RATINGS[team.id] || {};
    html += `
      <div class="squad-block">
        <div class="squad-block-header" onclick="goToBetting(${team.id})">
          <img src="${team.crest}" class="sb-crest" onerror="this.style.display='none'">
          <span class="sb-name">${team.name}</span>
          <span class="sb-rating">Rating ${rt.r ?? '?'}</span>
          <span class="sb-count">${players.length} players</span>
        </div>
        <div class="squad-block-players">
          ${players.map(p => {
            const pos = p.position || 'Unknown';
            const posCls = { Goalkeeper: 'pos-gk', Defence: 'pos-def', Midfield: 'pos-mid', Offence: 'pos-fwd' }[pos] || 'pos-unk';
            return `<div class="player-row">
              <span class="pos-badge ${posCls}">${pos === 'Goalkeeper' ? 'GK' : pos === 'Defence' ? 'DEF' : pos === 'Midfield' ? 'MID' : pos === 'Offence' ? 'FWD' : '?'}</span>
              <span class="pr-name">${p.name}</span>
              <span class="pr-age">${calcAge(p.dob)}</span>
              <span class="pr-nat">${p.nat || ''}</span>
            </div>`;
          }).join('')}
        </div>
      </div>`;
  });

  document.getElementById('squads-content').innerHTML = html || '<p class="no-results">No players match that search.</p>';
}

// ─── NAVIGATION ───────────────────────────────────────────────────────────────

function setTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.toggle('active', p.id === `pane-${tab}`));
  if (tab === 'fixtures')  renderFixtures();
  if (tab === 'standings') renderStandings();
  if (tab === 'betting')   renderBettingEngine();
  if (tab === 'teams')     renderTeams();
  if (tab === 'squads')    renderSquads();
}

function setStageFilter(stage) {
  filterStage = stage;
  filterGroup = 'all';
  document.querySelectorAll('.stage-btn').forEach(b => b.classList.toggle('active', b.dataset.stage === stage));
  document.querySelectorAll('.group-btn').forEach(b => b.classList.toggle('active', b.dataset.group === 'all'));
  renderFixtures();
}

function setGroupFilter(group) {
  filterGroup = group;
  filterStage = 'GROUP_STAGE';
  document.querySelectorAll('.stage-btn').forEach(b => b.classList.toggle('active', b.dataset.stage === 'GROUP_STAGE'));
  document.querySelectorAll('.group-btn').forEach(b => b.classList.toggle('active', b.dataset.group === group));
  renderFixtures();
}

function selectTeam(id) {
  selectedTeamId = id;
  renderBettingEngine();
}

function goToBetting(id) {
  selectedTeamId = id;
  setTab('betting');
}

function toggleMatchDetail(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function showTeamPanel(id) {
  goToBetting(id);
}

// ─── INIT ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Pre-build standings (populates GROUP_MAP)
  standings = buildStandings();
  setTab('fixtures');

  // Live clock
  const el = document.getElementById('header-date');
  if (el) el.textContent = new Date().toLocaleDateString('en-GB', { weekday:'short', day:'2-digit', month:'short', year:'numeric' });
});
