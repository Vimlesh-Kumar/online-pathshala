import * as wishListRepository from './wishList.repository.js';

/**
 * Check whether a course is already in the user's wishlist.
 */
export const findWishlistItem = async (data) => wishListRepository.findWishlistItem(data);

/**
 * Insert a course into the wishlist table.
 */
export const addToWishList = async (data) => wishListRepository.addToWishList(data);

/**
 * Remove a course from the user's wishlist.
 */
export const removewishlistCourseFromDB = async (data) => wishListRepository.removewishlistCourseFromDB(data);

/**
 * Get all courses saved in the user's wishlist.
 */
export const allCoursesOfUserInWishlist = async (id) => wishListRepository.allCoursesOfUserInWishlist(id);
