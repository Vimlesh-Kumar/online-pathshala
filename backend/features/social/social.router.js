import express from 'express';
const router = express.Router();
import * as socialController from './social.controller.js';
import auth from '../../middlewares/token_validation.js';

// Mounted at /user/social. The board only ever shows learners who are opted in,
// and a token is still required: ranks are personal to the viewer.
router.get('/leaderboard', auth.checkToken, socialController.getLeaderboard);
router.put('/leaderboard/prefs', auth.checkToken, socialController.savePrefs);

router.get('/challenges', auth.checkToken, socialController.listChallenges);
router.post('/challenges', auth.checkToken, socialController.createChallenge);
router.post('/challenges/:id/respond', auth.checkToken, socialController.respondToChallenge);

export default router;
