import express from 'express';
const router = express.Router();
import * as orderController from './order.controller.js';
import auth from '../../middlewares/token_validation.js';

router.post('/user/coupon/validate', auth.checkToken, orderController.validateCoupon);
router.post('/user/checkout', auth.checkToken, orderController.checkout);
router.get('/user/orders', auth.checkToken, orderController.listOrders);

export default router;
