var webDomain = window.location.hostname;
var endpoint = "https://v1.nocodeapi.com/scalewreck/ep/EEfUSWVHrbBXlpDl";
var annualExpiration = 1;

function generateSessionId() {
    return (Math.random() * 2^53).toString(16) + Date.now();
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
        document.cookie = "session_id="+sessionId;
    })
    .catch(error => {
        console.warn("Error trying to create session data:", error);
    });
}
