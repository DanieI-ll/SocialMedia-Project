import Follow from '../db/models/Follow';
import Notification from '../db/models/Notification';

export const followUser = async (followerId: string, followingId: string) => {
  if (followerId === followingId) throw new Error('Нельзя подписаться на себя');
  const exists = await Follow.findOne({ follower: followerId, following: followingId });
  if (exists) throw new Error('Уже подписаны');

  const follow = new Follow({ follower: followerId, following: followingId });
  await follow.save();

  // Создание уведомления для пользователя, на которого подписались
  await Notification.create({
    user: followingId, // получатель уведомления
    type: 'follow',
    fromUser: followerId,
    createdAt: new Date(),
  });

  return follow;
};

export const unfollowUser = async (followerId: string, followingId: string) => {
  const follow = await Follow.findOneAndDelete({ follower: followerId, following: followingId });
  if (!follow) throw new Error('Подписка не найдена');
};

export const getFollowers = async (userId: string) => Follow.find({ following: userId }).populate('follower', 'username avatar');

export const getFollowing = async (userId: string) => Follow.find({ follower: userId }).populate('following', 'username avatar');
