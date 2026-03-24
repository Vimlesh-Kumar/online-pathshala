import express from 'express';
const router = express.Router();
import * as enrollmentController from '../controller/enrollment.controller.js';

router.post('/course-enrollment', enrollmentController.enrollment);

export default router;