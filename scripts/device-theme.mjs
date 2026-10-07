// Capturas reais (adb screencap) do tema no aparelho. Requer adb forward 9222.
import { chromium } from '@playwright/test';
import { execSync } from 'node:child_process';
import { readdirSync, writeFileSync, mkdirSync } from 'node:fs';
const OUT = 'docs/relatorio/tema'; mkdirSync(OUT, { recursive: true });
const imgs = readdirSync('test-media').filter(f => /\.jpe?g$/.test(f)).map(f => `test-media/${f}`);
const shot = (n) => writeFileSync(`${OUT}/device-${n}.png`, execSync('adb exec-out screencap -p', { maxBuffer: 1 << 28 }));
const b = await chromium.connectOverCDP('http://localhost:9222'); const p = b.contexts()[0].pages()[0];
p.on('dialog', d => d.accept().catch(() => {}));
await p.evaluate(() => { localStorage.removeItem('versovivo-skip-boot'); localStorage.removeItem('versovivo-project'); });
await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(1900); shot('00-boot');
await p.evaluate(() => skipBoot()); await p.waitForTimeout(700); shot('01-home');
await p.locator('.new-proj').click(); await p.waitForFunction(() => document.getElementById('editor')?.classList.contains('on'));
await p.setInputFiles('#img-input', imgs); await p.waitForFunction(() => S.imgs.length >= 4); await p.waitForTimeout(1500);
await p.evaluate(() => createOrEditTextBox()); await p.locator('#tb-edit').fill('O mar guarda em silêncio\ntudo o que o vento esqueceu');
await p.evaluate(() => { document.activeElement?.blur(); exitAnyEditMode?.(); }); await p.waitForTimeout(800); shot('02-editor');
await p.evaluate(() => toggleTextMenu()); await p.waitForTimeout(500); shot('03-text-menu'); await p.evaluate(() => toggleTextMenu());
for (const [id, n] of [['fx', 'efeitos'], ['fp', 'fontes'], ['tp', 'layouts']]) { await p.evaluate(i => openPanel(i), id); await p.waitForTimeout(600); shot('04-' + n); await p.evaluate(() => closePanels()); }
await p.evaluate(() => startTutorial()); await p.waitForTimeout(1000); shot('05-tutorial');
await b.close();
