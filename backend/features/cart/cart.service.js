import * as cartRepository from './cart.repository.js';

/**
 * Check whether a course already exists in the user's cart.
 */
export const findCartItem = async (data) => cartRepository.findCartItem(data);

/**
 * Insert a course into the user's cart.
 */
export const addCartDetailsInDB = async (data) => cartRepository.addCartDetailsInDB(data);

/**
 * Fetch all courses in the user's cart with a compact course payload.
 */
export const userCartCourse = async (user_id) => cartRepository.userCartCourse(user_id);

/**
 * Remove a course from the user's cart.
 */
export const removeCartCourseById = async (data) => cartRepository.removeCartCourseById(data);

/**
 * Calculate summary values that the frontend can show without extra work.
 */
export const getCartSummary = async (userId) => cartRepository.getCartSummary(userId);
