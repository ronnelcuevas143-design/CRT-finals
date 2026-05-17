export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { type, id, days, vs_currency, symbol } = req.query;

  try {
    let url;

    if (type === 'ohlc') {
      // OHLC candle data
      url = `https://api.coingecko.com/api/v3/coins/${id}/ohlc?vs_currency=${vs_currency || 'usd'}&days=${days || 1}`;
    } else if (type === 'ticker') {
      // Price + 24h change
      url = `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`;
    } else if (type === 'search') {
      // Search coin by symbol
      url = `https://api.coingecko.com/api/v3/search?query=${symbol}`;
    } else if (type === 'market') {
      // Top coins by volume
      url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=50&page=1`;
    } else {
      return res.status(400).json({ error: 'Invalid type' });
    }

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: `CoinGecko error: ${response.status}`, detail: text });
    }

    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
