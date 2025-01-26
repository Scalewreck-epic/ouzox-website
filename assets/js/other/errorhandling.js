/**
 * @file errorhandling.js
 * @description Handles the 404 page with more error codes.
 * Displays a header and message according to the error code given.
 */

import { errorMessages } from "../base/apiManager.js";

const urlParams = new URLSearchParams(window.location.search);
const errorCode = Number(urlParams.get("code")) || 404;

const errorcodeLabel = document.getElementById("errorcode");
const messageHeader = document.getElementById("messageheader");
const message = document.getElementById("message");
const navigationTitle = document.getElementById("navigation-title");
errorcodeLabel.textContent = `Error ${errorCode}`;
navigationTitle.textContent = `Ouzox | Error ${errorCode}`;

const errorMessage = errorMessages[errorCode];

if (errorMessage) {
  messageHeader.textContent = errorMessage.header;
  message.textContent = errorMessage.description;
} else {
  console.error(`Unknown error code: ${errorCode}`);
  messageHeader.textContent = "Unknown Error.";
  message.textContent = `An unknown error occurred. Error code: ${errorCode}`;
}
