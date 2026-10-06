import * as aiSupportRepository from './aiSupport.repository.js';
import * as groq from './groq.service.js';
import { FAQ_ENTRIES, findAnswer as findFaqAnswer } from './faq.data.js';
import cacheService from '../../utils/cache.service.js';

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

// ── AI study tutor ──────────────────────────────────────────────────────────

/** Turns of conversation history sent upstream — enough for follow-ups, bounded for tokens. */
const TUTOR_HISTORY_TURNS = 12;
const TUTOR_MESSAGE_MAX = 2000;
/** Big courses would otherwise flood the prompt with their whole lesson list. */
const TUTOR_OUTLINE_LESSONS = 80;

const TUTOR_SYSTEM_PROMPT = 'You are a friendly, patient study tutor inside Online Pathshala, helping a learner ' +
    'who is taking the course described below. Explain ideas clearly with short, concrete examples. ' +
    'Keep answers under about 180 words unless the learner asks for more depth. ' +
    'Format with simple Markdown only: **bold**, `inline code`, fenced code blocks and "-" bullet lists — ' +
    'no headings, tables, images or links. ' +
    'The course outline tells you what this course covers; use your general knowledge to teach those topics, ' +
    "but never claim the course or instructor said something that isn't in the outline. " +
    'When asked to quiz the learner, ask one question at a time and wait for their answer before giving feedback. ' +
    'If a request has nothing to do with learning, politely steer back to the course.';

/**
 * Keep only well-formed user/assistant turns, trimmed and capped, ending on
 * the learner's question. Returns null when there is no question to answer.
 *
 * @param {unknown} raw - the `messages` array from the request body
 * @returns {Array<{role: 'user'|'assistant', content: string}>|null}
 */
export const sanitizeTutorHistory = (raw) => {
    if (!Array.isArray(raw)) return null;

    const history = raw
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant'))
        .map((m) => ({ role: m.role, content: String(m.content ?? '').trim().slice(0, TUTOR_MESSAGE_MAX) }))
        .filter((m) => m.content)
        .slice(-TUTOR_HISTORY_TURNS);

    if (!history.length || history[history.length - 1].role !== 'user') return null;
    return history;
};

/**
 * Everything the tutor is grounded on for one course, or null if the course
 * doesn't exist. Loaded before streaming starts so a bad course id can still
 * get a normal 404 response.
 */
export const loadTutorContext = async (courseId, lessonId) => {
    const course = await aiSupportRepository.getCourseDetails(courseId);
    if (!course) return null;

    const [objectives, lessons] = await Promise.all([
        aiSupportRepository.getCourseObjectives(courseId),
        aiSupportRepository.getCourseLessons(courseId)
    ]);
    const currentLesson = lessons.find((l) => l.id === lessonId) || null;

    return { course, objectives, lessons, currentLesson };
};

const buildTutorSystemMessage = ({ course, objectives, lessons, currentLesson }) => {
    const outline = lessons.slice(0, TUTOR_OUTLINE_LESSONS).map(formatLessonLine).join('\n');
    return [
        TUTOR_SYSTEM_PROMPT,
        `Course: ${course.title} (${course.category}) by ${course.author}`,
        `Description: ${course.subtitle || '(none)'}`,
        objectives.length ? `Learning objectives:\n${objectives.map(formatObjectiveLine).join('\n')}` : '',
        outline ? `Course outline:\n${outline}` : '',
        currentLesson
            ? `The learner is currently on the lesson "${currentLesson.lesson_name}" in the section "${currentLesson.section_name}". ` +
              'Assume questions are about this lesson unless they say otherwise.'
            : ''
    ].filter(Boolean).join('\n\n');
};

/**
 * Stream the tutor's reply as text chunks.
 *
 * Uses Groq when configured. If Groq is unconfigured or fails before saying
 * anything, the learner still gets the rule-based course-content answer, so
 * the tutor never just goes silent. If the stream breaks partway through, the
 * partial answer is kept and a short note says it was cut off.
 *
 * @param {object} context - from loadTutorContext()
 * @param {Array<{role: string, content: string}>} history - from sanitizeTutorHistory()
 * @param {AbortSignal} [abortSignal] - fires when the learner disconnects
 * @returns {AsyncGenerator<string>}
 */
