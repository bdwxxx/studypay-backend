import { Request, Response, NextFunction, response } from 'express';
import User from '../models/user.model';
import jwt from 'jsonwebtoken';
import Order from '../models/order.model';
import bcrpyt from 'bcrypt';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError';

dotenv.config();

/**
 * Получение данных пользователя
 * @method GET
 * @param {string} authorization - Bearer токен в заголовке
 */
export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Токен не предоставлен или имеет неправильный формат', 401));
    }

    const token = authHeader.replace('Bearer ', '');

    const decodedToken = jwt.verify(token, 'process.env.JWT' as string) as {
      _id: string;
    };

    const user = await User.findById(decodedToken._id).select('user role');

    if (!user) {
      return next(new AppError('Пользователь не найден', 404));
    }

    if (!['admin', 'owner'].includes(user.role)) {
      res.json({
        user: user.user,
      });
    } else {
      res.json({
        user: user.user,
        role: user.role,
      });
    }
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === 'JsonWebTokenError') {
        return next(new AppError('Неверный токен. Пожалуйста, войдите снова!', 401));
      }
      if (err.name === 'TokenExpiredError') {
        return next(new AppError('Срок действия токена истек. Пожалуйста, войдите снова!', 401));
      }
    }
    next(err);
  }
};

/**
 * Получение телеграма пользователя
 * @method GET
 * @param {string} authorization - Bearer токен в заголовке
 */
export const getTelegram = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Токен не предоставлен или имеет неправильный формат', 401));
    }

    const token = authHeader.replace('Bearer ', '');

    const decodedToken = jwt.verify(token, 'process.env.JWT' as string) as {
      _id: string;
    };

    const telegram = await User.findById(decodedToken._id).select('telegram');

    if (!telegram) {
      return next(new AppError('Пользователь не найден', 404));
    }

    res.json({
      telegram: telegram.telegram,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Проверка верификации пользователя
 * @method GET
 * @param {string} authorization - Bearer токен в заголовке
 */
export const verified = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Токен не предоставлен или имеет неправильный формат', 401));
    }

    const token = authHeader.replace('Bearer ', '');

    const decodedToken = jwt.verify(token, 'process.env.JWT' as string) as {
      _id: string;
    };

    const user = await User.findById(decodedToken._id).select('isVerified');

    if (!user) {
      return next(new AppError('Пользователь не найден', 404));
    }

    res.json({
      isVerified: user.isVerified,
    });
  } catch (err) {
    next(err);
  }
};
