import { v4 as uuidv4 } from "uuid";

export default (req, res, next) => {
  const traceId = req.headers["x-trace-id"] || uuidv4();
  res.locals.traceId = traceId;
  res.setHeader("x-trace-id", traceId);
  next();
};
