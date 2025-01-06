// Handles all API reqeusts

export const errorMessages = {
  400: {
    header: "Bad Request",
    description: "The request was invalid or cannot be processed.",
  },
  401: {
    header: "Unauthorized",
    description: "Authentication is required to access this resource.",
  },
  402: {
    header: "Payment Required",
    description: "Payment is required to access this resource.",
  },
  403: {
    header: "Access Denied",
    description: "Permission is required to access this resource.",
  },
  404: {
    header: "Not Found",
    description: "This resource could not be found.",
  },
  405: {
    header: "Method Not Allowed",
    description: "The request method is not supported by this resource.",
  },
  409: {
    header: "Conflict",
    description:
      "The request could not be completed due to a conflict with the current state of the resource.",
  },
  429: {
    header: "Too Many Requests",
    description: "Sent too many requests in a given amount of time.",
  },
  500: {
    header: "Internal Server Error",
    description:
      "An unexpected error occured. If this keeps happening, contact us.",
  },
  503: {
    header: "Service Unavailable",
    description:
      "Ouzox is currently down for maintenance. We will be up shortly.",
  },
};

const cache = new Map();

class RequestHandler {
  constructor(endpoint, options = {}, redirect = false) {
    this.endpoint = endpoint;
    this.options = options;
    this.redirect = redirect;
    this.retries = 3;
    this.timeout = 5; // seconds
    this.retryTimeout = 3; // seconds
  }

  // Sanitizes the endpoint
  validateEndpoint() {
    if (typeof this.endpoint !== "string") {
      throw new Error(
        `Expected endpoint to be a string: ${typeof this.endpoint}`
      );
    }

    // Turn the endpoint into a new URL
    try {
      const url = new URL(this.endpoint);
      if (url.protocol !== "https:") {
        throw new Error("Invalid endpoint URL: HTTPS required");
      }
      return url.href;
    } catch (error) {
      throw new Error(`Invalid endpoint URL: ${this.endpoint}`, error);
    }
  }

  // Validates the options of the request
  validateOptions() {
    if (typeof this.options !== "object" || this.options === null) {
      throw new Error(
        `Expected options to be an object: ${typeof this.options}`
      );
    }

    if (
      this.options.body &&
      typeof this.options.body !== "string" &&
      !(this.options.body instanceof FormData)
    ) {
      try {
        JSON.stringify(this.options.body);
        this.options.body = JSON.stringify(this.options.body);
        if (!this.options.headers) this.options.headers = {};
        if (!this.options.headers["Content-Type"])
          this.options.headers["Content-Type"] = "application/json";
      } catch (error) {
        throw new Error(
          "Invalid options body: Must be a string, FormData, or an object that can be stringified to JSON."
        );
      }
    }
    if (this.options.method) {
      if (typeof this.options.method !== "string") {
        throw new Error("Invalid options method: Must be a string");
      }
    }
  }

  // Handles the errors of the request
  handleError(response) {
    const statusCode = response.status || 500; // Default 500 code error

    if (this.redirect) {
      window.location.assign(`404?code=${statusCode}`); // Assign the 404 page with the status code
      return;
    } else { // Otherwise, throw the error
      const errorMessage = errorMessages[statusCode];
      if (!errorMessage) {
        throw new Error(`Unknown error: ${statusCode}`);
      }
      throw new Error(`${statusCode}: ${errorMessage.header}`);
    }
  }

  // Makes the fetch request
  async makeRequest() {
    // Create the abortions
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout * 1000);

    // Create the retry delays
    const retryDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const endpointUrl = this.validateEndpoint();
    this.validateOptions();

    for (let i = 0; i < this.retries; i++) {
      try {
        // If the response has been taken in the past, return the previous response
        if (cache.has(endpointUrl)) {
          const {response, timestamp} = cache.get(endpointUrl);
          const cahceExpirationTime = 60 * 1000;

          if (Date.now() - timestamp < cahceExpirationTime) { // Return the previous response if it is recent
            return {response, ok: true};
          } else { // Otherwise, delete the cache
            cache.delete(endpointUrl);
          }
        }

        // Fetch reqeust with abortion controller
        const response = await fetch(endpointUrl, {...this.options, signal: controller.signal});
        clearTimeout(timeoutId); // Clear the timeout once the response has been completed.

        if (response.ok) {
          // Don't json parse if there is no response
          const jsonResponse = response.status == 204 ? null : await response.json();

          cache.set(endpointUrl, {response: jsonResponse, ok: true});
          return {response: jsonResponse, ok: true};
        }

        throw this.handleError(response);
      } catch(error) {
        // If it's under the amount of retries, redo the request
        if (i == this.retries - 1) return {response: error, ok: false};
        await retryDelay(this.retryTimeout * 1000);
      }
    }
  }
}

export const request = (endpoint, options, redirect = false) => {
  const handler = new RequestHandler(endpoint, options, redirect);
  return handler.makeRequest();
};
