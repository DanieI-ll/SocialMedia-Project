import { Request, Response } from 'express';
import Notification from '../db/models/Notification';

export const getNotifications = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 }).populate('fromUser', 'username avatar').populate('postId', 'description image');
  res.json(notifications);
};

export const markAsRead = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  await Notification.deleteMany({ user: userId });
  res.json({ message: 'Уведомления отмечены как прочитанные' });
};
