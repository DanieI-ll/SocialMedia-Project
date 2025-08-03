import { Router } from 'express';
import { getNotifications, markAsRead, deleteNotification } from '../controllers/notificationController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authMiddleware, getNotifications);
router.put('/read', authMiddleware, markAsRead);
router.delete('/:id', authMiddleware, deleteNotification)

export default router;
