var webDomain = window.location.hostname;
var daysUntilExpire = 365 // One year
console.log(webDomain);

function createCookie() {
    var username = document.getElementById("username");
    var d = new Date();
    d.setTime(d.getTime() + (daysUntilExpire*24*60*60*1000));

    var expires = "expires=" + d.toUTCString();
    var cookieUsername = "username=" + username.value

    document.cookie = cookieUsername + "; " + expires + "; path=/; domain=" + webDomain + "; secure";
}

function getCookie(username) {
    var username = document.getElementById("username");
    var parts = value.split("; " + username + "=");

    if (parts.length == 2) {
        var cookie = parts.pop().split(";").shift();
        var domain = cookie.split(";").pop();

        if (domain == "domain=" + webDomain) {
            return cookie;
        }
    }
}

function logout(username) {
    var d = new Date();
    d.setTime(d.getTime() - (daysUntilExpire*24*60*60*1000));

    var expires = "expires=" + d.toUTCString();

    document.cookie = "username=" + username + "; " + expires + "; path=/; domain=" + webDomain + "; secure";
}
