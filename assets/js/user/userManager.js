const restrictedPaths = ["/settings", "/upload", "/dashboard"];
const loginPaths = ["/login", "/signup"];
import * as session from "./sessionManager.js";
import { request } from "../base/apiManager.js";
import { endpoints } from "../other/endpoints.js";

console.info("Ouzox is open source! https://github.com/Scalewreck-epic/ouzox-website");

const cookie_data = session.fetch_cookie("session_id");
const user = await session.fetch_user();

const update_username = () => {
  const username = document.getElementById("username");
  const copyright_year = document.getElementById("copyright-year");
  const login_btn = document.getElementById("login-btn");
  const signup_btn = document.getElementById("signup-btn");
  const dashboard_btn = document.getElementById("dashboard-btn");
  const upload_btn = document.getElementById("upload-btn");

  copyright_year && (copyright_year.textContent = new Date().getFullYear().toString());

  if (cookie_data.Valid) {
    if (loginPaths.some(path => window.location.pathname.includes(path))) window.location.assign("settings");
    login_btn.remove(); signup_btn.remove(); username.textContent = user.name;
  } else {
    if (restrictedPaths.some(path => window.location.pathname.includes(path))) window.location.assign("login");
    dashboard_btn.remove(); upload_btn.remove(); username.remove();
  }
};

const update_user_stats = async () => {
  const email_stat = document.getElementById("email-stat");
  const join_time = document.getElementById("creation-stat");
  const profile_link = document.getElementById("profile-link");

  const formattedDate = new Date(Date.parse(user.created_at)).toLocaleDateString("en-US", { year: "2-digit", month: "2-digit", day: "2-digit" });
  email_stat.textContent = `Email: ${user.email}`; join_time.textContent = `Creation: ${formattedDate}`; profile_link.setAttribute("href", `user?id=${user.id}`);
};

const is_valid_password = password_input => /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/.test(password_input);
const is_valid_signup = () => {
  const username_input = document.getElementById("username_input").value;
  const email_input = document.getElementById("email_input").value;
  const password_input = document.getElementById("password_input").value;
  return /^[a-zA-Z0-9]{3,20}$/.test(username_input) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_input) && is_valid_password(password_input);
};

const is_valid_login = () => {
  const username_input = document.getElementById("username_login").value;
  const password_input = document.getElementById("password_login").value;
  return /^[a-zA-Z0-9]{3,20}$/.test(username_input) && is_valid_password(password_input);
};

const create_session_data = async () => {
  if (!cookie_data.Valid) {
    const username_input = document.getElementById("username_input").value;
    const email_input = document.getElementById("email_input").value;
    const password_input = document.getElementById("password_input").value;
    const error_label = document.getElementById("error-label");

    if (is_valid_signup()) {
      const result = await request(endpoints.user.signup, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username_input, email: email_input, password: password_input })
      }, false);

      error_label.textContent = result.ok ? "Successfully created account!" : result.response;
      if (result.ok) {
        session.create_cookie("session_id", result.authToken);
        window.location.assign("index");
      }
    } else {
      error_label.textContent = "Not secure enough.";
    }
  }
};

const fetch_session_data = async () => {
  if (!cookie_data.Valid) {
    const username = document.getElementById("username_login").value;
    const password = document.getElementById("password_login").value;
    const error_label = document.getElementById("error-label");

    if (is_valid_login()) {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      };

      error_label.textContent = "Logging you in...";
      const result = await request(endpoints.user.login, requestOptions, false);

      error_label.textContent = result.ok ? "Successfully logged in!" : result.response;
      if (result.ok) {
        session.create_cookie("session_id", result.authToken);
        window.location.assign("index");
      }
    }
  }
};

const update_login_buttons = (is_valid, button) => {
  button.disabled = !is_valid;
};

const toggle_password_visibility = (passwordInput, icon) => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  icon.setAttribute("class", isPassword ? "show-icon" : "hide-icon");
};

const logout = () => {
  if (cookie_data.Valid) clear_cookie();
  window.location.assign("login");
};

const setup_profile_page = async () => {
  const user_id = new URLSearchParams(window.location.search).get("id");
  const other_user = await session.fetch_alternative_user(user_id);
  const formattedDate = new Date(other_user.created_at).toLocaleDateString("en-US", { year: "2-digit", month: "2-digit", day: "2-digit" });

  document.getElementById("user-username").textContent = other_user.name;
  document.getElementById("user-status").textContent = other_user.status;
  document.getElementById("join-date").textContent = formattedDate;
  document.getElementById("title").textContent = `Ouzox | ${other_user.name}`;
};

const setup_settings_page = () => {
  const actions = {
    "save-email": session.change_email_data,
    "save-password": session.change_password_data,
    "save-status": session.change_status_data,
    "logout-profile": logout,
  };

  Object.entries(actions).forEach(([id, action]) => {
    document.getElementById(id).addEventListener("click", action);
  });

  update_user_stats();
};

const setup_login_page = () => {
  const login_form = document.getElementById("login-form");
  const login_button = document.getElementById("login-button");
  const passwordInput = document.getElementById("password_login");
  const icon = document.getElementById("show-password-icon");

  icon.addEventListener("click", () => toggle_password_visibility(passwordInput, icon));
  login_form.addEventListener("input", () => update_login_buttons(is_valid_login(), login_button));
  login_form.addEventListener("submit", (event) => {
    event.preventDefault();
    fetch_session_data();
  });

  login_button.disabled = true;
};

const setup_signup_page = () => {
  const signup_form = document.getElementById("signup-form");
  const signup_button = document.getElementById("signup-button");
  const passwordInput = document.getElementById("password_input");
  const icon = document.getElementById("show-password-icon");

  icon.addEventListener("click", () => toggle_password_visibility(passwordInput, icon));
  signup_form.addEventListener("input", () => update_login_buttons(is_valid_signup(), signup_button));
  signup_form.addEventListener("submit", (event) => {
    event.preventDefault();
    create_session_data();
  });

  signup_button.disabled = true;
};

update_username();

if (window.location.pathname.includes("/user")) setup_profile_page();
if (window.location.pathname.includes("/settings")) setup_settings_page();
if (window.location.pathname.includes("/login")) setup_login_page();
if (window.location.pathname.includes("/signup")) setup_signup_page();