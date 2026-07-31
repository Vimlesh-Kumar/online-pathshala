import pool from '../../database/database.js';

export const listForCourse = async (courseId) => {
    const results = await pool('course_announcements as a')
        .select('a.id', 'a.course_id', 'a.title', 'a.content', 'a.created_at', 'u.full_name as author')
        .join('users as u', 'u.id', 'a.user_id')
        .where('a.course_id', courseId)
        .orderBy('a.id', 'desc');
    return results;
};

/**
 * Latest announcements across every course a tutor authored — the feed shown
 * on the instructor dashboard.
 */
export const listForAuthor = async ({ userId, limit }) => {
    const results = await pool('course_announcements as a')
        .select('a.id', 'a.course_id', 'a.title', 'a.content', 'a.created_at', 'c.title as course_title')
        .join('courses as c', 'c.id', 'a.course_id')
        .where('a.user_id', userId)
        .orderBy('a.id', 'desc')
        .limit(limit);
    return results;
};

export const findById = async (announcementId) => {
    const result = await pool('course_announcements').where('id', announcementId).first();
    return result || null;
};

export const insertAnnouncement = async ({ courseId, userId, title, content }) => {
    const [insertId] = await pool('course_announcements').insert({
        course_id: courseId,
        user_id: userId,
        title,
        content
    });
    return insertId;
};

export const deleteAnnouncement = async ({ announcementId, userId }) => {
    const affectedRows = await pool('course_announcements')
        .where({ id: announcementId, user_id: userId })
        .del();
    return affectedRows;
};

export const findCourse = async (courseId) => {
    const result = await pool('courses')
        .select('id', 'title', 'author', 'owner_user_id')
        .where('id', courseId)
        .first();
    return result || null;
};

export const findUser = async (userId) => {
    const result = await pool('users').select('id', 'full_name', 'user_role').where('id', userId).first();
    return result || null;
};
