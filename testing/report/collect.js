/**
 * Reads every raw test output under testing/reports and writes reports/summary.json,
 * which the Word/PDF report and the Excel workbook are generated from.
 * Run: node report/collect.js
 */
const fs = require('fs');
const path = require('path');

const R = path.join(__dirname, '..', 'reports');
const read = (p) => fs.readFileSync(path.join(R, p), 'utf8');

// Minimal JUnit XML parsing (no dependency): count <testcase> and those containing <failure|error>.
function junit(xml) {
  const cases = xml.match(/<testcase\b[\s\S]*?(?:\/>|<\/testcase>)/g) || [];
  const failed = cases.filter((c) => /<(failure|error)\b/.test(c));
  const name = (c) => (c.match(/\bname="([^"]*)"/) || [])[1];
  const cls = (c) => (c.match(/\bclassname="([^"]*)"/) || [])[1];
  return { total: cases.length, failed: failed.length, failures: failed.map((c) => ({ name: name(c), classname: cls(c) })) };
}

// ---- Backend (Surefire + JaCoCo) ----
const sfDir = path.join(R, 'backend', 'surefire-reports');
const backendClasses = {};
for (const f of fs.readdirSync(sfDir).filter((f) => f.startsWith('TEST-') && f.endsWith('.xml'))) {
  const r = junit(fs.readFileSync(path.join(sfDir, f), 'utf8'));
  const cls = f.replace(/^TEST-com\.dms\./, '').replace(/\.xml$/, '').replace(/\$.*/, '');
  const e = (backendClasses[cls] ||= { total: 0, failed: 0 });
  e.total += r.total;
  e.failed += r.failed;
}
const jacoco = read('backend/jacoco/jacoco.csv').trim().split('\n').slice(1).map((l) => l.split(','));
const cov = {};
for (const c of jacoco) {
  const pkg = c[1].split('.').pop();
  const e = (cov[pkg] ||= { lm: 0, lc: 0, bm: 0, bc: 0 });
  e.bm += +c[5]; e.bc += +c[6]; e.lm += +c[7]; e.lc += +c[8];
}
const pct = (miss, hit) => (hit + miss ? Math.round((hit / (hit + miss)) * 1000) / 10 : null);
const backendCoverage = Object.fromEntries(Object.entries(cov).map(([k, v]) => [k, { lines: pct(v.lm, v.lc), branches: pct(v.bm, v.bc) }]));
const tot = Object.values(cov).reduce((a, v) => ({ lm: a.lm + v.lm, lc: a.lc + v.lc, bm: a.bm + v.bm, bc: a.bc + v.bc }), { lm: 0, lc: 0, bm: 0, bc: 0 });
backendCoverage.TOTAL = { lines: pct(tot.lm, tot.lc), branches: pct(tot.bm, tot.bc) };

// ---- Frontend (Vitest) ----
const vit = junit(read('frontend/vitest-junit.xml'));
const vitFiles = {};
for (const c of read('frontend/vitest-junit.xml').match(/<testcase\b[\s\S]*?(?:\/>|<\/testcase>)/g)) {
  const cls = (c.match(/\bclassname="([^"]*)"/) || [])[1];
  const e = (vitFiles[cls] ||= { total: 0, failed: 0 });
  e.total++;
  if (/<(failure|error)\b/.test(c)) e.failed++;
}
const fcov = JSON.parse(read('frontend/coverage/coverage-summary.json')).total;

// ---- Newman ----
const nxml = read('newman/api-junit.xml');
const suites = nxml.match(/<testsuite\b[\s\S]*?<\/testsuite>/g) || [];
const newmanFolders = {};
let reqFailed = 0;
for (const s of suites) {
  const name = (s.match(/\bname="([^"]*)"/) || [])[1] || '';
  const folder = name.split(' / ')[0];
  const r = junit(s);
  const e = (newmanFolders[folder] ||= { requests: 0, assertions: 0, failedAssertions: 0 });
  e.requests++; e.assertions += r.total; e.failedAssertions += r.failed;
  if (r.failed) reqFailed++;
}
const nAll = junit(nxml);

// ---- Playwright ----
const pw = JSON.parse(read('playwright/playwright-results.json'));
const pwTests = [];
(function walk(suite, file) {
  for (const s of suite.suites || []) walk(s, s.file || file);
  for (const spec of suite.specs || []) {
    for (const t of spec.tests) {
      const res = t.results[t.results.length - 1] || {};
      pwTests.push({ file: spec.file || file, title: spec.title, status: res.status || 'skipped', ms: res.duration });
    }
  }
})(pw, '');

// ---- Lighthouse ----
const lighthouse = {};
for (const f of fs.readdirSync(path.join(R, 'lighthouse')).filter((f) => f.endsWith('.report.json'))) {
  const d = JSON.parse(read(`lighthouse/${f}`));
  const a = d.audits;
  lighthouse[f.split('.')[0]] = {
    url: d.finalDisplayedUrl,
    scores: Object.fromEntries(Object.entries(d.categories).map(([k, v]) => [k, Math.round(v.score * 100)])),
    fcp: a['first-contentful-paint'].numericValue, lcp: a['largest-contentful-paint'].numericValue,
    tbt: a['total-blocking-time'].numericValue, cls: a['cumulative-layout-shift'].numericValue,
  };
}

const summary = {
  generatedAt: new Date().toISOString(),
  backend: {
    classes: backendClasses,
    total: Object.values(backendClasses).reduce((a, c) => a + c.total, 0),
    failed: Object.values(backendClasses).reduce((a, c) => a + c.failed, 0),
    coverage: backendCoverage,
  },
  frontend: {
    files: vitFiles, total: vit.total, failed: vit.failed,
    coverage: { lines: fcov.lines.pct, statements: fcov.statements.pct, branches: fcov.branches.pct, functions: fcov.functions.pct },
  },
  newman: { folders: newmanFolders, requests: suites.length, requestsWithFailures: reqFailed, assertions: nAll.total, failedAssertions: nAll.failed },
  playwright: { tests: pwTests, total: pwTests.length, passed: pwTests.filter((t) => t.status === 'passed').length },
  lighthouse,
};
fs.writeFileSync(path.join(R, 'summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify({
  backend: [summary.backend.total, summary.backend.failed, backendCoverage.TOTAL],
  frontend: [vit.total, vit.failed, summary.frontend.coverage.lines],
  newman: [suites.length, nAll.total, nAll.failed],
  playwright: [pwTests.length, summary.playwright.passed],
  lighthouse: Object.fromEntries(Object.entries(lighthouse).map(([k, v]) => [k, v.scores])),
}, null, 1));
