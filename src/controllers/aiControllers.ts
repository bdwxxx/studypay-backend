import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { AppError } from '../utils/AppError';
import dotenv from 'dotenv';
import User from '../models/user.model';
import TelegramModel from '../models/telegram.model';
import jwt from 'jsonwebtoken';
import { bot } from '../server';

dotenv.config();

export const buyAI = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { period, price } = req.body;
    const token = req.headers.authorization?.replace(/Bearer\s?/, '');

    if (!period || !price) {
      return next(new AppError('Days are required', 400));
    }

    if (!token) {
      return next(new AppError('Token is required', 401));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, 'process.env.JWT' as string) as { _id: string };
    } catch {
      return next(new AppError('Invalid token', 401));
    }

    const user = await User.findById(decoded._id).exec();

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const ownerTelegram = await User.findOne({ role: 'owner' }).select('telegram').exec();
    if (!ownerTelegram) {
      return next(new AppError('Owner not found', 404));
    }

    const telegram = await TelegramModel.findOne({ telegram: ownerTelegram.telegram })
      .select('chatId')
      .exec();

    // Парсинг поля period
    const periodMatch = period.match(/^(days|week|month)$/);
    if (!periodMatch) {
      return next(new AppError('Invalid period format', 400));
    }

    let periodNormalized;
    switch (periodMatch[1]) {
      case 'days':
        periodNormalized = 'день';
        break;
      case 'week':
        periodNormalized = 'неделю';
        break;
      case 'month':
        periodNormalized = 'месяц';
        break;
    }

    try {
      await bot.sendMessage(
        telegram?.chatId as number,
        `*💸 Пришла оплата AI\\!*\n\n` +
          `*🐊 Пользователь:* \`${user.user}\` \\| \`TG: @${user.telegram}\`\n` +
          `*⏳ Период:* \`${periodNormalized}\`\n` +
          `*💰 Цена:* \`${price} UAH\`\n\n` +
          `_Пожалуйста, подтвердите оплату или отмените заказ\\._\n\n` +
          `*📅 Дата:* \`${new Date().toLocaleDateString()}\`\n` +
          `*🕒 Время:* \`${new Date().toLocaleTimeString()}\``,
        {
          parse_mode: 'MarkdownV2',
          reply_markup: {
            inline_keyboard: [
              [
                { text: 'Подтвердить заказ', callback_data: 'confirm_order' },
                { text: 'Отменить заказ', callback_data: 'cancel_order' },
              ],
            ],
          },
        }
      );
    } catch (error) {
      return next(new AppError((error as Error).message, 500));
    }

    res.status(200).json({
      status: 'success',
      message: 'Ожидайте подтверждение платежа от администратора',
    });
  } catch {
    next();
  }
};

export const requestAI = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = process.env.APIAIKEY as string;
    if (!apiKey) {
      return next(new AppError('API key is required', 401));
    }

    const { prompt } = req.body;
    if (!prompt) {
      return next(new AppError('Prompt is required', 400));
    }

    const models = ['gemini-2.0-flash-exp', 'gemini-2.0-flash-thinking-exp-1219'];

    //! gemini-2.0-flash-exp
    //! gemini-2.0-flash-thinking-exp-1219

    let response;
    for (const model of models) {
      try {
        response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        break; // Если запрос успешен, выходим из цикла
      } catch (err) {
        const error = err as Error;
        console.error(`Error with model ${model}:`, error.message);
        // Если это последняя модель в списке, пробрасываем ошибку дальше
        if (model === models[models.length - 1]) {
          return next(new AppError('Error while requesting AI content', 500));
        }
      }
    }

    if (response) {
      res.status(200).json({
        status: 'success',
        data: response.data,
      });
    } else {
      next(new AppError('No response received from AI models', 500));
    }
  } catch {
    next(new AppError('Error while requesting AI content', 500));
  }
};

export const checkAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return next(new AppError('Please authenticate', 401));
    }

    const accessAI = await User.findOne({}).select('aiAccessUntil').exec();

    if (!accessAI) {
      return next(new AppError('Access denied', 403));
    }

    res.status(200).json({
      status: 'success',
      data: accessAI,
    });
  } catch {
    next(new AppError('Unknown error...', 500));
  }
};
