const router = require('express').Router();
const wishListController=require('../controller/wishlist.controller')
const auth = require('../../middlewares/token_validation')

router.post('/user/wishlist',auth.checkToken,wishListController.addToWishlist);
router.post('/user/wishlist/remove',auth.checkToken,wishListController.removeFromWishlist);
router.get('/user/wishlist',auth.checkToken,wishListController.coursesInWishlist)

module.exports=router