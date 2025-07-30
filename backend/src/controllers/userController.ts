import { Request, Response } from 'express';
import User from '../db/models/User';
import { v2 as cloudinary } from 'cloudinary';

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, username } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

    // Если загружен новый аватар — удаляем старый из Cloudinary
    if (req.file && user.avatar) {
      const publicId = user.avatar.split('/').pop()?.split('.')[0]; // достаем public_id
      if (publicId) await cloudinary.uploader.destroy(`avatars/${publicId}`);
      user.avatar = (req.file as any).path; // новый URL из Cloudinary
    }

    if (name) user.name = name;
    if (username) user.username = username;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении профиля' });
  }
};

export async function getUserByIdController(req: Request, res: Response) {
  try {
    const user = await User.findById(req.params.userId).select('-password'); // без пароля
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
}
