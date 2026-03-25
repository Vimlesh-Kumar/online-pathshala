import * as enrollmentServices from '../services/enrollment.services.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';
import { getCourseIdFromBody } from '../utils/request.js';

/**
 * Create an enrollment entry for a course purchase or free join action.
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

        const body = { course_id: courseId, user_id: userId };
        const result = await enrollmentServices.enrolling(body);

        return sendSuccess(res, {
            statusCode: 201,
            message: "Enrollment Success!!",
            data: result
        });
    } catch (err) {
        console.error(err);
        return sendError(res, {
            statusCode: 500,
            message: "Unable to insert Enrollment details."
        });
    }
};
