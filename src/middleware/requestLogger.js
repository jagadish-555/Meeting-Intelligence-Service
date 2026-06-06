import logger from "../config/logger.js";

export default (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    logger.info({
      traceId: res.locals.traceId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${Date.now() - start}ms`,
    });
  });

  next();
};
