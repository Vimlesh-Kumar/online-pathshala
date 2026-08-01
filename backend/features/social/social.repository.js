import pool from '../../database/database.js';

export const prefsFor = async (userId) =>
    pool('learner_prefs').select('*').where({ user_id: userId }).first();

export const upsertPrefs = async ({ userId, optIn, alias }) => {
    const existing = await prefsFor(userId);
    const values = { leaderboard_opt_in: optIn, display_alias: alias };

    if (existing) {
        await pool('learner_prefs').where({ user_id: userId }).update(values);
    } else {
        await pool('learner_prefs').insert({ user_id: userId, ...values });
    }
    return prefsFor(userId);
};

/**
 * Weekly activity totals per learner, for everyone visible on the leaderboard.
 *
 * A learner is visible unless they have explicitly opted out, so someone who
 * has never touched the setting still appears — the row simply may not exist.
 */
export const weeklyActivity = async ({ from, to }) =>
    pool('learning_activity as a')
        .select(
            'a.user_id',
            'u.full_name',
            'u.avatar_url',
            'p.display_alias',
            pool.raw('SUM(a.lessons_completed) AS lessons'),
            pool.raw('SUM(a.notes_taken) AS notes'),
            pool.raw('SUM(a.cards_reviewed) AS cards'),
            pool.raw('SUM(a.quizzes_taken) AS quizzes'),
            pool.raw('COUNT(*) AS active_days')
        )
        .join('users as u', 'u.id', 'a.user_id')
        .leftJoin('learner_prefs as p', 'p.user_id', 'a.user_id')
        .where('a.activity_date', '>=', from)
        .andWhere('a.activity_date', '<=', to)
        .andWhere((builder) => builder.whereNull('p.leaderboard_opt_in').orWhere('p.leaderboard_opt_in', true))
        .groupBy('a.user_id', 'u.full_name', 'u.avatar_url', 'p.display_alias');

/** Activity totals for two specific learners over a date range — used to settle a challenge. */
export const activityForUsers = async ({ userIds, from, to }) =>
    pool('learning_activity')
        .select('user_id')
        .sum({ lessons: 'lessons_completed' })
        .sum({ notes: 'notes_taken' })
        .sum({ cards: 'cards_reviewed' })
        .sum({ quizzes: 'quizzes_taken' })
        .count({ active_days: '*' })
        .whereIn('user_id', userIds)
        .andWhere('activity_date', '>=', from)
        .andWhere('activity_date', '<=', to)
        .groupBy('user_id');

export const findUserByEmail = async (email) =>
    pool('users').select('id', 'full_name', 'email').whereRaw('LOWER(email) = ?', [email]).first();

export const userById = async (userId) =>
    pool('users').select('id', 'full_name', 'email').where({ id: userId }).first();

export const createChallenge = async ({ challengerId, opponentId, metric, startsOn, endsOn }) => {
    const [id] = await pool('peer_challenges').insert({
        challenger_id: challengerId,
        opponent_id: opponentId,
        metric,
        starts_on: startsOn,
        ends_on: endsOn,
        status: 'pending'
    });
    return id;
};

/** An open challenge already running (or waiting) between the same two learners. */
export const openChallengeBetween = async ({ challengerId, opponentId }) =>
    pool('peer_challenges')
        .select('id')
        .whereIn('status', ['pending', 'active'])
        .andWhere((builder) => {
            builder
                .where((pair) => pair.where({ challenger_id: challengerId, opponent_id: opponentId }))
                .orWhere((pair) => pair.where({ challenger_id: opponentId, opponent_id: challengerId }));
        })
        .first();

export const challengeById = async (id) =>
    pool('peer_challenges').select('*').where({ id }).first();

/** Every challenge the learner is part of, either side, newest first. */
export const challengesFor = async (userId) =>
    pool('peer_challenges as ch')
        .select(
            'ch.*',
            'challenger.full_name as challenger_name',
            'challenger.avatar_url as challenger_avatar',
            'opponent.full_name as opponent_name',
            'opponent.avatar_url as opponent_avatar'
        )
        .join('users as challenger', 'challenger.id', 'ch.challenger_id')
        .join('users as opponent', 'opponent.id', 'ch.opponent_id')
        .where('ch.challenger_id', userId)
        .orWhere('ch.opponent_id', userId)
        .orderBy('ch.created_at', 'desc');

export const updateChallenge = async ({ id, values }) =>
    pool('peer_challenges').where({ id }).update(values);
