import express from 'express';
const router = express.Router();
import * as objectivesController from '../controller/courseObjectives.controller.js';
import auth from '../../middlewares/token_validation.js';

router.post('/course/objectives', auth.checkToken, objectivesController.courseObjectives);
router.get('/course/objectives-display/:id', objectivesController.getObjectives);
router.put('/course/objective', auth.checkToken, objectivesController.updateObjective);
router.delete('/course/objective/:id', auth.checkToken, objectivesController.deleteObjective);

export default router;