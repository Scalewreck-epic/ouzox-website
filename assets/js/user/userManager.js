const auth_signup =
  "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv:v1/auth/signup";
const auth_login =
  "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv:v1/auth/login";
const annualExpiration = 1;
const restrictedPaths = ["/settings", "/upload", "/dashboard"];
const loginPaths = ["/login", "/signup"];

import {
  fetch_cookie,
  fetch_user,
  fetch_alternative_user,
  change_email_data,
  change_password_data,
  change_status_data,
} from "./sessionManager.js";
import { request } from "../base/apiManager.js";

const cookie_data = fetch_cookie("session_id");
const user = await fetch_user();

function calculate_expiration(past) {
  const currentDate = new Date();

  if (past == true) {
    currentDate.setFullYear(currentDate.getFullYear() - annualExpiration);
  } else {
    currentDate.setFullYear(currentDate.getFullYear() + annualExpiration);
  }

  return currentDate;
}

async function update_username() {
  const username = document.getElementById("username");

  const login_btn = document.getElementById("login-btn");
  const signup_btn = document.getElementById("signup-btn");
  const dashboard_btn = document.getElementById("dashboard-btn");
  const upload_btn = document.getElementById("upload-btn");

  if (cookie_data.Valid) {
    username.textContent = user.name;

    login_btn.remove();
    signup_btn.remove();
  } else {
    dashboard_btn.remove();
    upload_btn.remove();
    username.textContent = "";
  }
}

async function update_user_stats() {
  const email_stat = document.getElementById("email-stat");
  const join_time = document.getElementById("creation-stat");
  const profile_link = document.getElementById("profile-link");

  const rfcDate = new Date(user.created_at).toUTCString();
  const dateObj = new Date(Date.parse(rfcDate));
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });

  email_stat.textContent = `Email: ${user.email}`;
  join_time.textContent = `Creation: ${formattedDate}`;
  profile_link.setAttribute("href", `user?id=${user.id}`);
}

function create_cookie(cookie_name, token) {
  const expiration = calculate_expiration(false).toUTCString();
  document.cookie = `${cookie_name}=${token}; expires=${expiration};`;
}

function clear_cookie() {
  const expiration = calculate_expiration(true).toUTCString();
  const cookies = document.cookie.split(";");

  cookies.forEach(function (cookie) {
    const name = cookie.split("=")[0].trim();
    document.cookie = `${name}=; expires=${expiration};`;
  });
}

function is_valid_signup() {
  const username_input = document.getElementById("username_input").value;
  const email_input = document.getElementById("email_input").value;
  const password_input = document.getElementById("password_input").value;

  const validUsername =
    /^[a-zA-Z0-9]+$/.test(username_input) &&
    username_input.length >= 3 &&
    username_input.length <= 20;
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_input);
  const validPassword =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()]).{8,}$/.test(
      password_input
    );

  return validUsername && validEmail && validPassword;
}

function is_valid_login() {
  const username_input = document.getElementById("username_login").value;
  const password_input = document.getElementById("password_login").value;

  const validUsername =
    /^[a-zA-Z0-9]+$/.test(username_input) &&
    username_input.length >= 3 &&
    username_input.length <= 20;
  const validPassword = password_input.length >= 8;

  return validUsername && validPassword;
}

async function create_session_data() {
  if (!cookie_data.Valid) {
    const username_input = document.getElementById("username_input").value;
    const email_input = document.getElementById("email_input").value;
    const password_input = document.getElementById("password_input").value;

    const error_label = document.getElementById("error-label");

    if (is_valid_signup()) {
      const username = username_input.toString();
      const password = password_input.toString();
      const email = email_input.toString();

      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({
          name: username,
          email: email,
          password: password,
        }),
      };

      error_label.textContent = "Creating account...";

      const result = await request(
        auth_signup,
        requestOptions,
        false,
        "signup"
      );

      if (result.Success) {
        create_cookie("session_id", result.Result.authToken);
        error_label.textContent = "Successfully created account!";
        window.location.assign("index");
      } else {
        console.error(`Unable to signup: ${error.message}`);
        error_label.textContent = "An error occured";
      }
    } else {
      error_label.textContent = "Not secure enough.";
    }
  }
}

