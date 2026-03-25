import * as sectionLecturesServices from "../services/sectionLectures.services.js";
import { sendError, sendSuccess } from '../utils/apiResponse.js';

/**
 * Save multiple lectures for a course section.
 */
export const sectionLectures = async (req, res) => {
    try {
        const lectures = req.body;
        const allLectures = Object.values(lectures).map(element => Object.values(element));

        if (allLectures.length === 0) {
            return sendError(res, {
                statusCode: 400,
                message: 'At least one lecture is required.'
            });
        }

        const result = await sectionLecturesServices.addLectures(allLectures);
        return sendSuccess(res, {
            statusCode: 201,
            message: 'All lectures for this section were inserted.',
            data: result
        });
    } catch (error) {
        console.error(error);
        return sendError(res, {
            statusCode: 500,
            message: 'Problem inserting lectures.'
        });
    }
};

/**
 * Fetch all section lectures for a tutor's course editor.
 */
export const allSectionForTutur = async (req, res) => {
    try {
        if (!req.query.course_id) {
            return sendError(res, {
                statusCode: 400,
                message: 'course_id query parameter is required.'
            });
        }

        const result = await sectionLecturesServices.allSectionsbycourseId(req.query.course_id);
        return sendSuccess(res, {
            message: 'All section lectures fetched successfully.',
            data: result
        });
    } catch (error) {
        console.error(error);
        return sendError(res, {
            statusCode: 500,
            message: 'Problem finding all sections with lectures.'
        });
    }
};
