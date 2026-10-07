import { chromium } from '@playwright/test'; import { execSync } from 'node:child_process';
const pid = execSync('adb shell pidof app.versovivo.editor', { encoding: 'utf8' }).trim(); execSync(`adb forward tcp:9222 localabstract:webview_devtools_remote_${pid}`);
const b = await chromium.connectOverCDP('http://localhost:9222'); const page = b.contexts()[0].pages()[0];
await page.evaluate(() => { window.__ev = []; window.addEventListener('popstate', (e) => window.__ev.push(['popstate', JSON.stringify(e.state), Date.now()])); window.addEventListener('pagehide', () => window.__ev.push(['pagehide'])); document.addEventListener('visibilitychange', () => window.__ev.push(['vis', document.visibilityState])); });
execSync('adb shell input keyevent KEYCODE_BACK'); await new Promise((r) => setTimeout(r, 2500));
console.log(JSON.stringify(await page.evaluate(() => window.__ev)));
console.log(execSync('adb shell dumpsys window', { encoding: 'utf8' }).split('\n').find((l) => l.includes('mCurrentFocus')));
await b.close();
