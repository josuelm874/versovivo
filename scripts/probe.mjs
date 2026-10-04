import { chromium } from '@playwright/test';
const b = await chromium.connectOverCDP('http://localhost:9222'); const p = b.contexts()[0].pages()[0];
console.log(await p.evaluate(() => ({
  thumbs: [...document.querySelectorAll('.tl-slide-thumb')].map(i => [i.complete, i.naturalWidth, i.src.slice(0, 30)]),
  mode: S.mode, idx: S.idx, rec: S.recording, imgs: S.imgs.length,
  cv: (() => { const c = document.getElementById('cv'); const d = c.getContext('2d').getImageData(c.width/2|0, c.height/3|0, 1, 1).data; return [c.width, c.height, [...d]]; })(),
})));
await b.close();
