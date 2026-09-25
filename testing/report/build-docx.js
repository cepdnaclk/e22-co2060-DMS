/**
 * Builds reports/DMS_Testing_Report.docx from reports/summary.json, report/data.js
 * and the screenshots in reports/images and reports/playwright/artifacts.
 * Run: node report/build-docx.js
 */
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType,
  ShadingType, AlignmentType, ImageRun, PageBreak, LevelFormat, BorderStyle, Footer, PageNumber,
  TableOfContents, VerticalAlign,
} = require('docx');
const { defects, observations, history, tools } = require('./data');

const R = path.join(__dirname, '..', 'reports');
const S = require(path.join(R, 'summary.json'));
const W = 9026; // A4 content width in DXA (1" margins)
const NAVY = '06192B';
const GOLD = '8A6A00';
const FONT = 'Calibri';

// ---------- building blocks ----------
const t = (text, o = {}) => new TextRun({ text, font: FONT, size: o.size || 22, bold: o.bold, italics: o.italics, color: o.color });
const p = (text, o = {}) => new Paragraph({
  children: Array.isArray(text) ? text : [t(text, o)],
  spacing: { after: o.after ?? 120, before: o.before ?? 0, line: 276 },
  alignment: o.align,
});
const h1 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text, font: FONT, size: 32, bold: true, color: NAVY })], spacing: { before: 240, after: 160 } });
const h2 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text, font: FONT, size: 26, bold: true, color: NAVY })], spacing: { before: 200, after: 100 } });
const bullet = (text) => new Paragraph({ numbering: { reference: 'bullets', level: 0 }, children: Array.isArray(text) ? text : [t(text)], spacing: { after: 60 } });
const caption = (text) => new Paragraph({ children: [t(text, { italics: true, size: 18, color: '555555' })], alignment: AlignmentType.CENTER, spacing: { after: 240 } });
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

const border = { style: BorderStyle.SINGLE, size: 4, color: 'C8D0DA' };
const borders = { top: border, bottom: border, left: border, right: border };

function table(headers, rows, widths, o = {}) {
  const scale = W / widths.reduce((a, b) => a + b, 0);
  const cw = widths.map((w) => Math.floor(w * scale));
  cw[cw.length - 1] += W - cw.reduce((a, b) => a + b, 0);
  const cell = (text, i, head, fill) => new TableCell({
    width: { size: cw[i], type: WidthType.DXA },
    borders,
    verticalAlign: VerticalAlign.CENTER,
    shading: head ? { type: ShadingType.CLEAR, fill: NAVY, color: 'auto' } : fill ? { type: ShadingType.CLEAR, fill, color: 'auto' } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ children: [t(String(text ?? ''), { size: o.size || 19, bold: head, color: head ? 'FFFFFF' : undefined })] })],
  });
  return new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: cw,
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((h, i) => cell(h, i, true)) }),
      ...rows.map((r) => new TableRow({ children: r.map((c, i) => cell(c, i, false, o.fill ? o.fill(r, i) : undefined)) })),
    ],
  });
}

function pngSize(file) {
  const b = fs.readFileSync(file);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}
function image(file, widthPx = 600) {
  const { w, h } = pngSize(file);
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 60 },
    children: [new ImageRun({ type: 'png', data: fs.readFileSync(file), transformation: { width: widthPx, height: Math.round((h / w) * widthPx) },
      altText: { title: path.basename(file), description: path.basename(file), name: path.basename(file) } })],
  });
}
const artifact = (dirStart, file) => {
  const dir = fs.readdirSync(path.join(R, 'playwright', 'artifacts')).find((d) => d.startsWith(dirStart));
  return path.join(R, 'playwright', 'artifacts', dir, file);
};

// ---------- numbers ----------
const cls = S.backend.classes;
const sum = (pred) => Object.entries(cls).filter(([k]) => pred(k)).reduce((a, [, v]) => ({ total: a.total + v.total, failed: a.failed + v.failed }), { total: 0, failed: 0 });
const unit = sum((k) => k.startsWith('unit.'));
const integ = sum((k) => k.startsWith('integration.'));
const pw = S.playwright;
const nm = S.newman;
const cov = S.backend.coverage;
const allTests = S.backend.total + S.frontend.total + nm.requests + pw.total;
const decode = (s) => s.replace(/&amp;/g, '&');
const high = defects.filter((d) => d.severity === 'High').length;
const med = defects.filter((d) => d.severity === 'Medium').length;
const low = defects.filter((d) => d.severity === 'Low').length;
const passFill = (row) => (Number(row[4]) > 0 ? 'FEF3C7' : undefined);

