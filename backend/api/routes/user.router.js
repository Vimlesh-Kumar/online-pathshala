const { signup, signin, getDetails } = require('../controller/user.controller');
const router = require('express').Router();
const auth = require('../../auth/token_validation')

router.post('/signup', signup)
router.post('/signin', signin)
router.get('/details/:id', auth.checkToken, getDetails)

module.exports = router