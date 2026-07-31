import * as notificationService from './notification.service.js';
import { sendError, sendSuccess } from '../../utils/apiResponse.js';

/**
 * The authenticated user's notification feed plus their unread count.
 */
export const listNotifications = async (req, res) => {
    try {
        const data = await notificationService.getFeed(req.user.id);
        return sendSuccess(res, { message: 'Notifications fetched.', data });
    } catch (error) {
        console.error(error);
        return sendError(res, { statusCode: 500, message: 'Unable to fetch notifications.' });
    }
};

/**
 * Mark one notification read, or all of them with `{ all: true }`.
 */
export const markRead = async (req, res) => {
    try {
        if (req.body?.all) {
            const count = await notificationService.readAll(req.user.id);
            return sendSuccess(res, { message: 'All notifications marked read.', data: { count } });
        }

        const notificationId = Number.parseInt(req.body?.id, 10);
        if (!Number.isInteger(notificationId) || notificationId <= 0) {
            return sendError(res, { statusCode: 400, message: 'A notification id (or all: true) is required.' });
        }

        const count = await notificationService.readOne({ userId: req.user.id, notificationId });
        if (!count) return sendError(res, { statusCode: 404, message: 'Notification not found.' });

        return sendSuccess(res, { message: 'Notification marked read.', data: { count } });
    } catch (error) {
        console.error(error);
        return sendError(res, { statusCode: 500, message: 'Unable to update notifications.' });
    }
};
