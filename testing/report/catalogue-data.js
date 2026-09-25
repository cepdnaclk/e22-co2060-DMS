/**
 * Plain-language explanation of every automated test: how it was set up and run ("how")
 * and what it asserts ("checks"). Keys match the test names in the result files.
 * Postman entries are generated directly from the collection in build-catalogue.js.
 */

// ---------------- Backend unit tests (JUnit 5 + Mockito) ----------------
const backendUnit = {
  JwtUtilTest: {
    title: 'JwtUtil: login token creation and validation',
    setup: 'A JwtUtil object is created directly with a test secret and a 60-second lifetime. No Spring, no database.',
    tests: {
      generateAndValidate: ['Generated token is valid and carries the username', 'Create a token for "debater1" with role DEBATER, then validate it and read the username back.', 'Token is not blank and has 3 dot-separated parts; validateToken returns true; extractUsername returns "debater1".'],
      expiredTokenIsRejected: ['Expired token is rejected', 'A second JwtUtil with a lifetime of -1 second creates a token that is already expired; the normal JwtUtil validates it.', 'validateToken returns false.'],
      tamperedTokenIsRejected: ['Tampered token is rejected', "Take a debater's token and swap its middle part (payload) for an organizer's payload, keeping the original signature — simulating someone editing their role.", 'validateToken returns false (signature no longer matches).'],
      tokenFromOtherSecretIsRejected: ['Token signed with a different secret is rejected', 'An "attacker" JwtUtil with a different secret creates an ORGANIZER token; our JwtUtil validates it.', 'validateToken returns false.'],
      garbageTokensAreRejected: ['Garbage, empty and null tokens are rejected', 'Validate the strings "not-a-jwt", "" and null.', 'All three return false and no exception is thrown.'],
    },
  },
  AuthServiceTest: {
    title: 'AuthService: sign-up and login rules',
    setup: 'AuthService runs with Mockito fakes for UserRepository, DebaterStatsRepository, JudgeStatsRepository, PasswordEncoder and JwtUtil, so only the service logic is exercised.',
    tests: {
      signupDebater: ['Debater sign-up hashes password, creates stats, returns token', 'Call signup() for a DEBATER; the fake encoder returns "HASH" and the fake JwtUtil returns "TOKEN".', 'Response has token "TOKEN", username and role DEBATER; the saved user has password hash "HASH" (never the plain password); a DebaterStats row is saved; judge stats are never touched.'],
      signupJudge: ['Judge sign-up creates judge stats', 'Call signup() for a JUDGE.', 'A JudgeStats row is saved; debater stats are never touched.'],
      signupOrganizer: ['Organizer sign-up creates no stats rows', 'Call signup() for an ORGANIZER.', 'Neither stats repository is used.'],
      signupDuplicateUsername: ['Taken username is rejected', 'The fake repository says the username already exists; call signup().', 'Error "Username already taken"; nothing is saved.'],
      signupDuplicateEmail: ['Registered e-mail is rejected', 'The fake repository says the e-mail already exists; call signup().', 'Error "Email already registered"; nothing is saved.'],
      loginWithUsername: ['Login with username and correct password', 'Fake repository finds user "deb"; fake encoder says the password matches.', 'A token is returned.'],
      loginWithEmail: ['Login with e-mail falls back to e-mail lookup', 'Lookup by username finds nothing, lookup by e-mail finds the user.', 'Login succeeds and returns user "deb".'],
      loginWrongPassword: ['Wrong password is rejected', 'User exists but the fake encoder says the password does not match.', 'Error "Invalid credentials"; no token is generated.'],
      loginUnknownUser: ['Unknown user gets the same generic error', 'Neither username nor e-mail lookup finds a user.', 'Error is the same "Invalid credentials" text, so attackers cannot tell which usernames exist.'],
      getMe: ['getMe returns the current user', 'Fake repository returns user with id 7.', 'Returned profile has id 7.'],
    },
  },
  ScoreSheetServiceTest: {
    title: 'ScoreSheetService: judge scoring and match results',
    setup: 'In-memory objects are built for an organizer, two judges (judge1, judge2), two debaters, two schools (Royal = proposition, Trinity = opposition) and one match with both judges assigned. All ten repositories are Mockito fakes.',
    tests: {
      rejectsImpersonation: ['A judge cannot submit on behalf of another judge', 'Logged in as judge1, submit a score sheet whose judgeId is judge2.', 'Error "only submit scores as yourself"; nothing is saved.'],
      rejectsUnassignedJudge: ['A judge not assigned to the match cannot submit', 'The fake repository says judge1 is not assigned to the match; judge1 submits.', 'Error "not assigned".'],
      rejectsDoubleSubmission: ['A judge cannot submit twice', 'The fake repository says judge1 already submitted; judge1 submits again.', 'Error "already submitted".'],
      partialSubmissionKeepsMatchOpen: ['First of two judges submitting leaves the match open', 'Only judge1 submits (70 vs 60, best speaker debater A); judge2 has not.', 'judge1 is marked submitted; match stays UPCOMING with no winner; the organizer is notified "Score Sheet Submitted".'],
      allSubmittedCompletesMatch: ['When all judges submit, the winner is decided by average score', 'judge1 already submitted (70 vs 60). judge2 now submits 50 vs 75. Both chose debater B as best speaker. Averages: proposition 60, opposition 67.5.', 'Match becomes COMPLETED; winner is Trinity (opposition); best speaker is debater B; B\'s stats get 1 win, 1 match, 1 best-speaker award; A\'s stats get 1 loss; organizer is notified "Match Completed ... Trinity".'],
      tieGoesToProposition: ['A tie goes to the proposition', 'Two submissions: 60 vs 70 and 70 vs 60 (averages equal); no best speaker chosen.', 'Winner is the proposition school (the rule in the code: prop ≥ opp); best speaker is empty.'],
      reopen: ['Reopening a sheet un-marks the judge', 'A submitted sheet for judge1 is reopened by id.', 'Sheet is flagged reopened; judge1 is no longer marked as submitted, so they can score again.'],
      reopenMissing: ['Reopening a missing sheet reports "not found"', 'Reopen id 99, which the fake repository does not have.', 'Error contains "not found" (the API turns this into HTTP 404).'],
    },
  },
  'TournamentAndMatchServiceTest$TournamentTests': {
    title: 'TournamentService: creating tournaments and judges',
    setup: 'Fake repositories return an organizer ("org"), a judge (id 10), a debater (id 20) and tournament 100. Saving returns the object with an id.',
    tests: {
      createFull: ['Creating a tournament saves everything and notifies everyone', 'createTournament() with name "Nationals", one school "Royal" containing the debater, one judge and a score template.', 'Tournament saved with name Nationals and the organizer; debater linked to the school; judge saved with code JUDGE-001; template saved; notifications sent to the debater ("Tournament Assigned"), judge ("Tournament Judge Assignment") and organizer ("Tournament Created").'],
      unknownDebater: ['Unknown debater id is rejected', 'Create a tournament with debater id 999, which does not exist.', 'Error "Debater not found".'],
      duplicateDebater: ['The same debater cannot be in two schools of one tournament', 'The fake repository says the debater is already assigned in this tournament.', 'Error "already assigned".'],
      addJudgeCode: ['Adding a judge gets the next judge code', 'The tournament already has 2 judges; add another.', 'New judge code is JUDGE-003.'],
      addJudgeTwice: ['Adding the same judge twice is rejected', 'The fake repository says this judge is already in the tournament.', 'Error "already added".'],
      missingTournament: ['Looking up a missing tournament', 'getTournamentById(404).', 'Error "Tournament not found".'],
    },
  },
  'TournamentAndMatchServiceTest$MatchTests': {
    title: 'MatchService: creating matches and knockout rounds',
    setup: 'Same fakes as above plus two schools, Royal (200) and Trinity (201), in tournament 100.',
    tests: {
      sameSchool: ['A school cannot debate itself', 'createMatch() with Royal as both proposition and opposition.', 'Error "cannot be the same".'],
      createMatch: ['Creating a match sets round, code and notifies the judge', 'The tournament already has round 2 and 2 matches; create a new match with judge 10.', 'Match saved as round 3 with code MATCH-100-3; judge link is "/score-sheet/55/10"; judge notified "New Judging Assignment".'],
      nextRoundBlockedUntilComplete: ['Next round is blocked while matches are unfinished', 'Round 1 has one match that is not completed; call generateNextRound().', 'Error "Not all matches".'],
      nextRoundPairsWinners: ['Next round pairs the winners', 'Round 1 has two completed matches; winners are Royal and school B.', 'A round-2 match is saved with Royal vs B.'],
    },
  },
  'SocialServicesTest$Connections': {
    title: 'ConnectionService: connect, accept, block',
    setup: 'Users alice (debater), bob (debater) and org (organizer) exist in fake repositories.',
    tests: {
      sendRequest: ['Sending a request creates a PENDING connection', 'alice sends a request to bob.', 'Status is PENDING; bob is notified "New Connection Request".'],
      selfConnect: ['Cannot connect with yourself', 'alice sends a request to alice.', 'Error "Cannot connect with yourself".'],
      blocked: ['Blocked users cannot send requests', 'The fake block repository says alice and bob have a block.', 'Error "Action blocked".'],
      duplicate: ['Duplicate request is rejected', 'A connection between alice and bob already exists.', 'Error "already exists".'],
      onlyReceiverAccepts: ['Only the receiver can accept', 'alice → bob request exists. First alice tries to accept it, then bob accepts.', 'alice gets "Not authorized"; after bob accepts, status is ACCEPTED.'],
      blockRemovesConnection: ['Blocking removes the existing connection', 'alice and bob are connected; alice blocks bob.', 'The connection is deleted and a Block is saved.'],
      statuses: ['Connection status is reported correctly in every state', 'Check status for: self; no connection; pending sent by alice; same from bob\'s side; accepted; blocked.', 'Returns SELF, NONE, PENDING_SENT, PENDING_RECEIVED, ACCEPTED and BLOCKED respectively.'],
    },
  },
  'SocialServicesTest$Diaries': {
    title: 'DiaryService: likes, verification, deletion',
    setup: 'A diary post (id 5) written by alice exists in the fake repository.',
    tests: {
      toggleLike: ['Like toggles on and off', 'bob likes the post, then likes it again.', 'After the first call bob is in the likes; after the second he is removed.'],
      verifyRequiresOrganizer: ['Only organizers can verify a post', 'bob (debater) tries to verify; then org verifies.', 'bob gets "Only organizers"; after org, the post is verified.'],
      deletePermissions: ['Only the author or an organizer can delete', 'bob tries to delete alice\'s post; then alice deletes; then org deletes.', 'bob gets "Unauthorized"; alice and org both succeed (delete called twice).'],
      share: ['Sharing increments the share count', 'An anonymous visitor shares the post.', 'shareCount becomes 1.'],
    },
  },
  'SocialServicesTest$Stats': {
    title: 'StatsService: leaderboard and statistics',
    setup: 'Tournament with schools A, B, C. Match 1: A vs B, B wins. Match 2: B vs C, B wins. Match 3: A vs C, not finished.',
    tests: {
      leaderboard: ['Leaderboard gives 2 points per win and sorts by points', 'Build the tournament leaderboard.', 'B is first with 4 points and 100% win rate; A has 1 played, 1 loss; the unfinished match is ignored.'],
      debaterStatsDefault: ['Debater with no stats row gets zeros', 'The fake repository has no stats for alice.', 'Returned stats show 0 matches and 0 wins instead of an error.'],
    },
  },
};

