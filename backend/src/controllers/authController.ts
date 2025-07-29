import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/authService';
import { validateRegister } from '../utils/validate';

export const register = async (req: Request, res: Response) => {
  try {
    const errors = validateRegister(req.body);
    if (errors.length) return res.status(400).json({ errors });

    const user = await registerUser(req.body);
    res.status(201).json({ user });
  } catch (err: any) {
    // Eğer service'ten field gelirse
    if (err.field) {
      return res.status(400).json({ field: err.field, message: err.message });
    }
    res.status(400).json({ message: err.message || 'Ошибка регистрации' });
  }
};


export const login = async (req: Request, res: Response) => {
  try {
    const { login, password } = req.body;
    if (!login || !password) return res.status(400).json({ message: 'Введите логин/почту и пароль' });

    const token = await loginUser(login, password);
    res.json({ token });
  } catch (err) {
    res.status(401).json({ message: (err as Error).message });
  }
};
