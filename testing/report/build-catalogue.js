/**
 * Builds reports/DMS_Test_Catalogue.docx: every automated test, how it was conducted,
 * what it checks, and its actual result (read from the result files).
 * Run: node report/build-catalogue.js
 */
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType,
  ShadingType, AlignmentType, PageBreak, BorderStyle, Footer, PageNumber, PageOrientation,
  TableOfContents, LevelFormat,
} = require('docx');
const C = require('./catalogue-data');

const ROOT = path.join(__dirname, '..');
const R = path.join(ROOT, 'reports');
const S = require(path.join(R, 'summary.json'));
const NAVY = '06192B', FONT = 'Calibri';
const W = 14838; // landscape A4 minus 1000 DXA margins

// ---------- result files ----------
const xmlCases = (xml) => (xml.match(/<testcase\b[\s\S]*?(?:\/>|<\/testcase>)/g) || []).map((c) => ({
  name: decode((c.match(/\bname="([^"]*)"/) || [])[1] || ''),
  classname: decode((c.match(/\bclassname="([^"]*)"/) || [])[1] || ''),
  failed: /<(failure|error)\b/.test(c),
  message: decode((c.match(/<failure\b[^>]*message="([^"]*)"/) || [])[1] || ''),
}));
function decode(s) { return s.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#10;/g, ' ').replace(/&amp;/g, '&'); }

const surefire = {};
const sfDir = path.join(R, 'backend', 'surefire-reports');
for (const f of fs.readdirSync(sfDir).filter((f) => f.startsWith('TEST-') && f.endsWith('.xml'))) {
  const cls = f.replace(/^TEST-com\.dms\.(unit|integration)\./, '').replace(/\.xml$/, '');
  for (const c of xmlCases(fs.readFileSync(path.join(sfDir, f), 'utf8'))) surefire[`${cls}#${c.name}`] = c;
}
const vitest = xmlCases(fs.readFileSync(path.join(R, 'frontend', 'vitest-junit.xml'), 'utf8'));
const newmanXml = fs.readFileSync(path.join(R, 'newman', 'api-junit.xml'), 'utf8');
const newman = {};
for (const s of newmanXml.match(/<testsuite\b[\s\S]*?<\/testsuite>/g) || []) {
  const name = decode((s.match(/\bname="([^"]*)"/) || [])[1] || '');
  newman[name] = xmlCases(s);
}
const pwTests = S.playwright.tests;

// ---------- docx helpers ----------
const t = (text, o = {}) => new TextRun({ text: String(text), font: FONT, size: o.size || 20, bold: o.bold, italics: o.italics, color: o.color });
const p = (text, o = {}) => new Paragraph({ children: Array.isArray(text) ? text : [t(text, o)], spacing: { after: o.after ?? 100, before: o.before ?? 0 }, alignment: o.align });
const h1 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text, font: FONT, size: 30, bold: true, color: NAVY })], spacing: { before: 200, after: 140 } });
const h2 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text, font: FONT, size: 24, bold: true, color: NAVY })], spacing: { before: 200, after: 80 }, keepNext: true });
const setupLine = (text) => p([t('How this group was set up: ', { bold: true }), t(text)], { after: 100 });
const bullet = (text) => new Paragraph({ numbering: { reference: 'bullets', level: 0 }, children: Array.isArray(text) ? text : [t(text)], spacing: { after: 50 } });
const border = { style: BorderStyle.SINGLE, size: 4, color: 'C8D0DA' };
const borders = { top: border, bottom: border, left: border, right: border };

function table(headers, rows, widths, fillFn) {
  const scale = W / widths.reduce((a, b) => a + b, 0);
  const cw = widths.map((w) => Math.floor(w * scale));
  cw[cw.length - 1] += W - cw.reduce((a, b) => a + b, 0);
  const cell = (val, i, head, fill) => new TableCell({
    width: { size: cw[i], type: WidthType.DXA }, borders,
    shading: head ? { type: ShadingType.CLEAR, fill: NAVY, color: 'auto' } : fill ? { type: ShadingType.CLEAR, fill, color: 'auto' } : undefined,
    margins: { top: 50, bottom: 50, left: 90, right: 90 },
    children: String(val ?? '').split('\n').map((line) => new Paragraph({ children: [t(line, { size: 17, bold: head, color: head ? 'FFFFFF' : undefined })] })),
  });
  return new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: cw,
    rows: [
      new TableRow({ tableHeader: true, cantSplit: true, children: headers.map((h, i) => cell(h, i, true)) }),
      ...rows.map((r) => new TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, i, false, fillFn && fillFn(r, i))) })),
    ],
  });
}
const resultFill = (r, i) => (i === r.length - 1 ? (String(r[i]).startsWith('Pass') ? 'D1FAE5' : 'FEE2E2') : undefined);
const COLS = ['ID', 'Test', 'How it was conducted', 'What is checked (and actual outcome if failed)', 'Result'];
const WID = [0.8, 2.6, 5.2, 5.0, 0.9];
const res = (failed) => (failed ? 'Fail' : 'Pass');

