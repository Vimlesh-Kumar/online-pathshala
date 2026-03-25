import express from 'express';
const router = express.Router();
import * as courseController from '../controller/course.controller.js';
import auth from '../../middlewares/token_validation.js';


router.post('/user/tutor/add-course', auth.checkToken, courseController.addCourse);
router.get('/user/courses', auth.checkToken, courseController.allcourseByUserId);
router.get('/courses', courseController.allCOURSES);
router.get('/courses/featured', courseController.featuredCourses);
router.get('/courses/category/:select', courseController.categoryCourse);
router.get('/course/:id', courseController.courseByCourseId);
router.get('/course/:id/related', courseController.relatedCourses);
router.get('/courses/search', courseController.searchAllCourses);

export default router;
