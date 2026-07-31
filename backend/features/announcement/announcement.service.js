import * as announcementRepository from './announcement.repository.js';
import * as notificationService from '../notification/notification.service.js';

/** Announcements shown in the instructor's own feed. */
const AUTHOR_FEED_LIMIT = 20;

export const getCourseAnnouncements = async (courseId) => announcementRepository.listForCourse(courseId);

export const getAuthorAnnouncements = async (userId) =>
    announcementRepository.listForAuthor({ userId, limit: AUTHOR_FEED_LIMIT });

/**
 * Whether a user may post announcements to a course.
 *
 * Ownership is `courses.owner_user_id`. Courses created before that column
 * existed may still have it unset, so those fall back to matching the display
 * name in `courses.author` — never a match when the owner is known. Admins can
 * post anywhere.
 */
export const canAnnounce = async ({ userId, courseId }) => {
    const [course, user] = await Promise.all([
        announcementRepository.findCourse(courseId),
        announcementRepository.findUser(userId)
    ]);

    if (!course || !user) return { allowed: false, reason: 'not-found', course, user };
    if (user.user_role === 'Admin') return { allowed: true, course, user };
    if (user.user_role !== 'Tutor') return { allowed: false, reason: 'not-tutor', course, user };

    const owns = course.owner_user_id
        ? course.owner_user_id === user.id
        : course.author === user.full_name;

    return owns ? { allowed: true, course, user } : { allowed: false, reason: 'not-owner', course, user };
};

/**
 * Post an announcement and push it to everyone enrolled in the course.
 */
export const createAnnouncement = async ({ userId, courseId, title, content, course }) => {
    const id = await announcementRepository.insertAnnouncement({ courseId, userId, title, content });

    await notificationService.notifyCourse({
        courseId,
        exceptUserId: userId,
        type: 'announcement',
        title: `New announcement in ${course.title}`,
        body: title,
        link: `/learn/${courseId}`
    });

    return { id, course_id: courseId, title, content, created_at: new Date() };
};

export const removeAnnouncement = async ({ announcementId, userId }) => {
    const affectedRows = await announcementRepository.deleteAnnouncement({ announcementId, userId });
    return affectedRows > 0;
};
