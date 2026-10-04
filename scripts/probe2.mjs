import { chromium } from '@playwright/test';
const b = await chromium.connectOverCDP('http://localhost:9222'); const p = b.contexts()[0].pages()[0];
console.log(JSON.stringify(await p.evaluate(() => {
  const c = document.createElement('canvas'); c.width = 1080; c.height = 1920; const x = c.getContext('2d', { alpha: false });
  const time = (fn, n = 8) => { const t = performance.now(); for (let i = 0; i < n; i++) fn(); return (performance.now() - t) / n; };
  const out = { mode: S.mode };
  S.enhanceVideos = true; out.withSharpen = time(() => drawMedia(x, 1080, 1920));
  S.enhanceVideos = false; out.noSharpen = time(() => drawMedia(x, 1080, 1920));
  out.text = time(() => drawAllTextLayers(x, 1080, 1920, false));
  S.filter = 'warm'; out.warmFilter = time(() => drawMedia(x, 1080, 1920)); S.filter = 'none';
  return out;
})));
await b.close();
