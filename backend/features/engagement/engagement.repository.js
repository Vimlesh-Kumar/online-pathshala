import pool from '../../database/database.js';

export const getReviews = async (courseId) => {
    return pool('reviews as r')
        .select('r.id', 'r.content', 'r.rating', 'r.created_at', 'u.full_name as author')
        .join('users as u', 'u.id', 'r.user_id')
        .where('r.course_id', courseId)
        .orderBy('r.created_at', 'desc');
};

export const getReviewStats = async (courseId) => {
    const row = await pool('reviews')
        .select(
            pool.raw('COUNT(*) AS count'),
            pool.raw('COALESCE(AVG(rating), 0) AS average')
        )
        .where('course_id', courseId)
        .first();
    return { count: row.count, average: Number(row.average) || 0 };
};

export const upsertReview = async (courseId, userId, rating, content) => {
    const existing = await pool('reviews')
        .select('id')
        .where({ course_id: courseId, user_id: userId })
        .first();
    if (existing) {
        await pool('reviews')
            .where({ id: existing.id })
            .update({
                rating,
                content,
                updated_at: pool.fn.now()
            });
        return existing.id;
    }
    const [insertId] = await pool('reviews').insert({
        content,
        rating,
        course_id: courseId,
        user_id: userId
    });
    return insertId;
};

export const getQuestions = async (courseId) => {
    return pool('qna_questions as q')
        .select('q.id', 'q.content', 'q.created_at', 'u.full_name as author', 'u.user_role as author_role')
        .join('users as u', 'u.id', 'q.user_id')
        .where('q.course_id', courseId)
        .orderBy('q.created_at', 'desc');
};

export const getAnswersForQuestions = async (questionIds) => {
    return pool('qna_answers as a')
        .select('a.id', 'a.question_id', 'a.content', 'a.created_at', 'u.full_name as author', 'u.user_role as author_role')
        .join('users as u', 'u.id', 'a.user_id')
        .whereIn('a.question_id', questionIds)
        .orderBy('a.created_at', 'asc');
};

export const addQuestion = async (courseId, userId, content) => {
    const [insertId] = await pool('qna_questions').insert({
        course_id: courseId,
        user_id: userId,
        content
    });
    return insertId;
};

export const addAnswer = async (questionId, userId, content) => {
    const [insertId] = await pool('qna_answers').insert({
        question_id: questionId,
        user_id: userId,
        content
    });
    return insertId;
};

export const getQuiz = async (courseId) => {
    return pool('quiz_questions')
        .select('id', 'question', 'option_a', 'option_b', 'option_c', 'option_d')
        .where({ course_id: courseId })
        .orderBy('id', 'asc');
};

export const getQuizKey = async (courseId) => {
    return pool('quiz_questions')
        .select('id', 'correct_option')
        .where({ course_id: courseId });
};

export const getTutorStats = async (userId) => {
    const courses = await pool('courses as c')
        .select(
            'c.id', 'c.title', 'c.thumb_url', 'c.category', 'c.price',
            pool.raw('(SELECT COUNT(*) FROM enrollment e2 WHERE e2.course_id = c.id) AS enrollments'),
            pool.raw('COALESCE((SELECT AVG(r.rating) FROM reviews r WHERE r.course_id = c.id), 0) AS avg_rating'),
            pool.raw('COALESCE((SELECT SUM(o.total_paid) FROM order_details o WHERE o.course_id = c.id), 0) AS revenue')
        )
        .whereIn('c.id', function() {
            this.select('e.course_id').from('enrollment as e').where('e.user_id', userId);
        })
        .orderBy('enrollments', 'desc');

    return courses.map((c) => ({
        ...c,
        enrollments: Number(c.enrollments) || 0,
        avg_rating: Number(c.avg_rating) || 0,
        revenue: Number(c.revenue) || 0
    }));
};