// ---------------- Backend integration tests (Spring Boot + MockMvc + H2) ----------------
const backendIntegration = {
  AuthApiIntegrationTest: {
    title: 'Authentication API',
    setup: 'The whole Spring Boot application starts with an empty in-memory H2 database. Requests go through MockMvc, including the real security filter chain and exception handler.',
    tests: {
      signupReturnsToken: ['Sign-up returns a token and a safe profile', 'POST /api/auth/signup for a new DEBATER "newdeb".', '200 OK; token is present; username "newdeb"; role DEBATER; the response has no passwordHash field.'],
      duplicateUsername: ['Duplicate username is rejected', 'Sign up a user, then sign up again with the same username and a different e-mail.', '400 Bad Request with error "Username already taken".'],
      loginWithUsernameOrEmail: ['Login works with username and with e-mail', 'Sign up a JUDGE, then POST /api/auth/login with the username, then with the e-mail.', 'Both return 200; role is JUDGE.'],
      loginWrongPassword: ['Wrong password is rejected', 'Sign up a user, then log in with password "nope".', '400 with error "Invalid credentials".'],
      meWithToken: ['/api/auth/me returns the logged-in user', 'Sign up an ORGANIZER and call GET /api/auth/me with their token.', '200; username matches.'],
      signupMissingPassword: ['Sign-up without a password is rejected', 'POST /api/auth/signup with no password field.', '400 Bad Request.'],
      signupInvalidEmail: ['Sign-up with an invalid e-mail is rejected', 'POST /api/auth/signup with e-mail "not-an-email".', 'Expected 400. Actual: 200, and the account was created (DEF-13).'],
      newsletter: ['Newsletter subscribe, repeat and invalid e-mail', 'POST /api/newsletter/subscribe with fan@test.dms twice, then with "broken@".', 'First: 200 "Successfully subscribed". Second: 200 "already subscribed". Invalid: 400.'],
    },
  },
  RbacIntegrationTest: {
    title: 'Role-based access control (RBAC)',
    setup: 'Before the tests: sign up one organizer, one judge and two debaters through the API; the organizer creates a tournament with two schools and the judge. Each test then calls the API with one of these users\' tokens, or with no token.',
    tests: {}, // expanded in build-catalogue.js
  },
  TournamentWorkflowIntegrationTest: {
    title: 'Full workflows',
    setup: 'Each test signs up its own fresh users through the API, so tests do not affect each other.',
    tests: {
      fullTournamentLifecycle: ['Complete tournament lifecycle', '1) Sign up an organizer, 2 judges, 2 debaters. 2) Organizer creates a tournament (Royal College vs Trinity College, both judges). 3) GET the tournament. 4) Organizer creates a match with both judges. 5) Judge 1 checks notifications. 6) Judge 1 submits 70 vs 72; match checked; judge 2 submits 65 vs 74; both choose debater B as best speaker. 7) Read match, stats and leaderboard. 8) Judge 1 tries to submit again.', 'Tournament has 2 schools and judge codes JUDGE-001/002; match is round 1, UPCOMING; judge 1 has "New Judging Assignment"; after only judge 1 the match is still UPCOMING; after both it is COMPLETED, winner Trinity College, best speaker debater B; debater B: 1 win, 1 best-speaker; debater A: 1 loss; judge 1: 1 match judged; leaderboard: Trinity first with 2 points; repeat submission: 400 "already submitted".'],
      connectionFlow: ['Connection request → accept → block', 'Debater A requests B; B checks status; B accepts; A lists connections and count; A blocks B; B tries to send a request to A.', 'B sees PENDING_RECEIVED; accept returns 200; A\'s list contains B; count is 1; block returns 200; B\'s request gets 400 "Action blocked".'],
      socialContent: ['Messages, diary, calendar and news', 'A messages B; B reads messages. A writes a diary post; B likes and comments; anyone reads A\'s diary; B (a judge) tries to verify it. A creates a calendar event and lists it. A posts a news article; anyone reads news.', 'B sees "Good luck!"; like and comment return 200; public diary shows "Round 1"; judge verify is refused (400); calendar shows "Practice"; news shows "Finals announced".'],
      search: ['Search finds tournaments by name', 'Organizer creates "Zebra Invitational"; anonymous GET /api/search?query=Zebra.', '200; results include "Zebra Invitational".'],
      scoreTemplateReadBack: ['Score-sheet template can be read back', 'Organizer creates a tournament with a template named "Default"; then GET /api/score-templates/{id}.', 'Expected 200 containing "Default". Actual: 400 "Type definition error ... ByteBuddyInterceptor" (DEF-03).'],
      submissionReadBack: ['A submitted score sheet can be read back', 'Create tournament and match; the judge submits; then GET /api/score-sheets/{match}/{judge}.', 'Expected 200. Actual: 400 with the same serialization error (DEF-04).'],
      notFound: ['Missing records return 404', 'GET tournament 999999, match 999999 (logged in) and user 999999.', 'All three return 404 Not Found.'],
    },
  },
  OwnershipSecurityIntegrationTest: {
    title: 'Ownership and data exposure',
    setup: 'Before the tests: sign up debaters alice and bob, organizers A and B, and a judge. Organizer A creates a tournament containing alice, bob and the judge.',
    tests: {
      cannotEditOthersProfile: ["Cannot edit another user's profile", 'alice sends PUT /api/users/{bob\'s id} with bio "hacked by alice".', 'Expected 403. Actual: 200 and bob\'s bio was changed (DEF-01).'],
      canEditOwnProfile: ['Can edit own profile', 'alice sends PUT /api/users/{alice\'s id} with bio "Debater from Kandy".', '200; bio is updated.'],
      cannotImpersonateInDiscussion: ['Cannot post a comment as someone else', 'alice sends POST /api/discussion with userId = bob\'s id.', 'Expected 403. Actual: 200 and the comment is shown as written by bob (DEF-02).'],
      cannotDeleteOthersComment: ["Cannot delete another user's comment", 'bob posts a comment; alice sends DELETE /api/discussion/{id}.', 'Expected 403. Actual: 204 and the comment is deleted (DEF-07).'],
      cannotDeleteOtherOrganizersTournament: ["Organizer cannot delete another organizer's tournament", 'Organizer A creates a tournament; organizer B sends DELETE /api/tournaments/{id}.', 'Expected 403. Actual: 204 and the tournament is deleted (DEF-06).'],
      cannotReadOthersNotification: ["Cannot mark another user's notification read", 'Get alice\'s first notification id; bob sends PUT /api/notifications/{id}/read.', 'Expected 403. Actual: 200 (DEF-09).'],
      judgeImpersonationStatusCode: ['Judge impersonation gets 403', 'A second judge submits a score sheet using the assigned judge\'s id.', 'Expected 403. Actual: 400 — the attempt is blocked, but with the wrong status code (DEF-10).'],
      publicUserListHidesEmails: ['Public user list hides e-mail addresses', 'Anonymous GET /api/users.', "Expected no e-mail addresses. Actual: every user's e-mail is listed (DEF-08)."],
    },
  },
};

