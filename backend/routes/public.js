import express from 'express';
import { getPublicInvoiceById } from '../controllers/invoiceController.js';

const router = express.Router();

router.get('/invoice/:publicId', getPublicInvoiceById);

export default router;
