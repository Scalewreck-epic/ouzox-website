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

function getCookie(name) {
    if (document.cookie != "") {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        var name = parts.pop().split(";").shift();
    
        if (parts.length == 2) {
            console.log(name);
            return name;
        }
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

getCookie("username");
