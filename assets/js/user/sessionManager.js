const get_user = "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv/user/";
const edit_user_email =
  "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv:v1/user/edit_email/";
const edit_user_pass =
  "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv:v1/user/edit_pass/";
const edit_user_status =
  "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv/user/edit_status/";

import { request } from "../base/apiManager.js";

async function change_session_data(headers, endpoint) {
  const error_label = document.getElementById("error-label");
  error_label.innerHTML = "Changing settings...";

  const result = await request(endpoint, headers, false, "change session data");

  if (result.Success) {
    error_label.textContent = result.Result.message;
  } else {
    error_label.textContent = "Error changing session data.";
    console.error(`Unable to change session data: ${result.Result}`);
  }
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

    await change_session_data(requestOptions, `${edit_user_email}${data.Data}`);
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

    await change_session_data(requestOptions, `${edit_user_pass}${data.Data}`);
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

    await change_session_data(
      requestOptions,
      `${edit_user_status}${data.Data}`
    );
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
      const result = await request(
        `${get_user}${data.Data}`,
        get_user_options,
        true, "get user"
      );

      if (result.Success) {
        return result.Result;
      } else {
        throw new Error(`Unable to get user: ${result.Result}`);
      }
    }

    const user = await get_user();
    return user;
  }
}
