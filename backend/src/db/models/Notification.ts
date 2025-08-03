import { Schema, model } from 'mongoose';

const notificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  type: { type: String, enum: ['like', 'comment', 'follow'], required: true },
  fromUser: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  postId: { type: Schema.Types.ObjectId, ref: 'Post' },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});

const Notification = model('Notification', notificationSchema);

export default Notification;
