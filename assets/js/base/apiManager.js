const errorMessages = {
  400: { header: "Bad Request", description: "The request was invalid or cannot be processed." },
  401: { header: "Unauthorized", description: "Authentication is required to access the requested resource." },
  402: { header: "Payment Required", description: "The request was valid, but the payment was not successful." },
  403: { header: "Access Denied", description: "The server understood the request, but is refusing to fulfill it." },
  404: { header: "Not Found", description: "The requested resource could not be found." },
  405: { header: "Method Not Allowed", description: "The request method is not supported by the requested resource." },
  409: { header: "Conflict", description: "The request could not be completed due to a conflict with the current state of the resource." },
  429: { header: "Too Many Requests", description: "The user has sent too many requests in a given amount of time." },
  500: { header: "Internal Server Error", description: "An unexpected condition was encountered and no more specific message is suitable." },
  503: { header: "Service Unavailable", description: "The server is currently unavailable (because it is overloaded or down for maintenance)." },
};

class RequestHandler {
  /**
   * @param {string} endpoint
   * @param {object} options
   * @param {boolean} redirect
   */
  constructor(endpoint, options, redirect = false) {
    this.endpoint = endpoint;
    this.options = options;
    this.redirect = redirect;
  }

  /**
   * @throws {Error}
   * @returns {URL}
   */
  validateEndpoint() {
    if (typeof this.endpoint !== "string") {
      throw new Error(`Expected endpoint to be a string: ${typeof this.endpoint}`);
    }

    try {
      const url = new URL(this.endpoint);
      if (url.protocol === "https:") {
        return url;
      } else {
        throw new Error("Invalid endpoint URL: HTTPS required");
      }
    } catch (error) {
      throw new Error(`Invalid endpoint URL: ${this.endpoint}`, error);
    }
  }

  /**
   * @throws {Error}
   */
  validateOptions() {
    if (typeof this.options !== "object" || this.options === null) {
      throw new Error(`Expected options to be an object: ${typeof this.options}`);
    }

    const unexpectedProperties = Object.keys(this.options).filter(
      (key) => !["method", "headers", "body"].includes(key)
    );

    if (unexpectedProperties.length > 0) {
      throw new Error("Unexpected properties in options object:", unexpectedProperties);
    }
  }

  /**
   * @param {Response} response
   * @throws {Error}
   * @returns {null}
   */
  handleError(response) {
    const statusCode = response.status || 500;

    if (this.redirect) {
      window.location.assign(`404?code=${statusCode}`);
      return null;
    } else {
      const errorMessage = errorMessages[statusCode];
      throw new Error(`${statusCode} ${errorMessage.header}: ${errorMessage.description}`);
    }
  }

  /**
   * @throws {Error}
   * @returns {Promise<object>}
   */
  async makeRequest() {
    try {
      this.validateOptions();
      const endpointUrl = this.validateEndpoint();
      const response = await fetch(endpointUrl, this.options);

      if (!response.ok) {
        throw this.handleError(response);
      }

      const jsonResponse = await response.json();

      return { response: jsonResponse, ok: true };
    } catch (error) {
      return { response: error, ok: false };
    }
  }
}

export const request = (endpoint, options, redirect = false) => {
  const handler = new RequestHandler(endpoint, options, redirect);
  return handler.makeRequest();
};