import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import errorHandler from "./middleware/errorHandler.js";
import authMiddleware from "./middleware/auth.js";
import traceId from "./middleware/traceId.js";
import requestLogger from "./middleware/requestLogger.js";
import { setupSwagger } from "./config/swagger.js";

const app = express();

app.use(traceId);
app.use(requestLogger);
app.use(cors());
app.use(express.json());

setupSwagger(app);

app.get("/health", (req, res) => {
  res.json({ status: "UP" });
});

app.use("/api/auth", authRoutes);
app.get("/api/meetings", authMiddleware, (req, res) => {
  res.json({ meetings: [] });
});

app.use(errorHandler);

export default app;
