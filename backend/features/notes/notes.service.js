import { createHash } from 'node:crypto';
import * as notesRepository from './notes.repository.js';
import * as groq from '../aiSupport/groq.service.js';
import cacheService from '../../utils/cache.service.js';

/** Notes are capped so a single note can never blow past the column width. */
export const MAX_NOTE_LENGTH = 2000;

/**
 * List a user's notes for one course (playback order).
 */
export const getCourseNotes = async ({ userId, courseId }) =>
    notesRepository.notesForCourse({ userId, courseId });

/**
 * Every note the user owns, grouped by course so the UI can render one card
 * per course without doing the bucketing itself.
 */
export const getGroupedNotes = async (userId) => {
    const notes = await notesRepository.notesForUser(userId);

    const courses = [];
    const byCourseId = new Map();

    for (const note of notes) {
        let group = byCourseId.get(note.course_id);
        if (!group) {
            group = {
                courseId: note.course_id,
                courseTitle: note.course_title,
                courseThumb: note.course_thumb,
                notes: []
            };
            byCourseId.set(note.course_id, group);
            courses.push(group);
        }
        group.notes.push(note);
    }

    return { courses, totalNotes: notes.length };
};

/**
 * Create a note against a lesson, rejecting lessons that do not belong to the
 * given course so the note can never point at unrelated content.
 */
export const createNote = async ({ userId, courseId, lessonId, timestampSeconds, content }) => {
    const lesson = await notesRepository.findLessonInCourse({ courseId, lessonId });
    if (!lesson) return null;

    const id = await notesRepository.insertNote({
        userId,
        courseId,
        lessonId,
        timestampSeconds,
        content
    });

    return notesRepository.findUserNote({ userId, noteId: id });
};

/**
 * Edit a note's text. Returns null when the note does not belong to the user.
 */
export const editNote = async ({ userId, noteId, content }) => {
    const affectedRows = await notesRepository.updateNote({ userId, noteId, content });
    if (!affectedRows) return null;
    return notesRepository.findUserNote({ userId, noteId });
};

/**
 * Delete a note the user owns. Returns false when there was nothing to delete.
 */
export const removeNote = async ({ userId, noteId }) => {
    const affectedRows = await notesRepository.deleteNote({ userId, noteId });
    return affectedRows > 0;
};

// ── AI notes summary ────────────────────────────────────────────────────────

/** Notes sent to the model, newest-first trimming keeps the prompt bounded. */
const SUMMARY_MAX_NOTES = 120;
/** Characters of note text sent to the model in total. */
const SUMMARY_MAX_CHARS = 12000;
/** Summaries are reused until a note changes, but never kept longer than this. */
const SUMMARY_CACHE_SECONDS = 7 * 24 * 60 * 60;

