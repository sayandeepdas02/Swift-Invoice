import express from 'express';
import { register, login, logout, getMe, googleLogin, inviteTeamMember } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Too many attempts, please try again after 15 minutes.' }
});

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, googleLogin);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/invite', protect, inviteTeamMember);

export default router;
