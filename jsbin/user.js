var endpoint = "https://v1.nocodeapi.com/scalewreck/ep/EEfUSWVHrbBXlpDl";
var annualExpiration = 1;

console.log(generateSessionId());

function generateSessionId() {
    var session_characters = 2^53;
    var letters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var session_id = "";

    for (let i = 0; i < session_characters; i++) {
        var random_num = Math.floor(Math.random() * letters.length);
        var random_letter = letters.charAt(random_num);
        session_id += random_letter;
    }

    return session_id;
}

function calculateExpiration() {
    var currentDate = new Date();
    currentDate.setFullYear(currentDate.getFullYear() - annualExpiration);

    return currentDate;
}

function getSessionData() {
    const cookies = document.cookie;
    const cookieArray = cookies.split(";");

    for (let i = 0; i < cookieArray.length; i++) {
        const cookie = cookieArray[i];
        const [name, value] = cookie.split("=");
        if (name.trim() === "session_id") {
            return value;
        }
    }
    return null;
}

function createSessionData() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var requestOptions = {
        method: "post",
        headers: myHeaders,
        body: JSON.stringify({ username, password }),
        redirect: "follow",
    };

    fetch(endpoint, requestOptions)
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            console.warn("Failed to create session data");
        }
    })
    .then(result => {
        var sessionId = generateSessionId();
        var expiration = calculateExpiration().toUTCString();

        document.cookie = "session_id="+sessionId+"; expiration="+expiration+";";
    })
    .catch(error => {
        console.warn("Error trying to create session data:", error);
    });
}
