import pool from '../../database/database.js';

export const goalFor = async (userId) =>
    pool('study_goals').select('*').where({ user_id: userId }).first();

export const upsertGoal = async ({ userId, weeklyLessons, weeklyDays, planDays, remindersOn }) => {
    const existing = await goalFor(userId);
    const values = {
        weekly_lessons: weeklyLessons,
        weekly_days: weeklyDays,
        plan_days: planDays,
        reminders_on: remindersOn
    };

    if (existing) {
        await pool('study_goals').where({ user_id: userId }).update(values);
    } else {
        await pool('study_goals').insert({ user_id: userId, ...values });
    }
    return goalFor(userId);
};

export const markNudged = async ({ userId, day }) =>
    pool('study_goals').where({ user_id: userId }).update({ last_nudged_on: day });

/**
 * Daily activity between two calendar days, inclusive. The planner only ever
 * looks at one week, so this stays a small, index-friendly range scan.
 */
export const activityBetween = async ({ userId, from, to }) =>
    pool('learning_activity')
        .select('activity_date', 'lessons_completed', 'notes_taken', 'cards_reviewed', 'quizzes_taken')
        .where('user_id', userId)
        .andWhere('activity_date', '>=', from)
        .andWhere('activity_date', '<=', to)
        .orderBy('activity_date', 'asc');
