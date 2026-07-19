import * as aiSupportRepository from './aiSupport.repository.js';
import * as groq from './groq.service.js';
import { FAQ_ENTRIES, findAnswer as findFaqAnswer } from './faq.data.js';

// Grounding text for the general support chatbot: the whole FAQ set, sent as
// context so Groq answers using facts about THIS app instead of guessing.
const FAQ_CONTEXT = FAQ_ENTRIES.map((e) => `Q: ${e.question}\nA: ${e.answer}`).join('\n\n');

const STOPWORDS = new Set(['a', 'an', 'the', 'is', 'are', 'do', 'does', 'how', 'what', 'i', 'to', 'for', 'of', 'in', 'on', 'my', 'can', 'get', 'this', 'course', 'about']);

// Shared system framing so every Groq call stays scoped to this app and
// answers in the same voice — kept short to leave room for grounding context.
const APP_SYSTEM_PROMPT = 'You are the support assistant for Online Pathshala, a free online course marketplace. ' +
    'Answer briefly (2-3 sentences max), in a friendly and direct tone, using ONLY the context provided. ' +
    "If the context doesn't cover the question, say so honestly instead of guessing.";

/**
 * Ask Groq a grounded question and fall back to a provided rule-based
 * answer if Groq is unconfigured or the call fails for any reason
 * (missing key, rate limit, network error, timeout). This is the one
 * seam every AI-support feature routes through, so the "always free,
 * always available" guarantee only needs to be implemented once.
 *
 * @param {string} systemContext - grounding facts appended to the base system prompt
 * @param {string} userMessage - the learner's question, verbatim
 * @param {() => (T | Promise<T>)} fallbackFn - rule-based result to use if Groq is unavailable
 * @returns {Promise<T>}
 */
const askGroqOrFallback = async (systemContext, userMessage, fallbackFn) => {
    if (!groq.isConfigured()) return fallbackFn();
    try {
        const answer = await groq.chatComplete([
            { role: 'system', content: `${APP_SYSTEM_PROMPT}\n\nContext:\n${systemContext}` },
            { role: 'user', content: userMessage }
        ]);
        return answer;
    } catch (err) {
        console.warn('[aiSupport] Groq call failed, falling back to rule-based answer:', err.message);
        return fallbackFn();
    }
};

const tokenize = (text) => String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w));

const overlapScore = (queryTokens, text) => {
    const textTokens = new Set(tokenize(text));
    let score = 0;
    for (const t of queryTokens) {
        if (textTokens.has(t)) score += 1;
    }
    return score;
};

/**
 * General app-support chatbot answer. Tries Groq (grounded on the FAQ set)
 * first for a real conversational answer, then falls back to the free
 * keyword-matching FAQ engine if Groq is unconfigured or fails.
 *
 * @param {string} message - the learner's free-text question
 * @returns {Promise<{answer: string, matched: object|null, suggestions: Array}>}
 */
export const answerGeneralSupportQuestion = async (message) => {
    const ruleBasedResult = findFaqAnswer(message);

    const groqAnswer = await askGroqOrFallback(FAQ_CONTEXT, message, () => null);
    if (groqAnswer) {
        // Keep the rule-based `matched`/`suggestions` metadata (used by the UI
        // for follow-up chips) even when the prose answer comes from Groq.
        return { answer: groqAnswer, matched: ruleBasedResult.matched, suggestions: ruleBasedResult.suggestions };
    }
    return ruleBasedResult;
};

/**
 * Rule-based fallback for course-specific questions: scores the course's own
 * subtitle/objectives/lesson names against the question by keyword overlap.
 * Used directly when Groq is unconfigured, and as the fallback if Groq fails.
 */
const answerCourseQuestionRuleBased = (course, objectives, lessons, question) => {
    const queryTokens = tokenize(question);
    if (!queryTokens.length) {
        return `${course.title} is taught by ${course.author}. Ask me something specific about what it covers!`;
    }

    const candidates = [
        { text: course.subtitle, source: 'description', label: course.subtitle },
        ...objectives.map((o) => ({ text: o.objective, source: 'objective', label: o.objective })),
        ...lessons.map((l) => ({
            text: `${l.section_name} ${l.lesson_name}`,
            source: 'lesson',
            label: `"${l.lesson_name}" (${l.section_name}, ${l.duration})`
        }))
    ].filter((c) => c.text);

    const scored = candidates
        .map((c) => ({ ...c, score: overlapScore(queryTokens, c.text) }))
        .sort((a, b) => b.score - a.score);

    const top = scored[0];
    if (!top || top.score === 0) {
        return `I couldn't find that in ${course.title}'s content. Try the Q&A section below to ask the instructor directly.`;
    }

    const prefix = top.source === 'lesson'
        ? 'This is covered in the lesson '
        : top.source === 'objective'
            ? 'Yes — this course teaches you to: '
            : 'From the course description: ';

    return `${prefix}${top.label}`;
};

const formatObjectiveLine = (o) => `- ${o.objective}`;
const formatLessonLine = (l) => `- ${l.section_name}: ${l.lesson_name} (${l.duration})`;

/**
 * Answer a question about one specific course, grounded in its own content
 * (subtitle, learning objectives, lesson names/sections). Uses Groq for a
 * real conversational answer when configured, otherwise scores the course's
 * content against the question by keyword overlap — either way the answer
 * only ever draws on this course's actual content, never invented facts.
 */
