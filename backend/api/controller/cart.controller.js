import * as cartServices from '../services/cart.service.js';

export const addTocart = async (req, res) => {
    try {
        const data = {
            course_id: req.body.course_id,
            user_id: req.user.id
        };
        const result = await cartServices.addCartDetailsInDB(data);
        return res.status(200).json({
            courses: result,
            message: "Added to Cart"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error adding to cart." });
    }
};

export const coursesInUserCart = async (req, res) => {
    try {
        const result = await cartServices.userCartCourse(req.user.id);
        return res.status(200).json({
            courses: result,
            message: "Cart courses fetched."
        });
    } catch (error) {
        console.error(error);
        return res.status(404).json({ message: "Error fetching cart." });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const data = {
            user_id: req.user.id,
            course_id: req.body.course_id
        };
        const result = await cartServices.removeCartCourseById(data);
        return res.status(200).json({
            courses: result,
            message: "Removed from cart."
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error removing from cart." });
    }
};