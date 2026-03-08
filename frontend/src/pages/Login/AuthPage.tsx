import { useState } from "react";
import debateBg from "../../assets/debate-bg.png";
import "../../styles/login.css";

type User = {
  id: number;
  name: string;
  username: string;
  password: string;
};

type TabType = "signin" | "signup";

function loadUsers(): User[] {
  return JSON.parse(localStorage.getItem("dms_users") || "[]");
}

function saveUsers(users: User[]) {
  localStorage.setItem("dms_users", JSON.stringify(users));
}

function findUser(users: User[], username: string): User | undefined {
  const u = String(username).trim().toLowerCase();
  return users.find((x) => x.username.toLowerCase() === u);
}

export default function AuthPage() {
  const [tab, setTab] = useState<TabType>("signin");
  const [barText, setBarText] = useState("Done!");
  const [showBar, setShowBar] = useState(true);

  const [siUsername, setSiUsername] = useState("");
  const [siPassword, setSiPassword] = useState("");
  const [siHint, setSiHint] = useState("");

  const [suName, setSuName] = useState("");
  const [suUsername, setSuUsername] = useState("");
  const [suPassword, setSuPassword] = useState("");
  const [suConfirm, setSuConfirm] = useState("");
  const [suHint, setSuHint] = useState("");

  const [showSignInPw, setShowSignInPw] = useState(false);
  const [showSignUpPw, setShowSignUpPw] = useState(false);

  const showBarMessage = (text: string) => {
    setBarText(text);
    setShowBar(true);
  };

  const showSignIn = () => {
    setTab("signin");
    setSiHint("");
    setSuHint("");
  };

  const showSignUp = () => {
    setTab("signup");
    setSiHint("");
    setSuHint("");
  };

  const handleSocialClick = (provider: string) => {
    showBarMessage(`Frontend demo: Continue with ${provider} clicked (needs backend OAuth).`);
  };

  const handleSignUp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const name = suName.trim();
    const username = suUsername.trim();
    const pw = suPassword;
    const cpw = suConfirm;

    if (!name || !username || !pw || !cpw) {
      setSuHint("Please fill all fields.");
      return;
    }
    if (pw.length < 6) {
      setSuHint("Password must be at least 6 characters.");
      return;
    }
    if (pw !== cpw) {
      setSuHint("Passwords do not match.");
      return;
    }

    const users = loadUsers();
    if (findUser(users, username)) {
      setSuHint("This username already exists. Please sign in.");
      showBarMessage("Username already exists. Switch to Sign In.");
      return;
    }

    users.push({
      id: Date.now(),
      name,
      username: username.toLowerCase(),
      password: pw,
    });
    saveUsers(users);

    showBarMessage("Account created! Now please Sign In.");
    showSignIn();
    setSiUsername(username);
    setSiPassword("");
    setSuName("");
    setSuUsername("");
    setSuPassword("");
    setSuConfirm("");
  };

  const handleSignIn = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const username = siUsername.trim();
    const pw = siPassword;

    if (!username) {
      setSiHint("Please enter your username.");
      return;
    }
    if (pw.length < 6) {
      setSiHint("Password must be at least 6 characters.");
      return;
    }

    const users = loadUsers();
    const user = findUser(users, username);

    if (!user) {
      setSiHint("You are not registered. Please Sign Up first.");
      showBarMessage("Not registered. Please Sign Up first.");
      showSignUp();
      setSuUsername(username);
      return;
    }

    if (user.password !== pw) {
      setSiHint("Wrong password. Try again.");
      showBarMessage("Wrong password.");
      return;
    }

    localStorage.setItem("dms_current_user", JSON.stringify(user));
    setSiHint("");
    showBarMessage(`Welcome ${user.name}! (Frontend demo logged in)`);
  };

  const subtitle =
    tab === "signin"
      ? "Sign in to access your account"
      : "New user? Create your account first";

  return (
    <main
    className="page"
    style={{ backgroundImage: `url(${debateBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
  >
      <section className="card card-animate" aria-label="Authentication">
        <div className="topIcon icon-animate" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M7 8h10M7 12h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path
              d="M20 12c0 4.418-3.582 8-8 8-1.23 0-2.394-.277-3.435-.772L4 20l.923-3.077A7.962 7.962 0 0 1 4 12c0-4.418 3.582-8 8-8s8 3.582 8 8Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="title-animate">Debate Management System</h1>
        <p className="subtitle sub-animate">{subtitle}</p>

        <div className="tabs">
          <button className={`tab ${tab === "signin" ? "active" : ""}`} type="button" onClick={showSignIn}>
            Sign In
          </button>
          <button className={`tab ${tab === "signup" ? "active" : ""}`} type="button" onClick={showSignUp}>
            Sign Up
          </button>
        </div>

        {tab === "signin" ? (
          <form className="form-animate" onSubmit={handleSignIn} noValidate>
            <label className="label">Username</label>
            <div className="field">
              <span className="icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="2" />
                </svg>
              </span>
              <input
                value={siUsername}
                onChange={(e) => setSiUsername(e.target.value)}
                type="text"
                placeholder="Enter your username"
                autoComplete="username"
              />
            </div>

            <label className="label">Password</label>
            <div className="field">
              <span className="icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M7 10V8a5 5 0 0 1 10 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M6.5 10h11A2.5 2.5 0 0 1 20 12.5v6A2.5 2.5 0 0 1 17.5 21h-11A2.5 2.5 0 0 1 4 18.5v-6A2.5 2.5 0 0 1 6.5 10Z" stroke="currentColor" strokeWidth="2" />
                </svg>
              </span>

              <input
                value={siPassword}
                onChange={(e) => setSiPassword(e.target.value)}
                type={showSignInPw ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button className="eyeBtn" type="button" onClick={() => setShowSignInPw((v) => !v)}>
                {showSignInPw ? "🙈" : "👁"}
              </button>
            </div>

            <button className="primary" type="submit">Sign In</button>

            <div className="divider"><span>or continue with</span></div>
            <div className="social">
              <button className="socialBtn google" type="button" onClick={() => handleSocialClick("Google")}>
                <img src="https://www.svgrepo.com/download/475656/google-color.svg" alt="Google" />
                Continue with Google
              </button>
              <button className="socialBtn facebook" type="button" onClick={() => handleSocialClick("Facebook")}>
                <img src="https://www.svgrepo.com/download/475647/facebook-color.svg" alt="Facebook" />
                Continue with Facebook
              </button>
              <button className="socialBtn twitter" type="button" onClick={() => handleSocialClick("Twitter")}>
                <img src="https://www.svgrepo.com/download/475689/twitter-color.svg" alt="Twitter" />
                Continue with Twitter (X)
              </button>
            </div>

            <p className="hint">{siHint}</p>
          </form>
        ) : (
          <form className="form-animate" onSubmit={handleSignUp} noValidate>
            <label className="label">Full Name</label>
            <div className="field">
              <span className="icon" aria-hidden="true">🧑</span>
              <input
                value={suName}
                onChange={(e) => setSuName(e.target.value)}
                type="text"
                placeholder="Enter your full name"
              />
            </div>

            <label className="label">Username</label>
            <div className="field">
              <span className="icon" aria-hidden="true">👤</span>
              <input
                value={suUsername}
                onChange={(e) => setSuUsername(e.target.value)}
                type="text"
                placeholder="Create a username with your mail ID"
              />
            </div>

            <label className="label">Password</label>
            <div className="field">
              <span className="icon" aria-hidden="true">🔒</span>
              <input
                value={suPassword}
                onChange={(e) => setSuPassword(e.target.value)}
                type={showSignUpPw ? "text" : "password"}
                placeholder="Create a password (min 6)"
              />
              <button className="eyeBtn" type="button" onClick={() => setShowSignUpPw((v) => !v)}>
                {showSignUpPw ? "🙈" : "👁"}
              </button>
            </div>

            <label className="label">Confirm Password</label>
            <div className="field">
              <span className="icon" aria-hidden="true">✅</span>
              <input
                value={suConfirm}
                onChange={(e) => setSuConfirm(e.target.value)}
                type="password"
                placeholder="Re-enter password"
              />
            </div>

            <button className="primary" type="submit">Create Account</button>

            <div className="divider"><span>or continue with</span></div>
            <div className="social">
              <button className="socialBtn google" type="button" onClick={() => handleSocialClick("Google")}>
                <img src="https://www.svgrepo.com/download/475656/google-color.svg" alt="Google" />
                Continue with Google
              </button>
              <button className="socialBtn facebook" type="button" onClick={() => handleSocialClick("Facebook")}>
                <img src="https://www.svgrepo.com/download/475647/facebook-color.svg" alt="Facebook" />
                Continue with Facebook
              </button>
              <button className="socialBtn twitter" type="button" onClick={() => handleSocialClick("Twitter")}>
                <img src="https://www.svgrepo.com/download/475689/twitter-color.svg" alt="Twitter" />
                Continue with Twitter (X)
              </button>
            </div>

            <p className="hint">{suHint}</p>
          </form>
        )}

        {showBar && (
          <div className="feedback" role="status" aria-live="polite">
            <div className="fbLeft">
              <span className="fbCheck" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="fbText">{barText}</span>
            </div>
            <div className="fbActions">
              <button className="fbBtn close" type="button" aria-label="Close" onClick={() => setShowBar(false)}>
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}