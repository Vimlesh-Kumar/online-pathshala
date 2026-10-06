import { createHash } from 'node:crypto';
import * as engagementRepository from './engagement.repository.js';
import * as groq from '../aiSupport/groq.service.js';
import cacheService from '../../utils/cache.service.js';

/* ── Reviews ─────────────────────────────────────────── */

export const getReviews = async (courseId) => engagementRepository.getReviews(courseId);

export const getReviewStats = async (courseId) => engagementRepository.getReviewStats(courseId);

/** One review per user per course — updates if it already exists. */
export const upsertReview = async (courseId, userId, rating, content) => engagementRepository.upsertReview(courseId, userId, rating, content);

/** Below this many reviews a "what learners say" summary would just be one person's opinion. */
const HIGHLIGHTS_MIN_REVIEWS = 3;
/** Most recent reviews sent to the model. Reviews are capped at 100 chars, so this stays small. */
const HIGHLIGHTS_MAX_REVIEWS = 80;
const HIGHLIGHTS_CACHE_SECONDS = 7 * 24 * 60 * 60;

/** Free fallback: the rating spread in plain words, plus one recent glowing review to quote. */
const highlightsRuleBased = (reviews) => {
    const happy = reviews.filter((r) => Number(r.rating) >= 4).length;
    const headline = happy === reviews.length
        ? `All ${reviews.length} learners who reviewed it rated it 4★ or higher.`
        : `${happy} of ${reviews.length} learners rated it 4★ or higher.`;

    const quoted = reviews.find((r) => Number(r.rating) >= 4 && String(r.content || '').trim().length >= 20);
    return {
        headline,
        liked: [],
        watchOut: [],
        quote: quoted ? { text: quoted.content.trim(), author: quoted.author, rating: Number(quoted.rating) } : null
    };
};

const highlightsWithGroq = async (written) => {
    const lines = written.slice(0, HIGHLIGHTS_MAX_REVIEWS).map((r) => `${r.rating}★: ${r.content.trim()}`);
    const raw = await groq.chatComplete([
        {
            role: 'system',
            content: 'You summarize learner reviews of an online course for someone deciding whether to take it. ' +
                'Be fair and specific, and use ONLY what the reviewers said. Reply with ONLY a JSON object: ' +
                '{"headline": string (one sentence, at most 20 words, the overall feeling), ' +
                '"liked": string[] (1-3 short points people praised), ' +
                '"watchOut": string[] (0-2 short points about repeated complaints; empty if there are none)}.'
        },
        { role: 'user', content: lines.join('\n') }
    ], { json: true, temperature: 0.3, maxTokens: 400 });

    const parsed = JSON.parse(raw);
    const points = (value, max) => (Array.isArray(value) ? value : [])
        .filter((v) => typeof v === 'string' && v.trim())
        .map((v) => v.trim().slice(0, 120))
        .slice(0, max);

    const result = {
        headline: typeof parsed.headline === 'string' ? parsed.headline.trim().slice(0, 200) : '',
        liked: points(parsed.liked, 3),
        watchOut: points(parsed.watchOut, 2),
        quote: null
    };
    if (!result.headline || !result.liked.length) throw new Error('Malformed highlights shape from Groq.');
    return result;
};

/**
 * "What learners are saying" for a course page. Summarised by Groq from the
 * written reviews when configured (cached until a review changes), otherwise
 * the rating spread plus a quote. Null when there are too few reviews to say
 * anything fair.
 *
 * @returns {Promise<{headline: string, liked: string[], watchOut: string[], quote: object|null, source: 'ai'|'basic'}|null>}
 */
export const getReviewHighlights = async (courseId) => {
    const reviews = await engagementRepository.getReviews(courseId);
    if (reviews.length < HIGHLIGHTS_MIN_REVIEWS) return null;

    const written = reviews.filter((r) => String(r.content || '').trim().length >= 8);
    if (groq.isConfigured() && written.length >= HIGHLIGHTS_MIN_REVIEWS) {
        // Reviews are edited in place (one per learner), so hash their text, not just their ids.
        const fingerprint = createHash('sha1')
            .update(reviews.map((r) => `${r.id}:${r.rating}:${r.content || ''}`).join('|'))
            .digest('hex');
        const cacheKey = `ai:review-highlights:${courseId}:${fingerprint}`;

        try {
            const cached = await cacheService.get(cacheKey);
            if (cached) return { ...JSON.parse(cached), source: 'ai' };

            const result = await highlightsWithGroq(written);
            await cacheService.set(cacheKey, result, HIGHLIGHTS_CACHE_SECONDS);
            return { ...result, source: 'ai' };
        } catch (err) {
            console.warn('[engagement] Groq review highlights failed, using rule-based:', err.message);
        }
    }

    return { ...highlightsRuleBased(reviews), source: 'basic' };
};

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

/**
 * The question a given answer belongs to — used to notify whoever asked it.
 */
export const getQuestionById = async (questionId) => engagementRepository.getQuestionById(questionId);

/* ── Quiz ────────────────────────────────────────────── */

/** Public quiz — correct answers stripped. */
export const getQuiz = async (courseId) => engagementRepository.getQuiz(courseId);

/** Answer key for scoring. */
export const getQuizKey = async (courseId) => engagementRepository.getQuizKey(courseId);

/* ── Instructor stats ────────────────────────────────── */

export const getTutorStats = async (userId) => engagementRepository.getTutorStats(userId);
