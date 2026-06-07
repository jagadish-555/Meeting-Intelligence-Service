import prisma from '../config/db.js';
import logger from '../config/logger.js';
import { sendActionItemReminderEmail } from './resendEmailService.js';


const processOverdueReminders = async () => {
    const overdueItems = await prisma.actionItem.findMany({
        where: {
            status: { not: 'COMPLETED' },
            dueDate: { lt: new Date() }
        }
    });

    logger.info({ message: `Found ${overdueItems.length} overdue items` });

    for (const item of overdueItems) {
        const result = await sendActionItemReminderEmail(item);
        await prisma.reminderHistory.create({
            data: {
                actionItemId: item.id,
                message: `Reminder email: ${item.task} — Assigned To: ${item.assignee}`,
                deliveryStatus: result.success ? 'SUCCESS' : 'FAILED'
            }
        });
        
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    return overdueItems.length;
};

export default { processOverdueReminders };