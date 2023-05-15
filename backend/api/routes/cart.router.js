const router=require('express').Router();
const cartController=require('../controller/cart.controller');
const auth=require('../../middlewares/token_validation')

router.post('/user/cart',auth.checkToken,cartController.addTocart);
router.get('/user/cart',auth.checkToken,cartController.coursesInUserCart);
router.post('/user/cart-remove',auth.checkToken,cartController.removeFromCart)

module.exports=router