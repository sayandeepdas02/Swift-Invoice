import express from 'express';
import { createInvoice, downloadInvoice, getInvoices, updateInvoice, deleteInvoice, updateInvoiceStatus, getInvoiceById, duplicateInvoice, sendInvoice, sendManualReminder, getLastInvoice, testPDFEngine } from '../controllers/invoiceController.js';
import { processBatch } from '../controllers/batchController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateInvoice, handleValidationErrors } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/', protect, validateInvoice, handleValidationErrors, createInvoice);
router.post('/batch', protect, processBatch);
router.get('/test-pdf-engine', testPDFEngine);
router.get('/last', protect, getLastInvoice);
router.get('/', protect, getInvoices);
router.get('/:id', protect, getInvoiceById);
router.put('/:id', protect, validateInvoice, handleValidationErrors, updateInvoice);
router.delete('/:id', protect, deleteInvoice);
router.patch('/:id/status', protect, updateInvoiceStatus);
router.post('/:id/duplicate', protect, duplicateInvoice);
router.post('/:id/send', protect, sendInvoice);
router.post('/:id/remind', protect, sendManualReminder);
router.get('/:id/download', protect, downloadInvoice);

export default router;

