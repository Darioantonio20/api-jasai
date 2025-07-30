import express from 'express';
import { register, login, getMe, logout } from '../controllers/authController';
import { protect } from '../middlewares/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;