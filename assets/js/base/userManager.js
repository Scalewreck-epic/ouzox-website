/**
 * @file userManager.js
 * @description This module handles user-related functionalities.
 * It manages user sessions, login, signup, and updates user information on the UI.
 */

const restrictedPaths = ["/settings", "/upload", "/dashboard"];
const loginPaths = ["/login", "/signup"];
import * as session from "./sessionManager.js";
import { request } from "../util/apiManager.js";
import { endpoints } from "../util/endpoints.js";
import { loadUserGames } from "../base/dataManager.js";

console.info(
  "Ouzox is open source! https://github.com/Scalewreck-epic/ouzox-website"
);

export const user = await session.fetchUser(); // Export the user to other pages that need it.

const cookieData = session.fetchCookie("session_id");
export const cookie = cookieData.data;

const today = new Date().toISOString().split("T")[0]; // Today

const isValidCookie = cookieData.valid;

/**
 * Updates the username displayed in the navigation header based on the user's session status.
 * Redirects to login or restricted pages as necessary.
 */
const updateUsername = () => {
  const username = document.getElementById("username");
  const copyrightYear = document.getElementById("copyright-year");
  const loginBtn = document.getElementById("login-btn");
  const signupBtn = document.getElementById("signup-btn");
  const dashboardBtn = document.getElementById("dashboard-btn");
  const uploadBtn = document.getElementById("upload-btn");

  copyrightYear &&
    (copyrightYear.textContent = new Date().getFullYear().toString());

  if (isValidCookie) {
    // If there is a session cookie, there is no need to use the login and signup page
    if (loginPaths.some((path) => window.location.pathname.includes(path)))
      window.location.assign(restrictedPaths[0]);
    loginBtn.remove();
    signupBtn.remove();
    username.textContent = user.name || "error";
  } else {
    // If there isn't a session cookie, there is no need to use the dashboard and upload page.
    if (restrictedPaths.some((path) => window.location.pathname.includes(path)))
      window.location.assign(loginPaths[0]);
    dashboardBtn.remove();
    uploadBtn.remove();
    username.remove();
  }
};

/**
 * Displays the user's current settings, including email and account creation date.
 */
const updateUserStats = async () => {
  const emailStat = document.getElementById("email-stat");
  const joinTime = document.getElementById("creation-stat");
  const profileLink = document.getElementById("profile-link");

  const formattedDate = new Date(user.created_at).toLocaleDateString("en-US", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });
  emailStat.textContent = `Email: ${user.email}`;
  joinTime.textContent = `Creation: ${formattedDate}`;
  profileLink.setAttribute("href", `user?id=${user.id}`);
};

/**
 * @returns {boolean} True if the signup form inputs are valid, false otherwise.
 */
const isValidSignup = () => {
  // Is the signup valid?
  const usernameInput = document.getElementById("username_input").value;
  const emailInput = document.getElementById("email_input").value;
  const passwordInput = document.getElementById("password_input").value;
  return (
    /^[a-zA-Z0-9]{3,20}$/.test(usernameInput) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput) &&
    session.isValidPassword(passwordInput)
  );
};

/**
 * @returns {boolean} True if the login form inputs are valid, false otherwise.
 */
const isValidLogin = () => {
  // Is the login valid?
  const usernameInput = document.getElementById("username_login").value;
  const passwordInput = document.getElementById("password_login").value;
  return (
    /^[a-zA-Z0-9]{3,20}$/.test(usernameInput) &&
    session.isValidPassword(passwordInput)
  );
};

// Creates a new account on the server
const createSessionData = async () => {
  if (!isValidCookie) {
    const usernameInput = document.getElementById("username_input").value;
    const emailInput = document.getElementById("email_input").value;
    const passwordInput = document.getElementById("password_input").value;
    const dobInput = document.getElementById("date_of_birth").value;
    const errorLabel = document.getElementById("error-label");

    if (isValidSignup()) {
      const dateObject = new Date(dobInput);
      const dobTimestamp = dateObject.getTime();

      errorLabel.textContent = "Signing you up...";
      const result = await request(
        endpoints.user.signup,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: usernameInput,
            email: emailInput,
            password: passwordInput,
            dob: dobTimestamp,
          }),
        },
        false
      );

      errorLabel.textContent = result.ok
        ? "Successfully created account!"
        : result.response;
      if (result.ok) {
        session.createCookie("session_id", result.response.user.session_id);
        session.updateUserCache(result.response.user);
        window.location.assign("index");
      }
    } else {
      errorLabel.textContent = "Not secure enough.";
    }
  }
};

