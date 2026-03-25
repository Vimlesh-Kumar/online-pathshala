import pool from '../../database/database.js';

/**
 * Check whether a course is already in the user's wishlist.
 */
export const findWishlistItem = async (data) => {
    const [results] = await pool.query(
        'SELECT id FROM wishlist WHERE course_id = ? AND user_id = ? LIMIT 1',
        [data.course_id, data.user_id]
    );
    return results[0] || null;
};

/**
 * Insert a course into the wishlist table.
 */
export const addToWishList = async (data) => {
    const [result] = await pool.query(
        'INSERT INTO wishlist(course_id, user_id) VALUES(?, ?)',
        [data.course_id, data.user_id]
    );
    return result;
};

/**
 * Remove a course from the user's wishlist.
 */
export const removewishlistCourseFromDB = async (data) => {
    const [result] = await pool.query(
        'DELETE FROM wishlist WHERE course_id = ? AND user_id = ?',
        [data.course_id, data.user_id]
    );
    return result;
};

/**
 * Get all courses saved in the user's wishlist.
 */
export const allCoursesOfUserInWishlist = async (id) => {
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
         INNER JOIN wishlist w ON w.course_id = c.id
         WHERE w.user_id = ?
         ORDER BY w.id DESC`,
        [id]
    );
    return results;
};
