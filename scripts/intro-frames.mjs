// Captura quadros da intro (navegador, viewport de celular) p/ conferência visual
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
const OUT = 'test-results/intro'; mkdirSync(OUT, { recursive: true });
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 412, height: 892 }, deviceScaleFactor: 2 })).newPage();
await p.addInitScript(() => { localStorage.removeItem('versovivo-last-active'); localStorage.removeItem('versovivo-skip-boot'); });
await p.goto('http://localhost:4173/', { waitUntil: 'load' });
const times = [0.25, 0.7, 1.2, 1.7, 2.2, 2.7, 3.2, 3.6, 4.0, 4.2, 4.6];
const start = Date.now();
for (const s of times) { const wait = s * 1000 - (Date.now() - start); if (wait > 0) await p.waitForTimeout(wait); await p.screenshot({ path: `${OUT}/f_${String(s).replace('.', '_')}.png` }); }
console.log(JSON.stringify(await p.evaluate(() => ({ boot: getComputedStyle(document.getElementById('boot')).display, home: document.getElementById('home').classList.contains('on') }))));
await b.close();
