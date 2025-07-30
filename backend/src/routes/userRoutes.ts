import { Router } from 'express';
import { updateMyProfile } from '../controllers/profileController';
import { upload } from '../middlewares/upload';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.put('/me', authMiddleware, upload.single('avatar'), updateMyProfile); // UpdateProfile

export default router;