export async function* streamTutorReply(context, history, abortSignal) {
    const question = history[history.length - 1].content;
    const fallback = () => answerCourseQuestionRuleBased(
        context.course, context.objectives, context.lessons, question
    );

    if (!groq.isConfigured()) {
        yield fallback();
        return;
    }

    let saidAnything = false;
    try {
        const stream = groq.chatStream(
            [{ role: 'system', content: buildTutorSystemMessage(context) }, ...history],
            { temperature: 0.5, maxTokens: 700, abortSignal }
        );
        for await (const delta of stream) {
            saidAnything = true;
            yield delta;
        }
    } catch (err) {
        if (abortSignal?.aborted) return;
        console.warn('[aiSupport] Tutor stream failed:', err.message);
        if (saidAnything) {
            yield '\n\n_(The tutor got cut off — ask again to continue.)_';
        } else {
            yield fallback();
        }
    }
}

// ── "Why you'd like this" for recommendations ───────────────────────────────

/** How long an explained set of recommendations is reused before asking Groq again. */
const REASONS_CACHE_SECONDS = 6 * 60 * 60;
const REASON_MAX = 140;

/**
 * Deterministic one-liners built from the same signals the ranking uses —
 * the always-available path when Groq is unconfigured or fails.
 */
const explainRuleBased = (courses, interestCategories) => {
    const reasons = {};
    for (const course of courses) {
        const rating = Number(course.avg_rating || 0);
        const learners = Number(course.enrolled_students || 0);
        if (interestCategories.includes(course.category)) {
            reasons[course.id] = `More ${course.category}, which you've been exploring.`;
        } else if (rating >= 4) {
            reasons[course.id] = `Rated ${rating.toFixed(1)}★${learners ? ` by ${learners} learners` : ''}.`;
        } else {
            reasons[course.id] = `A popular pick in ${course.category}.`;
        }
    }
    return reasons;
};

const explainWithGroq = async (courses, interestCategories, enrolledTitles) => {
    const learnerProfile = [
        interestCategories.length ? `Interested in: ${interestCategories.join(', ')}` : 'New learner, no history yet.',
        enrolledTitles.length ? `Already taking: ${enrolledTitles.map((t) => `"${t}"`).join(', ')}` : ''
    ].filter(Boolean).join('\n');

    const catalog = courses
        .map((c) => `${c.id}: "${c.title}" [${c.category}] — ${c.subtitle || 'no description'}`)
        .join('\n');

    const raw = await groq.chatComplete([
        {
            role: 'system',
            content: 'You explain course recommendations on a learning site. For each course, write ONE short, ' +
                'specific sentence (max 18 words) telling this learner why it suits them — connect it to what ' +
                'they already study when you can. Address them as "you". No hype words like "amazing". ' +
                'Reply with ONLY a JSON object mapping each course id (as a string) to its sentence.'
        },
        { role: 'user', content: `Learner:\n${learnerProfile}\n\nRecommended courses:\n${catalog}` }
    ], { json: true, temperature: 0.6, maxTokens: 900 });

    const parsed = JSON.parse(raw);
    const reasons = {};
    for (const course of courses) {
        const text = parsed[String(course.id)];
        if (typeof text === 'string' && text.trim()) {
            reasons[course.id] = text.trim().slice(0, REASON_MAX);
        }
    }
    if (!Object.keys(reasons).length) throw new Error('Groq returned no usable reasons.');
    return reasons;
};

/**
 * One-line "why you'd like this" for each recommended course. The course ids
 * come from the client, but every fact used (titles, categories, ratings) is
 * re-read from the database, so a client can't inject text into the prompt.
 *
 * @param {number} userId
 * @param {number[]} courseIds - the recommendations currently on screen
 * @returns {Promise<{reasons: Record<number, string>, source: 'ai'|'basic'}>}
 */
