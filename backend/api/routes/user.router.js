const { signup, signin, getDetails,userById } = require('../controller/user.controller');
const router = require('express').Router();
const auth = require('../../auth/token_validation')

router.post('/signup', signup)
router.post('/signin', signin)
router.get('/details',auth.checkToken,userById)

module.exports = router