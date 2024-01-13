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
    message.textContent = "There was a problem with your request.";
    break;
  case 401:
    message_header.textContent = "Unauthorized";
    message.textContent = "Your request was unauthorized";
    break;
  case 403:
    message_header.textContent = "Forbidden";
    message.textContent = "You do not have permission to view this page.";
    break;
  case 405:
    message_header.textContent = "Method Not Allowed";
    message.textContent = "You do not have permission to use this method."
    break;
  case 409:
    message_header.textContent = "Conflict";
    message.textContent = "Your request was interrupted."
    break;
  case 429:
    message_header.textContent = "Too Many Requests";
    message.textContent = "Please wait a few seconds before retrying.";
    break;
  case 500:
    message_header.textContent = "Internal Server Error";
    message.textContent = "A server error occured";
    break;
  default:
    errorcode.textContent = "404";
    message_header.textContent = "Not Found";
    message.textContent = "Page cannot be found or no longer exists.";
    break;
}
