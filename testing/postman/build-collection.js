/**
 * Generates DMS_API_E2E.postman_collection.json.
 * Run: node postman/build-collection.js
 * The generated file can be imported into the Postman app or run with Newman (npm run api).
 */
const fs = require('fs');
const path = require('path');

// ---------- helpers ----------
const lines = (s) => s.trim().split('\n').map((l) => l.replace(/^ {0,6}/, ''));

function req(name, method, url, { body, auth, tests = '', pre = '', description } = {}) {
  const headers = [];
  if (auth) headers.push({ key: 'Authorization', value: auth === 'none' ? '' : `Bearer {{${auth}}}` });
  if (body !== undefined) headers.push({ key: 'Content-Type', value: 'application/json' });
  const item = {
    name,
    request: {
      method,
      header: headers.filter((h) => h.value !== ''),
      url: { raw: `{{baseUrl}}${url}`, host: ['{{baseUrl}}'], path: url.split('?')[0].split('/').filter(Boolean) },
      description,
    },
    event: [],
  };
  if (url.includes('?')) {
    item.request.url.query = url.split('?')[1].split('&').map((kv) => {
      const [key, value] = kv.split('=');
      return { key, value };
    });
  }
  if (body !== undefined) {
    item.request.body = { mode: 'raw', raw: typeof body === 'string' ? body : JSON.stringify(body, null, 2) };
  }
  if (pre) item.event.push({ listen: 'prerequest', script: { type: 'text/javascript', exec: lines(pre) } });
  if (tests) item.event.push({ listen: 'test', script: { type: 'text/javascript', exec: lines(tests) } });
  return item;
}

const folder = (name, description, item) => ({ name, description, item });

const status = (code, label) => `
      pm.test("${label || 'Status is ' + code}", () => pm.response.to.have.status(${code}));`;

const signup = (key, role) =>
  req(`Sign up ${role.toLowerCase()} (${key})`, 'POST', '/auth/signup', {
    body: {
      fullName: `Postman ${key}`,
      username: `pm_${key}_{{runId}}`,
      email: `pm_${key}_{{runId}}@test.dms`,
      password: 'password123',
      role,
      bio: 'Created by the Postman E2E run',
    },
    tests: `${status(200)}
      const res = pm.response.json();
      pm.test("Returns a JWT token", () => pm.expect(res.token).to.match(/^[\\w-]+\\.[\\w-]+\\.[\\w-]+$/));
      pm.test("Role is ${role}", () => pm.expect(res.user.role).to.eql("${role}"));
      pm.test("Password hash is never returned", () => pm.expect(res.user).to.not.have.property("passwordHash"));
      pm.environment.set("${key}Token", res.token);
      pm.environment.set("${key}Id", res.user.id);`,
  });

