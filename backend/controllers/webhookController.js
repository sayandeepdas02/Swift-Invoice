import Invoice from '../models/Invoice.js';
import * as razorpayService from '../services/payments/razorpayService.js';
import { logger } from '../services/logger.js';
import { logActivity } from '../services/activityService.js';

export const handleRazorpayWebhook = async (req, res) => {
    try {
        const signature = req.headers['x-razorpay-signature'];
        
        // Ensure webhooks are verified using the raw body buffer
        const isValid = razorpayService.verifySignature(req.body, signature);

        if (!isValid) {
            logger.warn('invalid_webhook_signature', { ip: req.ip });
            return res.status(400).json({ success: false, message: 'Invalid signature' });
        }

        const payload = JSON.parse(req.body.toString('utf8'));
        const event = payload.event;
        const payloadData = payload.payload;

        if (event === 'payment.captured' || event === 'order.paid') {
            const paymentEntity = payloadData.payment?.entity || {};
            const orderId = paymentEntity.order_id || payloadData.order?.entity?.id;
            const paymentId = paymentEntity.id;
            // Provide a fallback eventId if Razorpay headers miss it
            const eventId = req.headers['x-razorpay-event-id'] || paymentId || `evt_${Date.now()}`;

            if (!orderId) {
                logger.warn('webhook_missing_orderId', { payload });
                return res.json({ received: true });
            }

            // ATOMIC UPDATE: Prevents duplicate webhooks triggering parallel saves.
            // Requirement matching: not already processed, not terminal status.
            const invoice = await Invoice.findOneAndUpdate(
                { 
                    paymentOrderId: orderId,
                    processedEvents: { $ne: eventId }, 
                    paymentStatus: { $ne: 'paid' },
                    status: { $nin: ['paid', 'disputed', 'cancelled'] } // respect state machine overrides locally
                },
                {
                    $push: { processedEvents: eventId },
                    $set: {
                        paymentStatus: 'paid',
                        status: 'paid',
                        paymentId: paymentId,
                        paidAt: new Date()
                    }
                },
                { new: true }
            );

            if (!invoice) {
                // Determine if it was just an idempotency skip or truly not found
                const existing = await Invoice.findOne({ paymentOrderId: orderId });
                if (existing) {
                     logger.info('webhook_idempotency_skip', { orderId, eventId, currentStatus: existing.status });
                } else {
                     logger.warn('webhook_invoice_not_found', { orderId });
                }
                return res.json({ received: true, message: 'Skipped or not found' });
            }

            logActivity(invoice.userId, invoice._id, 'PAID', { paymentId, source: 'webhook' });
            logger.info('invoice_paid_webhook', { invoiceId: invoice._id, orderId, paymentId });
        }

        res.json({ received: true });
    } catch (error) {
        logger.error('webhook_processing_failed', { error });
        res.status(500).json({ success: false, message: 'Webhook processing failed' });
    }
};
