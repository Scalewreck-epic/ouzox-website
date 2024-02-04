const timeout = 3000;

const handle_error = (xhr, redirect) => {
  if (!(xhr instanceof XMLHttpRequest)) {
    throw new Error(`Expected an XMLHttpRequest object: ${xhr}`);
  }

  const statusCode = xhr.status || 500;

  if (redirect && !window.location.pathname.includes("/404")) {
    window.location.assign(`404?code=${statusCode}`);
  } else {
    return null;
  }
};

const validate_endpoint = (endpoint) => {
  if (typeof endpoint !== "string") {
    throw new Error(`Expected endpoint to be a string: ${typeof endpoint}`);
  }

  try {
    const url = new URL(endpoint);
    if (url.protocol == "https:") {
      return url;
    } else {
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

const log_request = (duration, name, xhr) => {
  var log = {
    event: name,
    status: xhr.status,
    duration: `${duration}ms`,
  }

  console.info(log);
};

export const request = (
  endpoint,
  options,
  redirect = false,
  name = "unknown request",
) => {
  validate_options(options);
  const endpoint_url = validate_endpoint(endpoint);

  return new Promise((resolve, reject) => {
    const start = Date.now();
    const xhr = new XMLHttpRequest();

    xhr.timeout = timeout;

    Object.entries(options.headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    xhr.open(options.method, endpoint_url);
    xhr.onload = () => {
      const duration =  Date.now() - start;

      log_request(duration, name, xhr);

      if (xhr.status < 200 || xhr.status >= 300) {
        return reject(handle_error(xhr, redirect));
      }

      resolve(JSON.parse(xhr.responseText));
    };

    xhr.onerror = () => reject(handle_error(xhr, redirect));

    options.body ? xhr.send(options.body) : xhr.send();
  });
};
