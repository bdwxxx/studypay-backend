import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

import dotenv from 'dotenv';
dotenv.config();

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const ownerMiddleware = (
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

      if (decoded.role === 'owner') {
        next();
      } else {
        res.status(403).json({ message: 'FORBIEEDEN' });
      }
    } catch (e) {
      console.error('Error verifying token:', e);
      res.status(403).json({ message: 'FORBIEEDEN' });
    }
  } else {
    res.status(403).json({ message: 'FORBIEEDEN' });
  }
};
