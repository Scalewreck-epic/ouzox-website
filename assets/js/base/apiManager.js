const handle_error = async (responseOrError, redirect) => {
  if (!(responseOrError instanceof Response)) {
    throw new Error(`Expected a Response object: ${responseOrError}`);
  }

  const statusCode = responseOrError.status || 500;

  if (redirect && !window.location.pathname.includes("/404")) {
    window.location.assign(`404?code=${statusCode}`);
  } else {
    const result = await responseOrError.json();

    return {
      Result: result,
      Success: false,
    };
  }
};

const calculate_duration = (startTime, endTime, name) => {
  const duration = endTime - startTime;
  console.info(`${name} request duration: ${duration}ms`);
};

const validate_endpoint = (endpoint) => {
  if (typeof endpoint !== "string") {
    throw new Error(`Expected endpoint to be a string: ${typeof endpoint}`);
  }

  try {
    const url = new URL(endpoint);
    if (url.protocol != "https:") {
      throw new Error("Invalid endpoint URL: HTTPS required");
    }
  } catch (error) {
    throw new Error(`Invalid endpoint URL: ${endpoint}`);
  }
};

const validate_options = (options) => {
  if (typeof options !== "object" || options == null) {
    throw new Error(`Expected options to be an object: ${typeof options}`);
  }

  const unexpectedProperties = Object.keys(options).filter(
    (key) => !["method", "headers", "body"].includes(key)
  );

  if (unexpectedProperties.length > 0) {
    throw new Error(
      `Unexpected properties in options object: ${unexpectedProperties}`
    );
  }
};

export const request = async (
  endpoint,
  options,
  redirect = false,
  name = "request"
) => {
  validate_endpoint(endpoint);
  validate_options(options);

  const startTime = Date.now();

  try {
    const endpoint_url = new URL(endpoint);
    const response = await fetch(endpoint_url, options);

    calculate_duration(startTime, Date.now(), name);

    if (!response.ok) {
      return handle_error(response, redirect);
    }

    const contentType = response.headers.get("Content-Type");

    if (!contentType || !contentType.startsWith("application/json")) {
      throw new Error("Invalid Content-Type");
    }

    const result = await response.json();

    return {
      Result: result,
      Success: true,
    };
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code that falls out of the range of 2xx
      return handle_error(error.response, redirect);
    }

    return handle_error(error, redirect);
  }
};
