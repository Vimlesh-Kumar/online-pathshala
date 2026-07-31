import * as notificationRepository from './notification.repository.js';

/** How many notifications the bell keeps in view. */
export const FEED_LIMIT = 30;

const toRow = (userId, { type, title, body = null, link = null }) => ({
    user_id: userId,
    type,
    title: String(title).slice(0, 200),
    body: body === null ? null : String(body).slice(0, 500),
    link: link === null ? null : String(link).slice(0, 255)
});

/**
 * Notify a single user.
 *
 * Notifications are a side effect of some other action (an answer was posted,
 * a certificate was issued, ...). A failure here must never fail that action,
 * so problems are logged and swallowed.
 */
export const notify = async (userId, payload) => {
    try {
        await notificationRepository.insertMany([toRow(userId, payload)]);
    } catch (error) {
        console.error('Failed to create notification:', error.message);
    }
};

/**
 * Notify every learner enrolled in a course, except the sender.
 */
export const notifyCourse = async ({ courseId, exceptUserId = null, ...payload }) => {
    try {
        const userIds = await notificationRepository.enrolledUserIds({ courseId, exceptUserId });
        await notificationRepository.insertMany(userIds.map((userId) => toRow(userId, payload)));
        return userIds.length;
    } catch (error) {
        console.error('Failed to broadcast notification:', error.message);
        return 0;
    }
};

export const getFeed = async (userId) => {
    const [items, unreadCount] = await Promise.all([
        notificationRepository.listForUser({ userId, limit: FEED_LIMIT }),
        notificationRepository.countUnread(userId)
    ]);
    return {
        items: items.map((item) => ({ ...item, is_read: Boolean(item.is_read) })),
        unreadCount
    };
};

export const readOne = async ({ userId, notificationId }) =>
    notificationRepository.markRead({ userId, notificationId });

export const readAll = async (userId) => notificationRepository.markAllRead(userId);
