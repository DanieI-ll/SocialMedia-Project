import { Router } from 'express';
import { getMyProfile, updateMyProfile } from '../controllers/profileController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/me', authMiddleware, getMyProfile);
router.put('/me', authMiddleware, updateMyProfile);

export default router;
