/**
 * Builds reports/DMS_Test_Workbook.xlsx: manual test cases (for the team to execute),
 * the defect log, and a summary of the automated runs.
 * Run: node report/build-xlsx.js
 */
const ExcelJS = require('exceljs');
const path = require('path');
const { defects } = require('./data');
const summary = require('../reports/summary.json');

const NAVY = 'FF06192B';
const header = (ws) => {
  const row = ws.getRow(1);
  row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
  row.alignment = { vertical: 'middle', wrapText: true };
  row.height = 28;
  ws.views = [{ state: 'frozen', ySplit: 1 }];
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: ws.columnCount } };
};
const wrap = (ws) => ws.eachRow((r, i) => { if (i > 1) r.alignment = { vertical: 'top', wrapText: true }; });

// [module, title, preconditions, steps, expected, automated by]
const manual = [
  ['Auth', 'Role selection leads to login', 'Logged out', '1. Open /role-select\n2. Click "Debater"', 'Login page opens showing "Signing in as DEBATER"', 'Vitest, Playwright'],
  ['Auth', 'Sign up as Debater', 'Logged out', '1. Open /signup\n2. Fill name, username, e-mail, password x2\n3. Click Create Account', 'Account created; Debater dashboard opens', 'Playwright'],
  ['Auth', 'Sign up as Judge shows expertise fields', 'Role JUDGE selected', '1. Open /signup\n2. Choose Judge', 'Expertise and Years of Experience fields appear', 'Vitest'],
  ['Auth', 'Password mismatch on sign-up', 'Logged out', '1. Enter different passwords\n2. Submit', 'Error "Passwords do not match"; no account created', 'Vitest'],
  ['Auth', 'Short password on sign-up', 'Logged out', '1. Enter password "abc" twice\n2. Submit', 'Error "Password must be at least 6 characters"', 'Vitest'],
  ['Auth', 'Duplicate username', 'User debater1 exists', 'Sign up again with username debater1', 'Error "Username already taken"', 'JUnit, Postman'],
  ['Auth', 'Login with username', 'Account exists', 'Log in with username + password', 'Correct dashboard opens for the role', 'Vitest, Playwright'],
  ['Auth', 'Login with e-mail', 'Account exists', 'Log in with e-mail + password', 'Login succeeds', 'JUnit, Postman'],
  ['Auth', 'Wrong password', 'Account exists', 'Log in with a wrong password', 'Error "Invalid credentials"; stays on login', 'Playwright'],
  ['Auth', 'Log out', 'Logged in', '1. Open avatar menu\n2. Log Out\n3. Confirm', 'Session cleared; protected pages redirect to role selection', 'Playwright'],
  ['Session', 'Second tab logs in as another user', 'Logged in as Debater in tab A', 'In tab B log in as a Judge', 'Tab A shows "User Account Switched" with the judge username', 'Vitest, Playwright'],
  ['Session', 'Second tab logs out', 'Logged in, two tabs open', 'Log out in tab B', 'Tab A shows "Session Expired / Logged Out"', 'Vitest, Playwright'],
  ['Session', 'Expired session', 'Logged in; token expired (or edited in DevTools)', 'Open Notifications', 'User is sent to the login page', 'Playwright (fails: DEF-05)'],
  ['Access', 'Visitor opens organizer dashboard', 'Logged out', 'Open /dashboard/organizer', 'Redirected to role selection', 'Vitest, Playwright'],
  ['Access', 'Debater opens Create Tournament', 'Logged in as Debater', 'Open /create-tournament', 'Redirected to home', 'Vitest, Playwright'],
  ['Access', 'Judge opens debater dashboard', 'Logged in as Judge', 'Open /dashboard/debater', 'Redirected to home', 'Vitest'],
  ['Tournament', 'Create tournament (6-step wizard)', 'Logged in as Organizer; 2 debaters and 1 judge exist', '1. Name + debate type\n2. Type\n3. Two schools with debaters\n4. Add judge\n5. Criteria\n6. Review, Create', 'Tournament page opens; ACTIVE; 2 schools', 'Playwright, JUnit'],
  ['Tournament', 'Wizard requires a name', 'Organizer on wizard step 1', 'Click Next with an empty name', 'Error "Please enter tournament name"', ''],
  ['Tournament', 'Same debater in two schools', 'Organizer on wizard', 'Add the same debater to two schools and create', 'Error "already assigned to a school"', 'JUnit'],
  ['Tournament', 'Add same judge twice', 'Tournament with judge J', 'Add judge J again', 'Error "Judge already added"', 'JUnit, Postman'],
  ['Match', 'Create a match', 'Tournament with 2 schools', 'Create Match: pick schools, topic, judges', 'Match appears in Round 1 as UPCOMING; judges notified', 'JUnit, Postman'],
  ['Match', 'School cannot debate itself', 'Tournament exists', 'Create match with the same school on both sides', 'Error shown; match not created', 'JUnit, Postman'],
  ['Scoring', 'Judge sees custom criteria', 'Organizer defined custom criteria', 'Judge opens score sheet', "Organizer's criteria are the column headers", 'Playwright (fails: DEF-03)'],
  ['Scoring', 'Judge submits score sheet', 'Judge assigned to match', 'Enter scores and Submit', 'Success message; organizer notified', 'Playwright, Postman'],
  ['Scoring', 'Reopen after submitting', 'Judge already submitted', 'Open the score sheet again', '"Score Sheet Submitted" message shown', 'Playwright (fails: DEF-04)'],
  ['Scoring', 'Match result after all judges submit', 'Two judges assigned', 'Both judges submit', 'Match COMPLETED; winner by average; best speaker by votes', 'JUnit, Postman'],
  ['Scoring', 'Leaderboard & stats', 'Completed match', 'Open Leaderboard tab and debater profiles', 'Winner +2 points; wins/losses updated', 'JUnit, Postman'],
  ['Social', 'Send connection request', 'Two debaters', 'A clicks Connect on B\'s profile', 'B sees a pending request', 'JUnit, Postman'],
  ['Social', 'Accept connection', 'Pending request', 'B accepts', 'Both see each other in connections', 'JUnit, Postman'],
  ['Social', 'Block user', 'A and B connected', 'A blocks B', 'Connection removed; B cannot send requests', 'JUnit'],
  ['Social', 'Send message', 'Two users', 'A sends a message to B', 'B sees the message', 'JUnit, Postman'],
  ['Social', 'Diary post, like, comment', 'Logged in', 'Write post; another user likes and comments', 'Counts update; comment visible', 'JUnit, Postman'],
  ['Social', 'Organizer verifies diary post', 'Diary post exists', 'Debater tries to verify, then organizer verifies', 'Debater blocked; organizer succeeds', 'JUnit, Postman'],
  ['Social', 'Calendar event', 'Logged in', 'Create an event', 'Event listed in calendar', 'JUnit, Postman'],
  ['Notifications', 'Unread count and mark read', 'Has notifications', 'Open bell; open a notification', 'Count decreases', 'Postman'],
  ['Public', 'Home page for visitors', 'Logged out', 'Open /', 'Tournaments, top debaters and live matches load', 'Playwright (fails: DEF-11)'],
  ['Public', 'Search', 'Data exists', 'Search for a debater or tournament name', 'Matching results shown', 'Playwright, Postman'],
  ['Public', 'Newsletter subscribe', 'Logged out', 'Enter e-mail in footer and subscribe', 'Success message; invalid e-mail rejected', 'JUnit, Postman'],
  ['Security', "Edit another user's profile", 'Two accounts', "Send PUT /api/users/{otherId} with your token", 'Request refused (403)', 'JUnit, Postman (fails: DEF-01)'],
  ['UI', 'Mobile layout', 'Phone or 375 px window', 'Open home page', 'No horizontal scrolling; menu usable', 'Playwright'],
];

