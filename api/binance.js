<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CRT Analyzer</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root {
  --bg: #05070d;
  --surface: #0b0f1a;
  --border: #1a2332;
  --accent: #00e5ff;
  --bull: #00ff9d;
  --bear: #ff4466;
  --warn: #ffb700;
  --text: #dce8f5;
  --muted: #4d6070;
  --muted2: #7a9ab0;
}
* { margin:0; padding:0; box-sizing:border-box; }
body {
  background: var(--bg);
  color: var(--text);
  font-family: 'DM Sans', sans-serif;
  min-height: 100vh;
  padding-bottom: 60px;
}
body::before {
  content:''; position:fixed; inset:0;
  background:
    radial-gradient(ellipse 60% 40% at 80% 10%, rgba(0,229,255,0.05) 0%, transparent 70%),
    radial-gradient(ellipse 40% 30% at 10% 80%, rgba(0,255,157,0.03) 0%, transparent 60%);
  pointer-events:none; z-index:0;
}
.wrap { max-width:860px; margin:0 auto; padding:28px 16px; position:relative; z-index:1; }

.logo { font-family:'Bebas Neue',sans-serif; font-size:32px; letter-spacing:4px; color:var(--accent); line-height:1; }
.logo-sub { font-family:'DM Mono',monospace; font-size:9px; letter-spacing:3px; color:var(--muted); text-transform:uppercase; margin-top:4px; margin-bottom:24px; }

.search-box { display:flex; gap:10px; margin-bottom:16px; flex-wrap:wrap; }
.coin-input {
  flex:1; min-width:180px; background:var(--surface); border:1px solid var(--border);
  border-radius:6px; padding:13px 16px; font-family:'DM Mono',monospace; font-size:15px;
  color:var(--text); letter-spacing:2px; text-transform:uppercase; outline:none; transition:border-color 0.2s;
}
.coin-input::placeholder { color:var(--muted); text-transform:none; letter-spacing:1px; font-size:13px; }
.coin-input:focus { border-color:var(--accent); }
.analyze-btn {
  background:var(--accent); color:#000; border:none; border-radius:6px;
  padding:13px 28px; font-family:'DM Sans',sans-serif; font-size:13px;
  font-weight:700; letter-spacing:1px; cursor:pointer; text-transform:uppercase;
  transition:opacity 0.2s, transform 0.1s;
}
.analyze-btn:hover { opacity:0.85; }
.analyze-btn:active { transform:scale(0.98); }
.analyze-btn:disabled { opacity:0.4; cursor:not-allowed; }

.quick-picks { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:28px; align-items:center; }
.quick-label { font-size:10px; color:var(--muted); letter-spacing:2px; text-transform:uppercase; margin-right:4px; }
.qbtn {
  font-family:'DM Mono',monospace; font-size:11px; padding:5px 12px;
  border:1px solid var(--border); background:var(--surface); color:var(--muted2);
  border-radius:4px; cursor:pointer; letter-spacing:1px; transition:all 0.15s;
}
.qbtn:hover, .qbtn.active { border-color:var(--accent); color:var(--accent); }

.loading { display:none; flex-direction:column; align-items:center; gap:14px; padding:60px 20px; }
.spinner {
  width:36px; height:36px; border:2px solid var(--border);
  border-top-color:var(--accent); border-radius:50%; animation:spin 0.7s linear infinite;
}
@keyframes spin { to { transform:rotate(360deg); } }
.loading-msg { font-family:'DM Mono',monospace; font-size:11px; color:var(--muted); letter-spacing:2px; }

.error-box {
  display:none; background:rgba(255,68,102,0.08); border:1px solid rgba(255,68,102,0.3);
  border-radius:6px; padding:16px 20px; font-size:13px; color:var(--bear);
  text-align:center; margin-bottom:16px;
}

.results { display:none; }

.coin-header {
  display:flex; align-items:center; justify-content:space-between;
  flex-wrap:wrap; gap:12px; margin-bottom:20px;
  padding:16px 20px; background:var(--surface); border:1px solid var(--border); border-radius:8px;
}
.coin-title { font-family:'Bebas Neue',sans-serif; font-size:26px; letter-spacing:3px; }
.coin-price { font-family:'DM Mono',monospace; font-size:22px; font-weight:500; color:var(--accent); }
.coin-change { font-family:'DM Mono',monospace; font-size:13px; padding:4px 10px; border-radius:4px; }
.coin-change.up { background:rgba(0,255,157,0.1); color:var(--bull); }
.coin-change.down { background:rgba(255,68,102,0.1); color:var(--bear); }

