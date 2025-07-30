import { Router } from 'express';
import { getMyProfile } from '../controllers/profileController'; // или profileController, если там getMyProfile
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/me', authMiddleware, getMyProfile); // возвращает профиль
export default router;
