// Testa o botão Voltar do Android (e a tela cheia) no aparelho real.
import { chromium } from '@playwright/test';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
const sh = (c) => execSync(c, { encoding: 'utf8', maxBuffer: 1 << 28 });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pid = sh('adb shell pidof app.versovivo.editor').trim(); sh(`adb forward tcp:9222 localabstract:webview_devtools_remote_${pid}`);
const b = await chromium.connectOverCDP('http://localhost:9222'); const page = b.contexts()[0].pages()[0];
page.on('dialog', (d) => { log.push('dialog:' + d.type() + ':' + d.message().slice(0, 40)); d.accept().catch(() => {}); });
const log = []; const res = [];
const back = async () => { sh('adb shell input keyevent KEYCODE_BACK'); await sleep(900); };
const st = () => page.evaluate(() => ({ editor: document.getElementById('editor').classList.contains('on'), home: document.getElementById('home').classList.contains('on'), panel: !!document.querySelector('.panel.on'), editing: !!(TBOX.editing || TBOX2.editing || TBOX3.editing), hist: history.length }));
const focus = () => (sh('adb shell dumpsys window').split('\n').find((l) => l.includes('mCurrentFocus')) || '').trim();
const check = (name, cond, extra) => { res.push({ name, ok: !!cond, extra }); console.log((cond ? 'OK   ' : 'FALHA'), name, extra ? JSON.stringify(extra) : ''); };

await page.evaluate(() => { localStorage.setItem('versovivo-skip-boot', '1'); localStorage.removeItem('versovivo-project'); });
await page.reload({ waitUntil: 'load' }); await sleep(800);
await page.locator('.new-proj').click(); await page.waitForFunction(() => document.getElementById('editor').classList.contains('on'));
await page.setInputFiles('#img-input', ['test-media/img_id_1015.jpg', 'test-media/img_id_1043.jpg']); await page.waitForFunction(() => S.imgs.length === 2);
await sleep(600);

// 1) painel aberto: Voltar fecha o painel e permanece no editor
await page.evaluate(() => openPanel('fx')); await sleep(400);
check('painel aberto antes', (await st()).panel);
await back(); let s = await st();
check('Voltar com painel aberto fecha o painel e mantém o editor', !s.panel && s.editor && !s.home, s);
check('o app continua em primeiro plano', /app\.versovivo\.editor/.test(focus()), focus());

// 2) edição de texto: Voltar sai da edição
await page.evaluate(() => createOrEditTextBox()); await sleep(500);
check('edição de texto ativa', (await st()).editing);
await back(); s = await st();
let backs = 1;
if (s.editing) { await back(); s = await st(); backs = 2; } // 1º Voltar fecha o teclado (padrão do Android); o 2º sai da edição
check('Voltar durante edição de texto sai da edição e mantém o editor', !s.editing && s.editor && !s.home, { backs, s });

// 3) editor sem painel: Voltar -> início (com confirmação aceita)
await back(); await sleep(1200); s = await st();
check('Voltar no editor leva à tela inicial', !s.editor && s.home, { s, log });
check('o app continua aberto na tela inicial', /app\.versovivo\.editor/.test(focus()), focus());

// 4) botão ← do app e Voltar do sistema continuam consistentes: abrir de novo e usar o botão da UI
await page.locator('.new-proj').click(); await page.waitForFunction(() => document.getElementById('editor').classList.contains('on'));
await sleep(500); await page.evaluate(() => goHome()); await sleep(1200); s = await st();
check('botão ← do app volta ao início', !s.editor && s.home, s);

// 5) tela inicial: Voltar fecha o app (comportamento padrão Android)
const wins = sh('adb shell dumpsys window windows').split(String.fromCharCode(10)).filter((l) => /Window #\d+.*(Alert|Dialog|Popup)/i.test(l)).map((l) => l.trim().slice(0, 110)); console.log('janelas de diálogo antes do Voltar final:', JSON.stringify(wins));
await b.close().catch(() => {}); await sleep(500); // sem depurador conectado (usuário real)
await back(); await sleep(3500); if (process.env.DUMP) console.log(sh('adb logcat -d').split(String.fromCharCode(10)).filter((l) => /MIUIInput|VVBack|CoreBack|OnBackInvoked|ImeInsets|InputMethod|IMM/i.test(l)).map((l) => l.slice(0, 200)).join(String.fromCharCode(10))); // animação de saída (Voltar preditivo) leva ~2 s
const f = focus();
check('Voltar na tela inicial sai do app', !/app\.versovivo\.editor/.test(f), f);
fs.writeFileSync('qa-results/nav/result.json', JSON.stringify(res, null, 1));
await b.close().catch(() => {});
