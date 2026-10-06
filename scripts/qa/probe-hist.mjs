import { chromium } from '@playwright/test'; import { execSync } from 'node:child_process';
const pid = execSync('adb shell pidof app.versovivo.editor', { encoding: 'utf8' }).trim(); execSync(`adb forward tcp:9222 localabstract:webview_devtools_remote_${pid}`);
const b = await chromium.connectOverCDP('http://localhost:9222'); const page = b.contexts()[0].pages()[0];
const cdp = await page.context().newCDPSession(page); const h = await cdp.send('Page.getNavigationHistory');
console.log('currentIndex', h.currentIndex, 'entries', h.entries.map((e) => e.url + ' ' + (e.title || '')));
console.log(await page.evaluate(() => ({ len: history.length, state: history.state, editor: document.getElementById('editor').classList.contains('on'), home: document.getElementById('home').classList.contains('on'), entry: typeof _editorEntry !== 'undefined' ? _editorEntry : null })));
await b.close();
