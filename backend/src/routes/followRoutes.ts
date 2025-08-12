import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { followController, unfollowController, getFollowersController, getFollowingController } from '../controllers/followController';

const router = Router();

router.post('/follow/:userId', authMiddleware, followController);
router.delete('/unfollow/:userId', authMiddleware, unfollowController);

router.get('/followers/:userId', authMiddleware, getFollowersController);
router.get('/following/:userId', authMiddleware, getFollowingController);

export default router;
