import { Schema, model, Types } from 'mongoose';

const postSchema = new Schema(
  {
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    image: {
      type: String,
      required: true,
    },
    author: {
      type: Types.ObjectId,
      ref: 'user',
      required: true,
    },
  },
  { versionKey: false, timestamps: true },
);

const Post = model('Post', postSchema);

export default Post;
