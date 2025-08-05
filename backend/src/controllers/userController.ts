import { Request, Response } from 'express';
import User from '../db/models/User';
import Follow from '../db/models/Follow';
import { v2 as cloudinary } from 'cloudinary';

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, username } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

    if (req.file) {
      // Eski avatar varsa sil
      if (user.avatar) {
        const publicId = user.avatar.split('/').pop()?.split('.')[0];
        if (publicId) await cloudinary.uploader.destroy(`avatars/${publicId}`);
      }
      user.avatar = (req.file as any).path; // Yeni URL
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
    const userId = req.params.userId;
    const currentUserId = (req as any).user?.id; // authMiddleware sayesinde
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    let isFollowing = false;
    if (currentUserId && currentUserId !== userId) {
      const follow = await Follow.findOne({ follower: currentUserId, following: userId });
      isFollowing = !!follow;
    }

    res.json({
      ...user.toObject(),
      isFollowing,
    });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
}
