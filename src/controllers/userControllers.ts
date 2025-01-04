import { Request, Response, NextFunction, response } from 'express';
import User from '../models/user.model';
import jwt from 'jsonwebtoken';
import Order from '../models/order.model';
import bcrpyt from 'bcrypt';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError';

dotenv.config();

/**
 * Регистрация нового пользователя
 * @method POST
 * @param {string} user - Имя пользователя
 * @param {string} telegram - Телеграм
 * @param {string} password - Пароль
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, telegram, password } = req.body;

    // Проверка на уникальность имени пользователя и Telegram
    const existingUser = await User.findOne({ $or: [{ user }, { telegram }] });
    if (existingUser) {
      return next(new AppError('Пользователь с таким именем или Telegram уже существует', 400));
    }

    const salt = await bcrpyt.genSalt(10);
    const hashedPassword = await bcrpyt.hash(password, salt);

    const doc = new User({
      user,
      telegram,
      passwordHash: hashedPassword,
    });

    const newUser = await doc.save();

    const token = jwt.sign({ id: newUser._id }, 'process.env.JWT' as string, { expiresIn: '30d' });

    const { passwordHash, ...userData } = newUser.toObject();

    res.status(200).json({
      status: 'success',
      data: {
        user: userData,
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Авторизация пользователя
 * @method POST
 * @param {string} telegram - Телеграм
 * @param {string} password - Пароль
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findOne({ telegram: req.body.telegram });

    if (!user) {
      return next(new AppError('Логин или пароль неверный', 400));
    }

    const isValidPassword = await bcrpyt.compare(req.body.password, user.passwordHash);

    if (!isValidPassword) {
      return next(new AppError('Логин или пароль неверный', 400));
    }

    const token = jwt.sign({ _id: user._id }, 'process.env.JWT', { expiresIn: '30d' });

    const { passwordHash, ...userData } = user.toObject();

    console.log(`Authorization: ${user}`, token);

    res.json({
      status: 'success',
      data: { ...userData, token },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Создание нового заказа
 * @method POST
 * @param {string} user - ID или имя пользователя
 * @param {string} telegram - Телеграм
 * @param {string} detailedDescription - Описание заказа
 * @param {number} price - Цена
 */
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, telegram, detailedDescription, price } = req.body;

    // Проверка наличия необходимых полей
    if (!user || !telegram || !detailedDescription || !price) {
      return next(new AppError('Все поля обязательны для заполнения', 400));
    }

    // Проверка валидности идентификатора пользователя
    let userId;
    if (mongoose.Types.ObjectId.isValid(user)) {
      userId = user;
    } else {
      const foundUser = await User.findOne({ user });
      if (!foundUser) {
        return next(new AppError('Пользователь не найден', 404));
      }
      userId = foundUser._id;
    }

    // Проверка верификации пользователя
    const verifiedUser = await User.findById(userId);
    if (!verifiedUser || !verifiedUser.isVerified) {
      return next(new AppError('Пользователь не верифицирован', 403));
    }

    // Создание нового заказа
    const order = new Order({
      user: userId,
      telegram,
      detailedDescription,
      price,
    });

    // Сохранение заказа
    const savedOrder = await order.save();

    res.status(200).json({
      status: 'success',
      data: {
        order: savedOrder,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Получение личных заказов пользователя
 * @method GET
 * @param {string} authorization - Bearer токен в заголовке
 */
export const getPersonalOrder = async (req: Request, res: Response, next: NextFunction) => {
  const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');

  if (token) {
    try {
      const decoded = jwt.verify(token, 'process.env.JWT' as string) as {
        _id: string;
      };

      const user = await User.findById(decoded._id);

      if (!user) {
        return next(new AppError('Пользователь не найден', 404));
      }

      const orders = await Order.find({ user: user._id }).populate('user', 'username').lean();

      const ordersWithUsername = await Promise.all(
        orders.map(async (order) => {
          // Находим данные админа по ObjectId из заказа
          const adminData = await User.findById(order.admin).lean();

          return {
            ...order,
            user: (order.user as any).username, // Заменяем ObjectId пользователя на никнейм
            admin: adminData ? adminData.user : order.admin, // Заменяем ObjectId админа на никнейм или оставляем ObjectId, если данные админа не найдены
          };
        })
      );

      res.status(200).json(ordersWithUsername);
    } catch (err) {
      next(err);
    }
  } else {
    next(new AppError('No token provided', 401));
  }
};

/**
 * Получение уведомления о заказе
 * @method GET
 * @param {string} orderId - ID заказа
 */
export const orderNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    const user = await User.findById(order.user);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const orderWithUser = {
      ...order.toObject(),
      user: user.user,
    };

    res.status(200).json(orderWithUser);
  } catch (err) {
    next(err);
  }
};

/**
 * Отмена заказа
 * @method POST
 * @param {string} orderId - ID заказа
 * @param {string} authorization - Bearer токен
 */
export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return next(new AppError('Заказ не найден', 404));
    }

    const decoded = jwt.verify(token, 'process.env.JWT') as { _id: string };

    if (order.user.toString() !== decoded._id) {
      return next(new AppError('Вы не можете отменить чужой заказ', 403));
    }

    order.status = 'Отменено';
    await order.save();

    res.status(200).json({ message: 'Заказ успешно отменен' });
  } catch (err) {
    next(err);
  }
};

/**
 * Обновление данных заказа
 * @method PUT
 * @param {string} orderId - ID заказа
 * @param {object} body - Обновленные данные заказа
 * @param {string} body.telegram - Телеграм пользователя
 */
export const updateOrder = async (req: Request, res: Response, next: NextFunction) => {
  const { orderId } = req.params;
  const { ...updateOrder } = req.body;

  try {
    // Проверка валидности идентификатора заказа
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return next(new AppError('Неверный идентификатор заказа', 400));
    }

    // Проверка наличия updateOrder в теле запроса
    if (!updateOrder || !updateOrder.telegram) {
      return next(new AppError('Необходимо указать данные для обновления заказа', 400));
    }

    // Поиск пользователя по telegram
    const existingUser = await User.findOne({ telegram: updateOrder.telegram });
    if (!existingUser) {
      return next(new AppError('Пользователь не найден', 404));
    }

    const userId = existingUser._id;

    delete updateOrder._id;

    // Обновление заказа
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { user: userId, ...updateOrder },
      { new: true }
    );

    if (!updatedOrder) {
      return next(new AppError('Заказ не найден', 404));
    }

    res.status(200).json({ updatedOrder });
  } catch (err) {
    next(err);
  }
};
