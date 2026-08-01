import * as practiceService from './practice.service.js';
import { sendError, sendSuccess } from '../../utils/apiResponse.js';

const lessonIdFrom = (value) => (value ? Number(value) : null);

/** A round of practice questions for a course, optionally scoped to one lesson. */
export const getRound = async (req, res) => {
    try {
        const result = await practiceService.getRound({
            userId: req.user.id,
            courseId: Number(req.params.id),
            lessonId: lessonIdFrom(req.query.lesson_id),
            refresh: req.query.refresh === 'true'
        });
        if (result.error) {
            return sendError(res, { statusCode: 400, message: result.error });
        }
        return sendSuccess(res, { message: 'Practice round ready.', data: result });
    } catch (error) {
        console.error(error);
        return sendError(res, { statusCode: 500, message: 'Unable to build a practice round.' });
    }
};

/** Grade a submitted round and return per-question feedback. */
export const submitRound = async (req, res) => {
    try {
        const result = await practiceService.submitRound({
            userId: req.user.id,
            courseId: Number(req.params.id),
            lessonId: lessonIdFrom(req.body.lesson_id),
            answers: req.body.answers
        });
        if (result.error) {
            return sendError(res, { statusCode: 400, message: result.error });
        }
        return sendSuccess(res, { message: 'Practice round scored.', data: result });
    } catch (error) {
        console.error(error);
        return sendError(res, { statusCode: 500, message: 'Unable to score that round.' });
    }
};

/** Attempt history for one course. */
export const getHistory = async (req, res) => {
    try {
        const data = await practiceService.getHistory({
            userId: req.user.id,
            courseId: Number(req.params.id)
        });
        return sendSuccess(res, { message: 'Practice history fetched.', data });
    } catch (error) {
        console.error(error);
        return sendError(res, { statusCode: 500, message: 'Unable to fetch your practice history.' });
    }
};
