const restrictedPaths = ["/settings", "/upload", "/dashboard"];
const loginPaths = ["/login", "/signup"];
import * as session from "./sessionManager.js";
import { request } from "../base/apiManager.js";
import { endpoints } from "../other/endpoints.js";
import { loadUserGames } from "../base/dataManager.js";

console.info("Ouzox is open source! https://github.com/Scalewreck-epic/ouzox-website");

const cookieData = session.fetchCookie("session_id");
const user = await session.fetchUser();

const isValidCookie = cookieData.valid;

const updateUsername = () => {
  const username = document.getElementById("username");
  const copyrightYear = document.getElementById("copyright-year");
  const loginBtn = document.getElementById("login-btn");
  const signupBtn = document.getElementById("signup-btn");
  const dashboardBtn = document.getElementById("dashboard-btn");
  const uploadBtn = document.getElementById("upload-btn");

  copyrightYear && (copyrightYear.textContent = new Date().getFullYear().toString());

  if (isValidCookie) {
    if (loginPaths.some(path => window.location.pathname.includes(path))) window.location.assign("settings");
    loginBtn.remove(); signupBtn.remove(); username.textContent = user.name;
  } else {
    if (restrictedPaths.some(path => window.location.pathname.includes(path))) window.location.assign("login");
    dashboardBtn.remove(); uploadBtn.remove(); username.remove();
  }
};

const updateUserStats = async () => {
  const emailStat = document.getElementById("email-stat");
  const joinTime = document.getElementById("creation-stat");
  const profileLink = document.getElementById("profile-link");

  const formattedDate = new Date(Date.parse(user.created_at)).toLocaleDateString("en-US", { year: "2-digit", month: "2-digit", day: "2-digit" });
  emailStat.textContent = `Email: ${user.email}`; joinTime.textContent = `Creation: ${formattedDate}`; profileLink.setAttribute("href", `user?id=${user.id}`);
};

const isValidPassword = passwordInput => /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/.test(passwordInput);
const isValidSignup = () => {
  const usernameInput = document.getElementById("username_input").value;
  const emailInput = document.getElementById("email_input").value;
  const passwordInput = document.getElementById("password_input").value;
  return /^[a-zA-Z0-9]{3,20}$/.test(usernameInput) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput) && isValidPassword(passwordInput);
};

const isValidLogin = () => {
  const usernameInput = document.getElementById("username_login").value;
  const passwordInput = document.getElementById("password_login").value;
  return /^[a-zA-Z0-9]{3,20}$/.test(usernameInput) && isValidPassword(passwordInput);
};

const createSessionData = async () => {
  if (!isValidCookie) {
    const usernameInput = document.getElementById("username_input").value;
    const emailInput = document.getElementById("email_input").value;
    const passwordInput = document.getElementById("password_input").value;
    const errorLabel = document.getElementById("error-label");

    if (isValidSignup()) {
      const result = await request(endpoints.user.signup, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: usernameInput, email: emailInput, password: passwordInput })
      }, false);

      errorLabel.textContent = result.ok ? "Successfully created account!" : result.response;
      if (result.ok) {
        session.createCookie("session_id", result.authToken);
        window.location.assign("index");
      }
    } else {
      errorLabel.textContent = "Not secure enough.";
    }
  }
};

const fetchSessionData = async () => {
  if (!isValidCookie) {
    const username = document.getElementById("username_login").value;
    const password = document.getElementById("password_login").value;
    const errorLabel = document.getElementById("error-label");

    if (isValidLogin()) {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      };

      errorLabel.textContent = "Logging you in...";
      const result = await request(endpoints.user.login, requestOptions, false);

      errorLabel.textContent = result.ok ? "Successfully logged in!" : result.response;
      if (result.ok) {
        session.createCookie("session_id", result.authToken);
        window.location.assign("index");
      }
    }
  }
};

const updateLoginButtons = (isValid, button) => {
  button.disabled = !isValid;
};

const togglePasswordVisibility = (passwordInput, icon) => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  icon.setAttribute("class", isPassword ? "show-icon" : "hide-icon");
};

const logout = () => {
  if (isValidCookie) clearCookie();
  window.location.assign("login");
};

const setupProfilePage = async () => {
  const userId = new URLSearchParams(window.location.search).get("id");
  const otherUser = await session.fetchAlternativeUser(userId);
  const formattedDate = new Date(otherUser.created_at).toLocaleDateString("en-US", { year: "2-digit", month: "2-digit", day: "2-digit" });

  document.getElementById("user-username").textContent = otherUser.name;
  document.getElementById("user-status").textContent = otherUser.status;
  document.getElementById("join-date").textContent = formattedDate;
  document.getElementById("title").textContent = `Ouzox | ${otherUser.name}`;

  loadUserGames(otherUser);
};

const setupSettingsPage = () => {
  const actions = {
    "save-email": session.changeEmailData,
    "save-password": session.changePasswordData,
    "save-status": session.changeStatusData,
    "logout-profile": logout,
  };

  Object.entries(actions).forEach(([id, action]) => {
    document.getElementById(id).addEventListener("click", action);
  });

  updateUserStats();
};

const setupLoginPage = () => {
  const loginForm = document.getElementById("login-form");
  const loginButton = document.getElementById("login-button");
  const passwordInput = document.getElementById("password_login");
  const icon = document.getElementById("show-password-icon");

  icon.addEventListener("click", () => togglePasswordVisibility(passwordInput, icon));
  loginForm.addEventListener("input", () => updateLoginButtons(isValidLogin(), loginButton));
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    fetchSessionData();
  });

  loginButton.disabled = true;
};

const setupSignupPage = () => {
  const signupForm = document.getElementById("signup-form");
  const signupButton = document.getElementById("signup-button");
  const passwordInput = document.getElementById("password_input");
  const icon = document.getElementById("show-password-icon");

  icon.addEventListener("click", () => togglePasswordVisibility(passwordInput, icon));
  signupForm.addEventListener("input", () => updateLoginButtons(isValidSignup(), signupButton));
  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    createSessionData();
  });

  signupButton.disabled = true;
};

updateUsername();

if (window.location.pathname.includes("/user")) setupProfilePage();
if (window.location.pathname.includes("/settings")) setupSettingsPage();
if (window.location.pathname.includes("/login")) setupLoginPage();
if (window.location.pathname.includes("/signup")) setupSignupPage();