export const explainRecommendations = async (userId, courseIds) => {
    const [courses, interestRows] = await Promise.all([
        aiSupportRepository.getCoursesByIds(courseIds),
        aiSupportRepository.getCategoryWeights(userId)
    ]);
    if (!courses.length) return { reasons: {}, source: 'basic' };

    const interestCategories = interestRows.map((r) => r.category);
    const ruleBased = explainRuleBased(courses, interestCategories);

    if (groq.isConfigured()) {
        const cacheKey = `ai:rec-reasons:${userId}:${courses.map((c) => c.id).sort((a, b) => a - b).join(',')}`;
        try {
            const cached = await cacheService.get(cacheKey);
            let reasons = cached ? JSON.parse(cached) : null;
            if (!reasons) {
                const enrolledTitles = await aiSupportRepository.getEnrolledCourseTitles(userId);
                reasons = await explainWithGroq(courses, interestCategories, enrolledTitles);
                await cacheService.set(cacheKey, reasons, REASONS_CACHE_SECONDS);
            }
            // Groq may skip a course; fill any gaps so every card gets a line.
            return { reasons: { ...ruleBased, ...reasons }, source: 'ai' };
        } catch (err) {
            console.warn('[aiSupport] Groq recommendation reasons failed, using rule-based:', err.message);
        }
    }

    return { reasons: ruleBased, source: 'basic' };
};

// ── Smart search: "describe what you want to learn" ─────────────────────────

const SMART_SEARCH_LIMIT = 12;
const SMART_SEARCH_CACHE_SECONDS = 24 * 60 * 60;

/** Words that describe the wish, not the topic ("I want to start learning…"). */
const SEARCH_FILLER = new Set([
    ...STOPWORDS, 'want', 'wanna', 'learn', 'learning', 'like', 'would', 'need', 'help', 'me', 'with', 'and', 'or',
    'some', 'something', 'become', 'better', 'start', 'starting', 'beginner', 'beginners', 'basics', 'basic', 'good',
    'best', 'really', 'im', 'know', 'using', 'use', 'be', 'able', 'from', 'at', 'it', 'that', 'which', 'teach',
    'courses', 'class', 'classes', 'tutorial', 'tutorials', 'make', 'making', 'way', 'ways', 'get', 'into', 'more',
    'new', 'skills', 'skill', 'easy', 'quick', 'quickly', 'free', 'online', 'scratch', 'zero', 'pro', 'own',
    'build', 'building', 'create', 'creating', 'understand', 'understanding', 'master', 'mastering', 'improve',
    'study', 'studying', 'interested', 'trying', 'try', 'about', 'things', 'thing', 'stuff', 'job', 'career'
]);

/**
 * Everyday words mapped onto how the catalog titles things ("website" never
 * appears in a title, "Web Development" does). Only the free fallback needs
 * this — Groq already knows "website" means web development.
 */
const TOPIC_SYNONYMS = {
    website: ['web'], websites: ['web'], webpage: ['web'], site: ['web'], frontend: ['web', 'react'],
    backend: ['node', 'api'], app: ['android', 'ios', 'flutter'], apps: ['android', 'ios', 'flutter'],
    mobile: ['android', 'ios', 'flutter'], ai: ['machine learning', 'ai'], ml: ['machine learning'],
    data: ['data science', 'data analysis'], game: ['unity', 'game'], games: ['unity', 'game'],
    investing: ['invest'], stocks: ['stock'], shares: ['stock'], spreadsheet: ['excel'], spreadsheets: ['excel'],
    photos: ['photography'], photo: ['photography'], videos: ['video'], logo: ['logo', 'branding'],
    singing: ['vocal', 'singing'], workout: ['fitness'], weight: ['fitness', 'nutrition']
};

/**
 * Everyday words that point at a catalog category, so the free fallback can
 * still tell "build a website" is a Development search.
 */
