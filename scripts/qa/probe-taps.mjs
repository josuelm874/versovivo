// Fluxo só com toques reais (adb input tap): abrir editor -> ← -> Voltar. CDP só lê coordenadas.
import { chromium } from '@playwright/test';
import { execSync } from 'node:child_process';
const sh = (c) => execSync(c, { encoding: 'utf8' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
sh('adb shell am force-stop app.versovivo.editor'); sh('adb shell am start -n app.versovivo.editor/.MainActivity'); await sleep(3500);
const pid = sh('adb shell pidof app.versovivo.editor').trim(); sh(`adb forward tcp:9222 localabstract:webview_devtools_remote_${pid}`);
const b = await chromium.connectOverCDP('http://localhost:9222'); const page = b.contexts()[0].pages()[0];
await page.evaluate(() => { localStorage.setItem('versovivo-skip-boot', '1'); localStorage.removeItem('versovivo-project'); }); await page.reload(); await sleep(1500);
page.on('dialog', (d) => { console.log('dialog', d.message().slice(0,30)); d.accept().catch(() => {}); });
const center = (sel) => page.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(), d = window.devicePixelRatio, vv = window.visualViewport; return [Math.round((r.left + r.width / 2) * d), Math.round((r.top + r.height / 2) * d + (window.outerHeight - window.innerHeight) * d)]; }, sel);
const tap = async (sel) => { const [x, y] = await center(sel); sh(`adb shell input tap ${x} ${y}`); await sleep(1200); };
const st = () => page.evaluate(() => ({ editor: document.getElementById('editor').classList.contains('on'), home: document.getElementById('home').classList.contains('on') }));
await tap('.new-proj'); console.log('após novo projeto', JSON.stringify(await st()));
await tap('.back-btn'); await sleep(1500);
await b.close().catch(() => {}); await sleep(Number(process.env.WAIT||800));
sh('adb logcat -c'); sh('adb shell input keyevent KEYCODE_BACK'); await sleep(2500);
console.log(sh('adb logcat -d').split(String.fromCharCode(10)).filter((l) => /VVBack/.test(l)).slice(0, 25).map((l) => l.slice(0, 230)).join(String.fromCharCode(10)));
console.log('foco:', (sh('adb shell dumpsys window').split('\n').find((l) => l.includes('mCurrentFocus')) || '').trim());
const b2 = await chromium.connectOverCDP('http://localhost:9222').catch(() => null);
if (b2) { const p2 = b2.contexts()[0].pages()[0]; console.log('estado após Voltar:', JSON.stringify(await p2.evaluate(() => ({ editor: document.getElementById('editor').classList.contains('on'), home: document.getElementById('home').classList.contains('on'), panel: !!document.querySelector('.panel.on'), editing: !!(TBOX.editing || TBOX2.editing || TBOX3.editing), active: document.activeElement && document.activeElement.tagName + '#' + document.activeElement.id }))));  await b2.close().catch(() => {}); }
