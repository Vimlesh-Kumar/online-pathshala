const cartServices = require('../services/cart.service')

module.exports = {
    addTocart: async (req, res) => {
        // console.log(req.user)
        const data = {
            course_id: req.body.course_id,
            user_id: req.user.id
        }
        // console.log(data)
        cartServices.addCartDetailsInDB(data, (error, result) => {
            if (error) {
                return res.status(404).json({
                    message: error
                })
            }
            return res.status(200).json({
                courses: result,
                message: "Added to Cart"
            })
        })
    },

    coursesInUserCart: async (req, res) => {
        // console.log(req.user)
        cartServices.userCartCourse(req.user.id, (error, result) => {
            if (error) {
                return res.status(404).json({
                    message: error
                })
            }
            return res.status(200).json({
                courses: result,
                message: "Cart Courses found by user's id."
            })
        })
    },

    removeFromCart: (req, res) => {
        const data = {
            user_id: req.user.id,
            course_id: req.body.course_id
        }
        cartServices.removeCartCourseById(data, (error, result) => {
            if (error) {
                return res.status(404).json({
                    message: error
                })
            }
            return res.status(200).json({
                courses: result,
                message: "Cart Courses removed by user's id and course_id"
            })
        })
    }
}