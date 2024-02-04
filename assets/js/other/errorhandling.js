const urlParams = new URLSearchParams(window.location.search);
const error_code = Number(encodeURIComponent(urlParams.get("code")));

const errorcode = document.getElementById("errorcode");
const message_header = document.getElementById("messageheader");
const message = document.getElementById("message");
const navigation_title = document.getElementById("navigation-title");

if (error_code) {
  errorcode.textContent = error_code;
  navigation_title.textContent = `Ouzox | ${error_code} Error`;
}

switch (error_code) {
  case 400:
    message_header.textContent = "Bad Request";
    message.textContent = "Your request was invalid.";
    break;
  case 401:
    message_header.textContent = "Unauthorized";
    message.textContent = "Your request did not include any security.";
    break;
  case 403:
    message_header.textContent = "Access Denied";
    message.textContent = "You do not have permission to use this request.";
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
    message.textContent = "The server was unavailable.";
  default:
    errorcode.textContent = "404";
    message_header.textContent = "Not Found";
    message.textContent = "Page cannot be found or no longer exists.";
    break;
}
