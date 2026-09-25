import { test, expect } from '@playwright/test';
import { seed, loginViaUi, loginViaStorage, PASSWORD } from './helpers';

test.describe('Authentication & access control (browser)', () => {
  for (const key of ['organizer', 'judge', 'debaterA'] as const) {
    test(`${key} logs in through the UI and lands on their dashboard`, async ({ page }) => {
      const user = seed()[key];
      await loginViaUi(page, user);
      await expect(page.locator('body')).toContainText(user.fullName.split(' ')[0]);
    });
  }

  test('wrong password shows an error and stays on the login page', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('username or email@example.com').fill(seed().debaterA.username);
    await page.getByPlaceholder('Enter your password').fill('wrong-password');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText('Invalid credentials')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('new user can sign up and is taken to their dashboard', async ({ page }) => {
    const u = `pw_signup_${Date.now().toString(36)}`;
    await page.goto('/role-select');
    await page.getByRole('button', { name: /Debater/ }).first().click();
    await page.goto('/signup');
    await page.getByPlaceholder('Your full name').fill('Signup Tester');
    await page.getByPlaceholder('username').fill(u);
    await page.getByPlaceholder('your@email.com').fill(`${u}@test.dms`);
    await page.getByPlaceholder('Enter password').fill(PASSWORD);
    await page.getByPlaceholder('Confirm password').fill(PASSWORD);
    await page.getByRole('button', { name: /create account|sign up|register/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/debater$/);
  });

  test('logged-out visitor cannot open the organizer dashboard', async ({ page }) => {
    await page.goto('/dashboard/organizer');
    await expect(page).toHaveURL(/\/role-select$/);
  });

  test('debater cannot open the create-tournament page', async ({ page }) => {
    await loginViaStorage(page, seed().debaterA);
    await page.goto('/create-tournament');
    await expect(page).toHaveURL('http://localhost:5174/');
  });

  test('user can log out from the navbar menu', async ({ page }) => {
    await loginViaUi(page, seed().debaterB);
    await page.locator('nav button:has(svg.lucide-chevron-down)').first().click();
    await page.getByRole('button', { name: 'Log Out' }).first().click();
    await page.getByRole('button', { name: 'Log Out' }).last().click();
    await expect.poll(() => page.evaluate(() => localStorage.getItem('dms_token'))).toBeNull();
  });
});
