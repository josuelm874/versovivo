import { chromium } from '@playwright/test';
import { readdirSync } from 'node:fs';
const imgs = readdirSync('test-media').filter(f => /\.jpe?g$/.test(f)).map(f => `test-media/${f}`);
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 412, height: 892 } })).newPage(); p.on('dialog', d => d.accept());
await p.addInitScript(() => { localStorage.setItem('versovivo-skip-boot', '1'); });
await p.goto('http://localhost:4173/', { waitUntil: 'networkidle' }); await p.locator('.new-proj').click(); await p.waitForFunction(() => document.getElementById('editor')?.classList.contains('on'), null, { timeout: 15000 });
await p.setInputFiles('#img-input', imgs); await p.waitForTimeout(2500);
console.log(JSON.stringify(await p.evaluate(() => {
  const out = {};
  for (const y of [790, 820, 850, 880]) { const e = document.elementFromPoint(100, y); out[y] = e ? e.tagName + '#' + e.id + '.' + e.className : null; }
  const tb = document.querySelector('.toolbar').getBoundingClientRect(); out.toolbar = [tb.top, tb.bottom, innerHeight];
  const mt = document.querySelector('.main-tb'); out.mainTb = [mt.scrollHeight, mt.clientHeight];
  out.lbl = getComputedStyle(document.querySelector('.tb .tb-lbl')).color;
  return out; })));
await b.close();
