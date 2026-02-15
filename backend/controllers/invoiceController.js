import Invoice from '../models/Invoice.js';
import { generateInvoicePDF } from '../utils/pdfGenerator.js';

export const createInvoice = async (req, res) => {
    try {
        const invoiceData = req.body;

        // Validation (skip for drafts)
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

        // Auto-calculate totals if not provided correctly from frontend
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
            userId: req.user?._id
        });

        await newInvoice.save();
        res.status(201).json(newInvoice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // Check ownership
        if (invoice.userId && invoice.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const invoiceData = req.body;

        // Recalculate totals
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
            {
                ...invoiceData,
                subtotal,
                taxAmount,
                totalAmount
            },
            { new: true }
        );

        res.json(updatedInvoice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

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
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        if (invoice.userId && invoice.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        invoice.status = req.body.status;
        await invoice.save();

        res.json(invoice);
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
        const invoices = await Invoice.find({ userId: req.user._id }).sort({ updatedAt: -1 });
        res.json(invoices);
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

        res.json(invoice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
