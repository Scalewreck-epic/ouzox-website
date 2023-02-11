var signup_endpoint = "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv:v1/auth/signup";
var login_endpoint = "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv:v1/auth/login";

var annualExpiration = 1;

function calculateExpiration() {
    var currentDate = new Date();
    currentDate.setFullYear(currentDate.getFullYear() + annualExpiration);

    return currentDate;
}

function getCookieData(trim) {
    const cookies = document.cookie;
    const cookieArray = cookies.split(";");

    for (let i = 0; i < cookieArray.length; i++) {
        const cookie = cookieArray[i];
        const [name, value] = cookie.split("=");
        if (name.trim() === trim) {
            return {
                "Data": value.toString(),
                "Valid": true,
            };
        }
    }

    return {
        "Data": "no data.",
        "Valid": false,
    };
}

function implementUsername() {
    var username = document.getElementById("username");
    var data = getCookieData("account_id");

    var login_btn = document.getElementById("login-btn");
    var signup_btn = document.getElementById("signup-btn");

    if (data.Valid) {
        var url = "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv:v1/auth/me";

        login_btn.remove();
        signup_btn.remove();
    
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var requestOptions = {
            method: "GET",
            headers: myHeaders,
            body: JSON.stringify({
                "id": data.Data,
            }),
        }

        fetch(url, requestOptions)
        .then(response => response.text())
        .then(result => {
            var result_parse = JSON.parse(result);
            console.log(result_parse);
        })
    } else {
        username.innerHTML = "?";
    }
}

function createCookieData(authToken, id) {
    var expiration = calculateExpiration().toUTCString();

    document.cookie = "session_id="+authToken+"; expires="+expiration+";";
    document.cookie = "account_id="+id+"; expires="+expiration+";";
}

function createSessionData() {
    var data = getCookieData("session_id");

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
            console.log(result_parse);

            if (result_parse.authToken) {
                createCookieData(result_parse.authToken, result_parse.userId);
                error_label.innerHTML = "Successfully created account!";
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
    var data = getCookieData("session_id");

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
            console.log(result_parse);

            if (result_parse.authToken) {
                createCookieData(result_parse.authToken, result_parse.userId);
                error_label.innerHTML = "Successfully logged in!";
            } else {
                error_label.innerHTML = result_parse.message;
            }
        })
    }
}

console.log(document.cookie);
implementUsername();
