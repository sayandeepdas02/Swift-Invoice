import Invoice from '../models/Invoice.js';
import * as invoiceService from '../services/invoiceService.js';
import { logger } from '../services/logger.js';
import { logActivity } from '../services/activityService.js';
import { sendReminder } from '../services/reminderService.js';

export const processBatch = async (req, res) => {
    try {
        const { action, invoiceIds } = req.body;
        const userId = req.user._id;

        if (!action || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid payload mapping' });
        }

        // Hard-cap batch limits preserving Node memory limits dynamically
        if (invoiceIds.length > 100) {
            return res.status(400).json({ success: false, message: 'Batch size natively exceeds 100 maximum limits' });
        }

        let processed = [];
        let failed = [];

        // Verify ownership and pull objects
        const invoices = await Invoice.find({
            _id: { $in: invoiceIds },
            userId: userId
        });

        // Map safe objects locally extracting direct access boundaries
        const invoiceMap = new Map();
        invoices.forEach(inv => invoiceMap.set(inv._id.toString(), inv));

        // Use standard chunking array distribution avoiding Node CPU synchronous stalls natively
        const chunkSize = 20;
        for (let i = 0; i < invoiceIds.length; i += chunkSize) {
            const chunk = invoiceIds.slice(i, i + chunkSize);
            const chunkPromises = chunk.map(async (id) => {
                try {
                    const stringId = id.toString();
                    const invoiceRaw = invoiceMap.get(stringId);

                    if (!invoiceRaw) {
                        throw new Error('Invoice not found or explicitly unauthorized');
                    }

                    switch (action) {
                        case 'delete':
                            await invoiceService.deleteInvoice(stringId, userId);
                            break;
                            
                        case 'mark_paid':
                            // Will throw Error natively mapping strict internal service state constraints
                            await invoiceService.updateInvoiceStatus(stringId, 'paid', userId);
                            logActivity(userId, stringId, 'PAID', { source: 'batch_operation' });
                            break;

                        case 'send_reminder':
                            const invoiceProxy = invoiceService.withOverdue(invoiceRaw);
                            if (invoiceProxy.status === 'paid' || invoiceProxy.status === 'cancelled') {
                                throw new Error(`Cannot remind terminal strict status '${invoiceProxy.status}'`);
                            }
                            const type = invoiceProxy.isOverdue ? 'overdue' : 'upcoming';
                            await sendReminder(invoiceRaw, type);
                            logActivity(userId, stringId, 'REMINDER_SENT', { trigger: 'batch_manual' });
                            break;

                        default:
                            throw new Error(`Unsupported explicit action dynamically: ${action}`);
                    }
                    processed.push(id);
                } catch (err) {
                    failed.push({ id, reason: err.message });
                }
            });

            // Native concurrent execution respecting chunk boundaries cleanly 
            await Promise.allSettled(chunkPromises);
        }

        logger.info('batch_operation_complete', { userId, action, processed: processed.length, failed: failed.length });
        
        res.json({
            success: true,
            processed,
            failed,
            message: `Processed ${processed.length} natively. ${failed.length} failed structurally.`
        });
        
    } catch (error) {
        logger.error('batch_engine_crashed', { error: error.message });
        res.status(500).json({ success: false, message: 'Batch processor critically faulted sequentially' });
    }
};
