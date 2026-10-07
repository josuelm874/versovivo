import { test, expect } from '@playwright/test';

const KEY = 'versovivo-last-active';
const seed = (ageMs) => (page) => page.addInitScript(([k, age]) => {
  localStorage.removeItem('versovivo-skip-boot');
  if (age === null) localStorage.removeItem(k); else localStorage.setItem(k, String(Date.now() - age));
}, [KEY, ageMs]);

test.describe('intro "hello"', () => {
  test('abertura: toca, não tem como pular e termina na tela inicial', async ({ page }) => {
    await seed(null)(page);
    await page.goto('/');
    await expect(page.locator('#boot')).toBeVisible();
    await expect(page.locator('#boot-skip, #boot-skip-check, .boot-remember')).toHaveCount(0);
    await expect(page.getByText(/pular intro/i)).toHaveCount(0);
    await expect(page.locator('#home')).toHaveClass(/on/, { timeout: 8000 });
    await expect(page.locator('#boot')).toBeHidden({ timeout: 8000 });
  });

  test('voltou em menos de 1 min: sem intro', async ({ page }) => {
    await seed(30_000)(page);
    await page.goto('/');
    await expect(page.locator('#home')).toHaveClass(/on/);
    await expect(page.locator('#boot')).toBeHidden();
  });

  test('ficou fora mais de 1 min: intro de novo', async ({ page }) => {
    await seed(90_000)(page);
    await page.goto('/');
    await expect(page.locator('#boot')).toBeVisible();
    await expect(page.locator('#boot')).toBeHidden({ timeout: 9000 });
  });

  test('voltar ao app (>1 min) dentro do editor repete a intro sem perder a tela', async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('versovivo-skip-boot', '1'); localStorage.removeItem('versovivo-project'); });
    page.on('dialog', (d) => d.accept());
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('.new-proj').click();
    await expect(page.locator('#editor')).toHaveClass(/on/, { timeout: 15000 });
    // modo "produção": tira a flag de teste e simula 90 s fora
    await page.evaluate(([k]) => {
      localStorage.removeItem('versovivo-skip-boot');
      localStorage.setItem(k, String(Date.now() - 90_000));
      document.dispatchEvent(new Event('visibilitychange'));
    }, [KEY]);
    await expect(page.locator('#boot')).toBeVisible();
    await expect(page.locator('#boot')).toBeHidden({ timeout: 9000 });
    await expect(page.locator('#editor')).toHaveClass(/on/);
  });

  test('voltar em menos de 1 min não repete', async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('versovivo-skip-boot', '1'); });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.evaluate(([k]) => {
      localStorage.removeItem('versovivo-skip-boot');
      localStorage.setItem(k, String(Date.now() - 20_000));
      document.dispatchEvent(new Event('visibilitychange'));
    }, [KEY]);
    await page.waitForTimeout(600);
    await expect(page.locator('#boot')).toBeHidden();
  });
});
