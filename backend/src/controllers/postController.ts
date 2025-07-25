import { Request, Response } from 'express';
import { createPost, getAllPosts, getUserPosts, updatePost, deletePost } from '../services/postService';
import Like from '../db/models/Like';

export const createPostController = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Файл обязателен' });
    const post = await createPost((req as any).user.id, req.body.description, req.file.path);
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};

export const getPostsController = async (req: Request, res: Response) => {
  try {
    const posts = await getAllPosts();
    const userId = (req as any).user?.id;

    // добавляем количество лайков и статус лайка пользователя
    const postsWithLikes = await Promise.all(
      posts.map(async (post: any) => {
        const likesCount = await Like.countDocuments({ post: post._id });
        const likedByUser = userId ? !!(await Like.findOne({ post: post._id, user: userId })) : false;
        return {
          ...post.toObject(),
          likesCount,
          likedByUser,
        };
      })
    );

    res.json(postsWithLikes);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка загрузки постов' });
  }
};

export const getUserPostsController = async (req: Request, res: Response) => {
  const posts = await getUserPosts(req.params.userId);
  res.json(posts);
};

export const updatePostController = async (req: Request, res: Response) => {
  try {
    const post = await updatePost(req.params.postId, (req as any).user.id, req.body.description, req.file?.path);
    res.json(post);
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};

export const deletePostController = async (req: Request, res: Response) => {
  try {
    await deletePost(req.params.postId, (req as any).user.id);
    res.json({ message: 'Пост удалён' });
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};
