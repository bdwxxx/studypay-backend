import { Request, Response, NextFunction, response } from "express";
import User from "../models/user.model";
import jwt from "jsonwebtoken";
import Order from "../models/order.model";
import bcrpyt from "bcrypt";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { AppError } from "../utils/AppError";

dotenv.config();

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findOne({ telegram: req.body.telegram });

        if (!user) {
            return next(new AppError("Пользователь не найден", 404));
        }

        const isValidPass = await bcrpyt.compare(req.body.password, user.passwordHash);

        if (!isValidPass) {
            return next(new AppError("Логин или пароль неверный", 401));
        }

        if (!user.role || user.role !== "admin" && user.role !== "owner") {
            return next(new AppError("Доступ запрещен: Только для администраторов", 403));
        }

        const token = jwt.sign({ id: user._id }, 'process.env.JWT', { expiresIn: "10d" });

        const { passwordHash, ...userData } = user.toObject();

        res.json({ token, ...userData });
    } catch (err) {
        next(new AppError("Неизвестная ошибка...", 500));
    };
};

export const checkRole = async (req: Request, res: Response, next: NextFunction) => {
        const { token } = req.body;

        if (!token) {
            return next(new AppError("Пожалуйста, авторизуйтесь", 401));
        }

    try {
        const decoded = jwt.verify(token, 'process.env.JWT' as string ) as { role: string };
        const { role } = decoded;

        if (role !== "admin" && role !== "owner") {
            return next(new AppError("Доступ запрещен: Только для администраторов", 403));
        }

        res.json(role);


            } catch (err) {
              next(new AppError("Внутрення ошибка сервера", 500));
            }
};