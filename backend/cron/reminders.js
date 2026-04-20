import cron from 'node-cron';
import Invoice from '../models/Invoice.js';
import { sendReminder } from '../services/reminderService.js';
import { logger } from '../services/logger.js';
import { logActivity } from '../services/activityService.js';
import { withRetries } from '../utils/retryHelper.js';
import { asyncLocalStorage } from '../middleware/requestSequence.js';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

// Executes every day at 09:00 AM sequentially
cron.schedule('0 9 * * *', async () => {
    const cronId = `cron_${uuidv4()}`;
    await new Promise(resolve => {
        asyncLocalStorage.run(new Map([['requestId', cronId]]), async () => {
            logger.info('cron_daily_reminder_start');

            try {
                const today = dayjs().startOf('day');

                // Find candidate invoices
                const targetInvoices = await Invoice.find({
                    status: { $in: ['sent', 'viewed', 'overdue'] }
                });

                let processed = 0;
                let failed = 0;

                for (const invoice of targetInvoices) {
                    if (!invoice.dueDate) continue;

                    const invoiceDueDate = dayjs(invoice.dueDate).startOf('day');
                    const diffDays = invoiceDueDate.diff(today, 'day');

                    try {
                        let reminderType = null;
                        if (diffDays === 1) reminderType = 'upcoming';
                        else if (diffDays <= 0) reminderType = 'overdue';

                        if (!reminderType) continue; // Not within action range

                        // Evaluate logic window natively
                        let shouldRun = false;
                        const last = invoice.lastReminder;
                        
                        if (!last || !last.sentAt) {
                            shouldRun = true;
                        } else if (last.type !== reminderType) {
                            shouldRun = true;
                        } else if (reminderType === 'overdue' && today.diff(dayjs(last.sentAt).startOf('day'), 'day') >= 3) {
                            shouldRun = true;
                        }

                        if (!shouldRun) continue;

                        // ATOMIC ATTEMPT TO CLAIM THE INVOICE REMINDER
                        // By injecting condition query based on last status
                        const condition = {
                            _id: invoice._id,
                            $or: [
                                { lastReminder: null },
                                { 'lastReminder.type': { $ne: reminderType } }
                            ]
                        };
                        
                        // If overdue, allow updates if 3 days have passed
                        if (reminderType === 'overdue') {
                            condition.$or.push({ 
                                'lastReminder.type': 'overdue', 
                                'lastReminder.sentAt': { $lt: today.subtract(2, 'day').toDate() } 
                            });
                        }

                        const lockedInvoice = await Invoice.findOneAndUpdate(
                            condition,
                            {
                                $set: {
                                    lastReminder: { type: reminderType, sentAt: new Date() },
                                    status: reminderType === 'overdue' ? 'overdue' : invoice.status // ensure status becomes overdue seamlessly
                                }
                            },
                            { new: true }
                        );

                        if (!lockedInvoice) {
                            // Skipped because another worker claimed it or state changed
                            continue;
                        }

                        // Send via exponential backoff utility
                        await withRetries(async () => {
                            await sendReminder(lockedInvoice, reminderType);
                        });

                        logActivity(lockedInvoice.userId, lockedInvoice._id, 'REMINDER_SENT', { reminderType, cron: true });
                        processed++;
                        logger.info('cron_reminder_delivered', { invoiceId: lockedInvoice._id, reminderType });
                    } catch (err) {
                        failed++;
                        logger.error('cron_reminder_failed_to_deliver', { invoiceId: invoice._id, error: err });
                    }
                }
                
                logger.info('cron_daily_reminder_complete', { processed, failed, evaluated: targetInvoices.length });
            } catch (error) {
                logger.error('cron_fatal_error', { error });
            }
            resolve();
        });
    });
});
