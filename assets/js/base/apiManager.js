// Handles all API reqeusts

export const errorMessages = {
  400: {
    header: "Bad Request",
    description: "The request was invalid or cannot be processed.",
    retry: true,
  },
  401: {
    header: "Unauthorized",
    description: "Authentication is required to access this resource.",
    retry: false,
  },
  402: {
    header: "Payment Required",
    description: "Payment is required to access this resource.",
    retry: false,
  },
  403: {
    header: "Access Denied",
    description: "Permission is required to access this resource.",
    retry: false,
  },
  404: {
    header: "Not Found",
    description: "This resource could not be found.",
    retry: true,
  },
  405: {
    header: "Method Not Allowed",
    description: "The request method is not supported by this resource.",
    retry: false,
  },
  409: {
    header: "Conflict",
    description:
      "The request could not be completed due to a conflict with the current state of the resource.",
    retry: true,
  },
  429: {
    header: "Too Many Requests",
    description: "Sent too many requests in a given amount of time.",
    retry: true,
  },
  500: {
    header: "Internal Server Error",
    description:
      "An unexpected error occured. If this keeps happening, contact us.",
    retry: true,
  },
  503: {
    header: "Service Unavailable",
    description:
      "Ouzox is currently down for maintenance. We will be up shortly.",
    retry: false,
  },
};

const cache = new Map();

class RequestHandler {
  constructor(endpoint, options, redirect = false) {
    this.endpoint = endpoint;
    this.options = options;
    this.redirect = redirect;
    this.retries = 3;
    this.timeout = 5; // seconds
    this.retryTimeout = 3; // seconds
    this.cacheExpiration = 120; // seconds
  }

  // Sanitizes the endpoint
  validateEndpoint() {
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
  async handleError(response, retryCount) {
    const statusCode = response.status || 500; // Default 500 code error
    const errorMessage = errorMessages[statusCode];

    if (this.redirect && retryCount == this.retries - 1) {
      window.location.assign(`404?code=${statusCode}`); // Assign the 404 page with the status code
      return;
    } else {
      // Otherwise, throw the error
      const jsonResponse = await response.json();
      const newError = new Error(`${statusCode}: ${!errorMessage ? "Unknown Error" : errorMessage.header}: ${jsonResponse.message}`);
      newError.errorMessage = jsonResponse.message;
      newError.errorCode = statusCode;

      return newError
    }
  }

  // Makes the fetch request
  async makeRequest() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout * 1000);

    const endpointUrl = this.validateEndpoint();
    this.validateOptions();

    for (let i = 0; i < this.retries; i++) {
      try {
        // Check for previous responses
        if (cache.has(endpointUrl)) {
          const { response, timestamp } = cache.get(endpointUrl);
          const cacheExpirationTime = this.cacheExpiration * 1000;

          if (Date.now() - timestamp < cacheExpirationTime) {
            return { response, ok: true }; // Return the cached response
          } else {
            cache.delete(endpointUrl); // Delete stale responses
          }
        }

        // Fetch reqeust with abort controller
        const response = await fetch(endpointUrl, {
          ...this.options,
          signal: controller.signal,
        });
        clearTimeout(timeoutId); // Clear the timeout after request

        if (response.ok) {
          // Don't json parse if there is no response
          const jsonResponse = response.status == 204 ? null : await response.json();

          cache.set(endpointUrl, { response: jsonResponse, ok: true }); // Cache successful responses
          return { response: jsonResponse, ok: true };
        }

        const error = await this.handleError(response, i);

        throw error;
      } catch (error) {
        const errorResponse = { response: error.errorMessage, ok: false };
        console.error(error);
        if (i == this.retries - 1) {
          return errorResponse;
        } else if (!errorMessages[error.errorCode].retry) {
          return errorResponse;
        }
        await new Promise((resolve) =>
          setTimeout(resolve, this.retryTimeout * 1000)
        );
      }
    }
  }
}
/**
 *
 * @param {string} endpoint
 * @param {object} options
 * @param {boolean} redirect
 * @returns
 */
export const request = (endpoint, options, redirect = false) => {
  const handler = new RequestHandler(endpoint, options, redirect);
  return handler.makeRequest();
};
