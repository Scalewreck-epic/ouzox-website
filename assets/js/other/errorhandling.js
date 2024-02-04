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
      "Your request didn't compute correctly. Please check your input and try again.";
    break;
  case 401:
    message_header.textContent = "Unauthorized";
    message.textContent =
      "Your request was unauthroized. Incorrect credentials used.";
    break;
  case 403:
    message_header.textContent = "Access Denied";
    message.textContent = "You do not have permission to access this content.";
    break;
  case 404:
    message_header.textContent = "Not Found";
    message.textContent =
      "You've wandered too far from the website. The page you're looking for isn't here.";
    break;
  case 405:
    message_header.textContent = "Method Not Allowed";
    message.textContent = "Your request was using an invalid method.";
    break;
  case 409:
    message_header.textContent = "Conflict";
    message.textContent = "There's a conflict in your request.";
    break;
  case 429:
    message_header.textContent = "Too Many Requests";
    message.textContent = "Just wait a few seconds then return back.";
    break;
  case 500:
    message_header.textContent = "Internal Server Error";
    message.textContent = "Ouzox is trying to fix the error in the server.";
    break;
  case 503:
    message_header.textContent = "Service Unavailable";
    message.textContent =
      "Ouzox is temporarily under maintenance. Please come back later.";
    break;
  default:
    message_header.textContent = "Anomaly Error.";
    message.textContent = "An unknown error has disturbed the site.";
    break;
}
