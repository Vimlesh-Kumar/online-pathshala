/**
 * generate-course-catalog.js
 *
 * Scales the course catalog up to ~10,000 listings across the existing 9
 * categories — entirely procedural (combinations of real-world topic names,
 * title templates, and level modifiers), so it's free: no paid dataset, no
 * scraping, no external API calls.
 *
 * Each generated course is fully functional, not just a metadata row: it
 * gets a real lesson set (reusing one already-working YouTube video per
 * category, pulled live from the courses that are already seeded) and a
 * set of learning objectives, so every course plays and tracks progress
 * exactly like a hand-authored one.
 *
 * Usage:  npm run catalog:generate   (from backend/)
 *
 * Idempotent — if the catalog already has TARGET_TOTAL or more courses,
 * the script exits immediately without inserting anything.
 */
import 'dotenv/config';
import pool from '../database/database.js';

const TARGET_TOTAL = 10000;
const INSERT_BATCH_SIZE = 500;

const CATEGORIES = [
    'Development', 'Finance', 'Health', 'Music', 'Business',
    'Design', 'PhotoVideo', 'Real Estate', 'Office'
];

// Concrete, realistic subjects per category — the combinatorial base that
// keeps generated titles reading like real course listings instead of
// obviously-templated filler.
const TOPICS_BY_CATEGORY = {
    Development: ['Python Programming', 'JavaScript', 'React.js', 'Node.js', 'Full-Stack Web Development', 'Data Structures & Algorithms', 'Java Programming', 'C++ Programming', 'Django', 'Flutter App Development', 'iOS Development with Swift', 'Android Development with Kotlin', 'Machine Learning with Python', 'DevOps & Docker', 'SQL for Developers', 'Go Programming', 'Vue.js', 'TypeScript', 'GraphQL APIs', 'Cybersecurity Fundamentals', 'Cloud Computing with AWS', 'Git & GitHub', 'Unity Game Development', 'Blockchain Development'],
    Finance: ['Personal Finance', 'Stock Market Investing', 'Financial Modeling', 'Accounting Fundamentals', 'Cryptocurrency Trading', 'Options Trading', 'Forex Trading', 'Corporate Finance', 'Financial Planning', 'Excel for Finance', 'Value Investing', 'Retirement Planning', 'Tax Preparation', 'Budgeting & Saving', 'Risk Management', 'Venture Capital', 'Financial Analysis', 'Wealth Management', 'Bookkeeping'],
    Health: ['Yoga for Beginners', 'Nutrition Fundamentals', 'Weight Loss', 'Strength Training', 'Meditation & Mindfulness', 'Mental Health Basics', 'Home Workout', 'Marathon Training', 'Pilates', 'Sleep Science', 'Stress Management', 'Healthy Cooking', 'Intermittent Fasting', 'First Aid & CPR', 'Sports Nutrition', 'Anatomy & Physiology', 'Public Health Basics', 'Holistic Wellness'],
    Music: ['Guitar for Beginners', 'Piano Lessons', 'Music Theory', 'Singing & Vocal Training', 'Music Production', 'DJing', 'Drum Lessons', 'Violin Lessons', 'Songwriting', 'Ukulele', 'Ableton Live', 'Music Business', 'Beat Making', 'Bass Guitar', 'Sound Engineering', 'Jazz Improvisation', 'Hip Hop Production', 'Electronic Music Production'],
    Business: ['Entrepreneurship', 'Digital Marketing', 'Project Management', 'Leadership Skills', 'Sales Techniques', 'Business Strategy', 'Startup Fundamentals', 'Negotiation Skills', 'Public Speaking', 'Operations Management', 'Supply Chain Management', 'Human Resources', 'E-commerce Business', 'Business Analytics', 'Product Management', 'Agile & Scrum', 'Customer Service Excellence', 'Business Communication', 'Small Business Management'],
    Design: ['Graphic Design', 'UI/UX Design', 'Adobe Photoshop', 'Adobe Illustrator', 'Figma for UI Design', 'Logo Design', 'Typography', 'Web Design', 'Brand Identity Design', '3D Modeling with Blender', 'Interior Design Basics', 'Fashion Design', 'Motion Graphics Design', 'Product Design', 'Color Theory', 'Design Thinking', 'Packaging Design', 'Icon Design'],
    PhotoVideo: ['Photography Basics', 'Adobe Premiere Pro', 'Video Editing', 'Adobe After Effects', 'DSLR Photography', 'Portrait Photography', 'Cinematography', 'YouTube Video Creation', 'Drone Photography', 'Color Grading', 'Wedding Photography', 'Photo Editing with Lightroom', 'Mobile Videography', 'Documentary Filmmaking', 'Studio Lighting', 'Vlogging', 'Product Photography', 'Animation Basics'],
    'Real Estate': ['Real Estate Investing', 'Property Management', 'Real Estate Agent Licensing Prep', 'House Flipping', 'Commercial Real Estate', 'Rental Property Management', 'Real Estate Wholesaling', 'Real Estate Market Analysis', 'Airbnb Hosting', 'Mortgage & Financing Basics', 'Real Estate Negotiation', 'Land Investing', 'REITs Investing', 'Home Staging', 'Property Development', 'Real Estate Marketing', 'Short-Term Rental Business'],
    Office: ['Microsoft Excel', 'Microsoft Word', 'Microsoft PowerPoint', 'Google Sheets', 'Microsoft Access', 'Touch Typing', 'Business Writing', 'Email Etiquette', 'Time Management', 'Data Entry Skills', 'Microsoft Outlook', 'Office Administration', 'Virtual Assistant Training', 'Notion Productivity', 'Meeting Management', 'Excel VBA Macros', 'Google Workspace', 'Remote Work Productivity']
};

