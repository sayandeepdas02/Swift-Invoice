import express from 'express';
import { createInvoice, downloadInvoice, getInvoices } from '../controllers/invoiceController.js';

const router = express.Router();

router.post('/', createInvoice);
router.get('/', getInvoices);
router.get('/:id/download', downloadInvoice);

export default router;
