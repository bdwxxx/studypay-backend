import express from 'express';
import { userController, helpersController, aiController } from '../controllers';
import { authMiddleware } from '../middleware/auth.middleware';
import { registerPipeline, loginPipeline, createOrderPipeline } from '../utils/combinedValidations';

const router = express.Router();

//?---------------------USER----------------------?\\
router.post('/register', registerPipeline, userController.register);
router.post('/login/login', loginPipeline, userController.login);

//?--------------------ORDERS---------------------?\\
//TODO улучшить роуты
router.post('/order/create', authMiddleware, createOrderPipeline, userController.createOrder);
router.get('/orders/get', authMiddleware, userController.getPersonalOrder); // TODO убрать get
router.get('/order/:orderId', authMiddleware, userController.orderInNotification);
router.post('/order/cancel/:orderId', authMiddleware, userController.cancelOrder);
router.put('/order/update/:orderId', authMiddleware, userController.updateOrder);
router.get('/orders/get/lastorders', authMiddleware, userController.getLastOrders);

router.get('/category/get', authMiddleware, userController.showCategory); // TODO убрать get
router.get('/notification/orders', authMiddleware, userController.notificationOrders);

//?---------------------VERIFY---------------------?\\
router
  .route('/verification')
  .get(authMiddleware, userController.verifiedUserInBot)
  .post(authMiddleware, userController.sendVerificationCode)
  .put(authMiddleware, userController.checkVerificationCode);

//?---------------------AI------------------------?\\
router.post('/ai/chat', authMiddleware, aiController.requestAI);

//?----------------HELPER REQUESTS----------------?\\
router.get('/get/user', authMiddleware, helpersController.getUser);
router.get('/get/user/telegram', authMiddleware, helpersController.getTelegram);
router.get('/verified', authMiddleware, helpersController.checkVerification);

export default router;
