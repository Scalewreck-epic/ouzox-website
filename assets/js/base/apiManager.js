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

class RequestHandler {
  constructor(endpoint, options = {}, redirect = false) {
    this.endpoint = endpoint;
    this.options = options;
    this.redirect = redirect;
    this.retries = 3;
  }

  validateEndpoint() {
    if (typeof this.endpoint !== "string") {
      throw new Error(
        `Expected endpoint to be a string: ${typeof this.endpoint}`
      );
    }

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

  handleError(response) {
    const statusCode = response.status || 500;

    if (this.redirect) {
      window.location.assign(`404?code=${statusCode}`);
      return;
    } else {
      const errorMessage = errorMessages[statusCode];
      if (!errorMessage) {
        throw new Error(`Unknown error: ${statusCode}`);
      }
      throw new Error(`${statusCode}: ${errorMessage.header}`);
    }
  }

  async makeRequest() {
    try {
      const endpointUrl = this.validateEndpoint();
      this.validateOptions();
      const response = await fetch(endpointUrl, this.options);

      if (!response.ok) {
        throw this.handleError(response);
      }

      try {
        const jsonResponse = await response.json();
        return { response: jsonResponse, ok: true };
      } catch (jsonError) {
        if (response.status === 204) {
          return { response: null, ok: true };
        }
        throw new Error(`Failed to parse JSON response: ${jsonError.message}`);
      }
    } catch (error) {
      return { response: error, ok: false };
    }
  }
}

export const request = (endpoint, options, redirect = false) => {
  const handler = new RequestHandler(endpoint, options, redirect);
  return handler.makeRequest();
};
