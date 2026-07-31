import * as notesService from './notes.service.js';
import * as momentumService from '../momentum/momentum.service.js';
import { sendError, sendSuccess } from '../../utils/apiResponse.js';

const parseId = (value) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

/** Playback positions are whole seconds, never negative. */
const parseTimestamp = (value) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
};

const parseContent = (value) => String(value ?? '').trim().slice(0, notesService.MAX_NOTE_LENGTH);

/**
 * All notes the authenticated user has taken, grouped by course.
 */
export const listMyNotes = async (req, res) => {
    try {
        const data = await notesService.getGroupedNotes(req.user.id);
        return sendSuccess(res, { message: 'Notes fetched.', data });
    } catch (error) {
        console.error(error);
        return sendError(res, { statusCode: 500, message: 'Unable to fetch notes.' });
    }
};

/**
 * The authenticated user's notes for a single course, in playback order.
 */
export const listCourseNotes = async (req, res) => {
    try {
        const courseId = parseId(req.params.courseId);
        if (!courseId) {
            return sendError(res, { statusCode: 400, message: 'A valid course id is required.' });
        }

        const notes = await notesService.getCourseNotes({ userId: req.user.id, courseId });
        return sendSuccess(res, { message: 'Course notes fetched.', data: notes });
    } catch (error) {
        console.error(error);
        return sendError(res, { statusCode: 500, message: 'Unable to fetch course notes.' });
    }
};

/**
 * Save a note captured at a playback position inside a lesson.
 */
export const createNote = async (req, res) => {
    try {
        const courseId = parseId(req.body?.course_id);
        const lessonId = parseId(req.body?.lesson_id);
        const content = parseContent(req.body?.content);

        if (!courseId || !lessonId || !content) {
            return sendError(res, {
                statusCode: 400,
                message: 'A course id, lesson id and note text are required.'
            });
        }

        const note = await notesService.createNote({
            userId: req.user.id,
            courseId,
            lessonId,
            timestampSeconds: parseTimestamp(req.body?.timestamp_seconds),
            content
        });

        if (!note) {
            return sendError(res, { statusCode: 404, message: 'That lesson is not part of this course.' });
        }

        // Writing notes counts as studying — it keeps the daily streak alive.
        await momentumService.recordActivity(req.user.id, 'note');

        return sendSuccess(res, { statusCode: 201, message: 'Note saved.', data: note });
    } catch (error) {
        console.error(error);
        return sendError(res, { statusCode: 500, message: 'Unable to save note.' });
    }
};

/**
 * Edit the text of a note the user owns.
 */
export const updateNote = async (req, res) => {
    try {
        const noteId = parseId(req.params.noteId);
        const content = parseContent(req.body?.content);

        if (!noteId || !content) {
            return sendError(res, { statusCode: 400, message: 'A note id and note text are required.' });
        }

        const note = await notesService.editNote({ userId: req.user.id, noteId, content });
        if (!note) {
            return sendError(res, { statusCode: 404, message: 'Note not found.' });
        }

        return sendSuccess(res, { message: 'Note updated.', data: note });
    } catch (error) {
        console.error(error);
        return sendError(res, { statusCode: 500, message: 'Unable to update note.' });
    }
};

/**
 * Delete a note the user owns.
 */
export const deleteNote = async (req, res) => {
    try {
        const noteId = parseId(req.params.noteId);
        if (!noteId) {
            return sendError(res, { statusCode: 400, message: 'A valid note id is required.' });
        }

        const removed = await notesService.removeNote({ userId: req.user.id, noteId });
        if (!removed) {
            return sendError(res, { statusCode: 404, message: 'Note not found.' });
        }

        return sendSuccess(res, { message: 'Note deleted.' });
    } catch (error) {
        console.error(error);
        return sendError(res, { statusCode: 500, message: 'Unable to delete note.' });
    }
};
