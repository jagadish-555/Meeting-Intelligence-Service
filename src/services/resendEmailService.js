import { Resend } from 'resend';
import logger from '../config/logger.js';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendActionItemReminderEmail = async (item) => {
    try {
        const data = await resend.emails.send({
            from: 'Meeting Intelligence <onboarding@resend.dev>',
            to: [item.assignee],
            subject: `Overdue Action Item: ${item.task}`,
            html: `
                <h2>Overdue Action Item Reminder</h2>
                <p>You have an overdue action item:</p>
                <blockquote><strong>${item.task}</strong></blockquote>
                <p>Status: ${item.status}</p>
                <p>Due Date: ${item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'N/A'}</p>
            `,
        });

        if (data.error) {
            logger.error({ message: 'Error sending reminder email via Resend', error: data.error.message });
            return { success: false, error: data.error.message };
        }
        
        return { success: true, data };
    } catch (error) {
        logger.error({ message: 'Exception sending reminder email', error: error.message });
        return { success: false, error: error.message };
    }
};
