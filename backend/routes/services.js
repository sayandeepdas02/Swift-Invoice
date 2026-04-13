import express from 'express';
import { getServices, createService, deleteService } from '../controllers/serviceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getServices);
router.post('/', protect, createService);
router.delete('/:id', protect, deleteService);

export default router;
