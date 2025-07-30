import { Router } from 'express';
import { updateMyProfile } from '../controllers/profileController';
import { upload } from '../middlewares/upload';
import { authMiddleware } from '../middlewares/authMiddleware';
import { getUserByIdController } from '../controllers/userController';

const router = Router();

router.put('/me', authMiddleware, upload.single('avatar'), updateMyProfile); // UpdateProfile
router.get('/:userId', getUserByIdController);

export default router;
