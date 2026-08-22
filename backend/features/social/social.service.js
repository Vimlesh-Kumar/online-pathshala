import * as socialRepository from './social.repository.js';
import * as notificationService from '../notification/notification.service.js';
import { XP } from '../momentum/momentum.service.js';
import { addDays, dayKey, startOfWeek, toDayKey } from '../../utils/date.js';

/** Learners shown on the public board. */
const BOARD_SIZE = 20;
/** How long a challenge may run. */
const MIN_CHALLENGE_DAYS = 3;
const MAX_CHALLENGE_DAYS = 30;

/** What two learners can race on. */
const METRICS = Object.freeze({
    lessons: { label: 'Lessons completed', field: 'lessons' },
    cards: { label: 'Flashcards reviewed', field: 'cards' },
    xp: { label: 'XP earned', field: 'xp' }
});

/** Weekly XP uses the same weights as lifetime XP, so the two never disagree. */
const weeklyXp = (row) =>
    (Number(row.lessons) || 0) * XP.lesson +
    (Number(row.notes) || 0) * XP.note +
    (Number(row.cards) || 0) * XP.card +
    (Number(row.quizzes) || 0) * XP.practice;

/** A learner's public identity: their alias when they set one, otherwise their name. */
const publicName = (row) => row.display_alias || row.full_name || 'Learner';

/**
 * This week's leaderboard, Monday to Sunday.
 *
 * The caller's own row is always returned separately, with a true rank, so a
 * learner outside the top 20 still sees where they stand.
 */
export const getLeaderboard = async (userId) => {
    const weekStart = startOfWeek(new Date());
    const weekEnd = addDays(weekStart, 6);

    const rows = await socialRepository.weeklyActivity({
        from: dayKey(weekStart),
        to: dayKey(weekEnd)
    });

    const ranked = rows
        .map((row) => ({
            userId: row.user_id,
            name: publicName(row),
            avatar: row.avatar_url,
            lessons: Number(row.lessons) || 0,
            cards: Number(row.cards) || 0,
            activeDays: Number(row.active_days) || 0,
            xp: weeklyXp(row)
        }))
        .filter((entry) => entry.xp > 0)
        .sort((a, b) => b.xp - a.xp || b.lessons - a.lessons)
        .map((entry, index) => ({ ...entry, rank: index + 1, isMe: entry.userId === userId }));

    const prefs = await socialRepository.prefsFor(userId);
    const me = ranked.find((entry) => entry.userId === userId) || null;

    return {
        weekStart: dayKey(weekStart),
        weekEnd: dayKey(weekEnd),
        entries: ranked.slice(0, BOARD_SIZE),
        me,
        totalRanked: ranked.length,
        prefs: {
            optIn: prefs ? Boolean(prefs.leaderboard_opt_in) : true,
            alias: prefs?.display_alias || null
        }
    };
};

export const savePrefs = async ({ userId, optIn, alias }) => {
    const cleanAlias = alias === null || alias === undefined
        ? null
        : String(alias).replace(/\s+/g, ' ').trim().slice(0, 50) || null;

    await socialRepository.upsertPrefs({ userId, optIn: optIn !== false, alias: cleanAlias });
    return getLeaderboard(userId);
};

/** Per-learner totals for a challenge window, keyed by user id. */
const scoresFor = async ({ userIds, from, to }) => {
    const rows = await socialRepository.activityForUsers({ userIds, from, to });
    const byUser = new Map();

    for (const row of rows) {
        byUser.set(row.user_id, {
            lessons: Number(row.lessons) || 0,
            cards: Number(row.cards) || 0,
            xp: weeklyXp(row)
        });
    }

    for (const id of userIds) {
        if (!byUser.has(id)) byUser.set(id, { lessons: 0, cards: 0, xp: 0 });
    }
    return byUser;
};

/**
 * Settle a finished challenge exactly once: pick the winner, record it, and
 * tell both learners. A draw is stored as a completed challenge with no winner.
 */
const settle = async (challenge, scores) => {
    const field = METRICS[challenge.metric]?.field || 'lessons';
    const challengerScore = scores.get(challenge.challenger_id)[field];
    const opponentScore = scores.get(challenge.opponent_id)[field];

    let winnerId = null;
    if (challengerScore > opponentScore) winnerId = challenge.challenger_id;
    else if (opponentScore > challengerScore) winnerId = challenge.opponent_id;

    await socialRepository.updateChallenge({
        id: challenge.id,
        values: { status: 'completed', winner_user_id: winnerId, settled_at: new Date() }
    });

    const metricLabel = METRICS[challenge.metric]?.label || 'Lessons completed';
    for (const participant of [challenge.challenger_id, challenge.opponent_id]) {
        const won = winnerId === participant;
        await notificationService.notify(participant, {
            type: 'challenge_result',
            title: winnerId === null ? 'Your challenge ended in a draw' : won ? 'You won your challenge! 🏆' : 'Your challenge is over',
            body: `${metricLabel}: ${challengerScore} vs ${opponentScore}.`,
            link: '/user/leaderboard'
        });
    }

    return { ...challenge, status: 'completed', winner_user_id: winnerId };
};