// RBAC parameterised cases, in the order JUnit ran them
const rbacEndpoints = [
  'DELETE /api/tournaments/{id}', 'POST /api/matches', 'POST /api/score-sheets/{id}/reopen', 'POST /api/score-templates',
  'POST /api/tournaments', 'POST /api/tournaments/{id}/generate-next-round', 'POST /api/tournaments/{id}/judges',
];
const rbacRoles = ['ORGANIZER', 'JUDGE', 'DEBATER', 'ANONYMOUS'];
const rbacCases = [];
rbacEndpoints.forEach((ep) => rbacRoles.forEach((role) => rbacCases.push({ ep, role })));
const rbacOther = {
  publicEndpoints: ['/api/tournaments', '/api/news', '/api/users/top-debaters', '/api/users/organizers', '/api/search?query=a', '/api/matches/live'],
  privateEndpointsNeedToken: ['/api/notifications', '/api/messages', '/api/calendar', '/api/connections', '/api/notifications/unread-count', '/api/matches/1'],
  forgedTokens: ['"garbage"', 'a JWT with a made-up signature for organizer1'],
  single: {
    privateEndpointWithToken: ['Private endpoint works with a valid token', 'Debater calls GET /api/notifications with their token.', '200 OK.'],
    expiredTokenGets401: ['Expired token gets 401', 'Build a token for the debater, correctly signed with the test secret but expired 1 second ago; call GET /api/notifications.', 'Expected 401 (so the frontend logs the user out). Actual: 403 (DEF-05).'],
    deniedRoleGets403: ['Blocked role gets 403', 'Debater sends POST /api/tournaments.', 'Expected 403. Actual: 400 "Access Denied" (DEF-10).'],
    missingTokenGets401: ['Missing token gets 401', 'POST /api/matches with no token.', 'Expected 401. Actual: 403 (DEF-05).'],
    meWithoutToken: ['/api/auth/me without a token gets 401', 'GET /api/auth/me with no token.', 'Expected 401. Actual: 400 caused by a NullPointerException (DEF-12).'],
  },
};

