import express from 'express';
const router = express.Router();
import * as engagement from './engagement.controller.js';
import auth from '../../middlewares/token_validation.js';
import { aiQuota } from '../aiSupport/aiQuota.js';

// Reviews
router.get('/course/:id/reviews', engagement.listReviews);
router.post('/course/:id/reviews', auth.checkToken, engagement.postReview);
router.get(
    '/course/:id/reviews/highlights',
    aiQuota('review-highlights', { limit: 40, windowMs: 10 * 60 * 1000 }),
    engagement.reviewHighlights
);

// Q&A
router.get('/course/:id/qna', engagement.listQuestions);
router.post('/course/:id/questions', auth.checkToken, engagement.postQuestion);
router.post('/questions/:qid/answers', auth.checkToken, engagement.postAnswer);

// Quiz
router.get('/course/:id/quiz', engagement.getQuiz);
router.post('/course/:id/quiz/submit', auth.checkToken, engagement.submitQuiz);

// Instructor
router.get('/user/tutor/stats', auth.checkToken, engagement.tutorStats);

export default router;
