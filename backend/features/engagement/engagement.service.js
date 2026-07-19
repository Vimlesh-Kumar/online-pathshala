import * as engagementRepository from './engagement.repository.js';

/* ── Reviews ─────────────────────────────────────────── */

export const getReviews = async (courseId) => engagementRepository.getReviews(courseId);

export const getReviewStats = async (courseId) => engagementRepository.getReviewStats(courseId);

/** One review per user per course — updates if it already exists. */
export const upsertReview = async (courseId, userId, rating, content) => engagementRepository.upsertReview(courseId, userId, rating, content);

/* ── Q&A ─────────────────────────────────────────────── */

export const getQuestions = async (courseId) => {
    const questions = await engagementRepository.getQuestions(courseId);
    if (!questions.length) return [];

    const ids = questions.map((q) => q.id);
    const answers = await engagementRepository.getAnswersForQuestions(ids);

    return questions.map((q) => ({
        ...q,
        answers: answers.filter((a) => a.question_id === q.id)
    }));
};

export const addQuestion = async (courseId, userId, content) => engagementRepository.addQuestion(courseId, userId, content);

export const addAnswer = async (questionId, userId, content) => engagementRepository.addAnswer(questionId, userId, content);

/* ── Quiz ────────────────────────────────────────────── */

/** Public quiz — correct answers stripped. */
export const getQuiz = async (courseId) => engagementRepository.getQuiz(courseId);

/** Answer key for scoring. */
export const getQuizKey = async (courseId) => engagementRepository.getQuizKey(courseId);

/* ── Instructor stats ────────────────────────────────── */

export const getTutorStats = async (userId) => engagementRepository.getTutorStats(userId);
