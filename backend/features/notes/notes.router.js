import express from 'express';
const router = express.Router();
import * as notesController from './notes.controller.js';
import auth from '../../middlewares/token_validation.js';
import { aiQuota } from '../aiSupport/aiQuota.js';

// Mounted at /user/notes — every route is scoped to the authenticated user.
router.get('/', auth.checkToken, notesController.listMyNotes);
router.get('/course/:courseId', auth.checkToken, notesController.listCourseNotes);
router.post(
    '/course/:courseId/summary',
    auth.checkToken,
    aiQuota('notes-summary', { limit: 10, windowMs: 10 * 60 * 1000 }),
    notesController.summarizeCourseNotes
);
router.post(
    '/tidy',
    auth.checkToken,
    aiQuota('notes-tidy', { limit: 30, windowMs: 10 * 60 * 1000 }),
    notesController.tidyNote
);
router.post('/', auth.checkToken, notesController.createNote);
router.patch('/:noteId', auth.checkToken, notesController.updateNote);
router.delete('/:noteId', auth.checkToken, notesController.deleteNote);

export default router;
