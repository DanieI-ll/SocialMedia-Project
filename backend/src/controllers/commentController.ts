import { Request, Response } from 'express';
import { addComment, getCommentsByPost } from '../services/commentService';

export const addCommentController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { postId, text } = req.body;
    if (!postId || !text) return res.status(400).json({ message: 'postId и text обязательны' });

    const comment = await addComment(userId, postId, text);
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};

export const getCommentsController = async (req: Request, res: Response) => {
  const postId = req.params.postId;
  const comments = await getCommentsByPost(postId);
  res.json(comments);
};
