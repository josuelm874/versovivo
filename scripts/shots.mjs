// Capturas de todas as telas (viewport de celular). Uso: node scripts/shots.mjs [pasta] [url]
import { chromium } from '@playwright/test';
import { readdirSync, mkdirSync } from 'node:fs';
const OUT = process.argv[2] || 'test-results/theme'; const URL = process.argv[3] || 'http://localhost:4173/';
mkdirSync(OUT, { recursive: true });
const imgs = readdirSync('test-media').filter(f => /\.jpe?g$/.test(f)).map(f => `test-media/${f}`);
const b = process.env.CDP ? await chromium.connectOverCDP('http://localhost:9222') : await chromium.launch(); const ctx = process.env.CDP ? b.contexts()[0] : await b.newContext({ viewport: { width: 412, height: 892 }, deviceScaleFactor: 2 });
const p = await ctx.newPage(); p.on('dialog', d => d.accept().catch(() => {}));
await p.addInitScript(() => { localStorage.removeItem('versovivo-project'); });
await p.goto(URL, { waitUntil: 'networkidle' });
await p.waitForTimeout(600);
await p.screenshot({ path: `${OUT}/00-boot.png` });
await p.evaluate(() => skipBoot()); await p.waitForTimeout(500);
await p.screenshot({ path: `${OUT}/01-home.png` });
await p.evaluate(() => openSettings()); await p.waitForTimeout(400); await p.screenshot({ path: `${OUT}/02-settings.png` }); await p.evaluate(() => closeSettings());
await p.locator('.new-proj').click(); await p.waitForFunction(() => document.getElementById('editor')?.classList.contains('on'));
await p.screenshot({ path: `${OUT}/03-editor-empty.png` });
await p.setInputFiles('#img-input', imgs); await p.waitForFunction(() => S.imgs.length >= 4, null, { timeout: 30000 }); await p.waitForTimeout(1500);
await p.evaluate(() => { createOrEditTextBox(); });
await p.locator('#tb-edit').fill('O mar guarda em silêncio\ntudo o que o vento esqueceu');
await p.evaluate(() => { document.activeElement?.blur(); exitAnyEditMode?.(); }); await p.waitForTimeout(600);
await p.screenshot({ path: `${OUT}/04-editor.png` });
await p.evaluate(() => toggleTextMenu()); await p.waitForTimeout(400); await p.screenshot({ path: `${OUT}/05-text-menu.png` }); await p.evaluate(() => toggleTextMenu());
for (const [id, name] of [['fx', 'efeitos'], ['ar', 'proporcao'], ['tp', 'layouts'], ['ap', 'musica'], ['lp', 'legivel'], ['fp', 'fontes'], ['fmt', 'formato'], ['cp', 'cor'], ['ts', 'tamanho']]) {
  await p.evaluate((i) => openPanel(i), id); await p.waitForTimeout(500);
  await p.screenshot({ path: `${OUT}/06-panel-${name}.png` }); await p.evaluate(() => closePanels());
}
await p.evaluate(() => { document.getElementById('rec-ov').classList.add('on'); document.getElementById('rec-fill').style.width = '58%'; document.getElementById('rec-sub').textContent = 'Gravando slideshow · 58% · frame 350/600'; });
await p.waitForTimeout(300); await p.screenshot({ path: `${OUT}/07-export.png` }); await p.evaluate(() => document.getElementById('rec-ov').classList.remove('on'));
await p.evaluate(() => startTutorial()); await p.waitForTimeout(900); await p.screenshot({ path: `${OUT}/08-tutorial.png` });
await b.close(); console.log('ok', OUT);
