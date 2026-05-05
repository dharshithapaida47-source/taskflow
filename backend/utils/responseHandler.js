// Error response handler
const errorResponse = (res, statusCode, message, details = null) => {
  const response = {
    success: false,
    message
  };
  if (details) {
    response.details = details;
  }
  return res.status(statusCode).json(response);
};

// Success response handler
const successResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message
  };
  if (data) {
    response.data = data;
  }
  return res.status(statusCode).json(response);
};

module.exports = {
  errorResponse,
  successResponse
};
