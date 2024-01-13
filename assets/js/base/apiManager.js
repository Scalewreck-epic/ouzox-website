const handle_error = (responseOrError, redirect) => {
  let statusCode;

  if (responseOrError instanceof Response) {
    statusCode = responseOrError.status ? responseOrError.status : 500;
  } else {
    statusCode = 500;
  }

  if (redirect && !window.location.pathname.includes("404")) {
    const encodedStatusCode = encodeURIComponent(statusCode);
    window.location.assign(`404?code=${encodedStatusCode}`);
  } else {
    return {
      Result: responseOrError,
      Success: false,
    };
  }
};

const calculate_duration = (startTime, endTime, name) => {
  const duration = endTime - startTime;
  console.info(`${name} request duration: ${duration}ms`);
};

export const request = async (endpoint, options, redirect, name) => {
  if (!["GET", "POST", "DELETE"].includes(options.method)) {
    throw new Error(`Invalid request method: ${options.method}`);
  }

  const startTime = performance.now();

  try {
    const response = await fetch(endpoint, options);

    if (!response.ok) {
      return handle_error(response, redirect);
    }

    const contentType = response.headers.get("Content-Type");

    if (!contentType || !contentType.startsWith("application/json")) {
      throw new Error("Invalid Content-Type");
    }

    calculate_duration(startTime, performance.now(), name);

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
