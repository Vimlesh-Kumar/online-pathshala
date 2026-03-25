import pool from '../../database/database.js';

const COURSE_BASE_SELECT = `
    SELECT
        c.*,
        COUNT(DISTINCT e.id) AS enrolled_students,
        COUNT(DISTINCT w.id) AS wishlist_count
    FROM courses c
    LEFT JOIN enrollment e ON e.course_id = c.id
    LEFT JOIN wishlist w ON w.course_id = c.id
`;

const SORT_BY_MAP = {
    newest: 'c.id DESC',
    price_asc: 'c.price ASC, c.id DESC',
    price_desc: 'c.price DESC, c.id DESC',
    rating_desc: 'c.rating DESC, c.id DESC'
};

/**
 * Build a safe ORDER BY clause from normalized sort keys.
 */
const getOrderByClause = (sortBy = 'newest') => SORT_BY_MAP[sortBy] || SORT_BY_MAP.newest;

/**
 * Build WHERE clause parts for the course listing filters.
 */
const buildCourseFilters = ({ category, minPrice, maxPrice, minRating, search }) => {
    const conditions = [];
    const values = [];

    if (category) {
        conditions.push('c.category = ?');
        values.push(category);
    }

    if (Number.isFinite(minPrice)) {
        conditions.push('c.price >= ?');
        values.push(minPrice);
    }

    if (Number.isFinite(maxPrice)) {
        conditions.push('c.price <= ?');
        values.push(maxPrice);
    }

    if (Number.isFinite(minRating)) {
        conditions.push('c.rating >= ?');
        values.push(minRating);
    }

    if (search) {
        conditions.push('(c.title LIKE ? OR c.author LIKE ? OR c.category LIKE ? OR c.subtitle LIKE ?)');
        const searchValue = `%${search}%`;
        values.push(searchValue, searchValue, searchValue, searchValue);
    }

    return {
        whereClause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
        values
    };
};

/**
 * Insert a course and return the database write result.
 */
export const addCourseInDB = async (data) => {
    const [result] = await pool.query(
        `INSERT INTO courses(author, category, price, subtitle, thumb_url, title, rating) VALUES(?,?,?,?,?,?,?)`,
        [data.author, data.category, data.price, data.subtitle, data.thumb_url, data.title, data.rating ?? 0]
    );
    return result;
};

/**
 * Get all courses enrolled by a specific user.
 */
export const courseByUserId = async (id) => {
    const [results] = await pool.query(
        `SELECT c.*
         FROM courses c
         INNER JOIN enrollment e ON c.id = e.course_id
         WHERE e.user_id = ?
         ORDER BY e.created_at DESC`,
        [id]
    );
    return results;
};

/**
 * List courses using Udemy-style filters, sorting and pagination.
 */
export const allCourses = async (filters = {}) => {
    const {
        limit = 20,
        offset = 0,
        sortBy = 'newest'
    } = filters;

    const { whereClause, values } = buildCourseFilters(filters);
    const orderBy = getOrderByClause(sortBy);

    const [courses] = await pool.query(
        `${COURSE_BASE_SELECT}
         ${whereClause}
         GROUP BY c.id
         ORDER BY ${orderBy}
         LIMIT ? OFFSET ?`,
        [...values, limit, offset]
    );

    const [total] = await pool.query(
        `SELECT COUNT(*) AS count
         FROM courses c
         ${whereClause}`,
        values
    );

    return { courses, total: total[0].count };
};

/**
 * Get a single course by identifier.
 */
export const courseById = async (id) => {
    const [results] = await pool.query(
        `${COURSE_BASE_SELECT}
         WHERE c.id = ?
         GROUP BY c.id`,
        [id]
    );
    return results[0];
};

/**
 * List courses by category using the shared discovery filters.
 */
export const coursesByCategory = async (category, filters = {}) => (
    allCourses({ ...filters, category })
);

/**
 * Search courses by keyword using the shared discovery filters.
 */
export const searchCourses = async (query, filters = {}) => (
    allCourses({ ...filters, search: query })
);

/**
 * Find the tutor attached to a course.
 */
export const tutorByCourseId = async (id) => {
    const [results] = await pool.query(
        `SELECT u.id, u.full_name, u.email
         FROM users u
         INNER JOIN enrollment e ON u.id = e.user_id
         WHERE e.course_id = ? AND u.user_role = 'Tutor'
         LIMIT 1`,
        [id]
    );
    return results[0] || null;
};

/**
 * Get top courses for the home page based on rating, enrollments and wishlist activity.
 */
export const getFeaturedCourses = async (limit = 6) => {
    const [results] = await pool.query(
        `${COURSE_BASE_SELECT}
         GROUP BY c.id
         ORDER BY c.rating DESC, enrolled_students DESC, wishlist_count DESC, c.id DESC
         LIMIT ?`,
        [limit]
    );
    return results;
};

/**
 * Find related courses using category matching and excluding the current course.
 */
export const getRelatedCourses = async (courseId, limit = 4) => {
    const [results] = await pool.query(
        `${COURSE_BASE_SELECT}
         WHERE c.category = (SELECT category FROM courses WHERE id = ?)
           AND c.id <> ?
         GROUP BY c.id
         ORDER BY c.rating DESC, enrolled_students DESC, c.id DESC
         LIMIT ?`,
        [courseId, courseId, limit]
    );
    return results;
};
