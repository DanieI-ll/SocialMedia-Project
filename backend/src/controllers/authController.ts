import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/authService';
import { validateRegister } from '../utils/validate';

import crypto from 'crypto';
import User from '../db/models/User';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';

export const register = async (req: Request, res: Response) => {
  try {
    const errors = validateRegister(req.body);
    if (errors.length) return res.status(400).json({ errors });

    const user = await registerUser(req.body);

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    user.verificationCode = code;
    user.verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 dakika geçerli
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
    });

    await transporter.sendMail({
      to: user.email,
      subject: 'Ichgram Email Verification Code',
      html: `<p>Your verification code is: <b>${code}</b><br/>This code is valid for 15 minutes.</p>`,
    });

    res.status(201).json({ user });
  } catch (err: any) {
    if (err.field) {
      return res.status(400).json({ field: err.field, message: err.message });
    }
    res.status(400).json({ message: err.message || 'Ошибка регистрации' });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ message: 'Email ve kod gerekli' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });

    if (user.verificationCode !== code || !user.verificationCodeExpires || user.verificationCodeExpires < new Date()) {
      return res.status(400).json({ message: 'Doğrulama kodu hatalı veya süresi dolmuş' });
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();

    res.json({ message: 'E-posta başarıyla doğrulandı' });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
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

// Şifre sıfırlama isteği (token üret)
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { emailOrUsername } = req.body;
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Token üret
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 saat geçerli
    await user.save();

    // Mail ayarı (örn. Gmail; kendi ayarını koy)
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset/${token}`;

    await transporter.sendMail({
      to: user.email,
      subject: 'Password reset',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link will expire in 1 hour.</p>`,
    });

    res.json({ message: 'Password reset email sent.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Şifreyi token ile yenile (hashleme kaldırıldı, sadece test için!)
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    // HASHLEME YOK (sadece test amaçlı)
    user.password = newPassword;

    user.resetPasswordToken = null as any;
    user.resetPasswordExpires = null as any;
    await user.save();

    res.json({ message: 'Password has been updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
