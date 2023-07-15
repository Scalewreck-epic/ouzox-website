const signup_endpoint =
  "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv:v1/auth/signup";
const login_endpoint =
  "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv:v1/auth/login";
const getsingle_endpoint =
  "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv/user/"; // + user session

const annualExpiration = 1;
const data = getCookie("session_id");

import {
  getCookie,
  changeEmailData,
  changePasswordData,
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
            window.location.assign("login.html");
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

        const rfcDate = new Date(result_parse.created_at).toUTCString();
        const dateObj = new Date(Date.parse(rfcDate));
        const formattedDate = dateObj.toLocaleDateString("en-US", {
          year: "2-digit",
          month: "2-digit",
          day: "2-digit",
        });

        email_stat.textContent = "Email: " + result_parse.email;
        join_time.textContent = "Join Date: " + formattedDate;
      }
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

function createSessionData() {
  if (!data.Valid) {
    const username_input = document.getElementById("username_input").value;
    const email_input = document.getElementById("email_input").value;
    const password_input = document.getElementById("password_input").value;

    const validUsername = /^[a-zA-Z0-9]+$/.test(username_input);
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_input);
    const validPassword = password_input.length >= 8;

    const error_label = document.getElementById("error-label");

    if (validUsername && validEmail && validPassword) {
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
            window.location.assign("index.html");
          } else {
            error_label.textContent = result_parse.message;
          }
        })
        .catch((error) => {
          console.error("Error trying to create session data:", error);
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
          window.location.assign("index.html");
        } else {
          error_label.textContent = result_parse.message;
        };
      });
  };
};

function logout() {
  if (data.Valid) {
    clearCookieData();
  };

  window.location.assign("login.html");
};

implementUsername();

if (data.Valid) {
  if (window.location.pathname.includes("/login") || window.location.pathname.includes("/signup")) {
    window.location.assign("settings.html");
  };
} else {
  if (window.location.pathname.includes("/settings") || window.location.pathname.includes("/upload") || window.location.pathname.includes("/dashboard")) {
    window.location.assign("login.html");
  };
};

if (window.location.pathname.includes("/settings")) {
  const email_button = document.getElementById("save-email");
  const password_button = document.getElementById("save-password");
  const logout_button = document.getElementById("logout-profile");

  setStats();

  email_button.addEventListener("click", function () {
    changeEmailData();
  });
  password_button.addEventListener("click", function () {
    changePasswordData();
  });
  logout_button.addEventListener("click", function () {
    logout();
  });
} else if (window.location.pathname.includes("/login")) {
  const login_form = document.getElementById("login-form");

  login_form.onsubmit = function (event) {
    event.preventDefault();
    getSessionData();
  };
} else if (window.location.pathname.includes("/signup")) {
  const signup_form = document.getElementById("signup-form");

  signup_form.onsubmit = function (event) {
    event.preventDefault();
    createSessionData();
  };
};
