/**
 * Percorre o tutorial inteiro via tutorialNext() e reporta cada passo.
 * Uso: npx serve . -l 3456  (outro terminal) && node scripts/tutorial-walkthrough.mjs
 */
import { chromium } from '@playwright/test';

const BASE = process.env.VV_BASE || 'http://127.0.0.1:3456';

async function waitTutorialReady(page) {
  await page.waitForFunction(() => {
    const tut = document.getElementById('tutorial');
    const btn = document.getElementById('tut-next');
    return tut?.classList.contains('on') && btn && !btn.disabled && !_tutPreparing;
  }, { timeout: 45_000 });
}

async function walk() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.addInitScript(() => {
    localStorage.setItem('versovivo-skip-boot', '1');
    localStorage.removeItem('versovivo-project');
  });

  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.evaluate(() => startTutorial());
  await waitTutorialReady(page);

  const steps = [];
  let stuck = 0;
  let prevKey = '';

  for (let i = 0; i < 80; i++) {
    const open = await page.evaluate(() => document.getElementById('tutorial')?.classList.contains('on'));
    if (!open) break;

    const state = await page.evaluate(() => ({
      progress: document.getElementById('tut-progress')?.textContent || '',
      title: document.getElementById('tut-title')?.textContent || '',
      nextLabel: document.getElementById('tut-next')?.textContent || '',
      preparing: _tutPreparing,
      stepIdx: _tutStep,
      recOv: document.getElementById('rec-ov')?.classList.contains('on'),
      nextDisabled: document.getElementById('tut-next')?.disabled,
    }));

    steps.push(state);
    const key = `${state.stepIdx}|${state.title}`;
    if (key === prevKey) {
      stuck++;
      if (stuck > 3) {
        console.error('TRAVOU no passo:', state);
        break;
      }
    } else {
      stuck = 0;
      prevKey = key;
    }

    if (state.recOv) console.warn('  ⚠ rec-ov ativo em', state.progress);

    await page.evaluate(async () => {
      const deadline = Date.now() + 45_000;
      while (_tutPreparing && Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 50));
      }
      tutorialNext();
    });

    await page.waitForFunction(
      (prev) => {
        const tut = document.getElementById('tutorial');
        if (!tut?.classList.contains('on')) return true;
        const cur = `${_tutStep}|${document.getElementById('tut-title')?.textContent || ''}`;
        return cur !== prev;
      },
      prevKey,
      { timeout: 45_000 }
    ).catch(() => {
      console.error('Timeout aguardando próximo passo após', prevKey);
    });
  }

  const closed = !(await page.evaluate(() => document.getElementById('tutorial')?.classList.contains('on')));

  console.log('\n=== Tutorial walkthrough ===');
  console.log(`Passos visitados: ${steps.length}`);
  console.log(`Fechou corretamente: ${closed}`);
  steps.forEach((s, i) => console.log(`  ${String(i + 1).padStart(2)}. [${s.stepIdx}] ${s.progress} — ${s.title}`));
  if (errors.length) console.log('\nErros JS:', errors);

  await browser.close();
  if (!closed || steps.length < 10) process.exit(1);
}

walk().catch((e) => {
  console.error(e);
  process.exit(1);
});
