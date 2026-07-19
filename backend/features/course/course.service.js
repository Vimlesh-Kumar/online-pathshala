import * as courseRepository from './course.repository.js';

/**
 * Insert a course and return the database write result.
 */
export const addCourseInDB = async (data) => courseRepository.addCourseInDB(data);

/**
 * Get all courses enrolled by a specific user.
 */
export const courseByUserId = async (id) => courseRepository.courseByUserId(id);

/**
 * List courses using Udemy-style filters, sorting and pagination.
 */
export const allCourses = async (filters = {}) => courseRepository.allCourses(filters);

/**
 * Get a single course by identifier.
 */
export const courseById = async (id) => courseRepository.courseById(id);

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
    const result = await courseRepository.tutorByCourseId(id);
    return result || null;
};

/**
 * Get top courses for the home page based on rating, enrollments and wishlist activity.
 */
export const getFeaturedCourses = async (limit = 6) => courseRepository.getFeaturedCourses(limit);

/**
 * Find related courses using category matching and excluding the current course.
 */
export const getRelatedCourses = async (courseId, limit = 4) => courseRepository.getRelatedCourses(courseId, limit);
