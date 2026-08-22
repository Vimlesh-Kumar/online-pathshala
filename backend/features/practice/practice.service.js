import * as practiceRepository from './practice.repository.js';
import * as groq from '../aiSupport/groq.service.js';
import * as momentumService from '../momentum/momentum.service.js';

/** Questions served in one practice round. */
const ROUND_SIZE = 6;
/** Below this, the cached bank is topped up before serving a round. */
const MIN_BANK = 4;

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

const clean = (value, max) => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

const shuffle = (items) => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
};

/** Up to `count` wrong answers drawn from a pool, never repeating the right one. */
const distractors = (pool, correct, count = 3) =>
    shuffle([...new Set(pool)].filter((value) => value && value !== correct)).slice(0, count);

/**
 * Turn a correct answer plus distractors into a stored question row.
 * Returns null when there are too few distinct options to make a fair question.
 */
const buildRow = ({ courseId, lessonId, question, correct, wrong, explanation, topic }) => {
    if (wrong.length < 2) return null;

    const options = shuffle([correct, ...wrong]).slice(0, 4);
    const correctIndex = options.indexOf(correct);

    const row = {
        course_id: courseId,
        lesson_id: lessonId || null,
        question: clean(question, 480),
        option_a: clean(options[0], 250),
        option_b: clean(options[1], 250),
        option_c: options[2] ? clean(options[2], 250) : null,
        option_d: options[3] ? clean(options[3], 250) : null,
        correct_option: OPTION_LETTERS[correctIndex],
        explanation: explanation ? clean(explanation, 480) : null,
        topic: topic ? clean(topic, 120) : null
    };
    return row;
};

/**
 * Free, deterministic question generation from the course's own curriculum.
 *
 * Every question here is answerable purely from data the course already holds
 * (which section a lesson sits in, what follows what), so it is always correct
 * even though no model was involved.
 */
const generateRuleBased = ({ courseId, lessons, lessonId }) => {
    const scoped = lessonId ? lessons.filter((l) => l.id === lessonId) : lessons;
    if (!scoped.length) return [];

    const sections = [...new Set(lessons.map((l) => l.section_name).filter(Boolean))];
    const lessonNames = lessons.map((l) => l.lesson_name).filter(Boolean);
    const rows = [];

    // Which section does a lesson belong to?
    if (sections.length >= 3) {
        for (const lesson of scoped) {
            const row = buildRow({
                courseId,
                lessonId,
                question: `Which section of this course contains the lesson “${lesson.lesson_name}”?`,
                correct: lesson.section_name,
                wrong: distractors(sections, lesson.section_name),
                explanation: `“${lesson.lesson_name}” is taught in the “${lesson.section_name}” section.`,
                topic: lesson.section_name
            });
            if (row) rows.push(row);
        }
    }

    // What comes next in the curriculum?
    for (let i = 0; i < lessons.length - 1; i += 1) {
        const current = lessons[i];
        const next = lessons[i + 1];
        if (lessonId && current.id !== lessonId && next.id !== lessonId) continue;

        const row = buildRow({
            courseId,
            lessonId,
            question: `Which lesson comes immediately after “${current.lesson_name}”?`,
            correct: next.lesson_name,
            wrong: distractors(lessonNames, next.lesson_name),
            explanation: `The curriculum runs “${current.lesson_name}” → “${next.lesson_name}”.`,
            topic: current.section_name
        });
        if (row) rows.push(row);
    }

    return shuffle(rows).slice(0, ROUND_SIZE);
};

/**
 * Ask Groq for real comprehension questions about the course content.
 * Returns null on any failure so the caller falls back to the curriculum rules.
 */
const generateWithGroq = async ({ courseId, course, objectives, lessons, lesson, lessonId }) => {
    if (!groq.isConfigured()) return null;

    const scope = lesson
        ? `Focus every question on the single lesson “${lesson.lesson_name}” (section: ${lesson.section_name}).`
        : 'Cover the course as a whole.';

    const context = [
        `Course: ${course.title}`,
        `Category: ${course.category}`,
        course.subtitle ? `Description: ${course.subtitle}` : '',
        objectives.length ? `Learning objectives:\n${objectives.map((o) => `- ${o.objective}`).join('\n')}` : '',
        lessons.length ? `Curriculum:\n${lessons.map((l) => `- ${l.section_name}: ${l.lesson_name}`).join('\n')}` : '',
        scope
    ].filter(Boolean).join('\n\n');

    try {
        const raw = await groq.chatComplete([
            {
                role: 'system',
                content: 'You write multiple-choice practice questions for an online course. ' +
                    'Base them ONLY on the supplied course content and on standard knowledge of the ' +
                    'subject it teaches. Exactly one option must be correct, and the three wrong ' +
                    'options must be plausible. Reply with ONLY a JSON object of the shape ' +
                    '{"questions": [{"question": string, "options": string[4], "correctIndex": number, ' +
                    `"explanation": string, "topic": string}]} containing ${ROUND_SIZE} questions.`
            },
            { role: 'user', content: context }
        ], { json: true, temperature: 0.6, maxTokens: 2000 });

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed.questions)) throw new Error('Malformed question list from Groq.');

        const rows = [];
        for (const item of parsed.questions) {
            const options = Array.isArray(item?.options) ? item.options.filter(Boolean) : [];
            const correct = options[Number(item?.correctIndex)];
            if (!item?.question || options.length < 3 || !correct) continue;

            const row = buildRow({
                courseId,
                lessonId,
                question: item.question,
                correct,
                wrong: options.filter((option) => option !== correct),
                explanation: item.explanation,
                topic: item.topic
            });
            if (row) rows.push(row);
        }

        return rows.length ? rows : null;
    } catch (error) {
        console.warn('[practice] Groq question generation failed, falling back to curriculum:', error.message);
        return null;
    }
};

