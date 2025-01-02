import { body, ValidationChain } from 'express-validator';

export const registerValidation: ValidationChain[] = [
  body('user')
    .notEmpty().withMessage('Требуется имя пользователя')
    .isLength({ min: 3 }).withMessage('Имя пользователя должно быть не менее 3 символов'),
  body('telegram')
    .notEmpty().withMessage('Требуется Telegram')
    .isLength({ min: 5 }).withMessage('Telegram должен быть не менее 5 символов'),
  body('password')
    .isLength({ min: 6 }).withMessage('Пароль должен быть не менее 6 символов')
    .notEmpty().withMessage('Требуется пароль'),
];

export const loginValidation: ValidationChain[] = [
  body('telegram')
    .notEmpty().withMessage('Требуется Telegram')
    .isLength({ min: 5 }).withMessage('Telegram должен быть не менее 5 символов'),
  body('password')
    .notEmpty().withMessage('Требуется пароль')
    .isLength({ min: 6 }).withMessage('Пароль должен быть не менее 6 символов'),
];

export const createOrderValidation: ValidationChain[] = [
  body('user')
    .notEmpty().withMessage('Требуется пользователь')
    .isLength({ min: 3 }).withMessage('Имя пользователя должно быть не менее 3 символов'),
  body('telegram')
    .notEmpty().withMessage('Требуется Telegram')
    .isLength({ min: 5 }).withMessage('Telegram должен быть не менее 5 символов'),
  body('detailedDescription')
    .notEmpty().withMessage('Требуется подробное описание')
    .isLength({ min: 10 }).withMessage('Подробное описание должно быть не менее 10 символов'),
  body('price')
    .isNumeric().withMessage('Цена должна быть числом')
    .notEmpty().withMessage('Требуется цена'),
];