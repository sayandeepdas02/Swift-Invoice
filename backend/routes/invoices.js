import express from 'express';
import { createInvoice, downloadInvoice, getInvoices, updateInvoice, deleteInvoice, updateInvoiceStatus, getInvoiceById, duplicateInvoice, sendInvoice, sendManualReminder, getLastInvoice } from '../controllers/invoiceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createInvoice);
router.get('/last', protect, getLastInvoice);
router.get('/', protect, getInvoices);
router.get('/:id', protect, getInvoiceById);
router.put('/:id', protect, updateInvoice);
router.delete('/:id', protect, deleteInvoice);
router.patch('/:id/status', protect, updateInvoiceStatus);
router.post('/:id/duplicate', protect, duplicateInvoice);
router.post('/:id/send', protect, sendInvoice);
router.post('/:id/remind', protect, sendManualReminder);
router.get('/:id/download', protect, downloadInvoice);

export default router;

