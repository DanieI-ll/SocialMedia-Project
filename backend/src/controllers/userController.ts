import { Request, Response } from 'express';
import User from '../db/models/User';
import Follow from '../db/models/Follow';
import { v2 as cloudinary } from 'cloudinary';

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    // website bilgisini body'den alın
    const { name, username, website } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

    if (req.file) {
      if (user.avatar) {
        const publicId = user.avatar.split('/').pop()?.split('.')[0];
        if (publicId) await cloudinary.uploader.destroy(`avatars/${publicId}`);
      }
      user.avatar = (req.file as any).path;
    }

    if (name) user.name = name;
    if (username) user.username = username;
    // Eğer website bilgisi gönderilmişse, kaydet
    if (website) user.website = website;

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

    // `select('-password')` ifadesi, şifre hariç diğer tüm alanları çekiyor.
    // Bu, `website` alanını da içerir.

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    let isFollowing = false;
    if (currentUserId && currentUserId !== userId) {
      const follow = await Follow.findOne({ follower: currentUserId, following: userId });
      isFollowing = !!follow;
    }

    // `user.toObject()` metodu, Mongoose dokümanındaki tüm verileri
    // düz bir JavaScript objesi olarak döndürür. Bu, `website` alanını da içerecektir.
    res.json({
      ...user.toObject(),
      isFollowing,
    });
  } catch (e) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
}
