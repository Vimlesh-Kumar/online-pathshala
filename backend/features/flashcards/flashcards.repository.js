import pool from '../../database/database.js';

/** Courses the learner is enrolled in — the only ones a deck may be built from. */
export const enrolledCourse = async ({ userId, courseId }) =>
    pool('enrollment')
        .select('id')
        .where({ user_id: userId, course_id: courseId })
        .first();

export const courseById = async (courseId) =>
    pool('courses')
        .select('id', 'title', 'subtitle', 'category', 'author')
        .where({ id: courseId })
        .first();

export const courseObjectives = async (courseId) =>
    pool('course_objectives').select('objective').where({ course_id: courseId });

export const courseLessons = async (courseId) =>
    pool('lesson')
        .select('id', 'lesson_name', 'section_name', 'duration')
        .where({ course_id: courseId })
        .orderBy('id', 'asc');

/** The learner's own notes for a course — the richest grounding material there is. */
export const courseNotes = async ({ userId, courseId, limit = 40 }) =>
    pool('lesson_notes')
        .select('lesson_id', 'content')
        .where({ user_id: userId, course_id: courseId })
        .orderBy('updated_at', 'desc')
        .limit(limit);

export const deckFor = async ({ userId, courseId }) =>
    pool('flashcard_decks').select('*').where({ user_id: userId, course_id: courseId }).first();

export const createDeck = async ({ userId, courseId, title }) => {
    const [id] = await pool('flashcard_decks').insert({
        user_id: userId,
        course_id: courseId,
        title
    });
    return id;
};

/**
 * Every deck the learner owns, with card counts and how many are due today.
 * The counts come from correlated sub-queries so one round trip renders the page.
 */
export const listDecks = async (userId) =>
    pool('flashcard_decks as d')
        .select(
            'd.id',
            'd.course_id',
            'd.title',
            'd.created_at',
            'c.thumb_url',
            'c.category',
            pool.raw('(SELECT COUNT(*) FROM flashcards f WHERE f.deck_id = d.id) AS card_count'),
            pool.raw('(SELECT COUNT(*) FROM flashcards f WHERE f.deck_id = d.id AND f.due_on <= CURDATE()) AS due_count'),
            pool.raw('(SELECT COUNT(*) FROM flashcards f WHERE f.deck_id = d.id AND f.repetitions > 0) AS learned_count')
        )
        .join('courses as c', 'c.id', 'd.course_id')
        .where('d.user_id', userId)
        .orderBy('due_count', 'desc')
        .orderBy('d.created_at', 'desc');

/** Fronts already in a deck, lower-cased — used to skip duplicate generations. */
export const deckFronts = async (deckId) => {
    const rows = await pool('flashcards').select('front').where({ deck_id: deckId });
    return new Set(rows.map((row) => row.front.trim().toLowerCase()));
};

export const insertCards = async (rows) => {
    if (!rows.length) return 0;
    await pool('flashcards').insert(rows);
    return rows.length;
};

/**
 * The review queue: cards whose due date has arrived, oldest due first so
 * nothing gets stranded behind newer cards.
 */
export const dueCards = async ({ userId, courseId = null, limit = 20 }) => {
    const query = pool('flashcards as f')
        .select(
            'f.id',
            'f.front',
            'f.back',
            'f.source',
            'f.repetitions',
            'f.interval_days',
            'f.due_on',
            'f.lesson_id',
            'd.course_id',
            'd.title as deck_title',
            'l.lesson_name'
        )
        .join('flashcard_decks as d', 'd.id', 'f.deck_id')
        .leftJoin('lesson as l', 'l.id', 'f.lesson_id')
        .where('f.user_id', userId)
        .andWhere('f.due_on', '<=', pool.raw('CURDATE()'))
        .orderBy('f.due_on', 'asc')
        .orderBy('f.id', 'asc')
        .limit(limit);

    if (courseId) query.andWhere('d.course_id', courseId);
    return query;
};

export const cardById = async ({ userId, cardId }) =>
    pool('flashcards').select('*').where({ id: cardId, user_id: userId }).first();

export const updateSchedule = async ({ cardId, easeFactor, intervalDays, repetitions, lapses }) =>
    pool('flashcards')
        .where({ id: cardId })
        .update({
            ease_factor: easeFactor,
            interval_days: intervalDays,
            repetitions,
            lapses,
            due_on: pool.raw('DATE_ADD(CURDATE(), INTERVAL ? DAY)', [intervalDays]),
            last_reviewed_at: pool.fn.now()
        });

export const updateCard = async ({ userId, cardId, front, back }) =>
    pool('flashcards').where({ id: cardId, user_id: userId }).update({ front, back });

export const deleteCard = async ({ userId, cardId }) =>
    pool('flashcards').where({ id: cardId, user_id: userId }).del();

/** Totals for the review page header. */
export const reviewSummary = async (userId) => {
    const row = await pool('flashcards')
        .where('user_id', userId)
        .select(
            pool.raw('COUNT(*) AS total'),
            pool.raw('SUM(CASE WHEN due_on <= CURDATE() THEN 1 ELSE 0 END) AS due'),
            pool.raw('SUM(CASE WHEN repetitions >= 3 THEN 1 ELSE 0 END) AS mastered')
        )
        .first();

    return {
        total: Number(row?.total) || 0,
        due: Number(row?.due) || 0,
        mastered: Number(row?.mastered) || 0
    };
};