// Short, reusable objective phrases per category (kept generic on purpose —
// they describe outcomes true of *any* course on that topic).
const OBJECTIVES_BY_CATEGORY = {
    Development: ['Write clean, working code from scratch', 'Debug real programs confidently', 'Build a complete project end-to-end'],
    Finance: ['Read and interpret financial data', 'Make more informed money decisions', 'Apply core financial planning concepts'],
    Health: ['Build a sustainable, healthy routine', 'Understand the fundamentals covered', 'Apply what you learn safely in daily life'],
    Music: ['Play or produce with more confidence', 'Understand the core technique covered', 'Practice with a clear, structured method'],
    Business: ['Apply the strategy frameworks covered', 'Make better, data-informed decisions', 'Communicate ideas more persuasively'],
    Design: ['Create professional-quality work', 'Apply core design principles', 'Build pieces for a real portfolio'],
    PhotoVideo: ['Produce polished, professional results', 'Understand composition and lighting', 'Edit confidently in the right tools'],
    'Real Estate': ['Evaluate opportunities more confidently', 'Understand the market fundamentals', 'Apply practical negotiation tactics'],
    Office: ['Work noticeably faster day-to-day', 'Apply professional formatting standards', 'Automate repetitive parts of the job']
};

const LEVELS = ['', 'Beginner', 'Intermediate', 'Advanced', 'Complete'];

const TITLE_TEMPLATES = [
    (topic) => `${topic} Bootcamp`,
    (topic) => `Master ${topic}: A Practical Guide`,
    (topic) => `${topic} Essentials`,
    (topic) => `Learn ${topic} the Right Way`,
    (topic) => `${topic} Crash Course`,
    (topic) => `${topic} From Scratch`,
    (topic) => `The Complete ${topic} Course`
];

const SUBTITLE_TEMPLATES = [
    (topic, category) => `A practical, hands-on introduction to ${topic} for anyone starting out in ${category}.`,
    (topic) => `Go from zero to confident with ${topic} through real, practical examples.`,
    (topic) => `Everything you need to get started with ${topic} — no prior experience required.`,
    (topic) => `Build real, practical skills in ${topic} at your own pace.`
];

const INSTRUCTOR_NAMES = [
    'Aarav Sharma', 'Priya Nair', 'James Whitfield', 'Sofia Martinez', 'Daniel Kim',
    'Emily Chen', 'Marcus Johnson', 'Ananya Iyer', 'Lucas Silva', 'Grace Thompson',
    'Rohan Verma', 'Isabella Rossi', 'Noah Williams', 'Fatima Al-Sayed', 'Ethan Brooks',
    'Meera Krishnan', 'Oliver Bennett', 'Chloe Dubois', 'Arjun Mehta', 'Hannah Schmidt'
];

/** Deterministic pseudo-price/rating so re-running the same index yields the same row. */
const priceForIndex = (index) => (299 + ((index * 137) % 46) * 100).toFixed(2);
const ratingForIndex = (index) => (3.5 + ((index * 7) % 15) / 10).toFixed(2);

/**
 * Build one procedurally-generated course row for a category at a given
 * sequence index. Combining topic × template × level × instructor keeps the
 * output varied without needing a real dataset or an LLM call per row.
 */
const buildCourseRow = (category, index, thumbUrl) => {
    const topics = TOPICS_BY_CATEGORY[category];
    const topic = topics[index % topics.length];
    const template = TITLE_TEMPLATES[index % TITLE_TEMPLATES.length];
    const level = LEVELS[Math.floor(index / topics.length) % LEVELS.length];
    const subtitleFn = SUBTITLE_TEMPLATES[index % SUBTITLE_TEMPLATES.length];
    const instructor = INSTRUCTOR_NAMES[index % INSTRUCTOR_NAMES.length];

    const rendered = template(topic);
    // Avoid awkward doubling like "Advanced Master X" — only prefix a level
    // when the template itself doesn't already imply one.
    const alreadyImpliesLevel = /^(Master|The Complete)/.test(rendered);
    const title = level && !alreadyImpliesLevel ? `${level} ${rendered}` : rendered;

    return [
        instructor,                              // author
        category,                                // category
        priceForIndex(index),                    // price
        subtitleFn(topic, category),              // subtitle
        thumbUrl,                                 // thumb_url
        title,                                    // title
        ratingForIndex(index)                     // rating
    ];
};

