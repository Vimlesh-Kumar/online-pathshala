import * as flashcardsRepository from './flashcards.repository.js';
import * as groq from '../aiSupport/groq.service.js';
import * as momentumService from '../momentum/momentum.service.js';

/** Most cards one generation run may add, to keep a deck reviewable. */
const MAX_GENERATED = 12;
/** Cards handed to the review screen in one sitting. */
const QUEUE_LIMIT = 20;

/**
 * Ratings the review UI offers, mapped onto SM-2 quality scores.
 * Anything below 3 is a lapse and sends the card back to the start.
 */
const RATING_QUALITY = Object.freeze({ again: 2, hard: 3, good: 4, easy: 5 });

/** SM-2 never lets a card get easier than this, or it would never settle. */
const MIN_EASE = 1.3;

/**
 * SuperMemo-2 scheduling.
 *
 * Returns the card's next state given how well it was recalled. A failed card
 * keeps an interval of 0 so it comes back later in the same session, which is
 * what makes a single review sitting actually teach something.
 */
export const schedule = (card, rating) => {
    const quality = RATING_QUALITY[rating];
    const ease = Number(card.ease_factor) || 2.5;
    const repetitions = Number(card.repetitions) || 0;
    const interval = Number(card.interval_days) || 0;
    const lapses = Number(card.lapses) || 0;

    if (quality < 3) {
        return {
            easeFactor: Math.max(MIN_EASE, Number((ease - 0.2).toFixed(2))),
            intervalDays: 0,
            repetitions: 0,
            lapses: lapses + 1
        };
    }

    // The standard SM-2 ease adjustment: harder recalls shrink the multiplier.
    const nextEase = Math.max(
        MIN_EASE,
        Number((ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))).toFixed(2))
    );
    const nextRepetitions = repetitions + 1;

    let nextInterval;
    if (nextRepetitions === 1) nextInterval = 1;
    else if (nextRepetitions === 2) nextInterval = 6;
    else nextInterval = Math.round(Math.max(interval, 1) * nextEase);

    return {
        easeFactor: nextEase,
        intervalDays: Math.min(nextInterval, 365),
        repetitions: nextRepetitions,
        lapses
    };
};

const clean = (value, max) => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

/** `due_on` is a DATE, so it must be written as a local calendar day, not a UTC instant. */
const today = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

/** Words too common to be worth blanking out in a cloze card. */
const CLOZE_STOPWORDS = new Set([
    'about', 'after', 'their', 'there', 'these', 'those', 'which', 'while', 'with', 'your', 'from',
    'that', 'this', 'they', 'have', 'been', 'able', 'will', 'into', 'using', 'used', 'more', 'other'
]);

/**
 * Turn a statement into a fill-in-the-blank prompt by hiding its most
 * distinctive word. A card whose question contains its own answer teaches
 * nothing, which is exactly what a plain "what does X say?" card would do.
 * Returns null when nothing is worth hiding.
 */
const toCloze = (sentence) => {
    const words = sentence.split(' ');
    let bestIndex = -1;

    words.forEach((word, index) => {
        const bare = word.replace(/[^A-Za-z0-9-]/g, '');
        if (bare.length < 5 || CLOZE_STOPWORDS.has(bare.toLowerCase())) return;
        if (bestIndex === -1 || bare.length > words[bestIndex].replace(/[^A-Za-z0-9-]/g, '').length) {
            bestIndex = index;
        }
    });

    if (bestIndex === -1) return null;
    const hidden = words[bestIndex];
    const blanked = [...words];
    // Keep any trailing punctuation so the sentence still reads naturally.
    blanked[bestIndex] = hidden.replace(/[A-Za-z0-9-]+/, '_____');
    return { prompt: blanked.join(' '), answer: hidden.replace(/[^A-Za-z0-9-]/g, '') };
};

/**
 * Rule-based card generation — the guaranteed-free path used whenever Groq is
 * unconfigured or fails. Everything here comes from content the course already
 * holds or the learner already wrote, so nothing is invented.
 */
