import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

export interface AuthenticatedRequest extends Request {
  userId?: string;
  role?: string;
}

interface DecodedToken {
  _id: string;
  role?: string;
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const token: string = (req.headers.authorization || '').replace(/Bearer\s?/, '');

  if (token) {
    try {
      const decoded: DecodedToken = jwt.verify(token, 'process.env.JWT' as string) as DecodedToken;
      req.userId = decoded._id;
      req.role = decoded.role;
      next();
    } catch {
      res.status(403).json({
        message: 'Авторизуйтесь',
      });
    }
  } else {
    res.status(403).json({
      message: 'Авторизуйтесь',
    });
  }
};
