import * as invoiceService from '../services/invoiceService.js';
import { generateInvoicePDF } from '../utils/pdfGenerator.js';
import { sendInvoiceEmail } from '../services/emailService.js';
import { sendReminder } from '../services/reminderService.js';
import Invoice from '../models/Invoice.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export const createInvoice = async (req, res) => {
    try {
        const invoice = await invoiceService.createInvoice(req.body, req.user.workspaceId);
        res.status(201).json({ success: true, data: invoice, message: 'Invoice created successfully' });
    } catch (error) {
        res.status(error.cause || 400).json({ success: false, data: null, message: error.message });
    }
};

export const updateInvoice = async (req, res) => {
    try {
        const invoice = await invoiceService.updateInvoice(req.params.id, req.body, req.user.workspaceId);
        res.json({ success: true, data: invoice, message: 'Invoice updated successfully' });
    } catch (error) {
        res.status(error.cause || 400).json({ success: false, data: null, message: error.message });
    }
};

export const deleteInvoice = async (req, res) => {
    try {
        await invoiceService.deleteInvoice(req.params.id, req.user.workspaceId);
        res.json({ success: true, data: null, message: 'Invoice removed successfully' });
    } catch (error) {
        res.status(error.cause || 500).json({ success: false, data: null, message: error.message });
    }
};

export const updateInvoiceStatus = async (req, res) => {
    try {
        const invoice = await invoiceService.updateInvoiceStatus(req.params.id, req.body.status, req.user.workspaceId);
        res.json({ success: true, data: invoice, message: 'Invoice status updated successfully' });
    } catch (error) {
        res.status(error.cause || 400).json({ success: false, data: null, message: error.message });
    }
};

export const duplicateInvoice = async (req, res) => {
    try {
        const duplicate = await invoiceService.duplicateInvoice(req.params.id, req.user.workspaceId);
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
        const invoice = await invoiceService.getInvoiceById(req.params.id, req.user.workspaceId);
        
        const pdfBuffer = await generateInvoicePDF(invoice);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.length,
            'Content-Disposition': `attachment; filename=invoice-${invoice.invoiceNumber || 'file'}.pdf`
        });
        res.send(pdfBuffer);
    } catch (error) {
        res.status(error.cause || 500).json({ success: false, data: null, message: error.message });
    }
};

export const getInvoices = async (req, res) => {
    try {
        const invoices = await invoiceService.getInvoices(req.user.workspaceId);
        res.json({ success: true, data: invoices, message: 'Invoices fetched successfully' });
    } catch (error) {
        res.status(500).json({ success: false, data: null, message: error.message });
    }
};

export const getInvoiceById = async (req, res) => {
    try {
        const invoice = await invoiceService.getInvoiceById(req.params.id, req.user.workspaceId);
        res.json({ success: true, data: invoice, message: 'Invoice fetched successfully' });
    } catch (error) {
        res.status(error.cause || 500).json({ success: false, data: null, message: error.message });
    }
};

export const sendInvoice = async (req, res) => {
    try {
        const { message } = req.body;
        // Verify invoice belongs to user natively grabbing document to mutate
        const invoiceRaw = await Invoice.findById(req.params.id);
        if (!invoiceRaw) throw new Error('Invoice not found', { cause: 404 });
        if (invoiceRaw.userId && invoiceRaw.userId.toString() !== req.user.workspaceId.toString()) {
            throw new Error('Not authorized', { cause: 401 });
        }
        
        // Client needs email
        if (!invoiceRaw.client || !invoiceRaw.client.email) {
            return res.status(400).json({ success: false, data: null, message: 'Client email is missing' });
        }

        // Generate a new secure token dynamically to ensure emails can be sent at any time independently
        const publicTokenRaw = crypto.randomBytes(32).toString('hex');
        const publicTokenHash = await bcrypt.hash(publicTokenRaw, 10);
        
        invoiceRaw.publicTokenHash = publicTokenHash;
        invoiceRaw.publicTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        await invoiceRaw.save();

        const invoice = invoiceService.withOverdue(invoiceRaw);

        // Generating front-end public URL
        const frontEndUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const publicUrl = `${frontEndUrl}/invoice/${invoice.publicId}?token=${publicTokenRaw}`;

        // Buffer the PDF
        const pdfBuffer = await generateInvoicePDF(invoice);

        // Send Email
        await sendInvoiceEmail({
            to: invoice.client.email,
            subject: `Invoice #${invoice.invoiceNumber} from ${invoice.sender.companyName || invoice.sender.name}`,
            message,
            publicLink: publicUrl,
            pdfBuffer,
            invoiceNumber: invoice.invoiceNumber
        });

        // Update database explicitly 
        const updatedInvoice = await invoiceService.updateInvoiceStatus(invoice._id, 'sent', req.user.workspaceId);

        logActivity(req.user.workspaceId, invoice._id, 'SENT', { targetEmail: invoice.client.email });

        res.json({ success: true, data: updatedInvoice, message: 'Invoice sent successfully' });
    } catch (error) {
        console.error('Send Invoice Error:', error);
        res.status(error.cause || 500).json({ success: false, data: null, message: error.message });
    }
};

