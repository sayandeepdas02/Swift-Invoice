import * as invoiceService from '../services/invoiceService.js';
import { generateInvoicePDF } from '../utils/pdfGenerator.js';
import { sendInvoiceEmail } from '../services/emailService.js';
import { sendReminder } from '../services/reminderService.js';
import Invoice from '../models/Invoice.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import sharp from 'sharp';

const processImages = async (body) => {
    const processBase64 = async (base64) => {
        if (!base64 || typeof base64 !== 'string' || !base64.startsWith('data:image')) return base64;
        
        const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) return base64;
        
        const dataBuffer = Buffer.from(matches[2], 'base64');
        const originalSizeKB = dataBuffer.length / 1024;

        if (originalSizeKB > 500) {
            throw new Error(`Image size exceeds safe threshold of 500KB (Actual: ${originalSizeKB.toFixed(2)}KB). Please upload a smaller image.`);
        }

        const compressed = await sharp(dataBuffer)
            .resize({ width: 300, withoutEnlargement: true })
            .jpeg({ quality: 80, force: false })
            .png({ compressionLevel: 8, force: false })
            .toBuffer();

        return `data:${matches[1]};base64,${compressed.toString('base64')}`;
    };

    if (body?.sender?.logo) body.sender.logo = await processBase64(body.sender.logo);
    if (body?.qrCodeImage) body.qrCodeImage = await processBase64(body.qrCodeImage);
};

export const createInvoice = async (req, res) => {
    try {
        await processImages(req.body);
        const invoice = await invoiceService.createInvoice(req.body, req.user.workspaceId);
        res.status(201).json({ success: true, data: invoice, message: 'Invoice created successfully' });
    } catch (error) {
        res.status(error.cause || 400).json({ success: false, data: null, message: error.message });
    }
};

export const updateInvoice = async (req, res) => {
    try {
        await processImages(req.body);
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
        const invoice = await invoiceService.getInvoiceById(req.params.id, req.user.workspaceId);
        
        const rawPdf = await generateInvoicePDF(invoice);
        const pdfBuffer = Buffer.from(rawPdf);

        const sizeKb = pdfBuffer.length / 1024;
        console.log(`[PDF] Generated PDF for Invoice ID ${invoice._id} - Size: ${sizeKb.toFixed(2)} KB`);

        if (pdfBuffer.length < 1024) {
             throw new Error(`Generated PDF is suspiciously small or corrupted (${pdfBuffer.length} bytes), aborting download.`);
        }

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.length,
            'Content-Disposition': `attachment; filename=invoice-${invoice.invoiceNumber || 'file'}.pdf`
        });
        res.end(pdfBuffer);
    } catch (error) {
        console.error('Download Invoice Error:', error);
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
        const invoiceRaw = await Invoice.findById(req.params.id);
        if (!invoiceRaw) throw new Error('Invoice not found', { cause: 404 });
        if (invoiceRaw.userId && invoiceRaw.userId.toString() !== req.user.workspaceId.toString()) {
            throw new Error('Not authorized', { cause: 401 });
        }
        
        if (!invoiceRaw.client || !invoiceRaw.client.email) {
            return res.status(400).json({ success: false, data: null, message: 'Client email is missing' });
        }

        const publicTokenRaw = crypto.randomBytes(32).toString('hex');
        const publicTokenHash = await bcrypt.hash(publicTokenRaw, 10);
        
        invoiceRaw.publicTokenHash = publicTokenHash;
        invoiceRaw.publicTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        await invoiceRaw.save();

        const invoice = invoiceService.withOverdue(invoiceRaw);

        const frontEndUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const publicUrl = `${frontEndUrl}/invoice/${invoice.publicId}?token=${publicTokenRaw}`;

        const pdfBuffer = await generateInvoicePDF(invoice);

        await sendInvoiceEmail({
            to: invoice.client.email,
            subject: `Invoice #${invoice.invoiceNumber} from ${invoice.sender.companyName || invoice.sender.name}`,
            message,
            publicLink: publicUrl,
            pdfBuffer: Buffer.from(pdfBuffer),
            invoiceNumber: invoice.invoiceNumber
        });

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

        const invoiceRaw = await Invoice.findOne({ publicId: req.params.publicId });
        if (!invoiceRaw) {
            return res.status(404).json({ success: false, data: null, message: 'Invoice not found' });
        }

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

        if (!invoiceRaw.viewedAt && invoiceRaw.status !== 'paid' && invoiceRaw.status !== 'cancelled' && invoiceRaw.status !== 'disputed') {
            if (invoiceRaw.status === 'sent') {
                invoiceRaw.viewedAt = new Date();
                invoiceRaw.status = 'viewed';
                await invoiceRaw.save();
            }
        }

        const invoice = invoiceService.withOverdue(invoiceRaw);

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
        const html = `
            <html>
                <head><title>Test PDF</title></head>
                <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
                    <h1>Hello World!</h1>
                    <p>If you are reading this, Puppeteer PDF generation successfully works.</p>
                </body>
            </html>
        `;
        
        const puppeteer = (await import('puppeteer')).default;
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: 'new'
        });
        
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        
        const pdfBuffer = Buffer.from(await page.pdf({ format: 'A4' }));
        await browser.close();
        
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.length,
            'Content-Disposition': 'inline; filename="hello-world.pdf"'
        });
        res.end(pdfBuffer);
    } catch (error) {
        console.error('[TEST PDF ERROR]', error.stack);
        res.status(500).json({ success: false, message: 'PDF Engine failed', error: error.message });
    }
};