const generateRuleBased = ({ course, objectives, lessons, notes }) => {
    const cards = [];

    for (const objective of objectives) {
        const text = clean(objective.objective, 400);
        const cloze = toCloze(text);
        if (!cloze) continue;

        cards.push({
            front: `Fill in the blank — ${course.title} teaches you to: "${cloze.prompt}"`,
            back: `${cloze.answer} — ${text}`,
            source: 'course',
            lessonId: null
        });
    }

    // Several notes on the same lesson would otherwise share a front and be
    // deduplicated away, so each is numbered within its lesson.
    const noteCounts = new Map();
    for (const note of notes) {
        const lesson = lessons.find((l) => l.id === note.lesson_id);
        const seen = (noteCounts.get(note.lesson_id) || 0) + 1;
        noteCounts.set(note.lesson_id, seen);
        const suffix = seen > 1 ? ` (note ${seen})` : '';

        cards.push({
            front: lesson
                ? `What did you note in "${clean(lesson.lesson_name, 120)}"?${suffix}`
                : `What did you note here?${suffix}`,
            back: clean(note.content, 900),
            source: 'note',
            lessonId: note.lesson_id || null
        });
    }

    for (const lesson of lessons) {
        cards.push({
            front: `What does the lesson "${clean(lesson.lesson_name, 200)}" cover?`,
            back: `Part of "${clean(lesson.section_name, 150)}" in ${course.title} (${lesson.duration}).`,
            source: 'course',
            lessonId: lesson.id
        });
    }

    return cards;
};

/**
 * Ask Groq for real question/answer pairs grounded in this course's content and
 * the learner's own notes. Returns null on any failure so the caller falls back.
 */
const generateWithGroq = async ({ course, objectives, lessons, notes }) => {
    if (!groq.isConfigured()) return null;

    const context = [
        `Course: ${course.title}`,
        `Category: ${course.category}`,
        course.subtitle ? `Description: ${course.subtitle}` : '',
        objectives.length ? `Learning objectives:\n${objectives.map((o) => `- ${o.objective}`).join('\n')}` : '',
        lessons.length ? `Lessons:\n${lessons.map((l) => `- ${l.section_name}: ${l.lesson_name}`).join('\n')}` : '',
        notes.length ? `The learner's own notes:\n${notes.map((n) => `- ${n.content}`).join('\n')}` : ''
    ].filter(Boolean).join('\n\n');

    try {
        const raw = await groq.chatComplete([
            {
                role: 'system',
                content: 'You create study flashcards for an online course. Use ONLY the provided course ' +
                    'content — never invent facts that are not implied by it. Each card must have a short ' +
                    'question on the front and a self-contained answer of 1-2 sentences on the back. ' +
                    `Reply with ONLY a JSON object of the shape {"cards": [{"front": string, "back": string}]} with at most ${MAX_GENERATED} cards.`
            },
            { role: 'user', content: context }
        ], { json: true, temperature: 0.5, maxTokens: 1600 });

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed.cards)) throw new Error('Malformed card list from Groq.');

        return parsed.cards
            .filter((card) => card?.front && card?.back)
            .map((card) => ({
                front: clean(card.front, 480),
                back: clean(card.back, 950),
                source: 'ai',
                lessonId: null
            }));
    } catch (error) {
        console.warn('[flashcards] Groq generation failed, falling back to course content:', error.message);
        return null;
    }
};

/**
 * Build (or top up) the learner's deck for a course.
 *
 * Cards already in the deck are never duplicated, so this is safe to run again
 * after taking more notes — it only adds what is new.
 */
export const generateDeck = async ({ userId, courseId }) => {
    const enrollment = await flashcardsRepository.enrolledCourse({ userId, courseId });
    if (!enrollment) {
        return { error: 'You need to be enrolled in this course to build a deck for it.' };
    }

    const course = await flashcardsRepository.courseById(courseId);
    if (!course) return { error: 'Course not found.' };

    const [objectives, lessons, notes] = await Promise.all([
        flashcardsRepository.courseObjectives(courseId),
        flashcardsRepository.courseLessons(courseId),
        flashcardsRepository.courseNotes({ userId, courseId })
    ]);

    let deck = await flashcardsRepository.deckFor({ userId, courseId });
    if (!deck) {
        const deckId = await flashcardsRepository.createDeck({
            userId,
            courseId,
            title: clean(course.title, 200)
        });
        deck = { id: deckId, course_id: courseId, title: course.title };
    }

    const generated =
        (await generateWithGroq({ course, objectives, lessons, notes })) ??
        generateRuleBased({ course, objectives, lessons, notes });

    // Skip anything already in the deck so repeat runs top up instead of duplicating.
    const existing = await flashcardsRepository.deckFronts(deck.id);
    const fresh = [];
    for (const card of generated) {
        const key = card.front.toLowerCase();
        if (!card.front || !card.back || existing.has(key)) continue;
        existing.add(key);
        fresh.push({
            deck_id: deck.id,
            user_id: userId,
            lesson_id: card.lessonId || null,
            front: card.front,
            back: card.back,
            source: card.source,
            // New cards are due immediately — there is nothing to wait for.
            due_on: today()
        });
        if (fresh.length >= MAX_GENERATED) break;
    }

    const added = await flashcardsRepository.insertCards(fresh);
    return { deckId: deck.id, courseId, title: deck.title, added, aiGenerated: fresh.some((c) => c.source === 'ai') };
};

