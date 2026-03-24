import pool from '../../database/database.js';

export const addCartDetailsInDB = async (data) => {
    const [result] = await pool.query(
        'insert into cart (course_id,user_id) values(?,?)',
        [data.course_id, data.user_id]
    );
    return result;
};

export const userCartCourse = async (user_id) => {
    const [results] = await pool.query(
        'select * from courses join cart on cart.course_id=courses.id where cart.user_id=?',
        [user_id]
    );
    return results;
};

export const removeCartCourseById = async (data) => {
    const [result] = await pool.query(
        'DELETE FROM cart WHERE course_id=? AND user_id=?',
        [data.course_id, data.user_id]
    );
    return result;
};