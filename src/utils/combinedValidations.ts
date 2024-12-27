import { validate } from '../validation/validate';
import {
  registerValidation,
  loginValidation,
  createOrderValidation,
} from '../validation/validation';

export const registerPipeline = [...registerValidation, validate];
export const loginPipeline = [...loginValidation, validate];
export const createOrderPipeline = [...createOrderValidation, validate];