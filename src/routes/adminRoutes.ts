import express from 'express';
import { adminController, aiController, ownerController } from '../controllers';
import { adminMiddleware } from '../middleware/admin.middleware';
import { loginPipeline } from '../utils/combinedValidations';
import { ownerMiddleware } from '../middleware/owner.middleware';

const router = express.Router();

//?---------------------LOGIN----------------------?\\
router.post('/checkRole', adminController.checkRole);

//?---------------------ORDERS----------------------?\\
router.get('/orders', adminMiddleware, adminController.getAllOrders);
router.post('/orders/take/:orderId', adminMiddleware, adminController.takeOrder);

//?---------------------USERS----------------------?\\
//TODO: add middleware and for owner
router.get('/users/showAllUsers', ownerMiddleware, ownerController.showAllUsers);
router.get('/users/showDescriptionsForUser/:userId', ownerController.showDescriptionsForUser);
router.get('/users/:userId', ownerController.showUser);
router.put('/user/:userId', ownerController.updateUser);

//?---------------------TEST----------------------?\\
router.post('/wassup', aiController.buyAI);
router.post('/category/add', adminController.addCategory);

export default router;