(async () => {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'DMS Team';

  // --- Manual test cases ---
  const ws = wb.addWorksheet('Manual Test Cases');
  ws.columns = [
    { header: 'ID', width: 9 }, { header: 'Module', width: 13 }, { header: 'Test case', width: 34 },
    { header: 'Preconditions', width: 26 }, { header: 'Steps', width: 42 }, { header: 'Expected result', width: 40 },
    { header: 'Actual result', width: 30 }, { header: 'Status', width: 11 }, { header: 'Tester', width: 14 },
    { header: 'Date', width: 12 }, { header: 'Also automated by', width: 24 },
  ];
  manual.forEach((m, i) => ws.addRow([`TC-${String(i + 1).padStart(2, '0')}`, m[0], m[1], m[2], m[3], m[4], '', '', '', '', m[5]]));
  header(ws); wrap(ws);
  for (let r = 2; r <= manual.length + 1; r++) {
    ws.getCell(`H${r}`).dataValidation = { type: 'list', allowBlank: true, formulae: ['"Pass,Fail,Blocked,Not run"'] };
  }
  ws.addConditionalFormatting({ ref: `H2:H${manual.length + 1}`, rules: [
    { type: 'containsText', operator: 'containsText', text: 'Pass', style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFD1FAE5' } } }, priority: 1 },
    { type: 'containsText', operator: 'containsText', text: 'Fail', style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFEE2E2' } } }, priority: 2 },
  ] });

  // --- Defect log ---
  const dl = wb.addWorksheet('Defect Log');
  dl.columns = [
    { header: 'ID', width: 9 }, { header: 'Severity', width: 10 }, { header: 'Area', width: 14 }, { header: 'Title', width: 42 },
    { header: 'Details', width: 60 }, { header: 'Found by', width: 30 }, { header: 'Suggested fix', width: 44 },
    { header: 'Status', width: 10 }, { header: 'Assigned to', width: 14 }, { header: 'Fixed in commit', width: 16 },
  ];
  defects.forEach((d) => dl.addRow([d.id, d.severity, d.area, d.title, d.detail, d.foundBy, d.fix, 'Open', '', '']));
  header(dl); wrap(dl);
  const sevColor = { High: 'FFFEE2E2', Medium: 'FFFEF3C7', Low: 'FFE0F2FE' };
  dl.eachRow((r, i) => { if (i > 1) r.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: sevColor[r.getCell(2).value] } }; });
  for (let r = 2; r <= defects.length + 1; r++) {
    dl.getCell(`H${r}`).dataValidation = { type: 'list', allowBlank: true, formulae: ['"Open,In progress,Fixed,Verified,Won\'t fix"'] };
  }

  // --- Automated summary ---
  const s = summary;
  const as = wb.addWorksheet('Automated Results');
  as.columns = [{ header: 'Level', width: 30 }, { header: 'Tool', width: 28 }, { header: 'Tests', width: 10 },
    { header: 'Passed', width: 10 }, { header: 'Failed', width: 10 }, { header: 'Coverage (lines)', width: 16 }, { header: 'Report file', width: 50 }];
  as.addRow(['Backend unit tests', 'JUnit 5 + Mockito', ...counts(Object.entries(s.backend.classes).filter(([k]) => k.startsWith('unit.'))), `${s.backend.coverage.TOTAL.lines}% (all backend)`, 'reports/backend/jacoco/index.html']);
  as.addRow(['Backend integration + RBAC', 'MockMvc + H2', ...counts(Object.entries(s.backend.classes).filter(([k]) => k.startsWith('integration.'))), '', 'reports/backend/surefire-reports/']);
  as.addRow(['Frontend component tests', 'Vitest + RTL', s.frontend.total, s.frontend.total - s.frontend.failed, s.frontend.failed, `${s.frontend.coverage.lines}%`, 'reports/frontend/coverage/index.html']);
  as.addRow(['API end-to-end (assertions)', 'Postman / Newman', s.newman.assertions, s.newman.assertions - s.newman.failedAssertions, s.newman.failedAssertions, '', 'reports/newman/api-report.html']);
  as.addRow(['Browser end-to-end', 'Playwright (Edge)', s.playwright.total, s.playwright.passed, s.playwright.total - s.playwright.passed, '', 'reports/playwright/html/index.html']);
  header(as);

  await wb.xlsx.writeFile(path.join(__dirname, '..', 'reports', 'DMS_Test_Workbook.xlsx'));
  console.log(`Workbook written: ${manual.length} manual cases, ${defects.length} defects.`);

  function counts(entries) {
    const t = entries.reduce((a, [, v]) => a + v.total, 0);
    const f = entries.reduce((a, [, v]) => a + v.failed, 0);
    return [t, t - f, f];
  }
})();
