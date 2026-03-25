import pool from '../../database/database.js';

/**
 * Check whether a course already exists in the user's cart.
 */
export const findCartItem = async (data) => {
    const [results] = await pool.query(
        'SELECT id FROM cart WHERE course_id = ? AND user_id = ? LIMIT 1',
        [data.course_id, data.user_id]
    );
    return results[0] || null;
};

/**
 * Insert a course into the user's cart.
 */
export const addCartDetailsInDB = async (data) => {
    const [result] = await pool.query(
        'INSERT INTO cart (course_id, user_id) VALUES(?, ?)',
        [data.course_id, data.user_id]
    );
    return result;
};

/**
 * Fetch all courses in the user's cart with a compact course payload.
 */
export const userCartCourse = async (user_id) => {
    const [results] = await pool.query(
        `SELECT
            c.id,
            c.author,
            c.category,
            c.price,
            c.rating,
            c.subtitle,
            c.thumb_url,
            c.title
         FROM courses c
         INNER JOIN cart ct ON ct.course_id = c.id
         WHERE ct.user_id = ?
         ORDER BY ct.id DESC`,
        [user_id]
    );
    return results;
};

/**
 * Remove a course from the user's cart.
 */
export const removeCartCourseById = async (data) => {
    const [result] = await pool.query(
        'DELETE FROM cart WHERE course_id = ? AND user_id = ?',
        [data.course_id, data.user_id]
    );
    return result;
};

/**
 * Calculate summary values that the frontend can show without extra work.
 */
export const getCartSummary = async (userId) => {
    const [results] = await pool.query(
        `SELECT
            COUNT(*) AS itemCount,
            COALESCE(SUM(c.price), 0) AS totalAmount
         FROM cart ct
         INNER JOIN courses c ON c.id = ct.course_id
         WHERE ct.user_id = ?`,
        [userId]
    );
    return results[0];
};
