export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');

  const { type, symbol, token, chat_id, text, limit, aggregate } = req.query;

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
    const lim = limit || 60;

    if      (type === '1h')  url = `${BASE}/histohour?fsym=${sym}&tsym=USD&limit=${lim}`;
    else if (type === '4h')  url = `${BASE}/histohour?fsym=${sym}&tsym=USD&limit=${lim}&aggregate=4`;
    else if (type === '1d')  url = `${BASE}/histoday?fsym=${sym}&tsym=USD&limit=${lim}`;
    else if (type === '1w')  url = `${BASE}/histoday?fsym=${sym}&tsym=USD&limit=56&aggregate=7`;
    else if (type === '1mo') url = `${BASE}/histoday?fsym=${sym}&tsym=USD&limit=24&aggregate=30`;
    else if (type === 'price') url = `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${sym}&tsyms=USD`;
    else return res.status(400).json({ error: 'Invalid type' });

    response = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!response.ok) return res.status(response.status).json({ error: `API ${response.status}` });
    data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
