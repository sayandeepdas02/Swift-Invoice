import Invoice from '../models/Invoice.js';
import Client from '../models/Client.js';
import User from '../models/User.js';
import Counter from '../models/Counter.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { logActivity } from './activityService.js';

const VALID_STATUSES = ['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled', 'disputed'];

const STATE_TRANSITIONS = {
    'draft': ['sent', 'cancelled'],
    'sent': ['viewed', 'paid', 'overdue', 'cancelled'],
    'viewed': ['viewed', 'paid', 'overdue', 'cancelled'],
    'overdue': ['paid', 'cancelled'],
    'paid': ['disputed'], // strictly locked except optional admin-only override
    'disputed': ['cancelled'],
    'cancelled': []
};

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
    
    // Inherit Global User Settings defaults natively
    const seqUser = await User.findById(userId).select('taxType defaultTaxRate defaultTerms dateFormat');
    if (seqUser) {
        if (!invoiceData.taxType) invoiceData.taxType = seqUser.taxType;
        if (invoiceData.taxPercentage === undefined && seqUser.defaultTaxRate) {
            invoiceData.taxPercentage = seqUser.defaultTaxRate;
        }
        if (invoiceData.notes === undefined || invoiceData.notes === '') {
            invoiceData.notes = seqUser.defaultTerms;
        }
    }

    // Auto-create client seamlessly
    if (invoiceData.client && invoiceData.client.name && invoiceData.client.email) {
        try {
            const existingClient = await Client.findOne({ userId, email: invoiceData.client.email });
            if (!existingClient) {
                await Client.create({
                    userId,
                    name: invoiceData.client.name,
                    email: invoiceData.client.email,
                    address: invoiceData.client.address || ''
                });
            }
        } catch (err) {
            console.error('Silent client creation failed:', err);
        }
    }

    const { params, computedItems } = calculateTotals(invoiceData);

    const counter = await Counter.findOneAndUpdate(
        { _id: "invoice" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    const finalInvoiceNumber = `INV-${String(counter.seq).padStart(4, "0")}`;

    // Security constraints
    const publicTokenRaw = crypto.randomBytes(32).toString('hex');
    const publicTokenHash = await bcrypt.hash(publicTokenRaw, 10);
    const publicTokenExpiresAt = new Date();
    publicTokenExpiresAt.setDate(publicTokenExpiresAt.getDate() + 30); // 30 days expiry

    const newInvoice = new Invoice({
        ...invoiceData,
        invoiceNumber: finalInvoiceNumber,
        items: computedItems,
        ...params,
        publicId: crypto.randomBytes(16).toString('hex'),
        publicTokenHash,
        publicTokenExpiresAt,
        status: invoiceData.isDraft ? 'draft' : (invoiceData.status || 'draft'),
        userId
    });

    await newInvoice.save();
    
    // Injecting raw token purely mapped for the controller returning it to the user ONCE
    const result = withOverdue(newInvoice);
    result.publicTokenRaw = publicTokenRaw;
    
    // Track Activity
    logActivity(userId, newInvoice._id, 'CREATED', { source: 'dashboard' });
    
    return result;
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

    // Auto-create client seamlessly during updates 
    if (invoiceData.client && invoiceData.client.name && invoiceData.client.email) {
        try {
            const existingClient = await Client.findOne({ userId, email: invoiceData.client.email });
            if (!existingClient) {
                await Client.create({
                    userId,
                    name: invoiceData.client.name,
                    email: invoiceData.client.email,
                    address: invoiceData.client.address || ''
                });
            }
        } catch (err) {
            console.error('Silent client creation failed:', err);
        }
    }

    const { params, computedItems } = calculateTotals(invoiceData);

    const updatedInvoice = await Invoice.findByIdAndUpdate(
        invoiceId,
        { ...invoiceData, items: computedItems, ...params },
        { new: true }
    );

    return withOverdue(updatedInvoice);
};

export const updateInvoiceStatus = async (invoiceId, status, userId, isAdmin = false) => {
    if (!VALID_STATUSES.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, { cause: 400 });
    }

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) throw new Error('Invoice not found', { cause: 404 });
    if (invoice.userId && invoice.userId.toString() !== userId.toString()) {
        throw new Error('Not authorized', { cause: 401 });
    }

    // Evaluate State Machine Transition Matrix
    const currentStatus = invoice.status;
    const allowedNext = STATE_TRANSITIONS[currentStatus] || [];
    
    if (!allowedNext.includes(status)) {
        throw new Error(`State Transition Violation: Cannot move from '${currentStatus}' to '${status}'.`, { cause: 422 });
    }

    // Admin safety checks for terminal states
    if ((currentStatus === 'paid' || currentStatus === 'disputed') && !isAdmin) {
         throw new Error(`State Extension Violation: Only admins can override terminal states.`, { cause: 403 });
    }

    invoice.status = status;

    if (status === 'sent' && !invoice.sentAt) invoice.sentAt = new Date();
    if (status === 'viewed' && !invoice.viewedAt) invoice.viewedAt = new Date();
    if (status === 'paid' && !invoice.paidAt) invoice.paidAt = new Date();

    await invoice.save();
    
    // Track major status transitions
    if (status === 'paid') logActivity(userId, invoiceId, 'PAID', { trigger: 'manual_update' });
    if (status === 'sent') logActivity(userId, invoiceId, 'SENT', { trigger: 'manual_dispatch' });
    
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

    const counter = await Counter.findOneAndUpdate(
        { _id: "invoice" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    const newNumber = `INV-${String(counter.seq).padStart(4, "0")}`;

    const publicTokenRaw = crypto.randomBytes(32).toString('hex');
    const publicTokenHash = await bcrypt.hash(publicTokenRaw, 10);
    const publicTokenExpiresAt = new Date();
    publicTokenExpiresAt.setDate(publicTokenExpiresAt.getDate() + 30); // 30 days expiry

    const duplicate = new Invoice({
        ...sourceObj,
        invoiceNumber: newNumber,
        publicId: crypto.randomBytes(16).toString('hex'),
        publicTokenHash,
        publicTokenExpiresAt,
        status: 'draft',
        isDraft: true,
        sentAt: null,
        viewedAt: null,
        paidAt: null,
        issueDate: new Date(),
        userId
    });

    await duplicate.save();
    
    const result = withOverdue(duplicate);
    result.publicTokenRaw = publicTokenRaw;
    
    logActivity(userId, duplicate._id, 'CREATED', { source: 'duplication', originalInvoiceId: invoiceId });
    
    return result;
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

import Activity from '../models/Activity.js';

export const getInvoices = async (userId) => {
    const invoices = await Invoice.find({ userId })
        .select('-sender.logo -qrCodeImage -qrImageUrl')
        .sort({ updatedAt: -1 })
        .lean();

    if (invoices.length === 0) return [];

    const invoiceIds = invoices.map(i => i._id);

    // Fetch batch Activity data bypassing N+1 queries securely
    const activities = await Activity.aggregate([
        { $match: { invoiceId: { $in: invoiceIds }, type: 'VIEWED' } },
        { 
            $group: {
                _id: "$invoiceId",
                viewCount: { $sum: 1 },
                lastViewedAt: { $max: "$createdAt" }
            }
        }
    ]);

    const activityMap = new Map();
    activities.forEach(act => activityMap.set(act._id.toString(), act));

    const now = new Date();
    return invoices.map(inv => {
        const stats = activityMap.get(inv._id.toString()) || { viewCount: 0, lastViewedAt: null };
        return {
            ...inv,
            isOverdue: !inv.paidAt && inv.dueDate && now > new Date(inv.dueDate),
            viewCount: stats.viewCount,
            lastViewedAt: stats.lastViewedAt
        };
    });
};

export const getInvoiceById = async (invoiceId, userId) => {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) throw new Error('Invoice not found', { cause: 404 });
    if (invoice.userId && invoice.userId.toString() !== userId.toString()) {
        throw new Error('Not authorized', { cause: 401 });
    }
    return withOverdue(invoice);
};