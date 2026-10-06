import { chromium } from '@playwright/test'; import { execSync } from 'node:child_process';
const sh = (c) => execSync(c, { encoding: 'utf8' }); const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const mode = process.argv[2];
sh('adb shell am force-stop app.versovivo.editor'); sh('adb shell am start -n app.versovivo.editor/.MainActivity'); await sleep(6500);
const pid = sh('adb shell pidof app.versovivo.editor').trim(); sh(`adb forward tcp:9222 localabstract:webview_devtools_remote_${pid}`);
const b = await chromium.connectOverCDP('http://localhost:9222'); const page = b.contexts()[0].pages()[0];
if (mode === 'forward') { await page.evaluate(() => { history.pushState({ x: 1 }, ''); }); await sleep(300); await page.evaluate(() => history.back()); await sleep(800); }
const len = await page.evaluate(() => history.length);
await b.close().catch(() => {}); await sleep(500);
sh('adb shell input keyevent KEYCODE_BACK'); await sleep(3500);
const f = sh('adb shell dumpsys window').split('\n').find((l) => l.includes('mCurrentFocus')).trim();
console.log(mode, 'history.length', len, '→', /launcher/i.test(f) ? 'SAIU (launcher)' : 'NÃO SAIU');
