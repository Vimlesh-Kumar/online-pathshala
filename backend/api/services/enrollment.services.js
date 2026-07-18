import pool from '../../database/database.js';

/**
 * Create an enrollment if one does not already exist for this user+course.
 * Returns the enrollment row (existing or newly created).
 */
export const enrolling = async (data) => {
    const [existing] = await pool.query(
        'SELECT * FROM enrollment WHERE course_id = ? AND user_id = ? LIMIT 1',
        [data.course_id, data.user_id]
    );
    if (existing.length) return existing[0];

    const [result] = await pool.query(
        'INSERT INTO enrollment (is_completed, progress, course_id, user_id) VALUES (false, 0, ?, ?)',
        [data.course_id, data.user_id]
    );
    return { id: result.insertId, course_id: data.course_id, user_id: data.user_id, progress: 0, is_completed: 0 };
};

/**
 * Fetch a single enrollment for a user+course (or null).
 */
export const getEnrollment = async (courseId, userId) => {
    const [rows] = await pool.query(
        'SELECT * FROM enrollment WHERE course_id = ? AND user_id = ? LIMIT 1',
        [courseId, userId]
    );
    return rows[0] || null;
};

/**
 * Ids of lessons the learner has already completed for an enrollment.
 */
export const getCompletedLessonIds = async (enrollmentId) => {
    const [rows] = await pool.query(
        'SELECT lesson_id FROM enroll_progress WHERE enrollment_id = ?',
        [enrollmentId]
    );
    return rows.map((r) => r.lesson_id);
};

/**
 * Total number of lessons in a course.
 */
export const countCourseLessons = async (courseId) => {
    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM lesson WHERE course_id = ?', [courseId]);
    return rows[0].count;
};

/**
 * Mark a lesson complete for an enrollment (idempotent — no duplicate rows).
 */
export const markLessonComplete = async (enrollmentId, lessonId) => {
    const [existing] = await pool.query(
        'SELECT id FROM enroll_progress WHERE enrollment_id = ? AND lesson_id = ? LIMIT 1',
        [enrollmentId, lessonId]
    );
    if (!existing.length) {
        await pool.query(
            'INSERT INTO enroll_progress (enrollment_id, lesson_id) VALUES (?, ?)',
            [enrollmentId, lessonId]
        );
    }
};

/**
 * Recompute and persist the progress percentage + completion flag.
 */
export const recalculateProgress = async (enrollmentId, courseId) => {
    const total = await countCourseLessons(courseId);
    const completedIds = await getCompletedLessonIds(enrollmentId);
    const completed = completedIds.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    const isCompleted = total > 0 && completed >= total;

    await pool.query(
        'UPDATE enrollment SET progress = ?, is_completed = ? WHERE id = ?',
        [progress, isCompleted, enrollmentId]
    );

    return { progress, isCompleted, total, completed, completedIds };
};