.overall-signal {
  padding:20px; border-radius:8px; margin-bottom:20px; border:1px solid; text-align:center;
  animation:popIn 0.4s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes popIn { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
.overall-signal.bull { background:rgba(0,255,157,0.06); border-color:rgba(0,255,157,0.3); }
.overall-signal.bear { background:rgba(255,68,102,0.06); border-color:rgba(255,68,102,0.3); }
.overall-signal.forming { background:rgba(255,183,0,0.06); border-color:rgba(255,183,0,0.3); }
.overall-signal.none { background:rgba(74,96,112,0.08); border-color:var(--border); }
.signal-icon { font-size:36px; margin-bottom:6px; }
.signal-title { font-family:'Bebas Neue',sans-serif; font-size:22px; letter-spacing:3px; margin-bottom:4px; }
.signal-title.bull { color:var(--bull); }
.signal-title.bear { color:var(--bear); }
.signal-title.forming { color:var(--warn); }
.signal-title.none { color:var(--muted2); }
.signal-desc { font-size:12px; color:var(--muted2); }

.stats-row { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:20px; }
.stat-card { background:var(--surface); border:1px solid var(--border); border-radius:6px; padding:12px 14px; text-align:center; }
.stat-lbl { font-size:9px; color:var(--muted); letter-spacing:2px; text-transform:uppercase; margin-bottom:6px; }
.stat-val { font-family:'Bebas Neue',sans-serif; font-size:22px; letter-spacing:1px; }

.tf-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:20px; }
@media(max-width:600px){ .tf-grid{grid-template-columns:1fr;} }

.tf-card {
  background:var(--surface); border:1px solid var(--border); border-radius:8px; overflow:hidden;
  animation:slideUp 0.4s ease forwards; opacity:0;
}
@keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
.tf-card:nth-child(1){animation-delay:0.05s}
.tf-card:nth-child(2){animation-delay:0.12s}
.tf-card:nth-child(3){animation-delay:0.19s}
.tf-card.bull{border-color:rgba(0,255,157,0.25)}
.tf-card.bear{border-color:rgba(255,68,102,0.25)}
.tf-card.forming{border-color:rgba(255,183,0,0.25)}

.tf-card-header {
  display:flex; align-items:center; justify-content:space-between;
  padding:12px 14px 10px; border-bottom:1px solid var(--border);
}
.tf-label { font-family:'Bebas Neue',sans-serif; font-size:18px; letter-spacing:2px; color:var(--muted2); }
.tf-signal-badge {
  font-family:'DM Mono',monospace; font-size:9px; letter-spacing:1px;
  padding:4px 8px; border-radius:3px; font-weight:500; text-transform:uppercase;
}
.tf-signal-badge.bull{background:rgba(0,255,157,0.15);color:var(--bull)}
.tf-signal-badge.bear{background:rgba(255,68,102,0.15);color:var(--bear)}
.tf-signal-badge.forming{background:rgba(255,183,0,0.15);color:var(--warn)}
.tf-signal-badge.none{background:rgba(74,96,112,0.15);color:var(--muted2)}

.mini-chart { padding:8px 14px 4px; }
.mini-chart canvas { width:100%; height:80px; display:block; }

.checklist { padding:10px 14px 14px; }
.check-item {
  display:flex; align-items:flex-start; gap:8px; padding:5px 0; font-size:11px;
  color:var(--muted2); border-bottom:1px solid rgba(30,35,50,0.5); line-height:1.4;
}
.check-item:last-child{border-bottom:none}
.check-icon{font-size:12px;flex-shrink:0;margin-top:1px}
.check-item.pass{color:var(--text)}
.check-val{margin-left:auto;font-family:'DM Mono',monospace;font-size:10px;color:var(--muted2);flex-shrink:0}

.edu-box { background:var(--surface); border:1px solid var(--border); border-radius:8px; padding:18px 20px; margin-bottom:20px; }
.edu-title { font-family:'Bebas Neue',sans-serif; font-size:16px; letter-spacing:2px; color:var(--muted2); margin-bottom:12px; }
.edu-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
@media(max-width:500px){.edu-grid{grid-template-columns:1fr}}
.edu-item { padding:12px; border-radius:6px; font-size:11px; line-height:1.6; color:var(--muted2); }
.edu-item.bull{background:rgba(0,255,157,0.05);border:1px solid rgba(0,255,157,0.1)}
.edu-item.bear{background:rgba(255,68,102,0.05);border:1px solid rgba(255,68,102,0.1)}
.edu-item-title{font-weight:700;font-size:12px;margin-bottom:6px}
.edu-item.bull .edu-item-title{color:var(--bull)}
.edu-item.bear .edu-item-title{color:var(--bear)}

.ts { font-family:'DM Mono',monospace; font-size:10px; color:var(--muted); text-align:right; margin-top:10px; letter-spacing:1px; }
.disclaimer { font-size:10px; color:var(--muted); text-align:center; margin-top:20px; line-height:1.7; padding:12px; border-top:1px solid var(--border); }
</style>
</head>
< truncated lines 174-359 >
    { label:'Closed below midpoint',   pass:closedBelowMid,  val:`mid: ${formatPrice(rangeMid)}` },
    { label:'Red (bearish) candle',    pass:redCandle,       val:redCandle?'✓ red':'✗ green' },
    { label:'Large upper wick',        pass:bigUpperWick,    val:`${(upperWickPct*100).toFixed(0)}% of range` },
    { label:'Volume above average',    pass:volumeSpike,     val:volumeSpike?'✓ strong':'✗ weak' },
    { label:'Closed below prev close', pass:closedBelowPrev, val:closedBelowPrev?'✓':'✗' },
  ];

  return {
    signal, bullScore, bearScore,
    checks: signal === 'bear' ? bearChecks : bullChecks,
    rangeMid, rangeHigh, rangeLow
  };
}

