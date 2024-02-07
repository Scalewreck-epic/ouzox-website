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
    message.textContent =
      "Unable to understand your request. Please check your input and try again.";
    break;
  case 401:
    message_header.textContent = "Unauthorized";
    message.textContent =
      "You do not have permission to access this resource. Incorrect or missing credentials.";
    break;
  case 403:
    message_header.textContent = "Access Denied";
    message.textContent = "You do not have permission to access this resource.";
    break;
  case 404:
    message_header.textContent = "Not Found";
    message.textContent =
      "The page you are looking for could not be found. It may have been moved or deleted.";
    break;
  case 405:
    message_header.textContent = "Method Not Allowed";
    message.textContent = "The method you used to access this resource is not allowed.";
    break;
  case 409:
    message_header.textContent = "Conflict";
    message.textContent = "The request could not be completed due to a conflict.";
    break;
  case 429:
    message_header.textContent = "Too Many Requests";
    message.textContent = "You have made too many requests to this resource. Please try again later.";
    break;
  case 500:
    message_header.textContent = "Internal Server Error";
    message.textContent = "An error occurred on the server. Ouzox is attempting to fix it. If problem persists, please report it.";
    break;
  case 503:
    message_header.textContent = "Service Unavailable";
    message.textContent =
      "Ouzox is currently unavailable. Please try again later.";
    break;
  default:
    message_header.textContent = "Anomaly Error.";
    message.textContent = "An unexpected error has occurred. Please report this issue to Ouzox.";
    break;
}
