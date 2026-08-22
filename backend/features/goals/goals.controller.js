import * as goalsService from './goals.service.js';
import { sendError, sendSuccess } from '../../utils/apiResponse.js';

/**
 * The weekly plan. Reading it is also what triggers the daily nudge when the
 * learner has fallen behind — no background scheduler required.
 */
export const getPlan = async (req, res) => {
    try {
        const data = await goalsService.getPlan(req.user.id);
        await goalsService.nudgeIfBehind(req.user.id, data);
        return sendSuccess(res, { message: 'Study plan fetched.', data });
    } catch (error) {
        console.error(error);
        return sendError(res, { statusCode: 500, message: 'Unable to fetch your study plan.' });
    }
};

export const saveGoal = async (req, res) => {
    try {
        const data = await goalsService.saveGoal({
            userId: req.user.id,
            weeklyLessons: req.body.weekly_lessons,
            weeklyDays: req.body.weekly_days,
            planDays: req.body.plan_days,
            remindersOn: req.body.reminders_on
        });
        return sendSuccess(res, { message: 'Study goal saved.', data });
    } catch (error) {
        console.error(error);
        return sendError(res, { statusCode: 500, message: 'Unable to save your study goal.' });
    }
};
