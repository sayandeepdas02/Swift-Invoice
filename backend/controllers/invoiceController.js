import Invoice from '../models/Invoice.js';
import { generateInvoicePDF } from '../utils/pdfGenerator.js';
import QRCode from 'qrcode';

export const createInvoice = async (req, res) => {
    try {
        const invoiceData = req.body;

        // Auto-calculate totals if not provided correctly from frontend
        let subtotal = 0;
        invoiceData.items.forEach(item => {
            item.amount = item.quantity * item.rate;
            subtotal += item.amount;
        });

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
        const invoices = await Invoice.find({ userId: req.user?._id }).sort({ createdAt: -1 });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
