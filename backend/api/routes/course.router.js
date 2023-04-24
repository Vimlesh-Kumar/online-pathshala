const router=require('express').Router();
const courseController =require('../controller/course.controller')
const auth=require('../../auth/token_validation')


router.post('/add-course',courseController.addCourse)

module.exports=router;