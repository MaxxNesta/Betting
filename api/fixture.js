export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'id param required' });

  const r = await fetch(`https://v3.football.api-sports.io/fixtures?id=${id}`, {
    headers: { 'x-apisports-key': process.env.AF_API_KEY },
  });
  const data = await r.json();
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate');
  res.status(200).json(data);
}
