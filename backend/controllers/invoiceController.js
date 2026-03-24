import * as invoiceService from '../services/invoiceService.js';
import { generateInvoicePDF } from '../utils/pdfGenerator.js';

export const createInvoice = async (req, res) => {
    try {
        const invoice = await invoiceService.createInvoice(req.body, req.user._id);
        res.status(201).json({ success: true, data: invoice, message: 'Invoice created successfully' });
    } catch (error) {
        res.status(error.cause || 400).json({ success: false, data: null, message: error.message });
    }
};

export const updateInvoice = async (req, res) => {
    try {
        const invoice = await invoiceService.updateInvoice(req.params.id, req.body, req.user._id);
        res.json({ success: true, data: invoice, message: 'Invoice updated successfully' });
    } catch (error) {
        res.status(error.cause || 400).json({ success: false, data: null, message: error.message });
    }
};

export const deleteInvoice = async (req, res) => {
    try {
        await invoiceService.deleteInvoice(req.params.id, req.user._id);
        res.json({ success: true, data: null, message: 'Invoice removed successfully' });
    } catch (error) {
        res.status(error.cause || 500).json({ success: false, data: null, message: error.message });
    }
};

export const updateInvoiceStatus = async (req, res) => {
    try {
        const invoice = await invoiceService.updateInvoiceStatus(req.params.id, req.body.status, req.user._id);
        res.json({ success: true, data: invoice, message: 'Invoice status updated successfully' });
    } catch (error) {
        res.status(error.cause || 400).json({ success: false, data: null, message: error.message });
    }
};

export const duplicateInvoice = async (req, res) => {
    try {
        const duplicate = await invoiceService.duplicateInvoice(req.params.id, req.user._id);
        res.status(201).json({ success: true, data: duplicate, message: 'Invoice duplicated successfully' });
    } catch (error) {
        res.status(error.cause || 400).json({ success: false, data: null, message: error.message });
    }
};

export const downloadInvoice = async (req, res) => {
    try {
        // Must use the model directly here or rely on the service fetching standard object
        // getInvoiceById returns a leaned object or virtuals, but PDF gen needs raw props sometimes
        // Actually, the service returns the Mongoose document with dynamic isOverdue depending if it used `.toObject()`.
        const invoice = await invoiceService.getInvoiceById(req.params.id, req.user._id);
        
        const pdfBuffer = await generateInvoicePDF(invoice);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber || 'file'}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        res.status(error.cause || 500).json({ success: false, data: null, message: error.message });
    }
};

export const getInvoices = async (req, res) => {
    try {
        const invoices = await invoiceService.getInvoices(req.user._id);
        res.json({ success: true, data: invoices, message: 'Invoices fetched successfully' });
    } catch (error) {
        res.status(500).json({ success: false, data: null, message: error.message });
    }
};

export const getInvoiceById = async (req, res) => {
    try {
        const invoice = await invoiceService.getInvoiceById(req.params.id, req.user._id);
        res.json({ success: true, data: invoice, message: 'Invoice fetched successfully' });
    } catch (error) {
        res.status(error.cause || 500).json({ success: false, data: null, message: error.message });
    }
};
