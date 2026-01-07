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
        enum: ['pending', 'paid', 'cancelled'],
        default: 'pending'
    },

    // Sender Details (Pay To)
    sender: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        address: String,
        logo: String, // URL from Cloudinary or uploaded image
        companyName: String, // Custom company name to display
    },

    // Client Details (Billed To)
    client: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        address: String,
    },

    // Invoice Items
    items: [{
        description: { type: String, required: true },
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

    // Metadata
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    paymentTerms: String,
    notes: String,

    // Payment QR
    paymentQr: String, // UPI ID text to display in invoice
    qrImageUrl: String, // Auto-generated QR (deprecated, keeping for backward compatibility)
    qrCodeImage: String, // User-uploaded QR code image URL

}, {
    timestamps: true
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;
