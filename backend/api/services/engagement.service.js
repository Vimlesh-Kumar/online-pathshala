import pool from '../../database/database.js';

/* ── Reviews ─────────────────────────────────────────── */

export const getReviews = async (courseId) => {
    const [rows] = await pool.query(
        `SELECT r.id, r.content, r.rating, r.created_at, u.full_name AS author
         FROM reviews r
         INNER JOIN users u ON u.id = r.user_id
         WHERE r.course_id = ?
         ORDER BY r.created_at DESC`,
        [courseId]
    );
    return rows;
};

export const getReviewStats = async (courseId) => {
    const [rows] = await pool.query(
        'SELECT COUNT(*) AS count, COALESCE(AVG(rating), 0) AS average FROM reviews WHERE course_id = ?',
        [courseId]
    );
    return { count: rows[0].count, average: Number(rows[0].average) || 0 };
};

/** One review per user per course — updates if it already exists. */
export const upsertReview = async (courseId, userId, rating, content) => {
    const [existing] = await pool.query(
        'SELECT id FROM reviews WHERE course_id = ? AND user_id = ? LIMIT 1',
        [courseId, userId]
    );
    if (existing.length) {
        await pool.query(
            'UPDATE reviews SET rating = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [rating, content, existing[0].id]
        );
        return existing[0].id;
    }
    const [result] = await pool.query(
        'INSERT INTO reviews (content, rating, course_id, user_id) VALUES (?, ?, ?, ?)',
        [content, rating, courseId, userId]
    );
    return result.insertId;
};

/* ── Q&A ─────────────────────────────────────────────── */

export const getQuestions = async (courseId) => {
    const [questions] = await pool.query(
        `SELECT q.id, q.content, q.created_at, u.full_name AS author, u.user_role AS author_role
         FROM qna_questions q
         INNER JOIN users u ON u.id = q.user_id
         WHERE q.course_id = ?
         ORDER BY q.created_at DESC`,
        [courseId]
    );
    if (!questions.length) return [];

    const ids = questions.map((q) => q.id);
    const [answers] = await pool.query(
        `SELECT a.id, a.question_id, a.content, a.created_at, u.full_name AS author, u.user_role AS author_role
         FROM qna_answers a
         INNER JOIN users u ON u.id = a.user_id
         WHERE a.question_id IN (?)
         ORDER BY a.created_at ASC`,
        [ids]
    );

    return questions.map((q) => ({
        ...q,
        answers: answers.filter((a) => a.question_id === q.id)
    }));
};

export const addQuestion = async (courseId, userId, content) => {
    const [result] = await pool.query(
        'INSERT INTO qna_questions (course_id, user_id, content) VALUES (?, ?, ?)',
        [courseId, userId, content]
    );
    return result.insertId;
};

export const addAnswer = async (questionId, userId, content) => {
    const [result] = await pool.query(
        'INSERT INTO qna_answers (question_id, user_id, content) VALUES (?, ?, ?)',
        [questionId, userId, content]
    );
    return result.insertId;
};

/* ── Quiz ────────────────────────────────────────────── */

/** Public quiz — correct answers stripped. */
export const getQuiz = async (courseId) => {
    const [rows] = await pool.query(
        `SELECT id, question, option_a, option_b, option_c, option_d
         FROM quiz_questions WHERE course_id = ? ORDER BY id ASC`,
        [courseId]
    );
    return rows;
};

/** Answer key for scoring. */
export const getQuizKey = async (courseId) => {
    const [rows] = await pool.query(
        'SELECT id, correct_option FROM quiz_questions WHERE course_id = ?',
        [courseId]
    );
    return rows;
};

/* ── Instructor stats ────────────────────────────────── */

export const getTutorStats = async (userId) => {
    const [courses] = await pool.query(
        `SELECT c.id, c.title, c.thumb_url, c.category, c.price,
                (SELECT COUNT(*) FROM enrollment e2 WHERE e2.course_id = c.id) AS enrollments,
                COALESCE((SELECT AVG(r.rating) FROM reviews r WHERE r.course_id = c.id), 0) AS avg_rating,
                COALESCE((SELECT SUM(o.total_paid) FROM order_details o WHERE o.course_id = c.id), 0) AS revenue
         FROM courses c
         WHERE c.id IN (SELECT e.course_id FROM enrollment e WHERE e.user_id = ?)
         ORDER BY enrollments DESC`,
        [userId]
    );
    return courses.map((c) => ({
        ...c,
        enrollments: Number(c.enrollments) || 0,
        avg_rating: Number(c.avg_rating) || 0,
        revenue: Number(c.revenue) || 0
    }));
};
