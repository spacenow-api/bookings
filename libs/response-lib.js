const buildResponse = (statusCode, body) => {
  return {
    statusCode: statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: body && JSON.stringify(body)
  };
};

module.exports = {
  success: (body) => buildResponse(200, body),
  failure: (body) => buildResponse(500, body)
};
