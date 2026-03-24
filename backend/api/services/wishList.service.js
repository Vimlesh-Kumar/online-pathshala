import pool from '../../database/database.js';

export const addToWishList = async (data) => {
    const [result] = await pool.query(
        'INSERT INTO wishlist(course_id,user_id) VALUES(?,?)',
        [data.course_id, data.user_id]
    );
    return result;
};

export const removewishlistCourseFromDB = async (data) => {
    const [result] = await pool.query(
        'DELETE FROM wishlist where course_id=? AND user_id=?',
        [data.course_id, data.user_id]
    );
    return result;
};

export const allCoursesOfUserInWishlist = async (id) => {
    const [results] = await pool.query(
        'SELECT course_id as id,author,category,price,rating,subtitle,thumb_url,title FROM courses JOIN wishlist on wishlist.course_id=courses.id where wishlist.user_id=?',
        [id]
    );
    return results;
};

