import { body, ValidationChain } from 'express-validator';

export const registerValidation: ValidationChain[] = [
  body('user')
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('telegram')
    .notEmpty().withMessage('Telegram is required')
    .isLength({ min: 5 }).withMessage('Telegram must be at least 3 characters long'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .notEmpty().withMessage('Password is required'),
];

export const loginValidation: ValidationChain[] = [
  body('telegram')
    .notEmpty().withMessage('Telegram is required')
    .isLength({ min: 5 }).withMessage('Telegram must be at least 3 characters long'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

export const createOrderValidation: ValidationChain[] = [
  body('user')
    .notEmpty().withMessage('User is required')
    .isLength({ min: 3 }).withMessage('User must be at least 3 characters long'),
  body('telegram')
    .notEmpty().withMessage('Telegram is required')
    .isLength({ min: 5 }).withMessage('Telegram must be at least 3 characters long'),
  body('detailedDescription')
    .notEmpty().withMessage('Detailed description is required')
    .isLength({ min: 10 }).withMessage('Detailed description must be at least 10 characters long'),
  body('price')
    .isNumeric().withMessage('Price must be a number')
    .notEmpty().withMessage('Price is required'),
];