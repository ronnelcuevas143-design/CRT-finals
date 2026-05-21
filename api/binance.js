// api/binance.js  — Vercel Serverless Function
// Handles: CryptoCompare OHLCV, price, top coins, AND Telegram alerts
// Deploy this to: /api/binance.js in your repo root

const CC_KEY = process.env.CC_KEY || '';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { type, symbol, limit = 100, token, chat_id, text } = req.query;

  try {
    // ── Telegram Alert ─────────────────────────────────────────
    if (type === 'telegram') {
      if (!token || !chat_id || !text) {
        return res.status(400).json({ ok: false, description: 'Missing token, chat_id or text' });
      }
      const tgRes = await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id,
            text,
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
          }),
        }
      );
      const tgData = await tgRes.json();
      return res.status(200).json(tgData);
    }

    // ── Price (RAW) ─────────────────────────────────────────────
    if (type === 'price') {
      const url = `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${symbol}&tsyms=USD&api_key=${CC_KEY}`;
      const r   = await fetch(url);
      const d   = await r.json();
      return res.status(200).json(d);
    }

    // ── Top coins by market cap ─────────────────────────────────
    if (type === 'top') {
      const url = `https://min-api.cryptocompare.com/data/top/mktcapfull?limit=${limit}&tsym=USD&api_key=${CC_KEY}`;
      const r   = await fetch(url);
      const d   = await r.json();
      return res.status(200).json(d);
    }

    // ── Daily candles (for Monthly/Weekly/Daily logic) ──────────
    if (type === 'histoday' || type === 'histoday_weekly' || type === 'histoday_monthly') {
      // aggregate = how many days per candle
      const agg = type === 'histoday_monthly' ? 30 : type === 'histoday_weekly' ? 7 : 1;
      const url = `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${symbol}&tsym=USD&limit=${limit}&aggregate=${agg}&api_key=${CC_KEY}`;
      const r   = await fetch(url);
      const d   = await r.json();
      return res.status(200).json(d);
    }

    // ── Hourly candles (for 4H and 1H) ─────────────────────────
    if (type === 'histohour' || type === 'histohour_4h') {
      const agg = type === 'histohour_4h' ? 4 : 1;
      const url = `https://min-api.cryptocompare.com/data/v2/histohour?fsym=${symbol}&tsym=USD&limit=${limit}&aggregate=${agg}&api_key=${CC_KEY}`;
      const r   = await fetch(url);
      const d   = await r.json();
      return res.status(200).json(d);
    }

    return res.status(400).json({ error: `Unknown type: ${type}` });

  } catch (err) {
    console.error('[api/binance]', err);
    return res.status(500).json({ error: err.message });
  }
}