/** Shape one challenge for the client, including live scores. */
const toClientChallenge = (challenge, scores, userId) => {
    const field = METRICS[challenge.metric]?.field || 'lessons';
    const isChallenger = challenge.challenger_id === userId;
    const opponentId = isChallenger ? challenge.opponent_id : challenge.challenger_id;

    return {
        id: challenge.id,
        metric: challenge.metric,
        metricLabel: METRICS[challenge.metric]?.label || 'Lessons completed',
        status: challenge.status,
        startsOn: toDayKey(challenge.starts_on),
        endsOn: toDayKey(challenge.ends_on),
        isChallenger,
        // "Waiting on you" is the only state that needs an action button.
        awaitingMyResponse: challenge.status === 'pending' && !isChallenger,
        me: {
            name: isChallenger ? challenge.challenger_name : challenge.opponent_name,
            avatar: isChallenger ? challenge.challenger_avatar : challenge.opponent_avatar,
            score: scores.get(userId)?.[field] ?? 0
        },
        opponent: {
            id: opponentId,
            name: isChallenger ? challenge.opponent_name : challenge.challenger_name,
            avatar: isChallenger ? challenge.opponent_avatar : challenge.challenger_avatar,
            score: scores.get(opponentId)?.[field] ?? 0
        },
        winnerUserId: challenge.winner_user_id,
        iWon: challenge.status === 'completed' && challenge.winner_user_id === userId,
        isDraw: challenge.status === 'completed' && challenge.winner_user_id === null
    };
};

/**
 * Every challenge the learner is in, with live scores.
 *
 * Challenges settle themselves on read: anything past its end date is scored
 * and closed here, which keeps the feature free of any scheduled job.
 */
export const listChallenges = async (userId) => {
    const challenges = await socialRepository.challengesFor(userId);
    if (!challenges.length) return { challenges: [] };

    const today = dayKey(new Date());
    const resolved = [];

    for (const challenge of challenges) {
        const participants = [challenge.challenger_id, challenge.opponent_id];
        const scores = await scoresFor({
            userIds: participants,
            from: toDayKey(challenge.starts_on),
            to: toDayKey(challenge.ends_on)
        });

        let current = challenge;
        if (current.status === 'active' && toDayKey(current.ends_on) < today) {
            current = await settle(current, scores);
        }

        resolved.push(toClientChallenge(current, scores, userId));
    }

    return { challenges: resolved };
};

/** Invite another learner, by the email they signed up with. */
export const createChallenge = async ({ userId, email, metric, days }) => {
    const normalisedEmail = String(email || '').trim().toLowerCase();
    if (!normalisedEmail) return { error: 'Enter the email of the learner you want to challenge.' };
    if (!METRICS[metric]) return { error: 'Unknown challenge metric.' };

    const opponent = await socialRepository.findUserByEmail(normalisedEmail);
    if (!opponent) return { error: 'No learner is registered with that email.' };
    if (opponent.id === userId) return { error: 'You cannot challenge yourself.' };

    const existing = await socialRepository.openChallengeBetween({
        challengerId: userId,
        opponentId: opponent.id
    });
    if (existing) return { error: 'You already have a challenge running with that learner.' };

    const length = Math.min(MAX_CHALLENGE_DAYS, Math.max(MIN_CHALLENGE_DAYS, Number(days) || 7));
    const startsOn = new Date();
    const endsOn = addDays(startsOn, length - 1);

    const id = await socialRepository.createChallenge({
        challengerId: userId,
        opponentId: opponent.id,
        metric,
        startsOn: dayKey(startsOn),
        endsOn: dayKey(endsOn)
    });

    const challenger = await socialRepository.userById(userId);
    await notificationService.notify(opponent.id, {
        type: 'challenge_invite',
        title: `${challenger?.full_name || 'A learner'} challenged you`,
        body: `${METRICS[metric].label} over ${length} days. Accept to start the race.`,
        link: '/user/leaderboard'
    });

    return { id, opponent: opponent.full_name, metric, days: length };
};

/** Accept or decline an invitation. Only the invited learner may respond. */
export const respondToChallenge = async ({ userId, challengeId, accept }) => {
    const challenge = await socialRepository.challengeById(challengeId);
    if (!challenge) return { error: 'Challenge not found.' };
    if (challenge.opponent_id !== userId) return { error: 'Only the challenged learner can respond.' };
    if (challenge.status !== 'pending') return { error: 'That challenge has already been answered.' };

    const status = accept ? 'active' : 'declined';
    const values = { status };

    if (accept) {
        // The clock starts when the invitation is accepted, not when it was sent.
        const startsOn = new Date();
        const originalLength = Math.round(
            (new Date(toDayKey(challenge.ends_on)) - new Date(toDayKey(challenge.starts_on))) / 86400000
        );
        values.starts_on = dayKey(startsOn);
        values.ends_on = dayKey(addDays(startsOn, Math.max(originalLength, MIN_CHALLENGE_DAYS - 1)));
    }

    await socialRepository.updateChallenge({ id: challengeId, values });

    const responder = await socialRepository.userById(userId);
    await notificationService.notify(challenge.challenger_id, {
        type: 'challenge_response',
        title: accept
            ? `${responder?.full_name || 'Your opponent'} accepted your challenge`
            : `${responder?.full_name || 'Your opponent'} declined your challenge`,
        body: accept ? 'The race is on — every lesson counts from today.' : 'Try challenging someone else.',
        link: '/user/leaderboard'
    });

    return { id: challengeId, status };
};
