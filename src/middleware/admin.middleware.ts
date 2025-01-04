import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

import dotenv from 'dotenv';
dotenv.config();

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const adminMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');

  if (token) {
    try {
      const decoded = jwt.verify(token, 'process.env.JWT' as string) as {
        _id: string;
        role: string;
      };
      console.log('Decoded token:', decoded);
      req.userId = decoded._id;

      if (decoded.role !== 'admin' && decoded.role !== 'owner') {
        res.status(403).json({ message: 'FORBIEEDEN: ONLY FOR ADMINS' });
      } else {
        next();
      }
    } catch (e) {
      console.error('Error verifying token:', e);
      res.status(403).json({ message: 'FORBIEEDEN: ONLY FOR ADMINS' });
    }
  } else {
    res.status(403).json({ message: 'FORBIEEDEN: ONLY FOR ADMINS' });
  }
};
