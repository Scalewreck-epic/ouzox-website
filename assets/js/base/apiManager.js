const handle_error = (response, redirect) => {
  const statusCode = response.status || 500;

  if (redirect) {
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

const log_request = (duration, name, response) => {
  var log = {
    event: name,
    status: response.status,
    duration: `${duration}ms`,
  };

  console.info(`${name} event:`, log);
};

// Fetch Request as a main preference.
const fetch_request = (endpoint_url, options, redirect, name) => {
  return new Promise(async (resolve, reject) => {
    const start = Date.now();

    try {
      const response = await fetch(endpoint_url, options);
      const duration = Date.now() - start;

      log_request(duration, name, response);

      if (!response.ok) {
        return reject(handle_error(response, redirect));
      }

      resolve(await response.json());
    } catch (error) {
      console.error("Fetch error:", error);
      reject(handle_error(error.response, redirect));
    }
  });
};

// XMLHttpRequest is here if you need it :).
const xhrequest = (endpoint_url, options, redirect, name) => {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const xhr = new XMLHttpRequest();
    xhr.open(options.method || "GET", endpoint_url, true);

    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
    }

    xhr.onload = () => {
      const duration = Date.now() - start;
      log_request(duration, name, xhr);

      if (xhr.status < 200 || xhr.status >= 400) {
        return reject(handle_error(xhr, redirect));
      }

      resolve(JSON.parse(xhr.responseText));
    };

    xhr.onerror = () => {
      console.error("XHR error:");
      reject(handle_error(xhr, redirect));
    };

    options.body ? xhr.send(options.body) : xhr.send();
  });
};

export const request = (
  endpoint,
  options,
  redirect = false,
  name = "unknown request"
) => {
  validate_options(options);
  const endpoint_url = validate_endpoint(endpoint);

  return fetch_request(
    endpoint_url,
    options,
    redirect && window.location.pathname.includes("/404"),
    name
  );
};
