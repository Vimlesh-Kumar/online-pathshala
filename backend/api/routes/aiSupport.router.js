import express from 'express';
const router = express.Router();
import * as aiSupport from '../controller/aiSupport.controller.js';
import auth from '../../middlewares/token_validation.js';

// Free rule-based support chatbot
router.post('/support/ask', aiSupport.askSupport);
router.get('/support/faqs', aiSupport.listFaqs);

// Course-scoped content search ("ask about this course")
router.post('/course/:id/ask', aiSupport.askAboutCourse);

// Instructor writing suggestions (template-based)
router.post('/user/tutor/suggest-copy', auth.checkToken, aiSupport.suggestCourseCopy);

// Personalized recommendations
router.get('/user/recommendations', auth.checkToken, aiSupport.getRecommendations);

export default router;
