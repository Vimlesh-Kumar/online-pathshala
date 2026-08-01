import express from 'express';
const router = express.Router();
import * as goalsController from './goals.controller.js';
import auth from '../../middlewares/token_validation.js';

// Mounted at /user/goals.
router.get('/', auth.checkToken, goalsController.getPlan);
router.put('/', auth.checkToken, goalsController.saveGoal);

export default router;
