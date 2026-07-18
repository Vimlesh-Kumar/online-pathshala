import { getAllFaqs } from '../services/faq.data.js';
import * as aiSupport from '../services/aiSupport.service.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';

/**
 * Support chatbot for general app questions. Uses Groq (free tier) for a
 * real conversational answer when GROQ_API_KEY is configured, and always
 * falls back to the free keyword-matching FAQ engine otherwise — so this
 * endpoint never goes down and never costs anything to run.
 */
export const askSupport = async (req, res) => {
    try {
        const message = String(req.body?.message || '').trim();
        if (!message) {
            return sendError(res, { statusCode: 400, message: 'A message is required.' });
        }
        const result = await aiSupport.answerGeneralSupportQuestion(message);
        return sendSuccess(res, { message: 'Answered.', data: result });
    } catch (err) {
        console.error(err);
        return sendError(res, { statusCode: 500, message: 'Unable to answer right now.' });
    }
};

export const listFaqs = async (req, res) => {
    try {
        return sendSuccess(res, { message: 'FAQs fetched.', data: getAllFaqs() });
    } catch (err) {
        console.error(err);
        return sendError(res, { statusCode: 500, message: 'Unable to fetch FAQs.' });
    }
};

/**
 * Answer a question about one specific course by searching its own content.
 */
export const askAboutCourse = async (req, res) => {
    try {
        const courseId = Number.parseInt(req.params.id, 10);
        const question = String(req.body?.question || '').trim();
        if (!Number.isInteger(courseId) || courseId <= 0 || !question) {
            return sendError(res, { statusCode: 400, message: 'A valid course id and question are required.' });
        }
        const result = await aiSupport.answerCourseQuestion(courseId, question);
        return sendSuccess(res, { message: 'Answered.', data: result });
    } catch (err) {
        console.error(err);
        return sendError(res, { statusCode: 500, message: 'Unable to answer right now.' });
    }
};

/**
 * Template-based title/subtitle/objective suggestions for tutors.
 */
export const suggestCourseCopy = async (req, res) => {
    try {
        const title = String(req.body?.title || '').trim();
        const category = String(req.body?.category || '').trim();
        if (!title) {
            return sendError(res, { statusCode: 400, message: 'A working title is required to generate suggestions.' });
        }
        const result = await aiSupport.suggestCourseCopy(title, category);
        return sendSuccess(res, { message: 'Suggestions generated.', data: result });
    } catch (err) {
        console.error(err);
        return sendError(res, { statusCode: 500, message: 'Unable to generate suggestions.' });
    }
};

/**
 * Personalized course recommendations based on enrollment/wishlist categories.
 */
export const getRecommendations = async (req, res) => {
    try {
        const result = await aiSupport.getRecommendationsForUser(req.user.id, 8);
        return sendSuccess(res, { message: 'Recommendations fetched.', data: result });
    } catch (err) {
        console.error(err);
        return sendError(res, { statusCode: 500, message: 'Unable to fetch recommendations.' });
    }
};
