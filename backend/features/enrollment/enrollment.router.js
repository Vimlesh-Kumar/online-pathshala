import express from 'express';
const router = express.Router();
import * as enrollmentController from './enrollment.controller.js';
import auth from '../../middlewares/token_validation.js';

router.post('/course-enrollment', enrollmentController.enrollment);

// Learning experience — enrollment + progress (authenticated)
router.post('/enroll', auth.checkToken, enrollmentController.enrollFree);
router.get('/:id/progress', auth.checkToken, enrollmentController.getCourseProgress);
router.post('/progress', auth.checkToken, enrollmentController.updateLessonProgress);
router.post('/:id/certificate', auth.checkToken, enrollmentController.issueCertificate);

export default router;
