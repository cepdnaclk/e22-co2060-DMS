import { test, expect, request as pwRequest } from '@playwright/test';
import { seed, loginViaStorage, API } from './helpers';

/**
 * Score-sheet page checks. Each test builds its own tournament and match through the API,
 * so a failure in one does not block the others.
 */
test.describe('Judge score sheet (browser)', () => {
  let tournamentId = 0;
  let schools: number[] = [];

  test.beforeAll(async () => {
    const s = seed();
    const ctx = await pwRequest.newContext();
    const res = await ctx.post(`${API}/tournaments`, {
      headers: { Authorization: `Bearer ${s.organizer.token}` },
      data: {
        name: `PW Scoring Cup ${Date.now().toString(36)}`,
        debateType: 'BRITISH_PARLIAMENTARY',
        tournamentType: 'KNOCKOUT',
        schools: [
          { name: 'Ananda College', debaterIds: [s.debaterA.id] },
          { name: 'Nalanda College', debaterIds: [s.debaterB.id] },
        ],
        judgeIds: [s.judge.id],
        scoreTemplate: {
          name: 'Custom',
          criteriaJson: JSON.stringify([
            { name: 'Persuasion', maxMarks: 50 },
            { name: 'Evidence', maxMarks: 50 },
          ]),
        },
      },
    });
    expect(res.ok()).toBeTruthy();
    const t = await res.json();
    tournamentId = t.id;
    schools = t.schools.map((x: { id: number }) => x.id);
    await ctx.dispose();
  });

  async function newMatch(topic: string) {
    const s = seed();
    const ctx = await pwRequest.newContext();
    const res = await ctx.post(`${API}/matches`, {
      headers: { Authorization: `Bearer ${s.organizer.token}` },
      data: { tournamentId, propositionSchoolId: schools[0], oppositionSchoolId: schools[1], topic, judgeIds: [s.judge.id] },
    });
    const id = (await res.json()).id as number;
    await ctx.dispose();
    return id;
  }

  test("score sheet shows the organizer's custom criteria", async ({ page }) => {
    const matchId = await newMatch('Custom criteria check');
    await loginViaStorage(page, seed().judge);
    await page.goto(`/score-sheet/${matchId}/${seed().judge.id}`);
    await expect(page.getByText('Custom criteria check')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Persuasion' }).first()).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Rebuttal' })).toHaveCount(0);
  });

  test('after submitting, reopening the sheet shows "already submitted"', async ({ page }) => {
    const s = seed();
    const matchId = await newMatch('Resubmission check');
    const ctx = await pwRequest.newContext();
    const sub = await ctx.post(`${API}/score-sheets/submit`, {
      headers: { Authorization: `Bearer ${s.judge.token}` },
      data: { matchId, judgeId: s.judge.id, propositionTotal: 80, oppositionTotal: 75 },
    });
    expect(sub.ok()).toBeTruthy();
    await ctx.dispose();

    await loginViaStorage(page, s.judge);
    await page.goto(`/score-sheet/${matchId}/${s.judge.id}`);
    await expect(page.getByText('Score Sheet Submitted')).toBeVisible();
  });
});
