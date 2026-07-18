import pool from '../../database/database.js';

/**
 * Persist one order_details row per purchased course.
 * order_details.tranaction_id is UNIQUE, so each row gets `<ref>#<courseId>`
 * and receipts are grouped back together by the shared `<ref>` prefix.
 */
export const createOrderRows = async ({ ref, userId, paymentMethod, items }) => {
    const values = items.map((item) => [
        `${ref}#${item.course_id}`,
        paymentMethod,
        item.paid,
        item.course_id,
        userId
    ]);

    await pool.query(
        'INSERT INTO order_details (tranaction_id, payment_method, total_paid, course_id, user_id) VALUES ?',
        [values]
    );
};

/**
 * List a user's receipts (grouped checkouts), newest first.
 */
export const getUserOrders = async (userId) => {
    const [rows] = await pool.query(
        `SELECT
            SUBSTRING_INDEX(o.tranaction_id, '#', 1) AS ref,
            MIN(o.created_at) AS created_at,
            MIN(o.payment_method) AS payment_method,
            SUM(o.total_paid) AS total_paid,
            COUNT(*) AS item_count,
            GROUP_CONCAT(c.title ORDER BY c.title SEPARATOR '||') AS titles
         FROM order_details o
         INNER JOIN courses c ON c.id = o.course_id
         WHERE o.user_id = ?
         GROUP BY ref
         ORDER BY created_at DESC`,
        [userId]
    );

    return rows.map((r) => ({
        ref: r.ref,
        createdAt: r.created_at,
        paymentMethod: r.payment_method,
        total: Number(r.total_paid) || 0,
        itemCount: r.item_count,
        titles: r.titles ? r.titles.split('||') : []
    }));
};

/**
 * Empty the user's cart after a successful checkout.
 */
export const clearUserCart = async (userId) => {
    await pool.query('DELETE FROM cart WHERE user_id = ?', [userId]);
};
