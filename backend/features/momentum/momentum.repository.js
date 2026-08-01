import pool from '../../database/database.js';

/** Counter columns a caller is allowed to bump — never taken from user input. */
export const ACTIVITY_COLUMNS = Object.freeze({
    lesson: 'lessons_completed',
    note: 'notes_taken',
    card: 'cards_reviewed',
    quiz: 'quizzes_taken'
});

/**
 * Bump today's activity counter for a learner, creating the day's row on first
 * activity. One row per user per day keeps streak maths trivial.
 */
export const recordActivity = async ({ userId, column }) => {
    await pool.raw(
        `INSERT INTO learning_activity (user_id, activity_date, ${column})
         VALUES (?, CURDATE(), 1)
         ON DUPLICATE KEY UPDATE ${column} = ${column} + 1`,
        [userId]
    );
};

/**
 * Every day this learner was active, oldest first. The history is small (one
 * row per active day) so streaks are computed in the service, not in SQL.
 */
export const activityDays = async (userId) => {
    const results = await pool('learning_activity')
        .select('activity_date', 'lessons_completed', 'notes_taken', 'cards_reviewed', 'quizzes_taken')
        .where('user_id', userId)
        .orderBy('activity_date', 'asc');
    return results;
};

/**
 * Lifetime totals that XP and badges are derived from.
 */
export const learnerTotals = async (userId) => {
    const [lessons, notes, certificates, reviews, enrollments, practice] = await Promise.all([
        pool('enroll_progress as ep')
            .count('* as count')
            .join('enrollment as e', 'e.id', 'ep.enrollment_id')
            .where('e.user_id', userId)
            .first(),
        pool('lesson_notes').count('* as count').where('user_id', userId).first(),
        pool('certificates as c')
            .count('* as count')
            .join('enrollment as e', 'e.id', 'c.enrollment_id')
            .where('e.user_id', userId)
            .first(),
        pool('reviews').count('* as count').where('user_id', userId).first(),
        pool('enrollment').count('* as count').where('user_id', userId).first(),
        pool('practice_attempts').count('* as count').where('user_id', userId).first()
    ]);

    return {
        lessons: Number(lessons.count) || 0,
        notes: Number(notes.count) || 0,
        certificates: Number(certificates.count) || 0,
        reviews: Number(reviews.count) || 0,
        enrollments: Number(enrollments.count) || 0,
        practice: Number(practice.count) || 0,
        // Filled in by the service from the per-day activity rows it already reads.
        cards: 0
    };
};
