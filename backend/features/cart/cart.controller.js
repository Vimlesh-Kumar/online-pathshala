import * as cartServices from './cart.service.js';
import { sendError, sendSuccess } from '../../utils/apiResponse.js';
import { getCourseIdFromBody } from '../../utils/request.js';

/**
 * Add a course to the authenticated user's cart.
 */
export const addTocart = async (req, res) => {
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

        const existingItem = await cartServices.findCartItem(data);
        if (existingItem) {
            return sendError(res, {
                statusCode: 409,
                message: 'Course already exists in cart.'
            });
        }

        const result = await cartServices.addCartDetailsInDB(data);
        return sendSuccess(res, {
            statusCode: 201,
            message: 'Added to cart.',
            data: result
        });
    } catch (error) {
        console.error(error);
        return sendError(res, {
            statusCode: 500,
            message: 'Error adding to cart.'
        });
    }
};

/**
 * Fetch all cart courses and include summary totals for the frontend.
 */
export const coursesInUserCart = async (req, res) => {
    try {
        const [courses, summary] = await Promise.all([
            cartServices.userCartCourse(req.user.id),
            cartServices.getCartSummary(req.user.id)
        ]);

        return sendSuccess(res, {
            message: 'Cart courses fetched successfully.',
            data: {
                courses,
                summary
            }
        });
    } catch (error) {
        console.error(error);
        return sendError(res, {
            statusCode: 500,
            message: 'Error fetching cart.'
        });
    }
};

/**
 * Remove a course from the authenticated user's cart.
 */
export const removeFromCart = async (req, res) => {
    try {
        const courseId = getCourseIdFromBody(req.body);
        if (!courseId) {
            return sendError(res, {
                statusCode: 400,
                message: 'A valid course_id is required.'
            });
        }

        const result = await cartServices.removeCartCourseById({
            user_id: req.user.id,
            course_id: courseId
        });

        return sendSuccess(res, {
            message: 'Removed from cart.',
            data: result
        });
    } catch (error) {
        console.error(error);
        return sendError(res, {
            statusCode: 500,
            message: 'Error removing from cart.'
        });
    }
};
