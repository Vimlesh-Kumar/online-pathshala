import * as momentumRepository from './momentum.repository.js';

/** XP awarded per lifetime action. */
const XP = Object.freeze({ lesson: 10, note: 4, certificate: 100, review: 5 });
/** XP needed to move up a level. */
const XP_PER_LEVEL = 500;
/** Days shown in the activity heatmap (12 weeks). */
const HEATMAP_DAYS = 84;

/** Local calendar day key — `activity_date` is a DATE, so time zones must not shift it. */
const dayKey = (date) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const addDays = (date, amount) => {
    const next = new Date(date);
    next.setDate(next.getDate() + amount);
    return next;
};

/**
 * Consecutive active days ending today. A day not yet studied does not break
 * the streak until it is over, so a streak that ends yesterday still counts.
 */
const currentStreak = (activeKeys) => {
    const today = new Date();
    let cursor = activeKeys.has(dayKey(today)) ? today : addDays(today, -1);

    let streak = 0;
    while (activeKeys.has(dayKey(cursor))) {
        streak += 1;
        cursor = addDays(cursor, -1);
    }
    return streak;
};

/** Longest run of consecutive active days in the learner's whole history. */
const longestStreak = (sortedKeys) => {
    let longest = 0;
    let run = 0;
    let previous = null;

    for (const key of sortedKeys) {
        const expected = previous ? dayKey(addDays(new Date(`${previous}T00:00:00`), 1)) : null;
        run = expected === key ? run + 1 : 1;
        previous = key;
        if (run > longest) longest = run;
    }
    return longest;
};

/** Last 12 weeks of activity, one entry per day, zero-filled. */
const heatmap = (byKey) => {
    const days = [];
    const today = new Date();
    for (let offset = HEATMAP_DAYS - 1; offset >= 0; offset -= 1) {
        const key = dayKey(addDays(today, -offset));
        days.push({ date: key, count: byKey.get(key) || 0 });
    }
    return days;
};

/**
 * Achievements are derived from lifetime totals and streaks — nothing to store,
 * so they stay correct even if data is edited or removed.
 */
const buildBadges = ({ totals, streak, best }) => {
    const definitions = [
        { id: 'first-lesson', label: 'First steps', icon: 'lucide:play', hint: 'Complete your first lesson', value: totals.lessons, target: 1 },
        { id: 'ten-lessons', label: 'Getting deep', icon: 'lucide:layers', hint: 'Complete 10 lessons', value: totals.lessons, target: 10 },
        { id: 'note-taker', label: 'Note taker', icon: 'lucide:notebook-pen', hint: 'Write 10 notes', value: totals.notes, target: 10 },
        { id: 'explorer', label: 'Explorer', icon: 'lucide:compass', hint: 'Enroll in 3 courses', value: totals.enrollments, target: 3 },
        { id: 'critic', label: 'Fair critic', icon: 'lucide:star', hint: 'Review 3 courses', value: totals.reviews, target: 3 },
        { id: 'scholar', label: 'Scholar', icon: 'lucide:award', hint: 'Earn your first certificate', value: totals.certificates, target: 1 },
        { id: 'graduate', label: 'Triple graduate', icon: 'lucide:graduation-cap', hint: 'Earn 3 certificates', value: totals.certificates, target: 3 },
        { id: 'streak-3', label: 'Warming up', icon: 'lucide:flame', hint: 'Study 3 days in a row', value: best, target: 3 },
        { id: 'streak-7', label: 'Week strong', icon: 'lucide:calendar-check', hint: 'Study 7 days in a row', value: best, target: 7 },
        { id: 'streak-30', label: 'Unstoppable', icon: 'lucide:trophy', hint: 'Study 30 days in a row', value: best, target: 30 }
    ];

    return definitions.map(({ value, target, ...badge }) => ({
        ...badge,
        target,
        progress: Math.min(value, target),
        earned: value >= target,
        // Streak badges show the live streak once earned; totals speak for themselves.
        current: badge.id.startsWith('streak-') ? streak : value
    }));
};

/**
 * The learner's momentum: streaks, XP, level and achievements.
 */
export const getMomentum = async (userId) => {
    const [days, totals] = await Promise.all([
        momentumRepository.activityDays(userId),
        momentumRepository.learnerTotals(userId)
    ]);

    const byKey = new Map();
    for (const day of days) {
        const date = day.activity_date instanceof Date ? day.activity_date : new Date(day.activity_date);
        byKey.set(dayKey(date), (Number(day.lessons_completed) || 0) + (Number(day.notes_taken) || 0));
    }

    const sortedKeys = [...byKey.keys()].sort((a, b) => a.localeCompare(b));
    const activeKeys = new Set(sortedKeys);
    const streak = currentStreak(activeKeys);
    const best = Math.max(longestStreak(sortedKeys), streak);

    const xp =
        totals.lessons * XP.lesson +
        totals.notes * XP.note +
        totals.certificates * XP.certificate +
        totals.reviews * XP.review;

    const badges = buildBadges({ totals, streak, best });

    return {
        streak,
        longestStreak: best,
        activeDays: sortedKeys.length,
        studiedToday: activeKeys.has(dayKey(new Date())),
        xp,
        level: Math.floor(xp / XP_PER_LEVEL) + 1,
        xpIntoLevel: xp % XP_PER_LEVEL,
        xpPerLevel: XP_PER_LEVEL,
        totals,
        heatmap: heatmap(byKey),
        badges,
        earnedBadges: badges.filter((badge) => badge.earned).length
    };
};

/**
 * Record a learning action for today's streak.
 *
 * Like notifications, this trails a real action (finishing a lesson, saving a
 * note) and must never make that action fail.
 */
export const recordActivity = async (userId, kind) => {
    const column = momentumRepository.ACTIVITY_COLUMNS[kind];
    if (!column) return;

    try {
        await momentumRepository.recordActivity({ userId, column });
    } catch (error) {
        console.error('Failed to record learning activity:', error.message);
    }
};
