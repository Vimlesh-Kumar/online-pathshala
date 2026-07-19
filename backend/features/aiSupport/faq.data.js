/**
 * Static FAQ knowledge base for the free, rule-based support chatbot.
 * Each entry's `keywords` drives matching — keep them lowercase, single words
 * or short phrases a learner would actually type.
 */
export const FAQ_ENTRIES = [
    {
        id: 'enroll-free',
        question: 'How do I enroll in a course?',
        answer: 'Open any course page and click "Enroll for free" — you\'ll be enrolled instantly and taken to the course player. No payment needed.',
        keywords: ['enroll', 'enrolling', 'join course', 'start course', 'sign up course', 'take course']
    },
    {
        id: 'progress',
        question: 'How does progress tracking work?',
        answer: 'Every lesson you complete in the course player counts toward your progress bar. Once all lessons are done, a final quiz unlocks — pass it to earn your certificate.',
        keywords: ['progress', 'track', 'percentage', 'how much left', 'complete lesson', 'mark complete']
    },
    {
        id: 'certificate',
        question: 'How do I get a certificate?',
        answer: 'Finish every lesson in a course, then pass the final quiz with a score of 70% or higher. Your certificate appears immediately and can be downloaded as an image.',
        keywords: ['certificate', 'certification', 'diploma', 'proof', 'quiz pass', 'download certificate']
    },
    {
        id: 'quiz',
        question: 'What happens if I fail the quiz?',
        answer: 'No problem — you can retake the final quiz as many times as you need. There\'s no limit or penalty for retrying.',
        keywords: ['quiz', 'fail', 'retake', 'retry quiz', 'test', 'exam']
    },
    {
        id: 'cart-checkout',
        question: 'How does checkout work?',
        answer: 'Add courses to your cart, optionally apply a coupon code (try LEARN50 or WELCOME10), then click "Complete checkout". It\'s free — you\'ll be enrolled in every course in your cart instantly.',
        keywords: ['checkout', 'cart', 'buy', 'purchase', 'pay', 'payment', 'price', 'coupon', 'discount', 'code']
    },
    {
        id: 'coupon',
        question: 'What coupon codes are available?',
        answer: 'Try WELCOME10 (10% off), LEARN50 (50% off), or FREE100 (100% off) at checkout.',
        keywords: ['coupon', 'promo', 'discount code', 'offer', 'voucher']
    },
    {
        id: 'wishlist',
        question: 'How do I save a course for later?',
        answer: 'Click the heart icon on any course card or course page to add it to your wishlist. View saved courses from the heart icon in the header.',
        keywords: ['wishlist', 'save', 'favorite', 'heart', 'bookmark']
    },
    {
        id: 'become-instructor',
        question: 'How do I become an instructor?',
        answer: 'Sign up with the "Tutor" role (or ask an admin to change your role), then use "Add new course" from your dashboard to publish your first course.',
        keywords: ['instructor', 'tutor', 'teach', 'become teacher', 'publish course', 'create course']
    },
    {
        id: 'instructor-dashboard',
        question: 'Where do I see my course stats as an instructor?',
        answer: 'Open the profile menu and choose "Instructor dashboard" to see enrollments, ratings, and revenue for each of your courses.',
        keywords: ['dashboard', 'stats', 'revenue', 'earnings', 'analytics', 'enrollments count']
    },
    {
        id: 'reviews',
        question: 'How do I leave a review?',
        answer: 'On any course page, scroll to "Student reviews", pick a star rating, optionally write a comment, and click "Post review".',
        keywords: ['review', 'rating', 'rate course', 'feedback', 'stars']
    },
    {
        id: 'qna',
        question: 'How do I ask a question about a course?',
        answer: 'Scroll to the "Questions & Answers" section on the course page and type your question — the instructor or other students can reply.',
        keywords: ['question', 'ask', 'qna', 'q&a', 'doubt', 'query']
    },
    {
        id: 'dark-mode',
        question: 'How do I switch to dark mode?',
        answer: 'Click the moon/sun icon in the top navigation bar to toggle between light and dark themes. Your choice is remembered.',
        keywords: ['dark mode', 'theme', 'light mode', 'night mode', 'appearance']
    },
    {
        id: 'password-login',
        question: 'I can\'t log in — what should I check?',
        answer: 'Double-check your email and password are correct. If you don\'t have an account yet, use "Sign up free" from the login page.',
        keywords: ['login', 'log in', 'password', 'cant sign in', "can't login", 'forgot password', 'account']
    },
    {
        id: 'search-filter',
        question: 'How do I filter courses by price or rating?',
        answer: 'On the "Browse all courses" page, click the "Filters" button to reveal a price-range slider and a minimum-rating picker.',
        keywords: ['filter', 'price range', 'rating filter', 'search', 'sort', 'category']
    },
    {
        id: 'refund',
        question: 'Can I get a refund?',
        answer: 'All courses on Online Pathshala are free to enroll in (with or without a coupon), so there\'s no payment to refund.',
        keywords: ['refund', 'money back', 'cancel', 'return']
    }
];

const FALLBACK_ANSWER = "I don't have an answer for that yet. Try rephrasing, or browse the topics below.";

const STOPWORDS = new Set(['a', 'an', 'the', 'is', 'are', 'do', 'does', 'how', 'what', 'i', 'to', 'for', 'of', 'in', 'on', 'my', 'can', 'get']);

const tokenize = (text) => String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w));

/**
 * Score a query against an FAQ entry: +2 per matched keyword phrase found
 * verbatim in the query, +1 per shared significant word.
 */
const scoreEntry = (queryTokens, queryLower, entry) => {
    let score = 0;
    for (const kw of entry.keywords) {
        if (queryLower.includes(kw)) score += 2;
    }
    const entryTokens = new Set(tokenize(entry.question + ' ' + entry.keywords.join(' ')));
    for (const t of queryTokens) {
        if (entryTokens.has(t)) score += 1;
    }
    return score;
};

/**
 * Find the best-matching FAQ answer for a free-text question.
 * Returns { answer, matched, suggestions } — `matched` is null on a full miss.
 */
export const findAnswer = (message) => {
    const queryLower = String(message || '').toLowerCase();
    const queryTokens = tokenize(message);

    const scored = FAQ_ENTRIES
        .map((entry) => ({ entry, score: scoreEntry(queryTokens, queryLower, entry) }))
        .sort((a, b) => b.score - a.score);

    const top = scored[0];
    const suggestions = FAQ_ENTRIES.slice(0, 5).map((e) => ({ id: e.id, question: e.question }));

    if (!top || top.score < 2) {
        return { answer: FALLBACK_ANSWER, matched: null, suggestions };
    }

    return {
        answer: top.entry.answer,
        matched: { id: top.entry.id, question: top.entry.question },
        suggestions
    };
};

export const getAllFaqs = () => FAQ_ENTRIES.map((e) => ({ id: e.id, question: e.question, answer: e.answer }));
