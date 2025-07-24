import { Router } from 'express';
import { getNotifications, markAsRead } from '../controllers/notificationController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authMiddleware, getNotifications);
router.put('/read', authMiddleware, markAsRead);

export default router;
