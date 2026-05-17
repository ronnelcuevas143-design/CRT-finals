export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');

  const { type, id, days, vs_currency, symbol, token, chat_id, text } = req.query;

  try {
    let url, response, data;

    if (type === 'telegram') {
      if (!token || !chat_id || !text) return res.status(400).json({ error: 'Missing params' });
      url = `https://api.telegram.org/bot${token}/sendMessage`;
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id, text, parse_mode: 'HTML' })
      });
      data = await response.json();
      return res.status(200).json(data);
    }

    if (type === 'ohlc') {
      url = `https://api.coingecko.com/api/v3/coins/${id}/ohlc?vs_currency=${vs_currency||'usd'}&days=${days||1}`;
    } else if (type === 'ticker') {
      url = `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`;
    } else if (type === 'search') {
      url = `https://api.coingecko.com/api/v3/search?query=${symbol}`;
    } else {
      return res.status(400).json({ error: 'Invalid type' });
    }

    response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'x-cg-demo-api-key': 'CG-demo'
      }
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: `CoinGecko ${response.status}`, detail: text });
    }

    data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
