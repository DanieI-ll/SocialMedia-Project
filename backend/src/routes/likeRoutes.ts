import { Router } from 'express';
import { toggleLikeController, getLikesCountController } from '../controllers/likeController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/:postId', authMiddleware, toggleLikeController);
router.get('/:postId', getLikesCountController);

export default router;
