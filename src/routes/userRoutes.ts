import express from 'express';
import { userController, helpersController } from '../controllers';
import { authMiddleware } from '../middleware/auth.middleware';
import { registerPipeline, loginPipeline, createOrderPipeline } from '../utils/combinedValidations';

const router = express.Router();

//?---------------------USER----------------------?\\
router.post('/register', registerPipeline, userController.register);
router.post('/login/login', loginPipeline, userController.login);

//?--------------------ORDERS---------------------?\\
router.post('/orders/create', authMiddleware, createOrderPipeline, userController.createOrder);
router.get('/orders/get', authMiddleware, userController.getPersonalOrder);
router.get('/order/:orderId', authMiddleware, userController.orderNotification);
router.post('/order/cancel/:orderId', authMiddleware, userController.cancelOrder);
router.put('/order/update/:orderId', authMiddleware, userController.updateOrder);

//?----------------HELPER REQUESTS----------------?\\
router.get('/get/user', authMiddleware, helpersController.getUser);
router.get('/get/user/telegram', authMiddleware, helpersController.getTelegram);
router.get('/verified', authMiddleware, helpersController.verified);

export default router;
