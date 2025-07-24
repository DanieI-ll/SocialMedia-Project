import { Schema, model } from 'mongoose';

const followSchema = new Schema(
  {
    follower: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    following: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  },
  { timestamps: true },
);

const Follow = model('follow', followSchema);
export default Follow;
