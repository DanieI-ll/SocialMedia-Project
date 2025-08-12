import { Request, Response } from 'express';
import { followUser, unfollowUser, getFollowers, getFollowing } from '../services/followService';

import Follow from '../db/models/Follow';
import User from '../db/models/User';

export const followController = async (req: Request, res: Response) => {
  try {
    const followerId = (req as any).user.id;
    const followingId = req.params.userId;
    const follow = await followUser(followerId, followingId);

    const followers = await getFollowers(followingId);
    res.status(201).json({ follow, followers, isFollowing: true });
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};

export const unfollowController = async (req: Request, res: Response) => {
  try {
    const followerId = (req as any).user.id;
    const followingId = req.params.userId;
    await unfollowUser(followerId, followingId);

    const followers = await getFollowers(followingId)
    res.json({ message: 'Отписано', followers, isFollowing: false });
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

export const getProfileController = async (req: Request, res: Response) => {
  try {
    const myId = (req as any).user.id;
    const userId = req.params.id;

    const user = await User.findById(userId).select('username avatar description');
    if (!user) return res.status(404).json({ message: 'User doesnt exist' });

    const isFollowing = await Follow.exists({ follower: myId, following: userId });

    res.json({
      ...user.toObject(),
      isFollowing: !!isFollowing,
    });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};
