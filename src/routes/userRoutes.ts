import express from "express";
import { loginValidation, registerValidation } from "../validation/validation";
import * as controllers from "../controllers/userController";

const router = express.Router();

router.post('/register', registerValidation, controllers.register);
router.post('/login/login', loginValidation, controllers.login);

export default router;