// ---------------- Frontend (Vitest + React Testing Library) ----------------
const frontend = {
  'src/pages/auth/LoginPage.test.tsx': {
    title: 'Login page',
    setup: 'LoginPage is rendered in a simulated browser (jsdom) inside an in-memory router. The login API, AuthContext and toast messages are replaced with Vitest mocks so each response can be controlled. Input is typed with fireEvent.',
    tests: [
      [/shows the role/, 'The selected role is shown', 'Render with selectedRole = DEBATER.', 'The text "Signing in as DEBATER" is displayed.'],
      [/rejects an empty form/, 'Empty form is rejected locally', 'Click Sign In without typing anything.', 'Toast "Please fill all required fields"; the login API is never called.'],
      [/server error message/, 'Server error is shown', 'Mock the API to fail with "Invalid credentials"; type a user and wrong password; submit.', 'Toast "Invalid credentials"; the session is not stored.'],
      [/logs a (\w+) in/, 'Successful login opens the right dashboard', 'Mock the API to return a token and a user with this role; type username and password; submit.', 'API called with the typed values; login() stores the token and user; toast "Login successful!"; the page navigates to /dashboard/<role>.'],
      [/toggles password/, 'Password visibility toggle', 'Click the eye button next to the password field.', 'Field type changes from "password" to "text".'],
    ],
  },
  'src/pages/auth/SignupPage.test.tsx': {
    title: 'Sign-up and role selection pages',
    setup: 'Pages are rendered in jsdom with an in-memory router; the sign-up API, AuthContext and toasts are mocked. The selected role is JUDGE.',
    tests: [
      [/mismatched passwords/, 'Mismatched passwords are rejected', 'Fill the form with "password123" and "password124"; submit.', 'Toast "Passwords do not match"; API not called.'],
      [/shorter than 6/, 'Short password is rejected', 'Fill the form with password "abc" twice; submit.', 'Toast "Password must be at least 6 characters"; API not called.'],
      [/judge-only fields/, 'Judge-only fields appear', 'Render with role JUDGE.', 'The "Expertise" field is visible.'],
      [/creates the account/, 'Successful sign-up', 'Mock the API to succeed; fill a valid form; submit.', 'API called with username, e-mail, role JUDGE and password; login() is called; page navigates to the dashboard.'],
      [/username is taken/, 'Server error on sign-up', 'Mock the API to fail with "Username already taken"; submit.', 'That message is shown as an error toast.'],
      [/choosing (\w+)/, 'Choosing a role on the role-selection page', 'Open /role-select and click the role card.', 'setSelectedRole is called with the role in capitals; the login page opens.'],
    ],
  },
  'src/App.test.tsx': {
    title: 'Protected routes (frontend access rules)',
    setup: 'The real App with its real route rules and a real AuthProvider is rendered at a given URL. A logged-in user is simulated by putting a token and user in localStorage. Page layouts are replaced by markers so only the access rule is tested. The final URL is read from the router.',
    tests: [
      [/logged-out visitor opening/, 'Visitor is redirected to role selection', 'Open the protected URL with nothing in localStorage.', 'The router ends on /role-select.'],
      [/is refused for/, 'Wrong role is redirected home', 'Store a user with the listed role and open the URL.', 'The router ends on "/" (the page is not shown).'],
      [/is allowed for/, 'Right role is allowed', 'Store a user with the listed role and open the URL.', 'The URL stays the same and the protected content is rendered.'],
      [/unknown URLs/, 'Unknown URLs go home', 'Open /this/does/not/exist.', 'The router ends on "/".'],
    ],
  },
  'src/context/AuthContext.test.tsx': {
    title: 'AuthContext (session state)',
    setup: 'The real AuthProvider is rendered around a small probe component that displays the current state and has buttons for login, logout, choose role and update profile. Other browser tabs are simulated by changing localStorage and firing a "storage" event, which is what the browser does.',
    tests: [
      [/starts logged out/, 'Starts logged out', 'Render with empty localStorage.', 'isAuthenticated is false.'],
      [/restores a saved session/, 'Session survives a page reload', 'Put a token and user in localStorage, then render.', 'isAuthenticated is true and the username is "debater1".'],
      [/corrupted user data/, 'Corrupted storage does not crash the app', 'Put invalid JSON in dms_user, then render.', 'The app renders and treats the user as logged out.'],
      [/login stores token/, 'Login and logout', 'Click login, pick role JUDGE, then click logout.', 'After login the token is stored; the role is stored; after logout the token, user and role are all removed.'],
      [/updateUser merges/, 'Profile updates are saved', 'Log in, then update the bio.', 'The new bio is shown and saved to localStorage.'],
      [/another tab logs in/, 'Warning when another tab logs in as someone else', 'Log in as debater1; simulate another tab storing judge1\'s session.', '"User Account Switched" modal appears naming judge1; the current tab now shows judge1.'],
      [/another tab logs out/, 'Warning when another tab logs out', 'Log in; simulate another tab removing the session; click Acknowledge.', '"Session Expired / Logged Out" appears; state becomes logged out; the modal closes on Acknowledge.'],
      [/outside the provider/, 'Clear error for developer mistakes', 'Render a component that calls useAuth() without AuthProvider.', 'Throws "useAuth must be used within AuthProvider".'],
    ],
  },
  'src/api/axios.test.ts': {
    title: 'API client (axios interceptors)',
    setup: 'The real axios instance is used, but its network adapter is replaced so each test decides the HTTP status and can inspect the outgoing request. window.location is replaced so redirects can be observed.',
    tests: [
      [/attaches the stored JWT/, 'Token is attached to requests', 'Store token JWT-123 and make a request.', 'The request header is "Authorization: Bearer JWT-123".'],
      [/sends no Authorization/, 'No token when logged out', 'Make a request with empty storage.', 'No Authorization header is sent.'],
      [/on 401 clears/, 'A 401 response logs the user out', 'Store a session; the server answers 401.', 'Token and user are removed from storage; the browser is sent to /login.'],
      [/on 403 keeps/, 'A 403 response does not log the user out', 'Store a session; the server answers 403.', 'Token stays; no redirect. (This is why DEF-05 matters: the backend sends 403 for expired logins.)'],
    ],
  },
  'src/utils/utils.test.tsx': {
    title: 'Utilities and toast',
    setup: 'Pure functions are called directly; the toast is rendered with the real ToastProvider and Vitest fake timers.',
    tests: [
      [/explicit tournament id/, 'Notification link uses the tournament id', 'Route a notification with tournamentId 7 (with and without a matchId).', 'Both give /tournament/7.'],
      [/match code in the message/, 'Tournament id is read from a match code', 'Message contains "MATCH-42-3".', 'Gives /tournament/42.'],
      [/falls back/, 'Fallback link', '"Tournament Created" and "Connection Accepted" notifications without ids.', 'Both give /notifications.'],
      [/empty string for missing/, 'Missing avatar URL', 'Call with null and undefined.', 'Returns an empty string.'],
      [/leaves absolute/, 'Absolute avatar URLs are kept', 'Call with https, http, blob and data URLs.', 'Each is returned unchanged.'],
      [/relative backend path/, 'Relative avatar URL', 'Call with /api/users/1/profile-picture.', 'Returns the backend path.'],
      [/hides it after 4 seconds/, 'Toast appears and disappears', 'Show "Saved!", then advance the fake clock 4.1 seconds.', 'The message is visible, then gone.'],
    ],
  },
};

