import express from 'express';
const router = express.Router();
import * as notesController from './notes.controller.js';
import auth from '../../middlewares/token_validation.js';

// Mounted at /user/notes — every route is scoped to the authenticated user.
router.get('/', auth.checkToken, notesController.listMyNotes);
router.get('/course/:courseId', auth.checkToken, notesController.listCourseNotes);
router.post('/', auth.checkToken, notesController.createNote);
router.patch('/:noteId', auth.checkToken, notesController.updateNote);
router.delete('/:noteId', auth.checkToken, notesController.deleteNote);

export default router;
