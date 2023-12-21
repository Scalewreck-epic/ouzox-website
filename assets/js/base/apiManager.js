export async function request(endpoint, options, redirect) {
  try {
    const response = await fetch(endpoint, options);

    if (response.ok) {
      const result = await response.text();
      const result_parse = JSON.parse(result);

      return {
        Result: result_parse,
        Success: true,
      };
    } else {
      if (redirect) {
        window.location.assign(
          `404?er=${response.status ? response.status : 500}`
        );
      } else {
        return {
          Result: response,
          Success: false,
        };
      }
    }
  } catch (error) {
    if (redirect) {
      window.location.assign(
        `404?er=${error.response.status ? error.response.status : 500}`
      );
    } else {
      return {
        Result: error.message,
        Success: false,
      };
    }
  }
}
