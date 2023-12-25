function handleError(response, redirect) {
  if (redirect) {
    if (!window.location.pathname.includes("404")) {
      const statusCode = response.status ? response.status : 500;
      window.location.assign(`404?er=${statusCode}`);
    }
  } else {
    return {
      Result: response,
      Success: false,
    }
  }
}

function calculateDuration(startTime, endTime, name) {
  const duration = endTime - startTime;
  console.info(`${name} request duration: ${duration}ms`);
  return duration
}

export async function request(endpoint, options, redirect, name) {
  try {
    const startTime = performance.now();
    const response = await fetch(endpoint, options);

    if (response.ok) {
      const result = await response.text();
      const result_parse = JSON.parse(result);
      calculateDuration(startTime, performance.now(), name);

      return {
        Result: result_parse,
        Success: true,
      };
    } else {
      return handleError(response, redirect);
    }
  } catch (error) {
    return handleError(error, redirect);
  }
}
