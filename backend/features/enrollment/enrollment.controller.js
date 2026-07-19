import * as enrollmentServices from './enrollment.services.js';
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

        return sendSuccess(res, {
            message: 'Progress fetched.',
            data: {
                enrolled: true,
                enrollmentId: enrollment.id,
                progress: Number(enrollment.progress) || 0,
                isCompleted: !!enrollment.is_completed,
                completedLessonIds,
                totalLessons
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

        await enrollmentServices.markLessonComplete(enrollment.id, lessonId);
        const result = await enrollmentServices.recalculateProgress(enrollment.id, courseId);

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
