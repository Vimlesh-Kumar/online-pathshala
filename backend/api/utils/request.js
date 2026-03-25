/**
 * Parse a positive integer query parameter with a fallback value.
 */
export const parsePositiveInt = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

/**
 * Normalize supported sort labels into an internal sort mode.
 */
export const normalizeCourseSort = (sortBy = 'Newest') => {
    const sortMap = {
        newest: 'newest',
        'price: low to high': 'price_asc',
        'price: high to low': 'price_desc',
        'best rating': 'rating_desc'
    };

    return sortMap[String(sortBy).trim().toLowerCase()] || 'newest';
};

/**
 * Validate the required course identifier in request bodies.
 */
export const getCourseIdFromBody = (body = {}) => {
    const courseId = Number.parseInt(body.course_id, 10);
    return Number.isInteger(courseId) && courseId > 0 ? courseId : null;
};
