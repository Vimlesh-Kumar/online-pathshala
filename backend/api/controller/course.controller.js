const courseServices = require('../services/course.service')

module.exports = {

    addCourse: async (req, res) => {
        const body = req.body;
        // console.log(body)
        courseServices.addCourseInDB(body, (err, result) => {
            if (err) {
                console.log(err)
                return res.status(500).json({
                    message: "Unable to insert course details..."
                })
            }
            return res.status(200).json({
                data: result,
                message: "Course Added!"

            })
        })
    },
    allcourseByUserId: async (req, res) => {
        const id = req.params.id
        // console.log(id)
        courseServices.courseByUserId(id, (err, courses) => {
            if (err) {
                return res.status(404).json({
                    message: "No any course found by user id."
                })
            }
            return res.status(200).json({
                courses: courses,
                message: "All Courses.."
            })
        })
    },
    allCOURSES: async (req, res) => {
        courseServices.allCourses((err, courses) => {
            if (err) {
                return res.status(500).json({
                    message: "Error in finding all courses."
                })
            }
            return res.status(200).json({
                courses: courses,
                message: "All courses from database."
            })
        })
    }
}