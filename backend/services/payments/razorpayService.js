import Razorpay from 'razorpay';
import crypto from 'crypto';

export const createOrder = async (invoice) => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error('Razorpay keys are missing from environment variables');
    }

    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const amountInPaise = Math.round(invoice.totalAmount * 100);

    const options = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_${invoice.invoiceNumber}`,
        notes: {
            invoiceId: invoice._id.toString()
        }
    };

    const order = await razorpay.orders.create(options);

    return {
        orderId: order.id,
        keyId: process.env.RAZORPAY_KEY_ID,
        provider: 'razorpay'
    };
};

export const verifySignature = (body, signature) => {
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
        throw new Error('Webhook secret is not configured');
    }

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(body)
        .digest('hex');

    return expectedSignature === signature;
};
