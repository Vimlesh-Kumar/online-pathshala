import pool from '../../database/database.js';

export const findWishlistItem = async (data) => {
    const result = await pool('wishlist')
        .select('id')
        .where({ course_id: data.course_id, user_id: data.user_id })
        .first();
    return result || null;
};

export const addToWishList = async (data) => {
    const [insertId] = await pool('wishlist').insert({
        course_id: data.course_id,
        user_id: data.user_id
    });
    return { insertId };
};

export const removewishlistCourseFromDB = async (data) => {
    const affectedRows = await pool('wishlist')
        .where({ course_id: data.course_id, user_id: data.user_id })
        .del();
    return { affectedRows };
};

export const allCoursesOfUserInWishlist = async (id) => {
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
        .join('wishlist as w', 'w.course_id', 'c.id')
        .where('w.user_id', id)
        .orderBy('w.id', 'desc');
    return results;
};
