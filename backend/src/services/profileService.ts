import User from '../db/models/User';

export const getProfile = async (userId: string) => {
  const user = await User.findById(userId).select('-password');
  if (!user) throw new Error('Пользователь не найден');
  return user;
};

export const updateProfile = async (userId: string, data: { name?: string; avatar?: string }) => {
  const updated = await User.findByIdAndUpdate(userId, data, { new: true }).select('-password');
  if (!updated) throw new Error('Пользователь не найден');
  return updated;
};