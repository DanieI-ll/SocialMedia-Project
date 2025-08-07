import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    avatar: {
      type: String,
      default: 'https://www.svgrepo.com/show/535711/user.svg',
    },
    resetPasswordToken: {
      type: String,
      default: null as any,
    },
    resetPasswordExpires: {
      type: Date,
      default: null as any,
    },
    description: { type: String, default: 'Hi, I am using Ichgram!' },
    website: { type: String },

    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      default: null,
    },
    verificationCodeExpires: {
      type: Date,
      default: null,
    },
  },

  { versionKey: false, timestamps: true },
);

interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  name?: string;
  avatar?: string;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  description?: string;
  website?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Хэшируем пароль перед сохранением
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  console.log('Hashing password:', this.password);
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Hashed password:', this.password);
    next();
  } catch (err) {
    next(err instanceof Error ? err : new Error(String(err)));
  }
});

// Метод сравнения пароля
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = model<IUser>('user', userSchema);

export default User;
