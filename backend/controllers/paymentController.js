import Invoice from '../models/Invoice.js';
import * as paymentService from '../services/payments/paymentService.js';

export const createOrder = async (req, res) => {
    try {
        const { invoiceId } = req.body;
        if (!invoiceId) {
            return res.status(400).json({ success: false, message: 'invoiceId is required' });
        }

        const invoice = await Invoice.findById(invoiceId);
        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }

        // Validate not already paid
        if (invoice.paymentStatus === 'paid' || invoice.status === 'paid' || invoice.status === 'Paid') {
            return res.status(400).json({ success: false, message: 'Invoice is already paid' });
        }

        // Validate amount
        if (invoice.totalAmount <= 0) {
            return res.status(400).json({ success: false, message: 'Cannot process payment for an amount of 0' });
        }

        // Delegate to abstraction layer
        const orderInfo = await paymentService.createOrder(invoice);

        // Store order details
        invoice.paymentOrderId = orderInfo.orderId;
        invoice.paymentProvider = orderInfo.provider;
        await invoice.save();

        res.json({
            success: true,
            data: {
                orderId: orderInfo.orderId,
                keyId: orderInfo.keyId,
                provider: orderInfo.provider,
                amount: invoice.totalAmount,
                currency: invoice.currency
            }
        });
    } catch (error) {
        console.error('Create Order Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const simulatePayment = async (req, res) => {
    try {
        // Only allow if provider is dummy
        const provider = process.env.PAYMENT_PROVIDER || 'dummy';
        if (provider.toLowerCase() !== 'dummy') {
            return res.status(403).json({ success: false, message: 'Simulation is only available when PAYMENT_PROVIDER=dummy' });
        }

        const { invoiceId } = req.body;
        if (!invoiceId) {
            return res.status(400).json({ success: false, message: 'invoiceId is required' });
        }

        const invoice = await Invoice.findById(invoiceId);
        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }

        if (invoice.paymentStatus === 'paid') {
            return res.status(400).json({ success: false, message: 'Invoice is already paid' });
        }

        invoice.paymentStatus = 'paid';
        invoice.status = 'paid';
        invoice.paidAt = new Date();
        invoice.paymentId = `dummy_txn_${Math.random().toString(36).substring(2, 10)}`;
        
        await invoice.save();

        res.json({
            success: true,
            message: 'Simulated payment completed successfully',
            data: invoice
        });

    } catch (error) {
        console.error('Simulate Payment Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
