const { signup, signin ,getDetails} = require('./user.controller');
const router = require('express').Router();
const auth= require ('../../auth/token_validation')

router.post('/signup', signup)
router.post('/signin', signin)
router.get('/details/:token',auth.checkToken,getDetails)

module.exports = router