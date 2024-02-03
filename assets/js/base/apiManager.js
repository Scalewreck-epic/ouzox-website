const timeout = 1000;

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

const calculate_duration = (start, end, name) => {
  const duration = end - start;
  console.log(`${name} duration: ${duration}ms`);
}

export const request = (
  endpoint,
  options,
  redirect = false,
  name = "unknown request"
) => {
  validate_options(options);
  const endpoint_url = validate_endpoint(endpoint);

  return new Promise((resolve, reject) => {
    const start = Date.now();
    const xhr = new XMLHttpRequest();

    xhr.open(options.method, endpoint_url);
    xhr.timeout = timeout;

    Object.entries(options.headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        return reject(handle_error(xhr, redirect));
      }

      calculate_duration(start, Date.now(), name);

      resolve(JSON.parse(xhr.responseText));
    };

    xhr.onerror = () => reject(handle_error(xhr, redirect));

    if (options.body) {
      xhr.send(options.body);
    } else {
      xhr.send();
    }
  });
};
