const signup_endpoint = "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv:v1/auth/signup";
const login_endpoint = "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv:v1/auth/login";
const getsingle_endpoint = "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv/user/" // + user session

const annualExpiration = 1;

import { getCookie, changeEmailData, changePasswordData } from "./exportuser.js";

function calculateExpiration(past) {
    var currentDate = new Date();

    if (past == true) {
        currentDate.setFullYear(currentDate.getFullYear() - annualExpiration);
    } else {
        currentDate.setFullYear(currentDate.getFullYear() + annualExpiration);
    }

    return currentDate;
}

function implementUsername() {
    var username = document.getElementById("username");
    var data = getCookie("session_id");

    var login_btn = document.getElementById("login-btn");
    var signup_btn = document.getElementById("signup-btn");
    var dashboard_btn = document.getElementById("dashboard-btn");
    var upload_btn = document.getElementById("upload-btn");

    if (data.Valid) {
        const url = getsingle_endpoint + data.Data;

        login_btn.remove();
        signup_btn.remove();
    
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var requestOptions = {
            method: "GET",
            headers: myHeaders,
        }

        fetch(url, requestOptions)
        .then(response => response.text())
        .then(result => {
            var result_parse = JSON.parse(result);
            console.log("User info:" , result_parse);

            if (result_parse.name) {
                username.innerHTML = result_parse.name;
            } else if (result_parse.message) {
                if (result_parse.message = "Not Found") {
                    clearCookieData();
                    window.location.assign("login.html");
                }
            }
        })
    } else {
        dashboard_btn.remove();
        upload_btn.remove();
        username.innerHTML = "";
    }
}

function setStats() {
    var data = getCookie("session_id");
    const url = getsingle_endpoint + data.Data;

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var requestOptions = {
        method: "GET",
        headers: myHeaders,
    }

    fetch(url, requestOptions)
    .then(response => response.text())
    .then(result => {
        var result_parse = JSON.parse(result);

        if (result_parse.email && result_parse.created_at) {
            const email_stat = document.getElementById("email-stat");
            const join_time = document.getElementById("creation-stat");
        
            const rfcDate = new Date(result_parse.created_at).toUTCString();
            const dateObj = new Date(Date.parse(rfcDate));
            const formattedDate = dateObj.toLocaleDateString("en-US", {
                year: "2-digit",
                month: "2-digit",
                day: "2-digit"
            });
        
            email_stat.innerHTML = "Email: " + result_parse.email;
            join_time.innerHTML = "Join Date: " + formattedDate;
        
        }
    })
}

function createCookieData(authToken) {
    const expiration = calculateExpiration(false).toUTCString();
    document.cookie = "session_id="+authToken+"; expires="+expiration+";";
};

function clearCookieData() {
    const expiration = calculateExpiration(true).toUTCString();
    const cookies = document.cookie.split(";");

    cookies.forEach(function(cookie) {
        const name = cookie.split("=")[0].trim();
        document.cookie = name + "=; expires="+expiration+";"
    })
}

function createSessionData() {
    var data = getCookie("session_id");

    if (!data.Valid) {
        const username_input = document.getElementById("username_input").value;
        const email_input = document.getElementById("email_input").value;
        const password_input = document.getElementById("password_input").value;

        var username = username_input.toString();
        var password = password_input.toString();
        var email = email_input.toString();

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify({
                "name": username,
                "email": email,
                "password": password,
            }),
        };

        var error_label = document.getElementById("error-label");
        error_label.innerHTML = "Creating account...";

        fetch(signup_endpoint, requestOptions)
        .then(response => response.text())
        .then(result => {
            var result_parse = JSON.parse(result);
            if (result_parse.authToken) {
                createCookieData(result_parse.authToken);
                error_label.innerHTML = "Successfully created account!";
                window.location.assign("index.html");
            } else {
                error_label.innerHTML = result_parse.message;
            }
        })
        .catch(error => {
            console.warn("Error trying to create session data:", error);
        });
    }
}

function getSessionData() {
    var data = getCookie("session_id");

    if (!data.Valid) {
        const username_input = document.getElementById("username_login").value;
        const password_input = document.getElementById("password_login").value;

        var username = username_input.toString();
        var password = password_input.toString();

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify({
                "username": username,
                "password": password,
            }),
        };

        var error_label = document.getElementById("error-label");
        error_label.innerHTML = "Logging you in...";

        fetch(login_endpoint, requestOptions)
        .then(response => response.text())
        .then(result => {
            var result_parse = JSON.parse(result);

            if (result_parse.authToken) {
                createCookieData(result_parse.authToken);
                error_label.innerHTML = "Successfully logged in!";
                window.location.assign("index.html");
            } else {
                error_label.innerHTML = result_parse.message;
            }
        })
    }
}

function logout() {
    var data = getCookie("session_id");

    if (data.Valid) {
        clearCookieData();
    };

    window.location.assign("login.html");
};

implementUsername();
document.getElementById("username").addEventListener("click", function() {
    var data = getCookie("session_id");
    if (data.Valid) {
        window.location.assign("settings.html");
    };
});

if (window.location.pathname.includes("/settings")) {
    const email_button = document.getElementById("save-email");
    const password_button = document.getElementById("save-password");
    const logout_button = document.getElementById("logout-profile");

    setStats();

    email_button.onclick = function() {
        changeEmailData();
    };

    password_button.onclick = function() {
        changePasswordData();
    };

    logout_button.onclick = function() {
        logout();
    };
} else if (window.location.pathname.includes("/login")) {
    const login_form = document.getElementById("login-form");

    login_form.onsubmit = function(event) {
        event.preventDefault();
        getSessionData();
    };
} else if (window.location.pathname.includes("/login")) {
    const signup_form = document.getElementById("signup-form");

    signup_form.onsubmit = function(event) {
        event.preventDefault();
        createSessionData();
    };
};
