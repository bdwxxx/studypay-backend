import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import User from '../models/user.model';
import Order from '../models/order.model';

export const showAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find().populate('');

    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const showUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).lean();

    if (!user) {
      return next(new AppError('Пользователь не найден', 404));
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const showDescriptionsForUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).lean();

    if (!user) {
      return next(new AppError('Пользователь не найден', 404));
    }

    const orders = await Order.find({ user: userId })
      .populate('user', 'user')
      .populate('category', 'category')
      .lean();

    const adminData = await User.findById(orders[0].admin).lean();

    const ordersWithUser = orders.map((order) => ({
      ...order,
      user: user.user,
      admin: adminData ? adminData.user : order.admin,
      category: (order.category as any).name,
    }));

    res.json(ordersWithUser);
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return next(new AppError('Пользователь не найден', 404));
    }

    const updateInfo = await User.updateOne({ _id: userId }, req.body);

    res.json(updateInfo);
  } catch (err) {
    next(err);
  }
};
