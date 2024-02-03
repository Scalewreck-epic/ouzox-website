const handle_error = (xhr, redirect) => {
  if (!(xhr instanceof XMLHttpRequest)) {
    throw new Error(`Expected an XMLHttpRequest object: ${xhr}`);
  }

  const statusCode = xhr.status || 500;

  if (redirect && !window.location.pathname.includes("/404")) {
    window.location.assign(`404?code=${statusCode}`);
  } else {
    const result = {
      error: {
        message: xhr.responseText,
        statusCode,
      },
    };

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

export const request = (
  endpoint,
  options,
  redirect = false,
  name = "request"
) => {
  validate_endpoint(endpoint);
  validate_options(options);

  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    const endpoint_url = new URL(endpoint);
    xhr.open(options.method || "GET", endpoint_url);

    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
    }

    xhr.onload = () => {
      calculate_duration(startTime, Date.now(), name);

      if (xhr.status < 200 || xhr.status >= 300) {
        return reject(handle_error(xhr, redirect));
      }

      resolve({
        Result: JSON.parse(xhr.responseText),
        Success: true,
      });
    };

    xhr.onerror = () => reject(handle_error(xhr, redirect));

    if (options.body) {
      xhr.send(options.body);
    } else {
      xhr.send();
    }
  });
};
