import { body } from "express-validator";

export const registerValidation = [
    body('user').isString().withMessage('Укажите логин').isLength({ min: 3 }).withMessage('Логин должен содержать минимум 3 символа'),
    body('telegram').isString().withMessage('Укажите telegram').isLength({ min: 5 }).withMessage('Telegram должен содержать минимум 5 символа'),
    body('password').isString().withMessage('Укажите пароль').isLength({ min: 6 }).withMessage('Пароль должен содержать минимум 6 символов')
];

export const loginValidation = [
    body('telegram').isString().withMessage('Укажите telegram').isLength({ min: 3 }).withMessage('Минимум 6 символов'),
    body('password').isString().withMessage('Укажите пароль').isLength({ min: 6 }).withMessage('Пароль должен содержать минимум 6 символов')
];