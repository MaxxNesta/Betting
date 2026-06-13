// ─── AI PREDICTION ENGINE ─────────────────────────────────────────────────────
// Generates human-readable match analysis from team data, ratings, odds, history

const WC_HISTORY = {
  // [teamId]: { titles, finals, semis, lastWC (year) }
  762: { titles: 3, finals: 5, semis: 6, last: 2022, note: 'reigning champions' },
  773: { titles: 2, finals: 3, semis: 6, last: 2022, note: '2018 winners, 2022 QF' },
  764: { titles: 5, finals: 7, semis: 11,last: 2022, note: '5-time world champions' },
  760: { titles: 1, finals: 2, semis: 4, last: 2022, note: '2010 winners, 2022 QF' },
  770: { titles: 1, finals: 1, semis: 2, last: 2022, note: '1966 winners, 2022 QF' },
  765: { titles: 0, finals: 1, semis: 3, last: 2022, note: '2022 QF' },
  8601:{ titles: 0, finals: 0, semis: 2, last: 2022, note: '2022 QF' },
  759: { titles: 4, finals: 8, semis: 13,last: 2022, note: '4-time winners' },
  805: { titles: 0, finals: 0, semis: 1, last: 2022, note: 'eliminated group stage 2022' },
  799: { titles: 0, finals: 0, semis: 2, last: 2022, note: '2022 runners-up' },
  815: { titles: 0, finals: 0, semis: 1, last: 2022, note: '2022 semi-finalists — biggest WC story' },
  758: { titles: 2, finals: 3, semis: 5, last: 2022, note: 'consistent contenders' },
  788: { titles: 0, finals: 0, semis: 1, last: 2022, note: '2022 QF' },
  771: { titles: 0, finals: 0, semis: 0, last: 2022, note: 'host nation, 2022 R16' },
  769: { titles: 0, finals: 0, semis: 0, last: 2022, note: 'host nation, 2022 group stage' },
  828: { titles: 0, finals: 0, semis: 0, last: 2022, note: 'host nation, first WC 2022' },
  766: { titles: 0, finals: 0, semis: 0, last: 2022, note: '2022 QF surprise' },
  772: { titles: 0, finals: 0, semis: 0, last: 2022, note: '2022 R16' },
};

const STRENGTHS = {
  762: ['world-class attack (Messi era rebuilt)', 'deep squad balance', 'tournament experience'],
  773: ['Mbappé-led pace', 'defensive discipline', 'big-game mentality'],
  764: ['explosive wingers (Vinicius, Raphinha)', 'midfield press', 'WC pedigree'],
  760: ['technical possession game', 'Yamal-Williams wing threat', 'high press'],
  770: ['physical midfield', 'set-piece threat', 'Kane aerial presence'],
  765: ['Ronaldo experience factor', 'attacking width', 'penalty box threat'],
  8601:['van Dijk leadership', 'directness', 'counter-attacking speed'],
  759: ['tactical flexibility', 'Musiala creativity', 'high defensive line'],
  815: ['elite defensive shape (5-4-1)', 'En-Nesyri headers', '2022 momentum'],
  818: ['James Rodriguez playmaking', 'physical presence', 'South American guile'],
  771: ['home support', 'Pulisic drive', 'athletic pressing'],
  769: ['Jiménez physical target', 'home advantage (host)', 'passionate support'],
  828: ['Davies pace on the left', 'David goals', 'youthful energy'],
  799: ['Modric experience', 'Kovacic midfield press', 'tournament resilience'],
};

const WEAKNESSES = {
  762: ['post-Messi transition question marks', 'aging midfield legs'],
  773: ['defensive fragility under sustained pressure', 'over-reliance on Mbappé'],
  764: ['centre-back uncertainty post-Thiago Silva', 'set-piece defending'],
  760: ['thin striker depth beyond Morata', 'vulnerable to counter'],
  770: ['slow build-up under pressure', 'set-piece concession'],
  765: ['Ronaldo age factor (41)', 'defensive shape when chasing'],
  8601:['Depay injury risk', 'lack of elite goalkeeper'],
  759: ['inconsistency in big moments', 'offensive transition gaps'],
  815: ['limited attacking options in KO rounds', 'long tournaments a test of depth'],
  818: ['defensive gaps on transition', 'away WC mentality'],
  771: ['inexperienced in WC knockout pressure', 'home burden'],
  769: ['squad red card risk (saw vs South Africa)', 'disciplinary issues'],
  828: ['knockout stage experience', 'mental pressure as co-host'],
  799: ['ageing starting XI', 'goal threat inconsistency'],
};