export const listDecks = async (userId) => {
    const [decks, summary] = await Promise.all([
        flashcardsRepository.listDecks(userId),
        flashcardsRepository.reviewSummary(userId)
    ]);

    return {
        summary,
        decks: decks.map((deck) => ({
            ...deck,
            card_count: Number(deck.card_count) || 0,
            due_count: Number(deck.due_count) || 0,
            learned_count: Number(deck.learned_count) || 0
        }))
    };
};

export const dueQueue = async ({ userId, courseId = null }) => {
    const [cards, summary] = await Promise.all([
        flashcardsRepository.dueCards({ userId, courseId, limit: QUEUE_LIMIT }),
        flashcardsRepository.reviewSummary(userId)
    ]);
    return { cards, summary };
};

/**
 * Grade a card and reschedule it. Reviewing counts towards the daily streak,
 * exactly like finishing a lesson or writing a note.
 */
export const reviewCard = async ({ userId, cardId, rating }) => {
    if (!RATING_QUALITY[rating]) return { error: 'Unknown rating.' };

    const card = await flashcardsRepository.cardById({ userId, cardId });
    if (!card) return { error: 'Card not found.' };

    const next = schedule(card, rating);
    await flashcardsRepository.updateSchedule({ cardId: card.id, ...next });
    await momentumService.recordActivity(userId, 'card');

    return {
        cardId: card.id,
        intervalDays: next.intervalDays,
        repetitions: next.repetitions,
        // A 0-day interval means "still in this session", which the UI words differently.
        dueLabel: next.intervalDays === 0 ? 'Later today' : `In ${next.intervalDays} day${next.intervalDays === 1 ? '' : 's'}`
    };
};

export const createCard = async ({ userId, courseId, lessonId, front, back }) => {
    const cleanFront = clean(front, 480);
    const cleanBack = clean(back, 950);
    if (!cleanFront || !cleanBack) return { error: 'A card needs both a front and a back.' };

    const enrollment = await flashcardsRepository.enrolledCourse({ userId, courseId });
    if (!enrollment) return { error: 'You need to be enrolled in this course to add cards.' };

    let deck = await flashcardsRepository.deckFor({ userId, courseId });
    if (!deck) {
        const course = await flashcardsRepository.courseById(courseId);
        if (!course) return { error: 'Course not found.' };
        const deckId = await flashcardsRepository.createDeck({
            userId,
            courseId,
            title: clean(course.title, 200)
        });
        deck = { id: deckId };
    }

    await flashcardsRepository.insertCards([{
        deck_id: deck.id,
        user_id: userId,
        lesson_id: lessonId || null,
        front: cleanFront,
        back: cleanBack,
        source: 'manual',
        due_on: today()
    }]);

    return { deckId: deck.id, added: 1 };
};

export const editCard = async ({ userId, cardId, front, back }) => {
    const cleanFront = clean(front, 480);
    const cleanBack = clean(back, 950);
    if (!cleanFront || !cleanBack) return { error: 'A card needs both a front and a back.' };

    const updated = await flashcardsRepository.updateCard({ userId, cardId, front: cleanFront, back: cleanBack });
    return updated ? { cardId } : { error: 'Card not found.' };
};

export const removeCard = async ({ userId, cardId }) => {
    const deleted = await flashcardsRepository.deleteCard({ userId, cardId });
    return deleted ? {} : { error: 'Card not found.' };
};
