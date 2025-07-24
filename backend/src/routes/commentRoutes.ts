import { Router } from 'express';
import { addCommentController, getCommentsController } from '../controllers/commentController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', authMiddleware, addCommentController);
router.get('/:postId', getCommentsController);

export default router;