import Invoice from '../models/Invoice.js';

const VALID_STATUSES = ['draft', 'sent', 'viewed', 'awaiting_payment', 'paid'];

// Applies virtual `isOverdue` field dynamically
export const withOverdue = (invoice) => {
    const raw = invoice.toObject ? invoice.toObject() : { ...invoice };
    raw.isOverdue = !raw.paidAt && raw.dueDate && new Date() > new Date(raw.dueDate);
    return raw;
};

// Validates line items to ensure numbers are safe
export const validateItems = (items) => {
    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error('Invoice must have at least one item');
    }
    for (const item of items) {
        if (!item.quantity || item.quantity <= 0) {
            throw new Error('Item quantity must be greater than 0');
        }
        if (item.rate < 0) {
            throw new Error('Item rate cannot be negative');
        }
    }
};

// Re-computes absolute mathematical totals securely
export const calculateTotals = (invoiceData) => {
    let subtotal = 0;
    const computedItems = (invoiceData.items || []).map(item => {
        const amount = (item.quantity || 0) * (item.rate || 0);
        subtotal += amount;
        return { ...item, amount };
    });

    const taxAmount = (subtotal * (invoiceData.taxPercentage || 0)) / 100;
    const totalAmount = subtotal + taxAmount - (invoiceData.discount || 0);

    return { params: { subtotal, taxAmount, totalAmount }, computedItems };
};

export const createInvoice = async (invoiceData, userId) => {
    if (!invoiceData.isDraft) {
        validateItems(invoiceData.items);
    }

    const { params, computedItems } = calculateTotals(invoiceData);

    const newInvoice = new Invoice({
        ...invoiceData,
        items: computedItems,
        ...params,
        status: invoiceData.isDraft ? 'draft' : (invoiceData.status || 'draft'),
        userId
    });

    await newInvoice.save();
    return withOverdue(newInvoice);
};

export const updateInvoice = async (invoiceId, invoiceData, userId) => {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) throw new Error('Invoice not found', { cause: 404 });
    if (invoice.userId && invoice.userId.toString() !== userId.toString()) {
        throw new Error('Not authorized', { cause: 401 });
    }

    if (!invoiceData.isDraft) {
        validateItems(invoiceData.items);
    }

    const { params, computedItems } = calculateTotals(invoiceData);

    const updatedInvoice = await Invoice.findByIdAndUpdate(
        invoiceId,
        { ...invoiceData, items: computedItems, ...params },
        { new: true }
    );

    return withOverdue(updatedInvoice);
};

export const updateInvoiceStatus = async (invoiceId, status, userId) => {
    if (!VALID_STATUSES.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, { cause: 400 });
    }

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) throw new Error('Invoice not found', { cause: 404 });
    if (invoice.userId && invoice.userId.toString() !== userId.toString()) {
        throw new Error('Not authorized', { cause: 401 });
    }

    invoice.status = status;

    if (status === 'sent' && !invoice.sentAt) invoice.sentAt = new Date();
    if (status === 'viewed' && !invoice.viewedAt) invoice.viewedAt = new Date();
    if (status === 'paid' && !invoice.paidAt) invoice.paidAt = new Date();

    await invoice.save();
    return withOverdue(invoice);
};

export const duplicateInvoice = async (invoiceId, userId) => {
    const source = await Invoice.findById(invoiceId);
    if (!source) throw new Error('Invoice not found', { cause: 404 });
    if (source.userId && source.userId.toString() !== userId.toString()) {
        throw new Error('Not authorized', { cause: 401 });
    }

    const sourceObj = source.toObject();
    delete sourceObj._id;
    delete sourceObj.__v;
    delete sourceObj.createdAt;
    delete sourceObj.updatedAt;

    const newNumber = `INV-${Math.floor(10000 + Math.random() * 90000)}`;

    const duplicate = new Invoice({
        ...sourceObj,
        invoiceNumber: newNumber,
        status: 'draft',
        isDraft: true,
        sentAt: null,
        viewedAt: null,
        paidAt: null,
        issueDate: new Date(),
        userId
    });

    await duplicate.save();
    return withOverdue(duplicate);
};

export const deleteInvoice = async (invoiceId, userId) => {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) throw new Error('Invoice not found', { cause: 404 });
    if (invoice.userId && invoice.userId.toString() !== userId.toString()) {
        throw new Error('Not authorized', { cause: 401 });
    }
    await invoice.deleteOne();
    return true;
};

export const getInvoices = async (userId) => {
    const invoices = await Invoice.find({ userId })
        .select('-sender.logo -qrCodeImage -qrImageUrl')
        .sort({ updatedAt: -1 })
        .lean();

    const now = new Date();
    return invoices.map(inv => ({
        ...inv,
        isOverdue: !inv.paidAt && inv.dueDate && now > new Date(inv.dueDate),
    }));
};

export const getInvoiceById = async (invoiceId, userId) => {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) throw new Error('Invoice not found', { cause: 404 });
    if (invoice.userId && invoice.userId.toString() !== userId.toString()) {
        throw new Error('Not authorized', { cause: 401 });
    }
    return withOverdue(invoice);
};