// ---------- collection ----------
const collection = {
  info: {
    name: 'DMS API End-to-End Tests',
    description:
      'End-to-end API scenario for the Debate Management System: authentication, role-based access control, ' +
      'full tournament lifecycle (create → match → judge scoring → results), social features, and security checks.\n\n' +
      'Run against a disposable database. Requests run in order and share state through environment variables.',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  event: [
    {
      listen: 'prerequest',
      script: {
        type: 'text/javascript',
        exec: lines(`
          if (!pm.environment.get("runId")) {
            pm.environment.set("runId", Date.now().toString(36));
          }`),
      },
    },
    {
      listen: 'test',
      script: {
        type: 'text/javascript',
        exec: lines(`
          pm.test("Response time is under 2000 ms", () => pm.expect(pm.response.responseTime).to.be.below(2000));`),
      },
    },
  ],
  variable: [],
  item: [
    folder('01 Health & public pages', 'Endpoints a logged-out visitor uses on the home page.', [
      req('List tournaments (public)', 'GET', '/tournaments', {
        tests: `${status(200)}
          pm.test("Body is an array", () => pm.expect(pm.response.json()).to.be.an("array"));`,
      }),
      req('Top debaters (public)', 'GET', '/users/top-debaters', { tests: status(200) }),
      req('News feed (public)', 'GET', '/news', { tests: status(200) }),
      req('Live matches (used by public home page)', 'GET', '/matches/live', {
        tests: `${status(200, 'Visitors can load live matches (200)')}`,
        description: 'The home page calls this without a token to show the "Live Matches" counter.',
      }),
    ]),

    folder('02 Authentication', 'Sign-up for every role, login with username/email, error handling.', [
      signup('organizer', 'ORGANIZER'),
      signup('judge1', 'JUDGE'),
      signup('judge2', 'JUDGE'),
      signup('debaterA', 'DEBATER'),
      signup('debaterB', 'DEBATER'),
      req('Duplicate username is rejected', 'POST', '/auth/signup', {
        body: { fullName: 'Dup', username: 'pm_organizer_{{runId}}', email: 'other_{{runId}}@test.dms', password: 'password123', role: 'DEBATER' },
        tests: `${status(400)}
          pm.test("Error explains the problem", () => pm.expect(pm.response.json().error).to.eql("Username already taken"));`,
      }),
      req('Invalid e-mail is rejected at signup', 'POST', '/auth/signup', {
        body: { fullName: 'Bad', username: 'pm_bademail_{{runId}}', email: 'not-an-email', password: 'password123', role: 'DEBATER' },
        tests: status(400, 'Invalid e-mail gives 400'),
      }),
      req('Login with username', 'POST', '/auth/login', {
        body: { usernameOrEmail: 'pm_judge1_{{runId}}', password: 'password123' },
        tests: `${status(200)}
          pm.test("Logged in as the judge", () => pm.expect(pm.response.json().user.role).to.eql("JUDGE"));`,
      }),
      req('Login with e-mail', 'POST', '/auth/login', {
        body: { usernameOrEmail: 'pm_judge1_{{runId}}@test.dms', password: 'password123' },
        tests: status(200),
      }),
      req('Login with seeded demo account (organizer1)', 'POST', '/auth/login', {
        body: { usernameOrEmail: 'organizer1', password: 'password123' },
        tests: status(200),
      }),
      req('Login with wrong password', 'POST', '/auth/login', {
        body: { usernameOrEmail: 'pm_judge1_{{runId}}', password: 'wrong' },
        tests: `${status(400)}
          pm.test("Generic 'Invalid credentials' message", () => pm.expect(pm.response.json().error).to.eql("Invalid credentials"));`,
      }),
      req('Current user (/auth/me)', 'GET', '/auth/me', {
        auth: 'debaterAToken',
        tests: `${status(200)}
          pm.test("Returns the logged-in user", () => pm.expect(pm.response.json().id).to.eql(pm.environment.get("debaterAId")));`,
      }),
      req('Current user without token', 'GET', '/auth/me', {
        tests: status(401, 'No token gives 401 Unauthorized'),
      }),
    ]),

    folder('03 Role-based access control', 'Organizer-only actions attempted by other roles and by anonymous callers.', [
      req('Debater tries to create a tournament', 'POST', '/tournaments', {
        auth: 'debaterAToken',
        body: { name: 'Debater Cup', debateType: 'TRADITIONAL', tournamentType: 'LEAGUE' },
        tests: `
          pm.test("Request is blocked (no 2xx)", () => pm.expect(pm.response.code).to.be.within(400, 403));
          pm.test("Blocked by the role check", () => pm.expect(pm.response.text()).to.include("Access Denied"));
          ${status(403, 'Uses HTTP 403 Forbidden')}`,
      }),
      req('Judge tries to create a match', 'POST', '/matches', {
        auth: 'judge1Token',
        body: { tournamentId: 1, propositionSchoolId: 1, oppositionSchoolId: 2, topic: 'x' },
        tests: `
          pm.test("Request is blocked (no 2xx)", () => pm.expect(pm.response.code).to.be.within(400, 403));
          ${status(403, 'Uses HTTP 403 Forbidden')}`,
      }),
      req('Anonymous tries to create a tournament', 'POST', '/tournaments', {
        body: { name: 'Anon Cup', debateType: 'TRADITIONAL', tournamentType: 'LEAGUE' },
        tests: `
          pm.test("Request is blocked (no 2xx)", () => pm.expect(pm.response.code).to.be.within(400, 403));
          ${status(401, 'Uses HTTP 401 Unauthorized')}`,
      }),
      req('Forged token is rejected', 'GET', '/notifications', {
        pre: `pm.request.headers.upsert({ key: "Authorization", value: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJvcmdhbml6ZXIxIn0.forged" });`,
        tests: `pm.test("Forged token is blocked", () => pm.expect(pm.response.code).to.be.oneOf([401, 403]));`,
      }),
      req('Expired token is rejected with 401', 'GET', '/notifications', {
        pre: `
          // Builds a correctly signed but already-expired token using the local JWT secret
          const b64 = (o) => CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(JSON.stringify(o))).replace(/=+$/, "").replace(/\\+/g, "-").replace(/\\//g, "_");
          const now = Math.floor(Date.now() / 1000);
          const head = b64({ alg: "HS256" });
          const body = b64({ sub: "pm_debaterA_" + pm.environment.get("runId"), role: "DEBATER", iat: now - 7200, exp: now - 3600 });
          const sig = CryptoJS.HmacSHA256(head + "." + body, pm.environment.get("jwtSecret")).toString(CryptoJS.enc.Base64).replace(/=+$/, "").replace(/\\+/g, "-").replace(/\\//g, "_");
          pm.request.headers.upsert({ key: "Authorization", value: "Bearer " + head + "." + body + "." + sig });`,
        tests: `
          pm.test("Expired token is blocked", () => pm.expect(pm.response.code).to.be.oneOf([401, 403]));
          ${status(401, 'Uses HTTP 401 so the frontend logs the user out')}`,
      }),
    ]),

    folder('04 Tournament lifecycle', 'Organizer builds a tournament; judges score; results propagate to stats and leaderboard.', [
      req('Organizer creates tournament with schools, judges and template', 'POST', '/tournaments', {
        auth: 'organizerToken',
        body: `{
  "name": "Postman Nationals {{runId}}",
  "debateType": "ASIAN_PARLIAMENTARY",
  "tournamentType": "KNOCKOUT",
  "schools": [
    { "name": "Royal College", "debaterIds": [{{debaterAId}}] },
    { "name": "Trinity College", "debaterIds": [{{debaterBId}}] }
  ],
  "judgeIds": [{{judge1Id}}, {{judge2Id}}],
  "scoreTemplate": { "name": "Standard", "criteriaJson": "[{\\"name\\":\\"Matter\\",\\"max\\":40},{\\"name\\":\\"Manner\\",\\"max\\":40},{\\"name\\":\\"Method\\",\\"max\\":20}]" }
}`,
        tests: `${status(200)}
          const t = pm.response.json();
          pm.test("Two schools created", () => pm.expect(t.schools).to.have.length(2));
          pm.test("Judges get sequential codes", () => pm.expect(t.judges.map(j => j.judgeCode)).to.have.members(["JUDGE-001", "JUDGE-002"]));
          pm.test("Tournament starts ACTIVE", () => pm.expect(t.status).to.eql("ACTIVE"));
          pm.environment.set("tournamentId", t.id);
          pm.environment.set("schoolA", t.schools.find(s => s.name === "Royal College").id);
          pm.environment.set("schoolB", t.schools.find(s => s.name === "Trinity College").id);`,
      }),
      req('Tournament is visible publicly', 'GET', '/tournaments/{{tournamentId}}', {
        tests: `${status(200)}
          pm.test("Correct name", () => pm.expect(pm.response.json().name).to.include("Postman Nationals"));`,
      }),
      req("Organizer's tournaments list", 'GET', '/tournaments/organizer/{{organizerId}}', {
        tests: `${status(200)}
          pm.test("Contains the new tournament", () => pm.expect(pm.response.json().map(t => t.id)).to.include(pm.environment.get("tournamentId")));`,
      }),
      req('Adding the same judge twice is rejected', 'POST', '/tournaments/{{tournamentId}}/judges', {
        auth: 'organizerToken',
        body: `{ "judgeId": {{judge1Id}} }`,
        tests: `${status(400)}
          pm.test("Explains duplicate", () => pm.expect(pm.response.json().error).to.include("already added"));`,
      }),
      req('Score template can be read back (judge score sheet)', 'GET', '/score-templates/{{tournamentId}}', {
        auth: 'judge1Token',
        tests: `${status(200, 'Template loads (200)')}
          pm.test("Template has the organizer's criteria", () => pm.expect(pm.response.text()).to.include("Matter"));`,
      }),
      req('A school cannot debate itself', 'POST', '/matches', {
        auth: 'organizerToken',
        body: `{ "tournamentId": {{tournamentId}}, "propositionSchoolId": {{schoolA}}, "oppositionSchoolId": {{schoolA}}, "topic": "x" }`,
        tests: `${status(400)}`,
      }),
      req('Organizer creates a match with two judges', 'POST', '/matches', {
        auth: 'organizerToken',
        body: `{
  "tournamentId": {{tournamentId}},
  "propositionSchoolId": {{schoolA}},
  "oppositionSchoolId": {{schoolB}},
  "topic": "This house would ban homework",
  "judgeIds": [{{judge1Id}}, {{judge2Id}}],
  "startTime": "2026-10-01T10:00:00"
}`,
        tests: `${status(200)}
          const m = pm.response.json();
          pm.test("Round 1, UPCOMING", () => { pm.expect(m.roundNumber).to.eql(1); pm.expect(m.status).to.eql("UPCOMING"); });
          pm.test("Match code format MATCH-{tournament}-{n}", () => pm.expect(m.matchCode).to.match(/^MATCH-\\d+-\\d+$/));
          pm.environment.set("matchId", m.id);`,
      }),
      req('Judge receives assignment notification', 'GET', '/notifications', {
        auth: 'judge1Token',
        tests: `${status(200)}
          pm.test("Has 'New Judging Assignment'", () => pm.expect(pm.response.json().map(n => n.title)).to.include("New Judging Assignment"));
          pm.environment.set("judge1NotificationId", pm.response.json()[0].id);`,
      }),
      req('Debater sees the match on the tournament page', 'GET', '/tournaments/{{tournamentId}}/matches', {
        tests: `${status(200)}
          pm.test("One match", () => pm.expect(pm.response.json()).to.have.length(1));`,
      }),
      req('Judge 2 cannot submit on behalf of judge 1', 'POST', '/score-sheets/submit', {
        auth: 'judge2Token',
        body: `{ "matchId": {{matchId}}, "judgeId": {{judge1Id}}, "propositionTotal": 99, "oppositionTotal": 1 }`,
        tests: `
          pm.test("Impersonation is blocked", () => pm.expect(pm.response.code).to.be.within(400, 403));
          ${status(403, 'Uses HTTP 403 Forbidden')}`,
      }),
      req('Judge 1 submits scores', 'POST', '/score-sheets/submit', {
        auth: 'judge1Token',
        body: `{ "matchId": {{matchId}}, "judgeId": {{judge1Id}}, "propositionScoresJson": "{}", "oppositionScoresJson": "{}", "propositionTotal": 70, "oppositionTotal": 72, "selectedBestSpeakerId": {{debaterBId}}, "comments": "Close debate" }`,
        tests: `${status(200)}
          pm.test("Confirmation message", () => pm.expect(pm.response.json().message).to.eql("Score sheet submitted successfully"));`,
      }),
      req('Match stays open until all judges submit', 'GET', '/matches/{{matchId}}', {
        auth: 'organizerToken',
        tests: `${status(200)}
          pm.test("Still UPCOMING", () => pm.expect(pm.response.json().status).to.eql("UPCOMING"));`,
      }),
      req('Judge 1 can see their submitted sheet', 'GET', '/score-sheets/{{matchId}}/{{judge1Id}}', {
        auth: 'judge1Token',
        tests: `${status(200, 'Submission loads (200)')}`,
      }),
      req('Judge 2 submits scores', 'POST', '/score-sheets/submit', {
        auth: 'judge2Token',
        body: `{ "matchId": {{matchId}}, "judgeId": {{judge2Id}}, "propositionScoresJson": "{}", "oppositionScoresJson": "{}", "propositionTotal": 65, "oppositionTotal": 74, "selectedBestSpeakerId": {{debaterBId}} }`,
        tests: status(200),
      }),
      req('Match is completed with winner and best speaker', 'GET', '/matches/{{matchId}}', {
        auth: 'organizerToken',
        tests: `${status(200)}
          const m = pm.response.json();
          pm.test("Status COMPLETED", () => pm.expect(m.status).to.eql("COMPLETED"));
          pm.test("Trinity wins on average score", () => pm.expect(m.winnerSchool.name).to.eql("Trinity College"));
          pm.test("Best speaker chosen by judges' votes", () => pm.expect(m.bestSpeaker.id).to.eql(pm.environment.get("debaterBId")));`,
      }),
      req('Judge cannot submit twice', 'POST', '/score-sheets/submit', {
        auth: 'judge1Token',
        body: `{ "matchId": {{matchId}}, "judgeId": {{judge1Id}}, "propositionTotal": 1, "oppositionTotal": 1 }`,
        tests: `${status(400)}
          pm.test("Explains duplicate", () => pm.expect(pm.response.json().error).to.include("already submitted"));`,
      }),
      req('Leaderboard updated', 'GET', '/tournaments/{{tournamentId}}/leaderboard', {
        tests: `${status(200)}
          const b = pm.response.json();
          pm.test("Trinity first with 2 points", () => { pm.expect(b[0].schoolName).to.eql("Trinity College"); pm.expect(b[0].points).to.eql(2); });`,
      }),
      req('Winning debater stats updated', 'GET', '/stats/debater/{{debaterBId}}', {
        tests: `${status(200)}
          const s = pm.response.json();
          pm.test("1 win, 1 best-speaker award", () => { pm.expect(s.wins).to.eql(1); pm.expect(s.playerOfMatchCount).to.eql(1); });`,
      }),
      req('Losing debater stats updated', 'GET', '/stats/debater/{{debaterAId}}', {
        tests: `${status(200)}
          pm.test("1 loss", () => pm.expect(pm.response.json().losses).to.eql(1));`,
      }),
      req('Judge stats updated', 'GET', '/stats/judge/{{judge1Id}}', {
        tests: `${status(200)}
          pm.test("1 match judged", () => pm.expect(pm.response.json().matchesJudged).to.eql(1));`,
      }),
      req('Next round needs at least two winners', 'POST', '/tournaments/{{tournamentId}}/generate-next-round', {
        auth: 'organizerToken',
        tests: `${status(400)}
          pm.test("Explains why", () => pm.expect(pm.response.json().error).to.include("Not enough winners"));`,
      }),
    ]),

    folder('05 Social features', 'Connections, messages, diaries, calendar, news, notifications, search, newsletter.', [
      req('Debater A sends connection request to B', 'POST', '/connections/request/{{debaterBId}}', {
        auth: 'debaterAToken',
        tests: `${status(200)}
          pm.test("PENDING", () => pm.expect(pm.response.json().status).to.eql("PENDING"));
          pm.environment.set("connectionId", pm.response.json().id);`,
      }),
      req('B sees the pending request', 'GET', '/connections/pending', {
        auth: 'debaterBToken',
        tests: `${status(200)}
          pm.test("Has one pending", () => pm.expect(pm.response.json().length).to.be.at.least(1));`,
      }),
      req('A cannot accept their own request', 'PUT', '/connections/accept/{{connectionId}}', {
        auth: 'debaterAToken',
        tests: status(400),
      }),
      req('B accepts', 'PUT', '/connections/accept/{{connectionId}}', {
        auth: 'debaterBToken',
        tests: `${status(200)}
          pm.test("ACCEPTED", () => pm.expect(pm.response.json().status).to.eql("ACCEPTED"));`,
      }),
      req('Connection status is ACCEPTED', 'GET', '/connections/status/{{debaterBId}}', {
        auth: 'debaterAToken',
        tests: `pm.test("ACCEPTED", () => pm.expect(pm.response.json().status).to.eql("ACCEPTED"));`,
      }),
      req('A sends a message to B', 'POST', '/messages', {
        auth: 'debaterAToken',
        body: `{ "receiverId": {{debaterBId}}, "text": "Well played today!" }`,
        tests: status(200),
      }),
      req('B reads messages', 'GET', '/messages', {
        auth: 'debaterBToken',
        tests: `${status(200)}
          pm.test("Message delivered", () => pm.expect(pm.response.json().map(m => m.text)).to.include("Well played today!"));`,
      }),
      req('A writes a diary post', 'POST', '/diaries', {
        auth: 'debaterAToken',
        body: { title: 'Lessons from the final', content: 'Rebuttals win debates.' },
        tests: `${status(200)}
          pm.environment.set("diaryId", pm.response.json().id);`,
      }),
      req('B likes the diary post', 'POST', '/diaries/{{diaryId}}/like', {
        auth: 'debaterBToken',
        tests: `${status(200)}
          pm.test("Like counted", () => pm.expect(pm.response.json().likesCount).to.eql(1));`,
      }),
      req('B comments on the diary post', 'POST', '/diaries/{{diaryId}}/comment', {
        auth: 'debaterBToken',
        body: { comment: 'Great insight!' },
        tests: status(200),
      }),
      req("Debater cannot verify a diary post (organizer-only)", 'PUT', '/diaries/{{diaryId}}/verify?verified=true', {
        auth: 'debaterBToken',
        tests: `pm.test("Blocked", () => pm.expect(pm.response.code).to.be.within(400, 403));`,
      }),
      req('Organizer verifies the diary post', 'PUT', '/diaries/{{diaryId}}/verify?verified=true', {
        auth: 'organizerToken',
        tests: `${status(200)}
          pm.test("Verified", () => pm.expect(pm.response.json().isVerified).to.eql(true));`,
      }),
      req('Public diary list for A', 'GET', '/diaries/user/{{debaterAId}}', {
        tests: `${status(200)}
          pm.test("Post listed", () => pm.expect(pm.response.json()[0].title).to.eql("Lessons from the final"));`,
      }),
      req('Create calendar event', 'POST', '/calendar', {
        auth: 'judge1Token',
        body: { title: 'Judging briefing', eventType: 'JUDGING_ASSIGNMENT', startTime: '2026-10-01T09:00:00', endTime: '2026-10-01T09:30:00', reminderEnabled: true },
        tests: status(200),
      }),
      req('Calendar lists the event', 'GET', '/calendar', {
        auth: 'judge1Token',
        tests: `pm.test("Event present", () => pm.expect(pm.response.json().map(e => e.title)).to.include("Judging briefing"));`,
      }),
      req('Post news article', 'POST', '/news', {
        auth: 'organizerToken',
        body: { title: 'Postman Nationals results', category: 'LATEST_NEWS', content: 'Trinity College won the opening round.' },
        tests: status(200),
      }),
      req('Unread notification count', 'GET', '/notifications/unread-count', {
        auth: 'judge1Token',
        tests: `${status(200)}
          pm.test("Count is a number > 0", () => pm.expect(pm.response.json().count).to.be.above(0));`,
      }),
      req('Mark own notification read', 'PUT', '/notifications/{{judge1NotificationId}}/read', {
        auth: 'judge1Token',
        tests: status(200),
      }),
      req('Search by tournament name', 'GET', '/search?query=Postman', {
        tests: `${status(200)}
          pm.test("Finds the tournament", () => pm.expect(pm.response.json().tournaments.map(t => t.name).join()).to.include("Postman Nationals"));`,
      }),
      req('Newsletter subscribe', 'POST', '/newsletter/subscribe', {
        body: `{ "email": "fan_{{runId}}@test.dms" }`,
        tests: `${status(200)}
          pm.test("Subscribed", () => pm.expect(pm.response.json().message).to.include("Successfully subscribed"));`,
      }),
      req('Newsletter rejects bad e-mail', 'POST', '/newsletter/subscribe', {
        body: { email: 'broken@' },
        tests: status(400),
      }),
    ]),

    folder('06 Ownership & privacy', 'Logged-in users must not change or see data that belongs to someone else.', [
      req("Debater A edits debater B's profile", 'PUT', '/users/{{debaterBId}}', {
        auth: 'debaterAToken',
        body: { bio: 'Edited by someone else' },
        tests: status(403, "Cannot edit another user's profile (403)"),
      }),
      req("Debater B posts a discussion comment as debater A", 'POST', '/discussion', {
        auth: 'debaterBToken',
        body: `{ "tournamentId": {{tournamentId}}, "userId": {{debaterAId}}, "comment": "Posted under someone else's name" }`,
        tests: `${status(403, 'Cannot post as another user (403)')}
          if (pm.response.code === 200) pm.environment.set("forgedCommentId", pm.response.json().id);`,
      }),
      req("Judge 2 deletes a comment they don't own", 'DELETE', '/discussion/{{forgedCommentId}}', {
        auth: 'judge2Token',
        tests: status(403, "Cannot delete another user's comment (403)"),
      }),
      req("Debater marks judge's notification as read", 'PUT', '/notifications/{{judge1NotificationId}}/read', {
        auth: 'debaterAToken',
        tests: status(403, "Cannot modify another user's notification (403)"),
      }),
      req('Anonymous user list hides e-mail addresses', 'GET', '/users', {
        tests: `${status(200)}
          pm.test("No e-mail addresses exposed to visitors", () => pm.expect(pm.response.json().some(u => u.email)).to.eql(false));`,
      }),
    ]),
  ],
};

fs.writeFileSync(path.join(__dirname, 'DMS_API_E2E.postman_collection.json'), JSON.stringify(collection, null, 2));

const environment = {
  name: 'DMS local (dms_test)',
  values: [
    { key: 'baseUrl', value: 'http://localhost:8081/api', enabled: true },
    { key: 'jwtSecret', value: 'change-this-secret-key-to-at-least-32-characters', enabled: true },
    { key: 'runId', value: '', enabled: true },
  ],
};
fs.writeFileSync(path.join(__dirname, 'DMS_local.postman_environment.json'), JSON.stringify(environment, null, 2));

const count = collection.item.reduce((n, f) => n + f.item.length, 0);
console.log(`Wrote collection with ${collection.item.length} folders and ${count} requests.`);
