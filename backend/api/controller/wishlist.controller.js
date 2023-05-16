const wishlistServices = require('../services/wishList.service');

module.exports = {

    /**
 * Handle API request taht comes from frontend for add to wishlist course
 * @param {*contain request body and user from frontend} req 
 * @param {*Response after adding course in cart} res 
 */
    addToWishlist: (req, res) => {
        const data = {
            course_id: req.body.course_id,
            user_id: req.user.id
        }
        console.log(data)
        wishlistServices.addToWishList(data, (error, result) => {
            if (error) {
                return res.status(404).json({
                    message: error
                })
            }
            return res.status(200).json({
                courses: result,
                message: "Added to Wishlist"
            })
        })
    },

    removeFromWishlist: (req, res) => {
        const data = {
            course_id: req.body.course_id,
            user_id: req.user.id
        }
        // console.log(data)
        wishlistServices.removewishlistCourseFromDB(data, (error, result) => {
            if (error) {
                return res.status(404).json({
                    message: error
                })
            }
            return res.status(200).json({
                courses: result,
                message: "Removed from Wishlist"
            })
        })
    },

    coursesInWishlist:(req,res)=>{
        wishlistServices.allCoursesOfUserInWishlist(req.user.id, (error, result) => {
            if (error) {
                return res.status(404).json({
                    message: error
                })
            }
            return res.status(200).json({
                courses: result,
                message: "User's all Wishlist courses!"
            })
        })
    }
}