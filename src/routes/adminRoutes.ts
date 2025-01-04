import express from 'express';
import { adminController, aiController } from '../controllers';
import { adminMiddleware } from '../middleware/admin.middleware';
import { registerPipeline, loginPipeline, createOrderPipeline } from '../utils/combinedValidations';

const router = express.Router();

//?---------------------LOGIN----------------------?\\
router.post('/login', loginPipeline, adminController.login);
router.post('/checkRole', adminController.checkRole);

//?---------------------ORDERS----------------------?\\
router.get('/orders/showAllOrders', adminMiddleware, adminController.showAllOrders);

//?---------------------TEST----------------------?\\
router.post('/test', aiController.requestAI);

export default router;