const CATEGORY_HINTS = {
    Development: ['code', 'coding', 'program', 'programming', 'developer', 'website', 'websites', 'web', 'app', 'apps', 'software', 'python', 'javascript', 'java', 'react', 'sql', 'html', 'css'],
    Finance: ['money', 'invest', 'investing', 'investment', 'stock', 'stocks', 'trading', 'crypto', 'accounting', 'budget', 'finance'],
    Health: ['fitness', 'yoga', 'diet', 'nutrition', 'workout', 'health', 'meditation', 'weight', 'sleep'],
    Music: ['guitar', 'piano', 'singing', 'sing', 'music', 'drums', 'song', 'songs', 'violin'],
    Business: ['business', 'marketing', 'startup', 'management', 'sales', 'leadership', 'entrepreneur'],
    Design: ['design', 'designer', 'photoshop', 'figma', 'logo', 'ui', 'ux', 'illustrator', 'graphic', 'graphics'],
    PhotoVideo: ['photo', 'photos', 'photography', 'camera', 'video', 'videos', 'editing', 'filmmaking', 'youtube'],
    'Real Estate': ['property', 'properties', 'house', 'realestate', 'rental', 'landlord', 'mortgage'],
    Office: ['excel', 'word', 'powerpoint', 'spreadsheet', 'spreadsheets', 'office', 'outlook', 'typing']
};
const CATALOG_CATEGORIES = Object.keys(CATEGORY_HINTS);

const interpretSearchRuleBased = (query) => {
    const tokens = tokenize(query);
    const topicWords = tokens.filter((t) => t.length > 1 && !SEARCH_FILLER.has(t));
    const keywords = [...new Set([
        ...topicWords,
        ...topicWords.flatMap((t) => TOPIC_SYNONYMS[t] || [])
    ])].slice(0, 6);

    const lowered = ` ${String(query).toLowerCase()} `;
    let category = CATALOG_CATEGORIES.find((c) => lowered.includes(` ${c.toLowerCase()} `)) || null;
    if (!category) {
        category = CATALOG_CATEGORIES.find((c) => CATEGORY_HINTS[c].some((hint) => tokens.includes(hint))) || null;
    }

    return { topic: topicWords.slice(0, 4).join(' '), keywords, category };
};

const interpretSearchWithGroq = async (query) => {
    const raw = await groq.chatComplete([
        {
            role: 'system',
            content: "You turn a learner's description of what they want to learn into search terms for an " +
                'online course catalog. Reply with ONLY a JSON object: {"topic": string (2-5 lowercase words naming ' +
                'what they want to learn), "keywords": string[] (2-6 single words or short phrases likely to appear ' +
                'in course titles, most specific first), "category": one of ' +
                `${JSON.stringify(CATALOG_CATEGORIES)} or null}.`
        },
        { role: 'user', content: query }
    ], { json: true, temperature: 0.2, maxTokens: 200 });

    const parsed = JSON.parse(raw);
    const keywords = (Array.isArray(parsed.keywords) ? parsed.keywords : [])
        .filter((k) => typeof k === 'string' && k.trim())
        .map((k) => k.trim().toLowerCase().slice(0, 40))
        .slice(0, 6);
    if (!keywords.length) throw new Error('Groq returned no keywords.');

    return {
        topic: typeof parsed.topic === 'string' && parsed.topic.trim() ? parsed.topic.trim().slice(0, 60) : keywords.join(' '),
        keywords,
        category: CATALOG_CATEGORIES.includes(parsed.category) ? parsed.category : null
    };
};

/**
 * Search for a learner who describes what they want ("I want to build my own
 * website") instead of typing a course title. Groq turns the sentence into
 * keywords and a category when configured; otherwise stopword stripping and
 * everyday category hints do the same job more roughly. Either way the
 * results are real catalog rows ranked by how well they match.
 *
 * @param {string} query
 * @returns {Promise<{courses: object[], interpretation: {topic: string, keywords: string[], category: string|null}, source: 'ai'|'basic'}>}
 */
export const smartSearch = async (query) => {
    let interpretation = null;
    let source = 'basic';

    if (groq.isConfigured()) {
        const cacheKey = `ai:smart-search:${tokenize(query).join(' ').slice(0, 200)}`;
        try {
            const cached = await cacheService.get(cacheKey);
            interpretation = cached ? JSON.parse(cached) : await interpretSearchWithGroq(query);
            if (!cached) await cacheService.set(cacheKey, interpretation, SMART_SEARCH_CACHE_SECONDS);
            source = 'ai';
        } catch (err) {
            console.warn('[aiSupport] Groq search interpretation failed, using rule-based:', err.message);
        }
    }
    if (!interpretation) interpretation = interpretSearchRuleBased(query);

    const courses = await aiSupportRepository.searchByKeywords(
        interpretation.keywords, interpretation.category, SMART_SEARCH_LIMIT
    );
    return { courses, interpretation, source };
};
