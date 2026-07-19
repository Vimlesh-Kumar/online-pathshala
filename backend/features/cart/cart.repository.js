import pool from '../../database/database.js';

export const findCartItem = async (data) => {
    const result = await pool('cart')
        .select('id')
        .where({ course_id: data.course_id, user_id: data.user_id })
        .first();
    return result || null;
};

export const addCartDetailsInDB = async (data) => {
    const [insertId] = await pool('cart').insert({
        course_id: data.course_id,
        user_id: data.user_id
    });
    return { insertId };
};

export const userCartCourse = async (user_id) => {
    const results = await pool('courses as c')
        .select(
            'c.id',
            'c.author',
            'c.category',
            'c.price',
            'c.rating',
            'c.subtitle',
            'c.thumb_url',
            'c.title'
        )
        .join('cart as ct', 'ct.course_id', 'c.id')
        .where('ct.user_id', user_id)
        .orderBy('ct.id', 'desc');
    return results;
};

export const removeCartCourseById = async (data) => {
    const affectedRows = await pool('cart')
        .where({ course_id: data.course_id, user_id: data.user_id })
        .del();
    return { affectedRows };
};

export const getCartSummary = async (userId) => {
    const result = await pool('cart as ct')
        .select(
            pool.raw('COUNT(*) AS itemCount'),
            pool.raw('COALESCE(SUM(c.price), 0) AS totalAmount')
        )
        .join('courses as c', 'c.id', 'ct.course_id')
        .where('ct.user_id', userId)
        .first();
    return result;
};
