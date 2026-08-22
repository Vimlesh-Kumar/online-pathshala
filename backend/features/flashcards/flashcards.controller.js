import * as flashcardsService from './flashcards.service.js';
import { sendError, sendSuccess } from '../../utils/apiResponse.js';

/** Every deck the learner owns, plus how many cards are due right now. */
export const listDecks = async (req, res) => {
    try {
        const data = await flashcardsService.listDecks(req.user.id);
        return sendSuccess(res, { message: 'Decks fetched.', data });
    } catch (error) {
        console.error(error);
        return sendError(res, { statusCode: 500, message: 'Unable to fetch your flashcard decks.' });
    }
};

/** Build or top up the deck for one course. */
export const generateDeck = async (req, res) => {
    try {
        const courseId = Number(req.body.course_id);
        if (!courseId) {
            return sendError(res, { statusCode: 400, message: 'A course is required.' });
        }

        const result = await flashcardsService.generateDeck({ userId: req.user.id, courseId });
        if (result.error) {
            return sendError(res, { statusCode: 400, message: result.error });
        }
        return sendSuccess(res, { message: 'Deck ready.', data: result });
    } catch (error) {
        console.error(error);
        return sendError(res, { statusCode: 500, message: 'Unable to build that deck.' });
    }
};

/** The cards due for review, optionally narrowed to one course. */
export const dueCards = async (req, res) => {
    try {
        const courseId = req.query.course_id ? Number(req.query.course_id) : null;
        const data = await flashcardsService.dueQueue({ userId: req.user.id, courseId });
        return sendSuccess(res, { message: 'Review queue fetched.', data });
    } catch (error) {
        console.error(error);
        return sendError(res, { statusCode: 500, message: 'Unable to fetch your review queue.' });
    }
};

/** Grade one card and reschedule it. */
export const reviewCard = async (req, res) => {
    try {
        const result = await flashcardsService.reviewCard({
            userId: req.user.id,
            cardId: Number(req.params.id),
            rating: String(req.body.rating || '').toLowerCase()
        });
        if (result.error) {
            return sendError(res, { statusCode: 400, message: result.error });
        }
        return sendSuccess(res, { message: 'Card reviewed.', data: result });
    } catch (error) {
        console.error(error);
        return sendError(res, { statusCode: 500, message: 'Unable to save that review.' });
    }
};

export const createCard = async (req, res) => {
    try {
        const result = await flashcardsService.createCard({
            userId: req.user.id,
            courseId: Number(req.body.course_id),
            lessonId: req.body.lesson_id ? Number(req.body.lesson_id) : null,
            front: req.body.front,
            back: req.body.back
        });
        if (result.error) {
            return sendError(res, { statusCode: 400, message: result.error });
        }
        return sendSuccess(res, { statusCode: 201, message: 'Card added.', data: result });
    } catch (error) {
        console.error(error);
        return sendError(res, { statusCode: 500, message: 'Unable to add that card.' });
    }
};

export const updateCard = async (req, res) => {
    try {
        const result = await flashcardsService.editCard({
            userId: req.user.id,
            cardId: Number(req.params.id),
            front: req.body.front,
            back: req.body.back
        });
        if (result.error) {
            return sendError(res, { statusCode: 404, message: result.error });
        }
        return sendSuccess(res, { message: 'Card updated.', data: result });
    } catch (error) {
        console.error(error);
        return sendError(res, { statusCode: 500, message: 'Unable to update that card.' });
    }
};

export const deleteCard = async (req, res) => {
    try {
        const result = await flashcardsService.removeCard({
            userId: req.user.id,
            cardId: Number(req.params.id)
        });
        if (result.error) {
            return sendError(res, { statusCode: 404, message: result.error });
        }
        return sendSuccess(res, { message: 'Card deleted.' });
    } catch (error) {
        console.error(error);
        return sendError(res, { statusCode: 500, message: 'Unable to delete that card.' });
    }
};