async function fetch_session_data() {
  if (!cookie_data.Valid) {
    const username_input = document.getElementById("username_login").value;
    const password_input = document.getElementById("password_login").value;

    if (is_valid_login()) {
      const username = username_input.toString();
      const password = password_input.toString();

      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      };

      const error_label = document.getElementById("error-label");
      error_label.textContent = "Logging you in...";

      const result = await request(auth_login, requestOptions, false, "login");

      if (result.Success) {
        create_cookie("session_id", result.Result.authToken);
        error_label.textContent = "Successfully logged in!";
        window.location.assign("index");
      } else {
        console.error(`Unable to login: ${result.Result}`);
        error_label.textContent = "An error occured";
      }
    }
  }
}

function logout() {
  if (cookie_data.Valid) {
    clear_cookie();
  }

  window.location.assign("login");
}

if (cookie_data.Valid) {
  if (loginPaths.some((path) => window.location.pathname.includes(path))) {
    window.location.assign("settings");
  }
} else {
  if (restrictedPaths.some((path) => window.location.pathname.includes(path))) {
    window.location.assign("login");
  }
}

if (window.location.pathname.includes("/user")) {
  const user_username = document.getElementById("user-username");
  const user_status = document.getElementById("user-status");
  const user_joindate = document.getElementById("join-date");
  const web_title = document.getElementById("title");

  const urlParams = new URLSearchParams(window.location.search);
  const user_id = urlParams.get("id");

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const requestOptions = {
    method: "GET",
    headers: myHeaders,
  };

  const other_user = await fetch_alternative_user(user_id);

  const rfcDate = new Date(other_user.created_at).toUTCString();
  const dateObj = new Date(Date.parse(rfcDate));
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });

  user_username.textContent = other_user.name;
  user_status.textContent = other_user.status;
  user_joindate.textContent = formattedDate;
  web_title.textContent = `Ouzox | ${other_user.name}`;
}

function update_login_buttons(is_valid, button) {
  if (is_valid) {
    if (button.hasAttribute("disabled")) {
      button.removeAttribute("disabled");
    }
  } else {
    button.setAttribute("disabled", true);
  }
}

if (window.location.pathname.includes("/settings")) {
  const email_button = document.getElementById("save-email");
  const password_button = document.getElementById("save-password");
  const status_button = document.getElementById("save-status");
  const logout_button = document.getElementById("logout-profile");

  update_user_stats();

  email_button.addEventListener("click", () => change_email_data());
  password_button.addEventListener("click", () => change_password_data());
  status_button.addEventListener("click", () => change_status_data());
  logout_button.addEventListener("click", () => logout());
}

if (window.location.pathname.includes("/login")) {
  const login_form = document.getElementById("login-form");
  const login_button = document.getElementById("login-button");
  const icon = document.getElementById("show-password-icon");

  icon.addEventListener("click", function () {
    const passwordInput = document.getElementById("password_login");

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      icon.setAttribute("class", "show-icon");
    } else {
      passwordInput.type = "password";
      icon.setAttribute("class", "hide-icon");
    }
  });

  login_form.addEventListener("input", () => update_login_buttons(is_valid_login(), login_button));
  login_form.addEventListener("submit", function (event) {
    event.preventDefault();
    fetch_session_data();
  });

  login_button.setAttribute("disabled", true);
} else if (window.location.pathname.includes("/signup")) {
  const signup_form = document.getElementById("signup-form");
  const signup_button = document.getElementById("signup-button");
  const icon = document.getElementById("show-password-icon");

  icon.addEventListener("click", function () {
    const passwordInput = document.getElementById("password_input");

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      icon.setAttribute("class", "show-icon");
    } else {
      passwordInput.type = "password";
      icon.setAttribute("class", "hide-icon");
    }
  });

  signup_form.addEventListener("input", () => update_login_buttons(is_valid_signup(), signup_button));
  signup_form.addEventListener("submit", function (event) {
    event.preventDefault();
    create_session_data();
  });

  signup_button.setAttribute("disabled", true);
}

update_username();
