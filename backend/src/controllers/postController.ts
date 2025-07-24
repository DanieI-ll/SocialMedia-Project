import { Request, Response } from 'express';
import { createPost, getAllPosts, getUserPosts, updatePost, deletePost } from '../services/postService';

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
  const posts = await getAllPosts();
  res.json(posts);
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
