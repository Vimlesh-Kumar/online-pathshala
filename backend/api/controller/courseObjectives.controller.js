import * as objectiveServices from '../services/courseObjectives.service.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';

/**
 * Insert multiple course objectives for a course.
 */
export const courseObjectives = async (req, res) => {
    try {
        const objectives = Array.isArray(req.body?.objectives) ? req.body.objectives : [];
        const courseId = Number.parseInt(req.body?.course_id, 10);

        if (!courseId || objectives.length === 0) {
            return sendError(res, {
                statusCode: 400,
                message: 'course_id and a non-empty objectives array are required.'
            });
        }

        const allObjectives = objectives.map(element => {
            return [element.objective, courseId];
        });

        const result = await objectiveServices.addingObjectivesInDB(allObjectives);

        return sendSuccess(res, {
            statusCode: 201,
            message: "Objective Inserted!",
            data: result
        });
    } catch (err) {
        console.error(err);
        return sendError(res, {
            statusCode: 500,
            message: "Problem in Objectives inserting."
        });
    }
};

/**
 * Fetch all objectives for a course.
 */
export const getObjectives = async (req, res) => {
    try {
        const course_id = req.params.id;
        const result = await objectiveServices.gettingObjectivesFromDB(course_id);

        return sendSuccess(res, {
            message: "Objectives fetched.",
            data: result
        });
    } catch (error) {
        console.error(error);
        return sendError(res, {
            statusCode: 500,
            message: "Problem in finding Objectives."
        });
    }
};

/**
 * Update a single objective text value.
 */
export const updateObjective = async (req, res) => {
    try {
        if (!req.body?.id || !req.body?.objective) {
            return sendError(res, {
                statusCode: 400,
                message: 'id and objective are required.'
            });
        }

        const result = await objectiveServices.updateObjectiveInDB(req.body);

        return sendSuccess(res, {
            message: "Objective Updated Successfully!!",
            data: result
        });
    } catch (error) {
        console.error(error);
        return sendError(res, {
            statusCode: 500,
            message: "Problem in updating Objectives."
        });
    }
};

/**
 * Delete a course objective by identifier.
 */
export const deleteObjective = async (req, res) => {
    try {
        const result = await objectiveServices.deleteObj(req.params.id);

        return sendSuccess(res, {
            message: "Objective deleted Successfully!!",
            data: result
        });
    } catch (error) {
        console.error(error);
        return sendError(res, {
            statusCode: 500,
            message: "Problem in deleting Objective."
        });
    }
};
