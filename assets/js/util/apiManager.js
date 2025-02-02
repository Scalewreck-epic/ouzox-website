/**
 * @file apiManager.js
 * @description Handles all API requests for the Ouzox application.
 * This module provides a centralized way to manage API interactions, including error handling and response caching.
 */

/**
 * @constant {Object} errorMessages
 * @description Contains predefined error messages for various HTTP status codes.
 * @property {Object} 400 - Bad Request
 * @property {Object} 401 - Unauthorized
 * @property {Object} 402 - Payment Required
 * @property {Object} 403 - Access Denied
 * @property {Object} 404 - Not Found
 * @property {Object} 405 - Method Not Allowed
 * @property {Object} 409 - Conflict
 * @property {Object} 429 - Too Many Requests
 * @property {Object} 500 - Internal Server Error
 * @property {Object} 503 - Service Unavailable
 */
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
      "An unexpected error occurred. If this keeps happening, contact us.",
    retry: true,
  },
  503: {
    header: "Service Unavailable",
    description:
      "Ouzox is currently down for maintenance. We will be up shortly.",
    retry: false,
  },
};

/**
 * @class RequestHandler
 * @description Handles API requests, including validation, error handling, and caching.
 */
class RequestHandler {
  constructor(endpoint, options, redirect = false) {
    this.endpoint = endpoint;
    this.options = options;
    this.redirect = redirect;
    this.retries = 3;
    this.timeout = 5; // seconds
    this.retryTimeout = 3; // seconds
    this.cacheExpiration = 60; // seconds
  }

  /**
   * Validates the endpoint URL.
   * @returns {string} The validated URL.
   * @throws {Error} If the URL is invalid.
   */
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

  /**
   * Handles errors from the API request.
   * @param {Response} response - The response object from the fetch request.
   * @param {number} retryCount - The current retry attempt count.
   * @returns {Promise<Error>} A promise that resolves to an error object.
   */
  async handleError(response, retryCount) {
    const statusCode = response.status || 500; // Default 500 code error
    const errorMessage = errorMessages[statusCode];

    if (this.redirect && retryCount == this.retries - 1) {
      window.location.assign(`404?code=${statusCode}`); // Assign the 404 page with the status code
      return;
    } else {
      // Otherwise, throw the error
      const jsonResponse = await response.json();
      const newError = new Error(
        `${statusCode}: ${
          !errorMessage ? "Unknown Error" : errorMessage.header
        }: ${jsonResponse.message}`
      );
      newError.errorMessage = jsonResponse.message;
      newError.errorCode = statusCode;

      return newError;
    }
  }

  getCachedResponse(endpointUrl) {
    // Check for previous responses in localStorage
    const cachedResponse = localStorage.getItem(endpointUrl);
    const cachedTimestamp = localStorage.getItem(`${endpointUrl}_timestamp`);

    if (cachedResponse && cachedTimestamp) {
      const cacheExpirationTime = this.cacheExpiration * 1000;

      // If the cache was recent or the user is offline, use the cached response.
      if (
        Date.now() - cachedTimestamp < cacheExpirationTime ||
        !navigator.onLine
      ) {
        return [true, { response: JSON.parse(cachedResponse), ok: true }]; // Return the cached response
      } else {
        localStorage.removeItem(endpointUrl); // Delete stale responses
        localStorage.removeItem(`${endpointUrl}_timestamp`);
      }
    }

    return [false, null];
  }

  setCachedResponse(endpointUrl) {
    localStorage.setItem(endpointUrl, JSON.stringify(jsonResponse)); // Cache successful responses
    localStorage.setItem(`${endpointUrl}_timestamp`, Date.now()); // Store timestamp
  }

  /**
   * Makes the fetch request to the API.
   * @returns {Promise<Object>} The response object or error response.
   */
  async makeRequest() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout * 1000);

    const endpointUrl = this.validateEndpoint();
    const cacheResponse = this.options.method == "GET";

    for (let i = 0; i < this.retries; i++) {
      try {
        const [hasCachedResponse, cachedResponse] =
          this.getCachedResponse(endpointUrl);

        // If there is a cached response, use it.
        if (hasCachedResponse) {
          return cachedResponse;
        }

        // If the user is offline, do not make a fetch request.
        if (!navigator.onLine) {
          return { response: "User is offline", ok: false };
        }

        // Fetch request with abort controller
        const response = await fetch(endpointUrl, {
          ...this.options,
          signal: controller.signal,
        });
        clearTimeout(timeoutId); // Clear the timeout after request

        if (response.ok) {
          // Don't json parse if there is no response
          const jsonResponse =
            response.status == 204 ? null : await response.json();

          // Cache successful responses only if method is GET
          if (cacheResponse) {
            this.setCachedResponse(endpointUrl);
          }
          return { response: jsonResponse, ok: true };
        }

        throw await this.handleError(response, i);
      } catch (error) {
        console.error(error); // Log the error in console

        switch (true) {
          case error instanceof TypeError:
          case error instanceof ReferenceError:
          case error instanceof RangeError:
          case error instanceof SyntaxError:
          case error instanceof URIError:
          case error instanceof EvalError:
          case error instanceof AggregateError:
            return { response: `${error.name}: ${error.message}`, ok: false };
          default:
            const errorResponse = { response: error.errorMessage, ok: false };
            const errorMsg = errorMessages[error.errorCode];

            if (i == this.retries - 1) {
              return errorResponse;
            } else if (errorMsg !== undefined && !errorMsg.retry) {
              return errorResponse;
            }

            // If the error is retryable, wait for a short period of time before retrying.
            await new Promise((resolve) =>
              setTimeout(resolve, this.retryTimeout * 1000)
            );
        }
      }
    }
  }
}

/**
 * Makes an API request.
 * @param {string} endpoint - The API endpoint to request.
 * @param {object} options - The options for the fetch request.
 * @param {boolean} redirect - Whether to redirect on error.
 * @returns {Promise<Object>} The response object or error response.
 */
export const request = (endpoint, options, redirect = false) => {
  const handler = new RequestHandler(endpoint, options, redirect);
  return handler.makeRequest();
};
