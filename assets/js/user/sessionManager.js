import { request } from "../base/apiManager.js";
import { endpoints } from "../other/endpoints.js";

const calculateExpiration = (past) => {
  const currentDate = new Date();
  currentDate.setFullYear(currentDate.getFullYear() + (past ? -1 : 1));
  return currentDate;
};

const deleteCookie = (cookieName) => {
  document.cookie = `${cookieName}=; expires=${calculateExpiration(true).toUTCString()}`;
};

const changeSessionData = async (headers, endpoint) => {
  const errorLabel = document.getElementById("error-label");
  errorLabel.textContent = "Changing settings...";

  const result = await request(endpoint, headers, false);
  errorLabel.textContent = result.ok ? result.response.message : result.response;
};

export const createCookie = (cookieName, token) => {
  document.cookie = `${cookieName}=${token}; expires=${calculateExpiration(false).toUTCString()}; samesite=lax; secure;`;
};

export const clearCookie = () => {
  document.cookie.split(";").forEach((cookie) => deleteCookie(cookie.split("=")[0].trim()));
};

export const fetchCookie = (cookieName) => {
  const matchingCookie = document.cookie
    .split(";")
    .map((pair) => pair.trim().split("="))
    .find(([name]) => name === cookieName);
  return matchingCookie
    ? { data: matchingCookie[1], valid: true }
    : { data: null, valid: false };
};

const sessionId = fetchCookie("session_id").data;

const changeData = async (data, endpoint) => {
  if (sessionId) {
    const myHeaders = new Headers({ "Content-Type": "application/json" });
    await changeSessionData(
      { method: "POST", headers: myHeaders, body: JSON.stringify(data) },
      endpoint
    );
  }
};

export const changeEmailData = async () => {
  const newEmail = document.getElementById("email_input").value;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    await changeData(
      { session_id: sessionId, new_email: newEmail },
      `${endpoints.user.edit_email}${sessionId}`
    );
  }
};

export const changePasswordData = async () => {
  const newPassword = document.getElementById("password_input").value;
  const previousPassword = document.getElementById("old_password_input").value;
  if (newPassword.length >= 8) {
    await changeData(
      {
        session_id: sessionId,
        old_password: previousPassword,
        new_password: newPassword,
      },
      `${endpoints.user.edit_password}${sessionId}`
    );
  }
};

export const changeStatusData = async () => {
  const newStatus = document.getElementById("status-input").value;
  await changeData(
    { session_id: sessionId, status: newStatus },
    `${endpoints.user.edit_status}${sessionId}`
  );
};

export const fetchAlternativeUser = async (userId) => {
  const result = await request(
    `${endpoints.user.get_data_with_id}${userId}`,
    { method: "GET", headers: { "Content-Type": "application/json" } },
    true
  );
  return result.ok ? result.response : null;
};

export const fetchUser = async () => {
  if (sessionId) {
    const result = await request(
      `${endpoints.user.get_data_with_sess}${sessionId}`,
      { method: "GET", headers: { "Content-Type": "application/json" } },
      false
    );
    
    return result.ok ? result.response : null;
  }
};