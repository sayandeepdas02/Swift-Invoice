import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional if we allow guest generation
    },
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['draft', 'sent', 'viewed', 'awaiting_payment', 'paid', 'pending', 'cancelled'], // legacy pending/cancelled kept for backward compat
        default: 'draft'
    },
    isDraft: {
        type: Boolean,
        default: false
    },

    // Sender Details (Pay To)
    sender: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        address: String,
        logo: String,
        companyName: String,
    },

    // Client Details (Billed To)
    client: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        address: String,
    },

    // Invoice Items
    items: [{
        description: { type: String, required: false },
        quantity: { type: Number, required: true, default: 1 },
        rate: { type: Number, required: true, default: 0 },
        amount: { type: Number, required: true }
    }],

    // Financials
    subtotal: { type: Number, required: true },
    taxName: String,
    taxPercentage: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },

    // Dates
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    paymentTerms: String,
    notes: String,

    // Lifecycle timestamps (null = not yet reached that state)
    sentAt: { type: Date, default: null },
    viewedAt: { type: Date, default: null },
    paidAt: { type: Date, default: null },

    // Payment QR
    paymentQr: String,
    qrImageUrl: String,
    qrCodeImage: String,

}, {
    timestamps: true
});

// ── Indexes for performance ──────────────────────────────────────
invoiceSchema.index({ userId: 1, updatedAt: -1 });
invoiceSchema.index({ userId: 1, status: 1 });
invoiceSchema.index({ userId: 1, dueDate: 1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;
