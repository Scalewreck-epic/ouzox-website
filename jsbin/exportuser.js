const get_user_url = "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv/user/"; // + session id

export function getCookie(trim) {
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

export async function getUser() {
    var data = getCookieData("session_id");

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