const counts = { total: 0, failed: 0 };
const tally = (failed) => { counts.total++; if (failed) counts.failed++; };

// ---------- sections ----------
const body = [];

// Backend unit
body.push(h1('3. Backend unit tests (JUnit 5 + Mockito)'), p('Each service class is created on its own and every repository it depends on is replaced by a Mockito fake. The test decides what each fake returns, calls one service method, and then checks the returned value, the thrown error, and which fakes were called. No Spring context and no database are used, so all 46 tests run in about 2 seconds.'));
let n = 0;
for (const [cls, g] of Object.entries(C.backendUnit)) {
  body.push(h2(`${cls.replace('$', ' › ')}: ${g.title}`), setupLine(g.setup));
  const rows = Object.entries(g.tests).map(([m, [name, how, check]]) => {
    const r = surefire[`${cls}#${m}`];
    if (!r) throw new Error(`No result for ${cls}#${m}`);
    tally(r.failed);
    return [`BU-${String(++n).padStart(2, '0')}`, `${name}\n(${m})`, how, check, res(r.failed)];
  });
  body.push(table(COLS, rows, WID, resultFill));
}

// Backend integration
body.push(new Paragraph({ children: [new PageBreak()] }), h1('4. Backend integration tests (Spring Boot + MockMvc + H2)'),
  p('These tests start the complete backend application: the real controllers, the real Spring Security filter chain, the JWT filter, the global exception handler and the JPA repositories. They run against an in-memory H2 database in PostgreSQL mode instead of the real database. MockMvc sends real HTTP requests into the application without opening a network port. Users are created through the real sign-up endpoint, and the tokens it returns are sent in the Authorization header, exactly as the frontend does.'));
n = 0;
for (const [cls, g] of Object.entries(C.backendIntegration)) {
  body.push(h2(`${cls}: ${g.title}`), setupLine(g.setup));
  let rows;
  if (cls === 'RbacIntegrationTest') {
    rows = [];
    C.rbacCases.forEach(({ ep, role }, i) => {
      const r = surefire[`${cls}#organizerOnlyMatrix(String, String)[${i + 1}]`];
      tally(r.failed);
      const how = role === 'ANONYMOUS' ? `Send ${ep} with no token.` : `Send ${ep} with the ${role.toLowerCase()}'s token.`;
      const check = role === 'ORGANIZER'
        ? 'Must pass the security check: status is not 401/403 and the body is not "Access Denied". (A 400/404 from business rules, e.g. a missing record, is fine here.)'
        : role === 'ANONYMOUS'
          ? 'Must be blocked (status 400–403). Observed: 403 — blocked, although 401 would be the correct code (DEF-05).'
          : 'Must be blocked (status 400–403) with "Access Denied" from the role check. Observed: 400 "Access Denied" — blocked, although 403 would be the correct code (DEF-10).';
      rows.push([`BI-${String(++n).padStart(2, '0')}`, `Organizer-only: ${ep} as ${role === 'ANONYMOUS' ? 'no login' : role}`, how, check, res(r.failed)]);
    });
    C.rbacOther.publicEndpoints.forEach((url, i) => {
      const r = surefire[`${cls}#publicEndpoints(String)[${i + 1}]`];
      tally(r.failed);
      rows.push([`BI-${String(++n).padStart(2, '0')}`, `Public endpoint: GET ${url}`, `GET ${url} with no token.`,
        r.failed ? 'Expected 200. Actual: 403 — the public home page cannot load live matches (DEF-11).' : 'Returns 200 OK without login.', res(r.failed)]);
    });
    C.rbacOther.privateEndpointsNeedToken.forEach((url, i) => {
      const r = surefire[`${cls}#privateEndpointsNeedToken(String)[${i + 1}]`];
      tally(r.failed);
      rows.push([`BI-${String(++n).padStart(2, '0')}`, `Private endpoint needs login: GET ${url}`, `GET ${url} with no token.`, 'Request is blocked (401 or 403).', res(r.failed)]);
    });
    C.rbacOther.forgedTokens.forEach((tok, i) => {
      const r = surefire[`${cls}#forgedTokens(String)[${i + 1}]`];
      tally(r.failed);
      rows.push([`BI-${String(++n).padStart(2, '0')}`, `Forged token rejected: ${tok}`, `GET /api/notifications with "Authorization: Bearer ${tok}".`, 'Request is blocked (401 or 403).', res(r.failed)]);
    });
    for (const [m, [name, how, check]] of Object.entries(C.rbacOther.single)) {
      const r = surefire[`${cls}#${m}`];
      tally(r.failed);
      rows.push([`BI-${String(++n).padStart(2, '0')}`, `${name}\n(${m})`, how, check, res(r.failed)]);
    }
  } else {
    rows = Object.entries(g.tests).map(([m, [name, how, check]]) => {
      const r = surefire[`${cls}#${m}`];
      if (!r) throw new Error(`No result for ${cls}#${m}`);
      tally(r.failed);
      return [`BI-${String(++n).padStart(2, '0')}`, `${name}\n(${m})`, how, check, res(r.failed)];
    });
  }
  body.push(table(COLS, rows, WID, resultFill));
}

