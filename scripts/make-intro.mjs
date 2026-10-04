// Gera os dados da intro "hello": PNG da palavra + ordem de escrita (caneta) ao longo do esqueleto do traço.
// Uso: node scripts/make-intro.mjs [palavra] [arquivo-fonte.woff2]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const WORD = process.argv[2] || 'VersoVivo';
const FONT = process.argv[3] || path.join(ROOT, 'assets/fonts', fs.readdirSync(path.join(ROOT, 'assets/fonts')).find(f => f.startsWith('Sacramento')));
const PAD = 28, STEP = 2;

// 1) renderiza a palavra (branco/alpha) num canvas grande e recorta
const b = await chromium.launch(); const pg = await b.newPage();
const fontB64 = fs.readFileSync(FONT).toString('base64');
await pg.setContent(`<style>@font-face{font-family:W;src:url(data:font/woff2;base64,${fontB64})}</style><canvas id=c width=3400 height=1000></canvas>`);
const out = await pg.evaluate(async ({ WORD, PAD }) => {
  await document.fonts.load('600px W');
  const c = document.getElementById('c'), x = c.getContext('2d', { willReadFrequently: true });
  x.font = '600px W'; x.fillStyle = '#fff'; x.textBaseline = 'alphabetic'; x.fillText(WORD, 120, 680);
  const { data, width, height } = x.getImageData(0, 0, c.width, c.height);
  let x0 = width, y0 = height, x1 = 0, y1 = 0;
  for (let j = 0; j < height; j++) for (let i = 0; i < width; i++) if (data[(j * width + i) * 4 + 3] > 8) { if (i < x0) x0 = i; if (i > x1) x1 = i; if (j < y0) y0 = j; if (j > y1) y1 = j; }
  const w = x1 - x0 + 1 + PAD * 2, h = y1 - y0 + 1 + PAD * 2;
  const o = document.createElement('canvas'); o.width = w; o.height = h;
  o.getContext('2d').drawImage(c, x0, y0, x1 - x0 + 1, y1 - y0 + 1, PAD, PAD, x1 - x0 + 1, y1 - y0 + 1);
  return { url: o.toDataURL('image/png'), w, h };
}, { WORD, PAD });
await b.close();
fs.mkdirSync(path.join(ROOT, 'assets/intro'), { recursive: true });
const png = Buffer.from(out.url.split(',')[1], 'base64');
fs.writeFileSync(path.join(ROOT, 'assets/intro/versovivo.png'), png);
const { w, h } = out;

// 2) máscara binária
const sharp = (await import('sharp')).default;
const raw = await sharp(png).ensureAlpha().raw().toBuffer();
const bin = new Uint8Array(w * h);
for (let i = 0; i < w * h; i++) bin[i] = raw[i * 4 + 3] > 127 ? 1 : 0;

// 3) transformada de distância (chamfer 3-4) para o raio local do traço
const INF = 1e9, dist = new Float32Array(w * h);
for (let i = 0; i < w * h; i++) dist[i] = bin[i] ? INF : 0;
for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) { const i = y * w + x; if (!bin[i]) continue; dist[i] = Math.min(dist[i], dist[i - 1] + 3, dist[i - w] + 3, dist[i - w - 1] + 4, dist[i - w + 1] + 4); }
for (let y = h - 2; y > 0; y--) for (let x = w - 2; x > 0; x--) { const i = y * w + x; if (!bin[i]) continue; dist[i] = Math.min(dist[i], dist[i + 1] + 3, dist[i + w] + 3, dist[i + w + 1] + 4, dist[i + w - 1] + 4); }

