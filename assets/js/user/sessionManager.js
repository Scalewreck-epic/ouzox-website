/**
 * @file sessionManager.js
 * @description This module manages user sessions by handling cookies and user settings.
 * It provides functionalities to create, fetch, delete cookies, and change user settings such as email, password, and status.
 */

import { request } from "../base/apiManager.js";
import { endpoints } from "../other/endpoints.js";

/**
 * Calculates the expiration date for cookies.
 * @param {boolean} past - If true, sets the expiration date to one year in the past; otherwise, sets it to one year in the future.
 * @returns {Date} The calculated expiration date.
 */
const calculateExpiration = (past) => {
  const currentDate = new Date();
  currentDate.setFullYear(currentDate.getFullYear() + (past ? -1 : 1));
  return currentDate;
};

/**
 * Deletes a cookie by setting its expiration date to the past.
 * @param {string} cookieName - The name of the cookie to delete.
 */
const deleteCookie = (cookieName) => {
  document.cookie = `${cookieName}=; expires=${calculateExpiration(true).toUTCString()}`;
};

/**
 * Creates a cookie with a specified name and token.
 * @param {string} cookieName - The name of the cookie to create.
 * @param {string} token - The value to store in the cookie.
 */
export const createCookie = (cookieName, token) => {
  document.cookie = `${cookieName}=${token}; expires=${calculateExpiration(false).toUTCString()}; samesite=lax; secure;`;
};

/**
 * Clears all cookies by deleting each one.
 */
export const clearCookie = () => {
  document.cookie.split(";").forEach((cookie) => deleteCookie(cookie.split("=")[0].trim()));
};

/**
 * Fetches a cookie by its name.
 * @param {string} cookieName - The name of the cookie to fetch.
 * @returns {Object} An object containing the cookie data and its validity.
 */
export const fetchCookie = (cookieName) => {
  const matchingCookie = document.cookie.split(";").map((pair) => pair.trim().split("=")).find(([name]) => name === cookieName);
  return matchingCookie ? { data: matchingCookie[1], valid: true } : { data: null, valid: false };
};

const sessionId = fetchCookie("session_id").data; // Fetches session ID

/**
 * Requests to change user settings.
 * @param {Object} headers - The headers for the request.
 * @param {string} endpoint - The API endpoint to send the request to.
 * @param {HTMLElement} errorLabel - The label to display error messages.
 */
const changeSessionData = async (headers, endpoint, errorLabel) => {
  errorLabel.textContent = "Changing settings...";
  const result = await request(endpoint, headers, false);
  errorLabel.textContent = result.ok ? result.response.message : result.response;
};

/**
 * Changes one type of data from user settings.
 * @param {Object} data - The data to change.
 * @param {string} endpoint - The API endpoint to send the request to.
 * @param {HTMLElement} errorLabel - The label to display error messages.
 */
const changeData = async (data, endpoint, errorLabel) => {
  if (sessionId) {
    const myHeaders = new Headers({ "Content-Type": "application/json" });
    await changeSessionData({ method: "POST", headers: myHeaders, body: JSON.stringify(data) }, endpoint, errorLabel);
  }
};

/**
 * Requests to change the user's email.
 */
export const changeEmailData = async () => {
  const newEmail = document.getElementById("email_input").value;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    await changeData({ session_id: sessionId, new_email: newEmail }, `${endpoints.user.edit_email}${sessionId}`, document.getElementById("email-error-label"));
  }
};

/**
 * Requests to change the user's password.
 */
export const changePasswordData = async () => {
  const newPassword = document.getElementById("password_input").value;
  const previousPassword = document.getElementById("old_password_input").value;
  if (newPassword.length >= 8) {
    await changeData({ session_id: sessionId, old_password: previousPassword, new_password: newPassword }, `${endpoints.user.edit_password}${sessionId}`, document.getElementById("password-error-label"));
  }
};

/**
 * Requests to change the user's profile status.
 */
export const changeStatusData = async () => {
  const newStatus = document.getElementById("status-input").value;
  await changeData({ session_id: sessionId, status: newStatus }, `${endpoints.user.edit_status}${sessionId}`, document.getElementById("status-error-label"));
};

/**
 * Fetches an alternative user using the user's ID.
 * @param {string} userId - The ID of the user to fetch.
 * @returns {Object|null} The user data or null if not found.
 */
export const fetchAlternativeUser = async (userId) => {
  const result = await request(`${endpoints.user.get_data_with_id}${userId}`, { method: "GET", headers: { "Content-Type": "application/json" } }, true);
  return result.ok ? result.response : null;
};

/**
 * Fetches the current user logged in using the user's session ID.
 * @returns {Object|null} The user data or null if not logged in.
 */
export const fetchUser = async () => {
  if (sessionId) {
    const result = await request(`${endpoints.user.get_data_with_sess}${sessionId}`, { method: "GET", headers: { "Content-Type": "application/json" } }, true);
    return result.ok ? result.response : null;
  } else {
    return null;
  }
};
