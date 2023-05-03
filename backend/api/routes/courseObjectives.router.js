const router = require('express').Router();
const objectvesController = require('../controller/courseObjectives.controller')
const auth = require('../../middlewares/token_validation')

router.post('/course/objectives', auth.checkToken, objectvesController.courseObjectives)
router.get('/course/objectives-display/:id',objectvesController.getObjectives)
module.exports = router;