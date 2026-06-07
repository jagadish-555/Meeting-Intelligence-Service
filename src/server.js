import "dotenv/config";
import prisma from "./config/db.js";
import app from "./app.js";
import logger from "./config/logger.js";
import { startReminderJob } from "./jobs/reminderJob.js";

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await prisma.$connect();
    logger.info("Connected to the database successfully.");

    startReminderJob();
    logger.info("Background reminder job scheduled.");

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    logger.error("Error starting the server:", err);
    process.exit(1);
  }
};

start();
