import Like from '../db/models/Like';
import Notification from '../db/models/Notification';
import Post from '../db/models/Post';

export const toggleLike = async (userId: string, postId: string) => {
  const existing = await Like.findOne({ user: userId, post: postId });

  if (existing) {
    await existing.deleteOne();
  } else {
    const like = new Like({ user: userId, post: postId });
    await like.save();

    // Уведомление автору поста
    const post = await Post.findById(postId);
    if (post && post.author.toString() !== userId) {
      await Notification.create({
        user: post.author,
        type: 'like',
        fromUser: userId,
        postId: post._id, // правильно: объект _id поста, а не postId как строка
        createdAt: new Date(),
      });
    }
  }

  // Возвращаем обновлённые данные
  const likesCount = await Like.countDocuments({ post: postId });
  const likedByUser = await Like.exists({ post: postId, user: userId });

  return {
    likedByUser: !!likedByUser,
    likesCount,
  };
};

export const getLikesCount = async (postId: string) => {
  return Like.countDocuments({ post: postId });
};
