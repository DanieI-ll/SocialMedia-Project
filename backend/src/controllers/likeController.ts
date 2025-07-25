import { Request, Response } from 'express';
import { toggleLike, getLikesCount } from '../services/likeService';

export const toggleLikeController = async (req: Request, res: Response) => {
  try {
    const result = await toggleLike((req as any).user.id, req.params.postId);
    res.json(result); // теперь возвращаем likedByUser и likesCount
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};

export const getLikesCountController = async (req: Request, res: Response) => {
  try {
    const count = await getLikesCount(req.params.postId);
    res.json({ count });
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};
