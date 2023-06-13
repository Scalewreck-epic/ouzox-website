const get_user_url = "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv/user/"; // + session id
const change_user_email_url = "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv:v1/user/edit_email/"; // + session id
const change_user_password_url = "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv:v1/user/edit_pass/"; // + session id

export async function getCookie(trim) {
    const cookies = document.cookie;
    const cookieArray = cookies.split(";");

    for (let i = 0; i < cookieArray.length; i++) {
        const cookie = cookieArray[i];
        const [name, value] = cookie.split("=");

        const cookieName = name.trim();

        if (cookieName === trim) {
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
};

export async function changeEmailData() {
    var data = getCookie("session_id");

    if (data.Valid) {
        const new_email = document.getElementById("email_input").value;

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify({
                "session_id": data.Data,
                "new_email": new_email,
            }),
        };

        changeSessionData(requestOptions, (change_user_email_url + data.Data));
    }
}

export async function changePasswordData() {
    var data = getCookie("session_id");

    if (data.Valid) {
        const new_password = document.getElementById("password_input").value;
        const old_password = document.getElementById("old_password_input").value;

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify({
                "session_id": data.Data,
                "old_password": old_password,
                "new_password": new_password,
            }),
        };
        
        changeSessionData(requestOptions, (change_user_password_url + data.Data));
    }
}

export async function getUser() {
    var data = getCookie("session_id");

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var get_user_options = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
    }

    if (data.Valid) {
        async function get_user() {
            try {
                const response = await fetch(get_user_url + data.Data, get_user_options);
                const result = await response.text();
                const result_parse = JSON.parse(result);
    
                return result_parse;
            } catch (error) {
                showError(error, false);
            };
        };
    
        var user = await get_user();
        return user;
    };
};
