import pool from '../../database/database.js';

export const getCourseDetails = async (courseId) => {
    return pool('courses')
        .select('title', 'subtitle', 'category', 'author')
        .where({ id: courseId })
        .first();
};

export const getCourseObjectives = async (courseId) => {
    return pool('course_objectives')
        .select('objective')
        .where({ course_id: courseId });
};

export const getCourseLessons = async (courseId) => {
    return pool('lesson')
        .select('id', 'lesson_name', 'section_name', 'duration')
        .where({ course_id: courseId })
        .orderBy('id', 'asc');
};

export const getCategoryWeights = async (userId) => {
    return pool
        .select('category')
        .count('* as weight')
        .from(
            pool.raw(
                `(SELECT c.category FROM enrollment e INNER JOIN courses c ON c.id = e.course_id WHERE e.user_id = ?
                  UNION ALL
                  SELECT c.category FROM wishlist w INNER JOIN courses c ON c.id = w.course_id WHERE w.user_id = ?) t`,
                [userId, userId]
            )
        )
        .groupBy('category')
        .orderBy('weight', 'desc');
};

export const getPopularCourses = async (limit) => {
    return pool('courses as c')
        .select('c.*', pool.raw('COALESCE(AVG(r.rating), c.rating) AS avg_rating'))
        .leftJoin('reviews as r', 'r.course_id', 'c.id')
        .groupBy('c.id')
        .orderBy('avg_rating', 'desc')
        .orderBy('c.id', 'desc')
        .limit(limit);
};

export const getInterestCourses = async (categories, userId, limit) => {
    return pool('courses as c')
        .select(
            'c.*',
            pool.raw('(SELECT COUNT(*) FROM enrollment e2 WHERE e2.course_id = c.id) AS enrolled_students'),
            pool.raw('COALESCE((SELECT AVG(r.rating) FROM reviews r WHERE r.course_id = c.id), c.rating) AS avg_rating')
        )
        .whereIn('c.category', categories)
        .whereNotIn('c.id', function() {
            this.select('course_id').from('enrollment').where('user_id', userId);
        })
        .groupBy('c.id')
        .orderBy('avg_rating', 'desc')
        .orderBy('enrolled_students', 'desc')
        .orderBy('c.id', 'desc')
        .limit(limit);
};

/** Titles of the courses a user is enrolled in, newest enrollment first. */
export const getEnrolledCourseTitles = async (userId, limit = 10) => {
    return pool('enrollment as e')
        .join('courses as c', 'c.id', 'e.course_id')
        .where('e.user_id', userId)
        .orderBy('e.id', 'desc')
        .limit(limit)
        .pluck('c.title');
};

/** The listing fields needed to explain why each of these courses was recommended. */
export const getCoursesByIds = async (courseIds) => {
    return pool('courses as c')
        .select(
            'c.id',
            'c.title',
            'c.subtitle',
            'c.category',
            pool.raw('(SELECT COUNT(*) FROM enrollment e2 WHERE e2.course_id = c.id) AS enrolled_students'),
            pool.raw('COALESCE((SELECT AVG(r.rating) FROM reviews r WHERE r.course_id = c.id), c.rating) AS avg_rating')
        )
        .whereIn('c.id', courseIds);
};

/** Escape LIKE wildcards so a search term is matched literally. */
const likeEscape = (term) => term.replace(/[\\%_]/g, (ch) => `\\${ch}`);

/**
 * Courses matching any of the keywords, best match first: a keyword in the
 * title counts more than one in the subtitle, and the suggested category adds
 * a smaller boost (and lets category-only searches return something).
 */
export const searchByKeywords = async (keywords, category, limit) => {
    const patterns = keywords.map((k) => `%${likeEscape(k)}%`);
    if (!patterns.length && !category) return [];

    const scoreParts = [];
    const bindings = [];
    for (const pattern of patterns) {
        scoreParts.push('(CASE WHEN c.title LIKE ? THEN 3 ELSE 0 END) + (CASE WHEN c.subtitle LIKE ? THEN 1 ELSE 0 END)');
        bindings.push(pattern, pattern);
    }
    if (category) {
        scoreParts.push('(CASE WHEN c.category = ? THEN 2 ELSE 0 END)');
        bindings.push(category);
    }

    return pool('courses as c')
        .select(
            'c.*',
            pool.raw('(SELECT COUNT(*) FROM enrollment e WHERE e.course_id = c.id) AS enrolled_students'),
            pool.raw(`(${scoreParts.join(' + ')}) AS match_score`, bindings)
        )
        .where((builder) => {
            for (const pattern of patterns) {
                builder.orWhere('c.title', 'like', pattern).orWhere('c.subtitle', 'like', pattern);
            }
            if (category) builder.orWhere('c.category', category);
        })
        .orderBy('match_score', 'desc')
        .orderBy('c.rating', 'desc')
        .orderBy('c.id', 'desc')
        .limit(limit);
};