/** Strip the answer key before a question ever reaches the browser. */
const toClientQuestion = (row) => ({
    id: row.id,
    question: row.question,
    option_a: row.option_a,
    option_b: row.option_b,
    option_c: row.option_c,
    option_d: row.option_d,
    topic: row.topic
});

/**
 * A round of practice questions for a course, or one lesson within it.
 *
 * Generated questions are cached in the database, so the first round costs a
 * model call and every later one is instant. `refresh` forces a new batch.
 */
export const getRound = async ({ userId, courseId, lessonId = null, refresh = false }) => {
    const enrollment = await practiceRepository.enrolledCourse({ userId, courseId });
    if (!enrollment) {
        return { error: 'You need to be enrolled in this course to practise it.' };
    }

    const course = await practiceRepository.courseById(courseId);
    if (!course) return { error: 'Course not found.' };

    let lesson = null;
    if (lessonId) {
        lesson = await practiceRepository.lessonById({ courseId, lessonId });
        if (!lesson) return { error: 'Lesson not found in this course.' };
    }

    let bank = await practiceRepository.questionsForScope({ courseId, lessonId });

    if (refresh || bank.length < MIN_BANK) {
        const [objectives, lessons] = await Promise.all([
            practiceRepository.courseObjectives(courseId),
            practiceRepository.courseLessons(courseId)
        ]);

        const generated =
            (await generateWithGroq({ courseId, course, objectives, lessons, lesson, lessonId })) ??
            generateRuleBased({ courseId, lessons, lessonId });

        // A small course can only yield a handful of questions, so generation runs
        // again on every visit. Without this the same questions would pile up in
        // the bank each time.
        const seen = new Set(bank.map((question) => question.question.trim().toLowerCase()));
        const fresh = generated.filter((question) => {
            const key = question.question.trim().toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        if (fresh.length) {
            await practiceRepository.insertQuestions(fresh);
            bank = await practiceRepository.questionsForScope({ courseId, lessonId });
        }
    }

    if (!bank.length) {
        return { error: 'This course does not have enough content to practise yet.' };
    }

    const stats = await practiceRepository.attemptStats({ userId, courseId });
    return {
        courseId,
        lessonId,
        lessonName: lesson?.lesson_name || null,
        questions: shuffle(bank).slice(0, ROUND_SIZE).map(toClientQuestion),
        stats
    };
};

/**
 * Grade a submitted round.
 *
 * Answers are always re-checked against the stored questions — the client is
 * never trusted with the key — and the topics of missed questions come back so
 * the learner knows what to revisit.
 */
export const submitRound = async ({ userId, courseId, lessonId = null, answers }) => {
    const ids = Object.keys(answers || {}).map(Number).filter(Boolean);
    if (!ids.length) return { error: 'No answers submitted.' };

    const enrollment = await practiceRepository.enrolledCourse({ userId, courseId });
    if (!enrollment) {
        return { error: 'You need to be enrolled in this course to practise it.' };
    }

    const questions = await practiceRepository.questionsByIds({ courseId, ids });
    if (!questions.length) return { error: 'Those questions are no longer available.' };

    const missedTopics = new Set();
    const results = questions.map((question) => {
        const given = String(answers[question.id] || '').toUpperCase();
        const isCorrect = given === question.correct_option;
        if (!isCorrect && question.topic) missedTopics.add(question.topic);

        const optionText = {
            A: question.option_a,
            B: question.option_b,
            C: question.option_c,
            D: question.option_d
        };

        return {
            id: question.id,
            question: question.question,
            given: given || null,
            givenAnswer: optionText[given] || null,
            correctOption: question.correct_option,
            // The client no longer holds the options by the time results render,
            // so the answer is sent as text, not just a letter.
            correctAnswer: optionText[question.correct_option] || null,
            isCorrect,
            explanation: question.explanation,
            topic: question.topic
        };
    });

    const correct = results.filter((result) => result.isCorrect).length;
    const total = results.length;
    const score = Math.round((correct / total) * 100);
    const weakTopics = [...missedTopics];

    await practiceRepository.recordAttempt({
        userId,
        courseId,
        lessonId,
        total,
        correct,
        score,
        weakTopics: weakTopics.join(', ').slice(0, 500)
    });
    await momentumService.recordActivity(userId, 'quiz');

    const stats = await practiceRepository.attemptStats({ userId, courseId });
    return { total, correct, score, results, weakTopics, stats };
};

/** Past attempts for a course, newest first. */
export const getHistory = async ({ userId, courseId }) => {
    const [attempts, stats] = await Promise.all([
        practiceRepository.attemptsForCourse({ userId, courseId }),
        practiceRepository.attemptStats({ userId, courseId })
    ]);

    return {
        stats,
        attempts: attempts.map((attempt) => ({
            ...attempt,
            weak_topics: attempt.weak_topics ? attempt.weak_topics.split(', ').filter(Boolean) : []
        }))
    };
};
