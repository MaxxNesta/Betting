// Fetches today's + yesterday's WC matches with live scores from football-data.org
// Called by the client on load and every 60s (30s when a match is IN_PLAY)

export default async function handler(req, res) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const fmt = d => d.toISOString().slice(0, 10);
  const dates = [fmt(yesterday), fmt(today)];

  try {
    const results = await Promise.all(
      dates.map(date =>
        fetch(`https://api.football-data.org/v4/competitions/WC/matches?dateFrom=${date}&dateTo=${date}`, {
          headers: { 'X-Auth-Token': process.env.FD_API_KEY },
        }).then(r => r.json())
      )
    );

    const matches = results.flatMap(r => r.matches || []).map(m => ({
      id:        m.id,
      utcDate:   m.utcDate,
      status:    m.status,
      homeId:    m.homeTeam.id,
      homeName:  m.homeTeam.name,
      homeTla:   m.homeTeam.tla,
      awayId:    m.awayTeam.id,
      awayName:  m.awayTeam.name,
      awayTla:   m.awayTeam.tla,
      scoreHome: m.score.fullTime.home,
      scoreAway: m.score.fullTime.away,
      winner:    m.score.winner,
      minute:    m.minute ?? null,
    }));

    const hasLive = matches.some(m => m.status === 'IN_PLAY' || m.status === 'PAUSED');
    res.setHeader('Cache-Control', hasLive ? 'no-store' : 's-maxage=30, stale-while-revalidate');
    res.status(200).json({ matches, hasLive, fetchedAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
