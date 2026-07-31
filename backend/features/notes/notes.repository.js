import pool from '../../database/database.js';

/** Columns returned for every note, joined with the lesson and course it belongs to. */
const noteColumns = [
    'n.id',
    'n.course_id',
    'n.lesson_id',
    'n.timestamp_seconds',
    'n.content',
    'n.created_at',
    'n.updated_at',
    'l.lesson_name',
    'l.section_name',
    'c.title as course_title',
    'c.thumb_url as course_thumb'
];

const notesQuery = () =>
    pool('lesson_notes as n')
        .select(noteColumns)
        .join('lesson as l', 'l.id', 'n.lesson_id')
        .join('courses as c', 'c.id', 'n.course_id');

/**
 * All notes a user has taken in a single course, in playback order.
 */
export const notesForCourse = async ({ userId, courseId }) => {
    const results = await notesQuery()
        .where({ 'n.user_id': userId, 'n.course_id': courseId })
        .orderBy([
            { column: 'n.lesson_id', order: 'asc' },
            { column: 'n.timestamp_seconds', order: 'asc' }
        ]);
    return results;
};

/**
 * Every note a user has taken, newest first — powers the "My notes" page.
 */
export const notesForUser = async (userId) => {
    const results = await notesQuery()
        .where('n.user_id', userId)
        .orderBy([
            { column: 'n.updated_at', order: 'desc' },
            { column: 'n.id', order: 'desc' }
        ]);
    return results;
};

/**
 * Fetch a single note by id, scoped to its owner so one user can never
 * read or mutate another user's note.
 */
export const findUserNote = async ({ userId, noteId }) => {
    const result = await notesQuery().where({ 'n.id': noteId, 'n.user_id': userId }).first();
    return result || null;
};

/**
 * Confirm a lesson really belongs to the course the note is being filed under.
 */
export const findLessonInCourse = async ({ courseId, lessonId }) => {
    const result = await pool('lesson').select('id').where({ id: lessonId, course_id: courseId }).first();
    return result || null;
};

export const insertNote = async ({ userId, courseId, lessonId, timestampSeconds, content }) => {
    const [insertId] = await pool('lesson_notes').insert({
        user_id: userId,
        course_id: courseId,
        lesson_id: lessonId,
        timestamp_seconds: timestampSeconds,
        content
    });
    return insertId;
};

export const updateNote = async ({ userId, noteId, content }) => {
    const affectedRows = await pool('lesson_notes')
        .where({ id: noteId, user_id: userId })
        .update({ content, updated_at: pool.fn.now() });
    return affectedRows;
};

export const deleteNote = async ({ userId, noteId }) => {
    const affectedRows = await pool('lesson_notes').where({ id: noteId, user_id: userId }).del();
    return affectedRows;
};
