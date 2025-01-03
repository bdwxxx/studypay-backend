import { Request, Response, NextFunction, response } from "express";
import User from "../models/user.model";
import jwt from "jsonwebtoken";
import Order from "../models/order.model";
import bcrpyt from "bcrypt";
import dotenv from "dotenv";
import mongoose, { ObjectId } from "mongoose";
import { AppError } from "../utils/AppError";

dotenv.config();

/**
 * Авторизация админа
 * @method POST
 * @param {string} telegram - Телеграм
 * @param {string} password - Пароль
 */
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

        const token = jwt.sign({ id: user._id, role: user.role }, 'process.env.JWT', { expiresIn: "10d" });

        const { passwordHash, ...userData } = user.toObject();

        res.json({ token, ...userData });
    } catch (err) {
        next(new AppError("Неизвестная ошибка...", 500));
    };
};

/**
 * Проверка роли пользователя
 * @method POST
 * @param {string} token - JWT токен
 */
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

/**
 * Показать все оплаченные заказы
 * @method GET
 */
export const showAllOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orders = await Order.find({ status: "Оплачен" }).populate({ path: "user", model: "User", select: "user" }).exec();

        const ordersWithUser = orders.map((order) => {
            const discountPrice = order.price * 0.85; // 15% discount
            return {
                ...order.toObject(),
                discountPrice,
                user: order.user && typeof order.user !== 'string' ? (order.user as any).user : "Пользователь неизвестен"
            }
        });

        res.status(200).json(ordersWithUser);
    } catch (err) {
        next(err)
    }
};

/**
 * Взять заказ в работу
 * @method POST
 * @param {string} orderId - ID заказа
 * @param {string} authorization - Bearer токен
 */
export const takeOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { orderId } = req.body;
  const token = req.headers.authorization?.replace(/Bearer\s?/, "");

  if (!token) {
    return next(new AppError("unAuthorization", 401));
  }

  try {
    const decoded = jwt.verify(
      token,
      "process.env.JWT" as string
    ) as { _id: string };
    const adminId = new mongoose.Types.ObjectId(decoded._id);

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return next(new AppError("Invalid orderId", 400));
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    if (order.status !== "Оплачен") {
      return next(new AppError("Order is not paid", 400));
    }

    order.status = "В процессе выполнения";
    order.admin = adminId;
    await order.save();

    res.status(200).json(order);
  } catch (err) {
    next(err);
  }
};

/**
 * Получить заказы в работе у админа
 * @method GET
 * @param {string} authorization - Bearer токен
 */
export const workOrder = async (req: Request, res: Response, next: NextFunction) => {
  const token = (req.headers.authorization as string).replace(/Bearer\s?/, "");

  if (!token) {
      return next(new AppError("Пожалуйста, авторизуйтесь", 401));
    }

  
      try {
        const decoded = jwt.verify(token, 'process.env.JWT' as string) as { _id: string };

        const adminId = decoded._id;

        const orders = await Order.find({
          admin: adminId,
          status: {
            $in: [
              "В процессе выполнения",
              "На проверки",
              "Требуется исправлений",
              "Готов к передаче",
            ],
          },
        }).populate({ path: 'user', model: 'User', select: 'user' }).exec();

        const ordersWithUser = orders.map((order) => {
          const discountPrice = order.price * 0.85; // 15% discount
          return {
            ...order.toObject(),
            discountPrice,
            user:
              order.user && typeof order.user !== "string"
                ? (order.user as any).user
                : "Пользователь неизвестен",
          };
        });

        res.status(200).json(ordersWithUser);
    } catch (err) {
      next(err);
  };
};

/**
 * Получить детальную информацию о заказе
 * @method GET
 * @param {string} orderId - ID заказа
 */
export const orderDetailed = async (req: Request, res: Response, next: NextFunction) => {
  
  const { orderId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return next(new AppError("Invalid orderId", 400));
      }


  try {
      
    const order = await Order.findById(orderId).populate({ path: 'user', model: 'User', select: 'user' }).exec();

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    const discountPrice = order.price * 0.85; // 15% discount

    const ordersWithUser = {
      ...order.toObject(),
      discountPrice,
      user: order.user && typeof order.user !== "string" ? (order.user as any).user : "Пользователь неизвестен"
    }




    res.status(200).json(ordersWithUser);
  } catch (err) {
    next(err);
  }
};

/**
 * Изменить статус заказа
 * @method PATCH
 * @param {string} orderId - ID заказа
 * @param {string} newStatus - Новый статус
 */
export const changeOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  const { orderId, newStatus } = req.body;

  if(!mongoose.Types.ObjectId.isValid(orderId)) {
    return next(new AppError("Invalid order id", 400));
  }
  
  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    order.status = newStatus;
    await order.save();


    res.status(200).json({ message: 'Статус заказа успешно изменен', order });
  } catch (err) {
    next(err);
  }
};