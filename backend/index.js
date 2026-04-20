import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import invoiceRoutes from './routes/invoices.js';
import authRoutes from './routes/auth.js';
import publicRoutes from './routes/public.js';
import clientRoutes from './routes/clients.js';
import settingsRoutes from './routes/settings.js';
import dashboardRoutes from './routes/dashboard.js';
import uploadRoutes from './routes/upload.js';
import serviceRoutes from './routes/services.js';
import paymentRoutes from './routes/payments.js';
import webhookRoutes from './routes/webhooks.js';
import { requestSequenceMiddleware } from './middleware/requestSequence.js';
import rateLimit from 'express-rate-limit';
import './cron/reminders.js';

const app = express();
const PORT = process.env.PORT || 5001;

// Global Middleware
app.use(requestSequenceMiddleware);

const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:5174',
];
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, Postman)
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true
}));

const publicLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30, // Strict limit for scraping public links
    message: { success: false, message: 'Too many requests to public invoice links. Try again later.' }
});

const legacyApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200, 
    message: { success: false, message: 'Too many API requests.' }
});

// Strictly raw parsing for webhooks to preserve signature integrity
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRoutes);

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use('/api', legacyApiLimiter); // Protect general endpoints

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/public', publicLimiter, publicRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/payments', paymentRoutes);

// Database Connection
mongoose.connect(process.env.MONGODB_URI, {
    // Recommendation from MongoDB Atlas for Stable API integration
    serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
    }
})
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
