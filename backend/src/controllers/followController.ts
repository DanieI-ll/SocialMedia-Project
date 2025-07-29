import { Request, Response } from 'express';
import { followUser, unfollowUser, getFollowers, getFollowing } from '../services/followService';

export const followController = async (req: Request, res: Response) => {
  try {
    const followerId = (req as any).user.id;
    const followingId = req.params.userId;
    const follow = await followUser(followerId, followingId);
    res.status(201).json(follow);
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};

export const unfollowController = async (req: Request, res: Response) => {
  try {
    const followerId = (req as any).user.id;
    const followingId = req.params.userId;
    await unfollowUser(followerId, followingId);
    res.json({ message: 'Отписано' });
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};

export const getFollowersController = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId === 'me' ? (req as any).user.id : req.params.userId;
    const followers = await getFollowers(userId);
    res.json({ count: followers.length, followers });
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};

export const getFollowingController = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId === 'me' ? (req as any).user.id : req.params.userId;
    const following = await getFollowing(userId);
    res.json({ count: following.length, following });
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};


