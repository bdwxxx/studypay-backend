import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { AppError } from '../utils/AppError';
import dotenv from 'dotenv';

dotenv.config();

export const requestAI = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = 'process.env.APIAIKEY' as string;
    if (!apiKey) {
      return next(new AppError('API key is required', 401));
    }

    const { prompt } = req.body;
    if (!prompt) {
      return next(new AppError('Prompt is required', 400));
    }

    const models = ['gemini-1.5-pro', 'gemini-2.0-flash-thinking-exp-1219'];

    //! gemini-2.0-flash-thinking-exp-1219
    //! gemini-1.5-pro

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
  } catch (err) {
    next(new AppError('Error while requesting AI content', 500));
  }
};
