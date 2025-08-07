import { Request, Response } from 'express';
import { getProfile, updateProfile } from '../services/profileService';

export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const user = await getProfile((req as any).user.id);
    res.json(user);
  } catch (err) {
    res.status(404).json({ message: (err as Error).message });
  }
};

export const updateMyProfile = async (req: Request, res: Response) => {
  try {
    const { name, username, description, website } = req.body;
    const userId = (req as any).user.id;

    let avatar = undefined;

    // Yeni dosya varsa Cloudinary URL'sini al
    if (req.file) {
      avatar = (req.file as any).path; // multer-storage-cloudinary'den direkt URL gelir
    }

    const updated = await updateProfile(userId, { name, username, avatar, description, website });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};
