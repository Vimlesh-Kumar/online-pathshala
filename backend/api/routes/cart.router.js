import express from 'express';
const router = express.Router();
import * as cartController from '../controller/cart.controller.js';
import auth from '../../middlewares/token_validation.js';

router.post('/user/cart', auth.checkToken, cartController.addTocart);
router.get('/user/cart', auth.checkToken, cartController.coursesInUserCart);
router.post('/user/cart-remove', auth.checkToken, cartController.removeFromCart);

export default router;