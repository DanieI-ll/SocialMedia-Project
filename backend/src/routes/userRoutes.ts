import { Router } from 'express';
import { updateMyProfile } from '../controllers/profileController';
import { upload } from '../middlewares/uploadAvatar';
import { authMiddleware } from '../middlewares/authMiddleware';
import { getUserByIdController } from '../controllers/userController';

const router = Router();

router.put('/me', authMiddleware, upload.single('avatar'), updateMyProfile);
router.get('/:userId', authMiddleware, getUserByIdController);

export default router;
