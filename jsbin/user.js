var webDomain = window.location.hostname; // Web host name
var daysUntilExpire = 365; // One year

function createCookie() {
    var username = document.getElementById("username");
    var d = new Date();
    d.setTime(d.getTime() + (daysUntilExpire*24*60*60*1000));

    var expires = "expires=" + d.toUTCString();
    var cookieUsername = "username=" + username.value

    document.cookie = cookieUsername + "; " + expires + "; path=/; domain=" + webDomain + "; secure";
}

function getCookie() {
    if (document.cookie != "") {
        console.log("There is a cookie!");

        var str = document.cookie;
        var prompt = "username="
        var start = str.indexOf(prompt) + str.length(prompt);
        var username = str.substring(start);

        console.log(username);
    } else {
        console.log("There is no cookie.");
    }
}

function logout() {
    var username = document.getElementById("username");

    var d = new Date();
    d.setTime(d.getTime() - (daysUntilExpire*24*60*60*1000));

    var expires = "expires=" + d.toUTCString();

    document.cookie = "username=" + username.value + "; " + expires + "; path=/; domain=" + webDomain + "; secure";
}
