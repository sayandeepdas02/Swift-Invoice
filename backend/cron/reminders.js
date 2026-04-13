import cron from 'node-cron';
import Invoice from '../models/Invoice.js';
import { sendReminder } from '../services/reminderService.js';
import dayjs from 'dayjs';

// Executes every day at 09:00 AM sequentially
cron.schedule('0 9 * * *', async () => {
    console.log('[CRON] Starting Daily Reminder Scan...');

    try {
        const today = dayjs().startOf('day');
        const upcomingTarget = today.add(1, 'day');

        // Fetch valid unpaid active envelopes safely
        const targetInvoices = await Invoice.find({
            status: { $in: ['sent', 'viewed', 'overdue'] }
        });

        for (const invoice of targetInvoices) {
            if (!invoice.dueDate) continue;

            const invoiceDueDate = dayjs(invoice.dueDate).startOf('day');
            const diffDays = invoiceDueDate.diff(today, 'day');

            try {
                if (diffDays === 1) {
                    await sendReminder(invoice, 'upcoming');
                    console.log(`[CRON] Sent UPCOMING reminder for ${invoice.invoiceNumber}`);
                } else if (diffDays < 0) {
                    // Update status dynamically if it leaked logically
                    if (invoice.status !== 'overdue') {
                        invoice.status = 'overdue';
                        await invoice.save();
                    }

                    // Overdue reminders specifically trigger precisely every 3 days globally to avoid strict spam violations
                    // Alternatively wait strictly if lastReminder was within 3 days.
                    const lastSent = invoice.lastReminderSentAt ? dayjs(invoice.lastReminderSentAt).startOf('day') : null;
                    if (!lastSent || today.diff(lastSent, 'day') >= 3) {
                        await sendReminder(invoice, 'overdue');
                        console.log(`[CRON] Sent OVERDUE reminder for ${invoice.invoiceNumber}`);
                    }
                }
            } catch (err) {
                console.error(`[CRON] Failed to deliver ${invoice.invoiceNumber}`, err.message);
            }
        }
        console.log('[CRON] Daily Reminder Scan Complete.');
    } catch (error) {
        console.error('[CRON] Fatal Error encountered scanning cron footprints:', error);
    }
});
