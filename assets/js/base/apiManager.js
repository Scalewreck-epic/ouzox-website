const handleError = (response, redirect) => {
  const statusCode = response.status || 500;

  if (redirect) {
    window.location.assign(`404?code=${statusCode}`);
  } else {
    return null;
  }
};

const validateEndpoint = (endpoint) => {
  if (typeof endpoint !== "string") {
    throw new Error(`Expected endpoint to be a string: ${typeof endpoint}`);
  }

  try {
    const url = new URL(endpoint);
    if (url.protocol === "https:") {
      return url;
    } else {
      throw new Error("Invalid endpoint URL: HTTPS required");
    }
  } catch (error) {
    throw new Error(`Invalid endpoint URL: ${endpoint}`, error);
  }
};

const validateOptions = (options) => {
  if (typeof options !== "object" || options === null) {
    throw new Error(`Expected options to be an object: ${typeof options}`);
  }

  const unexpectedProperties = Object.keys(options).filter(
    (key) => !["method", "headers", "body"].includes(key)
  );

  if (unexpectedProperties.length > 0) {
    throw new Error("Unexpected properties in options object:", unexpectedProperties);
  }
};

const fetchRequest = async (endpointUrl, options, redirect) => {
  try {
    const response = await fetch(endpointUrl, options);

    if (!response.ok) {
      throw handleError(response, redirect);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Fetch ${error.name || typeof error}:`, error);
  }
};

export const request = (
  endpoint,
  options,
  redirect = false,
) => {
  validateOptions(options);
  const endpointUrl = validateEndpoint(endpoint);
  return fetchRequest(endpointUrl, options, redirect);
};
