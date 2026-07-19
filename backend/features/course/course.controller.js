import * as courseServices from './course.service.js';
import * as enrollmentServices from '../enrollment/enrollment.services.js';
import * as sectionLecturesServices from '../sectionLectures/sectionLectures.services.js';
import { createPaginationMeta, sendError, sendSuccess } from '../../utils/apiResponse.js';
import { normalizeCourseSort, parsePositiveInt } from '../../utils/request.js';

/**
 * Parse course discovery filters from query parameters.
 */
const getCourseQueryOptions = (query = {}) => {
    const page = parsePositiveInt(query.page, 1);
    const limit = parsePositiveInt(query.limit, 20);
    const sortBy = normalizeCourseSort(query.sortBy);
    const minPrice = query.minPrice === undefined ? undefined : Number(query.minPrice);
    const maxPrice = query.maxPrice === undefined ? undefined : Number(query.maxPrice);
    const minRating = query.minRating === undefined ? undefined : Number(query.minRating);

    return {
        page,
        limit,
        offset: (page - 1) * limit,
        sortBy,
        minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
        maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
        minRating: Number.isFinite(minRating) ? minRating : undefined
    };
};

/**
 * Create a course and auto-enroll the tutor who created it.
 */
export const addCourse = async (req, res) => {
    try {
        const body = req.body;

        if (!body?.author || !body?.category || !body?.price || !body?.subtitle || !body?.thumb_url || !body?.title) {
            return sendError(res, {
                statusCode: 400,
                message: 'author, category, price, subtitle, thumb_url and title are required.'
            });
        }

        const result = await courseServices.addCourseInDB(body);
        await enrollmentServices.enrolling({
            course_id: result.insertId,
            user_id: req.user.id
        });

        return sendSuccess(res, {
            statusCode: 201,
            message: 'Course added successfully and tutor enrolled.',
            data: result
        });
    } catch (err) {
        console.error(err);
        return sendError(res, {
            statusCode: 500,
            message: 'Unable to insert course details.'
        });
    }
};

/**
 * Get all courses the authenticated user is enrolled in.
 */
export const allcourseByUserId = async (req, res) => {
    try {
        const courses = await courseServices.courseByUserId(req.user.id);
        return sendSuccess(res, {
            message: "User's courses fetched successfully.",
            data: courses
        });
    } catch (err) {
        console.error(err);
        return sendError(res, {
            statusCode: 500,
            message: 'Unable to fetch the user courses.'
        });
    }
};

/**
 * Get the main course catalog with filters, sorting and pagination.
 */
export const allCOURSES = async (req, res) => {
    try {
        const options = getCourseQueryOptions(req.query);
        const { courses, total } = await courseServices.allCourses(options);

        return sendSuccess(res, {
            message: 'All courses fetched successfully.',
            data: courses,
            meta: createPaginationMeta({
                page: options.page,
                limit: options.limit,
                total
            })
        });
    } catch (err) {
        console.error(err);
        return sendError(res, {
            statusCode: 500,
            message: 'Error fetching all courses.'
        });
    }
};

/**
 * Get a single course and the tutor information for the detail page.
 */
export const courseByCourseId = async (req, res) => {
    try {
        const id = Number.parseInt(req.params.id, 10);
        if (!Number.isInteger(id) || id <= 0) {
            return sendError(res, {
                statusCode: 400,
                message: 'A valid course id is required.'
            });
        }

        const course = await courseServices.courseById(id);
        if (!course) {
            return sendError(res, {
                statusCode: 404,
                message: 'Course not found.'
            });
        }

        const tutor = await courseServices.tutorByCourseId(id);
        return sendSuccess(res, {
            message: 'Course details fetched successfully.',
            data: {
                course,
                tutor
            }
        });
    } catch (err) {
        console.error(err);
        return sendError(res, {
            statusCode: 500,
            message: 'Error fetching course details.'
        });
    }
};

/**
 * Get courses for a single category using the same filters as the main catalog.
 */
export const categoryCourse = async (req, res) => {
    try {
        const options = getCourseQueryOptions(req.query);
        const { courses, total } = await courseServices.coursesByCategory(req.params.select, options);

        return sendSuccess(res, {
            message: 'Courses by category fetched successfully.',
            data: courses,
            meta: createPaginationMeta({
                page: options.page,
                limit: options.limit,
                total
            })
        });
    } catch (err) {
        console.error(err);
        return sendError(res, {
            statusCode: 500,
            message: 'Error fetching category courses.'
        });
    }
};

/**
 * Search courses by text query with sorting and pagination.
 */
export const searchAllCourses = async (req, res) => {
    try {
        const query = req.query.q?.trim();
        if (!query) {
            return sendError(res, {
                statusCode: 400,
                message: 'Search query is required.'
            });
        }

        const options = getCourseQueryOptions(req.query);
        const { courses, total } = await courseServices.searchCourses(query, options);

        return sendSuccess(res, {
            message: 'Search results fetched successfully.',
            data: courses,
            meta: createPaginationMeta({
                page: options.page,
                limit: options.limit,
                total
            })
        });
    } catch (err) {
        console.error(err);
        return sendError(res, {
            statusCode: 500,
            message: 'Error performing search.'
        });
    }
};

/**
 * Return the featured courses for a home or landing page carousel.
 */
export const featuredCourses = async (req, res) => {
    try {
        const limit = parsePositiveInt(req.query.limit, 6);
        const courses = await courseServices.getFeaturedCourses(limit);

        return sendSuccess(res, {
            message: 'Featured courses fetched successfully.',
            data: courses
        });
    } catch (err) {
        console.error(err);
        return sendError(res, {
            statusCode: 500,
            message: 'Error fetching featured courses.'
        });
    }
};

/**
 * Return related courses for a course detail page.
 */
export const relatedCourses = async (req, res) => {
    try {
        const courseId = Number.parseInt(req.params.id, 10);
        const limit = parsePositiveInt(req.query.limit, 4);

        if (!Number.isInteger(courseId) || courseId <= 0) {
            return sendError(res, {
                statusCode: 400,
                message: 'A valid course id is required.'
            });
        }

        const courses = await courseServices.getRelatedCourses(courseId, limit);
        return sendSuccess(res, {
            message: 'Related courses fetched successfully.',
            data: courses
        });
    } catch (err) {
        console.error(err);
        return sendError(res, {
            statusCode: 500,
            message: 'Error fetching related courses.'
        });
    }
};

/**
 * Get the full lesson list (curriculum) for a course, ordered for the player.
 */
export const courseLessons = async (req, res) => {
    try {
        const courseId = Number.parseInt(req.params.id, 10);
        if (!Number.isInteger(courseId) || courseId <= 0) {
            return sendError(res, {
                statusCode: 400,
                message: 'A valid course id is required.'
            });
        }

        const lessons = await sectionLecturesServices.allSectionsbycourseId(courseId);
        return sendSuccess(res, {
            message: 'Course lessons fetched successfully.',
            data: lessons
        });
    } catch (err) {
        console.error(err);
        return sendError(res, {
            statusCode: 500,
            message: 'Error fetching course lessons.'
        });
    }
};
