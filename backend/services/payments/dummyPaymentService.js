export const createOrder = async (invoice) => {
    // Generate a fake dummy order ID
    const randomHash = Math.random().toString(36).substring(2, 10);
    const orderId = `dummy_order_${randomHash}`;

    return {
        orderId,
        keyId: 'dummy_key_not_real',
        provider: 'dummy'
    };
};
