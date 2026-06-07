import cron from "node-cron";
import reminderService from "../services/reminderService.js";
import logger from "../config/logger.js";

export const startReminderJob = () => {
    cron.schedule('0 8 * * *', async () => {
        logger.info({ message: 'Reminder job triggered at 8:00 AM' });
        try {
            const count = await reminderService.processOverdueReminders();
            logger.info({ message: 'Reminder job done', processed: count });
        } catch (err) {
            logger.error({ message: 'Reminder job error', error: err.message });
        }
    });

    logger.info({ message: 'Reminder job scheduled (daily at 8:00 AM)' });
};