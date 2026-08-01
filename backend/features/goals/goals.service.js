import * as goalsRepository from './goals.repository.js';
import * as notificationService from '../notification/notification.service.js';
import { addDays, dayKey, startOfWeek, toDayKey } from '../../utils/date.js';

/** What a learner gets before they have ever saved a goal. */
const DEFAULTS = Object.freeze({
    weekly_lessons: 5,
    weekly_days: 3,
    plan_days: '1,3,5',
    reminders_on: true
});

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Parsed `plan_days`, as a set of weekday numbers the learner intends to study. */
const parsePlanDays = (value) =>
    new Set(
        String(value || '')
            .split(',')
            .map((part) => Number(part.trim()))
            .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
    );

const clampInt = (value, min, max, fallback) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, Math.round(number)));
};

/**
 * How the learner is tracking against the goal, given how much of the week is gone.
 * Judging against elapsed days (not the whole week) is what makes "behind"
 * actionable on a Wednesday instead of only on a Sunday night.
 */
const paceStatus = ({ lessonsDone, target, daysElapsed }) => {
    if (lessonsDone >= target) return 'achieved';
    const expected = (target * daysElapsed) / 7;
    if (lessonsDone >= expected) return 'on-track';
    if (lessonsDone >= expected * 0.6) return 'slipping';
    return 'behind';
};

/**
 * The learner's weekly plan: the goal itself, a day-by-day grid for this week,
 * and where they stand against it.
 */
export const getPlan = async (userId) => {
    const goal = (await goalsRepository.goalFor(userId)) || { ...DEFAULTS, user_id: userId };

    const today = new Date();
    const weekStart = startOfWeek(today);
    const weekEnd = addDays(weekStart, 6);
    const todayKey = dayKey(today);

    const rows = await goalsRepository.activityBetween({
        userId,
        from: dayKey(weekStart),
        to: dayKey(weekEnd)
    });

    const byKey = new Map();
    for (const row of rows) {
        byKey.set(toDayKey(row.activity_date), row);
    }

    const planDays = parsePlanDays(goal.plan_days);
    let lessonsDone = 0;
    let activeDays = 0;

    const days = [];
    for (let offset = 0; offset < 7; offset += 1) {
        const date = addDays(weekStart, offset);
        const key = dayKey(date);
        const row = byKey.get(key);
        const lessons = Number(row?.lessons_completed) || 0;
        const actions =
            lessons +
            (Number(row?.notes_taken) || 0) +
            (Number(row?.cards_reviewed) || 0) +
            (Number(row?.quizzes_taken) || 0);

        lessonsDone += lessons;
        if (actions > 0) activeDays += 1;

        days.push({
            date: key,
            weekday: date.getDay(),
            label: WEEKDAY_LABELS[date.getDay()],
            planned: planDays.has(date.getDay()),
            lessons,
            actions,
            studied: actions > 0,
            isToday: key === todayKey,
            isFuture: date > today && key !== todayKey
        });
    }

    const targetLessons = Number(goal.weekly_lessons) || DEFAULTS.weekly_lessons;
    const targetDays = Number(goal.weekly_days) || DEFAULTS.weekly_days;
    // Monday is day 1 of the week; Sunday closes it out as day 7.
    const daysElapsed = days.filter((day) => !day.isFuture).length;
    const status = paceStatus({ lessonsDone, target: targetLessons, daysElapsed });

    return {
        goal: {
            weeklyLessons: targetLessons,
            weeklyDays: targetDays,
            planDays: [...planDays].sort((a, b) => a - b),
            remindersOn: Boolean(goal.reminders_on),
            isDefault: !goal.id
        },
        week: {
            start: dayKey(weekStart),
            end: dayKey(weekEnd),
            days,
            daysLeft: 7 - daysElapsed
        },
        progress: {
            lessonsDone,
            targetLessons,
            lessonsPercent: Math.min(100, Math.round((lessonsDone / Math.max(targetLessons, 1)) * 100)),
            activeDays,
            targetDays,
            daysPercent: Math.min(100, Math.round((activeDays / Math.max(targetDays, 1)) * 100)),
            status
        }
    };
};

export const saveGoal = async ({ userId, weeklyLessons, weeklyDays, planDays, remindersOn }) => {
    const days = Array.isArray(planDays) ? [...parsePlanDays(planDays.join(','))] : [...parsePlanDays(planDays)];

    await goalsRepository.upsertGoal({
        userId,
        weeklyLessons: clampInt(weeklyLessons, 1, 50, DEFAULTS.weekly_lessons),
        weeklyDays: clampInt(weeklyDays, 1, 7, DEFAULTS.weekly_days),
        planDays: (days.length ? days : [...parsePlanDays(DEFAULTS.plan_days)]).sort((a, b) => a - b).join(','),
        remindersOn: remindersOn !== false
    });

    return getPlan(userId);
};

/**
 * Send at most one nudge a day when the learner is off pace.
 *
 * Called on the same read that renders the planner, so no scheduler is needed:
 * the reminder lands in the notification bell the next time the app is opened.
 * Like every other notification, a failure here must not fail the read.
 */
export const nudgeIfBehind = async (userId, plan) => {
    try {
        if (!plan.goal.remindersOn || plan.goal.isDefault) return false;
        if (plan.progress.status === 'achieved' || plan.progress.status === 'on-track') return false;

        const goal = await goalsRepository.goalFor(userId);
        const today = dayKey(new Date());
        if (toDayKey(goal?.last_nudged_on) === today) return false;

        const remaining = Math.max(plan.progress.targetLessons - plan.progress.lessonsDone, 0);
        await notificationService.notify(userId, {
            type: 'goal_nudge',
            title: `${remaining} lesson${remaining === 1 ? '' : 's'} left this week`,
            body: `You're at ${plan.progress.lessonsDone}/${plan.progress.targetLessons} with ${plan.week.daysLeft} day${plan.week.daysLeft === 1 ? '' : 's'} to go. A short session today keeps the goal alive.`,
            link: '/user/goals'
        });
        await goalsRepository.markNudged({ userId, day: today });
        return true;
    } catch (error) {
        console.error('Failed to send goal nudge:', error.message);
        return false;
    }
};
