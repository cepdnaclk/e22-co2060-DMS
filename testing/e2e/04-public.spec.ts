import { test, expect } from '@playwright/test';

test.describe('Public pages (browser)', () => {
  for (const [path, text] of [
    ['/', /VIVAATHI/i],
    ['/news', /news/i],
    ['/about', /about/i],
    ['/scoring', /scor/i],
  ] as const) {
    test(`${path} loads without errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(path);
      await expect(page.locator('body')).toContainText(text);
      expect(errors, 'uncaught JavaScript errors').toEqual([]);
    });
  }

  test('search finds seeded debaters', async ({ page }) => {
    await page.goto('/search?q=debater1');
    await expect(page.locator('body')).toContainText(/debater1/i);
  });

  test('home page loads live matches for visitors without API errors', async ({ page }) => {
    const failed: string[] = [];
    page.on('response', (r) => { if (r.url().includes('/api/') && r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(failed, 'API calls that failed on the public home page').toEqual([]);
  });

  test('layout works on a phone-sized screen', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, 'horizontal overflow in px').toBeLessThanOrEqual(0);
  });
});
