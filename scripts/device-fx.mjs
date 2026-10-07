// Renderiza cada transição/filtro NO APARELHO (WebView) e salva PNGs em test-results/device/fx/
// Requer: adb forward tcp:9222 localabstract:webview_devtools_remote_<pid>
import { chromium } from '@playwright/test';
import { readdirSync, writeFileSync, mkdirSync } from 'node:fs';
const OUT = 'test-results/device/fx'; mkdirSync(OUT, { recursive: true });
const imgs = readdirSync('test-media').filter(f => /\.(jpe?g|png)$/.test(f)).map(f => `test-media/${f}`);
const b = await chromium.connectOverCDP('http://localhost:9222');
const page = b.contexts()[0].pages()[0];
page.on('dialog', d => d.accept().catch(() => {}));
await page.evaluate(() => { localStorage.setItem('versovivo-skip-boot', '1'); localStorage.removeItem('versovivo-project'); });
await page.reload({ waitUntil: 'load' });
await page.locator('.new-proj').click();
await page.waitForFunction(() => document.getElementById('editor')?.classList.contains('on'));
await page.setInputFiles('#img-input', imgs);
await page.waitForFunction(() => S.imgs.length >= 4, null, { timeout: 30000 });
await page.waitForTimeout(1500);

const render = (cfg) => page.evaluate((cfg) => {
  Object.assign(S, { transition: 'fade', filter: 'none', dim: 0, kenBurns: true }, cfg.state);
  const c = document.createElement('canvas'); c.width = 270; c.height = 480;
  const x = c.getContext('2d');
  drawMedia(x, 270, 480, { idx: 1, prevIdx: 0, fadeT: cfg.fadeT ?? 1, holdT: 0.2, prevHoldT: 0.9 });
  return c.toDataURL('image/png');
}, cfg);

const save = (name, url) => writeFileSync(`${OUT}/${name}.png`, Buffer.from(url.split(',')[1], 'base64'));
const results = {};
for (const tr of ['fade', 'slide', 'zoom', 'wipe']) save(`tr_${tr}`, await render({ state: { transition: tr }, fadeT: 0.5 }));
for (const f of ['none', 'warm', 'cool', 'bw', 'vintage', 'vivid']) save(`filter_${f}`, await render({ state: { filter: f } }));
for (const d of [0, 0.3, 0.6]) save(`dim_${Math.round(d * 100)}`, await render({ state: { dim: d } }));
// pixel check: P&B tem R==G==B; dim 0.6 escurece
results.bwGray = await page.evaluate(() => {
  S.filter = 'bw'; S.dim = 0; const c = document.createElement('canvas'); c.width = 60; c.height = 100; const x = c.getContext('2d');
  drawMedia(x, 60, 100, { idx: 1, prevIdx: 1, fadeT: 1, holdT: 0 });
  const d = x.getImageData(30, 50, 1, 1).data; return [...d];
});
results.dimLuma = await page.evaluate(() => {
  const luma = (dim) => { S.filter = 'none'; S.dim = dim; const c = document.createElement('canvas'); c.width = 60; c.height = 100; const x = c.getContext('2d');
    drawMedia(x, 60, 100, { idx: 1, prevIdx: 1, fadeT: 1, holdT: 0 }); const d = x.getImageData(0, 0, 60, 100).data; let s = 0;
    for (let i = 0; i < d.length; i += 4) s += d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11; return s / (d.length / 4); };
  return { d0: luma(0), d60: luma(0.6) };
});
console.log(JSON.stringify(results));
writeFileSync(`${OUT}/results.json`, JSON.stringify(results, null, 1));
await b.close();
