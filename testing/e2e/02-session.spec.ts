import { test, expect } from '@playwright/test';
import { seed, loginViaStorage } from './helpers';

/**
 * Regression tests for two recent fixes:
 *  - "With in one browser multiple log in conflict"
 *  - "Session Expired Added"
 * Two tabs share one browser profile (same localStorage), like a real user.
 */
test.describe('Multi-tab session handling (browser)', () => {
  test('logging in as another user in a second tab warns the first tab', async ({ context }) => {
    const tabA = await context.newPage();
    await loginViaStorage(tabA, seed().debaterA);
    await tabA.goto('/dashboard/debater');

    const tabB = await context.newPage();
    await loginViaStorage(tabB, seed().judge);

    await expect(tabA.getByText('User Account Switched')).toBeVisible();
    await expect(tabA.getByText(seed().judge.username)).toBeVisible();
  });

  test('logging out in a second tab tells the first tab the session ended', async ({ context }) => {
    const tabA = await context.newPage();
    await loginViaStorage(tabA, seed().debaterA);
    await tabA.goto('/dashboard/debater');

    const tabB = await context.newPage();
    await tabB.goto('/');
    await tabB.evaluate(() => {
      localStorage.removeItem('dms_token');
      localStorage.removeItem('dms_user');
    });

    await expect(tabA.getByText('Session Expired / Logged Out')).toBeVisible();
  });

  test('an expired token sends the user back to login', async ({ page }) => {
    await loginViaStorage(page, seed().debaterA);
    // Replace the token with one whose signature is valid-looking but expired/invalid
    await page.evaluate(() => localStorage.setItem('dms_token', 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4IiwiZXhwIjoxfQ.expired'));
    await page.goto('/notifications');
    await expect(page).toHaveURL(/\/login$/, { timeout: 15_000 });
  });
});