/**
 * Look up one already-working thumbnail + YouTube video id per category by
 * reading the courses/lessons that are already seeded — this guarantees
 * every generated course reuses media that's already proven to load in
 * this app, instead of guessing at new URLs/video ids.
 */
const getCategoryMedia = async () => {
    const [rows] = await pool.query(
        `SELECT c.category, MIN(c.thumb_url) AS thumb_url, MIN(l.video_key) AS video_key
         FROM courses c
         JOIN lesson l ON l.course_id = c.id
         GROUP BY c.category`
    );
    const media = {};
    for (const row of rows) {
        media[row.category] = { thumbUrl: row.thumb_url, videoKey: row.video_key };
    }
    return media;
};

// Used only for categories with no seeded course/lesson to borrow media
// from (e.g. Business, Design) — a real, freely-embeddable public YouTube
// tutorial and a generic course-card thumbnail, so those categories still
// get fully playable generated courses instead of being skipped.
const FALLBACK_MEDIA = {
    thumbUrl: 'https://i3.ytimg.com/vi/XKHEtdqhLK8/maxresdefault.jpg',
    videoKey: 'XKHEtdqhLK8'
};

const LESSON_TEMPLATE = [
    { section: 'Getting Started', name: 'Introduction & Overview', duration: '08:24' },
    { section: 'Core Content', name: 'Core Concepts', duration: '15:10' },
    { section: 'Core Content', name: 'Project & Next Steps', duration: '12:47' }
];

/** Bulk-insert lessons + objectives for a contiguous range of newly-inserted course ids. */
const insertLessonsAndObjectives = async (category, firstCourseId, count, videoKey) => {
    const lessonRows = [];
    const objectiveRows = [];
    const objectives = OBJECTIVES_BY_CATEGORY[category];

    for (let i = 0; i < count; i++) {
        const courseId = firstCourseId + i;
        for (const lesson of LESSON_TEMPLATE) {
            lessonRows.push([lesson.duration, courseId, lesson.name, videoKey, lesson.section]);
        }
        for (const objective of objectives) {
            objectiveRows.push([objective, courseId]);
        }
    }

    await pool.query(
        'INSERT INTO lesson (duration, course_id, lesson_name, video_key, section_name) VALUES ?',
        [lessonRows]
    );
    await pool.query(
        'INSERT INTO course_objectives (objective, course_id) VALUES ?',
        [objectiveRows]
    );
};

async function run() {
    const [[{ count }]] = await pool.query('SELECT COUNT(*) AS count FROM courses');
    if (count >= TARGET_TOTAL) {
        console.log(`Catalog already has ${count} courses (>= ${TARGET_TOTAL}) — skipping generation.`);
        await pool.end();
        return;
    }

    const toGenerate = TARGET_TOTAL - count;
    const perCategory = Math.ceil(toGenerate / CATEGORIES.length);
    console.log(`Generating ~${toGenerate} courses (${perCategory} per category) to reach ${TARGET_TOTAL}...`);

    const media = await getCategoryMedia();
    let totalInserted = 0;

    for (const category of CATEGORIES) {
        const categoryMedia = media[category] || FALLBACK_MEDIA;
        if (!media[category]) {
            console.warn(`  "${category}" has no seeded course/lesson — using fallback media instead.`);
        }

        for (let start = 0; start < perCategory; start += INSERT_BATCH_SIZE) {
            const batchCount = Math.min(INSERT_BATCH_SIZE, perCategory - start);
            const rows = Array.from(
                { length: batchCount },
                (_, i) => buildCourseRow(category, start + i, categoryMedia.thumbUrl)
            );

            const [result] = await pool.query(
                'INSERT INTO courses (author, category, price, subtitle, thumb_url, title, rating) VALUES ?',
                [rows]
            );

            await insertLessonsAndObjectives(category, result.insertId, batchCount, categoryMedia.videoKey);

            totalInserted += batchCount;
            console.log(`  ${category}: ${start + batchCount}/${perCategory} generated (${totalInserted} total so far)`);
        }
    }

    const [[{ finalCount }]] = await pool.query('SELECT COUNT(*) AS finalCount FROM courses');
    console.log(`✅ Done. Catalog now has ${finalCount} courses.`);
    await pool.end();
}

run().catch(async (err) => {
    console.error('❌ Catalog generation failed:', err.message);
    await pool.end();
    process.exit(1);
});
