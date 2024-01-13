const get_user_with_session =
  "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv/user/session/";
const get_user_with_id =
  "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv/user/id/";
const edit_user_email =
  "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv:v1/user/edit_email/";
const edit_user_pass =
  "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv:v1/user/edit_pass/";
const edit_user_status =
  "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv/user/edit_status/";

import { request } from "../base/apiManager.js";

const change_session_data = async (headers, endpoint) => {
  const error_label = document.getElementById("error-label");
  error_label.innerHTML = "Changing settings...";

  const result = await request(endpoint, headers, false, "change session data");

  if (result.Success) {
    error_label.textContent = result.Result.message;
  } else {
    error_label.textContent = "Error changing session data.";
    throw new Error(`Unable to change session data: ${result.Result}`);
  }
};

export const fetch_cookie = (wanted) => {
  const cookiePairs = document.cookie
    .split(";")
    .map((pair) => pair.trim().split("="));
  const matchingCookie = cookiePairs.find(([name]) => name === wanted);

  if (matchingCookie) {
    return { Data: matchingCookie[1], Valid: true };
  } else {
    return { Data: null, Valid: false };
  }
};

export const change_email_data = async () => {
  const session_id = fetch_cookie("session_id").Data;

  if (session_id) {
    const new_email = document.getElementById("email_input").value;
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(new_email);

    if (validEmail) {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({
          session_id: session_id,
          new_email: new_email,
        }),
      };

      await change_session_data(
        requestOptions,
        `${edit_user_email}${session_id}`
      );
    }
  }
};

export const change_password_data = async () => {
  const session_id = getCookie("session_id").Data;

  if (session_id) {
    const new_password = document.getElementById("password_input").value;
    const old_password = document.getElementById("old_password_input").value;
    const validPassword = new_password.length >= 8;

    if (validPassword) {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({
          session_id: session_id,
          old_password: old_password,
          new_password: new_password,
        }),
      };

      await change_session_data(
        requestOptions,
        `${edit_user_pass}${session_id}`
      );
    }
  }
};

export const change_status_data = async () => {
  const session_id = fetch_cookie("session_id").Data;

  if (session_id) {
    const new_status = document.getElementById("status-input").value;

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        session_id: session_id,
        status: new_status,
      }),
    };

    await change_session_data(
      requestOptions,
      `${edit_user_status}${session_id}`
    );
  }
};

export const fetch_alternative_user = async (user_id) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const get_user_options = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  const result = await request(
    `${get_user_with_id}${user_id}`,
    get_user_options,
    true,
    "get user (id)"
  );

  if (result.Success) {
    return result.Result;
  } else {
    throw new Error(`Unable to get user with user ID: ${result.Result}`);
  }
};

export const fetch_user = async () => {
  const session_id = fetch_cookie("session_id").Data;

  if (session_id) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const get_user_options = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    const result = await request(
      `${get_user_with_session}${session_id}`,
      get_user_options,
      true,
      "get user (session)"
    );

    if (result.Success) {
      return result.Result;
    } else {
      throw new Error(`Unable to get user with session ID: ${result.Result}`);
    }
  }
};
