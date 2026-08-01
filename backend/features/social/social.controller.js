import * as socialService from './social.service.js';
import { sendError, sendSuccess } from '../../utils/apiResponse.js';

/** This week's leaderboard, plus the caller's own rank. */
export const getLeaderboard = async (req, res) => {
    try {
        const data = await socialService.getLeaderboard(req.user.id);
        return sendSuccess(res, { message: 'Leaderboard fetched.', data });
    } catch (error) {
        console.error(error);
        return sendError(res, { statusCode: 500, message: 'Unable to fetch the leaderboard.' });
    }
};

/** Opt in or out of the public board, and set an optional alias. */
export const savePrefs = async (req, res) => {
    try {
        const data = await socialService.savePrefs({
            userId: req.user.id,
            optIn: req.body.opt_in,
            alias: req.body.alias
        });
        return sendSuccess(res, { message: 'Leaderboard settings saved.', data });
    } catch (error) {
        console.error(error);
        return sendError(res, { statusCode: 500, message: 'Unable to save your leaderboard settings.' });
    }
};

export const listChallenges = async (req, res) => {
    try {
        const data = await socialService.listChallenges(req.user.id);
        return sendSuccess(res, { message: 'Challenges fetched.', data });
    } catch (error) {
        console.error(error);
        return sendError(res, { statusCode: 500, message: 'Unable to fetch your challenges.' });
    }
};

export const createChallenge = async (req, res) => {
    try {
        const result = await socialService.createChallenge({
            userId: req.user.id,
            email: req.body.email,
            metric: String(req.body.metric || 'lessons'),
            days: req.body.days
        });
        if (result.error) {
            return sendError(res, { statusCode: 400, message: result.error });
        }
        return sendSuccess(res, { statusCode: 201, message: 'Challenge sent.', data: result });
    } catch (error) {
        console.error(error);
        return sendError(res, { statusCode: 500, message: 'Unable to send that challenge.' });
    }
};

export const respondToChallenge = async (req, res) => {
    try {
        const result = await socialService.respondToChallenge({
            userId: req.user.id,
            challengeId: Number(req.params.id),
            accept: req.body.accept === true
        });
        if (result.error) {
            return sendError(res, { statusCode: 400, message: result.error });
        }
        return sendSuccess(res, { message: 'Challenge updated.', data: result });
    } catch (error) {
        console.error(error);
        return sendError(res, { statusCode: 500, message: 'Unable to update that challenge.' });
    }
};
