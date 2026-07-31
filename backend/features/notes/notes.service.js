import * as notesRepository from './notes.repository.js';

/** Notes are capped so a single note can never blow past the column width. */
export const MAX_NOTE_LENGTH = 2000;

/**
 * List a user's notes for one course (playback order).
 */
export const getCourseNotes = async ({ userId, courseId }) =>
    notesRepository.notesForCourse({ userId, courseId });

/**
 * Every note the user owns, grouped by course so the UI can render one card
 * per course without doing the bucketing itself.
 */
export const getGroupedNotes = async (userId) => {
    const notes = await notesRepository.notesForUser(userId);

    const courses = [];
    const byCourseId = new Map();

    for (const note of notes) {
        let group = byCourseId.get(note.course_id);
        if (!group) {
            group = {
                courseId: note.course_id,
                courseTitle: note.course_title,
                courseThumb: note.course_thumb,
                notes: []
            };
            byCourseId.set(note.course_id, group);
            courses.push(group);
        }
        group.notes.push(note);
    }

    return { courses, totalNotes: notes.length };
};

/**
 * Create a note against a lesson, rejecting lessons that do not belong to the
 * given course so the note can never point at unrelated content.
 */
export const createNote = async ({ userId, courseId, lessonId, timestampSeconds, content }) => {
    const lesson = await notesRepository.findLessonInCourse({ courseId, lessonId });
    if (!lesson) return null;

    const id = await notesRepository.insertNote({
        userId,
        courseId,
        lessonId,
        timestampSeconds,
        content
    });

    return notesRepository.findUserNote({ userId, noteId: id });
};

/**
 * Edit a note's text. Returns null when the note does not belong to the user.
 */
export const editNote = async ({ userId, noteId, content }) => {
    const affectedRows = await notesRepository.updateNote({ userId, noteId, content });
    if (!affectedRows) return null;
    return notesRepository.findUserNote({ userId, noteId });
};

/**
 * Delete a note the user owns. Returns false when there was nothing to delete.
 */
export const removeNote = async ({ userId, noteId }) => {
    const affectedRows = await notesRepository.deleteNote({ userId, noteId });
    return affectedRows > 0;
};
