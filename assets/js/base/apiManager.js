const errorMessages = {
  400: { header: "Bad Request"},
  401: { header: "Unauthorized"},
  402: { header: "Payment Required"},
  403: { header: "Access Denied"},
  404: { header: "Not Found"},
  405: { header: "Method Not Allowed"},
  409: { header: "Conflict"},
  429: { header: "Too Many Requests"},
  500: { header: "Internal Server Error"},
  503: { header: "Service Unavailable"},
};

class RequestHandler {
  /**
   * @param {string} endpoint - The endpoint URL
   * @param {object} options - The options object for the request
   * @param {boolean} redirect - Whether to redirect on error (default: false)
   */
  constructor(endpoint, options, redirect = false) {
    this.endpoint = endpoint;
    this.options = options;
    this.redirect = redirect;
  }

  /**
   * @throws {Error} If the endpoint is not a string or not an HTTPS URL
   * @returns {URL} The validated endpoint URL
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
   * @throws {Error} If the options object is not an object or contains unexpected properties
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
   * Handle errors in the response
   * @param {Response} response - The response object
   * @throws {Error} If the response is not OK
   * @returns {null} If redirect is true, otherwise throws an error
   */
  handleError(response) {
    const statusCode = response.status || 500;

    if (this.redirect) {
      window.location.assign(`404?code=${statusCode}`);
      return null;
    } else {
      throw new Error(`${statusCode} ${errorMessages[statusCode].header}`);
    }
  }

  /**
   * Make the fetch request
   * @throws {Error} If the request fails
   * @returns {Promise<object>} The JSON response
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

      return {response: jsonResponse, ok: true};
    } catch (error) {
      return {response: error, ok: false};
    }
  }
}

export const request = (endpoint, options, redirect = false) => {
  const handler = new RequestHandler(endpoint, options, redirect);
  return handler.makeRequest();
};