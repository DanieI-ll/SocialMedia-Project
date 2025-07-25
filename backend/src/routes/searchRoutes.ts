import { Router, Request, Response } from 'express';
import User from '../db/models/User';

const router = Router();

router.get('/search', async (req: Request, res: Response) => {
  const query = req.query.name?.toString() || '';
  if (!query) return res.status(400).json({ message: 'Query не указан' });

  const users = await User.find({
    $or: [{ name: { $regex: query, $options: 'i' } }, { username: { $regex: query, $options: 'i' } }],
  }).select('username name avatar');

  res.json(users);
});

export default router;
