import { test, expect } from '@playwright/test';

async function skipBoot(page) {
  await page.addInitScript(() => {
    localStorage.setItem('versovivo-skip-boot', '1');
    localStorage.removeItem('versovivo-project');
  });
}

async function openEditorFromHome(page) {
  page.on('dialog', (dialog) => dialog.accept());
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.getElementById('home')?.classList.contains('on'));
  await page.locator('.new-proj').click();
  await expect(page.locator('#editor')).toHaveClass(/on/, { timeout: 15_000 });
}

test.describe('editor', () => {
  test.beforeEach(async ({ page }) => {
    await skipBoot(page);
  });

  test('fluxo completo: abrir, editar verso, voltar', async ({ page }) => {
    await openEditorFromHome(page);

    await expect(page.locator('#cv')).toBeAttached();
    await expect(page.locator('#text-box')).toBeAttached();
    await expect(page.locator('#text-box-2')).toBeAttached();
    await expect(page.locator('#text-box-3')).toBeAttached();
    await expect(page.locator('#dl-btn')).toBeDisabled();
    await expect(page.locator('button.tb', { hasText: 'Assinatura' })).toBeVisible();

    await page.evaluate(() => createOrEditTextBox());
    const ta = page.locator('#tb-edit');
    await expect(ta).toBeVisible();
    await ta.fill('Um verso poético');
    await expect(ta).toHaveValue('Um verso poético');

    await page.locator('.back-btn').click();
    await expect(page.locator('#home')).toHaveClass(/on/);
    await expect(page.locator('#editor')).not.toHaveClass(/on/);
  });
});
