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
import './cron/reminders.js';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
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

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/services', serviceRoutes);

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