export const answerCourseQuestion = async (courseId, question) => {
    const course = await aiSupportRepository.getCourseDetails(courseId);
    if (!course) return { answer: 'Course not found.', source: null };

    const objectives = await aiSupportRepository.getCourseObjectives(courseId);
    const lessons = await aiSupportRepository.getCourseLessons(courseId);

    const courseContext = [
        `Course title: ${course.title}`,
        `Category: ${course.category}`,
        `Instructor: ${course.author}`,
        `Description: ${course.subtitle || '(none)'}`,
        objectives.length ? `Learning objectives:\n${objectives.map(formatObjectiveLine).join('\n')}` : '',
        lessons.length ? `Lessons:\n${lessons.map(formatLessonLine).join('\n')}` : ''
    ].filter(Boolean).join('\n\n');

    const answer = await askGroqOrFallback(
        courseContext,
        question,
        () => answerCourseQuestionRuleBased(course, objectives, lessons, question)
    );

    return { answer };
};

/**
 * Template-based writing suggestions for tutors creating a course.
 * Mixes category-specific phrase banks with generic outcome templates —
 * no external model call, fully deterministic given the inputs.
 */
const CATEGORY_SKILLS = {
    Development: ['writing clean, maintainable code', 'building real-world projects', 'debugging like a professional', 'understanding core programming concepts'],
    Finance: ['reading financial statements', 'making informed investment decisions', 'understanding market fundamentals', 'managing risk effectively'],
    Health: ['building sustainable healthy habits', 'understanding nutrition basics', 'creating a personalized fitness plan', 'improving long-term wellbeing'],
    Music: ['reading and playing music confidently', 'developing your ear for music', 'mastering core technique', 'performing with confidence'],
    Business: ['developing a growth strategy', 'improving team leadership skills', 'making data-driven decisions', 'building a scalable business model'],
    Design: ['creating professional-quality visuals', 'understanding design principles', 'building a strong portfolio', 'using industry-standard tools'],
    PhotoVideo: ['producing polished, professional edits', 'understanding composition and lighting', 'mastering your editing software', 'developing a unique creative style'],
    'Real Estate': ['evaluating investment opportunities', 'understanding market analysis', 'structuring profitable deals', 'managing property effectively'],
    Office: ['working faster with essential shortcuts', 'building professional spreadsheets and documents', 'automating repetitive tasks', 'presenting data clearly']
};

const TITLE_TEMPLATES = [
    (topic) => `Complete ${topic} Bootcamp`,
    (topic) => `Master ${topic}: From Beginner to Pro`,
    (topic) => `${topic} Essentials`,
    (topic) => `Learn ${topic} the Right Way`,
    (topic) => `${topic} Crash Course`
];

const SUBTITLE_TEMPLATES = [
    (topic, category) => `A practical, hands-on introduction to ${topic} for anyone starting out in ${category}.`,
    (topic) => `Go from zero to confident with ${topic} through real projects and clear explanations.`,
    (topic) => `Everything you need to get started with ${topic} — no prior experience required.`
];

const suggestCourseCopyRuleBased = (topic, category) => {
    const skills = CATEGORY_SKILLS[category] || CATEGORY_SKILLS.Development;
    const titles = TITLE_TEMPLATES.map((fn) => fn(topic));
    const subtitles = SUBTITLE_TEMPLATES.map((fn) => fn(topic, category || 'this field'));
    const objectives = skills.map((skill) => `Be able to apply ${skill}`);
    return { titles, subtitles, objectives };
};

/**
 * Writing suggestions for tutors creating a course: 5 titles, 3 subtitles,
 * and 4 learning objectives. Uses Groq for genuinely creative copy when
 * configured (requesting strict JSON back), otherwise falls back to the
 * deterministic category-phrase templates below.
 */
export const suggestCourseCopy = async (title, category) => {
    const topic = (title || 'this topic').trim();

    if (groq.isConfigured()) {
        try {
            const raw = await groq.chatComplete([
                {
                    role: 'system',
                    content: 'You write marketing copy for online course listings. ' +
                        'Reply with ONLY a JSON object of the exact shape ' +
                        '{"titles": string[5], "subtitles": string[3], "objectives": string[4]} — no other text.'
                },
                { role: 'user', content: `Working title: "${topic}". Category: ${category || 'General'}.` }
            ], { json: true, temperature: 0.8 });

            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed.titles) && Array.isArray(parsed.subtitles) && Array.isArray(parsed.objectives)) {
                return parsed;
            }
            throw new Error('Malformed suggestion shape from Groq.');
        } catch (err) {
            console.warn('[aiSupport] Groq copy suggestion failed, falling back to templates:', err.message);
        }
    }

    return suggestCourseCopyRuleBased(topic, category);
};

/**
 * Content-based course recommendations: courses sharing a category with the
 * user's enrolled/wishlisted courses, ranked by rating + enrollment count,
 * excluding courses the user is already enrolled in.
 */
export const getRecommendationsForUser = async (userId, limit = 8) => {
    const interestRows = await aiSupportRepository.getCategoryWeights(userId);

    if (!interestRows.length) {
        // Cold start: no signal yet — fall back to top-rated courses overall.
        const results = await aiSupportRepository.getPopularCourses(limit);
        return { courses: results, reason: 'popular' };
    }

    const categories = interestRows.map((r) => r.category);
    const results = await aiSupportRepository.getInterestCourses(categories, userId, limit);

    return { courses: results, reason: 'interests', basedOn: categories.slice(0, 3) };
};
