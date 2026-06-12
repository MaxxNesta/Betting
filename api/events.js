export default async function handler(req, res) {
  const { fixture } = req.query;
  if (!fixture) return res.status(400).json({ error: 'fixture param required' });

  const r = await fetch(`https://v3.football.api-sports.io/fixtures/events?fixture=${fixture}`, {
    headers: { 'x-apisports-key': process.env.AF_API_KEY },
  });
  const data = await r.json();
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
  res.status(200).json(data);
}
