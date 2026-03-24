import * as wishlistServices from '../services/wishList.service.js';

export const addToWishlist = async (req, res) => {
    try {
        const data = {
            course_id: req.body.course_id,
            user_id: req.user.id
        };
        const result = await wishlistServices.addToWishList(data);
        return res.status(200).json({
            courses: result,
            message: "Added to Wishlist"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error adding to wishlist." });
    }
};

export const removeFromWishlist = async (req, res) => {
    try {
        const data = {
            course_id: req.body.course_id,
            user_id: req.user.id
        };
        const result = await wishlistServices.removewishlistCourseFromDB(data);
        return res.status(200).json({
            courses: result,
            message: "Removed from Wishlist"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error removing from wishlist." });
    }
};

export const coursesInWishlist = async (req, res) => {
    try {
        const result = await wishlistServices.allCoursesOfUserInWishlist(req.user.id);
        return res.status(200).json({
            courses: result,
            message: "User's all Wishlist courses fetched."
        });
    } catch (error) {
        console.error(error);
        return res.status(404).json({ message: "Error fetching wishlist." });
    }
};