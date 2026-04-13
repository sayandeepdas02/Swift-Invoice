import Invoice from '../models/Invoice.js';
import User from '../models/User.js';
import { sendEmail } from './emailService.js';
import dayjs from 'dayjs';

export const sendReminder = async (invoice, type = 'upcoming') => {
    if (!invoice || !invoice.client || !invoice.client.email) {
        throw new Error('Invalid invoice or missing client email');
    }

    const publicUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/invoice/${invoice.publicId}`;
    const user = await User.findById(invoice.userId);
    const businessName = user?.businessName || invoice.sender?.companyName || 'Your Provider';

    const subject = type === 'upcoming' 
        ? `Reminder: Invoice ${invoice.invoiceNumber} from ${businessName} is due tomorrow`
        : `URGENT: Invoice ${invoice.invoiceNumber} from ${businessName} is overdue`;

    const html = `
        <div style="font-family: sans-serif; padding: 40px 20px; color: #1e293b; max-width: 600px;">
            <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 24px;">${type === 'upcoming' ? 'Upcoming Payment Reminder' : 'Overdue Payment Reminder'}</h2>
            <p style="margin-bottom: 16px;">Hi ${invoice.client.name},</p>
            <p style="margin-bottom: 16px; line-height: 1.6;">This is an automated reminder that invoice <strong style="color: #0f172a;">${invoice.invoiceNumber}</strong> for <strong style="color: #0f172a;">$${invoice.totalAmount}</strong> is ${type === 'upcoming' ? 'due tomorrow' : '<span style="color: #ef4444; font-weight: bold;">currently overdue</span>'}.</p>
            <p style="margin-bottom: 24px;"><strong>Due Date:</strong> ${dayjs(invoice.dueDate).format('MMMM D, YYYY')}</p>
            <div style="margin: 32px 0;">
                <a href="${publicUrl}" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px;">
                    View & Pay Invoice
                </a>
            </div>
            <p style="font-size: 14px; color: #64748b; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px;">If you've already made this payment, please disregard this email.</p>
        </div>
    `;

    await sendEmail({
        to: invoice.client.email,
        subject,
        html
    });

    invoice.lastReminderSentAt = new Date();
    invoice.reminderCount = (invoice.reminderCount || 0) + 1;
    await invoice.save();

    return invoice;
};