function computeOverall(analyses) {
  const w = [1, 1.5, 2];
  let bull=0, bear=0, form=0;
  analyses.forEach((a,i) => {
    if      (a.signal==='bull')    bull += w[i];
    else if (a.signal==='bear')    bear += w[i];
    else if (a.signal==='forming') form += w[i];
  });
  if (bull > bear && bull >= 2) return 'bull';
  if (bear > bull && bear >= 2) return 'bear';
  if (form > 0 || bull > 0 || bear > 0) return 'forming';
  return 'none';
}

function drawChart(id, candles, analysis) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth || 200;
  const H = 80;
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W+'px'; canvas.style.height = H+'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const display = candles.slice(-20);
  const maxP = Math.max(...display.map(c=>c.h));
  const minP = Math.min(...display.map(c=>c.l));
  const range = maxP - minP || 1;
  const pad = {t:6,b:6,l:2,r:2};
  const cW = W-pad.l-pad.r, cH = H-pad.t-pad.b;
  const toY = p => pad.t + cH - ((p-minP)/range)*cH;
  const gap = cW/display.length;
  const bw = Math.max(2, gap*0.6);

  if (analysis && analysis.rangeMid) {
    const my = toY(analysis.rangeMid);
    ctx.beginPath(); ctx.setLineDash([3,3]);
    ctx.strokeStyle='rgba(255,183,0,0.5)'; ctx.lineWidth=1;
    ctx.moveTo(pad.l,my); ctx.lineTo(W-pad.r,my);
    ctx.stroke(); ctx.setLineDash([]);
  }

  display.forEach((c,i) => {
    const x = pad.l + i*gap + gap/2;
    const isLast = i===display.length-1;
    const isCRT  = i===display.length-2;
    const isBull = c.c >= c.o;
    let color;
    if (isLast) color='rgba(255,255,255,0.2)';
    else if (isCRT && analysis) {
      color = analysis.signal==='bull'?'#00ff9d':analysis.signal==='bear'?'#ff4466':'rgba(255,183,0,0.9)';
    } else {
      color = isBull?'rgba(0,255,157,0.55)':'rgba(255,68,102,0.55)';
    }
    ctx.strokeStyle=color; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(x,toY(c.h)); ctx.lineTo(x,toY(c.l)); ctx.stroke();
    const oY=toY(c.o), cY=toY(c.c);
    ctx.fillStyle=color;
    ctx.fillRect(x-bw/2, Math.min(oY,cY), bw, Math.max(1,Math.abs(oY-cY)));
  });
}

