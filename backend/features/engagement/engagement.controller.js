import * as engagement from './engagement.service.js';
import { sendError, sendSuccess } from '../../utils/apiResponse.js';

const parseId = (v) => {
    const n = Number.parseInt(v, 10);
    return Number.isInteger(n) && n > 0 ? n : null;
};

/* ── Reviews ── */

export const listReviews = async (req, res) => {
    try {
        const courseId = parseId(req.params.id);
        if (!courseId) return sendError(res, { statusCode: 400, message: 'Invalid course id.' });

        const [reviews, stats] = await Promise.all([
            engagement.getReviews(courseId),
            engagement.getReviewStats(courseId)
        ]);
        return sendSuccess(res, { message: 'Reviews fetched.', data: { reviews, stats } });
    } catch (err) {
        console.error(err);
        return sendError(res, { statusCode: 500, message: 'Unable to fetch reviews.' });
    }
};

export const postReview = async (req, res) => {
    try {
        const courseId = parseId(req.params.id);
        const rating = Number(req.body?.rating);
        const content = String(req.body?.content || '').trim();
        if (!courseId || !(rating >= 1 && rating <= 5)) {
            return sendError(res, { statusCode: 400, message: 'A course id and rating (1-5) are required.' });
        }
        await engagement.upsertReview(courseId, req.user.id, rating, content.slice(0, 100));
        return sendSuccess(res, { statusCode: 201, message: 'Review saved.' });
    } catch (err) {
        console.error(err);
        return sendError(res, { statusCode: 500, message: 'Unable to save review.' });
    }
};

/* ── Q&A ── */

export const listQuestions = async (req, res) => {
    try {
        const courseId = parseId(req.params.id);
        if (!courseId) return sendError(res, { statusCode: 400, message: 'Invalid course id.' });
        const questions = await engagement.getQuestions(courseId);
        return sendSuccess(res, { message: 'Q&A fetched.', data: questions });
    } catch (err) {
        console.error(err);
        return sendError(res, { statusCode: 500, message: 'Unable to fetch Q&A.' });
    }
};

export const postQuestion = async (req, res) => {
    try {
        const courseId = parseId(req.params.id);
        const content = String(req.body?.content || '').trim();
        if (!courseId || !content) {
            return sendError(res, { statusCode: 400, message: 'A course id and question text are required.' });
        }
        const id = await engagement.addQuestion(courseId, req.user.id, content.slice(0, 1000));
        return sendSuccess(res, { statusCode: 201, message: 'Question posted.', data: { id } });
    } catch (err) {
        console.error(err);
        return sendError(res, { statusCode: 500, message: 'Unable to post question.' });
    }
};

export const postAnswer = async (req, res) => {
    try {
        const questionId = parseId(req.params.qid);
        const content = String(req.body?.content || '').trim();
        if (!questionId || !content) {
            return sendError(res, { statusCode: 400, message: 'A question id and answer text are required.' });
        }
        const id = await engagement.addAnswer(questionId, req.user.id, content.slice(0, 1000));
        return sendSuccess(res, { statusCode: 201, message: 'Answer posted.', data: { id } });
    } catch (err) {
        console.error(err);
        return sendError(res, { statusCode: 500, message: 'Unable to post answer.' });
    }
};

/* ── Quiz ── */

export const getQuiz = async (req, res) => {
    try {
        const courseId = parseId(req.params.id);
        if (!courseId) return sendError(res, { statusCode: 400, message: 'Invalid course id.' });
        const questions = await engagement.getQuiz(courseId);
        return sendSuccess(res, { message: 'Quiz fetched.', data: questions });
    } catch (err) {
        console.error(err);
        return sendError(res, { statusCode: 500, message: 'Unable to fetch quiz.' });
    }
};

export const submitQuiz = async (req, res) => {
    try {
        const courseId = parseId(req.params.id);
        if (!courseId) return sendError(res, { statusCode: 400, message: 'Invalid course id.' });

        const answers = req.body?.answers || {};
        const key = await engagement.getQuizKey(courseId);
        if (!key.length) return sendError(res, { statusCode: 404, message: 'No quiz for this course.' });

        let correct = 0;
        for (const q of key) {
            if (String(answers[q.id] || '').toUpperCase() === q.correct_option) correct += 1;
        }
        const total = key.length;
        const score = Math.round((correct / total) * 100);
        const passed = score >= 70;

        return sendSuccess(res, {
            message: 'Quiz scored.',
            data: { correct, total, score, passed }
        });
    } catch (err) {
        console.error(err);
        return sendError(res, { statusCode: 500, message: 'Unable to score quiz.' });
    }
};

/* ── Instructor stats ── */

export const tutorStats = async (req, res) => {
    try {
        const courses = await engagement.getTutorStats(req.user.id);
        const totals = courses.reduce(
            (acc, c) => ({
                courses: acc.courses + 1,
                enrollments: acc.enrollments + c.enrollments,
                revenue: acc.revenue + c.revenue
            }),
            { courses: 0, enrollments: 0, revenue: 0 }
        );
        return sendSuccess(res, { message: 'Tutor stats fetched.', data: { courses, totals } });
    } catch (err) {
        console.error(err);
        return sendError(res, { statusCode: 500, message: 'Unable to fetch instructor stats.' });
    }
};