// ---------------- Browser end-to-end (Playwright) ----------------
const playwright = {
  '01-auth.spec.ts': {
    title: 'Authentication and access (browser)',
    tests: [
      [/(organizer|judge|debaterA) logs in/, 'Login through the real UI', 'Open /role-select, click the role card, type username and password on /login, click Sign In.', 'URL becomes /dashboard/<role> and the page shows the first word of the user\'s display name.'],
      [/wrong password/, 'Wrong password', 'On /login type a real username and a wrong password; click Sign In.', '"Invalid credentials" appears and the URL stays /login.'],
      [/new user can sign up/, 'Sign-up through the UI', 'Choose Debater; on /signup fill full name, a unique username, e-mail, password twice; click Create Account.', 'URL becomes /dashboard/debater.'],
      [/cannot open the organizer dashboard/, 'Visitor blocked from organizer dashboard', 'Logged out, open /dashboard/organizer.', 'Redirected to /role-select.'],
      [/cannot open the create-tournament/, 'Debater blocked from create-tournament', 'Logged in as a debater, open /create-tournament.', 'Redirected to the home page.'],
      [/log out from the navbar/, 'Log out', 'Log in through the UI; open the avatar menu; click Log Out; confirm in the dialog.', 'The login token is removed from the browser.'],
    ],
  },
  '02-session.spec.ts': {
    title: 'Multi-tab sessions (browser)',
    tests: [
      [/second tab warns/, 'Another user logs in in a second tab', 'Tab A: logged in as a debater on the dashboard. Tab B (same browser profile): log in as the judge.', 'Tab A shows "User Account Switched" with the judge\'s username.'],
      [/session ended/, 'Log out in a second tab', 'Tab A on the dashboard; tab B removes the stored session.', 'Tab A shows "Session Expired / Logged Out".'],
      [/expired token/, 'Expired login sends the user to login', 'Replace the stored token with an expired/invalid one and open /notifications.', 'Expected redirect to /login. Actual: the user stays on /notifications because the server answers 403, not 401 (DEF-05).'],
    ],
  },
  '03-tournament.spec.ts': {
    title: 'Tournament workflow (browser, run in order)',
    tests: [
      [/6-step wizard/, 'Create a tournament with the wizard', 'As the organizer open /create-tournament. Step 1: type a name, choose Asian Parliamentary. Step 2: keep Knockout. Step 3: name "Royal College", search and add debater A; add a school "Trinity College" with debater B. Step 4: search and add the judge. Step 5: rename the first criterion to "Persuasion". Step 6: check the review and click Create Tournament.', 'Review shows "2 schools, 2 debaters" and "1 judges"; after creating, the tournament page opens with the new name.'],
      [/find the new tournament with search/, 'Visitor finds it with search', 'Open /search?q=<tournament name>.', 'The tournament name is shown.'],
      [/opens the score sheet/, 'Judge opens the score sheet', 'Create a match through the API with the judge; as the judge open /score-sheet/<match>/<judge>.', 'The match topic and the Submit Score Sheet button are shown.'],
      [/submits the score sheet/, 'Judge submits scores', 'Fill every score box (30 for proposition, 25 for opposition); click Submit Score Sheet.', 'A "submitted" confirmation is shown.'],
      [/result appears/, 'Result is visible', 'Read the match through the API; open the tournament page.', 'Match status is COMPLETED; the tournament page shows Royal College.'],
    ],
  },
  '04-public.spec.ts': {
    title: 'Public pages (browser)',
    tests: [
      [/loads without errors/, 'Public page loads cleanly', 'Open the page while recording JavaScript errors.', 'Expected text is shown and no uncaught JavaScript error occurred.'],
      [/search finds seeded debaters/, 'Search', 'Open /search?q=debater1.', 'debater1 appears in the results.'],
      [/live matches for visitors/, 'Home page API calls succeed for visitors', 'Open / logged out while recording every API response; wait for the network to go quiet.', 'Expected no failed API calls. Actual: GET /api/matches/live returned 403 (DEF-11).'],
      [/phone-sized screen/, 'Mobile layout', 'Set the window to 375 × 812 and open /.', 'The page is not wider than the screen (no horizontal scrolling).'],
    ],
  },
  '05-score-sheet.spec.ts': {
    title: 'Score sheet (browser, independent tests)',
    tests: [
      [/custom criteria/, "Score sheet uses the organizer's criteria", 'Through the API the organizer creates a tournament with criteria "Persuasion" and "Evidence" and a match; the judge opens the score sheet.', 'Expected column "Persuasion" and no "Rebuttal". Actual: the built-in columns Matter/Manner/Method/Rebuttal/Teamwork are shown (DEF-03; see screenshot in the report).'],
      [/already submitted/, 'Re-opening a submitted sheet', 'The judge submits through the API, then opens the score sheet page.', 'Expected "Score Sheet Submitted". Actual: an empty form is shown again (DEF-04).'],
    ],
  },
};

module.exports = { backendUnit, backendIntegration, rbacCases, rbacOther, frontend, playwright };