// ---------- document ----------
const children = [];

// Cover
children.push(
  new Paragraph({ spacing: { before: 2400 }, children: [t('CO2060 Software Systems Design Project · Group e22', { size: 22, color: GOLD, bold: true })] }),
  new Paragraph({ spacing: { before: 200, after: 120 }, children: [new TextRun({ text: 'Testing Report', font: FONT, size: 64, bold: true, color: NAVY })] }),
  new Paragraph({ spacing: { after: 600 }, children: [new TextRun({ text: 'Debate Management System (VIVAATHI)', font: FONT, size: 36, color: NAVY })] }),
  p(`Final milestone · ${new Date(S.generatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, { size: 24 }),
  p('Git branch: Testing (based on main @ f344c79)', { size: 22, color: '555555' }),
  new Paragraph({ spacing: { before: 1200 }, children: [] }),
  table(['Measure', 'Result'], [
    ['Automated tests / API requests executed', String(allTests)],
    ['Backend line coverage (JaCoCo)', `${cov.TOTAL.lines}%`],
    ['Frontend line coverage (Vitest, auth & routing modules)', `${S.frontend.coverage.lines}%`],
    ['Defects found by testing', `${defects.length} (${high} high, ${med} medium, ${low} low)`],
    ['Lighthouse performance score', `${Math.min(...Object.values(S.lighthouse).map((l) => l.scores.performance))}–100`],
  ], [5, 3]),
  pageBreak(),
);

// TOC
children.push(
  new Paragraph({ children: [new TextRun({ text: 'Contents', font: FONT, size: 32, bold: true, color: NAVY })], spacing: { after: 200 } }),
  new TableOfContents('Contents', { hyperlink: true, headingStyleRange: '1-2' }),
  pageBreak(),
);

// 1. Summary
children.push(
  h1('1. Summary'),
  p('We tested the Debate Management System at four levels: backend unit tests, backend integration tests (including role-based access control), frontend component tests, and end-to-end tests through both the API (Postman) and a real browser (Playwright). We also ran a Lighthouse audit for performance and accessibility. Everything runs from the command line and produces a report file, listed in Section 9.'),
  p('The tests check what the system should do, not what it currently does. When a test failed because of a real problem in the application, we kept the test as it was and recorded the problem as a defect. That is why some tests are shown as failing: each failure matches a defect in Section 7.'),
  table(['Level', 'Tool', 'Tests', 'Passed', 'Failed', 'Coverage'], [
    ['Backend unit', 'JUnit 5 + Mockito', unit.total, unit.total - unit.failed, unit.failed, `${cov.service.lines}% of service layer`],
    ['Backend integration & RBAC', 'MockMvc + H2', integ.total, integ.total - integ.failed, integ.failed, `${cov.TOTAL.lines}% overall (lines)`],
    ['Frontend components', 'Vitest + RTL', S.frontend.total, S.frontend.total - S.frontend.failed, S.frontend.failed, `${S.frontend.coverage.lines}% (lines)`],
    ['API end-to-end', 'Postman / Newman', `${nm.requests} requests / ${nm.assertions} checks`, nm.assertions - nm.failedAssertions, nm.failedAssertions, '44 of 67 endpoints'],
    ['Browser end-to-end', 'Playwright (Edge)', pw.total, pw.passed, pw.total - pw.passed, 'Main user journeys'],
  ], [2.2, 1.8, 1.6, 0.9, 0.9, 2.2], { fill: passFill }),
  p(''),
  p([t('Main findings. ', { bold: true }), t(`Tournament creation, match scoring, results, leaderboards, statistics, connections, messaging and the multi-tab session handling all work end-to-end. Role checks do stop debaters and judges from performing organizer actions. Testing found ${defects.length} defects. The most important are: (1) users can edit other users' profiles and post comments under other people's names; (2) judges never see the organizer's custom score criteria, because the template endpoint fails; and (3) expired logins are never detected by the frontend, because the backend returns 403 instead of 401.`)]),
);

// 2. Strategy
children.push(
  h1('2. Test strategy'),
  p('We followed the testing pyramid: many fast, isolated tests at the bottom and fewer, slower tests that exercise the whole system at the top.'),
  table(['Level', 'What it proves', 'Environment'], [
    ['Unit', 'Business rules in each service (scoring, winners, judge codes, connections, JWT) are correct in isolation', 'Mockito fakes, no database, ~2 s'],
    ['Integration', 'Controllers, security filter, JPA and database work together; every organizer-only endpoint is protected', 'Full Spring Boot app, in-memory H2 (PostgreSQL mode)'],
    ['Component', 'Login, sign-up, role selection, protected routes, session storage and API client behave correctly', 'jsdom, API mocked'],
    ['API end-to-end', 'A realistic scenario across 44 of the 67 endpoints works against the real server and PostgreSQL', 'Backend jar on :8081, PostgreSQL database dms_test'],
    ['Browser end-to-end', 'Real users can complete key journeys in the real UI', 'Vite frontend on :5174 + backend + dms_test, Microsoft Edge'],
    ['Non-functional', 'Performance, accessibility, best practice, SEO', 'Production build, Lighthouse desktop preset'],
  ], [1.4, 4.4, 3]),
  h2('2.1 Scope'),
  bullet('In scope: authentication, roles (DEBATER, JUDGE, ORGANIZER), tournaments, matches, score sheets, results and statistics, connections, messages, diaries, calendar, news, notifications, search, newsletter.'),
  bullet('Test data: every run creates its own users with unique names, so results do not depend on leftover data. End-to-end runs use a separate PostgreSQL database (dms_test), never the development database.'),
  bullet('Out of scope: load testing, testing of the deployed Azure/Vercel environment, and real user-acceptance sessions. A manual test sheet for the team is provided instead (Section 8).'),
  h2('2.2 How results are judged'),
  bullet('Each test states the correct behavior, such as "a debater must get 403 Forbidden". A failing test becomes a defect entry. The test is not weakened to make it pass.'),
  bullet('Where the application blocks an action but answers with the wrong HTTP status code, the test records two things separately: whether the action is blocked (security) and whether the right status code is used (API correctness). This keeps working security separate from a cosmetic code problem.'),
);

// 3. Tools
children.push(h1('3. Tools and frameworks'), table(['Tool', 'Used for', 'Why we chose it'], tools, [2.2, 3.2, 3.6]));

// 4. Results
children.push(
  pageBreak(),
  h1('4. Results by level'),
  h2('4.1 Backend unit tests (JUnit 5 + Mockito)'),
  p('Unit tests cover the business rules. All of them pass.'),
  table(['Test class', 'What is tested', 'Tests', 'Failed'], [
    ['JwtUtilTest', 'Token creation; rejection of expired, tampered, foreign-secret and garbage tokens', cls['unit.JwtUtilTest'].total, cls['unit.JwtUtilTest'].failed],
    ['AuthServiceTest', 'Sign-up per role (stats rows), duplicate username/e-mail, login by username/e-mail, wrong password, no user enumeration', cls['unit.AuthServiceTest'].total, cls['unit.AuthServiceTest'].failed],
    ['ScoreSheetServiceTest', 'Judge identity checks, double submission, winner by average score, tie rule, best-speaker vote, stats update, reopen', cls['unit.ScoreSheetServiceTest'].total, cls['unit.ScoreSheetServiceTest'].failed],
    ['TournamentAndMatchServiceTest', 'Tournament creation with schools/judges/template, duplicate debater, judge codes, match round numbers, next-round pairing', cls['unit.TournamentAndMatchServiceTest'].total, cls['unit.TournamentAndMatchServiceTest'].failed],
    ['SocialServicesTest', 'Connection states, blocking, diary likes/verify/delete permissions, leaderboard points', cls['unit.SocialServicesTest'].total, cls['unit.SocialServicesTest'].failed],
  ], [2.4, 5, 0.8, 0.8]),
  h2('4.2 Backend integration and access-control tests'),
  p('These tests start the whole Spring Boot application with an in-memory database and call it over HTTP using real login tokens.'),
  table(['Test class', 'What is tested', 'Tests', 'Failed'], [
    ['AuthApiIntegrationTest', 'Sign-up/login API, /me, validation, newsletter', cls['integration.AuthApiIntegrationTest'].total, cls['integration.AuthApiIntegrationTest'].failed],
    ['RbacIntegrationTest', 'Organizer-only matrix, public vs private endpoints, forged and expired tokens, status codes', cls['integration.RbacIntegrationTest'].total, cls['integration.RbacIntegrationTest'].failed],
    ['TournamentWorkflowIntegrationTest', 'Full lifecycle: tournament → match → two judges score → winner, stats, leaderboard; social features; 404s', cls['integration.TournamentWorkflowIntegrationTest'].total, cls['integration.TournamentWorkflowIntegrationTest'].failed],
    ['OwnershipSecurityIntegrationTest', "Acting on another user's profile, comments, notifications, tournament; e-mail exposure", cls['integration.OwnershipSecurityIntegrationTest'].total, cls['integration.OwnershipSecurityIntegrationTest'].failed],
  ], [2.6, 4.8, 0.8, 0.8], { fill: (r) => (Number(r[3]) > 0 ? 'FEF3C7' : undefined) }),
  p(''),
  p([t('Role-based access control matrix. ', { bold: true }), t('Each organizer-only endpoint was called by every role. All 28 combinations behave safely: only organizers get through. The footnotes mark where the status code is wrong (DEF-05, DEF-10).')]),
  table(['Organizer-only endpoint', 'Organizer', 'Judge', 'Debater', 'No login'], [
    'POST /api/tournaments', 'DELETE /api/tournaments/{id}', 'POST /api/tournaments/{id}/judges', 'POST /api/matches',
    'POST /api/tournaments/{id}/generate-next-round', 'POST /api/score-templates', 'POST /api/score-sheets/{id}/reopen',
  ].map((e) => [e, 'Allowed ✓', 'Blocked ✓ ¹', 'Blocked ✓ ¹', 'Blocked ✓ ²']), [3.8, 1.2, 1.2, 1.2, 1.2], { size: 18 }),
  p('¹ Returns 400 "Access Denied" instead of 403 (DEF-10).   ² Returns 403 instead of 401 (DEF-05).', { size: 18, color: '555555' }),
  h2('4.3 Frontend component tests (Vitest + React Testing Library)'),
  table(['Test file', 'What is tested', 'Tests', 'Failed'], [
    ['LoginPage.test.tsx', 'Empty form, server error message, redirect per role, password toggle', S.frontend.files['src/pages/auth/LoginPage.test.tsx'].total, 0],
    ['SignupPage.test.tsx', 'Password mismatch/length, judge-only fields, successful sign-up, username taken, role selection', S.frontend.files['src/pages/auth/SignupPage.test.tsx'].total, 0],
    ['App.test.tsx', 'Protected routes: 7 redirects for visitors, 5 wrong-role refusals, 5 allowed cases, unknown URLs', S.frontend.files['src/App.test.tsx'].total, 0],
    ['AuthContext.test.tsx', 'Session restore, login/logout, corrupted storage, cross-tab user switch and logout warnings', S.frontend.files['src/context/AuthContext.test.tsx'].total, 0],
    ['axios.test.ts', 'Bearer token attached; 401 clears session and redirects; 403 does not', S.frontend.files['src/api/axios.test.ts'].total, 0],
    ['utils.test.tsx', 'Notification routing, avatar URLs, toast timeout', S.frontend.files['src/utils/utils.test.tsx'].total, 0],
  ], [2.2, 5.2, 0.8, 0.8]),
  p('All frontend tests pass. The project\'s only existing frontend test was broken (it looked for an old password placeholder after the UI redesign), so it was rewritten.', { before: 120 }),
  h2('4.4 API end-to-end tests (Postman / Newman)'),
  p(`The collection runs ${nm.requests} requests in order as one realistic scenario. The requests share state, such as tokens and ids, through environment variables. Every request also checks that it responds in under 2 seconds. The same collection can be opened in the Postman app for a live demo.`),
  table(['Folder', 'Requests', 'Checks', 'Failed checks'],
    Object.entries(nm.folders).map(([k, v]) => [decode(k), v.requests, v.assertions, v.failedAssertions]),
    [4.5, 1.3, 1.3, 1.6], { fill: (r) => (Number(r[3]) > 0 ? 'FEF3C7' : undefined) }),
  p(`Result: ${nm.assertions - nm.failedAssertions} of ${nm.assertions} checks passed. All ${nm.failedAssertions} failed checks correspond to defects already found by the backend tests, which confirms them against the real PostgreSQL database.`, { before: 120 }),
  h2('4.5 Browser end-to-end tests (Playwright on Microsoft Edge)'),
  table(['Spec', 'Test', 'Result'], pw.tests.map((x) => [x.file.replace('.spec.ts', ''), x.title, x.status === 'passed' ? 'Passed' : 'Failed']),
    [1.6, 6, 1.2], { size: 17, fill: (r) => (r[2] === 'Failed' ? 'FEE2E2' : undefined) }),
  p(`${pw.passed} of ${pw.total} browser tests pass. The ${pw.total - pw.passed} failures show defects DEF-03, DEF-04, DEF-05 and DEF-11 from a real user's point of view. Screenshots and traces are saved for every test.`, { before: 120 }),
  h2('4.6 Non-functional: Lighthouse audit (production build, desktop)'),
  table(['Page', 'Performance', 'Accessibility', 'Best practices', 'SEO', 'LCP'], Object.entries(S.lighthouse).map(([k, v]) => [
    { home: 'Home /', login: 'Login /login', news: 'News /news', roleselect: 'Role select /role-select' }[k] || k,
    v.scores.performance, v.scores.accessibility, v.scores['best-practices'], v.scores.seo, `${(v.lcp / 1000).toFixed(1)} s`,
  ]), [2.6, 1.3, 1.3, 1.4, 0.9, 0.9]),
  p('Performance is excellent on every page. The accessibility and SEO points lost are listed as DEF-15. The home page\'s best-practice deduction is the console error caused by DEF-11.', { before: 120 }),
);

// 5. Coverage
children.push(
  pageBreak(),
  h1('5. Code coverage'),
  h2('5.1 Backend (JaCoCo)'),
  table(['Package', 'Line coverage', 'Branch coverage'], ['service', 'controller', 'security', 'dto', 'entity', 'exception', 'config', 'TOTAL']
    .filter((k) => cov[k]).map((k) => [k === 'TOTAL' ? 'Total' : `com.dms.${k}`, `${cov[k].lines}%`, cov[k].branches === null ? 'n/a' : `${cov[k].branches}%`]), [4, 2.5, 2.5]),
  image(path.join(R, 'images', 'jacoco-overview.png')),
  caption('Figure 1. JaCoCo coverage report for the backend (reports/backend/jacoco/index.html)'),
  h2('5.2 Frontend (Vitest, V8 coverage)'),
  p(`Coverage was measured on the modules containing logic: the API client, the auth context, route protection, the auth pages, utilities, the toast and the session modal. Lines ${S.frontend.coverage.lines}%, statements ${S.frontend.coverage.statements}%, branches ${S.frontend.coverage.branches}%, functions ${S.frontend.coverage.functions}%. Page layouts and dashboards are covered by the Playwright tests instead.`),
  image(path.join(R, 'images', 'vitest-coverage.png')),
  caption('Figure 2. Frontend coverage report (reports/frontend/coverage/index.html)'),
);

// 6. Evidence
children.push(
  pageBreak(),
  h1('6. Test evidence'),
  image(path.join(R, 'images', 'newman-summary.png')),
  caption('Figure 3. Newman HTML report for the Postman API run'),
  image(path.join(R, 'images', 'playwright-report.png')),
  caption('Figure 4. Playwright HTML report (failures listed first)'),
  image(artifact('03-tournament-Tournament-w-52457', 'test-finished-1.png'), 560),
  caption('Figure 5. Playwright: tournament created through the 6-step wizard (passing test)'),
  image(artifact('05-score-sheet-Judge-score-42fc4', 'test-failed-1.png'), 560),
  caption('Figure 6. Playwright evidence for DEF-03: the organizer set "Persuasion" and "Evidence", but the judge sees the built-in criteria'),
  image(path.join(R, 'images', 'app-session-switched.png'), 560),
  caption('Figure 7. Multi-tab conflict warning works (passing test). Its low-contrast styling is DEF-14'),
  image(path.join(R, 'images', 'lighthouse-home.png'), 560),
  caption('Figure 8. Lighthouse report for the home page'),
);

// 7. Defects
children.push(
  pageBreak(),
  h1('7. Defect log'),
  p(`Testing found ${defects.length} defects. None has been fixed yet, because this work only adds tests and does not change application code. Each entry says which test found it and suggests a fix. The same list is in the Excel workbook (sheet "Defect Log") with Status and Assigned-to columns for tracking.`),
  table(['ID', 'Sev.', 'Defect', 'Found by'], defects.map((d) => [d.id, d.severity, d.title, d.foundBy]), [0.9, 0.8, 4.6, 2.7],
    { size: 18, fill: (r, i) => (i === 1 ? { High: 'FEE2E2', Medium: 'FEF3C7', Low: 'E0F2FE' }[r[1]] : undefined) }),
  h2('7.1 Details and suggested fixes'),
  ...defects.flatMap((d) => [
    new Paragraph({ spacing: { before: 160, after: 40 }, children: [t(`${d.id} (${d.severity}, ${d.area}): ${d.title}`, { bold: true, color: NAVY })] }),
    p(d.detail, { after: 40 }),
    p([t('Suggested fix: ', { bold: true }), t(d.fix)], { after: 80 }),
  ]),
  h2('7.2 Other observations'),
  ...observations.map((o) => bullet(o)),
  h2('7.3 Bug resolution history'),
  p('Bugs fixed during development, taken from the project\'s git history. The last column shows which new test now protects each fix against regression.'),
  table(['Commit', 'Date', 'Author', 'Problem fixed', 'Now covered by'], history, [1, 1.1, 1.1, 2.8, 3], { size: 17 }),
);

// 8. Manual testing
children.push(
  h1('8. Manual testing'),
  p('The workbook DMS_Test_Workbook.xlsx contains 40 manual test cases covering every module. Each has preconditions, steps, the expected result, a Status dropdown (Pass / Fail / Blocked / Not run), tester and date columns, and a note on which automated test covers the same behavior. Team members should run these in the browser before the presentation and fill in the results; any failure goes in the Defect Log sheet.'),
);

// 9. Reproduce
children.push(
  h1('9. How to run the tests'),
  table(['Suite', 'Command (from repository root)', 'Report'], [
    ['Backend unit + integration', 'cd backend && mvn test', 'backend/target/site/jacoco/index.html'],
    ['Frontend', 'cd frontend && npx vitest run --coverage', 'frontend/test-results/coverage/index.html'],
    ['API end-to-end', 'cd testing && npm run api   (backend on :8081 with DB_NAME=dms_test)', 'testing/reports/newman/api-report.html'],
    ['Browser end-to-end', 'cd testing && npx playwright test', 'testing/reports/playwright/html/index.html'],
    ['Regenerate this report', 'cd testing && node report/collect.js && node report/build-docx.js', 'testing/reports/DMS_Testing_Report.docx'],
  ], [2, 4.4, 3], { size: 17 }),
  p('A GitHub Actions workflow (.github/workflows/tests.yml) runs the backend, frontend and Postman suites on every push. It will show red until the defects above are fixed, which is intended: the pipeline turns green as fixes land.', { before: 120 }),
  h1('10. Limitations and next steps'),
  bullet('Fix the three high-severity defects first (DEF-01, DEF-02, DEF-03). Then re-run all suites; the matching tests will turn green.'),
  bullet('Coverage is lower in controllers (65%) because several read-only endpoints are exercised only by the Postman run, which JaCoCo does not measure.'),
  bullet('Load and stress testing (for example with k6 or JMeter) and testing against the deployed Azure/Vercel environment were not done.'),
  bullet('Real user-acceptance testing with debaters, judges and organizers is still recommended.'),
);

const doc = new Document({
  creator: 'DMS Team',
  title: 'DMS Testing Report',
  styles: { default: { document: { run: { font: FONT, size: 22 } } } },
  features: { updateFields: true },
  numbering: { config: [{ reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 260 } } } }] }] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: 'DMS Testing Report · Page ', font: FONT, size: 16, color: '777777' }),
      new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: '777777' }),
    ] })] }) },
    children,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  const out = path.join(R, 'DMS_Testing_Report.docx');
  fs.writeFileSync(out, buf);
  console.log('Wrote', out);
});
