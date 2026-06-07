import { test, expect } from '@playwright/test';

async function skipBoot(page) {
  await page.addInitScript(() => {
    localStorage.setItem('versovivo-skip-boot', '1');
    localStorage.removeItem('versovivo-project');
  });
}

test.describe('melhoria de qualidade', () => {
  test.beforeEach(async ({ page }) => {
    await skipBoot(page);
  });

  test('configurações na home com opções marcadas por padrão', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.getElementById('home')?.classList.contains('on'));

    await expect(page.locator('#home-settings')).toBeVisible();
    await page.locator('#home-settings').click();
    await expect(page.locator('#settings')).toHaveClass(/on/);

    const photos = page.locator('#settings-enhance-photos');
    const videos = page.locator('#settings-enhance-videos');
    await expect(photos).toBeChecked();
    await expect(videos).toBeChecked();
  });

  test('VVEnhance amplia foto pequena', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => typeof globalThis.VVEnhance !== 'undefined');

    const result = await page.evaluate(async () => {
      const c = document.createElement('canvas');
      c.width = 320;
      c.height = 240;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#336699';
      ctx.fillRect(0, 0, 320, 240);

      const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.92));
      const url = URL.createObjectURL(blob);
      const img = await new Promise((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = reject;
        el.src = url;
      });

      const entry = { img, blob, url };
      const out = await VVEnhance.enhancePhotoEntry(entry, 1080, 1920);
      URL.revokeObjectURL(url);
      return {
        enhanced: !!out.enhanced,
        fromW: img.naturalWidth,
        fromH: img.naturalHeight,
        toW: out.img?.naturalWidth ?? 0,
        toH: out.img?.naturalHeight ?? 0,
      };
    });

    expect(result.enhanced).toBe(true);
    expect(result.fromW).toBe(320);
    expect(result.toW).toBeGreaterThan(320);
    expect(result.toH).toBeGreaterThan(240);
    expect(result.toW).toBeGreaterThanOrEqual(1080);
  });

  test('computeEnhanceTarget retorna null para foto já grande', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const target = await page.evaluate(() =>
      VVEnhance.computeEnhanceTarget(3840, 2160, 1080, 1920)
    );
    expect(target).toBeNull();
  });
});