const formatTime = (seconds) => {
    const total = Math.max(0, Math.floor(Number(seconds) || 0));
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

/** First sentence of a note, which is usually the point the learner wanted to keep. */
const firstSentence = (text) => {
    const flat = String(text).replace(/\s+/g, ' ').trim();
    const match = flat.match(/^.{12,}?[.!?](?=\s|$)/);
    return (match ? match[0] : flat).slice(0, 200);
};

/**
 * Free fallback when Groq is unconfigured or fails: counts and the opening
 * line of each note, grouped in lesson order. Nothing is invented.
 */
const summarizeRuleBased = (courseTitle, notes) => {
    const byLesson = new Map();
    for (const note of notes) {
        const key = note.lesson_name || 'Other';
        byLesson.set(key, (byLesson.get(key) || 0) + 1);
    }
    const [busiestLesson, busiestCount] = [...byLesson].sort((a, b) => b[1] - a[1])[0];

    const summary = `You've taken ${notes.length} note${notes.length === 1 ? '' : 's'} across ` +
        `${byLesson.size} lesson${byLesson.size === 1 ? '' : 's'} of ${courseTitle}. ` +
        (busiestCount > 1 ? `You wrote the most during "${busiestLesson}".` : '');

    return {
        summary: summary.trim(),
        keyPoints: notes.slice(0, 8).map((n) => firstSentence(n.content)),
        reviewNext: []
    };
};

const summarizeWithGroq = async (courseTitle, notes) => {
    let budget = SUMMARY_MAX_CHARS;
    const lines = [];
    for (const note of notes.slice(0, SUMMARY_MAX_NOTES)) {
        const line = `[${note.lesson_name || 'Lesson'} @ ${formatTime(note.timestamp_seconds)}] ${note.content}`;
        if (line.length > budget) break;
        budget -= line.length;
        lines.push(line);
    }

    const raw = await groq.chatComplete([
        {
            role: 'system',
            content: 'You turn a learner\'s own lecture notes into a study summary. Use ONLY what the notes say — ' +
                'never add facts that are not in them. Write to the learner as "you". Reply with ONLY a JSON object: ' +
                '{"summary": string (3-5 sentences), "keyPoints": string[] (4-8 short bullet points, the most ' +
                'important ideas), "reviewNext": string[] (0-3 lesson names worth revisiting because the notes there ' +
                'look incomplete or confused)}.'
        },
        { role: 'user', content: `Course: ${courseTitle}\n\nMy notes, in lesson order:\n${lines.join('\n')}` }
    ], { json: true, temperature: 0.3, maxTokens: 900 });

    const parsed = JSON.parse(raw);
    const strings = (value, max) => (Array.isArray(value) ? value : [])
        .filter((v) => typeof v === 'string' && v.trim())
        .map((v) => v.trim())
        .slice(0, max);

    const result = {
        summary: typeof parsed.summary === 'string' ? parsed.summary.trim() : '',
        keyPoints: strings(parsed.keyPoints, 8),
        reviewNext: strings(parsed.reviewNext, 3)
    };
    if (!result.summary || !result.keyPoints.length) throw new Error('Malformed summary shape from Groq.');
    return result;
};

/**
 * A study summary of everything the user noted in one course. Uses Groq when
 * configured (cached until any note changes), otherwise a rule-based digest.
 * Returns null when the user has no notes in the course.
 *
 * @returns {Promise<{summary: string, keyPoints: string[], reviewNext: string[], source: 'ai'|'basic'}|null>}
 */
export const summarizeCourseNotes = async ({ userId, courseId }) => {
    const notes = await notesRepository.notesForCourse({ userId, courseId });
    if (!notes.length) return null;
    const courseTitle = notes[0].course_title || 'this course';

    if (groq.isConfigured()) {
        // Any edit, add or delete changes the fingerprint, so a stale summary is never served.
        const fingerprint = createHash('sha1')
            .update(notes.map((n) => `${n.id}:${new Date(n.updated_at).getTime()}`).join('|'))
            .digest('hex');
        const cacheKey = `ai:notes-summary:${userId}:${courseId}:${fingerprint}`;

        try {
            const cached = await cacheService.get(cacheKey);
            if (cached) return { ...JSON.parse(cached), source: 'ai' };

            const result = await summarizeWithGroq(courseTitle, notes);
            await cacheService.set(cacheKey, result, SUMMARY_CACHE_SECONDS);
            return { ...result, source: 'ai' };
        } catch (err) {
            console.warn('[notes] Groq summary failed, using rule-based digest:', err.message);
        }
    }

    return { ...summarizeRuleBased(courseTitle, notes), source: 'basic' };
};

// ── "Tidy up" a quick note ──────────────────────────────────────────────────

/**
 * Free fallback: tidy whitespace, capitalise each line, fix a lone "i", and
 * turn several lines into bullets. Words are never changed or added.
 */
const tidyRuleBased = (text) => {
    const lines = String(text)
        .split('\n')
        .map((line) => line.replace(/\s+/g, ' ').trim().replace(/^[-*•]\s*/, ''))
        .filter(Boolean)
        .map((line) => line.replace(/(^|\s)i(?=\s|'|$)/g, '$1I'))
        .map((line) => line.charAt(0).toUpperCase() + line.slice(1));

    return lines.length > 1 ? lines.map((line) => `- ${line}`).join('\n') : (lines[0] || '');
};

const tidyWithGroq = async (text, lessonName) => {
    const raw = await groq.chatComplete([
        {
            role: 'system',
            content: "You tidy up a learner's quick note taken while watching a lecture. Fix spelling, grammar and " +
                'capitalisation, expand obvious shorthand, and put separate points on their own "- " bullet lines. ' +
                'Keep their meaning and voice, keep any code exactly as written, and never add information that is ' +
                'not in the note. Plain text only — no headings or bold. Reply with ONLY a JSON object: {"text": string}.'
        },
        { role: 'user', content: `${lessonName ? `Lesson: ${lessonName}\n` : ''}Note:\n${text}` }
    ], { json: true, temperature: 0.2, maxTokens: 800 });

    const parsed = JSON.parse(raw);
    const tidied = typeof parsed.text === 'string' ? parsed.text.trim() : '';
    if (!tidied) throw new Error('Groq returned an empty note.');
    return tidied.slice(0, MAX_NOTE_LENGTH);
};

/**
 * Clean up a note draft before it is saved. Nothing is stored here — the
 * learner sees the result in the composer and can undo it.
 *
 * @param {string} text - the draft, already trimmed and length-capped
 * @param {string} [lessonName] - helps expand shorthand ("fn" in a JS lesson)
 * @returns {Promise<{text: string, source: 'ai'|'basic'}>}
 */
export const tidyNote = async (text, lessonName) => {
    if (groq.isConfigured()) {
        try {
            return { text: await tidyWithGroq(text, lessonName), source: 'ai' };
        } catch (err) {
            console.warn('[notes] Groq tidy failed, using rule-based cleanup:', err.message);
        }
    }
    return { text: tidyRuleBased(text), source: 'basic' };
};
