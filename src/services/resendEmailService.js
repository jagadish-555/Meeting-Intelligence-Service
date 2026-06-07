import { Resend } from 'resend';
import logger from '../config/logger.js';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendActionItemReminderEmail = async (item) => {
    try {
        const data = await resend.emails.send({
            from: 'Meeting Intelligence <notifications@reminders.jagadish-patil.me>',
            to: [item.assignee],
            subject: `Overdue Action Item: ${item.task}`,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <div style="background-color: #ef4444; padding: 24px; text-align: center;">
                        <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Action Required: Overdue Task</h2>
                    </div>
                    <div style="padding: 32px;">
                        <p style="color: #374151; font-size: 16px; margin-top: 0;">Hello,</p>
                        <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">This is an automated reminder from the <strong>Meeting Intelligence Service</strong>. You currently have an action item that is past its due date.</p>
                        
                        <div style="background-color: #f9fafb; border-left: 4px solid #ef4444; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                            <p style="color: #111827; font-size: 18px; font-weight: 500; margin: 0;">"${item.task}"</p>
                        </div>
                        
                        <table style="width: 100%; border-collapse: collapse; margin-top: 24px;">
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; width: 100px;">Status:</td>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                    <span style="background-color: #fee2e2; color: #991b1b; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">${item.status.replace('_', ' ')}</span>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">Due Date:</td>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 500;">
                                    ${item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                                </td>
                            </tr>
                        </table>
                        
                        <p style="color: #6b7280; font-size: 14px; margin-top: 32px; margin-bottom: 0;">Please review and update the status of this task as soon as possible.</p>
                    </div>
                </div>
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
