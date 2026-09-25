import { test, expect } from '@playwright/test';
import { seed, loginViaStorage, API } from './helpers';

test.describe.serial('Tournament workflow (browser)', () => {
  const name = `PW Championship ${Date.now().toString(36)}`;
  let tournamentId = 0;
  let matchId = 0;

  test('organizer creates a tournament with the 6-step wizard', async ({ page }) => {
    const s = seed();
    await loginViaStorage(page, s.organizer);
    await page.goto('/create-tournament');
    const next = page.getByRole('button', { name: /^Next/ });

    // 1. Basic details
    await page.getByPlaceholder(/National Inter-University/).fill(name);
    await page.getByRole('button', { name: 'Asian Parliamentary Debate' }).click();
    await next.click();
    // 2. Type (keep KNOCKOUT)
    await next.click();
    // 3. Schools & debaters
    await page.getByPlaceholder('School 1 name').fill('Royal College');
    await page.getByPlaceholder('Search debaters...').first().fill(s.debaterA.username);
    await page.getByRole('button', { name: new RegExp(s.debaterA.username) }).click();
    await page.getByRole('button', { name: /add school/i }).click();
    await page.getByPlaceholder('School 2 name').fill('Trinity College');
    await page.getByPlaceholder('Search debaters...').nth(1).fill(s.debaterB.username);
    await page.getByRole('button', { name: new RegExp(s.debaterB.username) }).click();
    await next.click();
    // 4. Judges
    await page.getByPlaceholder('Search judges...').fill(s.judge.username);
    await page.getByRole('button', { name: new RegExp(s.judge.username) }).click();
    await next.click();
    // 5. Score sheet: organizer renames the first criterion to a custom one
    await page.getByPlaceholder('Criteria name').first().fill('Persuasion');
    await next.click();
    // 6. Review
    await expect(page.getByText('2 schools, 2 debaters')).toBeVisible();
    await expect(page.getByText('1 judges')).toBeVisible();
    await page.getByRole('button', { name: 'Create Tournament' }).click();

    await expect(page).toHaveURL(/\/tournament\/\d+$/);
    tournamentId = Number(page.url().split('/').pop());
    await expect(page.getByText(name).first()).toBeVisible();
  });

  test('a visitor can find the new tournament with search', async ({ page }) => {
    await page.goto(`/search?q=${encodeURIComponent(name)}`);
    await expect(page.getByText(name).first()).toBeVisible();
  });

  test('judge opens the score sheet for an assigned match', async ({ page, request }) => {
    const s = seed();
    const t = await (await request.get(`${API}/tournaments/${tournamentId}`)).json();
    const res = await request.post(`${API}/matches`, {
      headers: { Authorization: `Bearer ${s.organizer.token}` },
      data: {
        tournamentId,
        propositionSchoolId: t.schools[0].id,
        oppositionSchoolId: t.schools[1].id,
        topic: 'This house believes exams do more harm than good',
        judgeIds: [s.judge.id],
      },
    });
    expect(res.ok()).toBeTruthy();
    matchId = (await res.json()).id;

    await loginViaStorage(page, s.judge);
    await page.goto(`/score-sheet/${matchId}/${s.judge.id}`);
    await expect(page.getByText('exams do more harm than good')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit Score Sheet' })).toBeVisible();
  });

  test('judge submits the score sheet', async ({ page }) => {
    const s = seed();
    await loginViaStorage(page, s.judge);
    await page.goto(`/score-sheet/${matchId}/${s.judge.id}`);
    const inputs = page.locator('input[type="number"]');
    await expect(inputs.first()).toBeVisible();
    const n = await inputs.count();
    for (let i = 0; i < n; i++) await inputs.nth(i).fill(i < n / 2 ? '30' : '25');
    await page.getByRole('button', { name: 'Submit Score Sheet' }).click();
    await expect(page.getByText(/submitted/i).first()).toBeVisible();
  });

  test('match result appears on the tournament page', async ({ page, request }) => {
    const m = await (await request.get(`${API}/matches/${matchId}`, {
      headers: { Authorization: `Bearer ${seed().organizer.token}` },
    })).json();
    expect(m.status).toBe('COMPLETED');

    await page.goto(`/tournament/${tournamentId}`);
    await expect(page.getByText('Royal College').first()).toBeVisible();
  });
});