// 4) afinamento Zhang-Suen => esqueleto
const sk = Uint8Array.from(bin);
const rem = [];
for (let changed = true; changed;) {
  changed = false;
  for (let step = 0; step < 2; step++) {
    rem.length = 0;
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = y * w + x; if (!sk[i]) continue;
      const p2 = sk[i - w], p3 = sk[i - w + 1], p4 = sk[i + 1], p5 = sk[i + w + 1], p6 = sk[i + w], p7 = sk[i + w - 1], p8 = sk[i - 1], p9 = sk[i - w - 1];
      const B = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9; if (B < 2 || B > 6) continue;
      const A = (!p2 && p3) + (!p3 && p4) + (!p4 && p5) + (!p5 && p6) + (!p6 && p7) + (!p7 && p8) + (!p8 && p9) + (!p9 && p2);
      if (A !== 1) continue;
      if (step === 0) { if (p2 * p4 * p6) continue; if (p4 * p6 * p8) continue; } else { if (p2 * p4 * p8) continue; if (p2 * p6 * p8) continue; }
      rem.push(i);
    }
    for (const i of rem) sk[i] = 0;
    if (rem.length) changed = true;
  }
}

// 5) componentes conexos (8-viz) do esqueleto
const N8 = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
const comp = new Int32Array(w * h).fill(-1); const comps = [];
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
  const i = y * w + x; if (!sk[i] || comp[i] >= 0) continue;
  const id = comps.length, list = [i]; comp[i] = id;
  for (let k = 0; k < list.length; k++) { const c = list[k], cx = c % w, cy = (c / w) | 0; for (const [dx, dy] of N8) { const j = (cy + dy) * w + cx + dx; if (sk[j] && comp[j] < 0) { comp[j] = id; list.push(j); } } }
  comps.push(list);
}
const deg = (i) => { const cx = i % w, cy = (i / w) | 0; let n = 0; for (const [dx, dy] of N8) if (sk[(cy + dy) * w + cx + dx]) n++; return n; };

// 6) ordem de escrita: componentes grandes da esquerda p/ direita; pingos/pequenos por último.
//    Em cada componente, DFS que prefere seguir em frente (caneta contínua); ramos pendentes = caneta levantada.
const BIG = comps.filter(c => c.length > 60), SMALL = comps.filter(c => c.length <= 60);
const startOf = (list) => { const ends = list.filter(i => deg(i) <= 1); const pool = ends.length ? ends : list; return pool.reduce((a, b) => ((a % w) <= (b % w) ? a : b)); };
const ordered = [...BIG.sort((a, b) => (startOf(a) % w) - (startOf(b) % w)), ...SMALL.sort((a, b) => (startOf(a) % w) - (startOf(b) % w))];
const visitedOrder = []; const seen = new Uint8Array(w * h);
for (const list of ordered) {
  const s = startOf(list); const stack = [[s, 1, 0]]; seen[s] = 1; visitedOrder.push(s);
  while (stack.length) {
    const [c, hx, hy] = stack[stack.length - 1]; const cx = c % w, cy = (c / w) | 0;
    let best = -1, bs = -9, bd = null;
    for (const [dx, dy] of N8) { const j = (cy + dy) * w + cx + dx; if (!sk[j] || seen[j]) continue; const m = Math.hypot(dx, dy); const s2 = (dx * hx + dy * hy) / m; if (s2 > bs) { bs = s2; best = j; bd = [dx / m, dy / m]; } }
    if (best < 0) { stack.pop(); continue; }
    seen[best] = 1; visitedOrder.push(best); stack.push([best, bd[0], bd[1]]);
  }
}
const total = visitedOrder.length;
const pts = [];
visitedOrder.forEach((i, k) => { if (k % STEP === 0 || k === total - 1) pts.push([i % w, (i / w) | 0, +(k / (total - 1)).toFixed(4), +(dist[i] / 3 * 1.15 + 1.5).toFixed(1)]); });

fs.writeFileSync(path.join(ROOT, 'js/intro-data.js'),
  `/* gerado por scripts/make-intro.mjs — ordem de escrita (caneta) da palavra da intro */\nwindow.VVIntroData = ${JSON.stringify({ word: WORD, src: 'assets/intro/versovivo.png', w, h, pts })};\n`);
console.log(JSON.stringify({ w, h, comps: comps.length, big: BIG.length, small: SMALL.length, skeletonPx: total, points: pts.length }));
