import express from 'express';
import { processBatch } from '../controllers/batchController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, processBatch);

export default router;
