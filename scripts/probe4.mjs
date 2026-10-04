import { chromium } from '@playwright/test';
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 412, height: 892 }, deviceScaleFactor: 2 })).newPage();
await p.addInitScript(() => { localStorage.setItem('versovivo-skip-boot', '1'); });
await p.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
console.log(await p.evaluate(() => [...document.querySelectorAll('body *')].filter(e => { const s = getComputedStyle(e); return s.position === 'fixed' && s.display !== 'none'; }).map(e => e.tagName + '#' + e.id + '.' + e.className + ' z' + getComputedStyle(e).zIndex + ' ' + JSON.stringify(e.getBoundingClientRect().toJSON()).slice(0, 80))));
await p.addStyleTag({ content: '#home{background:var(--bg)!important}' });
await p.screenshot({ path: 'test-results/theme/d3.png', clip: { x: 0, y: 700, width: 412, height: 192 } });
await b.close();
