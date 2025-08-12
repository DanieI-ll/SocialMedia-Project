import { Router } from 'express';
import { getMyProfile } from '../controllers/profileController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/me', authMiddleware, getMyProfile);
export default router;
