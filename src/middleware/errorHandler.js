const logger = require("../config/logger");

module.exports = (err, req, res, next) => {
  const traceId = res.locals.traceId;

  logger.error({
    traceId,
    method: req.method,
    path: req.path,
    error: err.message,
    stack: err.stack,
  });

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      traceId,
      success: false,
      error: { code: err.code, message: err.message },
    });
  }

  return res.status(500).json({
    traceId,
    success: false,
    error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
  });
};
