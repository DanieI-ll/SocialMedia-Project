import { Schema, model } from 'mongoose';

const likeSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'post', required: true },
  },
  { versionKey: false, timestamps: true },
);

likeSchema.index({ user: 1, post: 1 }, { unique: true });

export default model('like', likeSchema);
