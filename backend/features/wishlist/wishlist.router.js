import express from 'express';
const router = express.Router();
import * as wishListController from './wishlist.controller.js';
import auth from '../../middlewares/token_validation.js';

router.post('/user/wishlist', auth.checkToken, wishListController.addToWishlist);
router.post('/user/wishlist/remove', auth.checkToken, wishListController.removeFromWishlist);
router.get('/user/wishlist', auth.checkToken, wishListController.coursesInWishlist);

export default router;