import express from 'express';
const router = express.Router();
import * as practiceController from './practice.controller.js';
import auth from '../../middlewares/token_validation.js';

// Practice rounds are personal (they record attempts and streak activity) and
// only open to learners enrolled in the course, so all three need a token.
router.get('/course/:id/practice', auth.checkToken, practiceController.getRound);
router.post('/course/:id/practice/submit', auth.checkToken, practiceController.submitRound);
router.get('/course/:id/practice/history', auth.checkToken, practiceController.getHistory);

export default router;