// ─── CORE ANALYSIS GENERATOR ──────────────────────────────────────────────────

function generateMatchAnalysis(m, odds) {
  const hRt = RATINGS[m.homeId] || { r: 55, name: m.homeName };
  const aRt = RATINGS[m.awayId] || { r: 55, name: m.awayName };
  const probs = calcTrueProb(m.homeId, m.awayId);
  const gap = hRt.r - aRt.r;

  const hHist = WC_HISTORY[m.homeId] || null;
  const aHist = WC_HISTORY[m.awayId] || null;
  const hStr  = STRENGTHS[m.homeId]  || [];
  const aStr  = STRENGTHS[m.awayId]  || [];
  const hWeak = WEAKNESSES[m.homeId] || [];
  const aWeak = WEAKNESSES[m.awayId] || [];

  // ── Verdict ───────────────────────────────────────────────────────────────
  let verdict, verdictSide, confidence;
  const absGap = Math.abs(gap);

  if (absGap >= 20) {
    verdict     = gap > 0 ? `${hRt.name} Win` : `${aRt.name} Win`;
    verdictSide = gap > 0 ? 'home' : 'away';
    confidence  = 'HIGH';
  } else if (absGap >= 10) {
    verdict     = gap > 0 ? `${hRt.name} Win` : `${aRt.name} Win`;
    verdictSide = gap > 0 ? 'home' : 'away';
    confidence  = 'MEDIUM-HIGH';
  } else if (absGap >= 5) {
    verdict     = gap > 0 ? `${hRt.name} or Draw` : `${aRt.name} or Draw`;
    verdictSide = gap > 0 ? 'home' : 'away';
    confidence  = 'MEDIUM';
  } else {
    verdict     = 'Too Close to Call';
    verdictSide = 'draw';
    confidence  = 'LOW';
  }

  // ── Confidence % ─────────────────────────────────────────────────────────
  const confPct = verdictSide === 'home' ? Math.round(probs.home * 100)
                : verdictSide === 'away' ? Math.round(probs.away * 100)
                : Math.round(probs.draw * 100);

  // ── Key Factors ───────────────────────────────────────────────────────────
  const factors = [];

  // Rating gap
  if (absGap >= 15)
    factors.push(`${gap > 0 ? hRt.name : aRt.name} carry a ${absGap}-point rating advantage — a significant quality gap at this level`);
  else if (absGap >= 8)
    factors.push(`${gap > 0 ? hRt.name : aRt.name} rated ${absGap} points higher — a meaningful edge, but not insurmountable`);
  else
    factors.push(`Ratings are within ${absGap} points — this is a genuinely competitive contest on paper`);

  // WC history
  if (hHist?.titles > 0)
    factors.push(`${hRt.name} are ${hHist.titles}-time world champions — WC tournament experience is unmatched`);
  if (aHist?.titles > 0)
    factors.push(`${aRt.name} bring ${aHist.titles} WC titles worth of big-match DNA`);
  if (hHist?.note)
    factors.push(`${hRt.name}: ${hHist.note}`);
  else if (aHist?.note)
    factors.push(`${aRt.name}: ${aHist.note}`);

  // Strengths
  if (hStr.length)
    factors.push(`${hRt.name} strengths — ${hStr.slice(0,2).join(', ')}`);
  if (aStr.length)
    factors.push(`${aRt.name} strengths — ${aStr.slice(0,2).join(', ')}`);

  // ── Risk factors ──────────────────────────────────────────────────────────
  const risks = [];
  if (hWeak.length) risks.push(`${hRt.name} risk: ${hWeak[0]}`);
  if (aWeak.length) risks.push(`${aRt.name} risk: ${aWeak[0]}`);
  if (absGap < 10)  risks.push('Close rating suggests either team can pinch a result on the day');

  // ── Bet Recommendation ────────────────────────────────────────────────────
  const recs = [];
  if (odds) {
    const homeEdge = calcEdge(probs.home, odds.home);
    const drawEdge = calcEdge(probs.draw, odds.draw);
    const awayEdge = calcEdge(probs.away, odds.away);

    const bestSide = [
      { side: 'home', label: `${m.homeName} Win`, odd: odds.home, edge: homeEdge, prob: probs.home },
      { side: 'draw', label: 'Draw',               odd: odds.draw, edge: drawEdge, prob: probs.draw },
      { side: 'away', label: `${m.awayName} Win`,  odd: odds.away, edge: awayEdge, prob: probs.away },
    ].sort((a, b) => b.edge - a.edge)[0];

    const src = odds.isReal ? odds.bk : 'Model';

    if (bestSide.edge > 0.15) {
      recs.push({
        rating: 'STRONG BET',
        cls: 'rec-strong',
        text: `Back **${bestSide.label}** @ ${bestSide.odd.toFixed(2)} (${src}). Model gives this ${(bestSide.prob*100).toFixed(0)}% — you're getting ${(bestSide.edge*100).toFixed(0)}% more value than the market implies. A clear edge.`,
      });
    } else if (bestSide.edge > 0.06) {
      recs.push({
        rating: 'VALUE BET',
        cls: 'rec-value',
        text: `Back **${bestSide.label}** @ ${bestSide.odd.toFixed(2)} (${src}). ${(bestSide.edge*100).toFixed(0)}% edge over implied probability. Worthwhile at this price.`,
      });
    } else if (bestSide.edge > 0) {
      recs.push({
        rating: 'SLIGHT LEAN',
        cls: 'rec-slight',
        text: `**${bestSide.label}** @ ${bestSide.odd.toFixed(2)} (${src}) offers a marginal ${(bestSide.edge*100).toFixed(0)}% edge. Only bet with stakes you're comfortable with — the market is close to fair.`,
      });
    } else {
      recs.push({
        rating: 'AVOID',
        cls: 'rec-avoid',
        text: `The market has priced this accurately or overpriced your edge. No clear value found — pass on this one or watch for line movement.`,
      });
    }
  }

  return { verdict, verdictSide, confidence, confPct, factors: factors.slice(0,4), risks, recs, probs, odds, hRt, aRt };
}

