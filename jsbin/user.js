const signup_endpoint =
  "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv:v1/auth/signup";
const login_endpoint =
  "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv:v1/auth/login";
const getsingle_endpoint =
  "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv/user/"; // + user session
const getsingle_endpoint2 =
  "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv/users/"; // + user id

const annualExpiration = 1;
const data = getCookie("session_id");

import {
  getCookie,
  changeEmailData,
  changePasswordData,
  changeStatusData,
} from "./exportuser.js";

function calculateExpiration(past) {
  const currentDate = new Date();

  if (past == true) {
    currentDate.setFullYear(currentDate.getFullYear() - annualExpiration);
  } else {
    currentDate.setFullYear(currentDate.getFullYear() + annualExpiration);
  }

  return currentDate;
}

function implementUsername() {
  const username = document.getElementById("username");

  const login_btn = document.getElementById("login-btn");
  const signup_btn = document.getElementById("signup-btn");
  const dashboard_btn = document.getElementById("dashboard-btn");
  const upload_btn = document.getElementById("upload-btn");

  if (data.Valid) {
    const url = getsingle_endpoint + data.Data;

    login_btn.remove();
    signup_btn.remove();

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const requestOptions = {
      method: "GET",
      headers: myHeaders,
    };

    fetch(url, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        const result_parse = JSON.parse(result);

        if (result_parse.name) {
          username.textContent = result_parse.name;
        } else if (result_parse.message) {
          if ((result_parse.message = "Not Found")) {
            clearCookieData();
            window.location.assign("login");
          }
        }
      });
  } else {
    dashboard_btn.remove();
    upload_btn.remove();
    username.textContent = "";
  }
}

function setStats() {
  const url = getsingle_endpoint + data.Data;

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const requestOptions = {
    method: "GET",
    headers: myHeaders,
  };

  fetch(url, requestOptions)
    .then((response) => response.text())
    .then((result) => {
      const result_parse = JSON.parse(result);

      if (result_parse.email && result_parse.created_at) {
        const email_stat = document.getElementById("email-stat");
        const join_time = document.getElementById("creation-stat");
        const profile_link = document.getElementById("profile-link");

        const rfcDate = new Date(result_parse.created_at).toUTCString();
        const dateObj = new Date(Date.parse(rfcDate));
        const formattedDate = dateObj.toLocaleDateString("en-US", {
          year: "2-digit",
          month: "2-digit",
          day: "2-digit",
        });

        email_stat.textContent = "Email: " + result_parse.email;
        join_time.textContent = "Join Date: " + formattedDate;
        profile_link.setAttribute("href", `user?id=${result_parse.id}`);
      }
    })
    .catch((error) => {
      console.error("[1] Error trying to get user:" + error);
    });
}

function createCookieData(authToken) {
  const expiration = calculateExpiration(false).toUTCString();
  document.cookie = "session_id=" + authToken + "; expires=" + expiration + ";";
}

function clearCookieData() {
  const expiration = calculateExpiration(true).toUTCString();
  const cookies = document.cookie.split(";");

  cookies.forEach(function (cookie) {
    const name = cookie.split("=")[0].trim();
    document.cookie = name + "=; expires=" + expiration + ";";
  });
}

function isValidSignup() {
  const username_input = document.getElementById("username_input").value;
  const email_input = document.getElementById("email_input").value;
  const password_input = document.getElementById("password_input").value;

  const validUsername =
    /^[a-zA-Z0-9]+$/.test(username_input) &&
    username_input.length >= 3 &&
    username_input.length <= 20;
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_input);
  const validPassword = password_input.length >= 8;

  return validUsername && validEmail && validPassword;
}

function isValidLogin() {
  const username_input = document.getElementById("username_login").value;
  const password_input = document.getElementById("password_login").value;

  const validUsername =
    /^[a-zA-Z0-9]+$/.test(username_input) &&
    username_input.length >= 3 &&
    username_input.length <= 20;
  const validPassword = password_input.length >= 8;

  return validUsername && validPassword;
}

function createSessionData() {
  if (!data.Valid) {
    const username_input = document.getElementById("username_input").value;
    const email_input = document.getElementById("email_input").value;
    const password_input = document.getElementById("password_input").value;

    const error_label = document.getElementById("error-label");

    if (isValidSignup()) {
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

      fetch(signup_endpoint, requestOptions)
        .then((response) => response.text())
        .then((result) => {
          const result_parse = JSON.parse(result);
          if (result_parse.authToken) {
            createCookieData(result_parse.authToken);
            error_label.textContent = "Successfully created account!";
            window.location.assign("index");
          } else {
            error_label.textContent = result_parse.message;
          }
        })
        .catch((error) => {
          console.error("Error trying to signup:" + error);
          error_label.textContent = "An error occured";
        });
    } else {
      error_label.textContent = "Not secure enough.";
    }
  }
}