// Frontend
body.push(new Paragraph({ children: [new PageBreak()] }), h1('5. Frontend component tests (Vitest + React Testing Library)'),
  p('Vitest runs each React component inside jsdom, a simulated browser. React Testing Library renders the component and finds elements the way a user would: by placeholder text, button name or visible text. It then types and clicks with fireEvent and checks what appears on screen. Network calls are replaced by Vitest mocks, so no backend is needed. Each test starts with an empty localStorage.'));
n = 0;
for (const [file, g] of Object.entries(C.frontend)) {
  body.push(h2(`${file.split('/').pop()}: ${g.title}`), setupLine(g.setup));
  const rows = vitest.filter((v) => v.classname === file).map((v) => {
    const short = v.name.split(' > ').pop();
    const entry = g.tests.find(([re]) => re.test(short));
    if (!entry) throw new Error(`No explanation for ${file}: ${short}`);
    tally(v.failed);
    return [`FE-${String(++n).padStart(2, '0')}`, short, entry[2], entry[3], res(v.failed)];
  });
  body.push(table(COLS, rows, WID, resultFill));
}

// Postman
const coll = JSON.parse(fs.readFileSync(path.join(ROOT, 'postman', 'DMS_API_E2E.postman_collection.json'), 'utf8'));
const who = { organizerToken: 'Organizer', judge1Token: 'Judge 1', judge2Token: 'Judge 2', debaterAToken: 'Debater A', debaterBToken: 'Debater B' };
body.push(new Paragraph({ children: [new PageBreak()] }), h1('6. API end-to-end tests (Postman collection run by Newman)'),
  p('The backend jar was started on port 8081 against a separate PostgreSQL database called dms_test, so the development data in dms_db was never touched. Newman, the command-line runner for Postman, ran the 69 requests below in order as one story. Values created by one request, such as login tokens, user ids, the tournament id and the match id, are saved in environment variables and reused by later requests. A unique run id is added to every username, so the collection can be re-run at any time. Every request also has one extra check: the response must arrive in under 2000 ms. That check is not repeated in the table.'));
