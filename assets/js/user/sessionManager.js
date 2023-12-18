const get_user_url = "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv/user/"; // + session id
const change_user_email_url =
  "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv:v1/user/edit_email/"; // + session id
const change_user_password_url =
  "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv:v1/user/edit_pass/"; // + session id
const change_user_status_url =
  "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv/user/edit_status/"; // + session id

function change_session_data(headers, endpoint) {
  const error_label = document.getElementById("error-label");
  error_label.innerHTML = "Changing settings...";

  fetch(endpoint, headers)
    .then((response) => response.text())
    .then((result) => {
      const result_parse = JSON.parse(result);

      if (result_parse.message) {
        error_label.textContent = result_parse.message;
      } else {
        error_label.innerHTML = "Successfully changed settings!";
      }
    });
}

export function fetch_cookie(wanted) {
  const cookies = document.cookie;
  const cookieArray = cookies.split(";");

  if (cookies != "") {
    for (let i = 0; i < cookieArray.length; i++) {
      const cookie = cookieArray[i];
      const [name, value] = cookie.split("=");

      const cookieName = name.trim();

      if (cookieName === wanted) {
        return {
          Data: value.toString(),
          Valid: true,
        };
      }
    }
  } else {
    return {
      Data: "no data.",
      Valid: false,
    };
  }
}

export async function change_email_data() {
  const data = fetch_cookie("session_id");

  const new_email = document.getElementById("email_input").value;
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(new_email);

  if (data.Valid && validEmail) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        session_id: data.Data,
        new_email: new_email,
      }),
    };

    change_session_data(requestOptions, change_user_email_url + data.Data);
  }
}

export async function change_password_data() {
  const data = getCookie("session_id");

  const new_password = document.getElementById("password_input").value;
  const old_password = document.getElementById("old_password_input").value;

  const validPassword = new_password.length >= 8;

  if (data.Valid && validPassword) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        session_id: data.Data,
        old_password: old_password,
        new_password: new_password,
      }),
    };

    change_session_data(requestOptions, change_user_password_url + data.Data);
  }
}

export async function change_status_data() {
  const data = fetch_cookie("session_id");

  if (data.Valid) {
    const new_status = document.getElementById("status-input").value;

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        session_id: data.Data,
        status: new_status,
      }),
    };

    change_session_data(requestOptions, change_user_status_url + data.Data);
  }
}

export async function fetch_user() {
  const data = fetch_cookie("session_id");

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const get_user_options = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  if (data.Valid) {
    async function get_user() {
      try {
        const response = await fetch(
          get_user_url + data.Data,
          get_user_options
        );
        const result = await response.text();
        const result_parse = JSON.parse(result);

        return result_parse;
      } catch (error) {
        throw new Error(`Error getting user data: ${error}`);
      }
    }

    const user = await get_user();
    return user;
  }
}
