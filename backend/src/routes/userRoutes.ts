import { Router } from 'express';
import { updateProfile } from '../controllers/userController';
import { upload } from '../middlewares/upload';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.put('/profile', authMiddleware, upload.single('avatar'), updateProfile);

export default router;
