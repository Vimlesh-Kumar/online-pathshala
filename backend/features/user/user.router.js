import express from 'express';
const router = express.Router();
import { signup, signin, userById, updateProfile, updatePassword } from './user.controller.js';
import auth from '../../middlewares/token_validation.js';

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/details', auth.checkToken, userById);
router.put('/update', auth.checkToken, updateProfile);
router.put('/update-password', auth.checkToken, updatePassword);

export default router;