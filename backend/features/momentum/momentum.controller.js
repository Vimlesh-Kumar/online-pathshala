import * as momentumService from './momentum.service.js';
import { sendError, sendSuccess } from '../../utils/apiResponse.js';

/**
 * Streaks, XP, level and achievements for the authenticated learner.
 */
export const getMomentum = async (req, res) => {
    try {
        const data = await momentumService.getMomentum(req.user.id);
        return sendSuccess(res, { message: 'Momentum fetched.', data });
    } catch (error) {
        console.error(error);
        return sendError(res, { statusCode: 500, message: 'Unable to fetch your learning momentum.' });
    }
};
