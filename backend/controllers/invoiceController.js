import Invoice from '../models/Invoice.js';
import { generateInvoicePDF } from '../utils/pdfGenerator.js';

const VALID_STATUSES = ['draft', 'sent', 'viewed', 'awaiting_payment', 'paid'];

// Helper: compute overdue flag (never stored, always derived)
const withOverdue = (invoice) => {
    const raw = invoice.toObject ? invoice.toObject() : { ...invoice };
    raw.isOverdue = !raw.paidAt && raw.dueDate && new Date() > new Date(raw.dueDate);
    return raw;
};

export const createInvoice = async (req, res) => {
    try {
        const invoiceData = req.body;

        if (!invoiceData.isDraft) {
            if (!invoiceData.items || !Array.isArray(invoiceData.items) || invoiceData.items.length === 0) {
                return res.status(400).json({ message: 'Invoice must have at least one item' });
            }
            for (const item of invoiceData.items) {
                if (!item.quantity || item.quantity <= 0) {
                    return res.status(400).json({ message: 'Item quantity must be greater than 0' });
                }
                if (item.rate < 0) {
                    return res.status(400).json({ message: 'Item rate cannot be negative' });
                }
            }
        }

        let subtotal = 0;
        if (invoiceData.items) {
            invoiceData.items.forEach(item => {
                item.amount = (item.quantity || 0) * (item.rate || 0);
                subtotal += item.amount;
            });
        }

        const taxAmount = (subtotal * (invoiceData.taxPercentage || 0)) / 100;
        const totalAmount = subtotal + taxAmount - (invoiceData.discount || 0);

        const newInvoice = new Invoice({
            ...invoiceData,
            subtotal,
            taxAmount,
            totalAmount,
            status: invoiceData.isDraft ? 'draft' : (invoiceData.status || 'draft'),
            userId: req.user?._id
        });

        await newInvoice.save();
        res.status(201).json(withOverdue(newInvoice));
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
        if (invoice.userId && invoice.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const invoiceData = req.body;
        let subtotal = 0;
        if (invoiceData.items) {
            invoiceData.items.forEach(item => {
                item.amount = (item.quantity || 0) * (item.rate || 0);
                subtotal += item.amount;
            });
        }

        const taxAmount = (subtotal * (invoiceData.taxPercentage || 0)) / 100;
        const totalAmount = subtotal + taxAmount - (invoiceData.discount || 0);

        const updatedInvoice = await Invoice.findByIdAndUpdate(
            req.params.id,
            { ...invoiceData, subtotal, taxAmount, totalAmount },
            { new: true }
        );

        res.json(withOverdue(updatedInvoice));
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
        if (invoice.userId && invoice.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        await invoice.deleteOne();
        res.json({ message: 'Invoice removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateInvoiceStatus = async (req, res) => {
    try {
        const { status } = req.body;

        // Overdue is computed — never allow storing it
        if (!VALID_STATUSES.includes(status)) {
            return res.status(400).json({ message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
        }

        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
        if (invoice.userId && invoice.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        invoice.status = status;

        // Set lifecycle timestamps automatically
        if (status === 'sent' && !invoice.sentAt) invoice.sentAt = new Date();
        if (status === 'viewed' && !invoice.viewedAt) invoice.viewedAt = new Date();
        if (status === 'paid' && !invoice.paidAt) invoice.paidAt = new Date();

        await invoice.save();
        res.json(withOverdue(invoice));
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// NEW: Duplicate invoice
export const duplicateInvoice = async (req, res) => {
    try {
        const source = await Invoice.findById(req.params.id);
        if (!source) return res.status(404).json({ message: 'Invoice not found' });
        if (source.userId && source.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const sourceObj = source.toObject();
        delete sourceObj._id;
        delete sourceObj.__v;
        delete sourceObj.createdAt;
        delete sourceObj.updatedAt;

        // Generate unique invoice number
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
            userId: req.user._id,
        });

        await duplicate.save();
        res.status(201).json(withOverdue(duplicate));
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const downloadInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

        const pdfBuffer = await generateInvoicePDF(invoice);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getInvoices = async (req, res) => {
    try {
        // Lean projection: exclude heavy base64 fields for list view
        const invoices = await Invoice.find({ userId: req.user._id })
            .select('-sender.logo -qrCodeImage -qrImageUrl')
            .sort({ updatedAt: -1 })
            .lean();

        // Compute isOverdue on each invoice
        const now = new Date();
        const enriched = invoices.map(inv => ({
            ...inv,
            isOverdue: !inv.paidAt && inv.dueDate && now > new Date(inv.dueDate),
        }));

        res.json(enriched);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
        if (invoice.userId && invoice.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        res.json(withOverdue(invoice));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
