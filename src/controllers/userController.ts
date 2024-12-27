import { Request, Response, NextFunction } from "express";
import User from "../models/user.model";
import jwt from "jsonwebtoken";
import bcrpyt from "bcrypt";
import dotenv from "dotenv";
import { AppError } from "../utils/AppError";

dotenv.config();

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const password = req.body.password
    const salt = await bcrpyt.genSalt(10);
    const hashedPassword = await bcrpyt.hash(password, salt);

    const doc = new User({
        user: req.body.user,
        telegram: req.body.telegram,
        passwordHash: hashedPassword
    });

    const user = await doc.save();

    const token = jwt.sign({ id: user._id }, 'process.env.JWT', {expiresIn: '30d'});

    const { passwordHash, ...userData } = user.toObject();

    res.status(201).json({
        status: 'success',
        data: {
            user: userData,
            token
        }
    });
  } catch (err) {
    next(err);
}};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findOne({ telegram: req.body.telegram });

        if(!user) {
            return next(new AppError('Логин или пароль неверный', 400));
        }

        const isValidPassword = await bcrpyt.compare(req.body.password, user.passwordHash);

        if(!isValidPassword) {
            return next(new AppError("Логин или пароль неверный", 400));
        }

        const token = jwt.sign({ _id: user._id }, 'process.env.JWT', {expiresIn: '30d'});

        const { passwordHash, ...userData } = user.toObject();

        res.json({
            status: 'success',
            data: {...userData, token}});

    } catch (err) {
        next(err);
    }
};