/**
 * Fetches an account.
 */
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

      errorLabel.textContent = result.ok
        ? "Successfully logged in!"
        : result.response;
      if (result.ok) {
        session.createCookie("session_id", result.response.user.session_id);
        session.updateUserCache(result.response.user);
        window.location.assign("index");
      }
    }
  }
};

// Only enable the buttons when the signup or login information are valid
const updateLoginButtons = (isValid, button) => {
  button.disabled = !isValid;
};

// Toggle the password visibility
const togglePasswordVisibility = (passwordInput, icon) => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  icon.setAttribute("class", isPassword ? "show-icon" : "hide-icon");
};

// Clear cookies on logout
const logout = () => {
  if (isValidCookie) session.clearCookie();
  session.removeUserCache();
  window.location.assign("login");
};

// Setup the profile page of another user
const setupProfilePage = async () => {
  const userId = new URLSearchParams(window.location.search).get("id");
  const otherUser = await session.fetchAlternativeUser(userId);

  if (otherUser !== undefined) {
    const formattedDate = new Date(otherUser.created_at).toLocaleDateString(
      "en-US",
      { year: "2-digit", month: "2-digit", day: "2-digit" }
    );

    document.getElementById("user-username").textContent = otherUser.name;
    document.getElementById("user-status").textContent = otherUser.status;
    document.getElementById("join-date").textContent = formattedDate;
    document.getElementById("title").textContent = `Ouzox | ${otherUser.name}`;
  
    loadUserGames(otherUser);
  }
};

// Setup the settings page of the current user
const setupSettingsPage = () => {
  const actions = {
    "save-email": session.changeEmailData,
    "save-password": session.changePasswordData,
    "save-status": session.changeStatusData,
    "logout-profile": logout,
  };

  Object.entries(actions).forEach(([id, action]) => {
    const actionButton = document.getElementById(id);
    actionButton.addEventListener("click", async () => {
      actionButton.disabled = true;
      await action();
      actionButton.disabled = false;
    });
  });

  updateUserStats();
};

// Setup the login page
const setupLoginPage = () => {
  const loginForm = document.getElementById("login-form");
  const loginButton = document.getElementById("login-button");
  const passwordInput = document.getElementById("password_login");
  const icon = document.getElementById("show-password-icon");

  icon.addEventListener("click", () =>
    togglePasswordVisibility(passwordInput, icon)
  );
  loginForm.addEventListener("input", () =>
    updateLoginButtons(isValidLogin(), loginButton)
  );
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    fetchSessionData();
  });

  loginButton.disabled = true;
};

// Setup the signup page
const setupSignupPage = () => {
  const signupForm = document.getElementById("signup-form");
  const signupButton = document.getElementById("signup-button");
  const passwordInput = document.getElementById("password_input");
  const icon = document.getElementById("show-password-icon");
  const dobInput = document.getElementById("date_of_birth");

  dobInput.setAttribute("max", today);

  dobInput.addEventListener("input", () => {
    const selectedDate = dobInput.value;

    if (selectedDate > today) {
      dobInput.value = today;
    }
  });

  icon.addEventListener("click", () =>
    togglePasswordVisibility(passwordInput, icon)
  );
  signupForm.addEventListener("input", () =>
    updateLoginButtons(isValidSignup(), signupButton)
  );
  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    createSessionData();
  });

  signupButton.disabled = true;
};

updateUsername(); // Update the username on load

if (window.location.pathname.includes("/user")) setupProfilePage();
if (window.location.pathname.includes("/settings")) setupSettingsPage();
if (window.location.pathname.includes("/login")) setupLoginPage();
if (window.location.pathname.includes("/signup")) setupSignupPage();