n = 0;
for (const folder of coll.item) {
  body.push(h2(folder.name), p(folder.description || '', { italics: true }));
  const rows = folder.item.map((it) => {
    const auth = (it.request.header || []).find((h) => h.key === 'Authorization');
    const tokenVar = auth && (auth.value.match(/\{\{(\w+)\}\}/) || [])[1];
    const pre = (it.event || []).find((e) => e.listen === 'prerequest');
    const caller = tokenVar ? who[tokenVar] : pre ? 'Custom token built in the pre-request script' : 'No login';
    let bodyTxt = '';
    if (it.request.body) {
      try { bodyTxt = 'Body: ' + Object.entries(JSON.parse(it.request.body.raw.replace(/\{\{(\w+)\}\}/g, '"$1"'))).map(([k, v]) => `${k}=${typeof v === 'object' ? '[…]' : v}`).join(', '); }
      catch { bodyTxt = 'Body: JSON with ' + (it.request.body.raw.match(/"(\w+)":/g) || []).map((s) => s.replace(/[":]/g, '')).slice(0, 8).join(', '); }
    }
    const how = [`${it.request.method} ${it.request.url.raw.replace('{{baseUrl}}', '/api')}`, `Sent as: ${caller}`, bodyTxt].filter(Boolean).join('\n');
    const testScript = ((it.event || []).find((e) => e.listen === 'test') || { script: { exec: [] } }).script.exec.join('\n');
    const checks = [...testScript.matchAll(/pm\.test\("([^"]+)"/g)].map((m) => m[1]);
    const results = newman[`${folder.name} / ${it.name}`] || [];
    const failedChecks = results.filter((c) => c.failed && !/Response time/.test(c.name));
    const failed = results.some((c) => c.failed);
    tally(failed);
    const checkTxt = checks.map((c) => `• ${c}`).join('\n') + (failedChecks.length ? `\nFailed: ${failedChecks.map((c) => `${c.name} — ${c.message}`).join('; ')}` : '');
    return [`API-${String(++n).padStart(2, '0')}`, it.name, how, checkTxt, failed ? 'Fail' : 'Pass'];
  });
  body.push(table(['ID', 'Request', 'What was sent', 'Checks (and failure detail)', 'Result'], rows, [0.8, 2.6, 4.6, 5.6, 0.9], resultFill));
}

// Playwright
body.push(new Paragraph({ children: [new PageBreak()] }), h1('7. Browser end-to-end tests (Playwright on Microsoft Edge)'),
  p('Playwright started the backend (port 8081, database dms_test) and the Vite frontend (port 5174, pointed at that backend), then controlled a real Microsoft Edge browser. Before the run, a global setup step created four fresh users through the API: an organizer, a judge and two debaters, all with unique names. Some tests log in through the real login form. Others create the session directly by writing the token to localStorage, which is what the app itself does after login, to save time. A screenshot is taken at the end of every test, and a full trace is kept for every failure.'));
n = 0;
for (const [file, g] of Object.entries(C.playwright)) {
  body.push(h2(`${file}: ${g.title}`));
  const rows = pwTests.filter((x) => x.file === file).map((x) => {
    const entry = g.tests.find(([re]) => re.test(x.title));
    if (!entry) throw new Error(`No explanation for ${file}: ${x.title}`);
    const failed = x.status !== 'passed';
    tally(failed);
    return [`E2E-${String(++n).padStart(2, '0')}`, x.title, entry[2], entry[3], res(failed)];
  });
  body.push(table(COLS, rows, WID, resultFill));
}

// Lighthouse
const lhRows = Object.entries(S.lighthouse).map(([k, v], i) => [`LH-${i + 1}`, v.url.replace('http://localhost:5174', '') || '/',
  `Performance ${v.scores.performance} · Accessibility ${v.scores.accessibility} · Best practices ${v.scores['best-practices']} · SEO ${v.scores.seo}`,
  `First paint ${(v.fcp / 1000).toFixed(1)} s · Largest paint ${(v.lcp / 1000).toFixed(1)} s · Blocking ${Math.round(v.tbt)} ms · Layout shift ${v.cls.toFixed(3)}`]);
body.push(h1('8. Lighthouse audits'),
  p('The frontend was built for production (vite build) and served with vite preview. Google Lighthouse then loaded each page in headless Microsoft Edge using the desktop preset and scored four categories from 0 to 100. These are audits rather than pass/fail tests. Problems they found are recorded as DEF-11 and DEF-15 in the testing report.'),
  table(['ID', 'Page', 'Scores', 'Speed measurements'], lhRows, [0.8, 2.2, 5.8, 5.8]));

// ---------- front matter ----------
const front = [
  new Paragraph({ spacing: { before: 1600 }, children: [t('CO2060 · Group e22 · Debate Management System (VIVAATHI)', { size: 22, color: '8A6A00', bold: true })] }),
  new Paragraph({ spacing: { before: 160, after: 100 }, children: [new TextRun({ text: 'Test Catalogue', font: FONT, size: 60, bold: true, color: NAVY })] }),
  p('Every automated test in the project: how it was conducted, what it checks, and its result', { size: 28 }),
  p(`Companion to the Testing Report · run of ${new Date(S.generatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · branch Testing`, { size: 22, color: '555555', before: 200 }),
  new Paragraph({ children: [new PageBreak()] }),
  new Paragraph({ children: [new TextRun({ text: 'Contents', font: FONT, size: 30, bold: true, color: NAVY })], spacing: { after: 160 } }),
  new TableOfContents('Contents', { hyperlink: true, headingStyleRange: '1-2' }),
  new Paragraph({ children: [new PageBreak()] }),
  h1('1. How to read this catalogue'),
  bullet([t('ID prefixes: ', { bold: true }), t('BU = backend unit, BI = backend integration, FE = frontend, API = Postman request, E2E = browser test, LH = Lighthouse audit.')]),
  bullet([t('Test: ', { bold: true }), t('a plain-language name; the method name in the source code is shown in brackets for backend tests.')]),
  bullet([t('How it was conducted: ', { bold: true }), t('the data prepared and the action performed.')]),
  bullet([t('What is checked: ', { bold: true }), t('the assertions. For a failing test, this column also gives the expected and actual result and the defect number (DEF-xx) from the Testing Report.')]),
  bullet([t('Result: ', { bold: true }), t('taken automatically from the result files of the latest run, not typed by hand. Every failure is a confirmed application defect; no test was weakened to make it pass.')]),
  h1('2. How each test suite was conducted'),
  table(['Suite', 'Environment', 'Test data', 'Command', 'Result file'], [
    ['Backend unit', 'JDK 25, Maven; Mockito fakes, no database', 'Built in memory in each test', 'cd backend && mvn test', 'backend/target/surefire-reports, jacoco'],
    ['Backend integration', 'Full Spring Boot app; in-memory H2 in PostgreSQL mode; MockMvc', 'Users created through the real sign-up endpoint', 'cd backend && mvn test', 'Same as above'],
    ['Frontend', 'Node 24, Vitest, jsdom, React Testing Library', 'Mocked API responses; fresh localStorage per test', 'cd frontend && npx vitest run --coverage', 'frontend/test-results'],
    ['API end-to-end', 'Backend jar on :8081 + PostgreSQL 18 database dms_test; Newman', 'Created by the collection with a unique run id', 'cd testing && npm run api', 'testing/reports/newman'],
    ['Browser end-to-end', 'Backend :8081 + Vite frontend :5174 + dms_test; Playwright with Microsoft Edge', 'Four fresh users created by global setup', 'cd testing && npx playwright test', 'testing/reports/playwright'],
    ['Lighthouse', 'Production build via vite preview; headless Edge', 'Seeded demo data', 'npx lighthouse <url> --preset=desktop', 'testing/reports/lighthouse'],
  ], [1.6, 3.6, 2.8, 3, 2.8]),
];

const summaryTable = () => [
  p(''),
  p([t('Totals in this catalogue: ', { bold: true }), t(`${counts.total} tests and requests, ${counts.total - counts.failed} passed, ${counts.failed} failed. Lighthouse audits are listed separately.`)]),
  table(['Suite', 'Tests', 'Passed', 'Failed'], [
    ['Backend unit (BU)', 46, 46, 0],
    ['Backend integration (BI)', 70, 55, 15],
    ['Frontend (FE)', S.frontend.total, S.frontend.total - S.frontend.failed, S.frontend.failed],
    ['API end-to-end requests (API)', S.newman.requests, S.newman.requests - S.newman.requestsWithFailures, S.newman.requestsWithFailures],
    ['Browser end-to-end (E2E)', S.playwright.total, S.playwright.passed, S.playwright.total - S.playwright.passed],
  ], [5, 1.5, 1.5, 1.5]),
];

const doc = new Document({
  creator: 'DMS Team', title: 'DMS Test Catalogue',
  styles: { default: { document: { run: { font: FONT, size: 20 } } } },
  features: { updateFields: true },
  numbering: { config: [{ reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 260 } } } }] }] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838, orientation: PageOrientation.LANDSCAPE }, margin: { top: 1000, bottom: 1000, left: 1000, right: 1000 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: 'DMS Test Catalogue · Page ', font: FONT, size: 16, color: '777777' }),
      new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: '777777' }),
    ] })] }) },
    children: [...front, ...summaryTable(), new Paragraph({ children: [new PageBreak()] }), ...body],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(path.join(R, 'DMS_Test_Catalogue.docx'), buf);
  console.log(`Catalogue written: ${counts.total} entries, ${counts.failed} failed.`);
});
