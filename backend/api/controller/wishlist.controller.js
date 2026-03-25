import * as wishlistServices from '../services/wishList.service.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';
import { getCourseIdFromBody } from '../utils/request.js';

/**
 * Add a course to the authenticated user's wishlist.
 */
export const addToWishlist = async (req, res) => {
    try {
        const courseId = getCourseIdFromBody(req.body);
        if (!courseId) {
            return sendError(res, {
                statusCode: 400,
                message: 'A valid course_id is required.'
            });
        }

        const data = {
            course_id: courseId,
            user_id: req.user.id
        };

        const existingItem = await wishlistServices.findWishlistItem(data);
        if (existingItem) {
            return sendError(res, {
                statusCode: 409,
                message: 'Course already exists in wishlist.'
            });
        }

        const result = await wishlistServices.addToWishList(data);
        return sendSuccess(res, {
            statusCode: 201,
            message: 'Added to wishlist.',
            data: result
        });
    } catch (error) {
        console.error(error);
        return sendError(res, {
            statusCode: 500,
            message: 'Error adding to wishlist.'
        });
    }
};

/**
 * Remove a course from the authenticated user's wishlist.
 */
export const removeFromWishlist = async (req, res) => {
    try {
        const courseId = getCourseIdFromBody(req.body);
        if (!courseId) {
            return sendError(res, {
                statusCode: 400,
                message: 'A valid course_id is required.'
            });
        }

        const result = await wishlistServices.removewishlistCourseFromDB({
            course_id: courseId,
            user_id: req.user.id
        });

        return sendSuccess(res, {
            message: 'Removed from wishlist.',
            data: result
        });
    } catch (error) {
        console.error(error);
        return sendError(res, {
            statusCode: 500,
            message: 'Error removing from wishlist.'
        });
    }
};

/**
 * Fetch all courses saved in the authenticated user's wishlist.
 */
export const coursesInWishlist = async (req, res) => {
    try {
        const result = await wishlistServices.allCoursesOfUserInWishlist(req.user.id);
        return sendSuccess(res, {
            message: "User's wishlist fetched successfully.",
            data: result
        });
    } catch (error) {
        console.error(error);
        return sendError(res, {
            statusCode: 500,
            message: 'Error fetching wishlist.'
        });
    }
};
