export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { endpoint, symbol, interval, limit, category } = req.query;
  if (!endpoint) return res.status(400).json({ error: 'Missing endpoint' });

  const params = new URLSearchParams();
  if (symbol)   params.set('symbol', symbol);
  if (interval) params.set('interval', interval);
  if (limit)    params.set('limit', limit);
  if (category) params.set('category', category);
  else          params.set('category', 'spot');

  const url = `https://api.bybit.com/v5/market/${endpoint}?${params.toString()}`;

  try {
    const response = await fetch(url);
    const text = await response.text();
    const data = JSON.parse(text);
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message, url });
  }
}
