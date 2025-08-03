import { Request, Response } from 'express';
import Notification from '../db/models/Notification';

export const getNotifications = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 }).populate('fromUser', 'username avatar').populate('postId', 'description image');
  res.json(notifications);
};

export const markAsRead = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  await Notification.updateMany({ user: userId, read: false }, { $set: { read: true } });
  res.json({ message: 'Уведомления отмечены как прочитанные' });
};

export const deleteNotification = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;
  await Notification.deleteOne({ _id: id, user: userId });
  res.json({ message: 'Notification deleted' });
};
