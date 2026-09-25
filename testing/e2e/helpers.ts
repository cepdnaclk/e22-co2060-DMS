import { expect, type Page, type APIRequestContext } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export const API = 'http://localhost:8081/api';
export const PASSWORD = 'password123';

export interface SeedUser { id: number; username: string; fullName: string; token: string; role: string }
export interface Seed { organizer: SeedUser; judge: SeedUser; debaterA: SeedUser; debaterB: SeedUser }

export const seedFile = path.join(__dirname, '..', 'reports', 'playwright', 'seed-users.json');

export function seed(): Seed {
  return JSON.parse(fs.readFileSync(seedFile, 'utf8'));
}

export async function signupViaApi(request: APIRequestContext, key: string, role: string, runId: string): Promise<SeedUser> {
  const username = `pw_${key}_${runId}`;
  const fullName = `PW ${key} ${runId}`;
  const res = await request.post(`${API}/auth/signup`, {
    data: { fullName, username, email: `${username}@test.dms`, password: PASSWORD, role },
  });
  expect(res.ok(), `signup ${username}`).toBeTruthy();
  const body = await res.json();
  return { id: body.user.id, username, fullName, token: body.token, role };
}

/** Logs in through the real UI: role selection → login form → dashboard. */
export async function loginViaUi(page: Page, user: { username: string; role: string }) {
  await page.goto('/role-select');
  const title = user.role.charAt(0) + user.role.slice(1).toLowerCase();
  await page.getByRole('button', { name: new RegExp(title) }).first().click();
  await expect(page).toHaveURL(/\/login$/);
  await page.getByPlaceholder('username or email@example.com').fill(user.username);
  await page.getByPlaceholder('Enter your password').fill(PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(new RegExp(`/dashboard/${user.role.toLowerCase()}$`));
}

/** Starts a session without the UI by storing the token the way the app does. */
export async function loginViaStorage(page: Page, user: SeedUser) {
  await page.goto('/');
  await page.evaluate(({ token, user }) => {
    localStorage.setItem('dms_token', token);
    localStorage.setItem('dms_user', JSON.stringify(user));
    localStorage.setItem('dms_selected_role', user.role);
  }, { token: user.token, user: { id: user.id, username: user.username, fullName: user.fullName, role: user.role } });
}
