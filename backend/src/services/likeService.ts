import Like from '../db/models/Like';
import Notification from '../db/models/Notification';
import Post from '../db/models/Post';

export const toggleLike = async (userId: string, postId: string) => {
  const existing = await Like.findOne({ user: userId, post: postId });
  if (existing) {
    await existing.deleteOne();
    return { liked: false };
  }

  const like = new Like({ user: userId, post: postId });
  await like.save();

  // Получаем пост для уведомления автора
  const post = await Post.findById(postId);
  if (post && post.author.toString() !== userId) {
    await Notification.create({
      user: post.author, // кому уведомление
      type: 'like',
      fromUser: userId,
      post: postId,
      createdAt: new Date(),
    });
  }

  return { liked: true };
};

export const getLikesCount = async (postId: string) => {
  return Like.countDocuments({ post: postId });
};
