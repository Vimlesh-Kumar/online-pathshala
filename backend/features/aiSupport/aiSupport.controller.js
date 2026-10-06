import { getAllFaqs } from './faq.data.js';
import * as aiSupport from './aiSupport.service.js';
import { sendError, sendSuccess } from '../../utils/apiResponse.js';

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

/**
 * AI study tutor: streams a reply as plain text chunks so the learner sees
 * it being written. Grounded in the course outline and current lesson.
 * Validation errors are normal JSON responses; once streaming starts, any
 * failure is handled inside the stream (see streamTutorReply).
 */
export const studyTutorChat = async (req, res) => {
    const courseId = Number.parseInt(req.body?.courseId, 10);
    const lessonId = Number.parseInt(req.body?.lessonId, 10) || null;
    const history = aiSupport.sanitizeTutorHistory(req.body?.messages);
    if (!Number.isInteger(courseId) || courseId <= 0 || !history) {
        return sendError(res, { statusCode: 400, message: 'A valid course id and a question are required.' });
    }

    let context;
    try {
        context = await aiSupport.loadTutorContext(courseId, lessonId);
    } catch (err) {
        console.error(err);
        return sendError(res, { statusCode: 500, message: 'The tutor is unavailable right now.' });
    }
    if (!context) {
        return sendError(res, { statusCode: 404, message: 'Course not found.' });
    }

    // If the learner leaves mid-answer, stop generating (and spending quota).
    const disconnected = new AbortController();
    res.on('close', () => {
        if (!res.writableFinished) disconnected.abort();
    });

    res.status(200).set({
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        // Stops reverse proxies (nginx, Render) from buffering the stream into one chunk.
        'X-Accel-Buffering': 'no'
    });
    res.flushHeaders();

    try {
        for await (const chunk of aiSupport.streamTutorReply(context, history, disconnected.signal)) {
            if (disconnected.signal.aborted) break;
            res.write(chunk);
        }
    } catch (err) {
        console.error(err);
    } finally {
        res.end();
    }
};

/**
 * One-line "why you'd like this" for the recommendations on screen.
 */
export const explainRecommendations = async (req, res) => {
    try {
        const raw = Array.isArray(req.body?.courseIds) ? req.body.courseIds : [];
        const courseIds = [...new Set(raw.map((id) => Number.parseInt(id, 10)))]
            .filter((id) => Number.isInteger(id) && id > 0)
            .slice(0, 12);
        if (!courseIds.length) {
            return sendError(res, { statusCode: 400, message: 'At least one course id is required.' });
        }
        const result = await aiSupport.explainRecommendations(req.user.id, courseIds);
        return sendSuccess(res, { message: 'Reasons generated.', data: result });
    } catch (err) {
        console.error(err);
        return sendError(res, { statusCode: 500, message: 'Unable to explain recommendations.' });
    }
};

/**
 * "Describe what you want to learn" search, used when a plain keyword search
 * finds nothing.
 */
export const smartSearch = async (req, res) => {
    try {
        const query = String(req.query?.q || '').trim().slice(0, 300);
        if (!query) {
            return sendError(res, { statusCode: 400, message: 'Tell us what you want to learn.' });
        }
        const result = await aiSupport.smartSearch(query);
        return sendSuccess(res, { message: 'Search results fetched.', data: result });
    } catch (err) {
        console.error(err);
        return sendError(res, { statusCode: 500, message: 'Unable to search right now.' });
    }
};
