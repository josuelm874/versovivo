import { ssimAt } from './analyze-video.mjs';
import fs from 'node:fs';
const [,, id, w, h] = process.argv; const D = 'qa-results/device/';
const refs = fs.readdirSync(D).filter(f => f.startsWith(id + '_ref_')).map(f => ({ t: +f.match(/_ref_([\d.]+)\.png/)[1], png: D + f }));
for (const r of refs) {
  const row = [];
  for (let d = -0.30; d <= 0.301; d += 0.05) { const s = ssimAt(D + id + '.mp4', Math.max(0, r.t + d), r.png, +w, +h).ssim; row.push([+d.toFixed(2), s]); }
  const best = row.reduce((a, b) => (b[1] > a[1] ? b : a));
  console.log(`t=${r.t}s  melhor deslocamento=${best[0]}s (SSIM ${best[1]})  | em 0: ${row.find(x => Math.abs(x[0]) < 1e-6)[1]}`);
}
