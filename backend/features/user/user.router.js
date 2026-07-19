import express from 'express';
const router = express.Router();
import { signup, signin, userById } from './user.controller.js';
import auth from '../../middlewares/token_validation.js';

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/details', auth.checkToken, userById);

export default router;