function getSessionData() {
  if (!data.Valid) {
    const username_input = document.getElementById("username_login").value;
    const password_input = document.getElementById("password_login").value;

    if (isValidLogin()) {
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

      fetch(login_endpoint, requestOptions)
        .then((response) => response.text())
        .then((result) => {
          const result_parse = JSON.parse(result);

          if (result_parse.authToken) {
            createCookieData(result_parse.authToken);
            error_label.textContent = "Successfully logged in!";
            window.location.assign("index");
          } else {
            error_label.textContent = result_parse.message;
          }
        })
        .catch((error) => {
          console.error("Error trying to login:" + error);
          error_label.textContent = "An error occured";
        });
    }
  }
}

function logout() {
  if (data.Valid) {
    clearCookieData();
  }

  window.location.assign("login");
}

if (data.Valid) {
  if (
    window.location.pathname.includes("/login") ||
    window.location.pathname.includes("/signup")
  ) {
    window.location.assign("settings");
  }
} else {
  if (
    window.location.pathname.includes("/settings") ||
    window.location.pathname.includes("/upload") ||
    window.location.pathname.includes("/dashboard")
  ) {
    window.location.assign("login");
  }
}

if (window.location.pathname.includes("/user")) {
  const urlParams = new URLSearchParams(window.location.search);
  const user_id = urlParams.get("id");

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const requestOptions = {
    method: "GET",
    headers: myHeaders,
  };

  fetch(getsingle_endpoint2 + user_id, requestOptions)
    .then((response) => response.text())
    .then((result) => {
      const result_parse = JSON.parse(result);

      if (result_parse.email && result_parse.created_at) {
        const user_username = document.getElementById("user-username");
        const user_status = document.getElementById("user-status");
        const user_joindate = document.getElementById("join-date");
        const web_title = document.getElementById("title");

        const rfcDate = new Date(result_parse.created_at).toUTCString();
        const dateObj = new Date(Date.parse(rfcDate));
        const formattedDate = dateObj.toLocaleDateString("en-US", {
          year: "2-digit",
          month: "2-digit",
          day: "2-digit",
        });

        user_username.textContent = result_parse.name;
        user_status.textContent = result_parse.status;
        user_joindate.textContent = formattedDate;
        web_title.textContent = `Ouzox | ${result_parse.name}`;
      } else {
        window.location.assign("404");
      }
    })
    .catch((error) => {
      console.error("[2] Error trying to get user:" + error);
    });
}

if (window.location.pathname.includes("/settings")) {
  const email_button = document.getElementById("save-email");
  const password_button = document.getElementById("save-password");
  const status_button = document.getElementById("save-status");
  const logout_button = document.getElementById("logout-profile");

  setStats();

  email_button.addEventListener("click", function () {
    changeEmailData();
  });
  password_button.addEventListener("click", function () {
    changePasswordData();
  });
  status_button.addEventListener("click", function () {
    changeStatusData();
  });
  logout_button.addEventListener("click", function () {
    logout();
  });
} else if (window.location.pathname.includes("/login")) {
  const login_form = document.getElementById("login-form");
  const login_button = document.getElementById("login-button");
  const icon = document.getElementById("show-password-icon");

  icon.addEventListener("click", function () {
    var passwordInput = document.getElementById("password_login");

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      icon.className = "show-icon";
    } else {
      passwordInput.type = "password";
      icon.className = "hide-icon";
    }
  });

  login_button.setAttribute("disabled", true);
  login_form.oninput = function () {
    if (isValidLogin()) {
      if (login_button.hasAttribute("disabled")) {
        login_button.removeAttribute("disabled");
      }
    } else {
      login_button.setAttribute("disabled", true);
    }
  };

  login_form.onsubmit = function (event) {
    event.preventDefault();
    getSessionData();
  };
} else if (window.location.pathname.includes("/signup")) {
  const signup_form = document.getElementById("signup-form");
  const signup_button = document.getElementById("signup-button");
  const icon = document.getElementById("show-password-icon");

  icon.addEventListener("click", function () {
    var passwordInput = document.getElementById("password_input");

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      icon.className = "show-icon";
    } else {
      passwordInput.type = "password";
      icon.className = "hide-icon";
    }
  });

  signup_button.setAttribute("disabled", true);
  signup_form.oninput = function () {
    if (isValidSignup()) {
      if (signup_button.hasAttribute("disabled")) {
        signup_button.removeAttribute("disabled");
      }
    } else {
      signup_button.setAttribute("disabled", true);
    }
  };

  signup_form.onsubmit = function (event) {
    event.preventDefault();
    createSessionData();
  };
}

implementUsername();
