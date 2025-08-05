import { Schema, model } from 'mongoose';

const commentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'post', required: true },
    text: { type: String, required: true, maxlength: 500 },
    avatar: { type: String, default: '' },
  },
  { timestamps: true },
);

const Comment = model('comment', commentSchema);

export default Comment;
