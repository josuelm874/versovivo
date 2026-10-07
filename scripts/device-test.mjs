// Testa o APK no aparelho via CDP (adb forward tcp:9222). Gera test-results/device/*.png e report.json
import { chromium } from '@playwright/test';
import { execSync } from 'node:child_process';
import { readdirSync, writeFileSync, mkdirSync } from 'node:fs';
const OUT = 'test-results/device'; mkdirSync(OUT, { recursive: true });
const imgs = readdirSync('test-media').filter(f => /\.(jpe?g|png)$/.test(f)).map(f => `test-media/${f}`);
const report = { steps: [], t0: Date.now() };
const step = (n, d) => { report.steps.push({ n, ...d, ms: Date.now() - report.t0 }); console.log(n, JSON.stringify(d)); };
const browser = await chromium.connectOverCDP('http://localhost:9222');
const page = browser.contexts()[0].pages()[0];
page.on('dialog', d => d.accept().catch(() => {}));
page.on('pageerror', e => step('pageerror', { msg: String(e) }));
await page.evaluate(() => { localStorage.setItem('versovivo-skip-boot', '1'); localStorage.removeItem('versovivo-project'); });
await page.reload({ waitUntil: 'load' });
step('caps', await page.evaluate(() => ({
  ua: navigator.userAgent, mp4: MediaRecorder.isTypeSupported('video/mp4'), webm: MediaRecorder.isTypeSupported('video/webm;codecs=vp9'),
  share: !!navigator.share, dpr: devicePixelRatio, vw: innerWidth, vh: innerHeight })));
await page.locator('.new-proj').click();
await page.waitForFunction(() => document.getElementById('editor')?.classList.contains('on'));
await page.setInputFiles('#img-input', imgs);
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT}/02-editor-imgs.png` });
step('imgs', { loaded: imgs.length, dlEnabled: await page.locator('#dl-btn').isEnabled() });
await page.evaluate(() => createOrEditTextBox());
await page.locator('#tb-edit').fill('O mar guarda em silêncio\ntudo o que o vento esqueceu');
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/03-text.png` });
if (process.env.FX) {
  await page.evaluate(() => { openPanel('fx'); setTransition('slide'); setFilter('vintage'); setDim(30); });
  await page.waitForTimeout(800);
  writeFileSync(`${OUT}/06-fx-panel.png`, execSync('adb exec-out screencap -p', { maxBuffer: 1 << 28 }));
  await page.evaluate(() => closePanels());
}
// captura o blob exportado
await page.evaluate(() => {
  window.__blobs = []; const o = URL.createObjectURL.bind(URL);
  URL.createObjectURL = b => { window.__blobs.push({ type: b.type, size: b.size }); return o(b); };
});
const t = Date.now();
await page.evaluate(() => { startDownload(); });
const adb = (c) => execSync(`adb ${c}`, { encoding: 'utf8' });
let focus = '';
for (let i = 0; i < 90 && !/chooser|Share|Resolver/i.test(focus); i++) { await page.waitForTimeout(2000); focus = (adb('shell dumpsys window').split(String.fromCharCode(10)).find(l => l.includes('mCurrentFocus')) || ''); }
step('export', { seconds: (Date.now() - t) / 1000, shareSheet: focus.trim() });
writeFileSync(`${OUT}/04-share-sheet.png`, execSync('adb exec-out screencap -p', { maxBuffer: 1 << 28 }));
step('cache', { files: adb('shell run-as app.versovivo.editor ls -la cache').trim() });
adb('shell input keyevent KEYCODE_BACK'); await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT}/05-after-export.png` });
writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 1));
await browser.close();
