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
        .select('lesson_name', 'section_name', 'duration')
        .where({ course_id: courseId });
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
