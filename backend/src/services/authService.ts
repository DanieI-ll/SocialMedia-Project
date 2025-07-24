import User from '../db/models/User';
import { comparePasswords } from '../utils/hash';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const registerUser = async (data: { email: string; username: string; password: string; name: string; avatar?: string }) => {
  const user = new User(data);
  await user.save();
  return user;
};

export const loginUser = async (login: string, password: string) => {
  const user = await User.findOne({
    $or: [{ username: login }, { email: login }],
  });
  if (!user) throw new Error('User not found');

  // console.log('Введённый пароль:', password);
  // console.log('Хеш из БД:', user.password);

  const isValid = await comparePasswords(password, user.password);
  // console.log('Результат сравнения:', isValid);

  if (!isValid) throw new Error('Invalid password');

  const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
  return token;
};

