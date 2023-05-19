const router=require('express').Router();
const courseController =require('../controller/course.controller')
const auth=require('../../middlewares/token_validation')


router.post('/user/tutor/add-course',auth.checkToken,courseController.addCourse);
router.get('/user/courses',auth.checkToken,courseController.allcourseByUserId);
router.get('/courses',courseController.allCOURSES);
// router.get('/courses/category/:select',courseController.categoryCourse)
router.get('/course/:id',courseController.courseByCourseId);

module.exports=router;