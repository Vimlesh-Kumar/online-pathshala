const router = require('express').Router();
const objectvesController = require('../controller/courseObjectives.controller')
const auth = require('../../middlewares/token_validation')

router.post('/course/objectives', auth.checkToken, objectvesController.courseObjectives)
router.get('/course/objectives-display/:id',objectvesController.getObjectives);
router.put('/course/objective',auth.checkToken,objectvesController.updateObjective);
router.delete('/course/objective/:id',auth.checkToken,objectvesController.deleteObjective)
module.exports = router;