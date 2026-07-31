import * as announcementService from './announcement.service.js';
import { sendError, sendSuccess } from '../../utils/apiResponse.js';

const parseId = (value) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

/**
 * Announcements for a course — readable by anyone browsing it.
 */
export const listCourseAnnouncements = async (req, res) => {
    try {
        const courseId = parseId(req.params.id);
        if (!courseId) return sendError(res, { statusCode: 400, message: 'A valid course id is required.' });

        const announcements = await announcementService.getCourseAnnouncements(courseId);
        return sendSuccess(res, { message: 'Announcements fetched.', data: announcements });
    } catch (error) {
        console.error(error);
        return sendError(res, { statusCode: 500, message: 'Unable to fetch announcements.' });
    }
};

/**
 * Everything the authenticated instructor has posted, newest first.
 */
export const listMyAnnouncements = async (req, res) => {
    try {
        const announcements = await announcementService.getAuthorAnnouncements(req.user.id);
        return sendSuccess(res, { message: 'Announcements fetched.', data: announcements });
    } catch (error) {
        console.error(error);
        return sendError(res, { statusCode: 500, message: 'Unable to fetch your announcements.' });
    }
};

/**
 * Post an announcement to a course the instructor owns.
 */
export const createAnnouncement = async (req, res) => {
    try {
        const courseId = parseId(req.params.id);
        const title = String(req.body?.title || '').trim().slice(0, 200);
        const content = String(req.body?.content || '').trim().slice(0, 2000);

        if (!courseId || !title || !content) {
            return sendError(res, {
                statusCode: 400,
                message: 'A course id, title and message are required.'
            });
        }

        const { allowed, reason, course } = await announcementService.canAnnounce({
            userId: req.user.id,
            courseId
        });
        if (!allowed) {
            return reason === 'not-found'
                ? sendError(res, { statusCode: 404, message: 'Course not found.' })
                : sendError(res, {
                      statusCode: 403,
                      message: 'Only the course instructor can post announcements.'
                  });
        }

        const announcement = await announcementService.createAnnouncement({
            userId: req.user.id,
            courseId,
            title,
            content,
            course
        });

        return sendSuccess(res, { statusCode: 201, message: 'Announcement posted.', data: announcement });
    } catch (error) {
        console.error(error);
        return sendError(res, { statusCode: 500, message: 'Unable to post announcement.' });
    }
};

/**
 * Delete an announcement the instructor wrote.
 */
export const deleteAnnouncement = async (req, res) => {
    try {
        const announcementId = parseId(req.params.announcementId);
        if (!announcementId) {
            return sendError(res, { statusCode: 400, message: 'A valid announcement id is required.' });
        }

        const removed = await announcementService.removeAnnouncement({
            announcementId,
            userId: req.user.id
        });
        if (!removed) return sendError(res, { statusCode: 404, message: 'Announcement not found.' });

        return sendSuccess(res, { message: 'Announcement deleted.' });
    } catch (error) {
        console.error(error);
        return sendError(res, { statusCode: 500, message: 'Unable to delete announcement.' });
    }
};
