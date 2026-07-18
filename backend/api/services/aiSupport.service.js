import pool from '../../database/database.js';

const STOPWORDS = new Set(['a', 'an', 'the', 'is', 'are', 'do', 'does', 'how', 'what', 'i', 'to', 'for', 'of', 'in', 'on', 'my', 'can', 'get', 'this', 'course', 'about']);

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
 * Answer a question about one specific course by searching its own content
 * (subtitle, learning objectives, lesson names/sections) for the best match.
 * Free, keyword-based — no external model call.
 */
export const answerCourseQuestion = async (courseId, question) => {
    const [[course]] = await pool.query(
        'SELECT title, subtitle, category, author FROM courses WHERE id = ?',
        [courseId]
    );
    if (!course) return { answer: 'Course not found.', source: null };

    const [objectives] = await pool.query(
        'SELECT objective FROM course_objectives WHERE course_id = ?',
        [courseId]
    );
    const [lessons] = await pool.query(
        'SELECT lesson_name, section_name, duration FROM lesson WHERE course_id = ?',
        [courseId]
    );

    const queryTokens = tokenize(question);
    if (!queryTokens.length) {
        return { answer: `${course.title} is taught by ${course.author}. Ask me something specific about what it covers!`, source: null };
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
        return {
            answer: `I couldn't find that in ${course.title}'s content. Try the Q&A section below to ask the instructor directly.`,
            source: null
        };
    }

    const prefix = top.source === 'lesson'
        ? 'This is covered in the lesson '
        : top.source === 'objective'
            ? 'Yes — this course teaches you to: '
            : 'From the course description: ';

    return { answer: `${prefix}${top.label}`, source: top.source };
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

export const suggestCourseCopy = (title, category) => {
    const topic = (title || 'this topic').trim();
    const skills = CATEGORY_SKILLS[category] || CATEGORY_SKILLS.Development;

    const titles = TITLE_TEMPLATES.map((fn) => fn(topic));
    const subtitles = SUBTITLE_TEMPLATES.map((fn) => fn(topic, category || 'this field'));
    const objectives = skills.map((skill) => `Be able to apply ${skill}`);

    return { titles, subtitles, objectives };
};

/**
 * Content-based course recommendations: courses sharing a category with the
 * user's enrolled/wishlisted courses, ranked by rating + enrollment count,
 * excluding courses the user is already enrolled in.
 */
export const getRecommendationsForUser = async (userId, limit = 8) => {
    const [interestRows] = await pool.query(
        `SELECT category, COUNT(*) AS weight FROM (
            SELECT c.category FROM enrollment e INNER JOIN courses c ON c.id = e.course_id WHERE e.user_id = ?
            UNION ALL
            SELECT c.category FROM wishlist w INNER JOIN courses c ON c.id = w.course_id WHERE w.user_id = ?
         ) t
         GROUP BY category
         ORDER BY weight DESC`,
        [userId, userId]
    );

    if (!interestRows.length) {
        // Cold start: no signal yet — fall back to top-rated courses overall.
        const [results] = await pool.query(
            `SELECT c.*, COALESCE(AVG(r.rating), c.rating) AS avg_rating
             FROM courses c LEFT JOIN reviews r ON r.course_id = c.id
             GROUP BY c.id
             ORDER BY avg_rating DESC, c.id DESC
             LIMIT ?`,
            [limit]
        );
        return { courses: results, reason: 'popular' };
    }

    const categories = interestRows.map((r) => r.category);
    const [results] = await pool.query(
        `SELECT c.*,
                (SELECT COUNT(*) FROM enrollment e2 WHERE e2.course_id = c.id) AS enrolled_students,
                COALESCE((SELECT AVG(r.rating) FROM reviews r WHERE r.course_id = c.id), c.rating) AS avg_rating
         FROM courses c
         WHERE c.category IN (?)
           AND c.id NOT IN (SELECT course_id FROM enrollment WHERE user_id = ?)
         GROUP BY c.id
         ORDER BY avg_rating DESC, enrolled_students DESC, c.id DESC
         LIMIT ?`,
        [categories, userId, limit]
    );

    return { courses: results, reason: 'interests', basedOn: categories.slice(0, 3) };
};
