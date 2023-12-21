function handleError(response, redirect) {
  if (redirect) {
    const statusCode = response.status ? response.status : 500;
    window.location.assign(`404?er=${response.status}`);
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
  const startTime = performance.now();
  try {
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
      handleError(response, redirect);
    }
  } catch (error) {
    handleError(error.response, redirect);
  }
}
