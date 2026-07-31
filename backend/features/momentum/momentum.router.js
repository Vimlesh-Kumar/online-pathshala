import express from 'express';
const router = express.Router();
import * as momentumController from './momentum.controller.js';
import auth from '../../middlewares/token_validation.js';

// Mounted at /user/momentum.
router.get('/', auth.checkToken, momentumController.getMomentum);

export default router;
