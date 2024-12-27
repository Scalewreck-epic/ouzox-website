import { request } from "../base/apiManager.js";
import { endpoints } from "../other/endpoints.js";

const calculate_expiration = (past) => {
  const currentDate = new Date();
  currentDate.setFullYear(currentDate.getFullYear() + (past ? -1 : 1));
  return currentDate;
};

const delete_cookie = (cookie_name) => {
  document.cookie = `${cookie_name}=; expires=${calculate_expiration(true).toUTCString()}`;
};

export const create_cookie = (cookie_name, token) => {
  document.cookie = `${cookie_name}=${token}; expires=${calculate_expiration(false).toUTCString()}; samesite=lax; secure;`;
};

export const clear_cookie = () => {
  document.cookie.split(";").forEach(cookie => delete_cookie(cookie.split("=")[0].trim()));
};

const change_session_data = async (headers, endpoint) => {
  const error_label = document.getElementById("error-label");
  error_label.innerHTML = "Changing settings...";
  const result = await request(endpoint, headers, false);
  error_label.textContent = result.ok ? result.response.message : result.response;
};

export const fetch_cookie = (wanted) => {
  const matchingCookie = document.cookie.split(";").map(pair => pair.trim().split("=")).find(([name]) => name === wanted);
  return matchingCookie ? { Data: matchingCookie[1], Valid: true } : { Data: null, Valid: false };
};

const sessionId = fetch_cookie("session_id").Data;

const change_data = async (data, endpoint) => {
  if (sessionId) {
    const myHeaders = new Headers({ "Content-Type": "application/json" });
    await change_session_data({ method: "POST", headers: myHeaders, body: JSON.stringify(data) }, endpoint);
  }
};

export const change_email_data = async () => {
  const newEmail = document.getElementById("email_input").value;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    await change_data({ session_id: sessionId, new_email: newEmail }, `${endpoints.user.edit_email}${sessionId}`);
  }
};

export const change_password_data = async () => {
  const newPassword = document.getElementById("password_input").value;
  const previousPassword = document.getElementById("old_password_input").value;
  if (newPassword.length >= 8) {
    await change_data({ session_id: sessionId, old_password: previousPassword, new_password: newPassword }, `${endpoints.user.edit_password}${sessionId}`);
  }
};

export const change_status_data = async () => {
  const new_status = document.getElementById("status-input").value;
  await change_data({ session_id: sessionId, status: new_status }, `${endpoints.user.edit_status}${sessionId}`);
};

export const fetch_alternative_user = async (userId) => {
  const result = await request(`${endpoints.user.get_data_with_id}${userId}`, { method: "GET", headers: { "Content-Type": "application/json" } }, true);
  return result.ok ? result.response : null;
};

export const fetch_user = async () => {
  if (sessionId) {
    const result = await request(`${endpoints.user.get_data_with_sess}${sessionId}`, { method: "GET", headers: { "Content-Type": "application/json" } }, false);
    if (!result.ok) clear_cookie();
    return result.ok ? result.response : null;
  }
};