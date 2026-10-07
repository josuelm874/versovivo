// Mede na WebView se a intro tocou: instala observador, o chamador troca de app (adb), e relê o log.
import { chromium } from '@playwright/test';
const mode = process.argv[2];
const b = await chromium.connectOverCDP('http://localhost:9222'); const p = b.contexts()[0].pages()[0];
if (mode === 'arm') {
  await p.evaluate(() => { window.__intro = []; const boot = document.getElementById('boot');
    new MutationObserver(() => window.__intro.push([Date.now(), boot.style.display, boot.style.opacity])).observe(boot, { attributes: true, attributeFilter: ['style'] });
    window.__vis = []; document.addEventListener('visibilitychange', () => window.__vis.push([Date.now(), document.visibilityState])); });
  console.log('armed', await p.evaluate(() => ({ last: Number(localStorage.getItem('versovivo-last-active')), now: Date.now() })));
} else {
  console.log(JSON.stringify(await p.evaluate(() => ({ events: window.__intro, vis: window.__vis, boot: getComputedStyle(document.getElementById('boot')).display, lastAgeS: (Date.now() - Number(localStorage.getItem('versovivo-last-active'))) / 1000 }))));
}
await b.close();
