import Post from '../db/models/Post';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/uploadToCloudinary';

export const createPost = async (authorId: string, description: string, filePath: string) => {
  const result = await uploadToCloudinary(filePath);
  const post = new Post({
    description,
    image: result.secure_url,
    author: authorId,
  });
  await post.save();
  return post;
};

export const getAllPosts = async () => Post.find().populate('author', 'username avatar');
export const getUserPosts = async (userId: string) => Post.find({ author: userId }).populate('author', 'username avatar');

export const updatePost = async (postId: string, userId: string, description?: string, filePath?: string) => {
  const post = await Post.findById(postId);
  if (!post) throw new Error('Пост не найден');
  if (post.author.toString() !== userId) throw new Error('Нет прав для редактирования');

  if (filePath) {
    const publicId = post.image.split('/').pop()?.split('.')[0] || '';
    await deleteFromCloudinary(publicId);
    const result = await uploadToCloudinary(filePath);
    post.image = result.secure_url;
  }
  if (description) post.description = description;

  await post.save();
  return post;
};

export const deletePost = async (postId: string, userId: string) => {
  const post = await Post.findById(postId);
  if (!post) throw new Error('Пост не найден');
  if (post.author.toString() !== userId) throw new Error('Нет прав для удаления');

  const publicId = post.image.split('/').pop()?.split('.')[0] || '';
  await deleteFromCloudinary(publicId);
  await post.deleteOne();
};
