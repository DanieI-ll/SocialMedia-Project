import User from '../db/models/User';
import { comparePasswords } from '../utils/hash';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const registerUser = async (data: { email: string; username: string; password: string; name: string; avatar?: string }) => {
  // Проверка email
  const existingEmail = await User.findOne({ email: data.email });
  if (existingEmail) {
    const err: any = new Error('This email is already taken.');
    err.field = 'email';
    throw err;
  }

  // Проверка username
  const existingUsername = await User.findOne({ username: data.username });
  if (existingUsername) {
    const err: any = new Error('This username is already taken.');
    err.field = 'username';
    throw err;
  }

  const user = new User(data);
  await user.save();
  return user;
};

export const loginUser = async (login: string, password: string) => {
  const user = await User.findOne({
    $or: [{ username: login }, { email: login }],
  });
  if (!user) throw new Error('User not found');

  if (!user.isVerified) {
    throw new Error('Please verify your email before logging in.');
  }

  const isValid = await comparePasswords(password, user.password);
  if (!isValid) throw new Error('Invalid password');

  const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
  return token;
};
