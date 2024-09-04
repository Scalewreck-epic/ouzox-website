const urlParams = new URLSearchParams(window.location.search);
const errorCode = Number(encodeURIComponent(urlParams.get("code"))) || 404;

const errorcodeLabel = document.getElementById("errorcode");
const messageHeader = document.getElementById("messageheader");
const message = document.getElementById("message");
const navigationTitle = document.getElementById("navigation-title");

const errorMessages = {
  400: { header: "Bad Request", message: "Unable to understand your request. Please check your input and try again." },
  401: { header: "Unauthorized", message: "You do not have permission to access this resource. Incorrect or missing credentials." },
  402: { header: "Payment Required", message: "Payment is required to access this resource." },
  403: { header: "Access Denied", message: "You do not have permission to access this resource." },
  404: { header: "Not Found", message: "The page you are looking for could not be found. It may have been moved or deleted." },
  405: { header: "Method Not Allowed", message: "The method you used to access this resource is not allowed." },
  409: { header: "Conflict", message: "The request could not be completed due to a conflict." },
  429: { header: "Too Many Requests", message: "You have made too many requests to this resource. Please try again later." },
  500: { header: "Internal Server Error", message: "An error occurred on the server. Ouzox is attempting to fix it. If problem persists, please report it." },
  503: { header: "Service Unavailable", message: "Ouzox is currently unavailable. Please try again later." },
};

errorcodeLabel.textContent = `Error ${errorCode}`;
navigationTitle.textContent = `Ouzox | Error ${errorCode}`;

const errorMessage = errorMessages[errorCode]

if (errorMessage) {
  messageHeader.textContent = errorMessage.header;
  message.textContent = errorMessage.message;
} else {
  messageHeader.textContent = "Unknown Error.";
  message.textContent = `An unknown error occurred. Error code: ${errorCode}`
}