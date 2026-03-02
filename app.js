// Fake database (frontend-only demo)
function loadUsers(){
  return JSON.parse(localStorage.getItem("dms_users") || "[]");
}
function saveUsers(users){
  localStorage.setItem("dms_users", JSON.stringify(users));
}
function findUser(users, username){
  const u = String(username).trim().toLowerCase();
  return users.find(x => x.username.toLowerCase() === u);
}

// Elements
const tabSignIn = document.getElementById("tabSignIn");
const tabSignUp = document.getElementById("tabSignUp");
const signInForm = document.getElementById("signInForm");
const signUpForm = document.getElementById("signUpForm");
const pageSubtitle = document.getElementById("pageSubtitle");

// Sign in fields
const siUsername = document.getElementById("siUsername");
const siPassword = document.getElementById("siPassword");
const toggleSiPw = document.getElementById("toggleSiPw");
const siHint = document.getElementById("siHint");

// Sign up fields
const suName = document.getElementById("suName");
const suUsername = document.getElementById("suUsername");
const suPassword = document.getElementById("suPassword");
const suConfirm = document.getElementById("suConfirm");
const toggleSuPw = document.getElementById("toggleSuPw");
const suHint = document.getElementById("suHint");

// Bottom bar
const feedbackBar = document.getElementById("feedbackBar");
const fbText = document.getElementById("fbText");
const closeBtn = document.getElementById("closeBtn");

function showBar(text){
  fbText.textContent = text;
  feedbackBar.style.display = "flex";
}

// Tabs switch
function showSignIn(){
  tabSignIn.classList.add("active");
  tabSignUp.classList.remove("active");
  signInForm.classList.remove("hidden");
  signUpForm.classList.add("hidden");
  pageSubtitle.textContent = "Sign in to access your account";
  siHint.textContent = "";
  suHint.textContent = "";
}
function showSignUp(){
  tabSignUp.classList.add("active");
  tabSignIn.classList.remove("active");
  signUpForm.classList.remove("hidden");
  signInForm.classList.add("hidden");
  pageSubtitle.textContent = "New user? Create your account first";
  siHint.textContent = "";
  suHint.textContent = "";
}

tabSignIn.addEventListener("click", showSignIn);
tabSignUp.addEventListener("click", showSignUp);

// Password toggles
toggleSiPw.addEventListener("click", () => {
  siPassword.type = siPassword.type === "password" ? "text" : "password";
});
toggleSuPw.addEventListener("click", () => {
  suPassword.type = suPassword.type === "password" ? "text" : "password";
});

// Social buttons (frontend demo)
document.querySelectorAll(".socialBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    const provider = btn.dataset.provider;
    showBar(`Frontend demo: Continue with ${provider} clicked (needs backend OAuth).`);
  });
});

// SIGN UP: only for new users
signUpForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = suName.value.trim();
  const username = suUsername.value.trim();
  const pw = suPassword.value;
  const cpw = suConfirm.value;

  if(!name || !username || !pw || !cpw){
    suHint.textContent = "Please fill all fields.";
    return;
  }
  if(pw.length < 6){
    suHint.textContent = "Password must be at least 6 characters.";
    return;
  }
  if(pw !== cpw){
    suHint.textContent = "Passwords do not match.";
    return;
  }

  const users = loadUsers();
  if(findUser(users, username)){
    suHint.textContent = "This username already exists. Please sign in.";
    showBar("Username already exists. Switch to Sign In.");
    return;
  }

  users.push({
    id: Date.now(),
    name,
    username: username.toLowerCase(),
    password: pw // demo only; real app should hash
  });
  saveUsers(users);

  // After sign up -> ask to sign in (your rule)
  showBar("Account created! Now please Sign In.");
  showSignIn();
  siUsername.value = username;
  siPassword.value = "";
  siPassword.focus();
});

// SIGN IN: only works if already signed up
signInForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = siUsername.value.trim();
  const pw = siPassword.value;

  if(!username){
    siHint.textContent = "Please enter your username.";
    return;
  }
  if(pw.length < 6){
    siHint.textContent = "Password must be at least 6 characters.";
    return;
  }

  const users = loadUsers();
  const user = findUser(users, username);

  if(!user){
    siHint.textContent = "You are not registered. Please Sign Up first.";
    showBar("Not registered. Please Sign Up first.");
    showSignUp();
    suUsername.value = username;
    suUsername.focus();
    return;
  }

  if(user.password !== pw){
    siHint.textContent = "Wrong password. Try again.";
    showBar("Wrong password.");
    return;
  }

  localStorage.setItem("dms_current_user", JSON.stringify(user));
  siHint.textContent = "";
  showBar(`Welcome ${user.name}! (Frontend demo logged in)`);
});

closeBtn.addEventListener("click", () => {
  feedbackBar.style.display = "none";
});

// Default screen
showSignIn();