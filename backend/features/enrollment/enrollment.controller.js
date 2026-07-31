import * as enrollmentServices from './enrollment.services.js';
import * as momentumService from '../momentum/momentum.service.js';
import * as notificationService from '../notification/notification.service.js';
import { sendError, sendSuccess } from '../../utils/apiResponse.js';
import { getCourseIdFromBody } from '../../utils/request.js';

/**
 * Legacy enrollment entry (course_id + user_id in the body).
 */
export const enrollment = async (req, res) => {
    try {
        const courseId = getCourseIdFromBody(req.body);
        const userId = Number.parseInt(req.body?.user_id, 10);

        if (!courseId || !Number.isInteger(userId) || userId <= 0) {
            return sendError(res, {
                statusCode: 400,
                message: 'course_id and user_id are required.'
            });
        }

        const result = await enrollmentServices.enrolling({ course_id: courseId, user_id: userId });
        return sendSuccess(res, {
            statusCode: 201,
            message: 'Enrollment Success!!',
            data: result
        });
    } catch (err) {
        console.error(err);
        return sendError(res, {
            statusCode: 500,
            message: 'Unable to insert Enrollment details.'
        });
    }
};

/**
 * Free enrollment for the authenticated user (idempotent).
 */
export const enrollFree = async (req, res) => {
    try {
        const courseId = getCourseIdFromBody(req.body);
        if (!courseId) {
            return sendError(res, { statusCode: 400, message: 'course_id is required.' });
        }

        const result = await enrollmentServices.enrolling({ course_id: courseId, user_id: req.user.id });
        return sendSuccess(res, {
            statusCode: 201,
            message: 'Enrolled successfully.',
            data: result
        });
    } catch (err) {
        console.error(err);
        return sendError(res, { statusCode: 500, message: 'Unable to enroll in this course.' });
    }
};

/**
 * Progress for the authenticated user in a course:
 * completed lesson ids, percentage and completion flag.
 */
export const getCourseProgress = async (req, res) => {
    try {
        const courseId = Number.parseInt(req.params.id, 10);
        if (!courseId) {
            return sendError(res, { statusCode: 400, message: 'A valid course id is required.' });
        }

        const enrollment = await enrollmentServices.getEnrollment(courseId, req.user.id);
        if (!enrollment) {
            return sendSuccess(res, {
                message: 'Not enrolled.',
                data: { enrolled: false, progress: 0, isCompleted: false, completedLessonIds: [] }
            });
        }

        const completedLessonIds = await enrollmentServices.getCompletedLessonIds(enrollment.id);
        const totalLessons = await enrollmentServices.countCourseLessons(courseId);
        const cert = await enrollmentServices.getCertificate(enrollment.id);

        return sendSuccess(res, {
            message: 'Progress fetched.',
            data: {
                enrolled: true,
                enrollmentId: enrollment.id,
                progress: Number(enrollment.progress) || 0,
                isCompleted: !!enrollment.is_completed,
                completedLessonIds,
                totalLessons,
                certificateKey: cert ? cert.certificate_key : null
            }
        });
    } catch (err) {
        console.error(err);
        return sendError(res, { statusCode: 500, message: 'Unable to fetch progress.' });
    }
};

/**
 * Mark a lesson complete and recompute course progress.
 */
export const updateLessonProgress = async (req, res) => {
    try {
        const courseId = getCourseIdFromBody(req.body);
        const lessonId = Number.parseInt(req.body?.lesson_id, 10);
        if (!courseId || !Number.isInteger(lessonId) || lessonId <= 0) {
            return sendError(res, { statusCode: 400, message: 'course_id and lesson_id are required.' });
        }

        // Ensure the learner is enrolled (auto-enroll on first progress event).
        const enrollment = await enrollmentServices.enrolling({ course_id: courseId, user_id: req.user.id });

        const newlyCompleted = await enrollmentServices.markLessonComplete(enrollment.id, lessonId);
        const result = await enrollmentServices.recalculateProgress(enrollment.id, courseId);

        // Only a first completion counts towards the learner's streak.
        if (newlyCompleted) await momentumService.recordActivity(req.user.id, 'lesson');

        return sendSuccess(res, {
            message: 'Progress updated.',
            data: {
                progress: result.progress,
                isCompleted: result.isCompleted,
                completedLessonIds: result.completedIds
            }
        });
    } catch (err) {
        console.error(err);
        return sendError(res, { statusCode: 500, message: 'Unable to update progress.' });
    }
};

/**
 * Issue a certificate for the authenticated user in a course.
 */
export const issueCertificate = async (req, res) => {
    try {
        const courseId = Number.parseInt(req.params.id, 10);
        const { certificateKey } = req.body;
        if (!courseId || !certificateKey) {
            return sendError(res, { statusCode: 400, message: 'course id and certificateKey are required.' });
        }

        const enrollment = await enrollmentServices.getEnrollment(courseId, req.user.id);
        if (!enrollment) {
            return sendError(res, { statusCode: 404, message: 'Enrollment not found.' });
        }

        const result = await enrollmentServices.issueCertificate(enrollment.id, certificateKey);

        await notificationService.notify(req.user.id, {
            type: 'certificate',
            title: 'Certificate earned 🎓',
            body: `Your certificate ${result.certificate_key} is ready to share.`,
            link: `/verify/${result.certificate_key}`
        });

        return sendSuccess(res, {
            message: 'Certificate issued successfully.',
            data: result
        });
    } catch (err) {
        console.error(err);
        return sendError(res, { statusCode: 500, message: 'Unable to issue certificate.' });
    }
};

/**
 * Remember where the learner paused a lesson so the next visit resumes there.
 */
export const savePlaybackPosition = async (req, res) => {
    try {
        const courseId = getCourseIdFromBody(req.body);
        const lessonId = Number.parseInt(req.body?.lesson_id, 10);
        const positionSeconds = Number.parseInt(req.body?.position_seconds, 10);

        if (!courseId || !Number.isInteger(lessonId) || lessonId <= 0) {
            return sendError(res, { statusCode: 400, message: 'course_id and lesson_id are required.' });
        }

        await enrollmentServices.savePlaybackPosition({
            userId: req.user.id,
            courseId,
            lessonId,
            positionSeconds: Number.isInteger(positionSeconds) && positionSeconds > 0 ? positionSeconds : 0
        });

        return sendSuccess(res, { message: 'Playback position saved.' });
    } catch (err) {
        console.error(err);
        return sendError(res, { statusCode: 500, message: 'Unable to save playback position.' });
    }
};

/**
 * Saved playback positions for every lesson of a course, keyed by lesson id.
 */
export const getPlaybackPositions = async (req, res) => {
    try {
        const courseId = Number.parseInt(req.params.id, 10);
        if (!courseId) {
            return sendError(res, { statusCode: 400, message: 'A valid course id is required.' });
        }

        const rows = await enrollmentServices.getPlaybackPositions({ userId: req.user.id, courseId });
        const positions = {};
        for (const row of rows) positions[row.lesson_id] = Number(row.position_seconds) || 0;

        return sendSuccess(res, { message: 'Playback positions fetched.', data: positions });
    } catch (err) {
        console.error(err);
        return sendError(res, { statusCode: 500, message: 'Unable to fetch playback positions.' });
    }
};
