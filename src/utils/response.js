const success = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    traceId: res.locals.traceId,
    success: true,
    data,
  });
};

const error = (res, code, message, statusCode = 400) => {
  return res.status(statusCode).json({
    traceId: res.locals.traceId,
    success: false,
    error: { code, message },
  });
};

export { success, error };