// ─── RENDER PREDICTION CARD ───────────────────────────────────────────────────

function renderPredictionCard(m, expanded = false) {
  if (!m.homeId || !m.awayId) return '';
  const odds = getMatchOdds(m);
  const a    = generateMatchAnalysis(m, odds);
  const af   = findAfFixture(m.homeName, m.awayName);
  const lu   = af ? getAfLineup(af.afId) : null;
  const isFinished = m.status === 'FINISHED';

  const confColor = { HIGH: 'conf-high', 'MEDIUM-HIGH': 'conf-mh', MEDIUM: 'conf-med', LOW: 'conf-low' }[a.confidence] || 'conf-low';

  return `
  <div class="pred-card ${expanded ? 'expanded' : ''}">
    <div class="pred-header" onclick="togglePredCard('pc-${m.id}')">
      <div class="pred-teams">
        <div class="pred-team-side">
          ${m.homeCrest ? `<img src="${m.homeCrest}" class="pred-crest" onerror="this.style.display='none'">` : ''}
          <span class="pred-tname">${m.homeName}</span>
          ${isFinished && m.winner==='HOME_TEAM' ? '<span class="pred-won">W</span>' : ''}
        </div>
        <div class="pred-score-mid">
          ${isFinished
            ? `<span class="pred-score">${m.scoreHome} – ${m.scoreAway}</span>`
            : `<span class="pred-vs">VS</span><span class="pred-time">${fmtTime(m.utcDate)}</span>`}
          <span class="pred-date">${fmtDate(m.utcDate)}</span>
        </div>
        <div class="pred-team-side right">
          ${isFinished && m.winner==='AWAY_TEAM' ? '<span class="pred-won">W</span>' : ''}
          <span class="pred-tname">${m.awayName}</span>
          ${m.awayCrest ? `<img src="${m.awayCrest}" class="pred-crest" onerror="this.style.display='none'">` : ''}
        </div>
      </div>
      <div class="pred-summary">
        <div class="pred-verdict ${a.verdictSide === 'home' ? 'verd-home' : a.verdictSide === 'away' ? 'verd-away' : 'verd-draw'}">
          ${a.verdict}
        </div>
        <div class="pred-conf ${confColor}">
          <span class="conf-label">${a.confidence}</span>
          <div class="conf-bar"><div class="conf-fill" style="width:${a.confPct}%"></div></div>
          <span class="conf-pct">${a.confPct}%</span>
        </div>
        ${a.recs.length ? `<div class="pred-rec-badge ${a.recs[0].cls}">${a.recs[0].rating}</div>` : ''}
        <span class="pred-expand-hint">▼</span>
      </div>
    </div>

    <div class="pred-body" id="pc-${m.id}" style="display:${expanded ? 'block' : 'none'}">

      <div class="pred-sections">
        <div class="pred-section">
          <div class="pred-sec-title">WIN PROBABILITY</div>
          <div class="pred-prob-rows">
            <div class="pred-prob-row">
              <span class="ppr-label">${m.homeName}</span>
              <div class="ppr-bar"><div class="ppr-fill home" style="width:${(a.probs.home*100).toFixed(0)}%"></div></div>
              <span class="ppr-pct">${(a.probs.home*100).toFixed(0)}%</span>
            </div>
            <div class="pred-prob-row">
              <span class="ppr-label">Draw</span>
              <div class="ppr-bar"><div class="ppr-fill draw" style="width:${(a.probs.draw*100).toFixed(0)}%"></div></div>
              <span class="ppr-pct">${(a.probs.draw*100).toFixed(0)}%</span>
            </div>
            <div class="pred-prob-row">
              <span class="ppr-label">${m.awayName}</span>
              <div class="ppr-bar"><div class="ppr-fill away" style="width:${(a.probs.away*100).toFixed(0)}%"></div></div>
              <span class="ppr-pct">${(a.probs.away*100).toFixed(0)}%</span>
            </div>
          </div>
          ${lu ? `<div class="pred-formations">
            <span class="form-tag">${lu.home.formation}</span>
            <span class="form-sep">vs</span>
            <span class="form-tag">${lu.away.formation}</span>
          </div>` : ''}
        </div>

        <div class="pred-section">
          <div class="pred-sec-title">KEY FACTORS</div>
          <ul class="pred-factors">
            ${a.factors.map(f => `<li>${f}</li>`).join('')}
          </ul>
        </div>

        <div class="pred-section">
          <div class="pred-sec-title">RISK FACTORS</div>
          <ul class="pred-risks">
            ${a.risks.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>
      </div>

      ${a.recs.length ? `
      <div class="pred-recommendation ${a.recs[0].cls}">
        <div class="rec-header">
          <span class="rec-badge">${a.recs[0].rating}</span>
          ${a.odds ? `<span class="rec-source">${a.odds.isReal ? a.odds.bk : 'Model odds'}</span>` : ''}
        </div>
        <p class="rec-text">${a.recs[0].text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>
        ${a.odds && !isFinished ? `
        <div class="rec-odds-row">
          <div class="rec-odd-item ${a.verdictSide === 'home' ? 'active' : ''}">
            <span class="roi-label">1 (${m.homeName})</span>
            <span class="roi-val">${a.odds.home.toFixed(2)}</span>
          </div>
          <div class="rec-odd-item ${a.verdictSide === 'draw' ? 'active' : ''}">
            <span class="roi-label">X (Draw)</span>
            <span class="roi-val">${a.odds.draw.toFixed(2)}</span>
          </div>
          <div class="rec-odd-item ${a.verdictSide === 'away' ? 'active' : ''}">
            <span class="roi-label">2 (${m.awayName})</span>
            <span class="roi-val">${a.odds.away.toFixed(2)}</span>
          </div>
        </div>` : ''}
      </div>` : ''}

    </div>
  </div>`;
}

// ─── RENDER PREDICTIONS TAB ───────────────────────────────────────────────────

function renderPredictions() {
  const upcoming = WC_MATCHES.filter(m => m.homeId && m.awayId && m.status !== 'FINISHED')
    .slice(0, 20);
  const recent   = WC_MATCHES.filter(m => m.status === 'FINISHED')
    .slice(-6).reverse();

  let html = `
    <div class="pred-page-header">
      <h2 class="pred-page-title">MATCH PREDICTIONS</h2>
      <p class="pred-page-sub">AI-driven analysis · Win probability · Bet recommendations · Real Bet365 odds where available</p>
    </div>`;

  if (upcoming.length) {
    html += `<div class="pred-section-label">UPCOMING MATCHES</div>`;
    html += upcoming.map(m => renderPredictionCard(m, false)).join('');
  }

  if (recent.length) {
    html += `<div class="pred-section-label" style="margin-top:32px">RECENT RESULTS</div>`;
    html += recent.map(m => renderPredictionCard(m, false)).join('');
  }

  document.getElementById('predictions-content').innerHTML = html;
}

function togglePredCard(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const open = el.style.display !== 'none';
  el.style.display = open ? 'none' : 'block';
  const hint = el.closest('.pred-card')?.querySelector('.pred-expand-hint');
  if (hint) hint.textContent = open ? '▼' : '▲';
}
