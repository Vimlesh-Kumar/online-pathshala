import express from 'express';
const router = express.Router();
import * as aiSupport from './aiSupport.controller.js';
import auth from '../../middlewares/token_validation.js';
import { aiQuota } from './aiQuota.js';

// Free rule-based support chatbot
router.post('/support/ask', aiSupport.askSupport);
router.get('/support/faqs', aiSupport.listFaqs);

// Course-scoped content search ("ask about this course")
router.post('/course/:id/ask', aiSupport.askAboutCourse);

// Instructor writing suggestions (template-based)
router.post('/user/tutor/suggest-copy', auth.checkToken, aiSupport.suggestCourseCopy);

// Personalized recommendations
router.get('/user/recommendations', auth.checkToken, aiSupport.getRecommendations);
router.post(
    '/user/recommendations/explain',
    auth.checkToken,
    aiQuota('recommendations', { limit: 10, windowMs: 10 * 60 * 1000 }),
    aiSupport.explainRecommendations
);

// AI study tutor in the course player (streams plain text)
router.post(
    '/user/study-tutor/chat',
    auth.checkToken,
    aiQuota('tutor', { limit: 20, windowMs: 5 * 60 * 1000 }),
    aiSupport.studyTutorChat
);

export default router;
