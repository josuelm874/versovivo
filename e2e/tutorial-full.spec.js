import { test, expect } from '@playwright/test';

async function skipBoot(page) {
  await page.addInitScript(() => {
    localStorage.setItem('versovivo-skip-boot', '1');
    localStorage.removeItem('versovivo-project');
    if (navigator.serviceWorker) {
      const noopReg = {
        update: () => Promise.resolve(),
        waiting: null,
        installing: null,
        addEventListener: () => {},
      };
      navigator.serviceWorker.register = () => Promise.resolve(noopReg);
      navigator.serviceWorker.getRegistrations = () => Promise.resolve([]);
    }
  });
}

test.describe('tutorial completo', () => {
  test.beforeEach(async ({ page }) => {
    await skipBoot(page);
  });

  test('percorre do início ao fim sem travar', async ({ page }) => {
    test.setTimeout(180_000);

    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.getElementById('home')?.classList.contains('on'));

    await page.evaluate(() => startTutorial());
    await page.waitForFunction(() => document.getElementById('tutorial')?.classList.contains('on'));
    await page.waitForFunction(() => /Passo \d+/.test(document.getElementById('tut-progress')?.textContent || ''));

    const visited = [];
    const maxClicks = 80;

    for (let i = 0; i < maxClicks; i++) {
      const open = await page.evaluate(() => document.getElementById('tutorial')?.classList.contains('on'));
      if (!open) break;

      const state = await page.evaluate(() => ({
        progress: document.getElementById('tut-progress')?.textContent || '',
        title: document.getElementById('tut-title')?.textContent || '',
        nextLabel: document.getElementById('tut-next')?.textContent || '',
        recOv: document.getElementById('rec-ov')?.classList.contains('on'),
      }));

      visited.push(state);
      expect(state.recOv, `overlay rec-ov ativo em ${state.progress}`).toBe(false);
      expect(state.title.length, `passo sem título em ${state.progress}`).toBeGreaterThan(0);

      await page.waitForFunction(() => {
        const btn = document.getElementById('tut-next');
        return btn && !btn.disabled && !_tutPreparing;
      }, { timeout: 45_000 });

      const fingerprint = `${state.progress}|${state.title}|${state.nextLabel}`;
      await page.locator('#tut-next').click({ force: false, timeout: 10_000 }).catch(async () => {
        await page.evaluate(() => tutorialNext());
      });

      await page.waitForFunction(
        (prev) => {
          const tut = document.getElementById('tutorial');
          if (!tut?.classList.contains('on')) return true;
          const cur = [
            document.getElementById('tut-progress')?.textContent || '',
            document.getElementById('tut-title')?.textContent || '',
            document.getElementById('tut-next')?.textContent || '',
          ].join('|');
          return cur !== prev;
        },
        fingerprint,
        { timeout: 45_000 }
      );
    }

    await expect(page.locator('#tutorial')).not.toHaveClass(/on/);
    expect(visited.length, 'poucos passos visitados — tutorial pode ter travado cedo').toBeGreaterThan(10);

    const last = visited[visited.length - 1];
    expect(last?.nextLabel).toMatch(/Concluir|Próximo/);

    const uniqueTitles = new Set(visited.map((v) => v.title));
    expect(uniqueTitles.size, 'muitos passos repetidos — possível loop').toBeGreaterThan(visited.length - 3);

    const criticalErrors = consoleErrors.filter(
      (e) => !e.includes('favicon') && !e.includes('Failed to load resource')
    );
    expect(criticalErrors, criticalErrors.join('\n')).toEqual([]);

    console.log(`Tutorial OK — ${visited.length} passos percorridos`);
    visited.forEach((v, idx) => console.log(`  ${idx + 1}. ${v.progress} — ${v.title}`));
  });
});
