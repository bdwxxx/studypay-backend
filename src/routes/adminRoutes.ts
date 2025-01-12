import express from 'express';
import { adminController, aiController } from '../controllers';
import { adminMiddleware } from '../middleware/admin.middleware';
import { loginPipeline } from '../utils/combinedValidations';

const router = express.Router();

//?---------------------LOGIN----------------------?\\
router.post('/login', loginPipeline, adminController.login);
router.post('/checkRole', adminController.checkRole);

//?---------------------ORDERS----------------------?\\
router.get('/orders/showAllOrders', adminMiddleware, adminController.showAllOrders);

//?---------------------TEST----------------------?\\
router.post('/wassup', aiController.buyAI);
router.post('/test', aiController.requestAI);
router.post('/category/add', adminController.addCategory);

export default router;
