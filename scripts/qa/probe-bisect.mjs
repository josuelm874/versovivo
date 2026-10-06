import { chromium } from '@playwright/test'; import { execSync } from 'node:child_process';
const sh = (c) => execSync(c, { encoding: 'utf8' }); const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const variant = process.argv[2];
sh('adb shell am force-stop app.versovivo.editor'); sh('adb shell am start -n app.versovivo.editor/.MainActivity'); await sleep(6500);
const pid = sh('adb shell pidof app.versovivo.editor').trim(); sh(`adb forward tcp:9222 localabstract:webview_devtools_remote_${pid}`);
const b = await chromium.connectOverCDP('http://localhost:9222'); const page = b.contexts()[0].pages()[0];
page.on('dialog', (d) => d.accept().catch(() => {}));
const openEditor = async () => { await page.locator('.new-proj').click(); await page.waitForFunction(() => document.getElementById('editor').classList.contains('on')); await sleep(500); };
if (variant === 'A') { await openEditor(); await page.evaluate(() => goHome()); await sleep(1500); }                       // editor -> botão ←
if (variant === 'B') { await openEditor(); await page.setInputFiles('#img-input', ['test-media/img_id_1015.jpg']); await page.waitForFunction(() => S.imgs.length === 1); await page.evaluate(() => goHome()); await sleep(1500); } // com mídia (dispara confirm)
if (variant === 'C') { await page.evaluate(() => { localStorage.removeItem('versovivo-project'); }); await openEditor(); await page.evaluate(() => openPanel('fx')); await sleep(300); sh('adb shell input keyevent KEYCODE_BACK'); await sleep(800); sh('adb shell input keyevent KEYCODE_BACK'); await sleep(1500); } // painel -> Voltar x2 (volta ao início)
const st = await page.evaluate(() => ({ home: document.getElementById('home').classList.contains('on'), editor: document.getElementById('editor').classList.contains('on') }));
await b.close().catch(() => {}); await sleep(500);
sh('adb shell input keyevent KEYCODE_BACK'); await sleep(3500);
const f = sh('adb shell dumpsys window').split('\n').find((l) => l.includes('mCurrentFocus')).trim();
console.log('variante', variant, JSON.stringify(st), '→', /launcher/i.test(f) ? 'SAIU' : 'NÃO SAIU');
