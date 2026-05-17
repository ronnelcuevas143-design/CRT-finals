export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');

  const { type, symbol, token, chat_id, text, limit } = req.query;

  try {
    let url, response, data;

    if (type === 'telegram') {
      url = `https://api.telegram.org/bot${token}/sendMessage`;
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id, text, parse_mode: 'HTML' })
      });
      return res.status(200).json(await response.json());
    }

    const sym = (symbol || 'BTC').toUpperCase();
    const BASE = 'https://min-api.cryptocompare.com/data/v2';

    if (type === 'ohlc_1h')  url = `${BASE}/histohour?fsym=${sym}&tsym=USD&limit=${limit||60}`;
    else if (type === 'ohlc_4h')  url = `${BASE}/histohour?fsym=${sym}&tsym=USD&limit=${limit||60}&aggregate=4`;
    else if (type === 'ohlc_1d')  url = `${BASE}/histoday?fsym=${sym}&tsym=USD&limit=${limit||60}`;
    else if (type === 'ohlc_1w')  url = `${BASE}/histoday?fsym=${sym}&tsym=USD&limit=${limit||52}&aggregate=7`;
    else if (type === 'ohlc_1mo') url = `${BASE}/histoday?fsym=${sym}&tsym=USD&limit=${limit||24}&aggregate=30`;
    else if (type === 'ticker')   url = `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${sym}&tsyms=USD`;
    else return res.status(400).json({ error: 'Invalid type' });

    response = await fetch(url, { headers: { 'Accept': 'application/json' } });
    data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
