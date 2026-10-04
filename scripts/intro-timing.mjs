import { chromium } from '@playwright/test';
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 412, height: 892 } })).newPage();
await p.addInitScript(() => {
  localStorage.removeItem('versovivo-last-active'); localStorage.removeItem('versovivo-skip-boot');
  window.__ev = [];
  document.addEventListener('DOMContentLoaded', () => {
    const boot = document.getElementById('boot');
    new MutationObserver(() => window.__ev.push([Math.round(performance.now()), boot.style.display, boot.style.opacity, document.getElementById('home').classList.contains('on')])).observe(boot, { attributes: true, attributeFilter: ['style'] });
  });
});
await p.goto('http://localhost:4173/', { waitUntil: 'load' });
await p.waitForTimeout(6000);
console.log(JSON.stringify(await p.evaluate(() => window.__ev)));
await b.close();
