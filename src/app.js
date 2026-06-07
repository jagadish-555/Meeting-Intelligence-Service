import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import errorHandler from "./middleware/errorHandler.js";
import traceId from "./middleware/traceId.js";
import requestLogger from "./middleware/requestLogger.js";
import { setupSwagger } from "./config/swagger.js";

const app = express();

app.use(traceId);
app.use(requestLogger);
app.use(cors());
app.use(express.json());

setupSwagger(app);

app.get("/health", (req, res) => res.json({ status: "UP" }));

app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({
    traceId: res.locals.traceId,
    success: false,
    error: { code: "NOT_FOUND", message: "Route not found" },
  });
});

app.use(errorHandler);

export default app;
