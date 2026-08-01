import pool from '../../database/database.js';

export const enrolledCourse = async ({ userId, courseId }) =>
    pool('enrollment')
        .select('id')
        .where({ user_id: userId, course_id: courseId })
        .first();

export const courseById = async (courseId) =>
    pool('courses')
        .select('id', 'title', 'subtitle', 'category', 'author')
        .where({ id: courseId })
        .first();

export const courseObjectives = async (courseId) =>
    pool('course_objectives').select('objective').where({ course_id: courseId });

export const courseLessons = async (courseId) =>
    pool('lesson')
        .select('id', 'lesson_name', 'section_name', 'duration')
        .where({ course_id: courseId })
        .orderBy('id', 'asc');

export const lessonById = async ({ courseId, lessonId }) =>
    pool('lesson')
        .select('id', 'lesson_name', 'section_name')
        .where({ id: lessonId, course_id: courseId })
        .first();

/**
 * Cached questions for a scope. A lesson-scoped set is deliberately separate
 * from the course-wide one, so `lesson_id IS NULL` is a real filter, not a
 * "match anything" wildcard.
 */
export const questionsForScope = async ({ courseId, lessonId = null, limit = 50 }) => {
    const query = pool('practice_questions')
        .select('*')
        .where('course_id', courseId)
        .limit(limit);

    if (lessonId) query.andWhere('lesson_id', lessonId);
    else query.whereNull('lesson_id');

    return query;
};

export const questionsByIds = async ({ courseId, ids }) =>
    pool('practice_questions').select('*').where('course_id', courseId).whereIn('id', ids);

export const insertQuestions = async (rows) => {
    if (!rows.length) return [];
    await pool('practice_questions').insert(rows);
    return rows;
};

export const recordAttempt = async ({ userId, courseId, lessonId, total, correct, score, weakTopics }) => {
    const [id] = await pool('practice_attempts').insert({
        user_id: userId,
        course_id: courseId,
        lesson_id: lessonId || null,
        total,
        correct,
        score,
        weak_topics: weakTopics || null
    });
    return id;
};

/** Recent attempts for one course, newest first — the "your history" strip. */
export const attemptsForCourse = async ({ userId, courseId, limit = 10 }) =>
    pool('practice_attempts as a')
        .select('a.id', 'a.lesson_id', 'a.total', 'a.correct', 'a.score', 'a.weak_topics', 'a.created_at', 'l.lesson_name')
        .leftJoin('lesson as l', 'l.id', 'a.lesson_id')
        .where({ 'a.user_id': userId, 'a.course_id': courseId })
        .orderBy('a.created_at', 'desc')
        .limit(limit);

/** Best and latest score across a course, used for the header stats. */
export const attemptStats = async ({ userId, courseId }) => {
    const row = await pool('practice_attempts')
        .where({ user_id: userId, course_id: courseId })
        .select(
            pool.raw('COUNT(*) AS attempts'),
            pool.raw('MAX(score) AS best_score'),
            pool.raw('ROUND(AVG(score)) AS average_score')
        )
        .first();

    return {
        attempts: Number(row?.attempts) || 0,
        bestScore: Number(row?.best_score) || 0,
        averageScore: Number(row?.average_score) || 0
    };
};