export const sendManualReminder = async (req, res) => {
    try {
        const invoiceRaw = await Invoice.findById(req.params.id);
        if (!invoiceRaw) throw new Error('Invoice not found', { cause: 404 });
        if (invoiceRaw.userId && invoiceRaw.userId.toString() !== req.user.workspaceId.toString()) {
            throw new Error('Not authorized', { cause: 401 });
        }
        if (invoiceRaw.status === 'paid' || invoiceRaw.status === 'Paid') {
            throw new Error('Invoice is already paid', { cause: 400 });
        }

        const invoice = invoiceService.withOverdue(invoiceRaw);
        const type = invoice.isOverdue ? 'overdue' : 'upcoming';
        const updatedInvoice = await sendReminder(invoiceRaw, type);

        res.json({ success: true, data: invoiceService.withOverdue(updatedInvoice), message: 'Reminder sent successfully' });
    } catch (error) {
        console.error('Manual Reminder Error:', error);
        res.status(error.cause || 500).json({ success: false, data: null, message: error.message });
    }
};

export const getLastInvoice = async (req, res) => {
    try {
        const lastInvoice = await Invoice.findOne({ userId: req.user.workspaceId }).sort({ createdAt: -1 });
        if (!lastInvoice) {
            return res.status(404).json({ success: false, data: null, message: 'No past invoices found' });
        }
        res.json({ success: true, data: invoiceService.withOverdue(lastInvoice), message: 'Last invoice loaded' });
    } catch (error) {
        res.status(500).json({ success: false, data: null, message: error.message });
    }
};

import { logActivity } from '../services/activityService.js';

export const getPublicInvoiceById = async (req, res) => {
    try {
        const { token } = req.query;

        // Query by publicId, bypassing protect
        const invoiceRaw = await Invoice.findOne({ publicId: req.params.publicId });
        if (!invoiceRaw) {
            return res.status(404).json({ success: false, data: null, message: 'Invoice not found' });
        }

        // Token Security Validation
        if (!token) {
            return res.status(403).json({ success: false, message: 'Access forbidden: Missing token' });
        }
        
        if (invoiceRaw.publicTokenExpiresAt && new Date() > invoiceRaw.publicTokenExpiresAt) {
            return res.status(403).json({ success: false, message: 'Access forbidden: Link expired' });
        }

        const isValid = await bcrypt.compare(token, invoiceRaw.publicTokenHash);
        if (!isValid) {
            return res.status(403).json({ success: false, message: 'Access forbidden: Invalid token' });
        }

        // Optional viewedAt stamping
        if (!invoiceRaw.viewedAt && invoiceRaw.status !== 'paid' && invoiceRaw.status !== 'cancelled' && invoiceRaw.status !== 'disputed') {
            if (invoiceRaw.status === 'sent') {
                invoiceRaw.viewedAt = new Date();
                invoiceRaw.status = 'viewed';
                await invoiceRaw.save();
            }
        }

        // Apply dynamic fields via service utility
        const invoice = invoiceService.withOverdue(invoiceRaw);

        // Natively track the view event without blocking the API
        logActivity(invoiceRaw.userId, invoice._id, 'VIEWED', { 
            ip: req.ip, 
            userAgent: req.get('User-Agent') 
        });

        res.json({ success: true, data: invoice, message: 'Public invoice fetched successfully' });
    } catch (error) {
        console.error('Public Invoice Error:', error);
        res.status(500).json({ success: false, data: null, message: error.message });
    }
};

export const testPDFEngine = async (req, res) => {
    try {
        console.log('[TEST PDF] Starting test engine request...');
        const html = `
            <html>
                <head><title>Test PDF</title></head>
                <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
                    <h1>Hello World!</h1>
                    <p>If you are reading this, Puppeteer PDF generation successfully works independently of business logic.</p>
                </body>
            </html>
        `;
        
        const puppeteer = (await import('puppeteer')).default;
        console.log('[TEST PDF] Launching browser...');
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: 'new'
        });
        
        console.log('[TEST PDF] Setting page content...');
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        
        console.log('[TEST PDF] Generating buffer...');
        const pdfBuffer = await page.pdf({ format: 'A4' });
        
        await browser.close();
        console.log(`[TEST PDF] Done. Buffer size: ${pdfBuffer.length}`);
        
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.length,
            'Content-Disposition': 'inline; filename="hello-world.pdf"'
        });
        res.send(pdfBuffer);
    } catch (error) {
        console.error('[TEST PDF ERROR]', error.stack);
        res.status(500).json({ success: false, message: 'PDF Engine failed', error: error.message });
    }
};
