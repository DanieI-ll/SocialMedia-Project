import Comment from '../db/models/Comment';
import Notification from '../db/models/Notification';
import Post from '../db/models/Post';

export const addComment = async (userId: string, postId: string, text: string) => {
  const comment = new Comment({ user: userId, post: postId, text });
  await comment.save();

  const post = await Post.findById(postId);
  if (post && post.author.toString() !== userId) {
    await Notification.create({
      user: post.author, // получатель уведомления
      type: 'comment',
      fromUser: userId,
      postId: post._id, // здесь правильно — ссылка на объект post
      createdAt: new Date(),
    });
  }

  return comment.populate('user', 'username avatar isBlueVerified');
};

export const getCommentsByPost = async (postId: string) => {
  return Comment.find({ post: postId }).populate('user', 'username avatar isBlueVerified').sort({ createdAt: -1 });
};
