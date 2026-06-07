import cron from "node-cron";
import reminderService from "../services/reminderService.js";
import logger from "../config/logger.js";

export const startReminderJob = () => {
    cron.schedule('45 12 * * *', async () => {
        logger.info({ message: 'Reminder job triggered at 12:45 PM' });
        try {
            const count = await reminderService.processOverdueReminders();
            logger.info({ message: 'Reminder job done', processed: count });
        } catch (err) {
            logger.error({ message: 'Reminder job error', error: err.message });
        }
    });

    logger.info({ message: 'Reminder job scheduled (daily at 12:45 PM)' });
};