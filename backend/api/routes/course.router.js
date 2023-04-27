const router=require('express').Router();
const courseController =require('../controller/course.controller')
const auth=require('../../auth/token_validation')


router.post('/user/tutor/add-course',auth.checkToken,courseController.addCourse);
router.get('/user/courses',auth.checkToken,courseController.allcourseByUserId);
router.get('/courses',courseController.allCOURSES)

module.exports=router;