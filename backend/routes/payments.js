import express from 'express';
import { createOrder, simulatePayment } from '../controllers/paymentController.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const paymentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 20, // max 20 requests per IP per 15 mins
    message: { success: false, message: 'Too many payment requests, please try again later.' }
});

router.post('/create-order', paymentLimiter, createOrder);
router.post('/simulate', paymentLimiter, simulatePayment);

export default router;
