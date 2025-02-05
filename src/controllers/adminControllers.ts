import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError';
import User from '../models/user.model';
import Order from '../models/order.model';
import Category from '../models/category.model';

dotenv.config();

/**
 * Проверка роли пользователя
 * @method post
 * @param req
 * @param res
 * @param next
 */
export const checkRole = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace(/Bearer\s?/, '');

  if (!token) {
    return next(new AppError('Пожалуйста, авторизуйтесь', 401));
  }

  try {
    const decoded = jwt.verify(token, 'process.env.JWT' as string) as { role: string };
    const { role } = decoded;

    if (role === 'admin' || role === 'owner') {
      res.json({ role });
    } else {
      res.sendStatus(204); // TODO: check this
    }
  } catch {
    next(new AppError('Внутрення ошибка сервера', 500));
  }
};

/**
 * Показать все оплаченные заказы
 * @method GET
 */
export const showAllOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await Order.find({ status: 'Оплачен' })
      .populate({ path: 'user', model: 'User', select: 'user' })
      .exec();

    const ordersWithUser = orders.map((order) => {
      const discountPrice = order.price * 0.85; // 15% discount
      return {
        ...order.toObject(),
        discountPrice,
        user:
          order.user && typeof order.user !== 'string'
            ? (order.user as any).user
            : 'Пользователь неизвестен',
      };
    });

    res.status(200).json(ordersWithUser);
  } catch (err) {
    next(err);
  }
};

/**
 * Взять заказ в работу
 * @method POST
 * @param {string} orderId - ID заказа
 * @param {string} authorization - Bearer токен
 */
export const takeOrder = async (req: Request, res: Response, next: NextFunction) => {
  const { orderId } = req.params;
  const token = req.headers.authorization?.replace(/Bearer\s?/, '');

  if (!token) {
    return next(new AppError('unAuthorization', 401));
  }

  try {
    const decoded = jwt.verify(token, 'process.env.JWT' as string) as { _id: string };
    const adminId = new mongoose.Types.ObjectId(decoded._id);

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return next(new AppError('Invalid orderId', 400));
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    if (order.status !== 'Оплачен') {
      return next(new AppError('Order is not paid', 400));
    }

    order.status = 'В процессе выполнения';
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
  const token = (req.headers.authorization as string).replace(/Bearer\s?/, '');

  if (!token) {
    return next(new AppError('Пожалуйста, авторизуйтесь', 401));
  }

  try {
    const decoded = jwt.verify(token, 'process.env.JWT' as string) as { _id: string };

    const adminId = decoded._id;

    const orders = await Order.find({
      admin: adminId,
      status: {
        $in: ['В процессе выполнения', 'На проверки', 'Требуется исправлений', 'Готов к передаче'],
      },
    })
      .populate({ path: 'user', model: 'User', select: 'user' })
      .exec();

    const ordersWithUser = orders.map((order) => {
      const discountPrice = order.price * 0.85; // 15% discount
      return {
        ...order.toObject(),
        discountPrice,
        user:
          order.user && typeof order.user !== 'string'
            ? (order.user as any).user
            : 'Пользователь неизвестен',
      };
    });

    res.status(200).json(ordersWithUser);
  } catch (err) {
    next(err);
  }
};

/**
 * Получить детальную информацию о заказе
 * @method GET
 * @param {string} orderId - ID заказа
 */
export const orderDetailed = async (req: Request, res: Response, next: NextFunction) => {
  const { orderId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return next(new AppError('Invalid orderId', 400));
  }

  try {
    const order = await Order.findById(orderId)
      .populate({ path: 'user', model: 'User', select: 'user' })
      .exec();

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    const discountPrice = order.price * 0.85; // 15% discount

    const ordersWithUser = {
      ...order.toObject(),
      discountPrice,
      user:
        order.user && typeof order.user !== 'string'
          ? (order.user as any).user
          : 'Пользователь неизвестен',
    };

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

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return next(new AppError('Invalid order id', 400));
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

export const addCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, description, services } = req.body;

    // Проверка наличия необходимых данных
    if (!category || !description || !services) {
      return next(new AppError('Все поля (category, description, services) обязательны', 400));
    }

    // Создание новой категории
    const newCategory = new Category({
      category,
      description,
      services,
    });

    // Сохранение категории в базе данных
    await newCategory.save();

    res.status(201).json({
      status: 'success',
      data: newCategory,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await Order.find()
      .populate('user', 'username')
      .populate('category', 'category') // Пополнение категории для получения её имени
      .lean();

    const ordersWithUsername = await Promise.all(
      orders.map(async (order) => {
        // Находим данные админа по ObjectId из заказа
        const adminData = await User.findById(order.admin).lean();

        const discountPrice = order.price * 0.85; // 15% discount

        return {
          ...order,
          user: (order.user as any).username, // Заменяем ObjectId пользователя на никнейм
          admin: adminData ? adminData.user : order.admin, // Заменяем ObjectId админа на никнейм или оставляем ObjectId, если данные админа не найдены
          category: (order.category as any).category, // Заменяем ObjectId категории на её имя
          price: discountPrice,
        };
      })
    );

    res.status(200).json(ordersWithUsername);
  } catch (err) {
    next(err);
  }
};
