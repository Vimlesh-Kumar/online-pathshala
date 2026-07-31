import pool from '../../database/database.js';

export const insertMany = async (rows) => {
    if (!rows.length) return 0;
    await pool('notifications').insert(rows);
    return rows.length;
};

export const listForUser = async ({ userId, limit }) => {
    const results = await pool('notifications')
        .select('id', 'type', 'title', 'body', 'link', 'is_read', 'created_at')
        .where('user_id', userId)
        .orderBy('id', 'desc')
        .limit(limit);
    return results;
};

export const countUnread = async (userId) => {
    const row = await pool('notifications').count('* as count').where({ user_id: userId, is_read: false }).first();
    return Number(row.count) || 0;
};

export const markRead = async ({ userId, notificationId }) => {
    const affectedRows = await pool('notifications')
        .where({ id: notificationId, user_id: userId })
        .update({ is_read: true });
    return affectedRows;
};

export const markAllRead = async (userId) => {
    const affectedRows = await pool('notifications')
        .where({ user_id: userId, is_read: false })
        .update({ is_read: true });
    return affectedRows;
};

/**
 * Everyone enrolled in a course, optionally excluding one user (usually the
 * person who triggered the notification).
 */
export const enrolledUserIds = async ({ courseId, exceptUserId = null }) => {
    const query = pool('enrollment').distinct('user_id').where('course_id', courseId);
    if (exceptUserId) query.whereNot('user_id', exceptUserId);
    const rows = await query;
    return rows.map((row) => row.user_id);
};
