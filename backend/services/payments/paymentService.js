import * as razorpayService from './razorpayService.js';
import * as dummyPaymentService from './dummyPaymentService.js';

const getProvider = () => {
    const provider = process.env.PAYMENT_PROVIDER || 'dummy';
    if (provider.toLowerCase() === 'razorpay') {
        return razorpayService;
    }
    return dummyPaymentService;
};

export const createOrder = async (invoice) => {
    const providerService = getProvider();
    return await providerService.createOrder(invoice);
};
