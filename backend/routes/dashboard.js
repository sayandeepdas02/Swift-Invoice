import express from 'express';
import { getDashboardMetrics, getAdvancedMetrics } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/metrics', protect, getDashboardMetrics);
router.get('/advanced', protect, getAdvancedMetrics);

export default router;
