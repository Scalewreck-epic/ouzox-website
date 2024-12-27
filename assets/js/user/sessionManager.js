import { request } from "../base/apiManager.js";
import { endpoints } from "../other/endpoints.js";

const calculate_expiration = (past) => {
  const currentDate = new Date();

  if (past == true) {
    currentDate.setFullYear(currentDate.getFullYear() - 1);
  } else {
    currentDate.setFullYear(currentDate.getFullYear() + 1);
  }

  return currentDate;
};

const delete_cookie = (cookie_name) => {
  const expiration = calculate_expiration(true).toUTCString();
  document.cookie = `${cookie_name}=; expires=${expiration}`;
};

export const create_cookie = (cookie_name, token) => {
  const expiration = calculate_expiration(false).toUTCString();
  document.cookie = `${cookie_name}=${token}; expires=${expiration}; samesite=lax; secure;`;
};

export const clear_cookie = () => {
  document.cookie.split(";").forEach(function (cookie) {
    const name = cookie.split("=")[0].trim();
    delete_cookie(name);
  });
};

const change_session_data = async (headers, endpoint) => {
  const error_label = document.getElementById("error-label");
  error_label.innerHTML = "Changing settings...";

  const result = await request(endpoint, headers, false);

  if (result.ok == true) {
    error_label.textContent = result.response.message;
  } else {
    error_label.textContent = result.response;
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

const sessionId = fetch_cookie("session_id").Data;

export const change_email_data = async () => {
  const editEmail = "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv:v1/user/edit_email/";

  if (sessionId) {
    const newEmail = document.getElementById("email_input").value;
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail);

    if (validEmail) {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({
          session_id: sessionId,
          new_email: newEmail,
        }),
      };

      await change_session_data(
        requestOptions,
        `${editEmail}${sessionId}`
      );
    }
  }
};

export const change_password_data = async () => {
  if (sessionId) {
    const newPassword = document.getElementById("password_input").value;
    const previousPassword = document.getElementById("old_password_input").value;
    const validPassword = newPassword.length >= 8;

    if (validPassword) {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({
          session_id: sessionId,
          old_password: previousPassword,
          new_password: newPassword,
        }),
      };

      await change_session_data(
        requestOptions,
        `${endpoints.user.edit_password}${sessionId}`
      );
    }
  }
};

export const change_status_data = async () => {
  if (sessionId) {
    const new_status = document.getElementById("status-input").value;

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        session_id: sessionId,
        status: new_status,
      }),
    };

    await change_session_data(
      requestOptions,
      `${endpoints.user.edit_status}${sessionId}`
    );
  }
};

export const fetch_alternative_user = async (userId) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const getUserOpt = {
    method: "GET",
    headers: myHeaders,
  };

  const result = await request(
    `${endpoints.user.get_data_with_id}${userId}`,
    getUserOpt,
    true,
  );

  if (result.ok == true) {
    return result.response;
  }
};

export const fetch_user = async () => {
  if (sessionId) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const getUserOpt = {
      method: "GET",
      headers: myHeaders,
    };

    const result = await request(
      `${endpoints.user.get_data_with_sess}${sessionId}`,
      getUserOpt,
      false,
    );

    if (result.ok == true) {
      return result.response;
    } else {
      clear_cookie();
    }
  }
};