function renderTFCard(tf, analysis) {
  const labels = {bull:'🟢 BULL CRT',bear:'🔴 BEAR CRT',forming:'🟡 FORMING',none:'— NO SIGNAL'};
  const checksHtml = analysis.checks.map(ch => `
    <div class="check-item ${ch.pass?'pass':'fail'}">
      <span class="check-icon">${ch.pass?'✅':'☐'}</span>
      <span>${ch.label}</span>
      <span class="check-val">${ch.val}</span>
    </div>`).join('');
  return `
    <div class="tf-card ${analysis.signal}">
      <div class="tf-card-header">
        <div class="tf-label">${tf.label}</div>
        <div class="tf-signal-badge ${analysis.signal}">${labels[analysis.signal]}</div>
      </div>
      <div class="mini-chart"><canvas id="chart-${tf.key}"></canvas></div>
      <div class="checklist">${checksHtml}</div>
    </div>`;
}

let storedCandles = [];

async function analyze() {
  const raw = document.getElementById('coinInput').value.trim().toUpperCase();
  if (!raw) return;
  const symbol = raw.endsWith('USDT') ? raw : raw+'USDT';

  document.getElementById('loading').style.display='flex';
  document.getElementById('results').style.display='none';
  document.getElementById('errorBox').style.display='none';
  document.getElementById('analyzeBtn').disabled=true;

  try {
    document.getElementById('loadingMsg').textContent='Fetching ticker...';
    const ticker = await fetchTicker(symbol);

    document.getElementById('loadingMsg').textContent='Fetching candles (1H, 4H, Daily)...';
    storedCandles = await Promise.all(
      INTERVALS.map(tf => fetchCandles(symbol, tf.bybit, tf.limit))
    );

    const analyses = storedCandles.map(detectCRT);
    const overall  = computeOverall(analyses);

    const price = parseFloat(ticker.lastPrice);
    const chg   = parseFloat(ticker.price24hPcnt) * 100;
    document.getElementById('coinTitle').textContent = symbol;
    document.getElementById('coinPrice').textContent = formatPrice(price);
    const chgEl = document.getElementById('coinChange');
    chgEl.textContent = (chg>=0?'+':'')+chg.toFixed(2)+'%';
    chgEl.className = 'coin-change '+(chg>=0?'up':'down');

    const icons  = {bull:'🟢',bear:'🔴',forming:'🟡',none:'⚪'};
    const titles = {bull:'BULL CRT DETECTED',bear:'BEAR CRT DETECTED',forming:'PATTERN FORMING',none:'NO CLEAR SIGNAL'};
    const descs  = {
      bull:'Multiple TFs showing bullish CRT. Smart money swept lows and reversed. Wait for entry confirmation.',
      bear:'Multiple TFs showing bearish CRT. Smart money swept highs and reversed. Wait for entry confirmation.',
      forming:'Pattern developing pa. Hindi pa tapos — hintayin ang candle close para ma-confirm.',
      none:'Walang malinaw na CRT pattern ngayon. Hanapin ang ibang coin o hintayin ang setup.',
    };
    const oEl = document.getElementById('overallSignal');
    oEl.className=`overall-signal ${overall}`;
    document.getElementById('overallIcon').textContent=icons[overall];
    const tEl = document.getElementById('overallTitle');
    tEl.textContent=titles[overall]; tEl.className=`signal-title ${overall}`;
    document.getElementById('overallDesc').textContent=descs[overall];

    const counts={bull:0,bear:0,forming:0};
    analyses.forEach(a=>{if(counts[a.signal]!==undefined)counts[a.signal]++;});
    document.getElementById('statBull').textContent=counts.bull;
    document.getElementById('statBear').textContent=counts.bear;
    document.getElementById('statForm').textContent=counts.forming;

    document.getElementById('tfGrid').innerHTML =
      INTERVALS.map((tf,i)=>renderTFCard(tf,analyses[i])).join('');

    document.getElementById('results').style.display='block';
    document.getElementById('loading').style.display='none';

    setTimeout(()=>{
      INTERVALS.forEach((tf,i)=>drawChart(`chart-${tf.key}`,storedCandles[i],analyses[i]));
    },100);

    document.getElementById('ts').textContent=`Analyzed: ${new Date().toLocaleString()} · Bybit Data`;

  } catch(err) {
    document.getElementById('loading').style.display='none';
    const el = document.getElementById('errorBox');
    el.style.display='block';
    el.textContent=`❌ ${err.message} — Try another coin symbol`;
  }
  document.getElementById('analyzeBtn').disabled=false;
}
</script>
</body>
</html>
