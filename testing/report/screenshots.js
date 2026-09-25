/**
 * Captures images used in the testing report: each tool's HTML report, plus
 * selected application states. Needs the backend on :8081 and frontend on :5174.
 * Run: node report/screenshots.js
 */
const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const R = path.join(__dirname, '..', 'reports');
const OUT = path.join(R, 'images');
const fileUrl = (p) => 'file:///' + path.join(R, p).replace(/\\/g, '/');

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 760 } });
  const shot = async (name, url, prepare) => {
    await page.goto(url, { waitUntil: 'networkidle' });
    if (prepare) await prepare();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT, `${name}.png`) });
    console.log('captured', name);
  };

  await shot('jacoco-overview', fileUrl('backend/jacoco/index.html'));
  await shot('jacoco-service', fileUrl('backend/jacoco/com.dms.service/index.html'));
  await shot('vitest-coverage', fileUrl('frontend/coverage/index.html'));
  await shot('newman-summary', fileUrl('newman/api-report.html'));
  await shot('newman-failed', fileUrl('newman/api-report.html'), async () => {
    const tab = page.getByRole('tab', { name: /Failed Tests/i }).or(page.locator('a:has-text("Failed Tests")')).first();
    if (await tab.count()) await tab.click();
  });
  await shot('playwright-report', fileUrl('playwright/html/index.html'));
  await shot('lighthouse-home', fileUrl('lighthouse/home.report.html'));

  // Application state: multi-tab conflict warning, fully rendered
  const seed = JSON.parse(fs.readFileSync(path.join(R, 'playwright', 'seed-users.json'), 'utf8'));
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 760 } });
  const store = (u) => ({ token: u.token, user: { id: u.id, username: u.username, fullName: u.fullName, role: u.role } });
  const login = async (p, u) => {
    await p.goto('http://localhost:5174/');
    await p.evaluate(({ token, user }) => {
      localStorage.setItem('dms_token', token);
      localStorage.setItem('dms_user', JSON.stringify(user));
      localStorage.setItem('dms_selected_role', user.role);
    }, store(u));
  };
  const tabA = await ctx.newPage();
  await login(tabA, seed.debaterA);
  await tabA.goto('http://localhost:5174/dashboard/debater', { waitUntil: 'networkidle' });
  const tabB = await ctx.newPage();
  await login(tabB, seed.judge);
  await tabA.getByText('User Account Switched').waitFor();
  await tabA.waitForTimeout(1200);
  await tabA.screenshot({ path: path.join(OUT, 'app-session-switched.png') });
  console.log('captured app-session-switched');

  await browser.close();
})();
