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
    const { name, username, avatar, description } = req.body;
    const updated = await updateProfile((req as any).user.id, { name, username, avatar, description });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};
