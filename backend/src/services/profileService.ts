import User from '../db/models/User';
import Post from '../db/models/Post'; // добавь импорт модели постов

export const getProfile = async (userId: string) => {
  const user = await User.findById(userId).select('-password').lean();
  if (!user) throw new Error('Пользователь не найден');

  // Получаем посты пользователя по author = userId
  const posts = await Post.find({ author: userId }).lean();

  // Возвращаем пользователя с постами
  return { ...user, posts };
};

export const updateProfile = async (userId: string, data: { name?: string; username?: string; avatar?: string; description?: string; website?: string }) => {
  const updated = await User.findByIdAndUpdate(userId, data, { new: true }).select('-password').lean();
  if (!updated) throw new Error('Пользователь не найден');
  return updated;
};
