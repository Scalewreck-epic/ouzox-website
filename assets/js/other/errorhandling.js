const urlParams = new URLSearchParams(window.location.search);
const error_code = Number(encodeURIComponent(urlParams.get("code"))) || 404;

const errorcode = document.getElementById("errorcode");
const message_header = document.getElementById("messageheader");
const message = document.getElementById("message");
const navigation_title = document.getElementById("navigation-title");

errorcode.textContent = `Error ${error_code}`;
navigation_title.textContent = `Ouzox | Error ${error_code}`;

switch (error_code) {
  case 400:
    message_header.textContent = "Bad Request";
    message.textContent = "Your request was invalid.";
    break;
  case 401:
    message_header.textContent = "Unauthorized";
    message.textContent = "Your request was unprotected.";
    break;
  case 403:
    message_header.textContent = "Access Denied";
    message.textContent = "You do not have permission to view this page.";
    break;
  case 404:
    message_header.textContent = "Not Found";
    message.textContent = "Page cannot be found or no longer exists.";
    break;
  case 405:
    message_header.textContent = "Method Not Allowed";
    message.textContent = "Your request could not process the method.";
    break;
  case 409:
    message_header.textContent = "Conflict";
    message.textContent =
      "Your request could not be completed due to a conflict.";
    break;
  case 429:
    message_header.textContent = "Too Many Requests";
    message.textContent = "Your request has been called too much.";
    break;
  case 500:
    message_header.textContent = "Internal Server Error";
    message.textContent =
      "Your request was could not be completed due to an internal server error.";
    break;
  case 503:
    message_header.textContent = "Service Unavailable";
    message.textContent = "Ouzox is currently unavailable.";
    break;
  default:
    message_header.textContent = "Error";
    message.textContent = "An unknown error occured.";
    break;
}
