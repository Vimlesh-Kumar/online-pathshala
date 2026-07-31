import pool from '../../database/database.js';

export const createOrderRows = async ({ ref, userId, paymentMethod, items }) => {
    const rows = items.map((item) => ({
        tranaction_id: `${ref}#${item.course_id}`,
        payment_method: paymentMethod,
        total_paid: item.paid,
        course_id: item.course_id,
        user_id: userId
    }));

    await pool('order_details').insert(rows);
};

export const getUserOrders = async (userId) => {
    const rows = await pool('order_details as o')
        .select(
            pool.raw("SUBSTRING_INDEX(o.tranaction_id, '#', 1) AS ref"),
            pool.raw('MIN(o.created_at) AS created_at'),
            pool.raw('MIN(o.payment_method) AS payment_method'),
            pool.raw('SUM(o.total_paid) AS total_paid'),
            pool.raw('COUNT(*) AS item_count'),
            pool.raw("GROUP_CONCAT(c.title ORDER BY c.title SEPARATOR '||') AS titles")
        )
        .join('courses as c', 'c.id', 'o.course_id')
        .where('o.user_id', userId)
        .groupBy('ref')
        .orderBy('created_at', 'desc');

    return rows;
};

export const clearUserCart = async (userId) => {
    await pool('cart').where('user_id', userId).del();
};
