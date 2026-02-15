import express from 'express';
import { createInvoice, downloadInvoice, getInvoices, updateInvoice, deleteInvoice, updateInvoiceStatus, getInvoiceById } from '../controllers/invoiceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createInvoice);
router.get('/', protect, getInvoices);
router.get('/:id', protect, getInvoiceById);
router.put('/:id', protect, updateInvoice);
router.delete('/:id', protect, deleteInvoice);
router.patch('/:id/status', protect, updateInvoiceStatus);
router.get('/:id/download', protect, downloadInvoice);

export default router;
