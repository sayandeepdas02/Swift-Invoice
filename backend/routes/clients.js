import express from 'express';
import { getClients, createClient, updateClient, deleteClient, getClientHistory } from '../controllers/clientController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getClients);
router.post('/', protect, createClient);
router.put('/:id', protect, updateClient);
router.delete('/:id', protect, deleteClient);
router.get('/:id/history', protect, getClientHistory);

export default router;
