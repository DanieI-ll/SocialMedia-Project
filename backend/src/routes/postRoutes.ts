import { Router } from 'express';
import { createPostController, getPostsController, getUserPostsController, updatePostController, deletePostController, getPostByIdController } from '../controllers/postController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/upload';

const router = Router();

router.post('/create', authMiddleware, upload.single('image'), createPostController);
router.get('/', authMiddleware, getPostsController);
router.get('/user/:userId', getUserPostsController);
router.put('/:postId', authMiddleware, upload.single('image'), updatePostController);
router.delete('/:postId', authMiddleware, deletePostController);
// postRoutes
router.get('/:postId', authMiddleware, getPostByIdController); // Tek bir post'u ID'si ile çeker

export default router;
