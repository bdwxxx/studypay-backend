import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config();

interface AuthenticatedRequest extends Request {
  userId?: string;
}

interface DecodedToken {
    _id: string;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const token: string = (req.headers.authorization || "").replace(/Bearer\s?/, "");

    if (token) {
        try {
            const decoded: DecodedToken = jwt.verify(token, process.env.JWT as string) as DecodedToken;
            req.userId = decoded._id;
            next();
        } catch (e) {
            res.status(403).json({
                message: "FORBIEEDEN",
            });
        }
    } else {
        res.status(403).json({
            message: "FORBIEEDEN",
        });
    }
};
