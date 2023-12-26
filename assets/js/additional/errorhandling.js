const urlParams = new URLSearchParams(window.location.search);
const error_code = encodeURIComponent(urlParams.get("er") || "");

const errorcode = document.getElementById("errorcode");
const message_header = document.getElementById("messageheader");
const message = document.getElementById("message");
const navigation_title = document.getElementById("navigation-title");

errorcode.textContent = error_code;
navigation_title.textContent = `Ouzox | ${error_code} Error`;

switch (error_code) {
  default:
    errorcode.textContent = "404";
    message_header.textContent = "Not Found";
    message.textContent = "You're navigating somewhere beyond our territory.";
  case 500:
    message_header.textContent = "Internal Server Error";
    message.textContent =
      "This is our fault, not yours. We're working on it, please try again later.";
    break;
  case 404:
    message_header.textContent = "Not Found";
    message.textContent = "You're navigating somewhere beyond our territory.";
    break;
  case 403:
    message_header.textContent = "Forbidden";
    message.textContent = "This is private property you're walking on.";
    break;
  case 429:
    message_header.textContent = "Too Many Requests";
    message.textContent =
      "Please let our systems cooldown. Wait a few seconds and retry.";
    break;
  case 401:
    message_header.textContent = "Unauthorized";
    message.textContent = "You're not playing by the rules.";
    break;
  case 400:
    message_header.textContent = "Bad Request";
    message.textContent =
      "I don't even know what you're doing to get this error.";
    break;
}
