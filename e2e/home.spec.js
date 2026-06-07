import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('versovivo-skip-boot', '1');
  });
});

test('tela inicial exibe marca VersoVivo', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#home')).toHaveClass(/on/);
  await expect(page.locator('.home-brand')).toHaveText('VersoVivo');
  await expect(page.locator('.new-proj')).toBeVisible();
});

test('botão de tutorial está presente', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#home-help')).toBeVisible();
});

test('continuar projeto aparece quando há save', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('versovivo-skip-boot', '1');
    localStorage.setItem(
      'versovivo-project',
      JSON.stringify({
        text: 'verso de teste',
        text2: '',
        text3: '',
        aspectKey: '9:16',
        images: [],
        duration: 10,
        speed: 3,
      })
    );
  });
  await page.goto('/');
  await expect(page.locator('#home')).toHaveClass(/on/);
  await expect(page.locator('#resume-proj')).toBeVisible();
});
